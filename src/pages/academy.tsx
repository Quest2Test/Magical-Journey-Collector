import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, Zap, Sparkles, Droplet, Star, Swords, Target, Scroll, CircleDot, Layers, ChevronDown, ChevronUp, Trophy, Ban, HelpCircle, Gem, Palette, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInkLogo, inkHexColors, rarityIcons } from "@/components/ui/card-display";
import { Link } from "wouter";

/* ─── Collapsible Section ─── */
function Collapsible({ title, icon, defaultOpen = false, children }: { title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
          <h2 className="text-lg font-bold font-serif">{title}</h2>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-6 space-y-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">{step}</div>
      <div>
        <h4 className="font-bold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export default function Academy() {

  const KNOWLEDGE_BASE = [
    { title: "Shift", icon: <Zap className="w-5 h-5" />, color: "text-amber-500", description: "Pay an alternative (usually cheaper) cost to play this character on top of one of your characters with the exact same name. The new card inherits all damage, exertion status, and effects from the old one." },
    { title: "Evasive", icon: <Sparkles className="w-5 h-5" />, color: "text-emerald-500", description: "Only characters with Evasive can challenge this character. This character can still be banished by Actions, Songs, and abilities." },
    { title: "Rush", icon: <Zap className="w-5 h-5" />, color: "text-red-500", description: "This character can challenge the turn it is played, skipping the normal requirement to wait one turn before exerting." },
    { title: "Bodyguard", icon: <Shield className="w-5 h-5" />, color: "text-blue-500", description: "This character enters play exerted. While exerted, opposing characters must choose this character when challenging — protecting your other exerted characters." },
    { title: "Singer", icon: <Star className="w-5 h-5" />, color: "text-violet-500", description: "This character can exert to sing a Song card with a cost up to the Singer value, paying no ink to play it. For example, Singer 5 can sing any Song costing 5 or less." },
    { title: "Challenger", icon: <Swords className="w-5 h-5" />, color: "text-orange-500", description: "Challenger +X grants this character extra Strength when it initiates a challenge. The bonus does NOT apply when this character is being challenged." },
    { title: "Resist", icon: <Shield className="w-5 h-5" />, color: "text-slate-400", description: "Resist +X reduces all damage dealt to this character by X. This applies to damage from challenges, actions, songs, and abilities." },
    { title: "Ward", icon: <Shield className="w-5 h-5" />, color: "text-cyan-500", description: "This character can't be chosen by the effects of actions, songs, or abilities controlled by opponents. Ward is removed after this character takes damage." },
    { title: "Reckless", icon: <Target className="w-5 h-5" />, color: "text-rose-500", description: "This character must challenge if able. If an opponent has an exerted character, this character is forced to challenge rather than quest." },
    { title: "Support", icon: <Star className="w-5 h-5" />, color: "text-teal-500", description: "When this character quests, you may add their Strength to another chosen character's Strength this turn. The bonus lasts until the start of your next turn." },
  ];

  const INK_THEORY = [
    { name: "Amber", focus: "Healing, readying characters, board swarming, gaining lore passively", color: "Amber" },
    { name: "Amethyst", focus: "Card draw, bouncing characters to hand, exerting opponents, powerful sorcery", color: "Amethyst" },
    { name: "Emerald", focus: "Evasive characters, hand disruption, conditional removal, flexibility", color: "Emerald" },
    { name: "Ruby", focus: "Rush characters, direct damage, lore denial, aggressive tempo", color: "Ruby" },
    { name: "Sapphire", focus: "Extra ink ramping, items, card draw, support abilities, late-game power", color: "Sapphire" },
    { name: "Steel", focus: "High willpower, Bodyguards, direct banishment, resilient defenses", color: "Steel" },
  ];

  const CORE_LEGAL_SETS = [
    { num: 5, name: "Shimmering Skies", block: 2 },
    { num: 6, name: "Azurite Sea", block: 2 },
    { num: 7, name: "Archazia's Island", block: 2 },
    { num: 8, name: "The Reign of Jafar", block: 2 },
    { num: 9, name: "Fabled", block: 3 },
    { num: 10, name: "Whispers in the Well", block: 3 },
    { num: 11, name: "Winterspell", block: 3 },
    { num: 12, name: "Wilds Unknown", block: 3 },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-background pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 border-b border-border/40">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-[0.03] pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6 bg-primary/10 text-primary">
              <BookOpen className="w-3.5 h-3.5" /> Learn Lorcana
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground mb-6">
              The Grand <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Academy</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              Everything you need to master Disney Lorcana, from your very first game to competitive tournament play.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 mt-16">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* ═══ Main Content ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Starting the Game ── */}
            <Collapsible title="Starting the Game & Mulligan" icon={<CircleDot className="w-5 h-5" />} defaultOpen>
              <div className="space-y-3">
                <StepCard step={1} title="Determine Who Goes First">
                  Both players flip a coin or use any random method. The winner chooses whether to go first or second.
                </StepCard>
                <StepCard step={2} title="Draw Your Opening Hand">
                  Each player draws <strong className="text-foreground">7 cards</strong> from the top of their shuffled deck.
                </StepCard>
                <StepCard step={3} title="The Mulligan">
                  If you are unhappy with your hand, you may put any number of cards from your hand on the bottom of your deck, then draw that many cards. You may only mulligan once.
                </StepCard>
                <StepCard step={4} title="Begin Play">
                  The first player takes their turn but <strong className="text-foreground">skips their draw step</strong> on the very first turn. After that, play alternates normally.
                </StepCard>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">💡 Practice Makes Perfect:</strong> You can practice your opening hands using our <Link href="/builder" className="text-primary font-bold hover:underline">Mulligan Simulator</Link>. It's the best way to test the consistency of your deck before taking it to a tournament.
                  </p>
                </div>
                <Link href="/builder">
                  <Button size="sm" variant="outline" className="gap-2 shrink-0">
                    <Play className="w-4 h-4" /> Try Simulator
                  </Button>
                </Link>
              </div>
            </Collapsible>

            {/* ── The Basics ── */}
            <Collapsible title="The Basics" icon={<BookOpen className="w-5 h-5" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Disney Lorcana is a trading card game where two players (called Illumineers) compete to be the first to collect <strong className="text-foreground">20 Lore</strong>. You build a 60-card deck using exactly 1 or 2 ink colors, with a maximum of 4 copies of any card.
              </p>

              <h4 className="font-bold text-foreground pt-2">Turn Structure</h4>
              <div className="space-y-3 mt-2">
                <StepCard step={1} title="Beginning Phase">
                  Ready (un-exert) all your exerted cards. All effects that trigger "at the start of your turn" happen now.
                </StepCard>
                <StepCard step={2} title="Draw">
                  Draw 1 card from your deck. (The first player skips this on their very first turn.)
                </StepCard>
                <StepCard step={3} title="Main Phase">
                  You may perform any number of actions in any order: Play a card, add a card to your inkwell, use abilities, challenge opposing characters, or send your characters on a quest.
                </StepCard>
              </div>

              <h4 className="font-bold text-foreground pt-4">Key Concepts</h4>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                <div className="p-3 rounded-xl bg-muted/50 border">
                  <p className="font-bold text-sm flex items-center gap-2"><Droplet className="w-4 h-4 text-primary" /> Inkwell</p>
                  <p className="text-xs text-muted-foreground mt-1">Once per turn, place a card with the golden border face-down in your inkwell. Each ink in your inkwell pays for 1 cost when playing cards.</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border">
                  <p className="font-bold text-sm flex items-center gap-2"><CircleDot className="w-4 h-4 text-amber-500" /> Questing</p>
                  <p className="text-xs text-muted-foreground mt-1">Exert a ready character to quest. You gain lore equal to that character's lore value. First to 20 lore wins!</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border">
                  <p className="font-bold text-sm flex items-center gap-2"><Swords className="w-4 h-4 text-red-500" /> Challenging</p>
                  <p className="text-xs text-muted-foreground mt-1">Exert a ready character to challenge an opponent's exerted character. Both deal damage equal to their strength simultaneously.</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border">
                  <p className="font-bold text-sm flex items-center gap-2"><Scroll className="w-4 h-4 text-violet-500" /> Songs</p>
                  <p className="text-xs text-muted-foreground mt-1">Song cards can be played normally or "sung" by exerting a character with a cost ≥ the Song's cost (or using Singer).</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
                <p className="text-sm text-muted-foreground"><strong className="text-foreground">🏆 Win Condition:</strong> The first player to reach <strong className="text-foreground">20 Lore</strong> wins the game. If a player must draw a card but has no cards left in their deck, they lose immediately.</p>
              </div>
            </Collapsible>

            {/* ── Card Types ── */}
            <Collapsible title="Card Types" icon={<Layers className="w-5 h-5" />}>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Characters</h4>
                  <p className="text-sm text-muted-foreground mt-1">The primary card type. Characters can quest for lore, challenge opponents, and use abilities. They have Strength (damage dealt) and Willpower (health). When damage equals or exceeds willpower, the character is banished.</p>
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500" /> Actions</h4>
                  <p className="text-sm text-muted-foreground mt-1">One-time effects. Pay the ink cost, resolve the effect, then the card goes to your discard pile. Actions are your spells and tricks.</p>
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Songs</h4>
                  <p className="text-sm text-muted-foreground mt-1">A special subtype of Actions. Songs can be played by paying ink normally OR by exerting a character whose cost is equal to or greater than the Song's cost. This is called "singing."</p>
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Items</h4>
                  <p className="text-sm text-muted-foreground mt-1">Persistent cards that stay in play and provide ongoing effects or activated abilities. Items cannot quest, challenge, or be challenged.</p>
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500" /> Locations</h4>
                  <p className="text-sm text-muted-foreground mt-1">Locations stay in play and can hold characters that "move" to them. Characters at a location gain its bonuses. Locations have their own willpower and can be challenged.</p>
                </div>
              </div>
            </Collapsible>

            {/* ── Inkable vs Non-Inkable ── */}
            <Collapsible title="Inkable vs Non-Inkable Cards" icon={<Palette className="w-5 h-5" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every card in Lorcana is either <strong className="text-foreground">inkable</strong> or <strong className="text-foreground">non-inkable</strong>. This is one of the most critical deckbuilding concepts.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
                  <h4 className="font-bold text-sm flex items-center gap-2 mb-2"><Droplet className="w-4 h-4 text-primary" /> Inkable Cards</h4>
                  <p className="text-xs text-muted-foreground">Identified by the <strong className="text-foreground">golden swirl border</strong> around the ink cost. These cards can be placed face-down in your inkwell during your turn to generate ink.</p>
                </div>
                <div className="p-4 rounded-xl border bg-card">
                  <h4 className="font-bold text-sm flex items-center gap-2 mb-2"><Ban className="w-4 h-4 text-muted-foreground" /> Non-Inkable Cards</h4>
                  <p className="text-xs text-muted-foreground">No golden swirl. These cards are typically too powerful to be used as ink. They <strong className="text-foreground">cannot</strong> be placed into your inkwell and must be played from hand.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">⚖️ Deckbuilding Rule of Thumb:</strong> Most competitive decks run <strong className="text-foreground">40+ inkable</strong> and <strong className="text-foreground">~16 non-inkable</strong> cards. Too few inkable cards means you'll struggle to build your inkwell, too many means your deck lacks power cards.
                </p>
              </div>
            </Collapsible>

            {/* ── Rarity Guide ── */}
            <Collapsible title="Rarity Guide" icon={<Gem className="w-5 h-5" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every Lorcana card has a rarity that affects how often it appears in booster packs and its market value. Rarity does <strong className="text-foreground">not</strong> affect deckbuilding legality, you can run 4 copies of any rarity.
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                  <img src={rarityIcons["Common"]} alt="Common" className="w-8 h-8 object-contain shrink-0" />
                  <div><h4 className="font-bold text-sm">Common</h4><p className="text-xs text-muted-foreground">Most frequently found. Solid role-players and foundational cards.</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                  <img src={rarityIcons["Uncommon"]} alt="Uncommon" className="w-8 h-8 object-contain shrink-0" />
                  <div><h4 className="font-bold text-sm">Uncommon</h4><p className="text-xs text-muted-foreground">Slightly harder to pull. Often carry useful keyword abilities.</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                  <img src={rarityIcons["Rare"]} alt="Rare" className="w-8 h-8 object-contain shrink-0" />
                  <div><h4 className="font-bold text-sm">Rare</h4><p className="text-xs text-muted-foreground">can be both or one of the two cards in every pack are either Rare, Super Rare, or Legendary Powerful effects and strong stat lines.</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                  <img src={rarityIcons["Super Rare"]} alt="Super Rare" className="w-8 h-8 object-contain shrink-0" />
                  <div><h4 className="font-bold text-sm">Super Rare</h4><p className="text-xs text-muted-foreground">High-impact cards that often define archetypes.</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                  <img src={rarityIcons["Legendary"]} alt="Legendary" className="w-8 h-8 object-contain shrink-0" />
                  <div><h4 className="font-bold text-sm">Legendary</h4><p className="text-xs text-muted-foreground">The highest standard rarity. Game-changing abilities and iconic characters.</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-amber-500/10 border border-violet-500/30">
                  <img src={rarityIcons["Enchanted"]} alt="Enchanted" className="w-8 h-8 object-contain shrink-0" />
                  <div><h4 className="font-bold text-sm">Enchanted</h4><p className="text-xs text-muted-foreground">Ultra-rare alternate art versions with stunning full-art designs. Approximately 1 in every 96 packs. Highly collectible.</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-sky-500/10 border border-cyan-500/30">
                  <img src={rarityIcons["Iconic"]} alt="Iconic" className="w-8 h-8 object-contain shrink-0" />
                  <div><h4 className="font-bold text-sm">Iconic</h4><p className="text-xs text-muted-foreground">The rarest cards in the game. Special foil-only promotional and set chase cards with unique artwork. Exclusive 3D foil and extremely limited.</p></div>
                </div>
              </div>
            </Collapsible>

            {/* ── Formats ── */}
            <Collapsible title="Competitive Formats" icon={<Trophy className="w-5 h-5" />}>
              <div className="space-y-6">
                {/* Core */}
                <div className="p-5 rounded-xl border-2 border-primary/30 bg-primary/5">
                  <h4 className="text-lg font-bold font-serif flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-primary" /> Core Constructed
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    The primary competitive format used at official Disney Lorcana Challenge events. Core uses a <strong className="text-foreground">Block System</strong>, sets are grouped into blocks of 4, and only the <strong className="text-foreground">two most recent blocks</strong> are legal. When a new block begins, the oldest block rotates out.
                  </p>
                  <div className="mb-3">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2">Currently Legal - Bloc 2 & Bloc 3 (Sets 5–12)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CORE_LEGAL_SETS.map(s => (
                        <div key={s.num} className="flex items-center gap-2 p-2 rounded-lg bg-background border text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{s.num}</span>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Ban className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-destructive">Banned Cards</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Hiram Flaversham – Toymaker, Fortisphere</p>
                    </div>
                  </div>
                </div>

                {/* Infinity */}
                <div className="p-5 rounded-xl border bg-card">
                  <h4 className="text-lg font-bold font-serif flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-violet-500" /> Infinity Constructed
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    The "eternal" format - <strong className="text-foreground">every set ever released is legal</strong>. This format allows the most powerful and creative deck combinations, drawing from the full card pool.
                  </p>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Ban className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-destructive">Banned Cards</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Hiram Flaversham – Toymaker</p>
                    </div>
                  </div>
                </div>

                {/* Deck rules */}
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <h4 className="font-bold text-sm mb-2">Deck Building Rules (Both Formats)</h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> Exactly <strong className="text-foreground">60 cards</strong> in your deck</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> Maximum of <strong className="text-foreground">2 ink colors</strong></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> No more than <strong className="text-foreground">4 copies</strong> of any card (by name + subtitle, across all variants)</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> No sideboard in standard play</li>
                  </ul>
                </div>
              </div>
            </Collapsible>

            {/* ── Ability Glossary ── */}
            <Collapsible title="Ability Glossary" icon={<Sparkles className="w-5 h-5" />}>
              <div className="grid sm:grid-cols-2 gap-4">
                {KNOWLEDGE_BASE.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-2xl bg-muted/30 border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-muted ${item.color}`}>{item.icon}</div>
                      <h4 className="text-base font-bold font-serif">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </Collapsible>

            {/* ── Tournament Primer ── */}
<Collapsible title="Your First Tournament" icon={<Trophy className="w-5 h-5" />}>
  <p className="text-sm text-muted-foreground leading-relaxed">
    Thinking about attending a Disney Lorcana event or a local League? Here's what you need to know.
  </p>
  <div className="space-y-3 mt-3">
    <StepCard step={1} title="Register on the Ravensburger Play Hub">
      All official Lorcana tournaments are managed through the Ravensburger Play Hub. Create a free account at <a href="https://tcg.ravensburgerplay.com" className="text-primary underline underline-offset-2 font-medium" target="_blank" rel="noopener noreferrer">tcg.ravensburgerplay.com</a>, personalise your profile, then search for events near you.
    </StepCard>
    <StepCard step={2} title="Build a Core-Legal Deck">
      Most official events use the Core Constructed format. Use the <Link href="/builder" className="text-primary underline underline-offset-2 font-medium">Lorbound Deck Builder</Link> to construct and validate your deck, it will flag any cards outside rotation.
    </StepCard>
    <StepCard step={3} title="Submit Your Decklist">
      Submit your deck through the Ravensburger Play Hub before the deadline. You can export your Lorbound deck in a compatible format with one click from the Export menu.
    </StepCard>
    <StepCard step={4} title="Bring Your Deck + Supplies">
      Bring your physical 60-card deck, a way to track lore (tokens/dice), Play Mat and card sleeves. Arrive early to check in.
    </StepCard>
    <StepCard step={5} title="Play Swiss Rounds">
      Tournaments use Swiss-style pairings. You play multiple rounds, and your record determines if you advance to a Top Cut (single elimination).
    </StepCard>
  </div> 
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">💡 Pro Tip:</strong> Print your official deck registration sheet directly from Lorbound! Save your deck in the Builder, then click <strong className="text-foreground">Export → Physical Print Sheet</strong>.
                </p>
              </div>
            </Collapsible>

            {/* ── FAQ / Common Mistakes ── */}
            <Collapsible title="Common Mistakes & FAQ" icon={<HelpCircle className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-destructive">❌ "I challenged with my character and then quested."</h4>
                  <p className="text-xs text-muted-foreground mt-1">A character can only exert <strong className="text-foreground">once per turn</strong>. Challenging exerts the character, so it cannot also quest. Choose one.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-destructive">❌ "I healed my character back to full at the start of my turn."</h4>
                  <p className="text-xs text-muted-foreground mt-1">Damage in Lorcana is <strong className="text-foreground">persistent</strong>. It stays on a character until it is banished or healed by a card effect. Characters do NOT heal automatically.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-destructive">❌ "I challenged my opponent's ready character."</h4>
                  <p className="text-xs text-muted-foreground mt-1">You can only challenge <strong className="text-foreground">exerted</strong> characters. If your opponent's character is ready (upright), it cannot be challenged unless a card effect says otherwise.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-destructive">❌ "I played a card and immediately quested with it."</h4>
                  <p className="text-xs text-muted-foreground mt-1">Characters enter play in a "drying" state - they cannot exert (quest or challenge) until your <strong className="text-foreground">next turn</strong>. The exception is characters with <strong className="text-foreground">Rush</strong>, which can challenge immediately (but still can't quest).</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-destructive">❌ "Rush lets me quest the turn I play a character."</h4>
                  <p className="text-xs text-muted-foreground mt-1">Rush only allows a character to <strong className="text-foreground">challenge</strong> the turn it's played. It does NOT allow questing on the same turn.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-destructive">❌ "I put a non-inkable card into my inkwell."</h4>
                  <p className="text-xs text-muted-foreground mt-1">Only cards with the <strong className="text-foreground">golden swirl border</strong> around the ink cost can be placed into your inkwell. Non-inkable cards must be played from hand.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-amber-500">💡 "Can I use Shift on a character that just entered play?"</h4>
                  <p className="text-xs text-muted-foreground mt-1">Yes. Shift requires an existing character of the same name already in play, but it doesn't need to be ready - so you can shift onto a character the same turn it was played.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h4 className="font-bold text-sm text-amber-500">💡 "Does a Shifted character have summoning sickness?"</h4>
                  <p className="text-xs text-muted-foreground mt-1">No! A Shifted character <strong className="text-foreground">inherits the state</strong> of the character it was played on. If the original was ready, the Shifted character is ready and can act immediately.</p>
                </div>
              </div>
            </Collapsible>

          </div>

          {/* ═══ Sidebar ═══ */}
          <div className="space-y-8">

            {/* Table of Contents */}
            <section className="p-5 rounded-3xl bg-card border shadow-sm top-20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">In This Guide</h3>
              <nav className="space-y-2 text-sm">
                <p className="text-foreground font-medium">📖 How to Play</p>
                <p className="text-foreground font-medium">🃏 Card Types</p>
                <p className="text-foreground font-medium">🎲 Starting & Mulligan</p>
                <p className="text-foreground font-medium">🎨 Inkable vs Non-Inkable</p>
                <p className="text-foreground font-medium">💎 Rarity Guide</p>
                <p className="text-foreground font-medium">🏆 Competitive Formats</p>
                <p className="text-foreground font-medium">✨ Ability Glossary</p>
                <p className="text-foreground font-medium">🎯 Your First Tournament</p>
                <p className="text-foreground font-medium">❓ Common Mistakes & FAQ</p>
              </nav>
            </section>

            {/* Ink Theory */}
            <section className="p-6 rounded-3xl bg-secondary/30 border border-border/50">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-primary" /> Ink Theory
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Each of the six inks has a distinct mechanical identity. Understanding what each color excels at is key to building a strong deck.
              </p>
              <div className="space-y-3">
                {INK_THEORY.map((ink) => {
                  const hex = inkHexColors[ink.color as keyof typeof inkHexColors];
                  return (
                    <div key={ink.name} className="flex items-start gap-3 p-3 rounded-xl bg-background border shadow-sm hover:scale-[1.02] transition-transform">
                      <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center p-2" style={{ backgroundColor: `${hex}22` }}>
                        <img src={getInkLogo(ink.color)} alt={ink.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: hex }}>{ink.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{ink.focus}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Links */}
            <section className="p-5 rounded-3xl bg-card border shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/cards" className="block text-sm text-primary hover:underline">Browse All Cards →</Link>
                <Link href="/builder" className="block text-sm text-primary hover:underline">Open Deck Builder →</Link>
                <Link href="/sets" className="block text-sm text-primary hover:underline">Explore Sets →</Link>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
