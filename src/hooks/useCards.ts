import { useQuery } from "@tanstack/react-query";
import { fetchAllCards, fetchCardsBySet, LorcastCard } from "@/lib/lorcana-api";
import { Card } from "@/data/cards";
import { useMemo } from "react";
import { getFranchise } from "@/lib/franchises";
import { generateSetPlaceholders } from "@/data/placeholders";
import { MANUAL_CARDS } from "@/data/manual-cards";
import { fetchSupabaseManualCards } from "@/services/manualCards";

const INK_COLORS = ["Amber", "Amethyst", "Emerald", "Ruby", "Sapphire", "Steel"] as const;
type InkColor = typeof INK_COLORS[number];

function parseInkColor(color: string | null, colors?: string[] | null): InkColor {
  if (colors && colors.length > 0) {
    const validColors = colors.filter(c => INK_COLORS.includes(c as InkColor));
    if (validColors.length > 0) return validColors[0] as InkColor;
  }
  if (!color) return "Amber";
  if (INK_COLORS.includes(color as InkColor)) return color as InkColor;
  return "Amber";
}

function parseInkColors(color: string | null, colors?: string[] | null): InkColor[] {
  if (colors && colors.length > 0) {
    return colors.filter((c): c is InkColor => INK_COLORS.includes(c as InkColor));
  }
  if (!color) return ["Amber"];
  return [color as InkColor].filter((c): c is InkColor => INK_COLORS.includes(c));
}

function parseKeywords(bodyText?: string): string[] {
  const keywords: string[] = [];
  const known = ["Rush", "Evasive", "Ward", "Challenger", "Singer", "Reckless", "Bodyguard", "Support", "Shift", "Resist"];
  const text = bodyText ?? "";
  for (const kw of known) {
    if (text.includes(kw)) {
      const match = text.match(new RegExp(`${kw}\\s*(\\d+)?`));
      keywords.push(match && match[1] ? `${kw} ${match[1]}` : kw);
    }
  }
  return [...new Set(keywords)];
}

export function apiCardToCard(apiCard: LorcastCard): Card {
  const inkColor = parseInkColor(apiCard.ink, apiCard.inks);
  const allInkColors = parseInkColors(apiCard.ink, apiCard.inks);
  const nameParts = apiCard.name.split(" - ");
  const name = nameParts[0];
  const subtitle = apiCard.version || (nameParts.length > 1 ? nameParts.slice(1).join(" - ") : undefined);

  const typeMap: Record<string, Card["type"]> = {
    Character: "Character",
    Action: "Action",
    Item: "Item",
    Location: "Location",
    Song: "Song",
  };
  const type = (typeMap[apiCard.type?.[0]] ?? "Action") as Card["type"];

  const cardNum = parseInt(apiCard.collector_number) || 0;
  const setCode = apiCard.set.code;

  return {
    id: apiCard.id,
    name,
    subtitle,
    inkColor,
    allInkColors,
    type,
    cost: apiCard.cost,
    inkable: apiCard.inkwell,
    strength: apiCard.strength ?? undefined,
    willpower: apiCard.willpower ?? undefined,
    lore: apiCard.lore ?? undefined,
    keywords: parseKeywords(apiCard.text),
    bodyText: apiCard.text ?? "",
    flavorText: apiCard.flavor_text ?? undefined,
    set: apiCard.set.name,
    expansion: setCode,
    setNum: parseInt(setCode),
    cardNum,
    rarity: (apiCard.rarity === "Super_rare" || apiCard.rarity === "Super-rare") ? "Super Rare" : apiCard.rarity as Card["rarity"],
    artist: apiCard.illustrators?.join(", ") ?? "",
    image: apiCard.image_uris?.digital?.normal,
    thumbnail: apiCard.image_uris?.digital?.small,
    franchise: "", // Will be assigned in post-processing
    classifications: apiCard.classifications?.filter(Boolean) as string[] ?? [],
    priceUsd: apiCard.prices?.usd ?? null,
    priceUsdFoil: apiCard.prices?.usd_foil ?? null,
    tcgplayerUrl: apiCard.purchase_uris?.tcgplayer ?? undefined,
    releasedAt: apiCard.released_at,
  };
}

const CACHE_KEY = "lorcast_cards_cache";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const LORCAST_CARDS_QUERY_KEY = ["lorcast-cards"];

async function fetchRawCards(): Promise<Card[]> {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (data && timestamp && Date.now() - timestamp < CACHE_TTL) {
        return data as Card[];
      }
    } catch (e) {
      console.warn("Failed to parse cached cards", e);
    }
  }

  console.info("Fetching fresh card data from API");
  const apiCards = await fetchAllCards();
  const cards = apiCards.map(apiCardToCard);

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: cards,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn("Failed to cache cards", e);
  }

  return cards;
}

function applyManualOverrides(cards: Card[], dbCards: Card[] = []): Card[] {
  // 1. Build a robust map of manual overrides, DB taking precedence.
  // We identify cards by their SET (expansion) and NUMBER (cardNum).
  const manualOverrides = new Map<string, Card>();
  
  // Local files first
  for (const c of MANUAL_CARDS) {
    if (c.expansion && c.cardNum) {
      manualOverrides.set(`${c.expansion}-${c.cardNum}`, c);
    }
  }
  // DB manual cards overwrite local
  for (const dbCard of dbCards) {
    if (dbCard.expansion && dbCard.cardNum) {
      manualOverrides.set(`${dbCard.expansion}-${dbCard.cardNum}`, dbCard);
    }
  }

  // 2. Loop through all API cards and apply overrides
  // Keep track of which Set 12 cards we've encountered to calculate missing placeholders
  const encounteredSet12Nums = new Set<number>();
  const apiCardKeys = new Set<string>();
  
  const finalCards = cards.map(c => {
    const key = `${c.expansion}-${c.cardNum}`;
    apiCardKeys.add(key);

    if (c.expansion === "12" && c.cardNum) {
      encounteredSet12Nums.add(c.cardNum);
    }

    const override = manualOverrides.get(key);
    
    if (override) {
      // Manual data STRICTLY PRECEDES API data.
      // We carry over the API ID (c.id) to ensure existing URLs/decks don't break.
      return { 
        ...override, 
        id: c.id,
        franchise: override.franchise || getFranchise(`${override.name}${override.subtitle ? ` - ${override.subtitle}` : ""}`)
      };
    }
    
    return {
      ...c,
      franchise: c.franchise || getFranchise(`${c.name}${c.subtitle ? ` - ${c.subtitle}` : ""}`)
    };
  });

  // 3. Handle Set 12 Placeholders
  // Lorcana sets usually have a base of 204 cards.
  const baseSetCount = 204;
  const placeholders = generateSetPlaceholders("12", baseSetCount, "Wilds Unknown");
  const set12PlaceholdersToAdd: Card[] = [];

  for (let num = 1; num <= baseSetCount; num++) {
    if (!encounteredSet12Nums.has(num)) {
      const key = `12-${num}`;
      const override = manualOverrides.get(key);

      if (override) {
        set12PlaceholdersToAdd.push({
           ...override,
           franchise: override.franchise || getFranchise(`${override.name}${override.subtitle ? ` - ${override.subtitle}` : ""}`)
        });
      } else {
        const placeholder = placeholders[num - 1]; // Because placeholders.length is always 204
        set12PlaceholdersToAdd.push({
           ...placeholder,
           franchise: getFranchise(`${placeholder.name}`)
        });
      }
    }
  }
  
  // 4. Add any manually added Enchanted/Overnumbered cards for ANY set that wasn't in the API at all
  const additionalManualCards: Card[] = [];
  for (const [key, card] of manualOverrides.entries()) {
    if (!apiCardKeys.has(key)) {
      // If it is a Set 12 base card, we already successfully handled it via set12PlaceholdersToAdd
      if (card.expansion === "12" && card.cardNum && card.cardNum <= baseSetCount) {
         continue;
      }
      additionalManualCards.push({
        ...card,
        franchise: card.franchise || getFranchise(`${card.name}${card.subtitle ? ` - ${card.subtitle}` : ""}`)
      });
    }
  }

  return [...finalCards, ...set12PlaceholdersToAdd, ...additionalManualCards];
}

async function fetchAndCacheCards(): Promise<Card[]> {
  const [apiCards, dbCards] = await Promise.all([
    fetchRawCards(),
    fetchSupabaseManualCards()
  ]);
  return applyManualOverrides(apiCards, dbCards);
}
  

export function useAllCards() {
  return useQuery({
    queryKey: LORCAST_CARDS_QUERY_KEY,
    queryFn: fetchAndCacheCards,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Returns a lookup record for cards by ID (O(1) access)
 */
export function useCardLookup() {
  return useQuery({
    queryKey: LORCAST_CARDS_QUERY_KEY,
    queryFn: fetchAndCacheCards,
    staleTime: 1000 * 60 * 30,
    select: (allCards) => {
      const map: Record<string, Card> = {};
      for (const card of allCards) {
        map[card.id] = card;
      }
      return map;
    }
  });
}

export function useCardById(id: string | undefined) {
  const { data: lookup, isLoading, isError, error } = useCardLookup();
  const card = id && lookup ? (lookup as Record<string, Card>)[id] : undefined;
  return { data: card, isLoading, isError, error };
}

export function useCardsBySet(setId: string) {
  return useQuery({
    queryKey: ["lorcast-set-cards", setId],
    queryFn: async () => {
      const [apiCards, dbCards] = await Promise.all([
        fetchCardsBySet(setId),
        fetchSupabaseManualCards()
      ]);
      const cards = apiCards.map(apiCardToCard);
      
      // If this is the new set, apply placeholder filling logic
      if (setId === "12") {
        return applyManualOverrides(cards, dbCards).filter(c => c.expansion === "12");
      }
      
      return applyManualOverrides(cards, dbCards).filter(c => c.expansion === setId)
        .sort((a, b) => (a.cardNum ?? 9999) - (b.cardNum ?? 9999));
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useSets() {
  return useQuery({
    queryKey: LORCAST_CARDS_QUERY_KEY,
    queryFn: fetchAndCacheCards,
    staleTime: 1000 * 60 * 30,
    select: (allCards) => {
      if (!allCards.length) return [];
      
      const setsMap = new Map<string, { id: string; name: string; setNum: number; count: number; isPromo: boolean; releasedAt?: string }>();
      for (const card of allCards) {
        const setCode = card.expansion;
        if (!setsMap.has(setCode)) {
          const isNumeric = /^\d+$/.test(setCode);
          
          setsMap.set(setCode, {
            id: setCode,
            name: card.set,
            setNum: isNumeric ? (card.setNum || parseInt(setCode)) : 0,
            isPromo: !isNumeric,
            count: 0,
            releasedAt: card.releasedAt,
          });
        }
        setsMap.get(setCode)!.count++;
      }
      
      return Array.from(setsMap.values()).sort((a, b) => {
        if (a.isPromo !== b.isPromo) return a.isPromo ? 1 : -1;
        if (!a.isPromo) return a.setNum - b.setNum;
        return a.name.localeCompare(b.name);
      });
    },
  });
}
