export interface TournamentDeckEntry {
  name: string;
  subtitle?: string;
  qty: number;
}

export interface TournamentDeck {
  id: string;
  playerName: string;
  placement: number; // 1 = 1st, 2 = 2nd, 8 = Top 8, etc.
  archetypeId: string;
  decklist: TournamentDeckEntry[];
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  format: string;
  playerCount: number;
  topDecks: TournamentDeck[];
}

// Simulated Backend Data for Tournaments
// This structure maps exactly to what a Supabase query would return
export const TOURNAMENTS: Tournament[] = [
  {
    id: "dlc-vegas-2026",
    name: "Disney Lorcana Challenge - Las Vegas",
    date: "2026-03-15T00:00:00Z",
    location: "Las Vegas, NV",
    format: "Core Constructed",
    playerCount: 1024,
    topDecks: [
      {
        id: "deck-vegas-1",
        playerName: "Alex Mercer",
        placement: 1,
        archetypeId: "ruby-amethyst-control",
        decklist: [
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
          { name: "Madame Medusa", subtitle: "The Boss", qty: 4 },
          { name: "Brawl", qty: 4 }
        ]
      },
      {
        id: "deck-vegas-2",
        playerName: "Sarah Jenks",
        placement: 2,
        archetypeId: "emerald-amethyst-bounce",
        decklist: [
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
          { name: "Ursula", subtitle: "Sea Witch Queen", qty: 4 },
          { name: "Pegasus", subtitle: "Flying Steed", qty: 4 }
        ]
      },
      {
        id: "deck-vegas-3",
        playerName: "Marcus Thorne",
        placement: 3,
        archetypeId: "amber-steel-songs",
        decklist: [
          { name: "Ariel", subtitle: "Spectacular Singer", qty: 4 },
          { name: "A Whole New World", qty: 4 },
          { name: "Rapunzel", subtitle: "Gifted with Healing", qty: 4 },
          { name: "Cinderella", subtitle: "Ballroom Sensation", qty: 4 },
          { name: "Stitch", subtitle: "New Dog", qty: 4 },
          { name: "Cinderella", subtitle: "Stouthearted", qty: 4 },
          { name: "Grab Your Sword", qty: 4 },
          { name: "Let It Go", qty: 4 },
          { name: "Robin Hood", subtitle: "Beloved Outlaw", qty: 4 },
          { name: "And Then Along Came Zeus", qty: 4 },
          { name: "Tinker Bell", subtitle: "Giant Fairy", qty: 4 },
          { name: "Piglet", subtitle: "Very Small Animal", qty: 4 },
          { name: "Strength of a Raging Fire", qty: 4 },
          { name: "The Bare Necessities", qty: 4 },
          { name: "Lantern", qty: 4 }
        ]
      }
    ]
  }
];
