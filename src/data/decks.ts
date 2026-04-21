export interface DeckCard {
  cardId: string;
  quantity: number;
}

export interface Deck {
  id: string;
  name: string;
  author: string;
  inkColors: ('Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel')[];
  format: 'Core' | 'Draft' | 'Sealed' | 'Standard';
  date: string;
  views: number;
  likes: number;
  cards: DeckCard[];
  description?: string;
  tags: string[];
  archetype?: string;
}

export const MOCK_DECKS: Deck[] = [
  {
    id: "deck1",
    name: "Ruby/Amethyst Control",
    author: "LorcanaMaster99",
    inkColors: ["Ruby", "Amethyst"],
    format: "Core",
    date: "2024-03-15",
    views: 12500,
    likes: 450,
    cards: [],
    description: "A classic control shell utilizing the card draw of Amethyst and the removal power of Ruby.",
    tags: ["Control", "Meta", "Tournament"],
    archetype: "Control"
  },
  {
    id: "deck2",
    name: "Amber/Steel Songs",
    author: "SingerOfSongs",
    inkColors: ["Amber", "Steel"],
    format: "Core",
    date: "2024-03-20",
    views: 8400,
    likes: 310,
    cards: [],
    description: "Aggressive singing deck focused on song synergies.",
    tags: ["Aggro", "Combo", "Popular"],
    archetype: "Aggro"
  },
  {
    id: "deck3",
    name: "Emerald/Amethyst Bounce",
    author: "BounceMaster",
    inkColors: ["Emerald", "Amethyst"],
    format: "Core",
    date: "2024-04-01",
    views: 6200,
    likes: 215,
    cards: [],
    description: "Tempo deck utilizing bounce effects to keep the opponent off balance.",
    tags: ["Tempo", "Midrange"],
    archetype: "Midrange"
  },
  {
    id: "deck4",
    name: "Sapphire/Steel Ramp",
    author: "RampUp",
    inkColors: ["Sapphire", "Steel"],
    format: "Core",
    date: "2024-04-05",
    views: 5100,
    likes: 180,
    cards: [],
    description: "Ramp into big characters early and control the board with Steel removal.",
    tags: ["Ramp", "Control"],
    archetype: "Control"
  },
  {
    id: "deck5",
    name: "Ruby/Sapphire Items",
    author: "ItemCrafter",
    inkColors: ["Ruby", "Sapphire"],
    format: "Core",
    date: "2024-04-10",
    views: 4300,
    likes: 150,
    cards: [],
    description: "Utilize Sapphire's item synergy with Ruby's powerful top end.",
    tags: ["Combo", "Items"],
    archetype: "Combo"
  },
  {
    id: "deck6",
    name: "Amber/Ruby Aggro",
    author: "KingOfPrideRock",
    inkColors: ["Amber", "Ruby"],
    format: "Core",
    date: "2024-04-12",
    views: 7800,
    likes: 290,
    cards: [],
    description: "Aggressive character swarm deck with Challengers and efficient two-drops.",
    tags: ["Aggro", "Swarm"],
    archetype: "Aggro"
  },
  {
    id: "deck7",
    name: "Amethyst/Steel Draw",
    author: "Illusionist",
    inkColors: ["Amethyst", "Steel"],
    format: "Core",
    date: "2024-04-15",
    views: 3200,
    likes: 110,
    cards: [],
    description: "Draw massive amounts of cards and gain lore with card advantage engines.",
    tags: ["Combo", "Meta"],
    archetype: "Combo"
  },
  {
    id: "deck8",
    name: "Emerald/Steel Discard",
    author: "HandDestructor",
    inkColors: ["Emerald", "Steel"],
    format: "Core",
    date: "2024-04-18",
    views: 4500,
    likes: 165,
    cards: [],
    description: "Attack the opponent's hand while building your own board state.",
    tags: ["Control", "Discard"],
    archetype: "Control"
  }
];
