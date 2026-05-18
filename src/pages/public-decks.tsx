import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, PlaySquare, Filter, Heart, ArrowUpRight, X } from "lucide-react";
import { usePublicDecks } from "@/hooks/usePublicDecks";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { inkHexColors, getInkLogo } from "@/components/ui/card-display";
import { getDeckArchetype } from "@/lib/card-utils";
import { getBaseCardValue } from "@/lib/pricing";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PublicDecks() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'my'>('recent');
  const { publicDecks, isLoading, likedDeckIds, toggleLike, isTogglingLike, unpublishDeck, isUnpublishing } = usePublicDecks(sortBy === 'my' ? 'recent' : sortBy);
  const { user } = useAuth();

  const filteredDecks = publicDecks.filter(deck => {
    const archetypeText = deck.customArchetype || (deck.entries?.length > 0 ? getDeckArchetype(deck.entries) : "");
    const matchesSearch = deck.name.toLowerCase().includes(search.toLowerCase()) || 
                         deck.authorName.toLowerCase().includes(search.toLowerCase()) ||
                         archetypeText.toLowerCase().includes(search.toLowerCase());
    if (sortBy === 'my') {
      return matchesSearch && user && deck.userId === user.id;
    }
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-3">Community Decks</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover, upvote, and clone decks shared by the Lorbound community.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search public decks..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(val: 'recent' | 'popular') => setSortBy(val)}>
            <SelectTrigger className="w-full sm:w-[140px] bg-card shrink-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              {user && <SelectItem value="my">My Shared Decks</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xl:gap-4">
        {filteredDecks.map(deck => {
          // Identify the cover card (most expensive character, or just first card)
          const coverCardEntry = [...deck.entries].sort((a, b) => {
            const valA = getBaseCardValue(a.card);
            const valB = getBaseCardValue(b.card);
            if (valA !== valB) return valB - valA;
            if (a.card.type === "Character" && b.card.type !== "Character") return -1;
            if (b.card.type === "Character" && a.card.type !== "Character") return 1;
            return b.card.cost - a.card.cost;
          })[0];
          
          const coverUrl = coverCardEntry?.card.thumbnail || coverCardEntry?.card.image;
          const isLiked = likedDeckIds.includes(deck.id);

          // Build gradient background - Increased vibrancy
          const inkHex1 = deck.inkColors[0] ? (inkHexColors as Record<string, string>)[deck.inkColors[0]] : "#888";
          const inkHex2 = deck.inkColors[1] ? (inkHexColors as Record<string, string>)[deck.inkColors[1]] : inkHex1;
          const bgGradient = `linear-gradient(135deg, ${inkHex1}25 0%, ${inkHex2}10 100%)`;

          return (
            <div 
              key={deck.id} 
              className="group relative rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col gap-4"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: bgGradient }} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

              {/* Top Row: Name and Inks (Header) */}
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <Link href={`/decks/public/${deck.id}?returnTo=/public-decks`}>
                    <h3 className="text-xl font-bold font-serif leading-tight group-hover:text-primary transition-colors truncate cursor-pointer">
                      {deck.name}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1.5">
                    {(deck.customArchetype || deck.entries?.length > 0) && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm mr-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        {deck.customArchetype || getDeckArchetype(deck.entries)}
                      </span>
                    )}
                    <span>by <span className="font-semibold text-foreground/80">{deck.authorName}</span></span>
                    <span className="opacity-50">•</span>
                    <span className="uppercase tracking-wider font-bold">{deck.format}</span>
                  </div>
                </div>

                {/* Ink Logos - Top Right (Vibrant) */}
                <div className="flex gap-1.5 shrink-0">
                  {deck.inkColors.map(ink => {
                    const inkColor = (inkHexColors as Record<string, string>)[ink] || "#888";
                    return (
                      <div 
                        key={ink} 
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 border border-white/20 shadow-lg relative group/ink"
                        title={ink}
                        style={{ boxShadow: `0 0 15px ${inkColor}30` }}
                      >
                        {/* Inner Glow */}
                        <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: inkColor }} />
                        <img 
                          src={getInkLogo(ink)} 
                          alt={ink} 
                          className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative z-10 transform group-hover/ink:scale-110 transition-transform" 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Info and Card (Pushed Right) */}
              <div className="relative z-10 flex items-center justify-end gap-6 mt-auto">
                {/* Deck Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-r pr-6 border-border/50">
                  <div className="flex flex-col items-center">
                    <span className="text-foreground font-bold text-sm">{deck.totalCards}</span>
                    <span className="text-[10px] uppercase tracking-tighter opacity-70 font-bold">Cards</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-foreground font-bold text-sm flex items-center gap-1">
                       <Heart className={cn("w-3 h-3", isLiked ? "fill-current text-red-500" : "")} />
                       {deck.upvotes}
                    </span>
                    <span className="text-[10px] uppercase tracking-tighter opacity-70 font-bold">Likes</span>
                  </div>
                </div>

                {/* Cover Card & Actions */}
                <div className="flex items-center gap-4">
                  {coverUrl && (
                    <div className="w-12 aspect-[2.5/3.5] rounded-md overflow-hidden border-2 border-white/10 shadow-lg shrink-0 transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                      <div className="w-full h-full" style={{ background: `url(${coverUrl}) center 20%/cover no-repeat` }} />
                    </div>
                  )}

                    <div className="flex gap-2">
                      {user && deck.userId === user.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                          onClick={(e) => {
                            e.preventDefault();
                            unpublishDeck(deck.id);
                          }}
                          disabled={isUnpublishing}
                          title="Unshare Deck"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-8 gap-1.5 rounded-full px-3", isLiked ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-red-500")}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike(deck.id);
                        }}
                        disabled={isTogglingLike}
                      >
                        <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-current" : "")} />
                        <span className="text-xs font-bold">{isLiked ? "Liked" : "Like"}</span>
                      </Button>
                    </div>
                    
                    <Link href={`/decks/public/${deck.id}?returnTo=/public-decks`}>
                      <Button size="sm" variant="secondary" className="h-8 gap-1 w-full text-xs font-bold">
                        View <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDecks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed bg-card/30">
          <Search className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="font-medium">No public decks found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}
