import { useAllCards } from "@/hooks/useCards";
import { useWishlist } from "@/hooks/useWishlist";
import { useCollection } from "@/hooks/useCollection";
import { CardDisplay } from "@/components/ui/card-display";
import { motion } from "framer-motion";
import { BookmarkPlus, BookmarkCheck, LayoutGrid, List as ListIcon, Search, ShoppingCart, Trash2, Heart, Sparkles, Filter, Loader2, Library, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

import { useAuth } from "@/components/auth-provider";

export default function WishlistPage() {
  const { data: allCards = [], isLoading: loadingCards } = useAllCards();
  const { wishlist, toggleWishlist, isLoading: loadingWishlist } = useWishlist();
  const { collection, getQty } = useCollection();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const wishlistCards = useMemo(() => {
    if (!allCards.length || !wishlist.length) return [];

    return wishlist.map(item => {
      const card = allCards.find(c => c.id === item.cardId);
      return card ? { ...card, variant: item.variant, addedAt: item.addedAt } : null;
    }).filter((c): c is any => !!c);
  }, [allCards, wishlist]);

  const filteredCards = useMemo(() => {
    return wishlistCards.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle?.toLowerCase().includes(search.toLowerCase())
    );
  }, [wishlistCards, search]);

  const totalValue = useMemo(() => {
    return filteredCards.reduce((sum, c) => sum + (c.priceUsd || 0), 0);
  }, [filteredCards]);

  if (loadingCards || loadingWishlist) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading your wishlist...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-md">
        <div className="p-4 rounded-full bg-pink-500/10 mb-6">
          <Heart className="w-12 h-12 text-pink-500 fill-current" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-3">Login Required</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to your Lorbound account to track your collection goals, monitor card prices, and manage your wishlist.
        </p>
        <div className="flex flex-col w-full gap-3">
          <Button asChild className="h-12 rounded-xl text-base font-bold shadow-lg shadow-pink-500/20">
            <Link href="/login">Sign In to Lorbound</Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/cards">Continue Browsing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-widest text-xs">
            <Sparkles className="w-4 h-4" />
            My Collection Goals
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground max-w-md">
            Track cards you want to add to your collection. We'll show you if you already own them and their current market value.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Total Cards</p>
              <p className="text-xl font-black">{wishlistCards.length}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Estimated Cost</p>
              <p className="text-xl font-black text-emerald-500">{formatPrice(totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter your wishlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-card/50"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center border rounded-lg p-1 bg-muted/50 h-11">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-md transition-all", viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-3xl bg-muted/20">
          <div className="p-4 rounded-full bg-pink-500/10 mb-4">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Browse cards and click the heart or bookmark icon to add them here!
          </p>
          <Link href="/cards">
            <Button className="gap-2 rounded-full px-8">
              Browse Cards <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className={cn(
          "gap-6",
          viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "flex flex-col"
        )}>
          {filteredCards.map((card, idx) => {
            const owned = getQty(card.id);

            if (viewMode === "list") {
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border hover:border-primary/30 transition-all group"
                >
                  <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden border">
                    <img src={card.thumbnail || card.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/cards/${card.id}`}>
                      <h3 className="font-bold truncate hover:text-primary transition-colors cursor-pointer">{card.name}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-emerald-500">{card.priceUsd ? formatPrice(card.priceUsd) : "N/A"}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                        card.variant === "foil" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-primary/10 text-primary border border-primary/20"
                      )}>
                        {card.variant}
                      </span>
                      {owned > 0 && (
                        <span className="text-[10px] text-muted-foreground font-medium italic">
                          (Owned: {owned})
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleWishlist(card.id, card.variant)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="relative group"
              >
                <CardDisplay card={card} />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(card.id, card.variant);
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full backdrop-blur border flex items-center justify-center text-white transition-all active:scale-90",
                      card.variant === "foil" ? "bg-amber-500/80 border-amber-400" : "bg-black/60 border-white/20 hover:bg-pink-500 hover:border-pink-400"
                    )}
                  >
                    {card.variant === "foil" ? <Sparkles className="w-4 h-4 fill-current" /> : <BookmarkCheck className="w-4 h-4 fill-current" />}
                  </button>
                </div>
                <div className={cn(
                  "absolute top-2 left-2 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-lg",
                  card.variant === "foil" ? "bg-amber-500 text-white" : "bg-primary text-white"
                )}>
                  {card.variant}
                </div>
                <div className="mt-2 flex justify-between items-center px-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{card.expansion} • {card.rarity}</p>
                  <p className="text-[10px] font-bold text-emerald-500">{card.priceUsd ? formatPrice(card.priceUsd) : "N/A"}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
