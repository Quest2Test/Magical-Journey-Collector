import { useState, useEffect } from "react";
import { Card } from "@/data/cards";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, RefreshCw, Undo2, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MulliganSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckCards: { card: Card; qty: number }[];
  deckName: string;
}

export function MulliganSimulator({ open, onOpenChange, deckCards, deckName }: MulliganSimulatorProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [selectedForMulligan, setSelectedForMulligan] = useState<Set<number>>(new Set());
  const [hasMulliganed, setHasMulliganed] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // Flatten deck based on quantities
  const initializeDeck = () => {
    const flattened: Card[] = [];
    deckCards.forEach(({ card, qty }) => {
      for (let i = 0; i < qty; i++) flattened.push(card);
    });
    return flattened;
  };

  const shuffleAndDraw = () => {
    setIsShuffling(true);
    setHasMulliganed(false);
    setSelectedForMulligan(new Set());
    
    setTimeout(() => {
      const fullDeck = initializeDeck();
      // Fisher-Yates Shuffle
      for (let i = fullDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
      }
      
      setDeck(fullDeck.slice(7));
      setHand(fullDeck.slice(0, 7));
      setIsShuffling(false);
    }, 600);
  };

  useEffect(() => {
    if (open) {
      shuffleAndDraw();
    }
  }, [open]);

  const toggleSelect = (index: number) => {
    if (hasMulliganed) return;
    const next = new Set(selectedForMulligan);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedForMulligan(next);
  };

  const performMulligan = () => {
    if (selectedForMulligan.size === 0) {
      setHasMulliganed(true);
      return;
    }

    const cardsToKeep = hand.filter((_, i) => !selectedForMulligan.has(i));
    const numToDraw = selectedForMulligan.size;
    
    // Draw from top of remaining deck
    const newCards = deck.slice(0, numToDraw);
    const remainingDeck = deck.slice(numToDraw);
    
    setHand([...cardsToKeep, ...newCards]);
    setDeck(remainingDeck);
    setHasMulliganed(true);
    setSelectedForMulligan(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-zinc-900/50">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-serif font-bold">Mulligan Simulator</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Testing: <span className="text-primary font-semibold">{deckName}</span>
                </DialogDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={shuffleAndDraw}
                disabled={isShuffling}
                className="gap-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
              >
                <RefreshCw className={cn("w-4 h-4", isShuffling && "animate-spin")} />
                New Hand
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
          <AnimatePresence mode="wait">
            {isShuffling ? (
              <motion.div 
                key="shuffling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-24 h-32 border-2 border-primary/20 rounded-xl flex items-center justify-center">
                   <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl" />
                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <p className="text-zinc-500 font-medium animate-pulse">Shuffling deck...</p>
              </motion.div>
            ) : (
              <div className="w-full space-y-10">
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {hand.map((card, i) => (
                    <motion.div
                      key={`${card.id}-${i}`}
                      initial={{ opacity: 0, y: 20, rotate: -5 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative group"
                    >
                      <div 
                        onClick={() => toggleSelect(i)}
                        className={cn(
                          "relative aspect-[2.5/3.5] rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                          selectedForMulligan.has(i) ? "border-amber-500 ring-4 ring-amber-500/20 scale-95 opacity-60" : "border-white/10 hover:border-white/40",
                          hasMulliganed && "cursor-default"
                        )}
                      >
                        <img 
                          src={card.image || card.thumbnail} 
                          alt={card.name} 
                          className="w-full h-full object-cover"
                        />
                        {selectedForMulligan.has(i) && (
                          <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                            <Undo2 className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-[10px] text-zinc-500 font-bold truncate text-center uppercase tracking-tighter">
                        {card.name}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                  {!hasMulliganed ? (
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Select cards to put back, then click Mulligan.
                      </p>
                      <Button 
                        size="lg" 
                        onClick={performMulligan}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-12 rounded-full font-bold shadow-lg shadow-primary/20 gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Mulligan {selectedForMulligan.size > 0 ? selectedForMulligan.size : "0"} Cards
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-emerald-500 font-bold flex items-center gap-2 mb-2">
                         ✓ Hand Finalized
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={shuffleAndDraw}
                        className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-2 rounded-full"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Test Another Hand
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-zinc-900/80 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-zinc-500">
           <span>{deck.length} cards remaining in deck</span>
           <span>Standard Lorcana Rules Applied</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
