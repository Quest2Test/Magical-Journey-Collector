import { useState, useMemo } from "react";
import { Card } from "@/data/cards";
import { Collection } from "@/hooks/useCollection";
import { CardDisplay, inkHexColors } from "@/components/ui/card-display";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SET_ACCENT } from "@/lib/sets";

interface BinderViewProps {
  setId: string;
  setName?: string;
  cards: Card[];
  collection: Collection;
}

const CARDS_PER_PAGE = 9;

export function BinderView({ setId, setName, cards, collection }: BinderViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const accentColor = SET_ACCENT[setId] || "#6366f1";

  const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);

  const paginatedCards = useMemo(() => {
    const start = currentPage * CARDS_PER_PAGE;
    return cards.slice(start, start + CARDS_PER_PAGE);
  }, [cards, currentPage]);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
      {/* Binder Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/40 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-2xl bg-card border shadow-lg"
            style={{ borderColor: `${accentColor}44`, boxShadow: `0 10px 30px -10px ${accentColor}22` }}
          >
            <BookOpen className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight">{setName || "Digital Collection Album"}</h2>
            <p className="text-sm text-muted-foreground">Set #{setId} Checklist • 9-Pocket View</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-xl border">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="h-9 w-9"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="px-4 text-xs font-black uppercase tracking-widest text-muted-foreground/80 flex flex-col items-center">
             <span>Page</span>
             <span className="text-foreground">{currentPage + 1} / {totalPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="h-9 w-9"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* The Binder Page */}
      <div className="relative group perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20, rotateY: 5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -20, rotateY: -5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-3 gap-3 md:gap-4 p-6 md:p-8 rounded-r-3xl rounded-l-lg bg-slate-950/90 border border-slate-800 shadow-2xl relative overflow-hidden ml-8"
          >
            {/* Binder Rings Aesthetic */}
            <div className="absolute left-0 top-0 bottom-0 w-8 -ml-8 flex flex-col justify-around py-12 pointer-events-none">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="w-10 h-3 bg-gradient-to-r from-slate-700 to-slate-400 rounded-full border border-slate-900 shadow-lg -translate-x-2" />
               ))}
            </div>

            {/* Binder Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            
            {/* 3x3 Grid Slots */}
            {paginatedCards.map((card, idx) => {
              const entry = collection[card.id];
              const isOwned = !!entry && (entry.normal > 0 || entry.foil > 0);
              
              return (
                <div key={card.id || idx} className="relative group/card">
                  {/* Slot Number */}
                  <div className="absolute -top-2 -left-2 text-[8px] font-black tracking-widest text-slate-700 z-10 uppercase">
                    {card.cardNum || (currentPage * CARDS_PER_PAGE + idx + 1)}
                  </div>

                  {/* The Card */}
                  <div className={cn(
                    "relative transition-all duration-500 transform-gpu",
                    !isOwned ? "grayscale brightness-[0.2] opacity-40" : "shadow-xl"
                  )}>
                    <CardDisplay 
                      card={card} 
                      hideInfo 
                      ownedCount={entry?.normal ? entry.normal + entry.foil : undefined}
                      className={cn("w-full transition-transform duration-300 group-hover/card:scale-110 group-hover/card:z-20", !isOwned && "pointer-events-none")}
                    />
                    
                    {!isOwned && (
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-center z-10 pointer-events-none">
                         <span className="text-[8px] font-black text-white/5 uppercase tracking-[0.2em]">
                           Empty
                         </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty slots if last page is partial */}
            {Array.from({ length: Math.max(0, CARDS_PER_PAGE - paginatedCards.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-[2.5/3.5] bg-slate-900/60 rounded-lg border border-slate-800/50 flex items-center justify-center">
                 <Layers className="w-6 h-6 text-slate-800 opacity-20" />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-6 mt-12 text-muted-foreground opacity-60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
          <span className="text-[9px] font-black uppercase tracking-widest">Missing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-[9px] font-black uppercase tracking-widest">Collected</span>
        </div>
      </div>
    </div>
  );
}
