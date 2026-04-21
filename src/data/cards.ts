export interface Card {
  id: string;
  name: string;
  subtitle?: string;
  inkColor: 'Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel';
  allInkColors?: ('Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel')[];
  type: 'Character' | 'Action' | 'Item' | 'Location' | 'Song';
  cost: number;
  inkable: boolean;
  strength?: number;
  willpower?: number;
  lore?: number;
  keywords: string[];
  bodyText: string;
  flavorText?: string;
  set: string;
  expansion: string;
  setNum?: number;
  cardNum?: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary' | 'Epic' | 'Enchanted' | 'Iconic';
  moveCost?: number;
  artist?: string;
  image?: string;
  thumbnail?: string;
  franchise?: string;
  classifications?: string[];
  priceUsd?: number | null;
  priceUsdFoil?: number | null;
  tcgplayerUrl?: string;
  releasedAt?: string;
}

export const MOCK_CARDS: Card[] = [];
