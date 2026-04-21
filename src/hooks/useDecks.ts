import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/data/cards";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";

export interface SavedDeckEntry {
  card: Card;
  qty: number;
}

export interface SavedDeck {
  id: string;
  name: string;
  format: "Any" | "Core" | "Infinity";
  inkColors: string[];
  totalCards: number;
  totalValue: number;
  entries: SavedDeckEntry[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "glimmercast-decks";

function readLocalDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalDecks(decks: SavedDeck[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch {
    // ignore storage errors
  }
}

/**
 * Maps DB row to SavedDeck interface
 */
function mapDbToDeck(row: any): SavedDeck {
  return {
    id: row.id,
    name: row.name,
    format: row.format as SavedDeck['format'],
    inkColors: row.ink_colors || [],
    totalCards: row.total_cards || 0,
    totalValue: Number(row.total_value) || 0,
    entries: row.entries as SavedDeckEntry[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useDecks(targetUserId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const activeUserId = targetUserId || user?.id;
  
  const queryKey = ["decks", activeUserId || "guest"];

  const { data: decks = [], isLoading } = useQuery<SavedDeck[]>({
    queryKey,
    queryFn: async () => {
      if (!activeUserId) {
        return readLocalDecks();
      }

      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", activeUserId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching decks:", error);
        return [];
      }

      return (data || []).map(mapDbToDeck);
    },
  });

  // Handle migration of local decks to Supabase when user logs in
  useEffect(() => {
    const migrate = async () => {
      const localDecks = readLocalDecks();
      if (user && localDecks.length > 0) {
        const { data: existing } = await supabase
          .from("decks")
          .select("id")
          .eq("user_id", user.id);
        
        const existingIds = new Set((existing || []).map(d => d.id));
        const toUpload = localDecks.filter(d => !existingIds.has(d.id));

        if (toUpload.length > 0) {
          const { error } = await supabase.from("decks").insert(
            toUpload.map(d => ({
              id: d.id,
              user_id: user.id,
              name: d.name,
              format: d.format,
              ink_colors: d.inkColors,
              total_cards: d.totalCards,
              total_value: d.totalValue,
              entries: d.entries,
              created_at: d.createdAt,
              updated_at: d.updatedAt
            }))
          );

          if (!error) {
            toast({
              title: "Decks Synced",
              description: `Uploaded ${toUpload.length} local decks to your account.`
            });
            // Clear local storage after successful migration
            localStorage.removeItem(STORAGE_KEY);
            queryClient.invalidateQueries({ queryKey });
          }
        }
      }
    };
    
    if (user && !targetUserId) {
      migrate();
    }
  }, [user, targetUserId, toast, queryClient, queryKey]);

  const saveDeckMutation = useMutation({
    mutationFn: async (deck: SavedDeck) => {
      if (!user) {
        const current = readLocalDecks();
        const idx = current.findIndex((d) => d.id === deck.id);
        if (idx >= 0) {
          current[idx] = deck;
        } else {
          current.unshift(deck);
        }
        writeLocalDecks(current);
        return deck;
      }

      const { error } = await supabase.from("decks").upsert({
        id: deck.id,
        user_id: user.id,
        name: deck.name,
        format: deck.format,
        ink_colors: deck.inkColors,
        total_cards: deck.totalCards,
        total_value: deck.totalValue,
        entries: deck.entries,
        created_at: deck.createdAt,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      return deck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId: string) => {
      if (!user) {
        const current = readLocalDecks().filter((d) => d.id !== deckId);
        writeLocalDecks(current);
        return;
      }

      const { error } = await supabase
        .from("decks")
        .delete()
        .match({ id: deckId, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const saveDeck = useCallback(
    (deck: SavedDeck) => saveDeckMutation.mutate(deck),
    [saveDeckMutation]
  );

  const deleteDeck = useCallback(
    (id: string) => deleteDeckMutation.mutate(id),
    [deleteDeckMutation]
  );

  return { decks, saveDeck, deleteDeck, isLoading };
}
