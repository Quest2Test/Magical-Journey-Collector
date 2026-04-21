import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useNews } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Sparkles, Tag, TrendingUp, X, Loader2 } from "lucide-react";
import { MetaTags } from "@/components/layout/MetaTags";
import { cn } from "@/lib/utils";

export default function NewsPage() {
  const { data: posts = [], isLoading } = useNews();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const featuredPost = posts[0];
  
  const filteredPosts = useMemo(() => {
    if (posts.length < 2) return [];
    const others = posts.slice(1);
    if (!selectedCategory) return others;
    return others.filter(p => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!featuredPost) {
     return (
        <div className="container mx-auto py-20 text-center">
           <h2 className="text-2xl font-bold">No Chronicles Found</h2>
           <p className="text-muted-foreground mt-2">The Inkwell is currently dry. Check back soon.</p>
        </div>
     );
  }


  return (
    <div className="flex-1 w-full bg-background">
      <MetaTags />

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden border-b bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src={featuredPost.imageUrl}
            className="w-full h-full object-cover opacity-30 grayscale-[0.2] blur-[2px]"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                Featured Expansion
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight drop-shadow-2xl"
            >
              {featuredPost.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl"
            >
              {featuredPost.excerpt}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link href={`/news/${featuredPost.slug}`}>
                <Button size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 group">
                  Read Expansion Guide <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Latest News Feed */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  {selectedCategory ? `${selectedCategory} Chronicles` : "Latest Chronicles"}
                </h2>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-primary flex items-center gap-1 hover:underline font-bold uppercase tracking-wider"
                  >
                    <X className="w-3 h-3" /> Clear Filter
                  </button>
                )}
              </div>
              <div className="h-[1px] flex-1 mx-6 bg-border hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px] content-start">
              <AnimatePresence mode="popLayout">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, idx) => {
                    const isFeaturedSubarticle = !selectedCategory && idx === 0;

                    return (
                      <Link key={post.id} href={`/news/${post.slug}`} className={cn(isFeaturedSubarticle ? "md:col-span-2" : "col-span-1")}>
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          className="group cursor-pointer h-full flex flex-col"
                        >
                          <div className={cn(
                            "relative rounded-2xl overflow-hidden mb-4 shadow-lg border border-border/50",
                            isFeaturedSubarticle ? "aspect-[21/9] md:aspect-[3/1]" : "aspect-video"
                          )}>
                            <img
                              src={post.imageUrl}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              alt={post.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-3 left-3">
                              <Badge variant="secondary" className="backdrop-blur-md bg-black/40 border-white/10 text-[10px] uppercase font-bold tracking-wider">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                          <div className={cn("space-y-2 flex-1 flex flex-col", isFeaturedSubarticle && "md:px-2")}>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                              <Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString()}
                            </div>
                            <h3 className={cn(
                              "font-bold group-hover:text-primary transition-colors leading-tight",
                              isFeaturedSubarticle ? "text-2xl md:text-3xl" : "text-xl"
                            )}>
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">No articles found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      We couldn't find any articles in the "{selectedCategory}" category. Try checking back later or browse all news.
                    </p>
                    <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                      View All News
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            {/* Categories */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all",
                    !selectedCategory 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                      : "bg-muted/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                  )}
                >
                  All
                  <span className={cn("text-[10px] font-medium", !selectedCategory ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    ({posts.length > 0 ? posts.length - 1 : 0})
                  </span>
                </button>
                {["Expansion", "Community", "Update", "Tournament"].map(cat => {
                  const count = posts.filter(p => p.category === cat).length;
                  const isActive = selectedCategory === cat;
                  
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all",
                        isActive 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                          : "bg-muted/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                      )}
                    >
                      {cat}
                      <span className={cn("text-[10px] font-medium", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular Topics */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Popular Topics
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Set 6 — Azurite Sea", tag: "Expansion", color: "text-indigo-400" },
                  { label: "Meta Analysis", tag: "Community", color: "text-emerald-400" },
                  { label: "Big Hero 6 Cards", tag: "Expansion", color: "text-indigo-400" },
                  { label: "Set 1 Legends", tag: "Community", color: "text-emerald-400" },
                ].map((topic, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedCategory(topic.tag)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all group text-left",
                      selectedCategory === topic.tag 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-muted/30 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      selectedCategory === topic.tag ? "text-primary" : "group-hover:text-primary"
                    )}>
                      {topic.label}
                    </span>
                    <Badge variant="secondary" className={cn(
                      "text-[9px] uppercase tracking-wider",
                      selectedCategory === topic.tag ? "bg-primary text-primary-foreground" : ""
                    )}>
                      {topic.tag}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-5">Explore</h3>
              <div className="space-y-2">
                {[
                  { label: "Browse All Cards", href: "/cards", icon: "🃏" },
                  { label: "Deck Builder", href: "/builder", icon: "🛠️" },
                  { label: "Inkbound Academy", href: "/academy", icon: "📖" },
                  { label: "Sets", href: "/sets", icon: "📦" },
                ].map(link => (
                  <Link key={link.href} href={link.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-all cursor-pointer group">
                      <span className="text-base">{link.icon}</span>
                      <span className="text-sm font-medium group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                      <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ad / Newsletter Glassmorphism */}
            <div className="rounded-3xl p-6 bg-card/60 backdrop-blur-xl border border-primary/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700" />

              <div className="relative z-10 space-y-5">
                <div className="p-3 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-2xl leading-tight">Never miss a Glimmer</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    Join our Illumineers and receive the latest reveals and news directly to your inbox.
                  </p>
                </div>
                <div className="pt-2">
                  <Button className="w-full gap-2 font-bold rounded-xl h-12 shadow-lg shadow-primary/20">
                    Subscribe to Lorbound
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
