import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ChevronRight, Plus, Library, Sparkles, Trophy, Download } from "lucide-react";
import { useAllCards } from "@/hooks/useCards";
import { Button } from "@/components/ui/button";
import { inkHexColors } from "@/components/ui/card-display";
import { useCurrency } from "@/components/currency-provider";
import { useState, useEffect } from "react";

import { ARCHETYPES } from "@/data/archetypes";
import { TOURNAMENTS, Tournament } from "@/data/tournaments";

export default function Meta() {
  const { data: allCards = [], isLoading: loadingCards } = useAllCards();
  const [, setLocation] = useLocation();
  const { formatPrice } = useCurrency();
  
  // Simulated backend fetching state
  const [isFetchingBackground, setIsFetchingBackground] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    // Simulate Supabase fetch delay
    const timer = setTimeout(() => {
      setTournaments(TOURNAMENTS);
      setIsFetchingBackground(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBuildLikeThis = (archDesc: string, decklist: any[]) => {
    localStorage.setItem("lorcana_import_temp", JSON.stringify({
      name: `Template: ${archDesc}`,
      cards: decklist
    }));
    setLocation("/builder?import=latest");
  };

  const getCardImage = (name: string, subtitle?: string) => {
    if (!allCards.length) return null;
    const card = allCards.find(c => 
      c.name.toLowerCase() === name.toLowerCase() && 
      (!subtitle || c.subtitle?.toLowerCase() === subtitle.toLowerCase())
    );
    return card?.image;
  };

  // Tier List Grouping
  const sTier = ARCHETYPES.filter(a => a.tier === "S");
  const aTier = ARCHETYPES.filter(a => a.tier === "A");
  const bTier = ARCHETYPES.filter(a => a.tier === "B");

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3 h-3" /> Community Curated
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">Strategy Hub</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Explore top-tier curated strategies and community-proven decks. Copy optimized decklists directly into your builder.
        </p>
      </div>

      {/* Visual Tier List Dashboard */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Current Tier List
        </h2>
        <div className="flex flex-col rounded-xl overflow-hidden border bg-card/50 shadow-xl shadow-primary/5">
          <TierRow label="S" color="bg-rose-500" archetypes={sTier} />
          <TierRow label="A" color="bg-amber-500" archetypes={aTier} />
          <TierRow label="B" color="bg-emerald-500" archetypes={bTier} />
        </div>
      </section>

      {/* Recent Tournaments */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-serif font-bold mb-6">Recent Major Tournaments</h2>
        
        {isFetchingBackground || loadingCards ? (
          <div className="py-20 flex flex-col items-center justify-center border rounded-xl bg-card border-dashed space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse font-medium">Fetching tournament records...</p>
          </div>
        ) : tournaments.map((tournament) => (
          <div key={tournament.id} className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6">
              <div>
                <h3 className="text-3xl font-serif font-bold">{tournament.name}</h3>
                <p className="text-muted-foreground">{new Date(tournament.date).toLocaleDateString()} · {tournament.location} · {tournament.playerCount} Players</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournament.topDecks.map((deck) => {
                const arch = ARCHETYPES.find(a => a.id === deck.archetypeId);
                
                // Calculate deck value
                let deckValue = 0;
                deck.decklist.forEach(entry => {
                  const card = allCards.find(c => 
                    c.name.toLowerCase() === entry.name.toLowerCase() && 
                    (!entry.subtitle || c.subtitle?.toLowerCase() === entry.subtitle.toLowerCase())
                  );
                  if (card) {
                    deckValue += (card.priceUsd || 0) * entry.qty;
                  }
                });

                return (
                  <Card key={deck.id} className="p-5 flex flex-col hover:border-primary/40 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 blur-xl group-hover:opacity-20 transition-opacity">
                      <Trophy className="w-24 h-24" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shadow-inner">
                        {deck.placement}{deck.placement === 1 ? 'st' : deck.placement === 2 ? 'nd' : deck.placement === 3 ? 'rd' : 'th'}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">{deck.playerName}</h4>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                          {arch?.name || "Rogue Deck"}
                        </span>
                      </div>
                    </div>
                    
                    {arch && (
                      <div className="flex gap-1.5 p-1 rounded-md bg-secondary/50 border self-start mb-4 relative z-10">
                        {arch.inks.map(ink => (
                          <div 
                            key={ink}
                            className="w-3.5 h-3.5 rounded-full border shadow-sm"
                            style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] }}
                            title={ink}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex flex-col gap-3 border-t relative z-10">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-muted-foreground">Market Value</span>
                        <span className="text-amber-500">{formatPrice(deckValue)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          className="flex-1 gap-2"
                          onClick={() => handleBuildLikeThis(`${tournament.name} Top 8`, deck.decklist)}
                        >
                          <Download className="w-4 h-4" /> Import
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 gap-1"
                          onClick={() => {
                            // Convert standard Lorcast/App structure to TCGPlayer mass entry format using the DB names.
                            if(allCards.length === 0) return;
                            const affiliateId = import.meta.env.VITE_TCGPLAYER_AFFILIATE_ID || "";
                            const lines = deck.decklist.map(entry => `${entry.qty} ${entry.name}${entry.subtitle ? ` - ${entry.subtitle}` : ""}`).join("||");
                            window.open(`https://tcgplayer.pxf.io/c/${affiliateId}/1830156/21018?u=https://www.tcgplayer.com/massentry?productline=Lorcana TCG&c=${encodeURIComponent(lines)}`, '_blank');
                          }}
                        >
                          Buy Deck
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Archetype Library */}
      <section className="max-w-5xl mx-auto pt-16 border-t border-dashed">
        <div className="flex items-center gap-3 mb-8">
          <Library className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-serif font-bold">Archetype Library</h2>
        </div>
        
        <div className="grid gap-6">
          {ARCHETYPES.map((arch) => (
            <Card key={arch.name} className="overflow-hidden border-primary/10 bg-card/50 hover:border-primary/30 transition-all duration-300 group">
              <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-stretch">
                {/* Ink Colors & Tier */}
                <div className="flex md:flex-col items-center gap-4 shrink-0 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6 border-primary/10 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0 ${
                      arch.tier === 'S' ? 'bg-gradient-to-br from-rose-400 to-rose-600' :
                      arch.tier === 'A' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                      'bg-gradient-to-br from-emerald-400 to-emerald-600'
                    }`}>
                      {arch.tier}
                    </div>
                    <div className="flex gap-1.5 p-1.5 rounded-lg bg-secondary/50 border shrink-0">
                      {arch.inks.map(ink => (
                        <div 
                          key={ink}
                          className="w-4 h-4 rounded-full border shadow-sm"
                          style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] }}
                          title={ink}
                        />
                      ))}
                    </div>
                </div>

                <div className="flex-1 w-full text-left">
                  <h3 className="text-xl font-serif font-bold mb-1 group-hover:text-primary transition-colors">{arch.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 italic line-clamp-2">"{arch.description}"</p>
                  
                  <div className="flex flex-wrap gap-4 items-center mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Est. Win Rate</span>
                      <span className="font-bold text-emerald-500 font-mono">{arch.winrate}</span>
                    </div>
                    <div className="mx-4 w-[1px] h-8 bg-border" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Key Cards</span>
                      <span className="text-xs font-medium line-clamp-1">{arch.keyCards.map(kc => kc.name).join(", ")}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-end gap-3 w-full md:w-auto shrink-0 md:pl-6 md:border-l border-primary/10">
                    <Link href={`/meta/${arch.id}`}>
                      <Button variant="outline" className="w-full gap-2">
                         Analysis <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleBuildLikeThis(arch.name, arch.fullDeck)}
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" /> Base List
                    </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// Helper Component for Tier Visualizer
function TierRow({ label, color, archetypes }: { label: string, color: string, archetypes: typeof ARCHETYPES }) {
  return (
    <div className="flex border-b last:border-b-0 min-h-[100px] bg-background/50">
      {/* Tier Label Box */}
      <div className={`${color} w-24 shrink-0 flex items-center justify-center border-r border-background/20 relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.1)]`}>
        <span className="text-4xl font-black text-white/90 drop-shadow-md">{label}</span>
      </div>
      
      {/* Cards */}
      <div className="flex-1 p-4 flex flex-wrap gap-3 items-center bg-card">
        {archetypes.map((arch) => (
          <Link key={arch.id} href={`/meta/${arch.id}`}>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/40 border hover:border-primary/50 hover:bg-secondary transition-all rounded-lg cursor-pointer group shadow-sm hover:shadow-md">
              <div className="flex gap-[-4px]">
                {arch.inks.map(ink => (
                  <div 
                    key={ink}
                    className="w-3.5 h-3.5 rounded-full border shadow-sm mix-blend-multiply dark:mix-blend-screen"
                    style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] }}
                    title={ink}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold group-hover:text-primary transition-colors">{arch.name}</span>
            </div>
          </Link>
        ))}
        {archetypes.length === 0 && <span className="text-sm text-muted-foreground italic opacity-50 px-2">No data recorded</span>}
      </div>
    </div>
  );
}

