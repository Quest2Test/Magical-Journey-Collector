import { useState, useMemo } from "react";
import { useNews, useNewsAdmin } from "@/hooks/useNews";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Edit, ExternalLink, Database, AlertCircle, FileText, LayoutDashboard, Search, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { NEWS_POSTS } from "@/data/news";
import { DBNewsPost } from "@/services/newsService";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNews() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: posts = [], isLoading: postsLoading } = useNews();
  const { createPost, isCreating, deletePost, isDeleting } = useNewsAdmin();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<Partial<DBNewsPost>>({
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "Update"
  });

  // Security Check
  const authorizedEmails = ['lorbound@proton.me', 'quest2test@proton.me'];
  const isAdmin = authorizedEmails.includes(user?.email || "") || user?.user_metadata?.is_admin === true;

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-bold">Unauthorized Access</h2>
        <p className="text-muted-foreground">Only the site administrator can access the news publisher.</p>
        <Link href="/news"><Button variant="outline">Back to News</Button></Link>
      </div>
    );
  }

  const handleEdit = (post: any) => {
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.imageUrl,
      category: post.category
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost(formData);
      toast({ title: isEditing ? "Article Updated" : "Article Published", description: "The Inkbound chronicles have been updated." });
      resetForm();
    } catch (err: any) {
      toast({ title: "Publishing Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This article will be lost to the Ink forever.")) return;
    try {
      await deletePost(id);
      toast({ title: "Article Deleted" });
    } catch (err: any) {
      toast({ title: "Deletion Failed", description: err.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", excerpt: "", content: "", image_url: "", category: "Update" });
    setIsEditing(false);
  };

  const handleMigrate = async () => {
    if (!confirm("This will push all static articles from news.ts into Supabase. Proceed?")) return;
    let success = 0;
    for (const post of NEWS_POSTS) {
      try {
        await createPost({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          image_url: post.imageUrl,
          category: post.category,
          published_at: post.date
        });
        success++;
      } catch (err) {
        console.error("Migration error for", post.title, err);
      }
    }
    toast({ title: "Migration Complete", description: `Successfully moved ${success} articles to Supabase.` });
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 w-full bg-[#020617] text-slate-100 pb-20">
      {/* Header */}
      <div className="w-full bg-slate-900/50 border-b border-white/5 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <LayoutDashboard className="w-4 h-4 text-primary" />
             </div>
             <div>
                <h1 className="text-sm font-black uppercase tracking-widest text-white">Publisher Dashboard</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">News & Chronicles Management</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={handleMigrate} className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400">
                <Database className="w-3.5 h-3.5 mr-2" /> 1-Click Migration
             </Button>
             <Link href="/news">
               <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest">
                  <ExternalLink className="w-3.5 h-3.5 mr-2" /> View News
               </Button>
             </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Post Composer */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <Card className="bg-slate-900/40 border-white/5 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   {isEditing ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                   {isEditing ? "Edit Article" : "Compose New Article"}
                </CardTitle>
                <CardDescription>Draft your next Lorcana chronicle for the masses.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(v) => setFormData({...formData, category: v})}
                      >
                        <SelectTrigger className="bg-slate-950/50 border-white/10 h-10">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          <SelectItem value="Expansion">Expansion</SelectItem>
                          <SelectItem value="Community">Community</SelectItem>
                          <SelectItem value="Update">Update</SelectItem>
                          <SelectItem value="Tournament">Tournament</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">Slug (Optional)</Label>
                      <Input 
                        placeholder="my-cool-article" 
                        value={formData.slug || ""}
                        onChange={e => setFormData({...formData, slug: e.target.value})}
                        className="bg-slate-950/50 border-white/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">Article Title</Label>
                    <Input 
                      placeholder="e.g. Azurite Sea: Set 6 Breakdown" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      required
                      className="bg-slate-950/50 border-white/10 text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">Hero Image URL</Label>
                    <Input 
                      placeholder="https://..." 
                      value={formData.image_url}
                      onChange={e => setFormData({...formData, image_url: e.target.value})}
                      required
                      className="bg-slate-950/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">Excerpt / Lead Paragraph</Label>
                    <Textarea 
                      placeholder="A short summary that appears in the card feed..." 
                      value={formData.excerpt}
                      onChange={e => setFormData({...formData, excerpt: e.target.value})}
                      required
                      className="bg-slate-950/50 border-white/10 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">Main Content (Markdown)</Label>
                       <span className="text-[10px] text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded">Pro Tip: Use [[card:id]] to link glimmers</span>
                    </div>
                    <Textarea 
                      placeholder="Write your story here..." 
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      required
                      className="bg-slate-950/50 border-white/10 min-h-[300px] font-mono text-sm leading-relaxed"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4 border-t border-white/5 pt-6 bg-slate-950/20">
                  {isEditing && (
                    <Button type="button" variant="ghost" onClick={resetForm} className="text-xs">
                      Discard Edits
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isCreating} 
                    className={cn(
                      "flex-1 font-black uppercase tracking-widest",
                      isEditing ? "bg-amber-600 hover:bg-amber-500" : "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {isCreating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    {isEditing ? "Save Changes" : "Publish to Portal"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Article List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                     placeholder="Search articles..." 
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="bg-slate-950/50 border-white/5 pl-10 h-10"
                  />
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <FileText className="w-3.5 h-3.5" /> {posts.length} Total
               </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {postsLoading ? (
                  <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" /></div>
                ) : filteredPosts.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl text-slate-500">No articles found matching your query.</div>
                ) : (
                  filteredPosts.map((post: any) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      key={post.id}
                      className="group bg-slate-900/30 border border-white/5 p-4 rounded-xl flex gap-4 items-center hover:bg-slate-800/40 transition-all hover:border-white/10"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                        <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-primary/30 text-primary bg-primary/5 uppercase font-bold tracking-tighter">{post.category}</Badge>
                           <span className="text-[10px] text-slate-500 font-medium">{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{post.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{post.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/news/${post.slug}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(post)}
                          className="h-8 w-8 text-indigo-400 hover:text-indigo-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(post.id)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-400"
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
