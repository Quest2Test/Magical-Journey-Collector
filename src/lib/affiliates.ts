import { Card } from "@/data/cards";

export type Region = "US" | "EU" | "Other";

/**
 * Detects the user's region based on their browser timezone.
 * Non-intrusive and fast "best guess" for monetization targeting.
 */
export function detectRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith("America/")) return "US";
    if (tz.startsWith("Europe/")) return "EU";
    return "Other";
  } catch {
    return "Other";
  }
}

/**
 * Builds an affiliate-tracked URL for TCGPlayer.
 */
export function buildTCGPlayerUrl(card: Card): string {
  if (!card.tcgplayerUrl) return "";
  
  const affiliateId = import.meta.env.VITE_TCGPLAYER_AFFILIATE_ID || "";
  
  // If no affiliate ID is configured, return the plain link with basic internal tracking
  if (!affiliateId || affiliateId === "lorbound") {
    try {
      const backupUrl = new URL(card.tcgplayerUrl);
      backupUrl.searchParams.set("utm_source", "lorbound");
      return backupUrl.toString();
    } catch {
      return card.tcgplayerUrl;
    }
  }
  
  // Impact Radius Deep Linking API (Required by TCGPlayer)
  return `https://tcgplayer.pxf.io/c/${affiliateId}/1830156/21018?u=${encodeURIComponent(card.tcgplayerUrl)}`;
}

/**
 * Builds an affiliate-tracked URL for CardMarket.
 */
export function buildCardMarketUrl(card: Card): string {
  const affiliateId = import.meta.env.VITE_CARDMARKET_AFFILIATE_ID || "";
  const query = `${card.name}${card.subtitle ? ` - ${card.subtitle}` : ""}`;
  
  let baseUrl = `https://www.cardmarket.com/en/Lorcana/Products/Singles?searchString=${encodeURIComponent(query)}`;
  
  if (affiliateId) {
    baseUrl += `&affiliateId=${affiliateId}`;
  }
  
  return baseUrl;
}
