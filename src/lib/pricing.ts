import { Card } from "@/data/cards";
import { isFoilOnly } from "./card-utils";
import { Collection, CollectionEntry } from "@/lib/collection-utils";


export { isFoilOnly };





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
 * Calculates the value of a specific quantity of a card.
 */
export function getCardValue(card: Card, entry: CollectionEntry) {
  const { normal, foil } = getCardPricing(card);
  return (entry.normal * normal) + (entry.foil * foil);
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

/**
 * Calculates the total market value of a collection.
 */
export function getCollectionValue(collection: Collection, allCards: Card[]) {

  const cardMap = new Map(allCards.map(c => [c.id, c]));
  let total = 0;

  for (const [cardId, entry] of Object.entries(collection)) {
    const card = cardMap.get(cardId);
    if (!card) continue;

    const pricing = getCardPricing(card);
    total += (entry.normal * pricing.normal) + (entry.foil * pricing.foil);
  }

  return total;
}
