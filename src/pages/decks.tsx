import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Sword, Trash2, PlaySquare, BookOpen, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecks, SavedDeck } from "@/hooks/useDecks";
import { inkHexColors } from "@/components/ui/card-display";
import { cn } from "@/lib/utils";
import { STARTER_DECKS, StarterDeckDefinition } from "@/data/starter-decks";
import { getDeckArchetype } from "@/lib/card-utils";
import { useAllCards } from "@/hooks/useCards";

const FORMAT_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  Core: { label: "Core Constructed", bg: "bg-blue-500/15", text: "text-blue-400" },
  Infinity: { label: "Infinity", bg: "bg-violet-500/15", text: "text-violet-400" },
  Any: { label: "Open", bg: "bg-muted", text: "text-muted-foreground" },
};

import { getHydratedStarterDecks } from "@/lib/starter-decks-hydration";

export default function DecksBrowse() {
  const [search, setSearch] = useState("");
  const { decks, deleteDeck, isLoading: loadingDecks } = useDecks();
  const [showStarters, setShowStarters] = useState(decks.length === 0);
  const { data: allCards = [], isLoading: loadingCards } = useAllCards();

  // Hydrate starter decks
  const hydratedStarters = useMemo(() => {
    if (loadingCards || allCards.length === 0) return [];
    return getHydratedStarterDecks(allCards);
  }, [allCards, loadingCards]);

  // Group starters by set
  const startersBySet = useMemo(() => {
    const groups: Record<string, typeof hydratedStarters> = {};
    hydratedStarters.forEach(s => {
      if (!groups[s.setName]) groups[s.setName] = [];
      groups[s.setName].push(s);
    });
    return groups;
  }, [hydratedStarters]);

  const filteredDecks = decks.filter(d => {
    const archetypeText = d.customArchetype || (d.entries?.length > 0 ? getDeckArchetype(d.entries) : "");
    return d.name.toLowerCase().includes(search.toLowerCase()) ||
           archetypeText.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Sword className="w-8 h-8 text-primary" /> My Decks
          </h1>
          <p className="text-muted-foreground">Your saved deck lists and official starters.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/builder">
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Deck</Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-12">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your decks..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>


      {/* My Decks Section */}
      <div className="flex items-center gap-3 mb-8">
        <Sword className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-serif font-bold tracking-tight">Personal Collection</h2>
      </div>

      {/* Empty State / Loading State */}
      {loadingDecks ? (
        <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Syncing with Inkwell...</p>
        </div>
      ) : decks.length === 0 && (
        <div className="border border-dashed rounded-2xl py-20 flex flex-col items-center gap-4 text-muted-foreground">
          <Sword className="w-12 h-12 opacity-25" />
          <div className="text-center">
            <p className="font-semibold text-lg mb-1">No personal decks saved yet</p>
            <p className="text-sm">Head to the Deck Builder, build your list, and hit Save.</p>
          </div>
          <Link href="/builder">
            <Button variant="outline" className="mt-2 gap-2">
              <Plus className="w-4 h-4" /> Build a Deck
            </Button>
          </Link>
        </div>
      )}

      {/* No search results */}
      {decks.length > 0 && filteredDecks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
          No decks match &ldquo;{search}&rdquo;
        </div>
      )}

      {/* Deck Grid */}
      {filteredDecks.length > 0 && (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDecks.map((deck, i) => (
              <SavedDeckCard key={deck.id} deck={deck} i={i} onDelete={() => deleteDeck(deck.id)} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Starter Decks Section (Moved & Toggleable) */}
      {hydratedStarters.length > 0 && (
        <section className="mt-20 pt-12 border-t">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-6 h-auto hover:bg-primary/5 group"
            onClick={() => setShowStarters(!showStarters)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-serif font-bold tracking-tight">Official Starter Decks</h2>
                <p className="text-sm text-muted-foreground font-normal">Standard pre-built lists from all Lorcana sets</p>
              </div>
            </div>
            <ChevronDown className={cn(
              "w-6 h-6 text-muted-foreground transition-transform duration-300",
              showStarters && "rotate-180"
            )} />
          </Button>

          <AnimatePresence>
            {showStarters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-12 space-y-16">
                  {Object.entries(startersBySet).map(([setName, setDecks]) => (
                    <div key={setName} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-6 border-l-2 border-primary/40 pl-4">
                        {setName}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {setDecks.map((deck, i) => (
                          <SavedDeckCard key={deck.id} deck={deck} i={i} onDelete={() => { }} isOfficial />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}

function SavedDeckCard({ deck, i, onDelete, isOfficial }: { deck: SavedDeck; i: number; onDelete: () => void; isOfficial?: boolean }) {
  const fmt = FORMAT_STYLES[deck.format] ?? FORMAT_STYLES.Any;
  const updatedDate = new Date(deck.updatedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  // Build gradient from ink colours
  const inkHexes = deck.inkColors.map(ink => inkHexColors[ink] ?? "#888");
  const bannerGradient = inkHexes.length >= 2
    ? `linear-gradient(135deg, ${inkHexes[0]}55 0%, ${inkHexes[1]}55 100%)`
    : `linear-gradient(135deg, ${inkHexes[0] ?? "#88888855"} 0%, transparent 100%)`;

  // Top 3 cards by qty
  const topCards = [...deck.entries]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: i * 0.04 }}
      className="group relative border rounded-2xl bg-card hover:border-primary/40 hover:shadow-xl transition-all flex flex-col overflow-hidden"
    >
      <Link href={`/decks/${deck.id}`}>
        <div className="cursor-pointer">
          {/* Gradient banner */}
          <div
            className="relative h-36 w-full flex items-end px-4 pb-3 shrink-0 overflow-hidden"
            style={{ background: bannerGradient }}
          >
            {/* Subtle noise overlay */}
            <div className="absolute inset-0 bg-background/10" />

            {/* Top 3 card art previews — stacked/fanned */}
            <div className="absolute right-4 bottom-0 flex items-end gap-[-8px]">
              {topCards.map((entry, idx) => {
                const rotate = idx === 0 ? "-rotate-6" : idx === 2 ? "rotate-6" : "rotate-0";
                const zIndex = idx === 1 ? "z-10" : "z-0";
                return (
                  <div
                    key={entry.card.id}
                    className={`w-20 h-28 rounded-lg border border-white/20 shadow-xl overflow-hidden bg-muted/50 ${rotate} ${zIndex} -mb-2 transition-transform group-hover:translate-y-[-4px]`}
                    style={{ transitionDelay: `${idx * 30}ms`, marginLeft: idx > 0 ? "-12px" : "0" }}
                    title={entry.card.name}
                  >
                    {entry.card.image ? (
                      <img
                        src={entry.card.image}
                        alt={entry.card.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <img src="/LCardBack.png" alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ink colour icons */}
            <div className="relative z-10 flex gap-2 items-center">
              {deck.inkColors.map(ink => (
                <div
                  key={ink}
                  className="w-6 h-6 rounded-full border-2 border-white/50 shadow-md"
                  style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] ?? "#888" }}
                  title={ink}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-3 p-4 flex-1">
            <div>
              {(deck.customArchetype || deck.entries?.length > 0) && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    {deck.customArchetype || getDeckArchetype(deck.entries)}
                  </span>
                </div>
              )}
              <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-0.5">{deck.name}</h3>
              <p className="text-xs text-muted-foreground">{isOfficial ? "Official Starter List" : `Last saved ${updatedDate}`}</p>
            </div>

            {/* Top card names */}
            {topCards.length > 0 && (
              <div className="space-y-1">
                {topCards.map(entry => (
                  <div key={entry.card.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[170px] flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 inline-block"
                        style={{ backgroundColor: inkHexColors[entry.card.inkColor as keyof typeof inkHexColors] ?? "#888" }}
                      />
                      {entry.card.name}{entry.card.subtitle ? ` – ${entry.card.subtitle}` : ""}
                    </span>
                    <span className="font-bold text-muted-foreground/70 shrink-0 ml-2">×{entry.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="px-4 pb-4 pt-0 flex items-center justify-between text-xs border-t border-border/40 mt-1 pt-3">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1">
            <PlaySquare className="w-3 h-3" /> {deck.totalCards} cards
          </span>
        </div>
      </div>

      {/* Delete button (hidden for official) */}
      {!isOfficial && (
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center bg-background/60 backdrop-blur hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
          title="Delete deck"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}