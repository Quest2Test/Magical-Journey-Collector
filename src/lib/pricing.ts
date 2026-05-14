import { Card } from "@/data/cards";

/**
 * Detects if a card is exclusively available in foil (Enchanted, Iconic).
 */
export function isFoilOnly(card: Card): boolean {
  const rarity = card.rarity?.toLowerCase();
  return rarity === "enchanted" || rarity === "iconic";
}

/**
 * Standardized pricing logic for Lorcana cards.
 * Handles normal and foil prices with cross-variant fallbacks.
 */
export function getCardPricing(card: Card) {
  const isFoil = isFoilOnly(card);
  const pUsd = card.priceUsd || 0;
  const pFoil = card.priceUsdFoil || 0;

  // Normal price logic:
  // 1. If it's Enchanted/Iconic, it HAS no normal version (return 0)
  // 2. Use priceUsd if available
  // 3. Fallback to priceUsdFoil if normal price is missing
  const normal = isFoil ? 0 : (pUsd || pFoil);
  
  // Foil price logic:
  // 1. Use priceUsdFoil if available
  // 2. Fallback to priceUsd if foil price is missing
  const foil = pFoil || pUsd;

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
  return isFoilOnly(card) ? foil : (normal > 0 ? normal : foil);
}

/**
 * Calculates the total base value of a deck.
 */
export function getDeckValue(entries: { card: Card; qty: number }[]) {
  return entries.reduce((acc, entry) => acc + (getBaseCardValue(entry.card) * entry.qty), 0);
}
