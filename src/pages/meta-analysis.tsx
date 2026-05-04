import { useRoute, Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useAllCards } from "@/hooks/useCards";
import { ARCHETYPES } from "@/data/archetypes";
import { useCollection } from "@/hooks/useCollection";
import { useCurrency } from "@/components/currency-provider";
import { getBaseCardValue } from "@/lib/pricing";
import { CardDisplay, inkHexColors, rarityIcons } from "@/components/ui/card-display";
import { TOURNAMENTS } from "@/data/tournaments";
import { Trophy, Download } from "lucide-react";
import { Loader2, ArrowLeft, TrendingUp, ShieldAlert, Sparkles, PieChart as PieChartIcon, BarChart3, Plus, Library } from "lucide-react";
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function MetaAnalysis({ params }: { params: { id: string } }) {
  const { data: allCards = [], isLoading: loadingCards } = useAllCards();
  const { user } = useAuth();
  const { collection, isCollected, getEntry } = useCollection();
  const { formatPrice } = useCurrency();
  const [, setLocation] = useLocation();

  const archetype = useMemo(() => {
    return ARCHETYPES.find(a => a.id === params?.id);
  }, [params?.id]);

  const analysis = useMemo(() => {
    if (!archetype || !allCards.length) return null;

    const cardsInDeck = archetype.fullDeck.map(ad => {
      const cardData = allCards.find(c => 
        c.name.toLowerCase() === ad.name.toLowerCase() && 
        (!ad.subtitle || c.subtitle?.toLowerCase() === ad.subtitle.toLowerCase())
      );
      
      const cardId = cardData?.id || "";
      const owned = collection[cardId] || { normal: 0, foil: 0 };
      const totalOwned = owned.normal + owned.foil;
      
      return {
        ...ad,
        card: cardData,
        ownedQty: Math.min(ad.qty, totalOwned),
        missingQty: Math.max(0, ad.qty - totalOwned),
        price: cardData ? getBaseCardValue(cardData) : 0
      };
    });

    const totalOwned = cardsInDeck.reduce((sum, c) => sum + c.ownedQty, 0);
    const totalRequired = cardsInDeck.reduce((sum, c) => sum + c.qty, 0);
    const missingValue = cardsInDeck.reduce((sum, c) => sum + (c.missingQty * c.price), 0);
    const totalValue = cardsInDeck.reduce((sum, c) => sum + (c.qty * c.price), 0);

    // Chart Data
    const curveData = Array.from({ length: 8 }, (_, i) => ({
      cost: i === 7 ? "7+" : i,
      count: cardsInDeck.filter(c => c.card && ((c.card.cost ?? 0) === i || (i === 7 && (c.card.cost ?? 0) >= 7)))
        .reduce((sum, c) => sum + c.qty, 0)
    }));

    const typeData = [
      { name: "Character", value: cardsInDeck.filter(c => c.card?.type === "Character").reduce((sum, c) => sum + c.qty, 0), color: "#3b82f6" },
      { name: "Action/Song", value: cardsInDeck.filter(c => c.card?.type === "Action" || c.card?.type === "Song").reduce((sum, c) => sum + c.qty, 0), color: "#ef4444" },
      { name: "Item", value: cardsInDeck.filter(c => c.card?.type === "Item").reduce((sum, c) => sum + c.qty, 0), color: "#10b981" },
      { name: "Location", value: cardsInDeck.filter(c => c.card?.type === "Location").reduce((sum, c) => sum + c.qty, 0), color: "#f59e0b" },
    ].filter(t => t.value > 0);

    return {
      cardsInDeck,
      totalOwned,
      totalRequired,
      missingValue,
      totalValue,
      curveData,
      typeData,
      completionPct: (totalOwned / totalRequired) * 100
    };
  }, [archetype, allCards, collection]);

  if (!archetype) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Archetype not found</h1>
        <Link href="/meta">
          <Button variant="outline">Back to Meta Snapshot</Button>
        </Link>
      </div>
    );
  }

  // If cards are loading, or we have no cards yet, we show loader
  if (loadingCards || allCards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If analysis is still null but we have cards, something might be wrong with the ID
  if (!analysis) {
    return (
      <div className="container mx-auto py-20 text-center text-muted-foreground">
        Invalid analysis data. Please try again.
      </div>
    );
  }

  const tournamentResults = useMemo(() => {
    return TOURNAMENTS.flatMap(t => 
      t.topDecks.filter(td => td.archetypeId === archetype?.id)
       .map(td => ({ ...td, tournamentName: t.name, date: t.date }))
    );
  }, [archetype]);

  const handleBuildLikeThis = (nameToUse: string, cardsToUse: any[]) => {
    localStorage.setItem("lorcana_import_temp", JSON.stringify({
      name: nameToUse,
      cards: cardsToUse
    }));
    setLocation("/builder?import=latest");
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 animate-in fade-in duration-500">
      <Link href="/meta" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Meta Snapshot
      </Link>

      {/* Hero Header */}
      <div className="grid lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
             <Badge className={cn(
               "px-3 py-1 text-lg font-bold",
               archetype.tier === 'S' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
             )}>
               Tier {archetype.tier}
             </Badge>
             <div className="flex gap-1 p-1 rounded-lg bg-muted border">
               {archetype.inks.map(ink => (
                 <div key={ink} className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] }} />
               ))}
             </div>
             <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 px-3 py-1 font-mono text-sm uppercase">{archetype.winrate} Win Rate</Badge>
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight">{archetype.name} Analysis</h1>
          <p className="text-xl text-muted-foreground italic leading-relaxed max-w-2xl">
            "{archetype.description}"
          </p>

          <div className="flex gap-4 pt-4">
             <Button 
              onClick={() => handleBuildLikeThis(`Template: ${archetype.name}`, archetype.fullDeck)}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Load Template into Builder
            </Button>
             <Button size="lg" variant="outline" className="gap-2" onClick={() => window.print()}>
                Export Report
             </Button>
          </div>
        </div>

        {/* Collection Snapshot Card */}
        <Card className="border-primary/20 bg-primary/[0.02] shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <TrendingUp className="w-32 h-32" />
          </div>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Collection Readiness
             </CardTitle>
             <CardDescription>How close are you to this tournament shell?</CardDescription>
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

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none">Market Value</p>
                      <p className="text-lg font-bold">{formatPrice(analysis.totalValue)}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none">Cost to Finish</p>
                      <p className="text-lg font-bold text-amber-500">{formatPrice(analysis.missingValue)}</p>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Library className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Track your collection</p>
                  <p className="text-xs text-muted-foreground">Sign in to see your readiness for this archetype.</p>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link href="/login">Sign In to Lorbound</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
         {/* Ink Curve */}
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Ink Curve Analysis
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-[200px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={analysis.curveData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="cost" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         {/* Type Breakdown */}
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" /> Type Distribution
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                          data={analysis.typeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analysis.typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-2">
                  {analysis.typeData.map(t => (
                    <div key={t.name} className="flex items-center gap-2 text-[10px] font-bold">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                       <span className="text-muted-foreground">{t.name}</span>
                       <span className="ml-auto">{t.value}</span>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Strengths & Weaknesses */}
         <div className="space-y-4">
            <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
               <CardHeader className="py-3">
                  <CardTitle className="text-xs uppercase font-bold text-emerald-500 flex items-center gap-2">
                     <TrendingUp className="w-3 h-3" /> Core Strengths
                  </CardTitle>
               </CardHeader>
               <CardContent className="py-0 pb-4">
                  <ul className="space-y-2">
                     {archetype.strengths.map((s, i) => (
                       <li key={i} className="text-sm font-medium flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {s}
                       </li>
                     ))}
                  </ul>
               </CardContent>
            </Card>
            <Card className="border-red-500/20 bg-red-500/[0.02]">
               <CardHeader className="py-3">
                  <CardTitle className="text-xs uppercase font-bold text-red-500 flex items-center gap-2">
                     <ShieldAlert className="w-3 h-3" /> Potential Pitfalls
                  </CardTitle>
               </CardHeader>
               <CardContent className="py-0 pb-4">
                  <ul className="space-y-2">
                     {archetype.weaknesses.map((w, i) => (
                       <li key={i} className="text-sm font-medium flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {w}
                       </li>
                     ))}
                  </ul>
               </CardContent>
            </Card>
         </div>
      </div>

      {/* Matchup Matrix */}
      <div className="space-y-8 mb-16">
         <div className="flex items-center gap-2 border-b pb-4">
            <h2 className="text-3xl font-serif font-bold">Matchup Matrix</h2>
            <Badge variant="secondary">Statistical Projections</Badge>
         </div>
         <div className="grid md:grid-cols-3 gap-6">
            {archetype.matchups.map(m => {
              const opp = ARCHETYPES.find(a => a.id === m.opponentId);
              return (
                <Card key={m.opponentId} className="relative overflow-hidden group">
                  <div className={cn(
                    "absolute top-0 left-0 w-1.5 h-full",
                    m.winRate >= 50 ? "bg-emerald-500" : "bg-red-500"
                  )} />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                       <div>
                          <CardTitle className="md:text-lg">{opp?.name || m.opponentId}</CardTitle>
                          <CardDescription>Competitive Outlook</CardDescription>
                       </div>
                       <div className={cn(
                         "text-2xl font-mono font-bold shrink-0",
                         m.winRate >= 50 ? "text-emerald-500" : "text-red-500"
                       )}>
                          {m.winRate}%
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{m.note}"
                    </p>
                  </CardContent>
                </Card>
              );
            })}
         </div>
      </div>

      {/* Tournament Implementations */}
      {tournamentResults.length > 0 && (
        <div className="space-y-6 mb-16">
          <div className="flex items-center gap-2 border-b pb-4">
             <h2 className="text-3xl font-serif font-bold">Tournament Winning Lists</h2>
             <Badge variant="secondary">Verified Real-World Results</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {tournamentResults.map((tr) => (
               <Card key={tr.id} className="p-5 flex flex-col hover:border-primary/40 transition-colors group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-10 blur-xl group-hover:opacity-20 transition-opacity">
                   <Trophy className="w-24 h-24" />
                 </div>
                 
                 <div className="flex items-center gap-3 mb-4 relative z-10">
                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shadow-inner">
                     {tr.placement}{tr.placement === 1 ? 'st' : tr.placement === 2 ? 'nd' : tr.placement === 3 ? 'rd' : 'th'}
                   </div>
                   <div>
                     <h4 className="font-bold text-lg leading-tight">{tr.playerName}</h4>
                     <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                       {tr.tournamentName}
                     </span>
                   </div>
                 </div>

                 <div className="mt-auto pt-4 flex gap-2 border-t relative z-10">
                   <Button 
                     variant="secondary" 
                     className="flex-1 gap-2"
                     onClick={() => handleBuildLikeThis(`${tr.tournamentName} - ${tr.playerName} Top 8`, tr.decklist)}
                   >
                     <Download className="w-4 h-4" /> Import to Builder
                   </Button>
                   <Button 
                     variant="outline" 
                     className="flex-1 gap-1"
                     onClick={() => {
                        if(allCards.length === 0) return;
                        const affiliateId = import.meta.env.VITE_TCGPLAYER_AFFILIATE_ID || "";
                        const lines = tr.decklist.map(entry => `${entry.qty} ${entry.name}${entry.subtitle ? ` - ${entry.subtitle}` : ""}`).join("||");
                        window.open(`https://tcgplayer.pxf.io/c/${affiliateId}/1830156/21018?u=https://www.tcgplayer.com/massentry?productline=Lorcana TCG&c=${encodeURIComponent(lines)}`, '_blank');
                     }}
                   >
                     Buy Deck
                   </Button>
                 </div>
               </Card>
             ))}
          </div>
        </div>
      )}

      {/* Deck List Breakdown */}
      <div className="space-y-8">
         <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
               <Library className="w-8 h-8 text-primary" /> Full Tournament Shell
            </h2>
            <div className="flex gap-4 text-sm font-medium text-muted-foreground">
               <span>Characters: {analysis.typeData.find(t => t.name === 'Character')?.value || 0}</span>
               <span>Non-Characters: {analysis.totalRequired - (analysis.typeData.find(t => t.name === 'Character')?.value || 0)}</span>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {analysis.cardsInDeck.map((ad, i) => (
              <div key={i} className="relative group">
                {ad.card ? (
                  <>
                    <CardDisplay card={ad.card} className={cn(
                      "transition-opacity",
                      user && ad.ownedQty === 0 && "opacity-40 grayscale-[0.6]"
                    )} />
                    {user && (
                      <>
                        <div className="absolute -top-3 -right-3 min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-lg bg-card border border-primary/20 shadow-lg z-10 font-bold text-xs">
                           {ad.ownedQty} <span className="mx-0.5 opacity-40">/</span> {ad.qty}
                        </div>
                        {ad.missingQty > 0 && (
                          <div className="absolute -bottom-2 -left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg z-10">
                            Missing {ad.missingQty}
                          </div>
                        )}
                      </>
                    )}
                    {!user && (
                      <div className="absolute -top-3 -right-3 min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg bg-card border border-primary/20 shadow-lg z-10 font-bold text-xs">
                         x{ad.qty}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-[2/3] w-full rounded-lg border border-dashed flex flex-col items-center justify-center text-center p-2 bg-muted/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{ad.name}</p>
                    <p className="text-[8px] text-muted-foreground/60">{ad.subtitle}</p>
                    <p className="text-[10px] text-destructive mt-2 font-bold">Data Missing</p>
                  </div>
                )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
