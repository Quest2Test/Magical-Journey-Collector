import { useState, useMemo, useEffect, useDeferredValue, useRef } from "react";
import { Link, useSearch } from "wouter";
import { useAllCards, useSets } from "@/hooks/useCards";
import { Card } from "@/data/cards";
import { CardDisplay, inkHexColors } from "@/components/ui/card-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, LayoutGrid, List as ListIcon, X, Loader2, BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "@/hooks/useCollection";
import { cn } from "@/lib/utils";
import { ChevronDown, Trophy, Shield, Sword as SwordIcon, Banknote, UserCheck } from "lucide-react";
import { getFormattedSubtitle, getDisplayType } from "@/lib/card-utils";

const INK_COLORS = ["Amber", "Amethyst", "Emerald", "Ruby", "Sapphire", "Steel"];
const CARD_TYPES = ["Character", "Action", "Item", "Location", "Song"];
const RARITIES = ["Common", "Uncommon", "Rare", "Super_rare", "Legendary", "Enchanted", "Iconic", "Promo"];
const KEYWORDS = ["Rush", "Evasive", "Ward", "Challenger", "Singer", "Reckless", "Bodyguard", "Support", "Shift", "Resist"];
const PAGE_SIZE = 48;

export default function CardsBrowse() {
  const { data: allCards = [], isLoading, isError } = useAllCards();
  const { data: sets = [] } = useSets();
  const searchStr = useSearch();

  const urlParams = new URLSearchParams(searchStr);
  const urlSet = urlParams.get("set") ?? "";
  const urlInk = urlParams.get("ink") ?? "";

  const { collection, getQty } = useCollection();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedInks, setSelectedInks] = useState<string[]>(urlInk ? [urlInk] : []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string>(urlSet);
  const [inkableOnly, setInkableOnly] = useState(false);
  const [showUnreleased, setShowUnreleased] = useState(false);
  const [selectedCosts, setSelectedCosts] = useState<string[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<"all" | "owned" | "missing">("all");
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [groupBySet, setGroupBySet] = useState(false);
  const [sortBy, setSortBy] = useState(urlSet ? "cardNum" : "name");
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Accordion state
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const availableFranchises = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach(c => {
      if (c.franchise) set.add(c.franchise);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allCards]);

  useEffect(() => {
    setSelectedSet(urlSet);
    setSortBy(urlSet ? "cardNum" : "name");
    setPage(1);
  }, [urlSet]);


  useEffect(() => {
    if (urlInk && !selectedInks.includes(urlInk)) {
      setSelectedInks([urlInk]);
      setPage(1);
    }
  }, [urlInk]);

  const toggleInk = (ink: string) => {
    setPage(1);
    setSelectedInks(prev =>
      prev.includes(ink) ? prev.filter(i => i !== ink) : [...prev, ink]
    );
  };

  const toggleType = (type: string) => {
    setPage(1);
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleRarity = (rarity: string) => {
    setPage(1);
    setSelectedRarities(prev =>
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedInks([]);
    setSelectedTypes([]);
    setSelectedRarities([]);
    setSelectedKeywords([]);
    setSelectedSet("");
    setSelectedFranchise("all");
    setInkableOnly(false);
    setShowUnreleased(false);
    setSelectedCosts([]);
    setSortBy("name");
    setGroupBySet(false);
    setPage(1);
  };

  const filteredCards = useMemo(() => {
    let result = allCards.filter(card => {
      if (selectedSet && card.expansion !== selectedSet) return false;
      if (deferredSearch) {
        const q = deferredSearch.toLowerCase();
        if (
          !card.name.toLowerCase().includes(q) &&
          !card.subtitle?.toLowerCase().includes(q) &&
          !card.bodyText?.toLowerCase().includes(q) &&
          !card.artist?.toLowerCase().includes(q)
        ) return false;
      }
      if (selectedKeywords.length > 0) {
        if (!selectedKeywords.some(kw => card.keywords?.some(ckw => ckw.toLowerCase().includes(kw.toLowerCase())))) return false;
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

      if (selectedFranchise !== "all" && card.franchise !== selectedFranchise) return false;

      if (ownershipFilter === "owned") {
        if (getQty(card.id) === 0) return false;
      } else if (ownershipFilter === "missing") {
        if (getQty(card.id) > 0) return false;
      }
      
      // Permanently exclude unrevealed placeholders from results
      if (card.name.startsWith("Unrevealed Card #") || card.name.startsWith("Unreleased Card #")) return false;
      
      if (!showUnreleased && card.releasedAt && new Date(card.releasedAt) > new Date()) return false;

      if (card.priceUsd && card.priceUsd > maxPrice) return false;

      return true;
    });

    result = result.sort((a, b) => {
      if (sortBy === "cardNum") return (a.cardNum ?? 9999) - (b.cardNum ?? 9999);
      if (sortBy === "cost") return a.cost - b.cost;
      if (sortBy === "ink") return a.inkColor.localeCompare(b.inkColor);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      if (sortBy === "lore") return (b.lore ?? 0) - (a.lore ?? 0);
      if (sortBy === "strength") return (b.strength ?? 0) - (a.strength ?? 0);
      if (sortBy === "willpower") return (b.willpower ?? 0) - (a.willpower ?? 0);
      if (sortBy === "price") return (b.priceUsd ?? 0) - (a.priceUsd ?? 0);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [allCards, deferredSearch, selectedSet, selectedInks, selectedTypes, selectedRarities, inkableOnly, selectedCosts, sortBy, selectedKeywords, ownershipFilter, maxPrice, selectedFranchise]);

  const hasFilters = deferredSearch || selectedInks.length > 0 || selectedTypes.length > 0 || selectedRarities.length > 0 || selectedSet || selectedFranchise !== "all" || inkableOnly || selectedCosts.length > 0;

  const displayedCards = filteredCards.slice(0, page * PAGE_SIZE);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && displayedCards.length < filteredCards.length) {
        setPage(p => p + 1);
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, displayedCards.length, filteredCards.length]);

  const activeSetName = sets.find(s => s.id === selectedSet)?.name;

  const groupedCards = useMemo(() => {
    if (!groupBySet) return null;
    const groups: Record<string, Card[]> = {};
    displayedCards.forEach(card => {
      const setName = card.set || "Unknown Set";
      if (!groups[setName]) groups[setName] = [];
      groups[setName].push(card);
    });
    return groups;
  }, [displayedCards, groupBySet]);

  const filterSidebarContent = (
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
                    placeholder="Name, ability, artist..."
                    className="pl-9 h-9 text-xs"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase mb-2 block opacity-60">Franchise</Label>
                <Select value={selectedFranchise} onValueChange={(v) => { setSelectedFranchise(v); setPage(1); }}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="All Franchises" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">All Franchises</SelectItem>
                    {availableFranchises.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase mb-2 block opacity-60">Ink & Type</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {INK_COLORS.map(ink => (
                    <button
                      key={ink}
                      onClick={() => toggleInk(ink)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedInks.includes(ink) ? "border-primary scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: inkHexColors[ink] }}
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
                      onClick={() => toggleType(type)}
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

      {/* 2. Collection & Price (Tactical) */}
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
                <Label className="text-[10px] font-bold uppercase mb-3 block opacity-60">Ownership Status</Label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-muted/30 rounded-lg">
                  {(["all", "owned", "missing"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setOwnershipFilter(mode); setPage(1); }}
                      className={cn(
                        "py-1.5 rounded-md text-[10px] font-bold capitalize transition-all",
                        ownershipFilter === mode ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Sets */}
      <div className="border border-border/40 rounded-xl bg-card/30 overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("sets")}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Expansion
          </span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.includes("sets") && "rotate-180")} />
        </button>

        <AnimatePresence>
          {openSections.includes("sets") && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border/20 px-4 pb-6 pt-4"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <button
                    onClick={() => { setSelectedSet(""); setSortBy("name"); setPage(1); }}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-xs border text-left transition-colors mb-4",
                      !selectedSet ? "bg-primary/10 border-primary/40 text-primary font-bold shadow-sm" : "bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    All Expansions
                  </button>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 ml-1">Main Sets</h4>
                      <div className="flex flex-col gap-1">
                        {sets.filter(s => !s.isPromo).map(set => (
                          <button
                            key={set.id}
                            onClick={() => { setSelectedSet(set.id); setSortBy("cardNum"); setPage(1); }}
                            className={cn(
                              "px-3 py-2 rounded-lg text-[11px] border text-left transition-colors flex justify-between items-center",
                              selectedSet === set.id ? "bg-primary/10 border-primary/40 text-primary font-bold shadow-sm" : "bg-card text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <span className="truncate">{set.name}</span>
                            <span className="text-[9px] opacity-40 font-mono ml-2 uppercase">{set.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 ml-1">Special / Promo</h4>
                      <div className="flex flex-col gap-1">
                        {sets.filter(s => s.isPromo).map(set => (
                          <button
                            key={set.id}
                            onClick={() => { setSelectedSet(set.id); setSortBy("cardNum"); setPage(1); }}
                            className={cn(
                              "px-3 py-2 rounded-lg text-[11px] border text-left transition-colors flex justify-between items-center",
                              selectedSet === set.id ? "bg-primary/10 border-primary/40 text-primary font-bold shadow-sm" : "bg-card text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <span className="truncate">{set.name}</span>
                            <span className="text-[9px] opacity-40 font-mono ml-2 uppercase">{set.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 px-1 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="inkable-only" className="text-xs font-medium text-muted-foreground">Inkable Only</Label>
          <Switch
            id="inkable-only"
            checked={inkableOnly}
            onCheckedChange={v => { setInkableOnly(v); setPage(1); }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-unreleased" className="text-xs font-medium text-muted-foreground">Show Unreleased</Label>
          <Switch
            id="show-unreleased"
            checked={showUnreleased}
            onCheckedChange={v => { setShowUnreleased(v); setPage(1); }}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" className="w-full gap-2 text-xs h-9 text-muted-foreground hover:text-destructive" onClick={clearFilters}>
            <X className="w-3.5 h-3.5" /> Reset Research
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden flex items-center justify-between w-full mb-4">
        <h1 className="font-serif text-2xl font-bold">Browse Cards</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold mb-6">Filters</h2>
            {filterSidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 space-y-8 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-12">
        <h1 className="font-serif text-3xl font-bold mb-6">Browse Cards</h1>
        {filterSidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Active set banner */}
        {activeSetName && (
          <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm font-semibold text-primary">{activeSetName}</span>
            <span className="text-xs text-muted-foreground">· Sorted by card number</span>
            <button
              onClick={clearFilters}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 bg-card p-4 rounded-xl border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-muted-foreground">
            <div>
              {isLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading cards…</span>
              ) : (
                <>Showing <span className="font-bold text-foreground">{displayedCards.length}</span> of <span className="font-bold text-foreground">{filteredCards.length}</span> cards</>
              )}
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-muted-foreground/20">
              <Label htmlFor="group-by-set" className="text-xs font-bold uppercase tracking-wider">Group by Set</Label>
              <Switch
                id="group-by-set"
                checked={groupBySet}
                onCheckedChange={setGroupBySet}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 w-full xl:w-auto">
            <Select value={sortBy} onValueChange={v => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="cardNum">Set Number</SelectItem>
                <SelectItem value="cost">Ink Cost</SelectItem>
                <SelectItem value="lore">Lore Value</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="willpower">Willpower</SelectItem>
                <SelectItem value="price">Market Price</SelectItem>
                <SelectItem value="ink">Ink Color</SelectItem>
                <SelectItem value="type">Card Type</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md p-1 bg-muted/50 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-sm transition-colors ${viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isError && (
          <div className="p-8 text-center text-destructive border border-destructive/20 rounded-xl bg-destructive/10">
            Failed to load cards. Please try refreshing the page.
          </div>
        )}

        {!isError && filteredCards.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">No cards found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              No cards match your filters. Try broadening your search or clearing a few filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-[2.5/3.5] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredCards.length > 0 && (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key={groupBySet ? "grouped-grid" : "plain-grid"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {groupBySet && groupedCards ? (
                  Object.entries(groupedCards).map(([setName, cards]) => (
                    <div key={setName} className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-primary/40 pl-4 py-1">
                        {setName}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {cards.map((card: Card, i: number) => (
                          <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.2) }}
                          >
                            <CardDisplay card={card} ownedCount={getQty(card.id)} useThumbnail />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayedCards.map((card: Card, i: number) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.3) }}
                      >
                        <CardDisplay card={card} ownedCount={getQty(card.id)} useThumbnail />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                {displayedCards.map((card: Card) => (
                  <Link key={card.id} href={`/cards/${encodeURIComponent(card.id)}`}>
                    <div className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors group cursor-pointer">
                      <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-muted">
                        {card.image ? (
                          <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(to bottom right, ${inkHexColors[card.inkColor]}88, ${inkHexColors[card.inkColor]})`
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold truncate">{card.name}</span>
                          {getFormattedSubtitle(card) && (
                            <span className="text-sm text-muted-foreground truncate hidden sm:inline">
                              — {getFormattedSubtitle(card)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: inkHexColors[card.inkColor] }}
                          />
                          <span className="px-1.5 py-0.5 rounded-sm bg-muted">{getDisplayType(card)}</span>
                          <span>Cost {card.cost}</span>
                          {card.strength !== undefined && (
                            <span>• {card.strength}/{card.willpower}</span>
                          )}
                          {card.cardNum !== undefined && (
                            <span className="hidden sm:inline">• #{card.cardNum}</span>
                          )}
                          <span className="hidden sm:inline">• {card.rarity}</span>
                          <span className="hidden md:inline">• {card.expansion}</span>
                          {card.franchise && <span className="hidden lg:inline">• {card.franchise}</span>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex shrink-0"
                      >
                        View Details
                      </Button>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {displayedCards.length < filteredCards.length && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium uppercase tracking-widest">
                Loading more cards ({filteredCards.length - displayedCards.length} remaining)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
