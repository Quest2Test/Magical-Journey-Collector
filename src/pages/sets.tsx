import { Link } from "wouter";
import { ArrowRight, Loader2, Sparkles, Calendar, BookOpen } from "lucide-react";
import { useSets, useAllCards } from "@/hooks/useCards";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useCollection } from "@/hooks/useCollection";
import { useAuth } from "@/components/auth-provider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SET_COLORS, SET_BACKGROUNDS, SET_ACCENT } from "@/lib/sets";
import { cn } from "@/lib/utils";

export default function Sets() {
  const { data: sets = [], isLoading: setsLoading, isError } = useSets();
  const { data: allCards = [], isLoading: cardsLoading } = useAllCards();
  const { collection } = useCollection();
  const { user } = useAuth();

  const isLoading = setsLoading || cardsLoading;

  const ownedPerSet = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!user) return counts;
    
    const cardIdToSet: Record<string, string> = {};
    for (const card of allCards) {
      cardIdToSet[card.id] = card.expansion;
    }
    
    for (const cardId in collection) {
      const entry = collection[cardId];
      if (entry.normal > 0 || entry.foil > 0) {
        const setId = cardIdToSet[cardId];
        if (setId) {
          counts[setId] = (counts[setId] || 0) + 1;
        }
      }
    }
    return counts;
  }, [collection, allCards, user]);

  const mainSets = sets.filter(set => !set.isPromo);
  const promoSets = sets.filter(set => set.isPromo);

  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
          <BookOpen className="w-3 h-3" /> Expansion Library
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight mb-6">
          The Great Illuminary
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-sans leading-relaxed">
          Explore the chapters of Disney Lorcana. Track your collection progress, discover new glimmers, and master every set released in the inklands.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-16">
          {[1, 2, 4, 4].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-3xl border-dashed">
          <p className="text-destructive font-bold mb-4">Failed to load the Great Illuminary.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Main Chapters</h2>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {mainSets.map((set, i) => (
              <SetCard key={set.id} set={set} i={i} ownedCount={ownedPerSet[set.id] || 0} showProgress={!!user} />
            ))}
          </div>

          {promoSets.length > 0 && (
            <div className="pt-16 border-t">
              <div className="flex items-center gap-4 mb-10">
                <h2 className="font-serif text-3xl font-bold tracking-tight">Special Collections</h2>
                <div className="flex-1 h-px bg-border/50" />
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-3">
                {promoSets.map((set, i) => (
                  <SetCard key={set.id} set={set} i={i} ownedCount={ownedPerSet[set.id] || 0} showProgress={!!user} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SetCard({ set, i, ownedCount, showProgress }: { set: { id: string; name: string; setNum: number; count: number; releasedAt?: string; isPromo?: boolean }, i: number, ownedCount: number, showProgress: boolean }) {
  const colorClass = SET_COLORS[set.id] ?? "from-slate-500/10 to-gray-500/10";
  const accent = SET_ACCENT[set.id] ?? "#e5c07b";
  const bgImage = SET_BACKGROUNDS[set.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(i * 0.1, 0.3) }}
    >
      <Link href={`/sets/${set.id}`}>
        <div className="group relative h-72 rounded-[2rem] border bg-card hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col">
          {/* Background Image Layer */}
          {bgImage && (
            <div 
              className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
              style={{ 
                backgroundImage: `url(${bgImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover'
              }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className={cn("absolute inset-0 z-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-80", colorClass)} />

          <div className="relative z-10 p-8 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="min-w-0">
                <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight group-hover:text-primary transition-colors mb-2 truncate">
                  {set.name}
                </h3>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {set.releasedAt ? new Date(set.releasedAt).getFullYear() : "Release TBD"}
                  </span>
                  <span className="opacity-30">|</span>
                  <span>{set.count} Cards</span>
                </div>
              </div>
              <div 
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md"
                style={{ color: accent, borderColor: `${accent}44`, backgroundColor: `${accent}11` }}
              >
                {set.isPromo ? "Special" : `Chapter ${set.setNum}`}
              </div>
            </div>

            <div className="mt-auto">
               {showProgress && set.count > 0 ? (
                 <div className="space-y-3 pt-6 border-t border-white/10">
                   <div className="flex justify-between items-end">
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50 mb-0.5">Your Collection</span>
                       <span className="text-sm font-bold tabular-nums">{ownedCount} / {set.count}</span>
                     </div>
                     <span className="text-xl font-bold tabular-nums" style={{ color: accent }}>{Math.round((ownedCount / set.count) * 100)}%</span>
                   </div>
                   <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(ownedCount / set.count) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: accent }} 
                     />
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center justify-between pt-6 border-t border-white/10 group/btn">
                   <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Explore Expansion</span>
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
