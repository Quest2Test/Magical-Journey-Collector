import { useParams, Link, useLocation } from "wouter";
import { useDecks } from "@/hooks/useDecks";
import { inkHexColors, CardDisplay } from "@/components/ui/card-display";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { getFormattedSubtitle } from "@/lib/card-utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, ThumbsUp, Share2, MessageSquare, Settings2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import { useAllCards } from "@/hooks/useCards";
import { STARTER_DECKS } from "@/data/starter-decks";

export default function DeckDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { decks } = useDecks();
  const { data: allCards = [] } = useAllCards();

  // Combine user decks and official starter decks for lookup
  const deck = useMemo(() => {
    // 1. Check user decks
    const userDeck = decks.find(d => d.id === id);
    if (userDeck) return userDeck;

    // 2. Check starter decks
    const starterDef = STARTER_DECKS.find(s => s.id === id);
    if (starterDef && allCards.length > 0) {
      // Aggressive normalization: lowercase, strip diacritics, and remove all punctuation/spaces
      const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

      const entries = starterDef.cards.map(entry => {
        const targetName = normalize(entry.name);
        const targetSub = entry.subtitle ? normalize(entry.subtitle) : "";

        const card = allCards.find(c => {
          const cName = normalize(c.name);
          const cSub = c.subtitle ? normalize(c.subtitle) : "";

          const nameMatch = cName === targetName;
          const subMatch = !entry.subtitle || cSub === targetSub;

          return nameMatch && subMatch;
        });
        return card ? { card, qty: entry.qty } : null;
      }).filter((e): e is { card: any, qty: number } => e !== null);

      return {
        ...starterDef,
        entries,
        totalCards: entries.reduce((acc, e) => acc + e.qty, 0),
        totalValue: entries.reduce((acc, e) => acc + (e.card.priceUsd || 0) * e.qty, 0),
        format: "Core",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOfficial: true,
      } as any;
    }

    return null;
  }, [id, decks, allCards]);

  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Deck Not Found</h1>
        <Link href="/decks">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Decks</Button>
        </Link>
      </div>
    );
  }

  // Handler for cloning decks to the builder
  const handleCopyToBuilder = () => {
    localStorage.setItem("lorcana_import_temp", JSON.stringify({
      name: `${deck.name} (Copy)`,
      cards: deck.entries.map((e: any) => ({ name: e.card.name, subtitle: e.card.subtitle, qty: e.qty }))
    }));
    setLocation("/builder?import=latest");
  };

  // Aggregate and sort deck data
  const totalCards = deck.totalCards;
  const cardsByType: Record<string, { card: any, qty: number }[]> = {
    Character: [],
    Action: [],
    Item: [],
    Song: [],
    Location: []
  };

  const inkDistribution: Record<string, number> = {};
  const costCurve = [
    { cost: '1', count: 0 },
    { cost: '2', count: 0 },
    { cost: '3', count: 0 },
    { cost: '4', count: 0 },
    { cost: '5', count: 0 },
    { cost: '6', count: 0 },
    { cost: '7+', count: 0 },
  ];

  deck.entries.forEach((entry: { card: any; qty: number }) => {
    const card = entry.card;
    const qty = entry.qty;

    if (card) {
      if (!cardsByType[card.type]) cardsByType[card.type] = [];
      cardsByType[card.type].push({ card, qty });

      inkDistribution[card.inkColor] = (inkDistribution[card.inkColor] || 0) + qty;

      const costIndex = Math.min(card.cost - 1, 6);
      if (costIndex >= 0) {
        costCurve[costIndex].count += qty;
      }
    }
  });

  // Sort each group by cost ascending
  Object.keys(cardsByType).forEach(type => {
    cardsByType[type].sort((a, b) => (a.card.cost || 0) - (b.card.cost || 0));
  });

  const pieData = Object.entries(inkDistribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Link href="/decks" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Decks
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-1">
              {deck.inkColors.map((color: string) => (
                <div
                  key={color}
                  className="w-5 h-5 rounded-full border shadow-sm"
                  style={{ backgroundColor: inkHexColors[color as keyof typeof inkHexColors] }}
                  title={color}
                />
              ))}
            </div>
            <span className="font-medium text-muted-foreground uppercase tracking-wider text-sm">{deck.format}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-2">{deck.name}</h1>
          <p className="text-lg text-muted-foreground">Saved on {new Date(deck.updatedAt).toLocaleDateString()}</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {!deck.isOfficial && (
            <Link href={`/builder?edit=${deck.id}`}>
              <Button variant="outline" className="flex-1 md:flex-none gap-2">
                <Settings2 className="w-4 h-4" /> Edit Deck
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={handleCopyToBuilder} className="flex-1 md:flex-none gap-2">
            <Copy className="w-4 h-4" /> Copy Deck
          </Button>
          <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main List */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold">Decklist</h2>
            <span className="px-3 py-1 bg-secondary rounded-full font-bold text-sm">{totalCards} Cards</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {Object.entries(cardsByType).map(([type, list]) => {
              if (list.length === 0) return null;
              return (
                <div key={type}>
                  <h3 className="font-bold border-b pb-2 mb-3 flex justify-between">
                    {type}s
                    <span className="text-muted-foreground font-normal">
                      {list.reduce((acc, item) => acc + item.qty, 0)}
                    </span>
                  </h3>
                  <ul className="space-y-1">
                    {list.map((item, i) => (
                      <HoverCard key={i} openDelay={200} closeDelay={50}>
                        <HoverCardTrigger asChild>
                          <li className="flex justify-between items-center p-2 rounded hover:bg-secondary/50 transition-colors group cursor-pointer">
                            <Link href={`/cards/${item.card.id}`} className="flex-1 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                 <span className="font-mono font-bold text-muted-foreground w-5 text-center">{item.qty}</span>
                                 <span className="group-hover:text-primary transition-colors font-medium text-left">{item.card.name}</span>
                                 {getFormattedSubtitle(item.card) && <span className="text-xs text-muted-foreground truncate max-w-[150px] hidden sm:inline-block">- {getFormattedSubtitle(item.card)}</span>}
                               </div>
                              <div className="flex gap-4 items-center">
                                 <div className="w-6 h-6 rounded flex items-center justify-center bg-muted text-xs font-bold border border-border/50 shrink-0">
                                    {item.card.cost}
                                 </div>
                                 <div
                                   className="w-2.5 h-2.5 rounded-full shrink-0"
                                   style={{ backgroundColor: inkHexColors[item.card.inkColor as keyof typeof inkHexColors] }}
                                 />
                              </div>
                            </Link>
                          </li>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-[300px] p-0 border-0 shadow-2xl bg-transparent" align="start">
                          <CardDisplay card={item.card} className="w-full" />
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Stats */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="p-6 rounded-xl border bg-card space-y-6">
            <h3 className="font-bold text-lg">Stats</h3>

            {/* Ink Distribution */}
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Ink Distribution</span>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={inkHexColors[entry.name] ?? "#888"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Curve */}
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Ink Curve</span>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costCurve}>
                    <XAxis dataKey="cost" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}