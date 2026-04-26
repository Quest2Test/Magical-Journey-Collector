import { useMemo } from "react";
import { Link } from "wouter";
import { useAllCards, useSets } from "@/hooks/useCards";
import { Card } from "@/data/cards";
import { CardDisplay, inkHexColors, getInkLogo } from "@/components/ui/card-display";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Layers, TrendingUp, Loader2, BookOpen, Archive, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: allCards = [], isLoading: cardsLoading } = useAllCards();
  const { data: sets = [] } = useSets();

  // 1. Card of the Day (Deterministic rotation)
  const cardOfTheDay = useMemo(() => {
    if (!allCards.length) return null;
    const pool = allCards.filter(c => (c.rarity === "Legendary" || c.rarity === "Enchanted") && !!c.image);
    if (!pool.length) return allCards[0];

    // Seed based on date YYYY-MM-DD
    const dateStr = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % pool.length;
    return pool[index];
  }, [allCards]);

  // 2. Market Trends (Top 4 most expensive/rare cards)
  const marketTrends = useMemo(() => {
    return allCards
      .filter(c => (c.rarity === "Legendary" || c.rarity === "Enchanted" || c.rarity === "Super Rare") && !!c.image)
      .sort((a, b) => {
        // Sort by price, then by set latest
        const priceA = a.priceUsd ?? 0;
        const priceB = b.priceUsd ?? 0;
        if (priceB !== priceA) return priceB - priceA;
        return (b.setNum || 0) - (a.setNum || 0);
      })
      .slice(0, 4);
  }, [allCards]);



  const totalCards = allCards.length;

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero — Asymmetric Split */}
      <section className="relative overflow-hidden bg-background pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Background Effects */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, #80808008 1px, transparent 1px), linear-gradient(to bottom, #80808008 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
        <div className="absolute left-[-10%] top-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute right-[5%] bottom-[-15%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Text & CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-8 bg-primary/5 backdrop-blur-md text-primary shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                Illumineer Bureau Access Granted
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
                The Ultimate<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-amber-600">
                  Lorcana Archive
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 font-sans font-light leading-relaxed">
                Lorbound is the ultimate Lorcana Deck Builder and Lorcana Collection Tracker. Master the inklands, discover every glimmer, build legendary decks, and track your growing collection in a professional toolkit designed for true Illumineers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cards">
                  <Button variant="default" size="lg" className="h-14 px-10 text-lg gap-3 w-full sm:w-auto shadow-xl shadow-primary/20 hover-elevate font-bold rounded-2xl group">
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" /> Browse The Great Illuminary
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg gap-3 w-full sm:w-auto backdrop-blur-sm bg-background/50 border-primary/20 hover:border-primary/40 font-bold rounded-2xl">
                    <Layers className="w-5 h-5" /> Deck Builder
                  </Button>
                </Link>
              </div>

              {/* Inline Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
                {[
                  { label: "Glimmers", value: cardsLoading ? "…" : totalCards.toLocaleString() },
                  { label: "Sets", value: sets.length > 0 ? `${sets.length}` : "7" },
                  { label: "Ink Types", value: "6" },
                ].map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="text-2xl md:text-3xl font-bold text-primary font-serif">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — 3D Rotating Card of the Day */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
              className="relative flex items-center justify-center perspective-[1200px]"
            >
              {cardOfTheDay && (
                <div className="relative group">
                  {/* Dynamic ink glow behind card */}
                  <div
                    className="absolute -inset-8 blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-700 rounded-full"
                    style={{ backgroundColor: inkHexColors[cardOfTheDay.inkColor as keyof typeof inkHexColors] }}
                  />

                  {/* The card with 3D hover tilt */}
                  <div className="relative [transform-style:preserve-3d] group-hover:[transform:rotateY(-6deg)_rotateX(4deg)_scale(1.03)] transition-transform duration-700 ease-out">
                    <CardDisplay card={cardOfTheDay} hideInfo className="w-full max-w-xs md:max-w-sm mx-auto shadow-2xl rounded-2xl" />
                  </div>

                  {/* Card name badge floating below */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-center"
                  >
                    <Link href={cardOfTheDay ? `/cards/${cardOfTheDay.id}` : "#"}>
                      <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group/badge">
                        <img src={getInkLogo(cardOfTheDay.inkColor)} alt={cardOfTheDay.inkColor} className="w-5 h-5 object-contain" />
                        <div className="text-left">
                          <div className="text-sm font-bold group-hover/badge:text-primary transition-colors">{cardOfTheDay.name}</div>
                          <div className="text-[10px] text-muted-foreground">{cardOfTheDay.subtitle ? `${cardOfTheDay.subtitle} · ` : ""}{cardOfTheDay.rarity} · Card of the Day</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/badge:text-primary group-hover/badge:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      {/* Market Trends */}
      <section className="py-24 bg-muted/20 border-y border-border/40 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {cardsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-12">
                <div className="text-center md:text-left">
                  <div className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Current Trends
                  </div>
                  <h2 className="text-3xl font-serif font-bold tracking-tight">Active Interests</h2>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Cards capturing the most attention and value in the current meta.
                  </p>
                </div>
                <Link href="/cards">
                  <Button variant="ghost" size="sm" className="gap-2 group text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                    Card List <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {marketTrends.map((card: Card, i: number) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <CardDisplay card={card} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ink Colors Bureau */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-16">
            <div className="text-center md:text-left">
              <div className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-3">Chromatic Archive</div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Master the Ink</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Every shimmering glimmer is born from unique ink. Filter by color to find the perfect additions to your strategy.
              </p>
            </div>
            <Link href="/cards">
              <Button variant="outline" className="rounded-full px-6">Explore All Cards</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {["Amber", "Amethyst", "Emerald", "Ruby", "Sapphire", "Steel"].map(ink => (
              <Link key={ink} href={`/cards?ink=${ink}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="relative group h-48 rounded-[2rem] border bg-card/30 backdrop-blur-md overflow-hidden p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-2xl"
                  style={{ borderColor: `${inkHexColors[ink as keyof typeof inkHexColors]}33` }}
                >
                  {/* Per-ink Glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] }}
                  />

                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <img
                        src={getInkLogo(ink)}
                        alt={ink}
                        className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                      />
                    </div>
                    <span
                      className="font-bold text-lg tracking-wide uppercase transition-colors"
                      style={{ color: inkHexColors[ink as keyof typeof inkHexColors] }}
                    >
                      {ink}
                    </span>
                  </div>

                  {/* Decorative element */}
                  <div
                    className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: inkHexColors[ink as keyof typeof inkHexColors] }}
                  />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Explore the Platform */}
      <section className="py-24 bg-muted/20 border-t border-border/40 relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-20%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" /> Your Toolkit
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Explore the Platform</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything an Illumineer needs, from deck building to deep-dives on every card set.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Lorcana Deck Builder",
                desc: "Craft, refine, and export tournament-ready decks with real-time analytics, ink curve visualisation, and price tracking.",
                href: "/builder",
                color: "from-violet-500 to-purple-600",
                accent: "text-violet-400",
                border: "hover:border-violet-500/40",
              },
              {
                icon: BookOpen,
                title: "Inkbound Academy",
                desc: "Master the fundamentals. Learn about card types, rarities, keywords, and competitive formats in our comprehensive guide.",
                href: "/academy",
                color: "from-amber-500 to-orange-600",
                accent: "text-amber-400",
                border: "hover:border-amber-500/40",
              },
              {
                icon: Archive,
                title: "Lorcana Collection Tracker",
                desc: "Browse every expansion, track your collected cards, and explore set-specific collections.",
                href: "/sets",
                color: "from-emerald-500 to-teal-600",
                accent: "text-emerald-400",
                border: "hover:border-emerald-500/40",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Link href={feature.href}>
                  <div className={`group relative border rounded-2xl p-8 bg-card/60 backdrop-blur-sm flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-xl ${feature.border}`}>
                    {/* Gradient icon badge */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-xl font-bold font-serif mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                      {feature.desc}
                    </p>

                    <div className={`flex items-center gap-2 text-sm font-bold ${feature.accent} group-hover:gap-3 transition-all`}>
                      Explore <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* Subtle corner glow on hover */}
                    <div className={`absolute -bottom-2 -right-2 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-gradient-to-br ${feature.color}`} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
