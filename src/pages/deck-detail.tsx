import { useParams, Link, useLocation } from "wouter";
import { useDecks } from "@/hooks/useDecks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Edit, ExternalLink, PlaySquare, TrendingUp, Info, LayoutGrid, List as ListIcon, Library, Sparkles, Download, Layers, Globe, Link as LinkIcon } from "lucide-react";
import { getCardLegality } from "@/lib/legality";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useAllCards } from "@/hooks/useCards";
import { getHydratedStarterDecks } from "@/lib/starter-decks-hydration";
import { usePublicDecks } from "@/hooks/usePublicDecks";
import { useWishlist } from "@/hooks/useWishlist";
import { isFoilOnly } from "@/lib/pricing";
import { DeckAnalysisPanel } from "@/components/builder/DeckAnalysisPanel";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Facebook, Share2, Image as ImageIcon, Play, MoreVertical, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useImageExport } from "@/hooks/useImageExport";
import { DeckShareModal } from "@/components/builder/DeckShareModal";
import { DeckHandSimulator } from "@/components/builder/DeckHandSimulator";
import { buildTCGPlayerMassEntryUrl, detectRegion } from "@/lib/affiliates";
import { ShoppingBag, Copy, CheckCircle2, FileText, Code, ChevronDown, Award } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function DeckDetail() {
  const { id } = useParams();
  const [location] = useLocation();
  const { toast } = useToast();
  const isPublicRoute = location.includes("/decks/public/");

  const copyToClipboard = async () => {
    const shareData = {
      title: `${deck?.name} | Lorcana Deck on Lorbound`,
      text: `Check out this ${deck?.format} deck "${deck?.name}" by ${isPublicRoute ? (deck as any).authorName : (user?.user_metadata?.username || "a Lorbound user")}.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Deck URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Share Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const { decks, isLoading: loadingDecks } = useDecks();
  const { data: allCards = [], isLoading: loadingCards } = useAllCards();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { wishlist, addToWishlistBulk } = useWishlist();
  const { collection, getEntry } = useCollection();
  const { publicDecks, publishDeck, unpublishDeck, isUnpublishing, isLoading: loadingPublic, isPublishing } = usePublicDecks();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [groupMode, setGroupMode] = useState<"type" | "cost">("type");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showImageExport, setShowImageExport] = useState(false);
  const [shareColumns, setShareColumns] = useState(8);
  const [showValue, setShowValue] = useState(true);
  const [showFormat, setShowFormat] = useState(true);
  const [showCount, setShowCount] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showHandSimulator, setShowHandSimulator] = useState(false);

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
    let uninkableCount = 0;
    let totalInkCost = 0;
    const inkDist: Record<string, number> = {};
    const curve: { cost: string; count: number;[ink: string]: string | number }[] = Array.from({ length: 7 }, (_, i) => ({
      cost: i < 6 ? String(i + 1) : "7+",
      count: 0,
    }));
    const byType: Record<string, number> = {
      Character: 0, Action: 0, Item: 0, Location: 0, Song: 0,
    };

    const cardsInDeck = deck.entries.map(entry => {
      const owned = getEntry(entry.card.id);
      const totalOwnedCount = owned.normal + owned.foil;
      const missingQty = Math.max(0, entry.qty - totalOwnedCount);
      const price = getBaseCardValue(entry.card);

      totalOwned += Math.min(entry.qty, totalOwnedCount);
      totalRequired += entry.qty;
      missingValue += missingQty * price;

      // Stats
      inkDist[entry.card.inkColor] = (inkDist[entry.card.inkColor] || 0) + entry.qty;
      const costIndex = Math.min(entry.card.cost - 1, 6);
      if (costIndex >= 0) {
        curve[costIndex].count += entry.qty;
        curve[costIndex][entry.card.inkColor] = ((curve[costIndex][entry.card.inkColor] as number) || 0) + entry.qty;
      }
      byType[entry.card.type] = (byType[entry.card.type] || 0) + entry.qty;
      if (!entry.card.inkable) uninkableCount += entry.qty;
      totalInkCost += entry.card.cost * entry.qty;

      return {
        ...entry,
        ownedQty: Math.min(entry.qty, totalOwnedCount),
        missingQty,
        price
      };
    });

    const completionPct = totalRequired > 0 ? (totalOwned / totalRequired) * 100 : 0;
    const activeInks = Object.keys(inkDist);
    const avgCost = totalRequired > 0 ? totalInkCost / totalRequired : 0;

    // Legality
    const illegalCardsCount = deck.entries.filter(({ card }) => {
      if (deck.format === "Any") return false;
      const legality = getCardLegality(card, allCards);
      const formatKey = (deck.format === "Core" ? "core" : "infinity") as keyof typeof legality;
      return legality[formatKey] !== "Legal";
    }).length;

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
      sortedKeys,
      // New stats for infographics
      inkDistribution: inkDist,
      costCurve: curve,
      activeInks,
      uninkableCount,
      avgCost,
      pieData: Object.entries(inkDist).map(([name, value]) => ({ name, value })),
      typeBreakdown: Object.entries(byType).map(([type, count]) => ({ type, count })).filter(t => t.count > 0),
      isLegalSize: totalRequired === 60,
      isLegalInkCount: activeInks.length <= 2,
      illegalCardsCount
    };
  }, [deck, collection, getEntry, groupMode]);

  const memoizedCards = useMemo(() => deck?.entries || [], [deck?.entries]);
  const memoizedInks = useMemo(() => analysis?.inkDistribution || {}, [analysis?.inkDistribution]);

  const { 
    sharePreviewUrl, 
    isGeneratingPreview, 
    previewError, 
    handleDownload,
    aspectRatio,
    setAspectRatio,
  } = useImageExport({
    deckCards: memoizedCards,
    deckName: deck?.name || "Untitled Deck",
    format: deck?.format || "Any",
    totalCards: deck?.totalCards || 0,
    totalValue: deck?.totalValue || 0,
    shareColumns,
    inkDistribution: memoizedInks,
    formatPrice,
    showFormat,
    showCount,
    showValue,
    showQRCode,
    active: showImageExport,
    deckUrl: window.location.href
  });

  const region = useMemo(() => detectRegion(), []);

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
    const lines = analysis.cardsInDeck
      .filter(c => c.missingQty > 0)
      .map(entry => `${entry.missingQty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}`);
    
    const url = buildTCGPlayerMassEntryUrl(lines);
    if (url) window.open(url, '_blank');
  };

  const handleBuyAll = () => {
    const lines = analysis.cardsInDeck
      .map(entry => `${entry.qty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}`);
    
    const url = buildTCGPlayerMassEntryUrl(lines);
    if (url) window.open(url, '_blank');
  };

  const copyDeckList = () => {
    const list = analysis.cardsInDeck
      .map(entry => `${entry.qty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}`)
      .join("\n");
    
    navigator.clipboard.writeText(list);
    toast({
      title: "Decklist Copied!",
      description: "Ready to paste into TCGPlayer, CardMarket, or Melee.gg",
    });
  };

  const copyPixelbornList = () => {
    // Pixelborn import format is usually just the list of cards
    const list = analysis.cardsInDeck
      .map(entry => `${entry.qty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}`)
      .join("\n");
    
    navigator.clipboard.writeText(list);
    toast({
      title: "Pixelborn Format Copied!",
      description: "You can now import this deck in Pixelborn.",
    });
  };

  const handleAddMissingToWishlist = () => {
    const missingItems = analysis.cardsInDeck
      .filter(entry => entry.missingQty > 0)
      .map(entry => ({
        cardId: entry.card.id,
        variant: (isFoilOnly(entry.card) ? "foil" : "normal") as "normal" | "foil",
        qty: entry.missingQty
      }));
    
    if (missingItems.length > 0) {
      addToWishlistBulk(missingItems);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumbs */}
      <Link href="/decks" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to My Decks
      </Link>

      {/* Header Section */}
      <div className="relative rounded-3xl border bg-card overflow-hidden shadow-sm mb-8">
        <div className="absolute inset-0 opacity-10" style={{ background: bannerGradient }} />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex gap-2.5">
              {deck.inkColors.map(ink => {
                const inkColor = (inkHexColors as Record<string, string>)[ink] || "#888";
                return (
                  <div
                    key={ink}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/20 shadow-xl relative group/ink overflow-hidden"
                    title={ink}
                    style={{ boxShadow: `0 0 20px ${inkColor}40` }}
                  >
                    {/* Inner Gradient/Glow */}
                    <div
                      className="absolute inset-0 opacity-40 group-hover/ink:opacity-60 transition-opacity"
                      style={{ background: `radial-gradient(circle at center, ${inkColor}, transparent)` }}
                    />
                    <img
                      src={getInkLogo(ink)}
                      alt={ink}
                      className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] relative z-10 transform group-hover/ink:scale-110 transition-transform duration-300"
                    />
                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                  </div>
                );
              })}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">{deck.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><PlaySquare className="w-4 h-4" /> {deck.totalCards} Cards</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> {formatPrice(deck.totalValue)} Value</span>
              <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> {deck.format} Format</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg" className="gap-2 shadow-sm" onClick={() => setShowSocialShare(true)}>
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button variant="outline" size="lg" className="gap-2 shadow-sm border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary" onClick={() => setShowHandSimulator(true)}>
              <Play className="w-4 h-4 fill-current" /> Test Draw
            </Button>
            {user && decks.some(d => d.id === deck.id) && !isPublicRoute && (
              publicDecks.some(p => p.id === deck.id) ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 shadow-sm text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                  onClick={() => unpublishDeck(deck.id)}
                  disabled={isUnpublishing}
                >
                  {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Unshare
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 shadow-lg"
                  onClick={() => setShowShareDialog(true)}
                  disabled={isPublishing}
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-primary" />}
                  Share Publicly
                </Button>
              )
            )}
            {isPublicRoute ? (
              <div className="flex gap-2">
                {user && (deck as any).userId === user.id && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 shadow-sm text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                    onClick={() => unpublishDeck(deck.id)}
                    disabled={isUnpublishing}
                  >
                    {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    Unshare
                  </Button>
                )}
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/20" asChild>
                  <Link href={`/builder?import=${deck.id}&source=public`}>
                    <Layers className="w-4 h-4" /> Clone to My Decks
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Link href={`/builder?edit=${deck.id}`}>
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/20">
                    <Edit className="w-4 h-4" /> Modify in Builder
                  </Button>
                </Link>
                {isPublicRoute && user?.id !== (deck as any).userId && (
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="text-muted-foreground hover:text-destructive transition-colors gap-2"
                    onClick={async () => {
                      try {
                        const { error } = await supabase.from("reports").insert({
                          reporter_id: user?.id,
                          target_id: deck.id,
                          target_type: "deck",
                          reason: "Flagged via public deck view"
                        });

                        if (error) throw error;

                        toast({
                          title: "Deck Reported",
                          description: "Thank you. Our moderation team will review this deck shortly.",
                          variant: "destructive"
                        });
                      } catch (e: any) {
                        toast({
                          title: "Report Failed",
                          description: "There was an issue sending your report. Please try again later.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Flag className="w-4 h-4" /> Report
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
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
          <div className={cn("gap-8", viewMode === "list" ? "grid md:grid-cols-1" : "flex flex-col")}>
            {analysis.sortedKeys.map((groupKey) => {
              const group = analysis.grouped[groupKey];
              const returnPath = isPublicRoute ? `/decks/public/${deck.id}` : `/decks/${deck.id}`;
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {group.cards.map((entry, idx) => (
                        <motion.div
                          key={`${entry.card.id}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="relative group/card"
                        >
                          <CardDisplay
                            card={entry.card}
                            returnTo={returnPath}
                            className={cn(
                              "transition-opacity w-full",
                              user && entry.ownedQty === 0 && "opacity-50 grayscale-[0.5]"
                            )}
                          />

                          {user ? (
                            <>
                              <div className="absolute -top-2 -right-2 min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-lg bg-card border border-primary/20 shadow-lg z-10 font-bold text-xs">
                                {entry.ownedQty} <span className="mx-0.5 opacity-40">/</span> {entry.qty}
                              </div>
                              {entry.missingQty > 0 && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg z-20 whitespace-nowrap border border-white/20">
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
                    <div className="space-y-1">
                      {group.cards.map((entry, idx) => (
                        <Link
                          key={`${entry.card.id}-${idx}`}
                          href={`/cards/${entry.card.id}?returnTo=${encodeURIComponent(returnPath)}`}
                          className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group transition-colors border border-transparent hover:border-border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-sm font-bold text-muted-foreground">{entry.qty}x</span>
                            <div className="flex flex-col">
                              <span className="font-medium group-hover:text-primary transition-colors">{entry.card.name}</span>
                              {entry.card.subtitle && <span className="text-xs text-muted-foreground">{entry.card.subtitle}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted uppercase tracking-wider">{entry.card.rarity}</span>
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: inkHexColors[entry.card.inkColor] }}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
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
            <CardContent className="space-y-6">
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

                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Marketplace Options</div>
                    {analysis.missingValue > 0 ? (
                      <div className="space-y-2">
                        <Button 
                          onClick={handleBuyMissing} 
                          className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                        >
                          <ShoppingBag className="w-4 h-4" /> Buy Missing on TCGPlayer
                        </Button>
                        <Button 
                          onClick={handleAddMissingToWishlist} 
                          variant="outline"
                          className="w-full gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                        >
                          <Award className="w-4 h-4" /> Add Missing to Wishlist
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> You own all cards in this deck!
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={handleBuyAll} 
                        variant="outline" 
                        size="sm"
                        className="gap-2 text-[11px] font-bold h-9"
                      >
                        <ExternalLink className="w-3 h-3" /> Buy All
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 text-[11px] font-bold h-9"
                          >
                            <Copy className="w-3 h-3" /> Copy List <ChevronDown className="w-3 h-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Formats</DropdownMenuLabel>
                          <DropdownMenuItem onClick={copyDeckList} className="gap-2 text-xs font-medium cursor-pointer">
                            <FileText className="w-3.5 h-3.5" /> Standard Text
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={copyPixelbornList} className="gap-2 text-xs font-medium cursor-pointer">
                            <Code className="w-3.5 h-3.5" /> Pixelborn Import
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-[9px] text-center text-muted-foreground/60 leading-tight">
                      Help support Lorbound by using our affiliates.
                    </p>
                  </div>
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
                    <Link href="/auth">Sign In to Lorbound</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </CardContainer>

          {/* Infographics Panel */}
          <div className="border rounded-3xl bg-card shadow-sm overflow-hidden h-fit">
            <div className="p-6">
              <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Deck Analytics
              </h3>
              <DeckAnalysisPanel
                user={user}
                totalCards={analysis.totalRequired}
                deckCardsLength={analysis.cardsInDeck.length}
                avgCost={analysis.avgCost}
                pieData={analysis.pieData}
                typeBreakdown={analysis.typeBreakdown}
                costCurve={analysis.costCurve}
                activeInks={analysis.activeInks}
                uninkableCount={analysis.uninkableCount}
                collectionStats={{
                  totalMissing: analysis.totalRequired - analysis.totalOwned,
                  costToFinish: analysis.missingValue,
                  missingByCard: analysis.cardsInDeck.reduce((acc, c) => {
                    if (c.missingQty > 0) acc[c.card.id] = c.missingQty;
                    return acc;
                  }, {} as Record<string, number>)
                }}
                isLegalSize={analysis.isLegalSize}
                isLegalInkCount={analysis.isLegalInkCount}
                illegalCardsCount={analysis.illegalCardsCount}
                format={deck.format}
                formatPrice={formatPrice}
                entries={deck.entries}
              />
            </div>
          </div>
        </div>
      </div>






      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share to Community</DialogTitle>
            <DialogDescription>
              This will publish your deck to the Public Decks hub for the community to see, upvote, and clone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(c) => setIsAnonymous(c as boolean)}
            />
            <Label htmlFor="anonymous" className="font-medium cursor-pointer">
              Share anonymously
            </Label>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

                if (!isUUID(deck.id)) {
                  toast({
                    title: "Legacy Deck ID",
                    description: "This deck uses an older ID format. Please open it in the Builder and hit 'Save' to update it before sharing.",
                    variant: "destructive"
                  });
                  setShowShareDialog(false);
                  return;
                }

                const authorName = isAnonymous
                  ? "Anonymous"
                  : (user?.user_metadata?.username || user?.email?.split('@')[0] || "Unknown");
                publishDeck(deck, authorName);
                setShowShareDialog(false);
              }}
              disabled={isPublishing}
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Share Modal */}
      <Dialog open={showSocialShare} onOpenChange={setShowSocialShare}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Deck</DialogTitle>
            <DialogDescription>
              Share "{deck.name}" with the Lorcana community.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 bg-[#1DA1F2]/5 hover:bg-[#1DA1F2]/10 border-[#1DA1F2]/20 text-[#1DA1F2]"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my ${deck.format} Lorcana deck "${deck.name}" on Lorbound!`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                <Twitter className="w-4 h-4 fill-current" /> Twitter
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-[#4267B2]/5 hover:bg-[#4267B2]/10 border-[#4267B2]/20 text-[#4267B2]"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                <Facebook className="w-4 h-4 fill-current" /> Facebook
              </Button>
            </div>

            <Button
              variant="outline"
              className="gap-2 py-6 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => {
                setShowSocialShare(false);
                setShowImageExport(true);
              }}
            >
              <ImageIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-sm">Generate Share Image</p>
                <p className="text-[10px] text-muted-foreground">Download a beautiful infographic of your deck</p>
              </div>
            </Button>

            {/* Copy Link Field */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Direct Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={window.location.href}
                  className="bg-muted/50 text-xs h-9"
                />
                <Button size="sm" onClick={copyToClipboard} className="shrink-0 h-9">
                  Copy
                </Button>
              </div>
            </div>

            {/* Subtle Branding */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">Spread the word!</p>
                <p className="text-[10px] text-muted-foreground">Love using Lorbound? Sharing your decks helps our community grow.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <DeckShareModal
        open={showImageExport}
        onOpenChange={setShowImageExport}
        shareColumns={shareColumns}
        onShareColumnsChange={setShareColumns}
        showFormat={showFormat}
        onShowFormatChange={setShowFormat}
        showCount={showCount}
        onShowCountChange={setShowCount}
        showValue={showValue}
        onShowValueChange={setShowValue}

        showQRCode={showQRCode}
        onShowQRCodeChange={isPublicRoute || publicDecks.some(p => p.id === deck.id) ? setShowQRCode : undefined}
        isGeneratingPreview={isGeneratingPreview}
        previewError={previewError}
        sharePreviewUrl={sharePreviewUrl}
        onDownload={handleDownload}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />
      <DeckHandSimulator
        open={showHandSimulator}
        onOpenChange={setShowHandSimulator}
        entries={deck.entries}
        deckName={deck.name}
      />
    </div>
  );
}
