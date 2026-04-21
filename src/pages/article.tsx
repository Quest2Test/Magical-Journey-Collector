import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useNews, useArticle } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Share2, Tag, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { MetaTags } from "@/components/layout/MetaTags";
import { cn } from "@/lib/utils";
import { ArticleCardReference } from "@/components/news/ArticleCardReference";
import { ArticleCardFeature } from "@/components/news/ArticleCardFeature";
import React, { useMemo } from "react";

export default function ArticlePage() {
  const { slug } = useParams();
  const { data: post, isLoading } = useArticle(slug);
  const { data: allPosts = [] } = useNews();
  
  const relatedPosts = useMemo(() => {
    return allPosts.filter(p => p?.slug !== slug).slice(0, 3);
  }, [allPosts, slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Consulting the Inkwell...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-serif font-bold">Article not found</h2>
        <p className="text-muted-foreground">The chronicle you stay searching for has faded into the Ink.</p>
        <Link href="/news">
          <Button variant="outline">Back to News</Button>
        </Link>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Parse content to replace [[card:id]] with ArticleCardReference
  const renderContent = (content: string) => {
    // Regex matches both [[card:id]] and [[feature:id|align]]
    const parts = content.split(/(\[\[(?:card|feature):[^\]]+\]\])/g);
    
    return parts.map((part, i) => {
      const cardMatch = part.match(/\[\[card:([^\]]+)\]\]/);
      if (cardMatch) {
        return <ArticleCardReference key={i} cardId={cardMatch[1]} />;
      }

      const featureMatch = part.match(/\[\[feature:([^\]|]+)(?:\|([^\]]+))?\]\]/);
      if (featureMatch) {
         const cardId = featureMatch[1];
         const align = (featureMatch[2] || 'left') as 'left' | 'right';
         return <ArticleCardFeature key={i} cardId={cardId} align={align} />;
      }
      
      // Split into paragraphs for standard text
      return part.split('\n').map((para, j) => (
        <React.Fragment key={`${i}-${j}`}>
          {para}
          {j < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <div className="flex-1 w-full bg-background pb-0">
      <MetaTags />
      
      {/* Article Hero */}
      <section className="relative w-full aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1] overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img 
            src={post.imageUrl} 
            className="w-full h-full object-cover opacity-40 blur-[1px]" 
            alt={post.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 h-full flex flex-col justify-end pb-8 md:pb-12">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-4 max-w-4xl"
           >
              <div className="flex items-center gap-3">
                 <Badge className="bg-primary/20 text-primary border-primary/30 py-0.5">
                   {post.category}
                 </Badge>
                 <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                 </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-xl">
                 {post.title}
              </h1>
           </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Back Navigation & Meta (Left Sidebar on Desktop) */}
          <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
             <div className="sticky top-24 space-y-8">
                <Link href="/news">
                  <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
                  </Button>
                </Link>

                <div className="space-y-4 pt-4 border-t border-border/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        GC
                      </div>
                      <div>
                         <p className="text-sm font-bold">Glimmercast Staff</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Inkwell Chronicles</p>
                      </div>
                   </div>
                   <p className="text-xs text-muted-foreground leading-relaxed">
                      Deep-diving into the mechanics, meta, and magic of Disney Lorcana since day one.
                   </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                   <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-border/50" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                   </Button>
                   <Button variant="outline" size="sm" className="rounded-full border-border/50 text-[10px] font-bold uppercase tracking-wider group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                      Back to Top
                   </Button>
                </div>
             </div>
          </div>

          {/* Article Body */}
          <article className="lg:col-span-7 order-1 lg:order-2">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-8 prose-p:text-lg prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-white prose-a:text-primary hover:prose-a:text-primary/80 transition-all font-sans"
             >
                <p className="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-lg">
                   {post.excerpt}
                </p>

                <div className="space-y-8 text-lg text-slate-300 leading-8">
                   <div className="whitespace-pre-wrap">
                      {renderContent(post.content)}
                   </div>

                   <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 my-12 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Tag className="h-24 w-24 rotate-12 group-hover:rotate-[24deg] transition-transform duration-700" />
                      </div>
                      <h4 className="text-white font-bold text-xl mb-4 relative z-10">Important Takeaways</h4>
                      <ul className="space-y-4 relative z-10 text-slate-400">
                         <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                            <span>Keep an eye on the new location interactions in Azurite Sea.</span>
                         </li>
                         <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                            <span>Meta decks are shifting towards more aggressive mid-range strategies.</span>
                         </li>
                      </ul>
                   </div>
                </div>
             </motion.div>
          </article>

          {/* Right Spacer for Layout or Secondary Sidebar */}
          <div className="lg:col-span-2 hidden lg:block order-3" />
        </div>
      </div>

      {/* Read Next Section */}
      {relatedPosts.length > 0 && (
         <div className="mt-12 bg-slate-950/50 border-t border-border">
            <div className="container mx-auto px-4 py-16">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold flex items-center gap-3 text-white">
                     <BookOpen className="h-6 w-6 text-primary" /> Read Next
                  </h3>
                  <Link href="/news">
                     <Button variant="ghost" className="text-muted-foreground hover:text-primary space-x-2">
                        <span>All Chronicles</span>
                        <ArrowRight className="h-4 w-4" />
                     </Button>
                  </Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost: any, idx: number) => (
                     <Link key={relatedPost.id} href={`/news/${relatedPost.slug}`}>
                        <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ duration: 0.5, delay: idx * 0.1 }}
                           className="group cursor-pointer h-full flex flex-col"
                        >
                           <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 shadow-lg border border-border/50">
                              <img 
                                 src={relatedPost.imageUrl} 
                                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                 alt={relatedPost.title} 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="absolute top-3 left-3">
                                 <Badge variant="secondary" className="backdrop-blur-md bg-black/40 border-white/10 text-[9px] uppercase font-bold tracking-wider">
                                   {relatedPost.category}
                                 </Badge>
                              </div>
                           </div>
                           <div className="space-y-2 flex-1">
                              <h4 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                 {relatedPost.title}
                              </h4>
                              <p className="text-slate-400 text-sm line-clamp-2">
                                 {relatedPost.excerpt}
                              </p>
                           </div>
                        </motion.div>
                     </Link>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
