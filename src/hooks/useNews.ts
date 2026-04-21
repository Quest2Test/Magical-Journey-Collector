import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsService, DBNewsPost } from "@/services/newsService";
import { NewsPost } from "@/data/news";

const NEWS_QUERY_KEY = ["news-posts"];

export function useNews() {
  return useQuery({
    queryKey: NEWS_QUERY_KEY,
    queryFn: () => newsService.getAllPosts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ["news-post", slug],
    queryFn: () => slug ? newsService.getPostBySlug(slug) : Promise.resolve(null),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useNewsAdmin() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (post: Partial<DBNewsPost>) => newsService.upsertPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    }
  });

  return {
    createPost: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deletePost: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
}
