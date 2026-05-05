import { useParams, Link, useLocation } from "wouter";
import { useDecks } from "@/hooks/useDecks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Edit, ExternalLink, PlaySquare, TrendingUp, Info, LayoutGrid, List as ListIcon, Library, Sparkles, Download, Layers, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { CardDisplay, inkHexColors, inkGradients, getInkLogo } from "@/components/ui/card-display";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { useState, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { useCollection } from "@/hooks/useCollection";
import { getBaseCardValue } from "@/lib/pricing";
import { getDisplayType } from "@/lib/card-utils";
import { Progress } from "@/components/ui/progress";
import { Card as CardContainer, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useAllCards } from "@/hooks/useCards";
import { getHydratedStarterDecks } from "@/lib/starter-decks-hydration";
import { usePublicDecks } from "@/hooks/usePublicDecks";

export default function DeckDetail() {
  const { id } = useParams();
  const [location] = useLocation();
  const isPublicRoute = location.includes("/decks/public/");

  const { decks, isLoading: loadingDecks } = useDecks();
  const { data: allCards = [], isLoading: loadingCards } = useAllCards();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { collection, getEntry } = useCollection();
  const { publicDecks, publishDeck, isLoading: loadingPublic, isPublishing } = usePublicDecks();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [groupMode, setGroupMode] = useState<"type" | "cost">("type");

  const deck = useMemo(() => {
    if (isPublicRoute) {
      return publicDecks.find(d => d.id === id);
    }

    // 1. Check user decks
    const userDeck = decks.find(d => d.id === id);
    if (userDeck) return userDeck;

    // 2. Check starter decks if ID starts with 'starter-'
    if (id?.startsWith('starter-') && allCards.length > 0) {
      const starters = getHydratedStarterDecks(allCards);
      return starters.find(s => s.id === id);
    }

    return null;
  }, [decks, publicDecks, id, allCards, isPublicRoute]);

  const analysis = useMemo(() => {
    if (!deck) return null;

    let totalOwned = 0;
    let totalRequired = 0;
    let missingValue = 0;

    const cardsInDeck = deck.entries.map(entry => {
      const owned = getEntry(entry.card.id);
      const totalOwnedCount = owned.normal + owned.foil;
      const missingQty = Math.max(0, entry.qty - totalOwnedCount);
      const price = getBaseCardValue(entry.card);

      totalOwned += Math.min(entry.qty, totalOwnedCount);
      totalRequired += entry.qty;
      missingValue += missingQty * price;

      return {
        ...entry,
        ownedQty: Math.min(entry.qty, totalOwnedCount),
        missingQty,
        price
      };
    });

    const completionPct = totalRequired > 0 ? (totalOwned / totalRequired) * 100 : 0;

    // Grouping
    const grouped = cardsInDeck.reduce((acc, entry) => {
      let key = "Other";
      if (groupMode === "type") {
        key = getDisplayType(entry.card) + "s";
      } else {
        key = `Cost ${entry.card.cost}`;
      }
      if (!acc[key]) acc[key] = { cards: [], count: 0 };
      acc[key].cards.push(entry);
      acc[key].count += entry.qty;
      return acc;
    }, {} as Record<string, { cards: typeof cardsInDeck, count: number }>);

    // Sorting groups
    let sortedKeys = Object.keys(grouped);
    if (groupMode === "type") {
      const order = ["Characters", "Actions", "Items", "Locations"];
      sortedKeys = sortedKeys.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    } else {
      sortedKeys = sortedKeys.sort((a, b) => parseInt(a.replace("Cost ", "")) - parseInt(b.replace("Cost ", "")));
    }

    // Sort cards within groups by cost
    sortedKeys.forEach(key => {
      grouped[key].cards.sort((a, b) => a.card.cost - b.card.cost || a.card.name.localeCompare(b.card.name));
    });

    return {
      cardsInDeck,
      totalOwned,
      totalRequired,
      missingValue,
      completionPct,
      grouped,
      sortedKeys
    };
  }, [deck, collection, getEntry, groupMode]);

  const isLoading = loadingDecks || (id?.startsWith('starter-') && loadingCards) || (isPublicRoute && loadingPublic);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deck || !analysis) {
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

  const handleBuyMissing = () => {
    const affiliateId = import.meta.env.VITE_TCGPLAYER_AFFILIATE_ID || "";
    const missingLines = analysis.cardsInDeck
      .filter(c => c.missingQty > 0)
      .map(entry => `${entry.missingQty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}`)
      .join("||");
    if (missingLines) {
      window.open(`https://tcgplayer.pxf.io/c/${affiliateId}/1830156/21018?u=https://www.tcgplayer.com/massentry?productline=Lorcana TCG&c=${encodeURIComponent(missingLines)}`, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumbs */}
      <Link href="/decks" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to My Decks
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
          {/* Header Section */}
          <div className="relative rounded-3xl border bg-card overflow-hidden shadow-sm h-full flex flex-col justify-center">
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
                {user && decks.some(d => d.id === deck.id) && !isPublicRoute && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2 shadow-lg"
                    onClick={() => publishDeck(deck, user.user_metadata?.username || user.email?.split('@')[0] || "Anonymous")}
                    disabled={isPublishing}
                  >
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-primary" />}
                    Share Publicly
                  </Button>
                )}
                {isPublicRoute ? (
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/20" asChild>
                     <Link href={`/builder?import=${deck.id}&source=public`}>
                       <Layers className="w-4 h-4" /> Clone to My Decks
                     </Link>
                  </Button>
                ) : (
                  <Link href={`/builder?edit=${deck.id}`}>
                    <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/20">
                      <Edit className="w-4 h-4" /> Modify in Builder
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collection Snapshot Card */}
        <CardContainer className="border-primary/20 bg-primary/[0.02] shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <TrendingUp className="w-32 h-32" />
          </div>
          <CardHeader className="pb-4">
             <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-4 h-4 text-amber-500" /> Collection Readiness
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {user ? (
              <>
                <div className="space-y-2">
                   <div className="flex justify-between text-sm font-bold">
                      <span>{analysis.totalOwned} / {analysis.totalRequired} Cards Owned</span>
                      <span className="text-primary">{analysis.completionPct.toFixed(1)}%</span>
                   </div>
                   <Progress value={analysis.completionPct} className="h-2.5" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none">Market Value</p>
                      <p className="text-lg font-bold">{formatPrice(deck.totalValue)}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none">Cost to Finish</p>
                      <p className="text-lg font-bold text-amber-500">{formatPrice(analysis.missingValue)}</p>
                   </div>
                </div>

                {analysis.missingValue > 0 && (
                  <Button onClick={handleBuyMissing} size="sm" variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                    <ExternalLink className="w-4 h-4" /> Quick Add Missing to TCGPlayer
                  </Button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Library className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Track your collection</p>
                  <p className="text-xs text-muted-foreground">Sign in to see your readiness for this deck.</p>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link href="/login">Sign In to Lorbound</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </CardContainer>
      </div>

      {/* Deck Display Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6">
        <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
           <Library className="w-6 h-6 text-primary" /> Decklist
        </h2>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 border rounded-md p-0.5 bg-muted/50">
            <button
              onClick={() => setGroupMode("type")}
              className={cn("px-2.5 py-1 text-xs font-bold rounded-sm transition-colors", groupMode === "type" ? "bg-background shadow-sm text-foreground" : "hover:text-foreground")}
            >
              By Type
            </button>
            <button
              onClick={() => setGroupMode("cost")}
              className={cn("px-2.5 py-1 text-xs font-bold rounded-sm transition-colors", groupMode === "cost" ? "bg-background shadow-sm text-foreground" : "hover:text-foreground")}
            >
              By Cost
            </button>
          </div>
          <div className="flex items-center border rounded-md p-0.5 bg-muted/50">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-sm transition-colors", viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "hover:text-foreground")}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-sm transition-colors", viewMode === "list" ? "bg-background shadow-sm text-foreground" : "hover:text-foreground")}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Deck Content */}
      <div className={cn("gap-8", viewMode === "list" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col")}>
        {analysis.sortedKeys.map((groupKey) => {
          const group = analysis.grouped[groupKey];
          if (!group || group.cards.length === 0) return null;

          return (
            <div key={groupKey} className="mb-8">
              <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <h3 className="text-lg font-serif font-bold">{groupKey}</h3>
                <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {group.count}
                </span>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {group.cards.map((entry, idx) => (
                    <motion.div
                      key={entry.card.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="relative group/card"
                    >
                      <CardDisplay card={entry.card} returnTo={`/decks/${deck.id}`} className={cn(
                        "transition-opacity",
                        user && entry.ownedQty === 0 && "opacity-50 grayscale-[0.5]"
                      )} />
                      
                      {user ? (
                        <>
                          <div className="absolute -top-2 -right-2 min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-lg bg-card border border-primary/20 shadow-lg z-10 font-bold text-xs">
                             {entry.ownedQty} <span className="mx-0.5 opacity-40">/</span> {entry.qty}
                          </div>
                          {entry.missingQty > 0 && (
                            <div className="absolute -bottom-2 -left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg z-10">
                              Missing {entry.missingQty}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute -top-2 -right-2 min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg bg-card border border-primary/20 shadow-lg z-10 font-bold text-xs">
                           x{entry.qty}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {group.cards.map((entry) => (
                    <Link key={entry.card.id} href={`/cards/${encodeURIComponent(entry.card.id)}?from=/decks/${deck.id}`}>
                      <div className={cn(
                        "flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-secondary/40 transition-colors",
                        user && entry.ownedQty === 0 && "opacity-60 grayscale-[0.3]"
                      )}>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs shrink-0">
                          {entry.card.cost}
                        </div>
                        <img
                          src={getInkLogo(entry.card.inkColor)}
                          alt={entry.card.inkColor}
                          className="w-4 h-4 object-contain shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{entry.card.name}</p>
                          {entry.card.subtitle && (
                            <p className="text-[10px] text-muted-foreground truncate">{entry.card.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {user && entry.missingQty > 0 && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/50 text-amber-600 bg-amber-500/10">
                              -{entry.missingQty}
                            </Badge>
                          )}
                          <div className="font-mono font-bold text-sm bg-secondary px-2 py-0.5 rounded">
                            {user ? `${entry.ownedQty}/${entry.qty}` : `x${entry.qty}`}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
