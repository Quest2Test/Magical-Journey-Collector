import { Card } from "./cards";

/**
 * MANUAL_CARDS
 * 
 * Use this file to manually define cards that are not yet in the official API.
 * 
 * HIERARCHY:
 * 1. API Data (If the card exists in the Lorcast API, it wins)
 * 2. Manual Data (If not in API, but defined here, this wins)
 * 3. Placeholders (If in neither, a face-down placeholder is shown)
 */
export const MANUAL_CARDS: Card[] = [
  {
    id: "manual-wun-010",
    name: "Manual Test (Woody)",
    subtitle: "Early Reveal Test",
    inkColor: "Ruby",
    allInkColors: ["Ruby"],
    type: "Character",
    cost: 4,
    inkable: true,
    strength: 3,
    willpower: 4,
    lore: 2,
    keywords: ["Rush"],
    bodyText: "This is a manually added card for testing purposes.",
    flavorText: "Revealed via manual override system.",
    set: "Wilds Unknown",
    expansion: "12",
    setNum: 12,
    cardNum: 10,
    rarity: "Rare",
    artist: "Manual Team",
    franchise: "Toy Story",
    classifications: ["Dreamborn", "Hero", "Sheriff"],
    releasedAt: "2026-05-15",
  },
];
