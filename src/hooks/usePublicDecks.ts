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
    totalCards: row.cards?.reduce((acc: number, e: any) => acc + e.qty, 0) || 0,
    totalValue: 0, // Computed dynamically based on current prices, or just keep what was passed
    entries: row.cards,
    views: row.views || 0,
    upvotes: row.upvotes || 0,
    createdAt: row.created_at,
    updatedAt: row.created_at, // public decks don't currently track update time separately
  };
}

export function usePublicDecks(sortBy: 'recent' | 'popular' = 'recent') {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const queryKey = ["public_decks", sortBy];

  const { data: publicDecks = [], isLoading } = useQuery<PublicDeck[]>({
    queryKey,
    queryFn: async () => {
      let query = supabase.from("public_decks").select("*");
      
      if (sortBy === 'popular') {
        query = query.order("upvotes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }
      
      const { data, error } = await query.limit(50);

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

      const { data, error } = await supabase.from("public_decks").upsert({
        id: deck.id,
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

  const { data: likedDeckIds = [] } = useQuery<string[]>({
    queryKey: ["liked_decks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_likes")
        .select("deck_id")
        .eq("user_id", user?.id);
      
      if (error) {
        console.error("Error fetching liked decks:", error);
        return [];
      }
      return data.map(d => d.deck_id);
    }
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (deckId: string) => {
      if (!user) throw new Error("Must be logged in to like a deck");
      const { data, error } = await supabase.rpc("toggle_deck_like", { target_deck_id: deckId });
      if (error) throw error;
      return { deckId, liked: data as boolean };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["liked_decks", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["public_decks"] });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const toggleLike = useCallback(
    (deckId: string) => toggleLikeMutation.mutateAsync(deckId),
    [toggleLikeMutation]
  );

  return { 
    publicDecks, 
    publishDeck, 
    isLoading, 
    isPublishing: publishDeckMutation.isPending,
    likedDeckIds,
    toggleLike,
    isTogglingLike: toggleLikeMutation.isPending
  };
}
