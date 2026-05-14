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

export function useWishlist(targetUserId?: string, options: { enabled?: boolean } = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const activeUserId = targetUserId || user?.id;
  const queryKey = ["wishlist", activeUserId || "guest"];

  const isDemoMode = typeof window !== 'undefined' && 
                     (localStorage.getItem('lorbound_demo_mode') === 'true' || user?.id === 'demo-user-id');

  const { data: wishlist = [] as WishlistEntry[], isLoading } = useQuery<WishlistEntry[]>({
    queryKey,
    queryFn: async (): Promise<WishlistEntry[]> => {
      // Demo Mode persistence
      if (isDemoMode) {
        const stored = localStorage.getItem('lorbound_demo_wishlist');
        return stored ? JSON.parse(stored) : [];
      }

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
    enabled: options.enabled !== false,
  });

  const mutation = useMutation({
    mutationFn: async ({ cardId, variant, qty }: { cardId: string; variant: "normal" | "foil"; qty: number }) => {
      if (!user && !isDemoMode) throw new Error("You must be logged in to manage your wishlist");

      if (isDemoMode) {
        let current = JSON.parse(localStorage.getItem('lorbound_demo_wishlist') || '[]');
        if (qty <= 0) {
          // If no variant specified, remove all variants of this card
          if (!variant) {
            current = current.filter((i: any) => i.cardId !== cardId);
          } else {
            current = current.filter((i: any) => !(i.cardId === cardId && i.variant === variant));
          }
        } else {
          const v = variant || "normal";
          const existingIdx = current.findIndex((i: any) => i.cardId === cardId && i.variant === v);
          if (existingIdx >= 0) {
            current[existingIdx].qty = qty;
          } else {
            current.push({ cardId, variant: v, qty, addedAt: new Date().toISOString() });
          }
        }
        localStorage.setItem('lorbound_demo_wishlist', JSON.stringify(current));
        return;
      }

      if (qty <= 0) {
        const query = supabase.from("wishlists").delete().eq("user_id", user!.id).eq("card_id", cardId);
        if (variant) {
          query.eq("variant", variant);
        }
        const { error } = await query;
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlists")
          .upsert(
            { user_id: user!.id, card_id: cardId, variant: variant || "normal", qty },
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

    // Check if ANY variant of this card is in the wishlist
    const anyMatch = wishlist.find((i: any) => i.cardId === cardId);

    if (anyMatch) {
      // Remove ALL variants of this card to ensure a clean toggle state
      mutation.mutate({ cardId, variant: undefined as any, qty: 0 });
      toast({ title: `Removed from Wishlist` });
    } else {
      mutation.mutate({ cardId, variant, qty: 1 });
      toast({ title: `Added to Wishlist` });
    }
  }, [wishlist, mutation, toast, user]);

  const isInWishlist = useCallback((cardId: string, variant?: "normal" | "foil") => {
    if (variant) {
      return wishlist.some((i: any) => i.cardId === cardId && i.variant === variant);
    }
    return wishlist.some((i: any) => i.cardId === cardId);
  }, [wishlist]);

  const addToWishlistBulk = useCallback(async (items: { cardId: string; variant: "normal" | "foil"; qty: number }[]) => {
    if (!user && !isDemoMode) {
      toast({
        title: "Login Required",
        description: "Please sign in to add cards to your wishlist.",
        variant: "default"
      });
      return;
    }

    if (isDemoMode) {
      const current = JSON.parse(localStorage.getItem('lorbound_demo_wishlist') || '[]');
      items.forEach(item => {
        const existingIdx = current.findIndex((i: any) => i.cardId === item.cardId && i.variant === item.variant);
        if (existingIdx >= 0) {
          current[existingIdx].qty = item.qty;
        } else {
          current.push({ ...item, addedAt: new Date().toISOString() });
        }
      });
      localStorage.setItem('lorbound_demo_wishlist', JSON.stringify(current));
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Wishlist Updated", description: `Added ${items.length} cards to your wishlist.` });
      return;
    }

    const { error } = await supabase.from("wishlists").upsert(
      items.map(item => ({
        user_id: user!.id,
        card_id: item.cardId,
        variant: item.variant,
        qty: item.qty
      })),
      { onConflict: "user_id,card_id,variant" }
    );

    if (error) {
      toast({ title: "Wishlist Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Wishlist Updated", description: `Added ${items.length} cards to your wishlist.` });
    }
  }, [user, isDemoMode, queryClient, queryKey, toast]);

  return {
    wishlist,
    toggleWishlist,
    addToWishlistBulk,
    isInWishlist,
    isLoading,
  };
}
