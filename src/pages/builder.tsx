import { useState, useMemo, useEffect, useRef, useDeferredValue } from "react";
import { Link } from "wouter";
import { useAllCards } from "@/hooks/useCards";
import { Card } from "@/data/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Save, Plus, Minus, Trash2, Loader2, Copy, Filter, SlidersHorizontal, Settings2, Sparkles, AlertTriangle, FileText, ClipboardPaste, Droplet, Clock, Info, Archive, ChevronDown } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { inkHexColors, CardDisplay, getInkLogo } from "@/components/ui/card-display";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from "@/hooks/useCollection";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/components/currency-provider";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getFormattedSubtitle, getDisplayType } from "@/lib/card-utils";
import { getCardLegality } from "@/lib/legality";
import { useDecks } from "@/hooks/useDecks";
import { useSets } from "@/hooks/useCards";
import { SET_ACCENT, SET_ACRONYMS } from "@/lib/sets";
import { ScrollBar } from "@/components/ui/scroll-area";
import { getBaseCardValue } from "@/lib/pricing";
import { useAuth } from "@/components/auth-provider";


import { buildDeckExportImage } from "@/lib/export-image";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DeckAnalysisPanel } from "@/components/builder/DeckAnalysisPanel";
import { DeckGuideModal } from "@/components/builder/DeckGuideModal";
import { DeckImportModal } from "@/components/builder/DeckImportModal";
import { DeckShareModal } from "@/components/builder/DeckShareModal";
import { DeckAuthGuardModal } from "@/components/builder/DeckAuthGuardModal";
import { DeckPrintProxiesModal } from "@/components/builder/DeckPrintProxiesModal";
import { DeckRegistrationSheetModal } from "@/components/builder/DeckRegistrationSheetModal";
import { getHydratedStarterDecks } from "@/lib/starter-decks-hydration";

export default function DeckBuilder() {
  const { data: allCards = [], isLoading } = useAllCards();
  const { data: sets = [] } = useSets();
  const [deckName, setDeckName] = useState("New Deck");
  const [deckCards, setDeckCards] = useState<{ card: Card; qty: number }[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

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
  const [helpOpen, setHelpOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [shareColumns, setShareColumns] = useState(8);
  const [showValue, setShowValue] = useState(true);
  const [showFormat, setShowFormat] = useState(true);
  const [showCount, setShowCount] = useState(true);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [sideboardCards, setSideboardCards] = useState<{ card: Card; qty: number }[]>([]);
  const [activeCanvas, setActiveCanvas] = useState<'main' | 'sideboard'>('main');
  const [printProxiesOpen, setPrintProxiesOpen] = useState(false);
  const [regSheetOpen, setRegSheetOpen] = useState(false);

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
    const editId = params.get('edit');
    if (editId && allCards.length > 0) {
      // 1. Check user decks
      let target = decks.find(d => d.id === editId);

      // 2. Check starter decks if not found and ID looks like a starter
      if (!target && editId.startsWith('starter-')) {
        const starters = getHydratedStarterDecks(allCards);
        target = starters.find(s => s.id === editId);
      }

      if (target) {
        setDeckName(target.name);
        setFormat(target.format as any);
        setDeckCards(target.entries);
        setDeckId(target.id);
        setSavedAt(target.createdAt);
        
        // If there's a sideboard, handle it if it exists in the data
        if ((target as any).sideboard) {
          setSideboardCards((target as any).sideboard);
        }
      }
    }
  }, [decks, allCards]);

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
  }, [allCards]);


  const totalCards = deckCards.reduce((acc, curr) => acc + curr.qty, 0);

  // Deck Statistics Processing
  const { inkDistribution, costCurve, cardsByType, uninkableCount, totalValue, activeInks, isLegalInkCount, isLegalSize, maxInksReached, pieData, avgCost, typeBreakdown } = useMemo(() => {
    const inkDist: Record<string, number> = {};
    const curve: { cost: string; count: number; [ink: string]: string | number }[] = Array.from({ length: 7 }, (_, i) => ({
      cost: i < 6 ? String(i + 1) : "7+",
      count: 0,
    }));
    const byType: Record<string, typeof deckCards> = {
      Character: [], Action: [], Item: [], Location: [], Song: [],
    };

    let uninkable = 0;
    let val = 0;

    deckCards.forEach(({ card, qty }) => {
      inkDist[card.inkColor] = (inkDist[card.inkColor] || 0) + qty;
      const costIndex = Math.min(card.cost - 1, 6);
      if (costIndex >= 0) {
        curve[costIndex].count += qty;
        curve[costIndex][card.inkColor] = ((curve[costIndex][card.inkColor] as number) || 0) + qty;
      }
      if (!byType[card.type]) byType[card.type] = [];
      byType[card.type].push({ card, qty });

      if (!card.inkable) uninkable += qty;
      val += (getBaseCardValue(card) * qty);
    });

    const active = Object.keys(inkDist);
    return {
      inkDistribution: inkDist,
      costCurve: curve,
      cardsByType: byType,
      uninkableCount: uninkable,
      totalValue: val,
      activeInks: active,
      isLegalInkCount: active.length <= 2,
      isLegalSize: totalCards === 60,
      maxInksReached: active.length >= 2,
      pieData: Object.entries(inkDist).map(([name, value]) => ({ name, value })),
      avgCost: totalCards > 0 ? deckCards.reduce((sum, e) => sum + e.card.cost * e.qty, 0) / totalCards : 0,
      typeBreakdown: Object.entries(byType)
        .map(([type, cards]) => ({ type, count: cards.reduce((a, c) => a + c.qty, 0) }))
        .filter(t => t.count > 0)
    };
  }, [deckCards, totalCards]);

  const legalCoreNames = useMemo(() => {
    const legal = new Set<string>();
    allCards.forEach(c => {
      if (typeof c.setNum === 'number' && c.setNum >= 5) {
        const name = c.name.trim().toLowerCase();
        const subtitle = c.subtitle?.trim().toLowerCase();
        legal.add(subtitle ? `${name} - ${subtitle}` : name);
      }
    });
    return legal;
  }, [allCards]);

  const illegalCardsCount = useMemo(() => {
    if (format === "Any") return 0;
    return deckCards.filter(({ card }) => {
      const name = card.name.trim().toLowerCase();
      const subtitle = card.subtitle?.trim().toLowerCase();
      const fullName = subtitle ? `${name} - ${subtitle}` : name;

      // Banned list check
      // Note: We use lowercase comparison here
      const checkName = subtitle ? `${card.name.trim()} - ${card.subtitle?.trim()}` : card.name.trim();
      if (checkName === "Hiram Flaversham - Toymaker" || (format === "Core" && checkName === "Fortisphere")) {
        return true;
      }

      if (format === "Core") {
        return !legalCoreNames.has(fullName);
      }
      return false;
    }).length;
  }, [deckCards, format, legalCoreNames]);

  const availableSets = useMemo(() => Array.from(new Set(allCards.map(c => c.set))).sort(), [allCards]);

  useEffect(() => {
    if (!shareModalOpen) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setSharePreviewUrl(null);
      return;
    }

    let active = true;
    setIsGeneratingPreview(true);
    setPreviewError(null);

    const generatePreview = async () => {
      try {
        const blob = await buildDeckExportImage({
          deckCards,
          deckName,
          format,
          totalCards,
          totalValue,
          shareColumns,
          inkDistribution,
          formatPrice,
          showFormat,
          showCount,
          showValue
        });
        if (blob && active) {
          const url = URL.createObjectURL(blob);
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
          }
          previewUrlRef.current = url;
          setSharePreviewUrl(url);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to generate preview:", err);
          setPreviewError("Failed to generate the preview image. Please try again.");
        }
      } finally {
        if (active) setIsGeneratingPreview(false);
      }
    };

    generatePreview();

    return () => {
      active = false;
    };
  }, [shareModalOpen, deckCards, format, deckName, shareColumns, showFormat, showCount, showValue]);

  // Filtering Left Panel
  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      if (deferredSearch) {
        const s = deferredSearch.toLowerCase();
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
      if (filterType.length > 0) {
        const matchesType = filterType.some(t => {
          if (t === "Action") return c.type === "Action" || c.type === "Song";
          return c.type === t;
        });
        if (!matchesType) return false;
      }

      // Smart Filter logic: locks browser to current deck inks if deck is saturated
      if (smartFilter && maxInksReached) {
        if (!activeInks.includes(c.inkColor)) return false;
      }

      if (format !== "Any") {
        const name = c.name.trim().toLowerCase();
        const subtitle = c.subtitle?.trim().toLowerCase();
        const fullName = subtitle ? `${name} - ${subtitle}` : name;

        // Banned list check
        const checkName = subtitle ? `${c.name.trim()} - ${c.subtitle?.trim()}` : c.name.trim();
        if (checkName === "Hiram Flaversham - Toymaker" || (format === "Core" && checkName === "Fortisphere")) {
          // We still hide banned cards as they are never legal in the chosen format
          return false;
        }

        // We no longer return false for non-legal cards in Core, 
        // allowing them to be visible but they will still be counted as illegal.
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
  }, [allCards, deferredSearch, inkableOnly, filterSet, filterCost, filterInk, filterType, smartFilter, maxInksReached, activeInks, format]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Approximate height of each card row (p-2 + content)
    overscan: 15,
  });

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
    if (activeCanvas === 'sideboard') {
      setSideboardCards(prev => {
        const existing = prev.find(p => p.card.id === card.id);
        if (existing) return prev.map(p => p.card.id === card.id ? { ...p, qty: Math.min(p.qty + 1, 4) } : p);
        return [...prev, { card, qty: 1 }];
      });
      return;
    }

    if (totalCards >= 60) {
      toast({ title: "Deck Full", description: "A Lorcana deck must contain exactly 60 cards. Remove a card before adding another.", variant: "destructive" });
      return;
    }
    if (card.releasedAt && new Date(card.releasedAt) > new Date()) {
      toast({ title: "Future Release Added", description: `${card.name} is a current unreleased card.`, duration: 3000 });
    }
    const totalSameIdentity = deckCards.reduce((sum, p) => {
      if (p.card.name === card.name && p.card.subtitle === card.subtitle) return sum + p.qty;
      return sum;
    }, 0);
    if (totalSameIdentity >= 4) {
      toast({ title: "Deck Limit Reached", description: "You cannot have more than 4 copies of the same card (including alt-arts/enchanteds).", variant: "destructive" });
      return;
    }
    setDeckCards(prev => {
      const existing = prev.find(p => p.card.id === card.id);
      if (existing) return prev.map(p => (p.card.id === card.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { card, qty: 1 }];
    });
  };

  const removeCard = (cardId: string, removeAll = false, fromSideboard = false) => {
    const setter = fromSideboard ? setSideboardCards : setDeckCards;
    setter(prev => {
      const existing = prev.find(p => p.card.id === cardId);
      if (!existing) return prev;
      if (removeAll || existing.qty === 1) return prev.filter(p => p.card.id !== cardId);
      return prev.map(p => (p.card.id === cardId ? { ...p, qty: p.qty - 1 } : p));
    });
  };



  const handleExport = async (type: 'text' | 'pixelborn' | 'inktable' | 'melee' | 'image' = 'text') => {
    if (type === 'image') {
      setShareModalOpen(true);
      return;
    }

    let exportText = "";

    if (type === 'pixelborn' || type === 'melee' || type === 'inktable') {
      deckCards.forEach(entry => {
        exportText += `${entry.qty} ${entry.card.name}${entry.card.subtitle ? ` - ${entry.card.subtitle}` : ""}\n`;
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

    const copyToClipboard = async (text: string) => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "absolute";
          textArea.style.left = "-999999px";
          document.body.prepend(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
          } catch (err) {
            console.error(err);
            return false;
          } finally {
            textArea.remove();
          }
          return true;
        }
      } catch (err) {
        console.error(err);
        return false;
      }
    };

    const success = await copyToClipboard(exportText);
    if (success) {
      toast({
        title: "Copied!",
        description: `Deck list copied to clipboard as ${type === 'text' ? 'plain text' : type === 'melee' ? 'Melee.gg format' : type === 'pixelborn' ? 'Pixelborn format' : 'Inktable format'}!`
      });
    } else {
      toast({
        title: "Export Failed",
        description: "Could not copy to clipboard. Check browser permissions.",
        variant: "destructive"
      });
    }
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
      // Remove set codes like (TFC) or [123] from the end of the string before matching
      const rest = match[2].trim().replace(/\s*\([^)]+\)\s*$/, '').replace(/\s*\[[^\]]+\]\s*$/, '');
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
  };    return (
      <>
        <div className="fixed inset-x-0 bottom-0 top-16 flex flex-col bg-background overflow-hidden z-40 animate-in fade-in duration-300">
          <h1 className="sr-only">Lorcana Deck Builder</h1>
          {/* Top bar content... I'll just keep the existing div and close it correctly */}
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
                  onClick={() => setHelpOpen(true)}
                  className="gap-2 h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Info className="w-3.5 h-3.5" /> Guide
                </Button>
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
                    <DropdownMenuItem onClick={() => setRegSheetOpen(true)}>
                      Official Registration Sheet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPrintProxiesOpen(true)}>
                      Print Proxies
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Digital Platforms</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleExport('pixelborn')}>
                      Pixelborn Format
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('inktable')}>
                      Inktable Format
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
                      Share Image
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
                <div 
                  ref={parentRef} 
                  className="flex-1 overflow-y-auto custom-scrollbar"
                  style={{ contain: 'strict' }}
                >
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div 
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                      }}
                      className="p-2"
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
                        const card = filteredCards[virtualRow.index];
                        const inDeckQty = deckCards.find(e => e.card.id === card.id)?.qty || 0;
                        // Check total copies of this card identity (name+subtitle) across all variants
                        const totalIdentityCopies = deckCards.reduce((sum, e) => {
                          if (e.card.name === card.name && e.card.subtitle === card.subtitle) return sum + e.qty;
                          return sum;
                        }, 0);
                        const isMaxedOut = totalIdentityCopies >= 4;
                        const isDeckFull = totalCards >= 60;
                        return (
                          <div
                            key={virtualRow.index}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                              paddingBottom: '2px', // space-y-0.5 equivalent
                            }}
                          >
                            <HoverCard openDelay={200} closeDelay={50}>
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
                                    {!card.inkable && <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" title="Uninkable" />}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                                    Cost {card.cost} · {getDisplayType(card)} · {card.cardNum}{setCountMap[card.set] ? `/${setCountMap[card.set]}` : ""}
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
                          </div>
                        );
                      })}
                      {filteredCards.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No cards matching filters</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Center: Deck Canvas */}
            <ResizablePanel defaultSize={44} minSize={30}>
              <div className="h-full flex flex-col min-h-0 bg-background">
                <div className="p-3 border-b shrink-0 flex flex-wrap justify-between items-center gap-2 bg-muted/20">
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <button
                      onClick={() => setActiveCanvas('main')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        activeCanvas === 'main' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Main <span className="ml-1 text-[10px] opacity-70">{totalCards}/60</span>
                    </button>
                    <button
                      onClick={() => setActiveCanvas('sideboard')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        activeCanvas === 'sideboard' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Sideboard <span className="ml-1 text-[10px] opacity-70">{sideboardCards.reduce((a,c) => a+c.qty,0)}</span>
                    </button>
                  </div>
                  <Select value={groupingMode} onValueChange={(v: any) => setGroupingMode(v)}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-card">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost">Group by Cost</SelectItem>
                      <SelectItem value="type">Group by Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-6">
                    {activeCanvas === 'main' ? (
                      totalCards === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] opacity-60 select-none">
                          <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                            <Droplet className="w-12 h-12 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold tracking-tight mb-2">Your Deck is Empty</h3>
                          <p className="text-muted-foreground max-w-xs text-center text-sm">Click cards from the left panel to begin building your deck.</p>
                        </div>
                      ) : (
                        Object.entries(groupedDeck).map(([groupName, cards]) => {
                          if (cards.length === 0) return null;
                          const groupTotal = cards.reduce((a, c) => a + c.qty, 0);
                          const displayTitle = groupingMode === 'type' ? `${groupName}s` : `Cost ${groupName}`;
                          return (
                            <div key={groupName} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold font-serif text-sm uppercase tracking-wider text-muted-foreground">{displayTitle}</h3>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{groupTotal}</span>
                              </div>
                              <div className="space-y-1">
                                {cards.map(({ card, qty }) => (
                                  <HoverCard key={card.id} openDelay={300} closeDelay={50}>
                                    <HoverCardTrigger asChild>
                                      <div
                                        className="flex items-center gap-2 p-1.5 rounded-lg bg-card border hover:border-primary/40 transition-colors group cursor-default"
                                        style={{ backgroundImage: `linear-gradient(90deg, ${inkHexColors[card.inkColor]}55, transparent 35%)` }}
                                      >
                                        <div className="w-9 h-12 rounded-md overflow-hidden shrink-0 bg-muted border border-border/50">
                                          {card.image ? (
                                            <img src={card.thumbnail || card.image} alt={card.name} loading="lazy" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <img src={getInkLogo(card.inkColor)} alt={card.inkColor} className="w-5 h-5 object-contain opacity-40" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="w-6 h-6 rounded flex items-center justify-center border border-border/50 shrink-0" title={card.inkColor}>
                                          <img src={getInkLogo(card.inkColor)} alt={card.inkColor} className="w-4 h-4 object-contain" />
                                        </div>
                                        <div className="w-6 h-6 rounded flex items-center justify-center bg-muted text-xs font-bold border border-border/50 shrink-0">{card.cost}</div>
                                        <div className="flex-1 min-w-0 pr-2">
                                          <p className="text-sm font-medium truncate flex items-center gap-1.5">
                                            {card.name}
                                            {!card.inkable && <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" title="Uninkable" />}
                                            {collectionStats.missingByCard[card.id] > 0 && (
                                              <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-500/20">Missing {collectionStats.missingByCard[card.id]}</span>
                                            )}
                                          </p>
                                          {getFormattedSubtitle(card) ? (
                                            <p className="text-[10px] text-muted-foreground truncate uppercase">{getFormattedSubtitle(card)} · {card.cardNum}{setCountMap[card.set] ? `/${setCountMap[card.set]}` : ""}</p>
                                          ) : (
                                            <p className="text-[10px] text-muted-foreground truncate uppercase">{getDisplayType(card)} · {card.cardNum}{setCountMap[card.set] ? `/${setCountMap[card.set]}` : ""}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button onClick={() => removeCard(card.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary transition-colors"><Minus className="w-3 h-3" /></button>
                                          <span className="w-6 text-center font-bold text-sm">{qty}</span>
                                          <button onClick={() => addCard(card)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" disabled={qty >= 4 || totalCards >= 60}><Plus className="w-3 h-3" /></button>
                                          <button onClick={() => removeCard(card.id, true)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/20 text-destructive transition-colors opacity-0 group-hover:opacity-100 ml-1"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                      </div>
                                    </HoverCardTrigger>
                                    <HoverCardContent side="left" className="w-[280px] p-0 border-0 shadow-2xl bg-transparent" align="start">
                                      <CardDisplay card={card} className="w-full" />
                                    </HoverCardContent>
                                  </HoverCard>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : (
                      sideboardCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] opacity-60 select-none">
                          <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                            <Archive className="w-12 h-12 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold tracking-tight mb-2">Sideboard Empty</h3>
                          <p className="text-muted-foreground max-w-xs text-center text-sm">Add cards to test possible tech choices and swap-ins.</p>
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold font-serif text-sm uppercase tracking-wider text-muted-foreground">Sideboard</h3>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{sideboardCards.reduce((a,c)=>a+c.qty,0)}</span>
                          </div>
                          <div className="space-y-1">
                            {sideboardCards.map(({ card, qty }) => (
                              <HoverCard key={card.id} openDelay={300} closeDelay={50}>
                                <HoverCardTrigger asChild>
                                  <div
                                    className="flex items-center gap-2 p-1.5 rounded-lg bg-card border hover:border-primary/40 transition-colors group cursor-default"
                                    style={{ backgroundImage: `linear-gradient(90deg, ${inkHexColors[card.inkColor]}55, transparent 35%)` }}
                                  >
                                    <div className="w-9 h-12 rounded-md overflow-hidden shrink-0 bg-muted border border-border/50">
                                      {card.image ? <img src={card.thumbnail || card.image} alt={card.name} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><img src={getInkLogo(card.inkColor)} alt={card.inkColor} className="w-5 h-5 object-contain opacity-40" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                      <p className="text-sm font-medium truncate">{card.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate uppercase">{card.inkColor} · Cost {card.cost}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button onClick={() => removeCard(card.id, false, true)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary transition-colors"><Minus className="w-3 h-3" /></button>
                                      <span className="w-6 text-center font-bold text-sm">{qty}</span>
                                      <button onClick={() => addCard(card)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary transition-colors"><Plus className="w-3 h-3" /></button>
                                      <button onClick={() => removeCard(card.id, true, true)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/20 text-destructive transition-colors opacity-0 group-hover:opacity-100 ml-1"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent side="left" className="w-[280px] p-0 border-0 shadow-2xl bg-transparent" align="start">
                                  <CardDisplay card={card} className="w-full" />
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Right: Stats */}
            <ResizablePanel defaultSize={28} minSize={20}>
              <DeckAnalysisPanel
                user={user}
                totalCards={totalCards}
                deckCardsLength={deckCards.length}
                avgCost={avgCost}
                pieData={pieData}
                typeBreakdown={typeBreakdown}
                costCurve={costCurve}
                activeInks={activeInks}
                uninkableCount={uninkableCount}
                collectionStats={collectionStats}
                isLegalSize={isLegalSize}
                isLegalInkCount={isLegalInkCount}
                illegalCardsCount={illegalCardsCount}
                format={format}
                formatPrice={formatPrice}
              />
            </ResizablePanel>
          </ResizablePanelGroup>

          <DeckImportModal
            open={importOpen}
            onOpenChange={setImportOpen}
            importText={importText}
            onImportTextChange={setImportText}
            onImport={handleImport}
          />

          <DeckShareModal
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            shareColumns={shareColumns}
            onShareColumnsChange={setShareColumns}
            showFormat={showFormat}
            onShowFormatChange={setShowFormat}
            showCount={showCount}
            onShowCountChange={setShowCount}
            showValue={showValue}
            onShowValueChange={setShowValue}
            isGeneratingPreview={isGeneratingPreview}
            previewError={previewError}
            sharePreviewUrl={sharePreviewUrl}
            onDownload={async () => {
              setIsGeneratingPreview(true);
              const blob = await buildDeckExportImage({
                deckCards,
                deckName,
                format,
                totalCards,
                totalValue,
                shareColumns,
                inkDistribution,
                formatPrice
              });
              setIsGeneratingPreview(false);
              if (!blob) {
                toast({ title: 'Export Failed', description: 'Unable to generate share image.', variant: 'destructive' });
                return;
              }
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${deckName || 'lorbound-deck'}-share.png`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: 'Image Saved', description: 'Your branded deck share image is ready.' });
            }}
          />

          <DeckGuideModal open={helpOpen} onOpenChange={setHelpOpen} />

          <DeckAuthGuardModal open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

          <DeckPrintProxiesModal
            open={printProxiesOpen}
            onOpenChange={setPrintProxiesOpen}
            deckCards={deckCards}
          />

          <DeckRegistrationSheetModal
            open={regSheetOpen}
            onOpenChange={setRegSheetOpen}
            deckCards={deckCards}
            deckName={deckName}
          />
        </div>
      </>
    );
}
