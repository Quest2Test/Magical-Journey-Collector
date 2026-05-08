import { Search, Filter, Settings2, Sparkles, Droplet, Clock, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { inkHexColors, getInkLogo } from "@/components/ui/card-display";
import { SET_ACRONYMS } from "@/lib/sets";
import { useMemo } from "react";
import { Card } from "@/data/cards";

interface CardFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  filterInk: string[];
  setFilterInk: (v: string[] | ((p: string[]) => string[])) => void;
  filterCost: string[];
  setFilterCost: (v: string[] | ((p: string[]) => string[])) => void;
  filterType: string[];
  setFilterType: (v: string[]) => void;
  filterSet: string[];
  setFilterSet: (v: string[] | ((p: string[]) => string[])) => void;
  filterKeywords: string[];
  setFilterKeywords: (v: string[] | ((p: string[]) => string[])) => void;
  filterClassifications: string[];
  setFilterClassifications: (v: string[] | ((p: string[]) => string[])) => void;
  filterRarity: string[];
  setFilterRarity: (v: string[] | ((p: string[]) => string[])) => void;
  inkableOnly: boolean;
  setInkableOnly: (v: boolean) => void;
  showUnreleased: boolean;
  setShowUnreleased: (v: boolean) => void;
  smartFilter: boolean;
  setSmartFilter: (v: boolean) => void;
  maxInksReached: boolean;
  activeInks: string[];
  sets: any[];
  allCards: Card[];
  format: "Any" | "Core" | "Infinity";
}

export function CardFilters({
  search, setSearch,
  filterInk, setFilterInk,
  filterCost, setFilterCost,
  filterType, setFilterType,
  filterSet, setFilterSet,
  filterKeywords, setFilterKeywords,
  filterClassifications, setFilterClassifications,
  filterRarity, setFilterRarity,
  inkableOnly, setInkableOnly,
  showUnreleased, setShowUnreleased,
  smartFilter, setSmartFilter,
  maxInksReached, activeInks,
  sets, allCards, format
}: CardFiltersProps) {

  const availableClassifications = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach(c => c.classifications?.forEach(cl => set.add(cl)));
    return Array.from(set).sort();
  }, [allCards]);

  const availableKeywords = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach(c => c.keywords?.forEach(kw => {
      const base = kw.split(' ')[0];
      set.add(base);
    }));
    return Array.from(set).sort();
  }, [allCards]);

  const availableRarities = ["Common", "Uncommon", "Rare", "Super Rare", "Legendary", "Enchanted", "Special"];

  return (
    <div className="p-2 border-b shrink-0 bg-card/30 backdrop-blur-sm">
      {/* Row 1: Search */}
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
      </div>

      {/* Row 2: Filters */}
      <div className="flex items-center gap-3 py-1 overflow-x-auto custom-scrollbar no-scrollbar pb-2 sm:pb-0">
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

        <div className="w-[1px] h-10 bg-border/20 mx-0.5 hidden sm:block" />

        {/* Toggles & Dropdowns */}
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

            {/* Set Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-8 px-2 text-[10px] bg-muted/30 border-border/20 font-bold uppercase tracking-tighter gap-1.5",
                    filterSet.length > 0 && "border-primary/50 bg-primary/10 text-primary"
                  )}
                >
                  <Filter className="w-3 h-3" />
                  {filterSet.length === 0 ? "SETS" : `${filterSet.length} SETS`}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-popover border-border shadow-xl" align="end">
                <div className="p-2 border-b border-border/50 flex items-center justify-between bg-muted/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filter by Set</span>
                  {filterSet.length > 0 && (
                    <button 
                      onClick={() => setFilterSet([])}
                      className="text-[9px] font-bold text-primary hover:underline uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-2 space-y-4">
                    {/* Core Sets */}
                    <div>
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Core Sets</span>
                        <button 
                          onClick={() => {
                            const coreSets = sets.filter(s => !s.isPromo && (format === "Any" || format === "Infinity" || s.setNum >= 5)).map(s => s.name);
                            const allCoreSelected = coreSets.length > 0 && coreSets.every(s => filterSet.includes(s));
                            if (allCoreSelected) {
                              setFilterSet(prev => prev.filter(s => !coreSets.includes(s)));
                            } else {
                              setFilterSet(prev => Array.from(new Set([...prev, ...coreSets])));
                            }
                          }}
                          className="text-[9px] font-bold text-primary/60 hover:text-primary uppercase"
                        >
                          {sets.filter(s => !s.isPromo && (format === "Any" || format === "Infinity" || s.setNum >= 5)).every(s => filterSet.includes(s.name)) ? "Deselect Legal" : "Select Legal"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-0.5">
                        {sets.filter(s => !s.isPromo).map(set => {
                          const isLegal = format === "Any" || format === "Infinity" || (format === "Core" && set.setNum >= 5);
                          return (
                            <button
                              key={set.id}
                              disabled={!isLegal}
                              onClick={() => setFilterSet(prev => prev.includes(set.name) ? prev.filter(s => s !== set.name) : [...prev, set.name])}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                                filterSet.includes(set.name) ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                !isLegal && "opacity-30 cursor-not-allowed grayscale"
                              )}
                            >
                              <div className={cn(
                                "w-3 h-3 rounded-sm border flex items-center justify-center transition-colors",
                                filterSet.includes(set.name) ? "bg-primary border-primary" : "border-muted-foreground/30"
                              )}>
                                {filterSet.includes(set.name) && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />}
                              </div>
                              <span className="text-[11px] font-medium truncate">{set.name}</span>
                              <span className="ml-auto text-[9px] font-bold opacity-30">{SET_ACRONYMS[set.id] || set.id}</span>
                              {!isLegal && <span className="ml-1 text-[8px] font-black text-destructive/80 uppercase">Illegal</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Infinite Sets */}
                    <div>
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Infinite Sets</span>
                        <button 
                          onClick={() => {
                            const infiniteSets = sets.filter(s => s.isPromo && (format === "Any" || format === "Infinity")).map(s => s.name);
                            const allInfiniteSelected = infiniteSets.length > 0 && infiniteSets.every(s => filterSet.includes(s));
                            if (allInfiniteSelected) {
                              setFilterSet(prev => prev.filter(s => !infiniteSets.includes(s)));
                            } else {
                              setFilterSet(prev => Array.from(new Set([...prev, ...infiniteSets])));
                            }
                          }}
                          className="text-[9px] font-bold text-primary/60 hover:text-primary uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={format === "Core"}
                        >
                          {sets.filter(s => s.isPromo && (format === "Any" || format === "Infinity")).length > 0 && 
                           sets.filter(s => s.isPromo && (format === "Any" || format === "Infinity")).every(s => filterSet.includes(s.name)) 
                           ? "Deselect Legal" : "Select Legal"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-0.5">
                        {sets.filter(s => s.isPromo).map(set => {
                          const isLegal = format === "Any" || format === "Infinity";
                          return (
                            <button
                              key={set.id}
                              disabled={!isLegal}
                              onClick={() => setFilterSet(prev => prev.includes(set.name) ? prev.filter(s => s !== set.name) : [...prev, set.name])}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                                filterSet.includes(set.name) ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                !isLegal && "opacity-30 cursor-not-allowed grayscale"
                              )}
                            >
                              <div className={cn(
                                "w-3 h-3 rounded-sm border flex items-center justify-center transition-colors",
                                filterSet.includes(set.name) ? "bg-primary border-primary" : "border-muted-foreground/30"
                              )}>
                                {filterSet.includes(set.name) && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />}
                              </div>
                              <span className="text-[11px] font-medium truncate">{set.name}</span>
                              {!isLegal && <span className="ml-auto text-[8px] font-black text-destructive/80 uppercase">Illegal</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* Advanced Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-8 px-2 text-[10px] bg-muted/30 border-border/20 font-bold uppercase tracking-tighter gap-1.5",
                    (filterKeywords.length > 0 || filterClassifications.length > 0 || filterRarity.length > 0) && "border-amber-500/50 bg-amber-500/10 text-amber-500"
                  )}
                >
                  <Settings2 className="w-3 h-3" />
                  ADVANCED
                  {(filterKeywords.length + filterClassifications.length + filterRarity.length) > 0 && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-amber-950 text-[9px] font-black">
                      {filterKeywords.length + filterClassifications.length + filterRarity.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 bg-popover border-border shadow-xl" align="end">
                <div className="p-2 border-b border-border/50 flex items-center justify-between bg-muted/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Advanced Filters</span>
                  {(filterKeywords.length > 0 || filterClassifications.length > 0 || filterRarity.length > 0) && (
                    <button 
                      onClick={() => {
                        setFilterKeywords([]);
                        setFilterClassifications([]);
                        setFilterRarity([]);
                      }}
                      className="text-[9px] font-bold text-amber-500 hover:underline uppercase"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="p-3 space-y-6">
                    {/* Rarities */}
                    <div>
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter block mb-2 px-1">Rarity</span>
                      <div className="flex flex-wrap gap-1">
                        {availableRarities.map(r => (
                          <button
                            key={r}
                            onClick={() => setFilterRarity(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold border transition-all",
                              filterRarity.includes(r) 
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-500" 
                                : "bg-muted/50 border-border/40 text-muted-foreground hover:border-border/60 hover:text-foreground"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter block mb-2 px-1">Keywords</span>
                      <div className="flex flex-wrap gap-1">
                        {availableKeywords.map(kw => (
                          <button
                            key={kw}
                            onClick={() => setFilterKeywords(prev => prev.includes(kw) ? prev.filter(x => x !== kw) : [...prev, kw])}
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold border transition-all",
                              filterKeywords.includes(kw) 
                                ? "bg-primary/20 border-primary/40 text-primary" 
                                : "bg-muted/50 border-border/40 text-muted-foreground hover:border-border/60 hover:text-foreground"
                            )}
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Classifications */}
                    <div>
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter block mb-2 px-1">Classifications</span>
                      <div className="flex flex-wrap gap-1">
                        {availableClassifications.map(cl => (
                          <button
                            key={cl}
                            onClick={() => setFilterClassifications(prev => prev.includes(cl) ? prev.filter(x => x !== cl) : [...prev, cl])}
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold border transition-all",
                              filterClassifications.includes(cl) 
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" 
                                : "bg-muted/50 border-border/40 text-muted-foreground hover:border-border/60 hover:text-foreground"
                            )}
                          >
                            {cl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
