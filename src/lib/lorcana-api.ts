const BASE_URL = "https://api.lorcast.com/v0";
const SESSION_CACHE_KEY = "glimmercast_cards_cache";

export interface LorcastCard {
  id: string;
  name: string;
  version?: string;
  layout: string;
  released_at: string;
  image_uris: {
    digital: {
      small: string;
      normal: string;
      large: string;
    };
  };
  cost: number;
  inkwell: boolean;
  ink: string | null;
  inks?: string[] | null;
  type: string[];
  classifications?: string[] | null;
  text: string;
  move_cost?: number | null;
  strength?: number | null;
  willpower?: number | null;
  lore?: number | null;
  rarity: string;
  illustrators: string[];
  collector_number: string;
  lang: string;
  flavor_text?: string | null;
  tcgplayer_id: number;
  legalities: {
    core: string;
  };
  set: {
    id: string;
    code: string;
    name: string;
  };
  prices: {
    usd: number | null;
    usd_foil: number | null;
  };
  purchase_uris?: {
    tcgplayer?: string;
  };
}

export interface LorcastSet {
  id: string;
  code: string;
  name: string;
  released_at?: string;
  card_count?: number;
}

export interface LorcastSetListResponse {
  results: LorcastSet[];
}

export interface LorcastSetResponse {
  results: LorcastCard[];
}

export interface LorcastSingleCardResponse extends LorcastCard {}

/**
 * Enhanced fetch with retry logic
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

export async function fetchCardsBySet(setCode: string): Promise<LorcastCard[]> {
  const formattedSetCode = setCode.toLowerCase();
  const res = await fetchWithRetry(
    `${BASE_URL}/cards/search?q=set:${formattedSetCode}&unique=prints`
  );
  if (!res.ok) throw new Error(`Failed to fetch cards for set ${setCode}`);
  const data: LorcastSetResponse = await res.json();
  return data.results || [];
}

let allCardsPromise: Promise<LorcastCard[]> | null = null;

export async function fetchAllCards(): Promise<LorcastCard[]> {
  if (allCardsPromise) return allCardsPromise;

  // Check Session Storage Cache first
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allCardsPromise = Promise.resolve(parsed);
        return allCardsPromise;
      }
    }
  } catch (e) {
    console.warn("Failed to read from session storage cache", e);
  }

  allCardsPromise = (async () => {
    try {
      const setsRes = await fetchSets();
      const sets = setsRes.results;
      
      let allCards: LorcastCard[] = [];
      const BATCH_SIZE = 5; // Increased slightly for efficiency
      
      for (let i = 0; i < sets.length; i += BATCH_SIZE) {
        const batch = sets.slice(i, i + BATCH_SIZE);
        
        const batchResults = await Promise.all(
          batch.map(async (set: LorcastSet, index: number) => {
            await new Promise(resolve => setTimeout(resolve, index * 20));
            try {
              return await fetchCardsBySet(set.code);
            } catch (e) {
              console.warn(`Failed to fetch cards for set ${set.code}`, e);
              return [];
            }
          })
        );
        
        for (const cards of batchResults) {
          allCards = allCards.concat(cards);
        }
        
        if (i + BATCH_SIZE < sets.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Persist to session storage for refresh persistence
      try {
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(allCards));
      } catch (e) {
        console.warn("Failed to persist cards to session storage", e);
      }

      return allCards;
    } catch (error) {
      allCardsPromise = null;
      throw error;
    }
  })();

  return allCardsPromise;
}

export async function fetchSets(): Promise<LorcastSetListResponse> {
  const res = await fetchWithRetry(`${BASE_URL}/sets`);
  if (!res.ok) throw new Error("Failed to fetch sets");
  return res.json();
}
