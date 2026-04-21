export type ChallengeMetric = 
  | 'total_cards' 
  | 'total_value' 
  | 'unique_foils' 
  | 'ink_diversity' 
  | 'legendary_count' 
  | 'enchanted_count'
  | 'set_completion'; // percentage out of 100

export interface ChallengeCondition {
  metric: ChallengeMetric;
  target: number;
  setId?: string; // Used specifically for filtering by Set 
}

export interface Challenge {
  id: string;
  type: 'Lifetime' | 'Seasonal';
  title: string;
  description: string;
  tier: 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary' | 'Enchanted';
  iconName: string; // Fallback mapping to Lucide 
  badgeImageUrl?: string; // Custom graphic
  condition: ChallengeCondition;
  isActive?: boolean;
}

// Mock Database payload for Supabase Challenges table
export const CHALLENGES: Challenge[] = [
  // Lifetime Baseline Challenges
  {
    id: 'pioneer',
    type: 'Lifetime',
    title: 'Illumineer Initiate',
    description: 'Logged into the Lorcana ecosystem and claimed your first card.',
    tier: 'Common',
    iconName: 'Flag',
    condition: { metric: 'total_cards', target: 1 }
  },
  {
    id: 'foundations',
    type: 'Lifetime',
    title: 'Foundations Collector',
    description: 'Tracked your first 50 unique cards across all sets.',
    tier: 'Uncommon',
    iconName: 'Layers',
    condition: { metric: 'total_cards', target: 50 }
  },
  {
    id: 'shiny',
    type: 'Lifetime',
    title: 'Glimmer Hunter',
    description: 'Secured at least 5 cold foil glimmers in your collection.',
    tier: 'Rare',
    iconName: 'Sparkles',
    condition: { metric: 'unique_foils', target: 5 }
  },
  {
    id: 'rainbow',
    type: 'Lifetime',
    title: 'Prism Master',
    description: 'Gathered cards spanning all 6 major ink colors.',
    tier: 'Super Rare',
    iconName: 'Zap',
    condition: { metric: 'ink_diversity', target: 6 }
  },
  {
    id: 'royal',
    type: 'Lifetime',
    title: 'Legendary Find',
    description: 'Drafted your very first Legendary tier character.',
    tier: 'Legendary',
    iconName: 'Crown',
    condition: { metric: 'legendary_count', target: 1 }
  },
  {
    id: 'enchanted',
    type: 'Lifetime',
    title: 'Mythic Seeker',
    description: 'The impossible odds: Unpacked an alternate-art Enchanted card.',
    tier: 'Enchanted',
    iconName: 'Gem',
    condition: { metric: 'enchanted_count', target: 1 }
  },
  {
    id: 'hoards',
    type: 'Lifetime',
    title: 'Dragon Vault',
    description: 'Amasse a collection possessing a market value over $1,000.',
    tier: 'Super Rare',
    iconName: 'Medal',
    condition: { metric: 'total_value', target: 1000 }
  },
  // Seasonal/Event Custom Badges
  {
    id: 'azurite-sea-launch',
    type: 'Seasonal',
    title: 'Azurite Sea Vanguard',
    description: 'Achieve 20% collection rate of Set 6: Azurite Sea during the launch window.',
    tier: 'Legendary',
    iconName: 'Ship',
    badgeImageUrl: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=200&auto=format&fit=crop', // Placeholder compass/sea graphic
    condition: { metric: 'set_completion', target: 20, setId: 'azurite-sea' },
    isActive: true
  },
  {
    id: 'shimmering-master',
    type: 'Seasonal',
    title: 'Shimmering Skies Veteran',
    description: 'Logged at least 50% completion on Set 5: Shimmering Skies.',
    tier: 'Super Rare',
    iconName: 'CloudLightning',
    badgeImageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=200&auto=format&fit=crop', // Placeholder cosmic graphic
    condition: { metric: 'set_completion', target: 50, setId: 'shimmering-skies' },
    isActive: true
  }
];
