import { supabase } from "@/lib/supabase";
import { NewsPost } from "@/data/news";

export interface DBNewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  published_at: string;
  created_at: string;
}

/**
 * Transforms a DB record to the frontend NewsPost interface
 */
export function mapDBPost(db: DBNewsPost): NewsPost {
  return {
    id: db.id,
    title: db.title,
    date: db.published_at,
    excerpt: db.excerpt,
    content: db.content,
    imageUrl: db.image_url,
    category: db.category as any,
    slug: db.slug
  };
}

export const newsService = {
  async getAllPosts(): Promise<NewsPost[]> {
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching news:", error);
      return [];
    }

    return (data as DBNewsPost[]).map(mapDBPost);
  },

  async getPostBySlug(slug: string): Promise<NewsPost | null> {
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching post ${slug}:`, error);
      return null;
    }

    return mapDBPost(data as DBNewsPost);
  },

  async upsertPost(post: Partial<DBNewsPost>): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required");

    // Standard slugify if needed
    const slug = post.slug || post.title?.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

    const cleanPost = {
      ...post,
      slug,
      published_at: post.published_at || new Date().toISOString()
    };

    return await supabase
      .from("news_posts")
      .upsert(cleanPost)
      .select()
      .single();
  },

  async deletePost(id: string): Promise<{ error: any }> {
    return await supabase
      .from("news_posts")
      .delete()
      .eq("id", id);
  }
};
