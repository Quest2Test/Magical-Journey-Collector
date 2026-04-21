import { useCardById } from "@/hooks/useCards";
import { ANNOUNCED_CARDS } from "@/data/announced-cards";
import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Database, Shield, Sword } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { inkHexColors, CardDisplay } from "@/components/ui/card-display";

interface ArticleCardFeatureProps {
   cardId: string;
   align?: 'left' | 'right';
}

export const ArticleCardFeature = memo(({ cardId, align = 'left' }: ArticleCardFeatureProps) => {
   const { data: apiCard, isLoading } = useCardById(cardId);
   const announcedCard = ANNOUNCED_CARDS.find(c => c.id === cardId);
   const card = apiCard || announcedCard;

   if (isLoading) return <div className="w-full h-80 bg-slate-950/50 animate-pulse rounded-3xl border border-white/5 my-10" />;
   if (!card) return null;

   const accentColor = inkHexColors[card.inkColor] || "#6366f1";

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         className={cn(
            "not-prose my-8 relative flex flex-col md:flex-row gap-5 items-center bg-slate-900/40 border border-white/5 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md group",
            align === 'right' && "md:flex-row-reverse"
         )}
      >
         {/* Background ambient glow matching the card's ink color */}
         <div 
           className="absolute inset-0 opacity-10 blur-2xl pointer-events-none rounded-2xl transition-opacity duration-700 group-hover:opacity-20"
           style={{ backgroundColor: accentColor }}
         />

         {/* 1. Left Panel: High-Fidelity Card */}
         <div className="w-[50%] max-w-[160px] md:w-40 lg:w-48 shrink-0 perspective-1000 relative z-10 mx-auto md:mx-0">
            <CardDisplay card={card} hideInfo={true} />
         </div>

         {/* 2. Right Panel: Compact Editorial Typography */}
         <div className="flex-1 w-full space-y-4 relative z-10">
            <div className="space-y-2 pb-4 border-b border-white/10">
               <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-slate-950/50 border-white/10 uppercase tracking-widest text-[8px] font-bold py-0 h-5" style={{ color: accentColor }}>
                     {card.expansion || card.set}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">#{card.cardNum || "???"}</span>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">{card.rarity}</span>
               </div>
               
               <div>
                 <h3 className="text-2xl md:text-3xl font-serif font-black text-white leading-none tracking-tight">
                    {card.name}
                 </h3>
                 {card.subtitle && (
                    <p className="text-sm md:text-base font-serif text-slate-400 italic mt-1">
                       {card.subtitle}
                    </p>
                 )}
               </div>
            </div>

            {/* Quick Stats Pills - Slimmed */}
            <div className="flex flex-wrap gap-2">
                {card.inkColor && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/50 border border-white/5 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: accentColor }} />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{card.inkColor}</span>
                  </div>
                )}
                {(card.strength !== undefined) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 shadow-inner">
                      <Sword className="h-3 w-3 text-red-500" />
                      <span className="text-[10px] font-bold text-red-100">{card.strength} STR</span>
                    </div>
                )}
                {(card.willpower !== undefined) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-inner">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-100">{card.willpower} WP</span>
                    </div>
                )}
                {(card.lore !== undefined) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                      <Database className="h-3 w-3 text-indigo-400" />
                      <span className="text-[10px] font-bold text-indigo-100">{card.lore} Lore</span>
                    </div>
                )}
            </div>

            {/* Excerpt if available */}
            {card.bodyText && (
               <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl opacity-80 border-l-[1.5px] border-white/20 pl-3 italic bg-white/5 py-1.5 rounded-r-lg line-clamp-3">
                  "{card.bodyText}"
               </p>
            )}

            {/* CTA */}
            <div className="pt-2">
               <Link href={`/cards/${card.id}`}>
                  <Button
                     size="sm"
                     style={{ backgroundColor: accentColor }}
                     className="px-5 h-8 rounded-lg font-bold text-[11px] text-white hover:brightness-110 transition-all shadow-md shadow-black/20"
                  >
                     <span className="flex items-center gap-1.5">
                        View Analysis
                        <ExternalLink className="h-3 w-3" />
                     </span>
                  </Button>
               </Link>
            </div>
         </div>
      </motion.div>
   );
});
