import { supabase } from "@/lib/supabase";
import { Card } from "@/data/cards";

/**
 * Maps the database row (snake_case) to the application Card interface (camelCase)
 */
function mapDbToCard(row: any): Card {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle || undefined,
    inkColor: row.ink_color as Card['inkColor'],
    allInkColors: row.all_ink_colors || [row.ink_color],
    type: row.type as Card['type'],
    cost: row.cost,
    inkable: row.inkable,
    strength: row.strength || undefined,
    willpower: row.willpower || undefined,
    lore: row.lore || undefined,
    keywords: row.keywords || [],
    bodyText: row.body_text || "",
    flavorText: row.flavor_text || undefined,
    set: row.set_name,
    expansion: row.expansion,
    setNum: row.set_num,
    cardNum: row.card_num,
    rarity: row.rarity as Card['rarity'],
    artist: row.artist || undefined,
    image: row.image || undefined,
    thumbnail: row.thumbnail || undefined,
    franchise: row.franchise || undefined,
    classifications: row.classifications || [],
    priceUsd: row.price_usd || null,
    priceUsdFoil: row.price_usd_foil || null,
    tcgplayerUrl: row.tcgplayer_url || undefined,
    releasedAt: row.released_at || undefined,
  };
}

/**
 * Fetches all manual card overrides from Supabase
 */
export async function fetchSupabaseManualCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from('manual_cards')
    .select('*');

  if (error) {
    console.error("Error fetching manual cards from Supabase:", error);
    return [];
  }

  return (data || []).map(mapDbToCard);
}
