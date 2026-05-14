import { motion } from "framer-motion";
import {
  Book,
  ExternalLink,
  Store,
  MessageSquare,
  Globe,
  Trophy,
  ShoppingBag,
  Wrench,
  Download,
  AlertCircle,
  Users,
  Search,
  Hammer
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: string;
  color: string;
}

function ResourceCard({ title, description, icon, href, category, color }: ResourceCardProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -5 }}
      className="group relative flex flex-col p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/40 transition-all hover:shadow-xl overflow-hidden h-full"
    >
      {/* Background Accent */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity rounded-full bg-${color}`} />

      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-muted/50 text-${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{category}</span>
      </div>

      <h3 className="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{description}</p>

      <div className="flex items-center gap-2 text-xs font-bold text-primary group/link">
        Visit Resource <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
      </div>
    </motion.a>
  );
}

export default function Resources() {
  const sections = [
    {
      title: "Official Knowledge",
      subtitle: "Direct from the source. The definitive rules and guides.",
      icon: <Book className="w-6 h-6" />,
      resources: [
        {
          title: "Comprehensive Rules",
          description: "The complete, detailed ruleset for Disney Lorcana. Essential for resolving complex card interactions.",
          icon: <Download className="w-5 h-5" />,
          href: "https://www.disneylorcana.com/en-US/resources",
          category: "Official",
          color: "blue-500"
        },
        {
          title: "Official Store Locator",
          description: "Find an official hobby store near you to play in organized League events and tournaments.",
          icon: <Store className="w-5 h-5" />,
          href: "https://www.disneylorcana.com/en-US/locator",
          category: "Utility",
          color: "amber-500"
        },
        {
          title: "Ravensburger Play Hub",
          description: "The official destination for organized play and event registration.",
          icon: <AlertCircle className="w-5 h-5" />,
          href: "https://tcg.ravensburgerplay.com/",
          category: "Official",
          color: "rose-500"
        }
      ]
    },
    {
      title: "Community & News",
      subtitle: "Stay connected with the global Illumineer community.",
      icon: <Users className="w-6 h-6" />,
      resources: [
        {
          title: "Mushu Report",
          description: "The premier source for Lorcana news, set reveals, and community updates.",
          icon: <Globe className="w-5 h-5" />,
          href: "https://mushureport.com/",
          category: "News",
          color: "emerald-500"
        },
        {
          title: "Lorcana Subreddit",
          description: "Join over 50,000 players to discuss deck ideas, pull results, and game news.",
          icon: <MessageSquare className="w-5 h-5" />,
          href: "https://www.reddit.com/r/Lorcana/",
          category: "Community",
          color: "orange-500"
        },
        {
          title: "Official Discord",
          description: "The fastest way to get rules questions answered and find online matches via webcam.",
          icon: <Users className="w-5 h-5" />,
          href: "https://discord.gg/disneylorcana",
          category: "Social",
          color: "indigo-500"
        }
      ]
    },
    {
      title: "Play & Market Tools",
      subtitle: "Optimize your competitive edge and collection value.",
      icon: <Wrench className="w-6 h-6" />,
      resources: [
        {
          title: "TCGplayer Prices",
          description: "Track the current market value of your glimmers and see price trends for all sets.",
          icon: <ShoppingBag className="w-5 h-5" />,
          href: "https://www.tcgplayer.com/search/lorcana-tcg/product",
          category: "Market",
          color: "emerald-600"
        },
        {
          title: "Lorcana.gg",
          description: "Database and meta tracking site with detailed analytics on winning tournament decks.",
          icon: <Search className="w-5 h-5" />,
          href: "https://lorcana.gg/",
          category: "Meta",
          color: "sky-500"
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-background pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 border-b border-border/40 bg-muted/20">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6 bg-primary/10 text-primary">
              <Hammer className="w-3.5 h-3.5" /> Illumineer's Toolkit
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground mb-6">
              Resources <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">for Illumineers</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl">
              A curated collection of essential tools, official documentation, and community hubs to help you master the Great Illuminary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resource Sections */}
      <div className="container mx-auto px-4 md:px-6 mt-20">
        <div className="space-y-24">
          {sections.map((section, idx) => (
            <section key={section.title}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-3 text-primary">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {section.icon}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Section {idx + 1}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-3">{section.title}</h2>
                  <p className="text-muted-foreground">{section.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.resources.map((resource) => (
                  <ResourceCard key={resource.title} {...resource} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Suggestion Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-10 rounded-[3rem] bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 border border-primary/10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

          <h3 className="text-2xl font-serif font-bold mb-4">Have a resource to suggest?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            We are always looking to expand our toolkit with the best community-driven tools and creators.
          </p>
          <Button variant="outline" className="rounded-full px-8 h-12 gap-2" asChild>
            <a href="mailto:lorbound@proton.me">
              Contact Us <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
