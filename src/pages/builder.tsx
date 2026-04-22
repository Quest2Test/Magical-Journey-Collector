import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useAllCards } from "@/hooks/useCards";
import { Card } from "@/data/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Save, Plus, Minus, Trash2, Loader2, Copy, Filter, SlidersHorizontal, Settings2, Sparkles, AlertTriangle, FileText, ClipboardPaste, Droplet, Clock, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as ChartTooltip, PieChart, Pie, Cell } from "recharts";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { inkHexColors, CardDisplay, getInkLogo } from "@/components/ui/card-display";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from "@/hooks/useCollection";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/components/currency-provider";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { getCardLegality } from "@/lib/legality";
import { useDecks } from "@/hooks/useDecks";
import { useSets } from "@/hooks/useCards";
import { SET_ACCENT, SET_ACRONYMS } from "@/lib/sets";
import { ScrollBar } from "@/components/ui/scroll-area";
import { getBaseCardValue } from "@/lib/pricing";
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function DeckBuilder() {
  const { data: allCards = [], isLoading } = useAllCards();
  const { data: sets = [] } = useSets();
  const [deckName, setDeckName] = useState("New Deck");
  const [deckCards, setDeckCards] = useState<{ card: Card; qty: number }[]>([]);
  const [search, setSearch] = useState("");

  // Advanced filters
  const [filterInk, setFilterInk] = useState<string[]>([]);
  const [filterCost, setFilterCost] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterSet, setFilterSet] = useState<string>("All");
  const [inkableOnly, setInkableOnly] = useState(false);
  const [showUnreleased, setShowUnreleased] = useState(false);
  const [smartFilter, setSmartFilter] = useState(true);
  const [groupingMode, setGroupingMode] = useState<"type" | "cost">("cost");
  const [format, setFormat] = useState<"Any" | "Core" | "Infinity">("Any");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [deckId, setDeckId] = useState(() => `deck_${Date.now()}`);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { decks, saveDeck } = useDecks();
  const { getEntry } = useCollection();
  const { user } = useAuth();

  const setCountMap = useMemo(() => {
    return sets.reduce((acc, set) => ({ ...acc, [set.id]: set.count || 204 }), {} as Record<string, number>);
  }, [sets]);

  // Handle loading deck for editing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");

    if (editId && decks.length > 0) {
      const existingDeck = decks.find(d => d.id === editId);
      if (existingDeck) {
        setDeckName(existingDeck.name);
        setDeckCards(existingDeck.entries);
        setFormat(existingDeck.format);
        setDeckId(existingDeck.id);
        setSavedAt(existingDeck.createdAt);
      }
    }
  }, [decks]);

  // Handle template import from Meta page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isImportReq = params.get("import") === "latest";

    if (isImportReq && allCards.length > 0) {
      const raw = localStorage.getItem("lorcana_import_temp");
      if (raw) {
        try {
          const { name, cards } = JSON.parse(raw);
          const entries: { card: Card; qty: number }[] = [];

          cards.forEach((c: any) => {
            const match = allCards.find(card =>
              card.name.toLowerCase() === c.name.toLowerCase() &&
              (!c.subtitle || card.subtitle?.toLowerCase() === c.subtitle.toLowerCase())
            );
            if (match) {
              entries.push({ card: match, qty: c.qty });
            }
          });

          if (entries.length > 0) {
            setDeckName(name);
            setDeckCards(entries);
            toast({
              title: "Template Imported",
              description: `Loaded ${entries.length} cards from the ${name.replace("Template: ", "")} meta archetype.`
            });
            // Cleanup
            localStorage.removeItem("lorcana_import_temp");
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }
        } catch (e) {
          console.error("Failed to parse import template", e);
        }
      }
    }
  }, [allCards, toast]);

  const totalCards = deckCards.reduce((acc, curr) => acc + curr.qty, 0);

  // Deck Statistics Processing
  const inkDistribution: Record<string, number> = {};
  const costCurve = Array.from({ length: 7 }, (_, i) => ({
    cost: i < 6 ? String(i + 1) : "7+",
    count: 0,
  }));
  const cardsByType: Record<string, typeof deckCards> = {
    Character: [],
    Action: [],
    Item: [],
    Location: [],
    Song: [],
  };

  let uninkableCount = 0;
  let totalValue = 0;

  deckCards.forEach(({ card, qty }) => {
    inkDistribution[card.inkColor] = (inkDistribution[card.inkColor] || 0) + qty;
    const costIndex = Math.min(card.cost - 1, 6);
    if (costIndex >= 0) costCurve[costIndex].count += qty;
    if (!cardsByType[card.type]) cardsByType[card.type] = [];
    cardsByType[card.type].push({ card, qty });

    if (!card.inkable) uninkableCount += qty;
    totalValue += (Math.max(card.priceUsd || 0, card.priceUsdFoil || 0) * qty);
  });

  const activeInks = Object.keys(inkDistribution);
  const isLegalInkCount = activeInks.length <= 2;
  const isLegalSize = totalCards === 60;
  const maxInksReached = activeInks.length >= 2;
  const pieData = Object.entries(inkDistribution).map(([name, value]) => ({ name, value }));
  const avgCost = totalCards > 0
    ? deckCards.reduce((sum, e) => sum + e.card.cost * e.qty, 0) / totalCards
    : 0;

  const typeBreakdown = Object.entries(cardsByType)
    .map(([type, cards]) => ({ type, count: cards.reduce((a, c) => a + c.qty, 0) }))
    .filter(t => t.count > 0);

  const illegalCardsCount = useMemo(() => {
    if (format === "Any") return 0;
    return deckCards.filter(({ card }) => {
      const legality = getCardLegality(card, allCards);
      return format === "Core" ? legality.core !== "Legal" : legality.infinity !== "Legal";
    }).length;
  }, [deckCards, format, allCards]);

  const availableSets = useMemo(() => Array.from(new Set(allCards.map(c => c.set))).sort(), [allCards]);

  // Filtering Left Panel
  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      if (search) {
        const s = search.toLowerCase();
        if (!c.name.toLowerCase().includes(s) && !c.subtitle?.toLowerCase().includes(s)) return false;
      }
      // Permanently exclude unrevealed placeholders from the builder
      if (c.name.startsWith("Unrevealed Card #") || c.name.startsWith("Unreleased Card #")) return false;

      if (!showUnreleased && c.releasedAt && new Date(c.releasedAt) > new Date()) return false;
      if (inkableOnly && !c.inkable) return false;
      if (filterSet !== "All" && c.set !== filterSet) return false;
      if (filterCost.length > 0) {
        if (!filterCost.includes(c.cost >= 7 ? "7+" : c.cost.toString())) return false;
      }
      if (filterInk.length > 0 && !filterInk.includes(c.inkColor)) return false;
      if (filterType.length > 0 && !filterType.includes(c.type)) return false;

      // Smart Filter logic: locks browser to current deck inks if deck is saturated
      if (smartFilter && maxInksReached) {
        if (!activeInks.includes(c.inkColor)) return false;
      }

      if (format !== "Any") {
        const legality = getCardLegality(c, allCards);
        if (format === "Core" && legality.core !== "Legal") return false;
        if (format === "Infinity" && legality.infinity !== "Legal") return false;
      }

      return true;
    }).sort((a, b) => {
      // 1. Sort by Ink Color (Alphabetically)
      if (a.inkColor !== b.inkColor) {
        return a.inkColor.localeCompare(b.inkColor);
      }

      // 2. Sort by Set Latest First (Descending using setNum)
      const aSetNum = typeof a.setNum === 'number' && !isNaN(a.setNum) ? a.setNum : 0;
      const bSetNum = typeof b.setNum === 'number' && !isNaN(b.setNum) ? b.setNum : 0;
      if (aSetNum !== bSetNum) {
        return bSetNum - aSetNum;
      }

      // 3. Fallback: Sort by Cost (Ascending)
      if (a.cost !== b.cost) {
        return a.cost - b.cost;
      }

      // 4. Fallback: Sort by Name
      return a.name.localeCompare(b.name);
    });
  }, [allCards, search, inkableOnly, filterSet, filterCost, filterInk, filterType, smartFilter, maxInksReached, activeInks, format]);

  // Grouping Right Canvas
  const groupedDeck = useMemo(() => {
    const sortGroup = (cards: typeof deckCards) =>
      [...cards].sort((a, b) => a.card.name.localeCompare(b.card.name));

    if (groupingMode === "type") {
      const sorted: Record<string, typeof deckCards> = {};
      Object.entries(cardsByType).forEach(([type, cards]) => {
        if (cards.length > 0) sorted[type] = sortGroup(cards);
      });
      return sorted;
    } else {
      const byCost: Record<string, typeof deckCards> = {};
      deckCards.forEach(e => {
        const costStr = e.card.cost >= 7 ? "7+" : e.card.cost.toString();
        if (!byCost[costStr]) byCost[costStr] = [];
        byCost[costStr].push(e);
      });
      const sorted: Record<string, typeof deckCards> = {};
      ["1", "2", "3", "4", "5", "6", "7+"].forEach(k => {
        if (byCost[k]) sorted[k] = sortGroup(byCost[k]);
      });
      return sorted;
    }
  }, [deckCards, groupingMode, cardsByType]);

  // Ownership Analysis
  const collectionStats = useMemo(() => {
    let totalMissing = 0;
    let costToFinish = 0;
    const missingByCard: Record<string, number> = {};

    deckCards.forEach(({ card, qty }) => {
      const entry = getEntry(card.id);
      const owned = entry.normal + entry.foil;
      const missing = Math.max(0, qty - owned);

      if (missing > 0) {
        totalMissing += missing;
        // Use the base card value (normal, or foil if normal is missing)
        const price = getBaseCardValue(card);
        costToFinish += missing * price;
        missingByCard[card.id] = missing;
      }
    });

    return { totalMissing, costToFinish, missingByCard };
  }, [deckCards, getEntry]);

  const addCard = (card: Card) => {
    // Block adding if deck is already at 60 cards
    if (totalCards >= 60) {
      toast({
        title: "Deck Full",
        description: "A Lorcana deck must contain exactly 60 cards. Remove a card before adding another.",
        variant: "destructive"
      });
      return;
    }

    // Show a small reminder if the card is unreleased
    if (card.releasedAt && new Date(card.releasedAt) > new Date()) {
      toast({
        title: "Future Release Added",
        description: `${card.name} is a current unreleased card.`,
        duration: 3000,
      });
    }

    const totalSameIdentity = deckCards.reduce((sum, p) => {
      if (p.card.name === card.name && p.card.subtitle === card.subtitle) {
        return sum + p.qty;
      }
      return sum;
    }, 0);

    if (totalSameIdentity >= 4) {
      toast({
        title: "Deck Limit Reached",
        description: "You cannot have more than 4 copies of the same card (including alt-arts/enchanteds).",
        variant: "destructive"
      });
      return;
    }

    setDeckCards(prev => {
      const existing = prev.find(p => p.card.id === card.id);
      if (existing) {
        return prev.map(p => (p.card.id === card.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { card, qty: 1 }];
    });
  };

  const removeCard = (cardId: string, removeAll = false) => {
    setDeckCards(prev => {
      const existing = prev.find(p => p.card.id === cardId);
      if (!existing) return prev;
      if (removeAll || existing.qty === 1) return prev.filter(p => p.card.id !== cardId);
      return prev.map(p => (p.card.id === cardId ? { ...p, qty: p.qty - 1 } : p));
    });
  };

  const handleExport = (type: 'text' | 'pixelborn' | 'inktable' | 'melee' | 'dreamborn' = 'text') => {
    let exportText = "";

    if (type === 'dreamborn') {
      deckCards.forEach(entry => {
        exportText += `${entry.qty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}\n`;
      });
      window.open(`https://dreamborn.ink/decks/new?import=${encodeURIComponent(exportText)}`, '_blank');
      toast({
        title: "Exported to Dreamborn",
        description: "Your deck has been opened in Dreamborn.ink!"
      });
      return;
    }

    if (type === 'pixelborn' || type === 'melee') {
      deckCards.forEach(entry => {
        exportText += `${entry.qty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}\n`;
      });
    } else if (type === 'inktable') {
      // Inktable often uses Name - Subtitle (Set) [Number]
      deckCards.forEach(entry => {
        const acronym = entry.card.expansion; // This should ideally be the set acronym
        exportText += `${entry.qty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""} (${acronym})\n`;
      });
    } else {
      exportText = `Deck: ${deckName}\n`;
      exportText += `Format: ${format} | Total: ${totalCards} cards | Value: ${formatPrice(totalValue)}\n\n`;
      Object.entries(groupedDeck).forEach(([groupName, cards]) => {
        if (cards.length === 0) return;
        exportText += `--- ${groupingMode === 'type' ? groupName + 's' : 'Cost ' + groupName} ---\n`;
        cards.forEach(entry => {
          exportText += `${entry.qty}x ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}\n`;
        });
        exportText += "\n";
      });
    }

    navigator.clipboard.writeText(exportText);
    toast({
      title: "Copied!",
      description: `Deck list copied to clipboard as ${type === 'text' ? 'plain text' : type === 'melee' ? 'Melee.gg format' : type === 'pixelborn' ? 'Pixelborn format' : 'Inktable format'}!`
    });
  };

  const handleSave = () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    const inkColors = [...new Set(deckCards.map(e => e.card.inkColor))];
    const deck = {
      id: deckId,
      name: deckName,
      format,
      inkColors,
      totalCards,
      totalValue,
      entries: deckCards,
      createdAt: savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDeck(deck);
    setSavedAt(deck.createdAt);
    toast({ title: "Deck Saved!", description: `"${deckName}" has been saved to My Decks.` });
  };

  const handleClearDeck = () => {
    if (deckCards.length === 0) return;
    setDeckCards([]);
    toast({ title: "Deck Cleared", description: "All cards have been removed from your deck." });
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    const entries: { card: Card; qty: number }[] = [];
    let matched = 0;
    let unmatched = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // Match patterns: "4 Card Name - Subtitle" or "4x Card Name - Subtitle"
      const match = trimmed.match(/^(\d+)x?\s+(.+)$/);
      if (!match) return;
      const qty = Math.min(parseInt(match[1], 10), 4);
      const rest = match[2].trim();
      const [name, subtitle] = rest.split(' - ').map(s => s.trim());

      const found = allCards.find(c =>
        c.name.toLowerCase() === name.toLowerCase() &&
        (!subtitle || c.subtitle?.toLowerCase() === subtitle.toLowerCase())
      );

      if (found) {
        // Check if already in entries (dedupe)
        const existing = entries.find(e => e.card.id === found.id);
        if (existing) {
          existing.qty = Math.min(existing.qty + qty, 4);
        } else {
          entries.push({ card: found, qty });
        }
        matched++;
      } else {
        unmatched++;
      }
    });

    // Trim to 60 cards total
    let total = 0;
    const capped = entries.map(e => {
      const allowed = Math.min(e.qty, 60 - total);
      total += allowed;
      return { ...e, qty: allowed };
    }).filter(e => e.qty > 0);

    if (capped.length > 0) {
      setDeckCards(capped);
      setImportOpen(false);
      setImportText("");
      toast({
        title: "Deck Imported",
        description: `Loaded ${matched} card${matched !== 1 ? 's' : ''}${unmatched > 0 ? `, ${unmatched} not found` : ''} — ${total} total cards.`
      });
    } else {
      toast({ title: "Import Failed", description: "No matching cards found. Check your list format.", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 flex flex-col bg-background overflow-hidden z-40 animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0 overflow-x-auto gap-4">
        <Input
          value={deckName}
          onChange={e => setDeckName(e.target.value)}
          className="w-[200px] sm:w-[300px] font-serif font-bold text-lg bg-transparent border-transparent hover:border-input focus:border-input focus:ring-1 transition-all shrink-0"
        />
        <div className="flex items-center gap-4 shrink-0">
          <Select value={format} onValueChange={(v: any) => setFormat(v)}>
            <SelectTrigger className="w-[120px] sm:w-[150px] h-8 text-xs bg-muted/50 border-border">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any">Any Format</SelectItem>
              <SelectItem value="Core">Core Constructed</SelectItem>
              <SelectItem value="Infinity">Infinity Constructed</SelectItem>
            </SelectContent>
          </Select>
          <span className="font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full text-sm">
            {formatPrice(totalValue)}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Progress Ring */}
            <svg width="32" height="32" viewBox="0 0 36 36" className="shrink-0">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/30" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${Math.min((totalCards / 60) * 97.4, 97.4)} 97.4`}
                transform="rotate(-90 18 18)"
                className={totalCards === 60 ? "text-emerald-500 stroke-current" : totalCards > 60 ? "text-destructive stroke-current" : "text-primary stroke-current"}
              />
            </svg>
            <span className={`text-sm font-bold tabular-nums ${totalCards === 60 ? "text-green-500" : totalCards > 60 ? "text-destructive" : "text-muted-foreground"}`}>
              {totalCards}/60
            </span>
          </div>
          {!isLegalInkCount && (
            <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
              Max 2 inks
            </span>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="gap-2 h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ClipboardPaste className="w-3.5 h-3.5" /> Import
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tournament Play</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('melee')}>
                  Melee.gg Official
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (!savedAt) {
                    toast({ title: "Please save deck first", description: "Your deck must be saved to My Decks before printing an official sheet.", variant: "destructive" });
                    return;
                  }
                  window.open(`/deck/${deckId}/print`, '_blank');
                }}>
                  Physical Print Sheet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Digital Platforms</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('dreamborn')}>
                  Export to Dreamborn.ink ↗
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pixelborn')}>
                  Pixelborn Format
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('inktable')}>
                  Inktable Format
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Standard</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('text')}>
                  Plain Text List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="gap-2 h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Deck
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDeck}
              disabled={deckCards.length === 0}
              className="gap-2 h-8 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Legality Warning Banner */}
      {totalCards > 0 && (!isLegalSize || !isLegalInkCount || illegalCardsCount > 0) && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3 shrink-0 overflow-x-auto">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex items-center gap-3 text-xs font-medium flex-wrap">
            {totalCards !== 60 && (
              <span className="text-amber-600 dark:text-amber-400">
                {totalCards < 60 ? `${60 - totalCards} cards short of 60` : `${totalCards - 60} cards over 60`}
              </span>
            )}
            {!isLegalInkCount && (
              <span className="text-amber-600 dark:text-amber-400">Too many ink colors ({activeInks.length}/2)</span>
            )}
            {illegalCardsCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400">{illegalCardsCount} card{illegalCardsCount !== 1 ? 's' : ''} illegal in {format}</span>
            )}
          </div>
        </div>
      )}

      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden min-h-0">
        {/* Left: Card Browser */}
        <ResizablePanel defaultSize={28} minSize={20}>
          <div className="flex flex-col h-full border-r bg-background min-h-0">
            <div className="p-2 border-b shrink-0 bg-card/30 backdrop-blur-sm">
              {/* Row 1: Search & Set Select */}
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                  <Input
                    placeholder="Search cards..."
                    className="pl-8 h-8 text-xs bg-background/50 border-border/40 focus:ring-1"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filterSet === "All" ? "All" : filterSet} onValueChange={(v: string) => setFilterSet(v)}>
                  <SelectTrigger className="w-[140px] h-8 text-[10px] bg-background/50 border-border/40 font-bold uppercase tracking-wider">
                    <SelectValue placeholder="All Sets" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-wider">All Sets</SelectItem>
                    {sets.map(set => (
                      <SelectItem 
                        key={set.id} 
                        value={set.name} 
                        className="text-[10px] font-medium"
                      >
                        {SET_ACRONYMS[set.id] || set.id}: {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Surfaced Ribbon */}
              <div className="flex items-center gap-3 py-1">
                {/* Core Filters: Inks & Costs Stacked */}
                <div className="flex flex-col gap-2 shrink-0">
                  {/* Inks Row */}
                  <div className="flex items-center gap-1 shrink-0 px-1 py-0.5 bg-muted/20 rounded-md border border-border/10">
                    {Object.entries(inkHexColors).map(([inkName]) => {
                      const isActive = filterInk.includes(inkName);
                      const isLocked = smartFilter && maxInksReached && !activeInks.includes(inkName);
                      return (
                        <TooltipProvider key={inkName} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  if (isLocked) return;
                                  setFilterInk(p => p.includes(inkName) ? p.filter(x => x !== inkName) : [...p, inkName])
                                }}
                                className={cn(
                                  "w-6 h-6 rounded-sm flex items-center justify-center transition-all",
                                  isLocked ? "opacity-10 grayscale cursor-not-allowed" : "hover:scale-110 grayscale-[0.3]",
                                  isActive && "ring-1 ring-primary ring-offset-1 ring-offset-background grayscale-0 opacity-100"
                                )}
                              >
                                <img src={getInkLogo(inkName)} alt={inkName} className="w-full h-full object-contain" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold uppercase">{inkName}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>

                  {/* Costs Row */}
                  <div className="flex items-center gap-0.5 bg-muted/20 rounded-md p-0.5 border border-border/10">
                    {["1", "2", "3", "4", "5", "6", "7+"].map(c => (
                      <button
                        key={c}
                        onClick={() => setFilterCost(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
                        className={cn(
                          "w-5 h-5 rounded text-[9px] font-black transition-all",
                          filterCost.includes(c) ? "bg-primary text-primary-foreground" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-[1px] h-10 bg-border/20 mx-0.5" />

                {/* Toggles */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSmartFilter(!smartFilter)}
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center border transition-all",
                            smartFilter ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_-2px_rgba(var(--primary),0.3)]" : "border-border/40 text-muted-foreground/40 hover:border-border/60"
                          )}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px] font-bold uppercase">Smart Sync ({smartFilter ? 'ON' : 'OFF'})</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setInkableOnly(!inkableOnly)}
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center border transition-all",
                            inkableOnly ? "bg-blue-500/20 border-blue-500/40 text-blue-500" : "border-border/40 text-muted-foreground/40 hover:border-border/60"
                          )}
                        >
                          <Droplet className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px] font-bold uppercase">Inkable Only ({inkableOnly ? 'ON' : 'OFF'})</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowUnreleased(!showUnreleased)}
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center border transition-all",
                            showUnreleased ? "bg-amber-500/20 border-amber-500/40 text-amber-500" : "border-border/40 text-muted-foreground/40 hover:border-border/60"
                          )}
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px] font-bold uppercase">Show Spoilers ({showUnreleased ? 'ON' : 'OFF'})</TooltipContent>
                    </Tooltip>

                    <Select value={filterType[0] || "All"} onValueChange={(v) => setFilterType(v === "All" ? [] : [v])}>
                      <SelectTrigger className="w-24 h-8 text-[10px] bg-muted/30 border-border/20 font-bold uppercase tracking-tighter">
                        <SelectValue placeholder="TYPES" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Character">Characters</SelectItem>
                        <SelectItem value="Action">Actions</SelectItem>
                        <SelectItem value="Item">Items</SelectItem>
                        <SelectItem value="Location">Locations</SelectItem>
                      </SelectContent>
                    </Select>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {filteredCards.slice(0, 100).map(card => {
                    const inDeckQty = deckCards.find(e => e.card.id === card.id)?.qty || 0;
                    // Check total copies of this card identity (name+subtitle) across all variants
                    const totalIdentityCopies = deckCards.reduce((sum, e) => {
                      if (e.card.name === card.name && e.card.subtitle === card.subtitle) return sum + e.qty;
                      return sum;
                    }, 0);
                    const isMaxedOut = totalIdentityCopies >= 4;
                    const isDeckFull = totalCards >= 60;
                    return (
                      <HoverCard key={card.id} openDelay={200} closeDelay={50}>
                        <HoverCardTrigger asChild>
                          <button
                            onClick={() => addCard(card)}
                            disabled={isMaxedOut || isDeckFull}
                            className={`w-full flex items-center gap-2 p-2 rounded-md transition-colors text-left group ${inDeckQty > 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''} ${isMaxedOut || isDeckFull ? 'opacity-35 cursor-not-allowed' : 'hover:bg-secondary/70'}`}
                          >
                            <img
                              src={getInkLogo(card.inkColor)}
                              alt={card.inkColor}
                              className="w-5 h-5 object-contain shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate leading-tight flex items-center gap-1.5">
                                {card.name}
                                {!card.inkable && <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" title="Uninkable" />}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                                Cost {card.cost} · {card.type} · {card.cardNum}{setCountMap[card.set] ? `/${setCountMap[card.set]}` : ""}
                              </p>
                            </div>
                            {inDeckQty > 0 ? (
                              <span className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded shrink-0">
                                ×{inDeckQty}
                              </span>
                            ) : (
                              <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-[300px] p-0 border-0 shadow-2xl bg-transparent" align="start">
                          <CardDisplay card={card} className="w-full" />
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}
                  {filteredCards.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No cards matching filters</p>
                  )}
                  {filteredCards.length > 100 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Showing 100 of {filteredCards.length} — refine search
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center: Deck Canvas */}
        <ResizablePanel defaultSize={44} minSize={30}>
          <div className="h-full flex flex-col min-h-0 bg-background">
            <div className="p-3 border-b shrink-0 flex justify-between items-center bg-muted/20">
              <h2 className="font-serif font-bold tracking-wider uppercase text-sm text-muted-foreground">Deck Canvas</h2>
              <Select value={groupingMode} onValueChange={(v: any) => setGroupingMode(v)}>
                <SelectTrigger className="w-[150px] h-8 text-xs bg-card">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Group by Cost Curve</SelectItem>
                  <SelectItem value="type">Group by Card Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {totalCards === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8" />
                    </div>
                    <p className="font-medium mb-1">Your deck is empty</p>
                    <p className="text-sm">Click cards in the browser or use Quick Add to build it.</p>
                  </div>
                ) : (
                  Object.entries(groupedDeck).map(([groupName, cards]) => {
                    if (cards.length === 0) return null;
                    const groupTotal = cards.reduce((a, c) => a + c.qty, 0);
                    const displayTitle = groupingMode === 'type' ? `${groupName}s` : `Cost ${groupName}`;
                    return (
                      <div key={groupName} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold font-serif text-sm uppercase tracking-wider text-muted-foreground">
                            {displayTitle}
                          </h3>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                            {groupTotal}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {cards.map(({ card, qty }) => (
                            <div key={card.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-card border hover:border-primary/40 transition-colors group cursor-default">
                              {/* Inline card art thumbnail */}
                              <div className="w-9 h-12 rounded-md overflow-hidden shrink-0 bg-muted border border-border/50">
                                {card.image ? (
                                  <img
                                    src={card.thumbnail || card.image}
                                    alt={card.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <img src={getInkLogo(card.inkColor)} alt={card.inkColor} className="w-5 h-5 object-contain opacity-40" />
                                  </div>
                                )}
                              </div>
                              <div className="w-6 h-6 rounded flex items-center justify-center bg-muted text-xs font-bold border border-border/50 shrink-0">
                                {card.cost}
                              </div>
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-sm font-medium truncate flex items-center gap-1.5">
                                  {card.name}
                                  {!card.inkable && <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" title="Uninkable" />}
                                  {collectionStats.missingByCard[card.id] > 0 && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-500/20">
                                      Missing {collectionStats.missingByCard[card.id]}
                                    </span>
                                  )}
                                </p>
                                {card.subtitle && (
                                  <p className="text-[10px] text-muted-foreground truncate uppercase">
                                    {card.subtitle} · {card.cardNum}{setCountMap[card.set] ? `/${setCountMap[card.set]}` : ""}
                                  </p>
                                )}
                                {!card.subtitle && (
                                  <p className="text-[10px] text-muted-foreground truncate uppercase">
                                    {card.type} · {card.cardNum}{setCountMap[card.set] ? `/${setCountMap[card.set]}` : ""}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => removeCard(card.id)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center font-bold text-sm">{qty}</span>
                                <button
                                  onClick={() => addCard(card)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  disabled={qty >= 4 || totalCards >= 60}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeCard(card.id, true)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/20 text-destructive transition-colors opacity-0 group-hover:opacity-100 ml-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right: Stats */}
        <ResizablePanel defaultSize={28} minSize={20}>
          <div className="h-full flex flex-col bg-background min-h-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg">Deck Analysis</h3>
                </div>

                {/* Deck Summary Stats */}
                {totalCards > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-xl border text-center">
                      <p className="text-2xl font-bold font-serif text-primary">{avgCost.toFixed(1)}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Avg Cost</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-xl border text-center">
                      <p className="text-2xl font-bold font-serif">{deckCards.length}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Unique Cards</p>
                    </div>
                  </div>
                )}

                {/* Card Type Breakdown Bar */}
                {typeBreakdown.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Type Breakdown</h4>
                    <div className="h-3 rounded-full overflow-hidden flex bg-muted/30 border">
                      {typeBreakdown.map(t => {
                        const pct = (t.count / totalCards) * 100;
                        const colors: Record<string, string> = {
                          Character: 'bg-blue-500',
                          Action: 'bg-violet-500',
                          Song: 'bg-amber-500',
                          Item: 'bg-emerald-500',
                          Location: 'bg-rose-500',
                        };
                        return (
                          <div
                            key={t.type}
                            className={`${colors[t.type] || 'bg-muted'} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                            title={`${t.type}: ${t.count} (${Math.round(pct)}%)`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {typeBreakdown.map(t => {
                        const colors: Record<string, string> = {
                          Character: 'bg-blue-500',
                          Action: 'bg-violet-500',
                          Song: 'bg-amber-500',
                          Item: 'bg-emerald-500',
                          Location: 'bg-rose-500',
                        };
                        return (
                          <div key={t.type} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${colors[t.type] || 'bg-muted'}`} />
                            <span className="text-[10px] text-muted-foreground">{t.type} <strong className="text-foreground">{t.count}</strong></span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Collection Coverage */}
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> Collection Coverage
                    </h4>
                    <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 rounded-full text-primary">
                      {totalCards > 0 ? Math.round(((totalCards - collectionStats.totalMissing) / totalCards) * 100) : 0}%
                    </span>
                  </div>
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
                </div>

                {/* Inkable vs Uninkable Progress */}
                <div className="p-3 bg-muted/30 rounded-xl border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uninkables</span>
                    <span className={`text-sm font-bold ${uninkableCount > 16 ? 'text-destructive' : 'text-emerald-500'}`}>
                      {uninkableCount} / {totalCards}
                    </span>
                  </div>
                  <Progress value={totalCards > 0 ? (uninkableCount / totalCards) * 100 : 0} className="h-2" />
                  {uninkableCount > 16 && <p className="text-[10px] text-destructive mt-2 leading-tight">High uninkable ratio increases risk of bricking your inkwell.</p>}
                </div>

                {/* Ink Distribution */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Ink Colors
                    <span className="ml-2 font-normal">{activeInks.length} / 2</span>
                  </h4>
                  {pieData.length > 0 ? (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={55}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${Math.round(percent * 100)}%`
                            }
                            labelLine={false}
                            fontSize={10}
                          >
                            {pieData.map(entry => (
                              <Cell
                                key={entry.name}
                                fill={inkHexColors[entry.name] ?? "#888"}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            formatter={(val: number) => [`${val} cards`, "Count"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No cards added</p>
                  )}
                </div>

                {/* Ink Curve */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Ink Curve
                  </h4>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costCurve} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="cost" tick={{ fontSize: 11 }} />
                        <ChartTooltip
                          formatter={(val: number) => [`${val} cards`, "Count"]}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Legality Summary */}
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
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card rounded-2xl border shadow-2xl p-6 mx-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg">Import Decklist</h3>
                  <p className="text-xs text-muted-foreground">Paste a decklist in any standard format</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setImportOpen(false); setImportText(""); }} className="h-8 w-8 rounded-full">
                ×
              </Button>
            </div>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`4 Maui - Hero to All\n4 Maleficent - Monstrous Dragon\n4 Be Prepared\n...`}
              className="w-full h-48 p-3 rounded-xl border bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">Format: <code className="bg-muted px-1 rounded">qty Name - Subtitle</code> per line</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setImportOpen(false); setImportText(""); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleImport} disabled={!importText.trim()} className="gap-2">
                  <ClipboardPaste className="w-3.5 h-3.5" /> Import Deck
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Auth Guard Modal */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 text-center space-y-6 relative">
            {/* Visual Flair */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <div className="w-20 h-20 bg-primary/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl animate-pulse">
               <Save className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Save Your Lorbound Legacy</h2>
              <p className="text-indigo-200/70 text-sm leading-relaxed max-w-sm mx-auto">
                Sign up for a free account to securely save and manage your decks, track live card values, and export to tournament formats like Pixelborn and Melee.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 relative z-10">
              <Link href="/login?tab=signup">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-sm font-bold rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                  Become an Illumineer — Sign Up
                </Button>
              </Link>
              <Link href="/login?tab=signin">
                <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/5 h-10 text-xs font-bold uppercase tracking-widest">
                  Already a member? Log In
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Deck Persistence</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Market Tracking</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Export Formats</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
