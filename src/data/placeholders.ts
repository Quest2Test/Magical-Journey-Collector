import { Card } from "@/data/cards";

/**
 * Generates placeholder cards for a set that hasn't been fully revealed yet.
 */
export function generateSetPlaceholders(setId: string, count: number, setName: string): Card[] {
  const placeholders: Card[] = [];
  
  for (let i = 1; i <= count; i++) {
    placeholders.push({
      id: `placeholder-${setId}-${i}`,
      name: `Unrevealed Card #${i}`,
      subtitle: "Unrevealed",
      inkColor: "Amber", // Default
      allInkColors: ["Amber"],
      type: "Action", // Default
      cost: 0,
      inkable: true,
      keywords: [],
      bodyText: "This card has not yet been revealed.",
      set: setName,
      expansion: setId,
      setNum: parseInt(setId) || 0,
      cardNum: i,
      rarity: "Common", // Default
      artist: "Upcoming",
      franchise: "Unknown",
      classifications: [],
      priceUsd: null,
      priceUsdFoil: null,
      releasedAt: "2026-05-15",
    });
  }
  
  return placeholders;
}
