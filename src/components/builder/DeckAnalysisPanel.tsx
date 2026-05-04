import { Link } from "wouter";
import { Sparkles, ChevronDown, Archive } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as ChartTooltip } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { inkHexColors } from "@/components/ui/card-display";

interface CollectionStats {
  totalMissing: number;
  costToFinish: number;
  missingByCard: Record<string, number>;
}

interface TypeBreakdown {
  type: string;
  count: number;
}

interface CostCurveEntry {
  cost: string;
  count: number;
  [ink: string]: string | number;
}

interface Props {
  user: { id: string } | null;
  totalCards: number;
  deckCardsLength: number;
  avgCost: number;
  pieData: { name: string; value: number }[];
  typeBreakdown: TypeBreakdown[];
  costCurve: CostCurveEntry[];
  activeInks: string[];
  uninkableCount: number;
  collectionStats: CollectionStats;
  isLegalSize: boolean;
  isLegalInkCount: boolean;
  illegalCardsCount: number;
  format: string;
  formatPrice: (val: number) => string;
}

export function DeckAnalysisPanel({
  user,
  totalCards,
  deckCardsLength,
  avgCost,
  pieData,
  typeBreakdown,
  costCurve,
  activeInks,
  uninkableCount,
  collectionStats,
  isLegalSize,
  isLegalInkCount,
  illegalCardsCount,
  format,
  formatPrice,
}: Props) {
  const TYPE_COLORS: Record<string, string> = {
    Character: "bg-blue-500",
    Action: "bg-violet-500",
    Song: "bg-amber-500",
    Item: "bg-emerald-500",
    Location: "bg-rose-500",
  };

  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg">Deck Analysis</h3>
          </div>

          {/* Collection Coverage Toggle */}
          <Collapsible className="bg-primary/5 rounded-xl border border-primary/20 overflow-hidden group/collapsible">
            <CollapsibleTrigger className="w-full p-3 flex justify-between items-center hover:bg-primary/10 transition-colors [&[data-state=open]>div>svg]:rotate-180">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Collection Coverage
              </h4>
              <div className="flex items-center gap-2">
                {user && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 rounded-full text-primary">
                    {totalCards > 0 ? Math.round(((totalCards - collectionStats.totalMissing) / totalCards) * 100) : 0}%
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-primary transition-transform duration-200" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 pt-0 space-y-3">
                {user ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Missing Cards</span>
                        <span className="font-bold">{collectionStats.totalMissing}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost to Finish</span>
                        <span className="font-bold text-amber-500">{formatPrice(collectionStats.costToFinish)}</span>
                      </div>
                    </div>
                    <Progress value={totalCards > 0 ? ((totalCards - collectionStats.totalMissing) / totalCards) * 100 : 0} className="h-1.5" />
                  </>
                ) : (
                  <div className="space-y-3 mt-2">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Sign in to track which cards you own and calculate the cost to complete this deck.
                    </p>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="w-full h-8 text-[10px] font-bold uppercase tracking-wider">
                        Sign In to track
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Deck Summary Stats */}
          {totalCards > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-xl border text-center">
                <p className="text-2xl font-bold font-serif text-primary">{avgCost.toFixed(1)}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Avg Cost</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border text-center">
                <p className="text-2xl font-bold font-serif">{deckCardsLength}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Unique Cards</p>
              </div>
            </div>
          )}

          {/* Ink Distribution */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Ink Colors <span className="ml-2 font-normal">{activeInks.length} / 2</span>
            </h4>
            {pieData.length > 0 ? (
              <div className="space-y-2">
                <div className="h-3 rounded-full overflow-hidden flex bg-muted/30 border">
                  {pieData.map(entry => {
                    const pct = (entry.value / totalCards) * 100;
                    return (
                      <div
                        key={entry.name}
                        className="transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: inkHexColors[entry.name as keyof typeof inkHexColors] ?? "#888" }}
                        title={`${entry.name}: ${entry.value} (${Math.round(pct)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: inkHexColors[entry.name as keyof typeof inkHexColors] ?? "#888" }} />
                      <span className="text-[10px] text-muted-foreground">
                        {entry.name} <strong className="text-foreground">{entry.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No cards added</p>
            )}
          </div>

          {/* Card Type Breakdown */}
          {typeBreakdown.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Type Breakdown</h4>
              <div className="h-3 rounded-full overflow-hidden flex bg-muted/30 border">
                {typeBreakdown.map(t => (
                  <div
                    key={t.type}
                    className={`${TYPE_COLORS[t.type] || "bg-muted"} transition-all duration-500`}
                    style={{ width: `${(t.count / totalCards) * 100}%` }}
                    title={`${t.type}: ${t.count} (${Math.round((t.count / totalCards) * 100)}%)`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {typeBreakdown.map(t => (
                  <div key={t.type} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[t.type] || "bg-muted"}`} />
                    <span className="text-[10px] text-muted-foreground">{t.type} <strong className="text-foreground">{t.count}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uninkables */}
          <div className="p-3 bg-muted/30 rounded-xl border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uninkables</span>
              <span className={`text-sm font-bold ${uninkableCount > 16 ? "text-destructive" : "text-emerald-500"}`}>
                {uninkableCount} / {totalCards}
              </span>
            </div>
            <Progress value={totalCards > 0 ? (uninkableCount / totalCards) * 100 : 0} className="h-2" />
            {uninkableCount > 16 && (
              <p className="text-[10px] text-destructive mt-2 leading-tight">High uninkable ratio increases risk of bricking your inkwell.</p>
            )}
          </div>

          {/* Ink Curve */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Ink Curve</h4>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costCurve} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="cost" tick={{ fontSize: 11 }} />
                  <ChartTooltip formatter={(val: number, name: string) => [`${val} cards`, name]} contentStyle={{ fontSize: 12 }} />
                  {activeInks.map(ink => (
                    <Bar
                      key={ink}
                      dataKey={ink}
                      stackId="curve"
                      fill={inkHexColors[ink as keyof typeof inkHexColors] ?? "#888"}
                      radius={activeInks.indexOf(ink) === activeInks.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Validation */}
          <div className="rounded-xl border p-4 space-y-3 bg-card shadow-sm">
            <h4 className="text-sm font-semibold mb-1">Validation</h4>
            {format !== "Any" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Format ({format})</span>
                <span className={illegalCardsCount === 0 ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>
                  {illegalCardsCount === 0 ? "Legal" : `${illegalCardsCount} illegal cards`}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Card count</span>
              <span className={isLegalSize ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>
                {isLegalSize ? "Legal" : totalCards > 60 ? `${totalCards - 60} over` : `${60 - totalCards} short`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ink limit</span>
              <span className={isLegalInkCount ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>
                {isLegalInkCount ? "Legal" : "Exceeded"}
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
