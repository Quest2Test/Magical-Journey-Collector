import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CardDisplay } from "@/components/ui/card-display";
import { RefreshCw, Plus, RotateCcw, Shuffle } from "lucide-react";
import { Card } from "@/data/cards";
import { SavedDeckEntry } from "@/hooks/useDecks";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: SavedDeckEntry[];
  deckName: string;
}

export function DeckHandSimulator({ open, onOpenChange, entries, deckName }: Props) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [drawnCount, setDrawnCount] = useState(0);

  // Flatten entries into a single deck array
  const fullDeck = useMemo(() => {
    const d: Card[] = [];
    entries.forEach(entry => {
      for (let i = 0; i < entry.qty; i++) {
        d.push(entry.card);
      }
    });
    return d;
  }, [entries]);

  const shuffle = useCallback((array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const reset = useCallback(() => {
    const shuffled = shuffle(fullDeck);
    const initialHand = shuffled.slice(0, 7);
    const remainingDeck = shuffled.slice(7);
    setHand(initialHand);
    setDeck(remainingDeck);
    setDrawnCount(7);
  }, [fullDeck, shuffle]);

  // Initial reset when opening
  useMemo(() => {
    if (open && hand.length === 0) {
      reset();
    }
  }, [open, hand.length, reset]);

  const drawOne = useCallback(() => {
    if (deck.length === 0) return;
    const [card, ...remaining] = deck;
    setHand(prev => [...prev, card]);
    setDeck(remaining);
    setDrawnCount(prev => prev + 1);
  }, [deck]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader className="p-6 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
                <Shuffle className="w-6 h-6 text-primary" /> Test Draw: {deckName}
              </DialogTitle>
              <DialogDescription>
                Simulate your opening hand and early turns to test consistency.
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              <Button size="sm" onClick={drawOne} disabled={deck.length === 0} className="gap-2 bg-primary shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Draw One
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <AnimatePresence mode="popLayout">
              {hand.map((card, i) => (
                <motion.div
                  key={`${card.id}-${i}`}
                  initial={{ opacity: 0, y: 50, rotate: -5, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", damping: 15, stiffness: 100, delay: i * 0.05 }}
                  className="relative group"
                >
                  <div className="absolute -top-3 -left-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-20 shadow-md">
                    {i + 1}
                  </div>
                  <CardDisplay card={card} hideInfo className="w-full shadow-2xl rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2" />
                  {i === 6 && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                      Opening Hand
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {deck.length > 0 && (
              <div className="hidden lg:flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-xl aspect-[2.5/3.5] bg-primary/5 group hover:bg-primary/10 transition-colors cursor-pointer" onClick={drawOne}>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                   <Plus className="w-6 h-6 text-primary" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{deck.length} Remaining</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold font-serif">{drawnCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Cards Drawn</p>
            </div>
            <div className="text-center border-l pl-6">
              <p className="text-xl font-bold font-serif">{deck.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Remaining</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
             <RefreshCw className="w-3 h-3 animate-spin-slow" /> Shuffled automatically on reset
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
