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