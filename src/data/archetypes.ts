export interface ArchetypeCard {
  name: string;
  subtitle?: string;
  qty: number;
}

export interface MatchupData {
  opponentId: string;
  winRate: number; // 0-100
  note: string;
}

export interface Archetype {
  id: string;
  name: string;
  tier: "S" | "A" | "B";
  inks: string[];
  winrate: string;
  description: string;
  type: string;
  keyCards: { name: string; subtitle?: string }[];
  baseDeck: ArchetypeCard[];
  fullDeck: ArchetypeCard[]; // Added for 60-card analysis
  matchups: MatchupData[];
  strengths: string[];
  weaknesses: string[];
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "ruby-amethyst-control",
    name: "Ruby/Amethyst Control",
    tier: "S",
    inks: ["Ruby", "Amethyst"],
    winrate: "54.2%",
    description: "The premier control deck of the format. Uses Amethyst for card draw and early game presence, while Ruby provides unanswerable board wipes and late-game finishers.",
    type: "Control",
    keyCards: [
      { name: "Maui", subtitle: "Hero to All" },
      { name: "Maleficent", subtitle: "Monstrous Dragon" },
      { name: "Be Prepared" }
    ],
    baseDeck: [ // Kept for backward compatibility if needed, but we'll use fullDeck for analysis
      { name: "Maui", subtitle: "Hero to All", qty: 4 },
      { name: "Maleficent", subtitle: "Monstrous Dragon", qty: 4 },
      { name: "Be Prepared", qty: 4 }
    ],
    fullDeck: [
      { name: "Minnie Mouse", subtitle: "Always Classy", qty: 4 },
      { name: "Maui", subtitle: "Hero to All", qty: 4 },
      { name: "Maleficent", subtitle: "Monstrous Dragon", qty: 4 },
      { name: "Be Prepared", qty: 4 },
      { name: "Friends on the Other Side", qty: 4 },
      { name: "Lady Tremaine", subtitle: "Overbearing Matriarch", qty: 4 },
      { name: "Madam Mim", subtitle: "Fox", qty: 4 },
      { name: "Madam Mim", subtitle: "Snake", qty: 4 },
      { name: "Merlin", subtitle: "Rabbit", qty: 4 },
      { name: "Merlin", subtitle: "Goat", qty: 4 },
      { name: "Rafiki", subtitle: "Mysterious Sage", qty: 4 },
      { name: "The Queen's Castle", subtitle: "Mirror Chamber", qty: 4 },
      { name: "Yzma", subtitle: "Scary Beyond All Reason", qty: 4 },
      { name: "Madame Medusa", subtitle: "The Boss", qty: 4 }
    ],
    matchups: [
      { opponentId: "amber-steel-songs", winRate: 48, note: "Struggles against early singer pressure and A Whole New World." },
      { opponentId: "emerald-amethyst-bounce", winRate: 55, note: "Patience with board clears is key here." },
      { opponentId: "amber-ruby-mufasa", winRate: 52, note: "Medusa is your best friend in this matchup." }
    ],
    strengths: ["Infinite Card Draw", "Best Board Clears", "Unrivaled Late Game"],
    weaknesses: ["Slow Start", "Vulnerable to Hand Disruption", "Location Weakness"]
  },
  {
    id: "amber-steel-songs",
    name: "Amber/Steelsongs",
    tier: "A",
    inks: ["Amber", "Steel"],
    winrate: "52.8%",
    description: "A synergistic deck that uses Singer characters to cast powerful Steel songs for free, controlling the board while generating lore efficiently.",
    type: "Midrange",
    keyCards: [
      { name: "Ariel", subtitle: "Spectacular Singer" },
      { name: "A Whole New World" },
      { name: "Rapunzel", subtitle: "Gifted with Healing" }
    ],
    baseDeck: [],
    fullDeck: [
      { name: "Ariel", subtitle: "Spectacular Singer", qty: 4 },
      { name: "A Whole New World", qty: 4 },
      { name: "Rapunzel", subtitle: "Gifted with Healing", qty: 4 },
      { name: "Cinderella", subtitle: "Ballroom Sensation", qty: 4 },
      { name: "Stitch", subtitle: "New Dog", qty: 4 },
      { name: "Cinderella", subtitle: "Stouthearted", qty: 2 },
      { name: "Grab Your Sword", qty: 4 },
      { name: "Let It Go", qty: 3 },
      { name: "Benja", subtitle: "Guardian of the Dragon Gem", qty: 2 },
      { name: "Robin Hood", subtitle: "Beloved Outlaw", qty: 4 },
      { name: "And Then Along Came Zeus", qty: 4 },
      { name: "Tinker Bell", subtitle: "Giant Fairy", qty: 4 },
      { name: "Piglet", subtitle: "Very Small Animal", qty: 4 },
      { name: "Strength of a Raging Fire", qty: 4 },
      { name: "The Bare Necessities", qty: 5 }
    ],
    matchups: [
      { opponentId: "ruby-amethyst-control", winRate: 52, note: "Early pressure is vital before Maleficent drops." },
      { opponentId: "emerald-amethyst-bounce", winRate: 45, note: "Bounce targets make Steel removals less efficient." }
    ],
    strengths: ["Free Action Casts", "Efficient Board Control", "Burst Potential"],
    weaknesses: ["Requires Specific Setup", "Vulnerable to 'A Whole New World' from opponents"]
  },
  {
    id: "emerald-amethyst-bounce",
    name: "Emerald/Amethyst Bounce",
    tier: "A",
    inks: ["Emerald", "Amethyst"],
    winrate: "51.5%",
    description: "Tempo-oriented deck that disrupts the opponent's strategy by returning characters to their hand, while presenting difficult-to-answer threats.",
    type: "Tempo",
    keyCards: [
      { name: "Merlin", subtitle: "Rabbit" },
      { name: "Madam Mim", subtitle: "Fox" },
      { name: "Arthur", subtitle: "Wizard's Apprentice" }
    ],
    baseDeck: [],
    fullDeck: [
      { name: "Merlin", subtitle: "Rabbit", qty: 4 },
      { name: "Madam Mim", subtitle: "Fox", qty: 4 },
      { name: "Madam Mim", subtitle: "Snake", qty: 4 },
      { name: "Arthur", subtitle: "Wizard's Apprentice", qty: 4 },
      { name: "Merlin", subtitle: "Goat", qty: 4 },
      { name: "Friends on the Other Side", qty: 4 },
      { name: "Cursed Merfolk", subtitle: "Ursula's Poor Souls", qty: 4 },
      { name: "Flynn Rider", subtitle: "Charming Rogue", qty: 4 },
      { name: "Ursula", subtitle: "Deceiver", qty: 4 },
      { name: "Kit Cloudkicker", subtitle: "Tough Guy", qty: 4 },
      { name: "The Queen's Castle", subtitle: "Mirror Chamber", qty: 4 },
      { name: "Diablo", subtitle: "Maleficent's Spy", qty: 4 },
      { name: "Brawl", qty: 4 },
      { name: "Ursula", subtitle: "Sea Witch Queen", qty: 4 }
    ],
    matchups: [
      { opponentId: "ruby-amethyst-control", winRate: 45, note: "Struggles to out-resource the control king." },
      { opponentId: "amber-steel-songs", winRate: 55, note: "Tempo advantage renders their songs less impactful." }
    ],
    strengths: ["Incredible Tempo", "High Disruption", "Card Advantage via Bouncing"],
    weaknesses: ["Fragile Board State", "Struggles with Direct Removal"]
  },
  {
    id: "amber-ruby-mufasa",
    name: "Amber/Ruby Mufasa",
    tier: "B",
    inks: ["Amber", "Ruby"],
    winrate: "49.1%",
    description: "A character-dense aggro deck that aims to win fast, utilizing Mufasa's ability to cheat high-cost characters into play upon banishment.",
    type: "Aggro",
    keyCards: [
      { name: "Mufasa", subtitle: "Betrayed Leader" },
      { name: "Maleficent", subtitle: "Monstrous Dragon" },
      { name: "Rapunzel", subtitle: "Gifted with Healing" }
    ],
    baseDeck: [],
    fullDeck: [
      { name: "Mufasa", subtitle: "Betrayed Leader", qty: 4 },
      { name: "Maleficent", subtitle: "Monstrous Dragon", qty: 4 },
      { name: "Rapunzel", subtitle: "Gifted with Healing", qty: 4 },
      { name: "Doc", subtitle: "Leader of the Seven Dwarfs", qty: 4 },
      { name: "Simba", subtitle: "Protective Cub", qty: 4 },
      { name: "Lilo", subtitle: "Making a Wish", qty: 4 },
      { name: "Chernabog's Followers", subtitle: "Creatures of Evil", qty: 4 },
      { name: "Maui", subtitle: "Hero to All", qty: 4 },
      { name: "Lady Tremaine", subtitle: "Overbearing Matriarch", qty: 4 },
      { name: "Madam Mim", subtitle: "Fox", qty: 4 },
      { name: "Merlin", subtitle: "Goat", qty: 4 },
      { name: "Hydra", subtitle: "Loud Mouth", qty: 4 },
      { name: "Piglet", subtitle: "Pooh's Best Friend", qty: 4 },
      { name: "Just in Time", qty: 4 }
    ],
    matchups: [
      { opponentId: "ruby-amethyst-control", winRate: 48, note: "Patience with Mufasa triggers is critical." },
      { opponentId: "amber-steel-songs", winRate: 50, note: "Even matchup depends on the speed of the start." }
    ],
    strengths: ["Fast Starts", "Cheat High-Value Characters", "Difficult to Wipe Board"],
    weaknesses: ["RNG Dependent (Mufasa)", "No Card Draw", "Vulnerable to Exile/Medusa"]
  }
];
