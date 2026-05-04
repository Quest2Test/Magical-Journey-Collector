import { Card } from "@/data/cards";
import { SavedDeck, SavedDeckEntry } from "@/hooks/useDecks";
import { STARTER_DECKS, StarterDeckDefinition } from "@/data/starter-decks";
import { getDeckValue } from "@/lib/pricing";

/**
 * Aggressive normalization for card matching
 */
export const normalizeCardName = (s: string) => 
  s.normalize("NFD")
   .replace(/[\u0300-\u036f]/g, "")
   .toLowerCase()
   .replace(/[^a-z0-9]/g, "");

/**
 * Hydrates a single starter deck definition into a SavedDeck object
 */
export function hydrateStarterDeck(def: StarterDeckDefinition, allCards: Card[]): SavedDeck & { setName: string; isOfficial: boolean } {
  const missing: any[] = [];
  
  const entries = def.cards.map(entry => {
    const targetName = normalizeCardName(entry.name);
    const targetSub = entry.subtitle ? normalizeCardName(entry.subtitle) : "";

    const card = allCards.find(c => {
      const cName = normalizeCardName(c.name);
      const cSub = c.subtitle ? normalizeCardName(c.subtitle) : "";

      const nameMatch = cName === targetName;
      const subMatch = !entry.subtitle || cSub === targetSub;
      
      return nameMatch && subMatch;
    });

    if (!card) {
      missing.push(entry);
      return null;
    }
    return { card, qty: entry.qty } as SavedDeckEntry;
  }).filter((e): e is SavedDeckEntry => e !== null);

  const totalCards = entries.reduce((acc, e) => acc + e.qty, 0);
  const totalValue = getDeckValue(entries);

  return {
    id: def.id,
    name: def.name,
    format: "Core",
    inkColors: def.inkColors,
    totalCards,
    totalValue,
    entries,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    setName: def.setName,
    isOfficial: true,
  };
}

/**
 * Returns all hydrated starter decks
 */
export function getHydratedStarterDecks(allCards: Card[]) {
  return STARTER_DECKS.map(def => hydrateStarterDeck(def, allCards));
}
