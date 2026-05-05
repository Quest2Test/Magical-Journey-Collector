import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { SavedDeck } from "./useDecks";

export interface PublicDeck extends SavedDeck {
  authorName: string;
  views: number;
  upvotes: number;
  userId: string;
}

/**
 * Maps DB row to PublicDeck interface
 */
function mapDbToPublicDeck(row: any): PublicDeck {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    name: row.name,
    format: row.format as SavedDeck['format'],
    inkColors: row.ink_colors || [],
    totalCards: row.entries?.reduce((acc: number, e: any) => acc + e.qty, 0) || 0,
    totalValue: 0, // Computed dynamically based on current prices, or just keep what was passed
    entries: row.cards,
    views: row.views || 0,
    upvotes: row.upvotes || 0,
    createdAt: row.created_at,
    updatedAt: row.created_at, // public decks don't currently track update time separately
  };
}

export function usePublicDecks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const queryKey = ["public_decks"];

  const { data: publicDecks = [], isLoading } = useQuery<PublicDeck[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_decks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching public decks:", error);
        return [];
      }

      return (data || []).map(mapDbToPublicDeck);
    },
  });

  const publishDeckMutation = useMutation({
    mutationFn: async ({ deck, authorName }: { deck: SavedDeck, authorName: string }) => {
      if (!user) throw new Error("Must be logged in to publish a deck");

      const { data, error } = await supabase.from("public_decks").insert({
        user_id: user.id,
        author_name: authorName,
        name: deck.name,
        format: deck.format,
        ink_colors: deck.inkColors,
        cards: deck.entries,
      }).select().single();

      if (error) throw error;
      return mapDbToPublicDeck(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Deck Published!",
        description: "Your deck is now visible to the community."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to publish",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (deckId: string) => {
      // In a real app we'd want to call an RPC to increment safely, 
      // but for simplicity we'll just read and update or ignore for now
    }
  });

  const publishDeck = useCallback(
    (deck: SavedDeck, authorName: string) => publishDeckMutation.mutateAsync({ deck, authorName }),
    [publishDeckMutation]
  );

  return { publicDecks, publishDeck, isLoading, isPublishing: publishDeckMutation.isPending };
}
