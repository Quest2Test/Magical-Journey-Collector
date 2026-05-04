import { useParams, Link } from "wouter";
import { useDecks } from "@/hooks/useDecks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Edit, ExternalLink, PlaySquare, TrendingUp, Info } from "lucide-react";
import { motion } from "framer-motion";
import { CardDisplay, inkHexColors, inkGradients } from "@/components/ui/card-display";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { useMemo } from "react";

import { useAllCards } from "@/hooks/useCards";
import { getHydratedStarterDecks } from "@/lib/starter-decks-hydration";

export default function DeckDetail() {
  const { id } = useParams();
  const { decks, isLoading: loadingDecks } = useDecks();
  const { data: allCards = [], isLoading: loadingCards } = useAllCards();
  const { formatPrice } = useCurrency();

  const deck = useMemo(() => {
    // 1. Check user decks
    const userDeck = decks.find(d => d.id === id);
    if (userDeck) return userDeck;

    // 2. Check starter decks if ID starts with 'starter-'
    if (id?.startsWith('starter-') && allCards.length > 0) {
      const starters = getHydratedStarterDecks(allCards);
      return starters.find(s => s.id === id);
    }

    return null;
  }, [decks, id, allCards]);

  const isLoading = loadingDecks || (id?.startsWith('starter-') && loadingCards);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Deck Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">This deck might have been moved or deleted.</p>
        <Link href="/decks">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to My Decks</Button>
        </Link>
      </div>
    );
  }

  const inkHexes = deck.inkColors.map(ink => inkHexColors[ink] ?? "#888");
  const bannerGradient = inkHexes.length >= 2
    ? `linear-gradient(135deg, ${inkHexes[0]}22 0%, ${inkHexes[1]}22 100%)`
    : `linear-gradient(135deg, ${inkHexes[0] ?? "#88888822"} 0%, transparent 100%)`;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumbs */}
      <Link href="/decks" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Decks
      </Link>

      {/* Header Section */}
      <div className="relative rounded-3xl border bg-card overflow-hidden mb-10 shadow-sm">
        <div className="absolute inset-0 opacity-10" style={{ background: bannerGradient }} />
        <div className="relative p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              {deck.inkColors.map(ink => (
                <div
                  key={ink}
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-sm"
                  style={{ backgroundColor: inkHexColors[ink] ?? "#888", color: "white" }}
                >
                  {ink}
                </div>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">{deck.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><PlaySquare className="w-4 h-4" /> {deck.totalCards} Cards</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> {formatPrice(deck.totalValue)} Value</span>
              <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> {deck.format} Format</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/builder?edit=${deck.id}`}>
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/20">
                <Edit className="w-4 h-4" /> Modify in Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Deck Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {deck.entries.map((entry, idx) => (
          <motion.div
            key={entry.card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="relative"
          >
            <CardDisplay card={entry.card} returnTo={`/decks/${deck.id}`} />
            <div className="absolute top-2 right-2 z-30">
              <div className="w-8 h-8 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white shadow-xl">
                ×{entry.qty}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State Fallback (shouldn't happen) */}
      {deck.entries.length === 0 && (
        <div className="text-center py-20 border border-dashed rounded-3xl text-muted-foreground">
          <p>This deck has no cards yet.</p>
          <Link href={`/builder?edit=${deck.id}`} className="mt-4 inline-block">
            <Button variant="outline" className="gap-2"><Edit className="w-4 h-4" /> Add Cards</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
