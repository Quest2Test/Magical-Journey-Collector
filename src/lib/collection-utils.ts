import { Card } from "@/data/cards";

export type CollectionEntry = {
  normal: number;
  foil: number;
};

export type Collection = Record<string, CollectionEntry>;

export interface CollectionStats {
  uniqueCards: number;
  totalCopies: number;
  uniqueFoils: number;
  byInk: Record<string, number>;
  byRarity: Record<string, number>;
  byType: Record<string, number>;
  completionPerSet: Record<string, { collected: number; total: number }>;
}

/**
 * Generates comprehensive statistics for a collection.
 */
export function calculateCollectionStats(collection: Collection, allCards: Card[]): CollectionStats {
  const stats: CollectionStats = {
    uniqueCards: 0,
    totalCopies: 0,
    uniqueFoils: 0,
    byInk: {},
    byRarity: {},
    byType: {},
    completionPerSet: {},
  };

  const cardMap = new Map(allCards.map(c => [c.id, c]));

  // Initialize set totals
  for (const card of allCards) {
    if (!stats.completionPerSet[card.expansion]) {
      stats.completionPerSet[card.expansion] = { collected: 0, total: 0 };
    }
    stats.completionPerSet[card.expansion].total++;
  }

  for (const [cardId, entry] of Object.entries(collection)) {
    const card = cardMap.get(cardId);
    if (!card) continue;

    const hasAny = entry.normal > 0 || entry.foil > 0;
    if (!hasAny) continue;

    stats.uniqueCards++;
    stats.totalCopies += (entry.normal + entry.foil);
    if (entry.foil > 0) stats.uniqueFoils++;

    // Ink
    stats.byInk[card.inkColor] = (stats.byInk[card.inkColor] || 0) + 1;
    
    // Rarity
    stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;

    // Type
    const type = card.type === 'Song' ? 'Action' : card.type;
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Set Completion
    if (stats.completionPerSet[card.expansion]) {
      stats.completionPerSet[card.expansion].collected++;
    }
  }

  return stats;
}
