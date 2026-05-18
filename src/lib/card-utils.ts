import { Card } from "@/data/cards";

/**
 * Returns the formatted subtitle for a card.
 * For Action and Song cards, it prepends "Action" or "Action - " to the subtitle.
 * This ensures consistency across the app as requested by the user.
 */
export function getFormattedSubtitle(card: Card): string | undefined {
  if (card.type === 'Action' || card.type === 'Song') {
    const base = 'Action';
    const sub = card.subtitle || (card.type === 'Song' ? 'Song' : '');
    
    if (!sub) return base;
    
    // If the subtitle already contains 'Action', don't prepend it again
    if (sub.startsWith('Action')) return sub;
    
    // For Songs, ensure 'Song' is part of the subtitle if not already
    if (card.type === 'Song' && !sub.toLowerCase().includes('song')) {
      return `${base} - Song${card.subtitle ? ` - ${card.subtitle}` : ''}`;
    }
    
    return `${base} - ${sub}`;
  }
  
  return card.subtitle;
}

/**
 * Returns the display type for a card.
 * For Songs, it returns "Action" to be consistent with the "Action - Song" subtitle.
 */
export function getDisplayType(card: Card): string {
  if (card.type === 'Song') return 'Action';
  return card.type;
}

/**
 * Returns true if the card is only available in a foil treatment.
 * Follows API hints and specific set rules.
 */
export function isFoilOnly(card: Card): boolean {
  const FOIL_ONLY_RARITIES = ["Enchanted", "Iconic", "Epic"];
  if (FOIL_ONLY_RARITIES.includes(card.rarity)) return true;

  // Follow the API: If priceUsd is missing (null/undefined/0) but priceUsdFoil is present, it's foil-only
  if (!card.priceUsd && !!card.priceUsdFoil) return true;


  return false;
}

/**
 * Returns the available variants for a card.
 */
export function getCardVariants(card: Card): ("normal" | "foil")[] {
  if (isFoilOnly(card)) return ["foil"];
  return ["normal", "foil"];
}

/**
 * Detects the archetype of a deck based on its card composition and ink colors.
 * Returns a short, premium archetype name (e.g. "Amethyst/Steel · Song Control").
 */
export function getDeckArchetype(deckCards: { card: Card; qty: number }[]): string {
  if (!deckCards || deckCards.length === 0) return "Unknown Archetype";

  const inkDist: Record<string, number> = {};
  let totalCards = 0;
  let totalCost = 0;
  let songCount = 0;
  let itemCount = 0;
  let locationCount = 0;
  let bounceCardCount = 0; 
  let discardCardCount = 0; 

  deckCards.forEach(({ card, qty }) => {
    inkDist[card.inkColor] = (inkDist[card.inkColor] || 0) + qty;
    totalCards += qty;
    totalCost += card.cost * qty;
    
    if (card.type === 'Song') songCount += qty;
    if (card.type === 'Item') itemCount += qty;
    if (card.type === 'Location') locationCount += qty;
    
    const nameLower = card.name.toLowerCase();
    if (nameLower.includes("madam mim") || nameLower.includes("merlin")) {
      bounceCardCount += qty;
    }
    
    if (
      nameLower.includes("bucky") || 
      nameLower.includes("sudden chill") || 
      nameLower.includes("hypnotize") || 
      nameLower.includes("lucifer") || 
      nameLower.includes("you find em") ||
      (nameLower.includes("ursula") && nameLower.includes("deceiver"))
    ) {
      discardCardCount += qty;
    }
  });

  const activeInks = Object.keys(inkDist).sort();
  const inksStr = activeInks.join("/");
  const avgCost = totalCards > 0 ? totalCost / totalCards : 0;

  let suffix = "Midrange";

  if (activeInks.includes("Amethyst") && activeInks.includes("Ruby") && bounceCardCount >= 4) {
    suffix = "Bounce Control";
  } else if (activeInks.includes("Ruby") && activeInks.includes("Sapphire") && avgCost >= 3.3) {
    suffix = "Ramp Control";
  } else if (activeInks.includes("Sapphire") && activeInks.includes("Steel") && itemCount >= 6) {
    suffix = "Item Ramp";
  } else if (songCount >= 8) {
    if (activeInks.includes("Steel") && avgCost >= 3.0) {
      suffix = "Song Control";
    } else {
      suffix = "Songs";
    }
  } else if (discardCardCount >= 4 && activeInks.includes("Emerald")) {
    suffix = "Discard";
  } else if (locationCount >= 5) {
    suffix = "Location Aggro";
  } else if (avgCost <= 2.2) {
    suffix = "Hyper Aggro";
  } else if (avgCost <= 2.6) {
    suffix = "Aggro";
  } else if (avgCost >= 3.4) {
    suffix = "Control";
  }

  return inksStr ? `${inksStr} · ${suffix}` : suffix;
}