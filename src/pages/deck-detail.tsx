import { useParams, Link, useSearch } from "wouter";
import { useAllCards } from "@/hooks/useCards";
import { useCollection } from "@/hooks/useCollection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardDisplay, inkHexColors, inkGradients, rarityIcons, isDisney100, getInkLogo } from "@/components/ui/card-display";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useCurrency } from "@/components/currency-provider";
import { getCardLegality } from "@/lib/legality";
import { detectRegion, buildTCGPlayerUrl, buildCardMarketUrl } from "@/lib/affiliates";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart, Palette, Quote, Sparkles, Share2, BookmarkPlus, BookmarkCheck, Twitter, Facebook } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { highlightRulesText, SYMBOL_ICONS } from "@/components/ui/card-text";
import { getFormattedSubtitle, getDisplayType, isFoilOnly } from "@/lib/card-utils";

export default function CardDetail() {
  const { id } = useParams();
  const { data: allCards = [], isLoading } = useAllCards();
   const { getEntry, addCopy, removeCopy, toggleCollected, isCollected } = useCollection();
   const { formatPrice } = useCurrency();
   const { toggleWishlist, isInWishlist } = useWishlist();
   const [imgError, setImgError] = useState(false);
   const [copying, setCopying] = useState(false);
   const [showSocialShare, setShowSocialShare] = useState(false);

  const decodedId = id ? decodeURIComponent(id) : "";
  const card = allCards.find(c => c.id === decodedId);
  const collectionEntry = card ? getEntry(card.id) : { normal: 0, foil: 0 };
  const foilOnly = card ? isFoilOnly(card) : false;
  const legality = card ? getCardLegality(card, allCards) : null;

  const searchStr = useSearch();
  const urlParams = new URLSearchParams(searchStr);
  const fromUrl = urlParams.get("from");


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Card Not Found</h1>
        <Link href={fromUrl ? fromUrl : "/cards"}>
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> {fromUrl ? "Back to Set" : "Back to Cards"}</Button>
        </Link>
      </div>
    );
  }

  const relatedCards = allCards
    .filter(c => c.id !== card.id && (c.type === card.type || c.inkColor === card.inkColor))
    .slice(0, 5);

  const artistCards = card.artist
    ? allCards
        .filter(c => c.id !== card.id && c.artist === card.artist && !!c.image)
        .slice(0, 8)
    : [];

  const hexColor = inkHexColors[card.inkColor] ?? "#f59e0b";
  const gradient = inkGradients[card.inkColor] ?? inkGradients.Amber;
  const hasImage = !!card.image && !imgError;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Link href={fromUrl ? fromUrl : "/cards"} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> {fromUrl ? "Back to Set" : "Back to Browse"}
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
        {/* Left: Card Art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full lg:w-[360px] shrink-0"
        >
          <div className="sticky top-24">
            <Dialog>
              {hasImage ? (
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl border border-border/50 aspect-[2.5/3.5]">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                  
                  {/* Hover Overlay with Enlarge Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <DialogTrigger asChild>
                      <button className="p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300 pointer-events-auto hover:bg-white/30">
                        <Maximize2 className="w-8 h-8" />
                      </button>
                    </DialogTrigger>
                  </div>
                </div>
              ) : (
                <div className="aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl relative">
                  <img src="/LCardBack.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", gradient)} />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}

              {/* Enlarged Card Dialog Content */}
              {hasImage && (
                <DialogContent className="max-w-[98vw] md:max-w-fit w-auto h-auto p-0 overflow-hidden bg-transparent border-none shadow-none focus:outline-none flex items-center justify-center">
                  <DialogTitle className="sr-only">Enlarged card view of {card.name}</DialogTitle>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center p-2 sm:p-6 w-full h-full"
                  >
                    <div className="relative h-[85vh] max-h-[900px] aspect-[2.5/3.5] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.7)] border border-white/20 ring-1 ring-white/10 m-auto">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                </DialogContent>
              )}
            </Dialog>

            {/* Regional Marketplace CTA */}
            {(card.priceUsd != null || card.priceUsdFoil != null) && (
              <div className="rounded-2xl border bg-card/80 backdrop-blur overflow-hidden mt-4 group">
                <div className="px-4 pt-3 pb-2 border-b border-border/50 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Market Availability
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">Real-time Pricing</span>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Primary CTA (Regional) */}
                  {(() => {
                    const region = detectRegion();
                    const isUS = region === "US" || region === "Other";
                    const primaryLink = isUS ? buildTCGPlayerUrl(card) : buildCardMarketUrl(card);
                    const primaryName = isUS ? "TCGPlayer" : "CardMarket";
                    const secondaryName = isUS ? "CardMarket" : "TCGPlayer";
                    const secondaryLink = isUS ? buildCardMarketUrl(card) : buildTCGPlayerUrl(card);

                    return (
                      <>
                        <a
                          href={primaryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                        >
                          Buy on {primaryName}
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </a>
                        <div className="grid grid-cols-2 gap-2">
                           {/* Normal Price - Hidden for Foil-Only rarities */}
                           {!foilOnly && (
                             <div className="flex flex-col p-2.5 rounded-lg bg-muted/30 border border-border/40">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Normal</span>
                                <span className="text-sm font-black" style={{ color: hexColor }}>
                                   {card.priceUsd ? formatPrice(card.priceUsd) : "N/A"}
                                </span>
                             </div>
                           )}
 
                           {/* Foil Price - Expand if Normal is hidden */}
                           <div className={cn("flex flex-col p-2.5 rounded-lg bg-muted/30 border border-border/40", foilOnly ? "col-span-2" : "col-span-1")}>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Cold Foil</span>
                              <span className="text-sm font-black" style={{ color: hexColor }}>
                                 {card.priceUsdFoil ? formatPrice(card.priceUsdFoil) : "N/A"}
                              </span>
                           </div>
                        </div>

                        <a
                          href={secondaryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center text-xs font-bold py-2 rounded-lg border border-border bg-muted/50 hover:bg-muted text-muted-foreground transition-all"
                        >
                          View on {secondaryName} ↗
                        </a>
                      </>
                    );
                  })()}
                </div>

                  <Button 
                    variant="outline" 
                    className="h-10 w-full rounded-xl border-border bg-card/50 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all active:scale-95"
                    onClick={() => setShowSocialShare(true)}
                  >
                    <Share2 className="w-4 h-4" />
                    Share this Card
                  </Button>
              </div>
            )}

              {/* Collection Tracker */}
              <div className="rounded-2xl border bg-card/80 backdrop-blur overflow-hidden mt-4">
                <div className="px-4 pt-3 pb-2 border-b border-border/50 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">My Collection</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${hexColor}22`, color: hexColor }}
                  >
                    {collectionEntry.normal + collectionEntry.foil} total
                  </span>
                </div>

                <div className="divide-y divide-border/40">
                  {!foilOnly && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">Normal</p>
                        <p className="text-xs text-muted-foreground">Standard print</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeCopy(card.id, "normal")}
                          disabled={collectionEntry.normal === 0}
                          className="w-8 h-8 rounded-lg border border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-lg font-bold tabular-nums" style={{ color: collectionEntry.normal > 0 ? hexColor : undefined }}>
                          {collectionEntry.normal}
                        </span>
                        <button
                          onClick={() => addCopy(card.id, "normal")}
                          className="w-8 h-8 rounded-lg border border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-lg font-bold transition-colors"
                          style={collectionEntry.normal > 0 ? { borderColor: hexColor, color: hexColor } : {}}
                        >
                          +
                        </button>
                        <button
                          onClick={() => toggleWishlist(card.id, "normal")}
                          className={cn(
                            "w-8 h-8 rounded-lg border flex items-center justify-center transition-all active:scale-90 ml-1",
                            isInWishlist(card.id, "normal") ? "bg-pink-500 border-pink-400 text-white" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                          )}
                          title="Add to Wishlist"
                        >
                          <Heart className={cn("w-4 h-4", isInWishlist(card.id, "normal") && "fill-current")} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">Cold Foil</p>
                      <p className="text-xs text-muted-foreground">Foil treatment</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeCopy(card.id, "foil")}
                        disabled={collectionEntry.foil === 0}
                        className="w-8 h-8 rounded-lg border border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-lg font-bold tabular-nums" style={{ color: collectionEntry.foil > 0 ? hexColor : undefined }}>
                        {collectionEntry.foil}
                      </span>
                      <button
                        onClick={() => addCopy(card.id, "foil")}
                        className="w-8 h-8 rounded-lg border border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-lg font-bold transition-colors"
                        style={collectionEntry.foil > 0 ? { borderColor: hexColor, color: hexColor } : {}}
                      >
                        +
                      </button>
                      <button
                        onClick={() => toggleWishlist(card.id, "foil")}
                        className={cn(
                          "w-8 h-8 rounded-lg border flex items-center justify-center transition-all active:scale-90 ml-1",
                          isInWishlist(card.id, "foil") ? "bg-amber-500 border-amber-400 text-white" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                        )}
                        title="Add to Foil Wishlist"
                      >
                        <Sparkles className={cn("w-4 h-4", isInWishlist(card.id, "foil") && "fill-current")} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            {/* Tournament Legality */}
            {legality && (
              <div className="rounded-2xl border bg-card/80 backdrop-blur overflow-hidden mt-4 text-sm">
                <div className="px-4 pt-3 pb-2 border-b border-border/50 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Format Legality</span>
                </div>
                <div className="divide-y divide-border/40">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="font-medium">Core Constructed</span>
                    <span className={cn("font-bold", legality.core === 'Legal' ? 'text-emerald-500' : 'text-destructive')}>
                      {legality.core}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="font-medium">Infinity Constructed</span>
                    <span className={cn("font-bold", legality.infinity === 'Legal' ? 'text-emerald-500' : 'text-destructive')}>
                      {legality.infinity}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Card Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 space-y-6"
        >
          {/* BUREAU: Identity */}
          <section className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {(card.allInkColors || [card.inkColor]).map(c => (
                    <div
                      key={c}
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: inkHexColors[c] ?? "#888" }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {(card.allInkColors || [card.inkColor]).join(" / ")} • {getDisplayType(card)}
                </span>
              </div>
              {card.franchise && (
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10">
                  {card.franchise}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground">{card.name}</h1>
            {getFormattedSubtitle(card) && (
              <h2 className="text-xl md:text-2xl font-serif text-muted-foreground/80 italic">{getFormattedSubtitle(card)}</h2>
            )}

            {isDisney100(card) && (
              <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded bg-amber-500/5 border border-amber-500/20 w-fit">
                <img src="/rarities/Disney_100_logo.png" alt="D100" className="w-5 h-5 object-contain" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-600/80">Disney 100 Edition</span>
              </div>
            )}
          </section>

          {/* BUREAU: Combat Stats */}
          <section className="grid grid-cols-4 gap-3">
            {[
              { label: "Cost", value: card.cost, color: "bg-slate-100 dark:bg-slate-800", icon: "{I}" },
              { label: "Strength", value: card.strength, color: "bg-red-50 dark:bg-red-950/30", icon: "{S}", hide: card.type !== "Character" },
              { label: "Willpower", value: card.willpower, color: "bg-blue-50 dark:bg-blue-950/30", icon: "{W}", hide: card.type !== "Character" && card.type !== "Location" },
              { label: "Lore", value: card.lore, color: "bg-amber-50 dark:bg-amber-950/30", icon: "{L}", hide: card.type !== "Character" && card.type !== "Location" },
              { label: "Inkable", value: card.inkable ? "Yes" : "No", color: "bg-secondary/40", hide: card.type === "Character" || card.type === "Location" }
            ].filter(s => !s.hide).map(stat => (
              <div key={stat.label} className={cn("flex flex-col items-center justify-center p-3 rounded-2xl border border-border/40 shadow-sm", stat.color)}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums">{stat.value ?? 0}</span>
                  {stat.icon && (
                    <span className={cn("w-3 h-3 rounded-full flex items-center justify-center", SYMBOL_ICONS[stat.icon].bg)}>
                      <svg viewBox="0 0 24 24" className={cn("w-2 h-2", SYMBOL_ICONS[stat.icon].color)}>{SYMBOL_ICONS[stat.icon].symbol}</svg>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* BUREAU: Abilities & Text */}
          <section className="space-y-5 p-6 rounded-3xl bg-card border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <img src={getInkLogo(card.inkColor)} alt="" className="w-32 h-32 rotate-12" />
            </div>

            {/* Classifications */}
            {card.classifications && card.classifications.length > 0 && (() => {
              const ORIGINS = ["Storyborn", "Dreamborn", "Floodborn", "Inkborn"];
              const ORIGIN_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
                Storyborn:  { bg: "bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-500/20",   dot: "#f59e0b" },
                Dreamborn:  { bg: "bg-violet-500/10",  text: "text-violet-600 dark:text-violet-400",  border: "border-violet-500/20",  dot: "#8b5cf6" },
                Floodborn:  { bg: "bg-sky-500/10",     text: "text-sky-600 dark:text-sky-400",     border: "border-sky-500/20",     dot: "#38bdf8" },
                Inkborn:    { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", dot: "#10b981" },
              };
              const origins = card.classifications.filter(c => ORIGINS.includes(c));
              const roles = card.classifications.filter(c => !ORIGINS.includes(c));
              return (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-4 border-b border-border/40">
                  {origins.map(origin => {
                    const style = ORIGIN_STYLES[origin] ?? { bg: "bg-secondary", text: "text-foreground", border: "border-border", dot: hexColor };
                    return (
                      <span key={origin} className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-widest uppercase", style.bg, style.text, style.border)}>
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: style.dot }} />
                        {origin}
                      </span>
                    );
                  })}
                  <div className="flex flex-wrap gap-1.5 font-sans italic text-sm text-muted-foreground/80">
                    {roles.join(" • ")}
                  </div>
                </div>
              );
            })()}

            {card.bodyText && (
              <div className="min-h-[60px]">
                {highlightRulesText(card.bodyText)}
              </div>
            )}


            {card.flavorText && (
              <div className="pt-6 border-t border-border/40 relative">
                <Quote className="absolute top-4 left-0 w-8 h-8 text-primary/10 -scale-x-100" />
                <p className="text-sm md:text-lg font-serif italic leading-relaxed text-muted-foreground/90 pl-8 relative z-10">
                  {card.flavorText}
                </p>
              </div>
            )}
          </section>

          {/* BUREAU: Technical Info */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl border bg-secondary/20 text-[11px]">
            <div>
              <span className="text-muted-foreground uppercase tracking-widest block mb-1">Set & Expansion</span>
              <span className="font-bold flex items-center gap-1">
                {card.set} <span className="text-muted-foreground font-normal">({card.expansion})</span>
              </span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase tracking-widest block mb-1">Rarity</span>
              <div className="flex items-center gap-1.5">
                {rarityIcons[card.rarity] && <img src={rarityIcons[card.rarity]} alt="" className="w-3.5 h-3.5 object-contain" />}
                <span className="font-bold">{card.rarity}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground uppercase tracking-widest block mb-1">Artist</span>
              <Link href={`/cards?search=${encodeURIComponent(card.artist || "")}`} className="flex items-center gap-2 hover:text-primary transition-colors group/artist">
                <Palette className="w-3.5 h-3.5 text-primary/60 group-hover/artist:text-primary transition-colors" />
                <span className="font-bold">{card.artist || "Unknown"}</span>
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground uppercase tracking-widest block mb-1">Language</span>
              <span className="font-bold">English</span>
            </div>
          </section>
        </motion.div>
      </div>

      {/* Artist Gallery */}
      {card.artist && artistCards.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border/40">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">More by this artist</p>
              <h3 className="text-2xl font-serif font-bold">{card.artist}</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {artistCards.map(c => (
              <Link key={c.id} href={`/cards/${encodeURIComponent(c.id)}${fromUrl ? `?from=${fromUrl}` : ""}`}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.03 }}
                  transition={{ duration: 0.15 }}
                  className="aspect-[2.5/3.5] rounded-xl overflow-hidden border border-border/50 shadow-md hover:shadow-xl cursor-pointer bg-muted"
                >
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                </motion.div>
                <p className="text-xs text-muted-foreground truncate mt-1 px-0.5">{c.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Similar Cards */}
      {relatedCards.length > 0 && (
        <section className="mt-8 pt-6 border-t border-border/40">
          <h3 className="text-xl font-serif font-bold mb-4 text-muted-foreground">More Like This</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedCards.map(c => (
              <CardDisplay key={c.id} card={c} returnTo={fromUrl ?? undefined} />
            ))}
          </div>
        </section>
      )}

      {/* Social Share Modal */}
      <Dialog open={showSocialShare} onOpenChange={setShowSocialShare}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Card</DialogTitle>
            <DialogDescription>
              Share "{card.name}" with other Illumineers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-6 py-4">
            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="gap-2 bg-[#1DA1F2]/5 hover:bg-[#1DA1F2]/10 border-[#1DA1F2]/20 text-[#1DA1F2]"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this Disney Lorcana card "${card.name}" on Lorbound!`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                <Twitter className="w-4 h-4 fill-current" /> Twitter
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 bg-[#4267B2]/5 hover:bg-[#4267B2]/10 border-[#4267B2]/20 text-[#4267B2]"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                <Facebook className="w-4 h-4 fill-current" /> Facebook
              </Button>
            </div>

            {/* Copy Link Field */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Direct Link</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={window.location.href} 
                  className="bg-muted/50 text-xs h-9"
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopying(true);
                    setTimeout(() => setCopying(false), 2000);
                  }} 
                  className="shrink-0 h-9"
                >
                   {copying ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Subtle Branding */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">Join the community</p>
                <p className="text-[10px] text-muted-foreground">Track your collection and build decks at www.lorbound.com</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
