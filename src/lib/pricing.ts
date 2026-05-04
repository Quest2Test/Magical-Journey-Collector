import { Card } from "@/data/cards";

/**
 * Standardized pricing logic for Lorcana cards.
 * Handles normal and foil prices with conservative fallbacks.
 */
export function getCardPricing(card: Card) {
  const normal = card.priceUsd ?? 0;
  
  // Conservative fallback: if foil price is missing, use the normal price (1.0x)
  let foil = card.priceUsdFoil ?? normal;

  // Special Case: If it's a foil-only rarity (Enchanted) and normal is 0 but foil is present,
  // we ensure the "normal" price doesn't accidentally zero out if someone is tracking it incorrectly.
  // But strictly speaking, enchanted cards only have a foil price.
  
  return {
    normal,
    foil
  };
}

/**
 * Gets the "Base Value" of a card for set completion metrics.
 * Prioritizes normal price, but falls back to foil for foil-only cards.
 */
export function getBaseCardValue(card: Card) {
  const { normal, foil } = getCardPricing(card);
  return normal > 0 ? normal : foil;
}

/**
 * Calculates the total base value of a deck.
 */
export function getDeckValue(entries: { card: Card; qty: number }[]) {
  return entries.reduce((acc, entry) => acc + (getBaseCardValue(entry.card) * entry.qty), 0);
}
