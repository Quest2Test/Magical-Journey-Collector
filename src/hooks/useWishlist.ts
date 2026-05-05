import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";

export type WishlistEntry = {
  cardId: string;
  variant: "normal" | "foil";
  qty: number;
  addedAt: string;
};

export function useWishlist(targetUserId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const activeUserId = targetUserId || user?.id;
  const queryKey = ["wishlist", activeUserId || "guest"];

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      // Fetch from Supabase if we have a target user or logged in user
      if (activeUserId) {
        const { data, error } = await supabase
          .from("wishlists")
          .select("card_id, variant, qty, created_at")
          .eq("user_id", activeUserId)
          .order("created_at", { ascending: false });

        if (!error) {
          return data.map(row => ({
            cardId: row.card_id,
            variant: (row.variant as "normal" | "foil") || "normal",
            qty: row.qty,
            addedAt: row.created_at
          }));
        }
        
        return [];
      }

      return [];
    },
    enabled: true,
  });

  const mutation = useMutation({
    mutationFn: async ({ cardId, variant, qty }: { cardId: string; variant: "normal" | "foil"; qty: number }) => {
      if (!user) throw new Error("You must be logged in to manage your wishlist");

      if (qty <= 0) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .match({ user_id: user.id, card_id: cardId, variant });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlists")
          .upsert(
            { user_id: user.id, card_id: cardId, variant, qty },
            { onConflict: "user_id,card_id,variant" }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast({
        title: "Wishlist Error",
        description: error.message || "Failed to update wishlist.",
        variant: "destructive"
      });
    }
  });

  const toggleWishlist = useCallback((cardId: string, variant: "normal" | "foil" = "normal") => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to add cards to your wishlist.",
        variant: "default"
      });
      return;
    }

    const existing = wishlist.find((i: any) => i.cardId === cardId && i.variant === variant);
    if (existing) {
      mutation.mutate({ cardId, variant, qty: 0 });
      toast({ title: `Removed ${variant} from Wishlist` });
    } else {
      mutation.mutate({ cardId, variant, qty: 1 });
      toast({ title: `Added ${variant} to Wishlist` });
    }
  }, [wishlist, mutation, toast, user]);

  const isInWishlist = useCallback((cardId: string, variant?: "normal" | "foil") => {
    if (variant) {
      return wishlist.some((i: any) => i.cardId === cardId && i.variant === variant);
    }
    return wishlist.some((i: any) => i.cardId === cardId);
  }, [wishlist]);

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    isLoading,
  };
}
