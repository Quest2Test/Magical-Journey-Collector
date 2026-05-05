import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, PlaySquare, Filter, Heart, ArrowUpRight } from "lucide-react";
import { usePublicDecks } from "@/hooks/usePublicDecks";

export default function PublicDecks() {
  const [search, setSearch] = useState("");
  const { publicDecks, isLoading } = usePublicDecks();

  const filteredDecks = publicDecks.filter(deck => 
    deck.name.toLowerCase().includes(search.toLowerCase()) || 
    deck.authorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-3">Community Decks</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover, upvote, and clone decks shared by the Lorbound community.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search public decks..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 bg-card">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.map(deck => (
          <Link key={deck.id} href={`/decks/public/${deck.id}`}>
            <div className="group rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <PlaySquare className="w-24 h-24 rotate-12" />
              </div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex gap-1.5">
                  {deck.inkColors.map(ink => (
                    <div key={ink} className="w-4 h-4 rounded-full shadow-sm border border-white/20" 
                         style={{ backgroundColor: ink === 'Sapphire' ? '#3b82f6' : ink === 'Steel' ? '#6b7280' : ink === 'Amethyst' ? '#9333ea' : '#ef4444' }} 
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-secondary/80 px-2 py-0.5 rounded-full text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  <Heart className="w-3 h-3" /> {deck.upvotes}
                </div>
              </div>

              <div className="mb-6 relative z-10">
                <h3 className="text-xl font-bold font-serif leading-tight mb-1 group-hover:text-primary transition-colors">{deck.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  by <span className="font-semibold text-foreground/80">{deck.authorName}</span>
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t pt-4 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  {deck.format}
                </span>
                <span className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  View Deck <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
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
