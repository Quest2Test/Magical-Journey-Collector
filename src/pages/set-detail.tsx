import { useState, useMemo, useDeferredValue, useRef, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useAllCards, useCardsBySet } from "@/hooks/useCards";
import { useCollection } from "@/hooks/useCollection";
import { Card } from "@/data/cards";
import { CardDisplay, inkHexColors, rarityIcons, isDisney100 } from "@/components/ui/card-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, LayoutGrid, List as ListIcon, CheckCircle2, Circle, Loader2, SlidersHorizontal, X, Download, ChevronDown, Trophy, BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SET_GRADIENTS, SET_ACCENT, SET_ACRONYMS } from "@/lib/sets";
import { getCardPricing, getBaseCardValue } from "@/lib/pricing";
import { BinderView } from "@/components/profile/BinderView";
import { getFormattedSubtitle, getDisplayType } from "@/lib/card-utils";



const FOIL_ONLY_RARITIES: Card["rarity"][] = ["Enchanted"];
const RARITIES = ["Common", "Uncommon", "Rare", "Super Rare", "Legendary", "Enchanted", "Iconic", "Promo"];
const INK_COLORS = ["Amber", "Amethyst", "Emerald", "Ruby", "Sapphire", "Steel"];
const CARD_TYPES = ["Character", "Action", "Item", "Location", "Song"];
const PAGE_SIZE = 60;

function SetIcon({ setId, size = "lg" }: { setId: string; size?: "sm" | "lg" }) {
  const accent = SET_ACCENT[setId] ?? "#e5c07b";
  const dim = size === "lg" ? "w-32 h-32 text-2xl" : "w-20 h-20 text-sm";
  const [logoError, setLogoError] = useState(false);

  const acronym = SET_ACRONYMS[setId] ?? setId;

  return (
    <div className={cn("rounded-2xl flex items-center justify-center font-bold font-serif border-2 shrink-0 overflow-hidden", dim)} style={logoError ? { backgroundColor: `${accent}22`, borderColor: `${accent}55` } : { borderColor: 'transparent' }}>
      {!logoError ? (
        <img
          src={`/sets/${acronym}.png`}
          alt={`${setId} logo`}
          className="w-full h-full object-contain"
          onError={() => setLogoError(true)}
        />
      ) : (
        <span style={{ color: accent }}>{setId.slice(0, 3)}</span>
      )}
    </div>
  );
}

export default function SetDetail() {
  const { id } = useParams<{ id: string }>();
  const setId = id ?? "";

  const { data: allCards = [], isLoading } = useAllCards();
  const { data: setCardsData = [], isLoading: isSetLoading } = useCardsBySet(setId);
  const { user } = useAuth();
  const { collection, getEntry, addCopy, removeCopy, toggleCollected, isCollected, collectedCount } = useCollection();

  // Derive set metadata from card data
  const setInfo = useMemo(() => {
    const first = setCardsData.find((c: Card) => c.expansion === setId);
    if (!first) return null;
    const isPromo = !/^\d+$/.test(setId);
    return { id: setId, name: first.set, setNum: first.setNum ?? 0, isPromo };
  }, [setCardsData, setId]);
  const setCards = useMemo(
    () => setCardsData.sort((a: Card, b: Card) => (a.cardNum ?? 9999) - (b.cardNum ?? 9999)),
    [setCardsData]
  );

  const collectedInSet = setCards.filter((c: Card) => isCollected(c.id)).length;
  const collectionPct = setCards.length > 0 ? Math.round((collectedInSet / setCards.length) * 100) : 0;

  // Value calculations
  const { totalSetValue, collectedValue } = useMemo(() => {
    let totalSetValue = 0;
    let collectedValue = 0;
    for (const card of setCards) {
      const pricing = getCardPricing(card);
      totalSetValue += getBaseCardValue(card);

      const entry = getEntry(card.id);
      collectedValue += (entry.normal * pricing.normal) + (entry.foil * pricing.foil);
    }
    return { totalSetValue, collectedValue };
  }, [setCards, collection, getEntry]);

  // Rarity breakdown
  const RARITY_META: Record<string, { label: string; color: string; order: number; icon?: string }> = {
    Common: { label: "Common", color: "#6b7280", order: 1, icon: rarityIcons["Common"] },
    Uncommon: { label: "Uncommon", color: "#22c55e", order: 2, icon: rarityIcons["Uncommon"] },
    Rare: { label: "Rare", color: "#3b82f6", order: 3, icon: rarityIcons["Rare"] },
    "Super Rare": { label: "Super Rare", color: "#a855f7", order: 4, icon: rarityIcons["Super Rare"] },
    Legendary: { label: "Legendary", color: "#f59e0b", order: 5, icon: rarityIcons["Legendary"] },
    Epic: { label: "Epic", color: "#c084fc", order: 5.5, icon: rarityIcons["Epic"] },
    Enchanted: { label: "Enchanted", color: "#ec4899", order: 6, icon: rarityIcons["Enchanted"] },
    Iconic: { label: "Iconic", color: "#06b6d4", order: 7, icon: rarityIcons["Iconic"] },
    Promo: { label: "Promo", color: "#f97316", order: 8, icon: rarityIcons["Promo"] },
  };

  const rarityBreakdown = useMemo(() => {
    const counts: Record<string, { total: number; collected: number }> = {};
    for (const card of setCards) {
      const r = card.rarity;
      if (!counts[r]) counts[r] = { total: 0, collected: 0 };
      counts[r].total++;
      if (isCollected(card.id)) counts[r].collected++;
    }
    return Object.entries(counts)
      .map(([rarity, { total, collected }]) => ({ rarity, total, collected, meta: RARITY_META[rarity] ?? { label: rarity, color: "#6b7280", order: 99 } }))
      .sort((a, b) => a.meta.order - b.meta.order);
  }, [setCards, collection]);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedInks, setSelectedInks] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [inkableOnly, setInkableOnly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [matchView, setMatchView] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialView = (searchParams.get("view") as "grid" | "list" | "binder") || "grid";

  const [collectedFilter, setCollectedFilter] = useState<"all" | "collected" | "missing">("all");
  const [selectedCosts, setSelectedCosts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "binder">(initialView);
  const [page, setPage] = useState(1);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (arr: string[], val: string, setArr: (v: string[]) => void) => {
    setPage(1);
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setSearch(""); setSelectedInks([]); setSelectedTypes([]);
    setSelectedRarities([]); setInkableOnly(false);
    setSelectedKeywords([]); setMaxPrice(100);
    setCollectedFilter("all"); setSelectedCosts([]); setPage(1);
  };

  const filtered = useMemo(() => {
    return setCards.filter((card: Card) => {
      if (deferredSearch) {
        const q = deferredSearch.toLowerCase();
        if (!card.name.toLowerCase().includes(q) && !card.subtitle?.toLowerCase().includes(q)) return false;
      }
      if (selectedInks.length > 0 && !selectedInks.includes(card.inkColor)) return false;
      if (selectedTypes.length > 0) {
        const matchesType = selectedTypes.some(t => {
          if (t === "Action") return card.type === "Action" || card.type === "Song";
          return card.type === t;
        });
        if (!matchesType) return false;
      }
      if (selectedRarities.length > 0 && !selectedRarities.includes(card.rarity)) return false;
      if (inkableOnly && !card.inkable) return false;

      if (selectedCosts.length > 0) {
        const matchesCost = selectedCosts.some(c => {
          if (c === "7+") return card.cost >= 7;
          return card.cost === parseInt(c, 10);
        });
        if (!matchesCost) return false;
      }
      if (selectedKeywords.length > 0) {
        if (!selectedKeywords.some(kw => card.keywords?.some(ckw => ckw.toLowerCase().includes(kw.toLowerCase())))) return false;
      }
      if (card.priceUsd && card.priceUsd > maxPrice) return false;
      if (collectedFilter === "collected" && !isCollected(card.id)) return false;
      if (collectedFilter === "missing" && isCollected(card.id)) return false;
      return true;
    });
  }, [setCards, deferredSearch, selectedInks, selectedTypes, selectedRarities, inkableOnly, selectedCosts, collectedFilter, collection, isCollected, selectedKeywords, maxPrice]);


  const displayed = filtered.slice(0, page * PAGE_SIZE);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isSetLoading && displayed.length < filtered.length) {
        setPage(p => p + 1);
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isSetLoading, displayed.length, filtered.length]);
  const hasFilters = deferredSearch || selectedInks.length || selectedTypes.length || selectedRarities.length || inkableOnly || collectedFilter !== "all" || selectedCosts.length > 0;

  const gradient = SET_GRADIENTS[setId] ?? "from-slate-900/60 via-gray-900/40 to-background";
  const accent = SET_ACCENT[setId] ?? "#e5c07b";

  const exportCollection = (format: "csv" | "json") => {
    const rows = setCards
      .map(card => {
        const entry = getEntry(card.id);
        if (entry.normal === 0 && entry.foil === 0) return null;
        return {
          "Card #": card.cardNum ?? "",
          Name: card.name,
          Subtitle: card.subtitle ?? "",
          Set: card.set,
          Rarity: card.rarity,
          Ink: card.inkColor,
          Normal: entry.normal,
          Foil: entry.foil,
          "Price (Normal)": card.priceUsd != null ? `$${card.priceUsd.toFixed(2)}` : "",
          "Price (Foil)": card.priceUsdFoil != null ? `$${card.priceUsdFoil.toFixed(2)}` : "",
        };
      })
      .filter(Boolean) as Record<string, string | number>[];

    if (rows.length === 0) return;

    let content: string;
    let mime: string;
    let ext: string;

    if (format === "csv") {
      const headers = Object.keys(rows[0]);
      const csvRows = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(","))];
      content = csvRows.join("\n");
      mime = "text/csv";
      ext = "csv";
    } else {
      content = JSON.stringify(rows, null, 2);
      mime = "application/json";
      ext = "json";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${setInfo?.name ?? setId}-collection.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const KEYWORDS = ["Rush", "Evasive", "Ward", "Challenger", "Singer", "Reckless", "Bodyguard", "Support", "Shift", "Resist"];

  const filtersContent = (
    <div className="space-y-4">
      {/* 1. Essential Filters */}
      <div className="border border-border/40 rounded-xl bg-card/30 overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("basic")}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Search className="w-4 h-4" /> Essential
          </span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.includes("basic") && "rotate-180")} />
        </button>

        <AnimatePresence>
          {openSections.includes("basic") && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border/20 px-4 pb-6 pt-4 space-y-6"
            >
              <div>
                <Label className="text-[10px] font-bold uppercase mb-2 block opacity-60">Search Library</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cards..."
                    className="pl-9 h-9 text-xs"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase mb-2 block opacity-60">Ink & Type</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {INK_COLORS.map(ink => (
                    <button
                      key={ink}
                      onClick={() => toggle(selectedInks, ink, setSelectedInks)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedInks.includes(ink) ? "border-primary scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] }}
                      title={ink}
                    >
                      <img src={`/inks/COLOR_${ink.toUpperCase()}_RGB.webp`} alt={ink} className="w-5 h-5 object-contain brightness-[1.2]" />
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CARD_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold border transition-colors",
                        selectedTypes.includes(type) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Strategic Filters */}
      <div className="border border-border/40 rounded-xl bg-card/30 overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("tactical")}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Strategic
          </span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.includes("tactical") && "rotate-180")} />
        </button>

        <AnimatePresence>
          {openSections.includes("tactical") && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border/20 px-4 pb-6 pt-4 space-y-6"
            >
              <div>
                <Label className="text-[10px] font-bold uppercase mb-3 block opacity-60">Collection View</Label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-muted/30 rounded-lg">
                  {(["all", "collected", "missing"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setCollectedFilter(mode); setPage(1); }}
                      className={cn(
                        "py-1.5 rounded-md text-[10px] font-bold capitalize transition-all",
                        collectedFilter === mode ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-[10px] font-bold uppercase opacity-60">Max Price: {formatPrice(maxPrice)}</Label>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="100"
                  step="0.5"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(parseFloat(e.target.value)); setPage(1); }}
                  className="w-full accent-primary h-1 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase mb-2.5 block opacity-60">Rarity Tier</Label>
                <div className="flex flex-wrap gap-1.5">
                  {RARITIES.map(r => (
                    <button
                      key={r}
                      onClick={() => toggle(selectedRarities, r, setSelectedRarities)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold border transition-colors",
                        selectedRarities.includes(r) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase mb-3 block opacity-60">Keyword Discovery</Label>
                <div className="flex flex-wrap gap-1">
                  {KEYWORDS.map(kw => (
                    <button
                      key={kw}
                      onClick={() => { setPage(1); setSelectedKeywords(prev => prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]); }}
                      className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-bold border transition-colors",
                        selectedKeywords.includes(kw) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase mb-2.5 block opacity-60">Ink Cost</Label>
                <div className="flex flex-wrap gap-1.5">
                  {["1", "2", "3", "4", "5", "6", "7+"].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setPage(1);
                        setSelectedCosts(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
                      }}
                      className={`w-8 h-8 rounded-full font-bold text-xs border flex items-center justify-center transition-colors ${selectedCosts.includes(c)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-110"
                        : "bg-card text-muted-foreground hover:bg-secondary/50"
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-2 px-1 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="inkable" className="text-xs font-semibold text-muted-foreground">Inkable Only</Label>
          <Switch id="inkable" checked={inkableOnly} onCheckedChange={v => { setInkableOnly(v); setPage(1); }} />
        </div>

        {hasFilters && (
          <Button variant="ghost" className="w-full gap-2 text-xs h-9 text-muted-foreground hover:text-destructive" onClick={clearFilters}>
            <X className="w-3.5 h-3.5" /> Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Set Hero Header */}
      <div className="relative pt-8 pb-12" style={{ backgroundColor: gradient }}>
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, #80808008 1px, transparent 1px), linear-gradient(to bottom, #80808008 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} 
        />
        <div className="container relative mx-auto px-4 md:px-6">
          <Link href="/sets" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> All Sets
          </Link>

          {isSetLoading && !setInfo ? (
            <div className="flex items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <SetIcon setId={setId} size="lg" />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
                    style={{ color: accent, borderColor: `${accent}44`, backgroundColor: `${accent}11` }}
                  >
                    {setInfo ? (setInfo.isPromo ? "Promo Set" : `Set ${setInfo.setNum}`) : "—"}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
                  {setInfo?.name ?? setId}
                </h1>

                {/* Collection progress */}
                <div className="space-y-3 max-w-xl">
                  <div className="space-y-2 max-w-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-muted-foreground">Collection progress</span>
                      <span className="font-bold" style={{ color: accent }}>
                        {collectedInSet} / {setCards.length} ({collectionPct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: accent }}
                        initial={{ width: 0 }}
                        animate={{ width: `${collectionPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{setCards.length} total cards</span>
                      {!user && (
                        <>
                          <span>•</span>
                          <Link href="/login" className="text-primary hover:underline font-bold">Sign in to track your collection</Link>
                        </>
                      )}
                      {user && (
                        <>
                          <span>•</span>
                          <span>{setCards.length - collectedInSet} missing</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Value row */}
                  {totalSetValue > 0 && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-black/20 backdrop-blur">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Set Value</span>
                        <span className="text-sm font-bold" style={{ color: accent }}>${totalSetValue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-black/20 backdrop-blur">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">My Value</span>
                        <span className="text-sm font-bold text-emerald-400">${collectedValue.toFixed(2)}</span>
                      </div>
                      {collectedValue > 0 && totalSetValue > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-black/20 backdrop-blur">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Coverage</span>
                          <span className="text-sm font-bold text-sky-400">{Math.round((collectedValue / totalSetValue) * 100)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rarity Breakdown */}
      {!isSetLoading && rarityBreakdown.length > 0 && (
        <div className="border-b border-border/40 bg-card/40 backdrop-blur">
          <div className="container mx-auto px-4 md:px-6 py-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rarity Breakdown</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {rarityBreakdown.map(({ rarity, total, collected, meta }) => {
                const pct = Math.round((collected / total) * 100);
                return (
                  <div key={rarity} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {meta.icon && <img src={meta.icon} alt="" className="w-3 h-3 object-contain shrink-0" />}
                        <span className="text-xs font-semibold truncate" style={{ color: meta.color }}>{meta.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{collected}/{total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: meta.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: rarityBreakdown.indexOf({ rarity, total, collected, meta }) * 0.05 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{pct}% collected</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 flex-1">
        {/* Mobile filter toggle */}
        <div className="md:hidden flex items-center justify-between w-full mb-2">
          <p className="text-sm text-muted-foreground">
            {viewMode === 'binder' 
              ? "Browse your set in a digital numerical album"
              : `${filtered.length} of ${setCards.length} cards`
            }
          </p>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-2", viewMode === 'binder' && "hidden")}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <h2 className="font-serif text-xl font-bold mb-6">Filters</h2>
              {filtersContent}
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop sidebar */}
        <aside className={cn(
          "hidden md:block w-60 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-12 transition-opacity",
          viewMode === 'binder' && "opacity-0 pointer-events-none"
        )}>
          {filtersContent}
        </aside>

        {/* Cards */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-muted-foreground">
              {isSetLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                </span>
              ) : (
                <>
                  <span className="font-bold text-foreground">{displayed.length}</span> of{" "}
                  <span className="font-bold text-foreground">{filtered.length}</span> cards
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              {/* Export button */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setExportOpen(o => !o)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
                {exportOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => { exportCollection("csv"); setExportOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-secondary/60 transition-colors font-medium flex items-center gap-2"
                    >
                      📊 Download CSV
                    </button>
                    <button
                      onClick={() => { exportCollection("json"); setExportOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-secondary/60 transition-colors font-medium flex items-center gap-2"
                    >
                      📋 Download JSON
                    </button>
                  </div>
                )}
              </div>
              {/* View toggle */}
              <div className="flex border rounded-md p-0.5 bg-muted/50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 rounded-sm transition-colors", viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-1.5 rounded-sm transition-colors", viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("binder")}
                  className={cn("p-1.5 rounded-sm transition-colors", viewMode === "binder" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                  title="Binder View"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isSetLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="aspect-[2.5/3.5] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {!isSetLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed">
              <Search className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="font-medium mb-1">No cards found</p>
              <p className="text-sm text-muted-foreground mb-4">Try broadening your filters.</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}

          {!isSetLoading && filtered.length > 0 && (
            <AnimatePresence mode="wait">
              {viewMode === "binder" ? (
                <motion.div
                  key="binder"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <BinderView setId={setId} setName={setInfo?.name} cards={setCards} collection={collection} />
                </motion.div>
              ) : viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                  {displayed.map((card: Card, i: number) => {
                    const entry = getEntry(card.id);
                    const foilOnly = FOIL_ONLY_RARITIES.includes(card.rarity);
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: Math.min(i * 0.01, 0.3) }}
                        className="flex flex-col gap-1"
                      >
                        <div className="relative group">
                          <CardDisplay card={card} returnTo={`/sets/${setId}`} useThumbnail />
                          {/* Collected overlay badge */}
                          {isCollected(card.id) && (
                            <div className="absolute top-2 right-2 z-10 pointer-events-none">
                              <CheckCircle2 className="w-5 h-5 text-green-400 drop-shadow" style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }} />
                            </div>
                          )}
                        </div>
                        {user ? (
                          <button
                            onClick={() => toggleCollected(card.id, foilOnly ? "foil" : "normal")}
                            className="w-full rounded-md border border-border bg-card py-2 text-xs transition-colors hover:bg-secondary/50 flex items-center justify-center gap-2"
                            title={isCollected(card.id) ? "Remove from collection" : "Add to collection"}
                          >
                            {isCollected(card.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span>{isCollected(card.id) ? "Collected" : "Add to Collection"}</span>
                          </button>
                        ) : (
                          <Link href="/login" className="w-full text-center py-2 text-[10px] font-bold text-primary hover:underline opacity-80 hover:opacity-100 transition-opacity">
                            Login to add to collection
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-1.5"
                >
                  {displayed.map((card: Card) => {
                    const entry = getEntry(card.id);
                    const foilOnly = FOIL_ONLY_RARITIES.includes(card.rarity);
                    const collected = isCollected(card.id);

                    return (
                      <div key={card.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-secondary/40 transition-colors">
                        <div className="flex flex-col items-center gap-2 shrink-0 w-12">
                          {user ? (
                            <>
                              <button
                                onClick={() => toggleCollected(card.id, foilOnly ? "foil" : "normal")}
                                className="shrink-0"
                                title={collected ? "Remove from collection" : "Add to collection"}
                              >
                                {collected ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </button>

                              <div className="text-[10px] text-muted-foreground text-center leading-tight">
                                {!foilOnly ? `${entry.normal} normal · ${entry.foil} foil` : `${entry.foil} foil only`}
                              </div>
                            </>
                          ) : (
                            <Link href="/login" className="text-primary hover:underline text-[9px] font-bold text-center leading-tight">
                              Login to track
                            </Link>
                          )}
                        </div>

                        <div className="w-12 h-16 rounded overflow-hidden shrink-0 bg-muted">
                          {card.image ? (
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full relative">
                              <img src="/LCardBack.png" alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link href={`/cards/${encodeURIComponent(card.id)}?from=/sets/${setId}`}>
                            <p className="text-sm font-semibold truncate hover:text-primary transition-colors cursor-pointer">
                              {card.cardNum ? `#${String(card.cardNum).padStart(3, "0")} ` : ""}{card.name}
                              {getFormattedSubtitle(card) && (
                                <span className="font-normal text-muted-foreground"> — {getFormattedSubtitle(card)}</span>
                              )}
                            </p>
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: inkHexColors[card.inkColor] }}
                            />
                            <span>{getDisplayType(card)}</span>
                            <span>·</span>
                            <span>Cost {card.cost}</span>
                            {card.strength !== undefined && (
                              <>
                                <span>·</span>
                                <span>{card.strength}/{card.willpower}</span>
                              </>
                            )}
                            <span>·</span>
                            <div className="flex items-center gap-1">
                              {rarityIcons[card.rarity] && <img src={rarityIcons[card.rarity]} alt="" className="w-3 h-3 object-contain" />}
                              <span>{card.rarity}</span>
                            </div>
                            {isDisney100(card) && (
                              <>
                                <span>·</span>
                                <div className="flex items-center gap-1">
                                  <img src="/rarities/Disney_100_logo.webp" alt="" className="w-3 h-3 object-contain" />
                                  <span className="text-[10px] font-bold text-amber-500">D100</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            {displayed.length < filtered.length && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-medium uppercase tracking-widest">
                  Loading more cards ({filtered.length - displayed.length} remaining)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
