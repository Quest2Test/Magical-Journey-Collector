import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

export type CollectionEntry = {
  normal: number;
  foil: number;
};

export type Collection = Record<string, CollectionEntry>;

export function useCollection(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const activeUserId = targetUserId || user?.id;

  const queryKey = ["collection", activeUserId || "guest"];

  const { data: collection = {}, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      // If no target user and no logged in user, return empty collection
      // Guest localstorage support removed to encourage account creation
      if (!activeUserId) {
        return {};
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from("collections")
        .select("card_id, normal, foil")
        .eq("user_id", activeUserId);

      if (error) throw error;

      const coll: Collection = {};
      for (const row of data || []) {
        coll[row.card_id] = { normal: row.normal, foil: row.foil };
      }
      return coll;
    },
    enabled: !!activeUserId, // Only run query if we have a user to look up
  });

  const mutation = useMutation({
    mutationFn: async ({ cardId, entry }: { cardId: string; entry: CollectionEntry }) => {
      if (!user) {
        return Promise.reject("Must be signed in to modify collection");
      }

      if (entry.normal === 0 && entry.foil === 0) {
        const { error } = await supabase
          .from("collections")
          .delete()
          .match({ user_id: user.id, card_id: cardId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("collections")
          .upsert(
            { user_id: user.id, card_id: cardId, normal: entry.normal, foil: entry.foil },
            { onConflict: "user_id,card_id" }
          );
        if (error) throw error;
      }
    },
    onMutate: async ({ cardId, entry }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Collection>(queryKey) || {};

      const next = { ...previous };
      if (entry.normal === 0 && entry.foil === 0) {
        delete next[cardId];
      } else {
        next[cardId] = entry;
      }
      
      queryClient.setQueryData<Collection>(queryKey, next);
      
      return { previous };
    },
    onError: (err, newEntry, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Collection>(queryKey, context.previous);
      }
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) return Promise.reject("Must be signed in to clear collection");
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Collection>(queryKey) || {};
      queryClient.setQueryData<Collection>(queryKey, {});
      return { previous };
    },
    onError: (err, newEntry, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Collection>(queryKey, context.previous);
      }
    },
    onSettled: () => {
      if (user) queryClient.invalidateQueries({ queryKey });
    },
  });

  const getEntry = useCallback(
    (cardId: string): CollectionEntry =>
      collection[cardId] ?? { normal: 0, foil: 0 },
    [collection]
  );

  const getQty = useCallback(
    (cardId: string) => {
      const e = collection[cardId];
      return e ? e.normal + e.foil : 0;
    },
    [collection]
  );

  const addCopy = useCallback(
    (cardId: string, variant: "normal" | "foil" = "normal") => {
      if (!user) return;
      const entry = collection[cardId] ?? { normal: 0, foil: 0 };
      const current = entry[variant];
      if (current >= 4) return;
      mutation.mutate({ cardId, entry: { ...entry, [variant]: current + 1 } });
    },
    [collection, mutation, user]
  );

  const removeCopy = useCallback(
    (cardId: string, variant: "normal" | "foil" = "normal") => {
      if (!user) return;
      const entry = collection[cardId] ?? { normal: 0, foil: 0 };
      const current = entry[variant];
      if (current <= 0) return;
      mutation.mutate({ cardId, entry: { ...entry, [variant]: current - 1 } });
    },
    [collection, mutation, user]
  );

  const toggleCollected = useCallback(
    (cardId: string, variant: "normal" | "foil" = "normal") => {
      if (!user) return;
      const entry = collection[cardId];
      if (!entry || (entry.normal === 0 && entry.foil === 0)) {
        mutation.mutate({
          cardId,
          entry: { normal: variant === "normal" ? 1 : 0, foil: variant === "foil" ? 1 : 0 },
        });
      } else {
        mutation.mutate({ cardId, entry: { normal: 0, foil: 0 } });
      }
    },
    [collection, mutation, user]
  );

  const isCollected = useCallback(
    (cardId: string) => {
      const e = collection[cardId];
      return !!e && (e.normal > 0 || e.foil > 0);
    },
    [collection]
  );

  const collectedCount = Object.keys(collection).length;
  const totalCopies = Object.values(collection).reduce(
    (sum, e) => sum + e.normal + e.foil,
    0
  );

  const clearCollection = useCallback(() => {
    if (!user) return;
    clearMutation.mutate();
  }, [clearMutation, user]);

  return {
    collection,
    getEntry,
    getQty,
    addCopy,
    removeCopy,
    toggleCollected,
    isCollected,
    collectedCount,
    totalCopies,
    clearCollection,
    isLoading: isLoading && !!activeUserId,
    isError,
  };
}
