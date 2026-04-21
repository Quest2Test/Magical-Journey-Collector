import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4 h-10 transition-opacity hover:opacity-90">
              <img 
                src="/LorBound_Logo.png" 
                alt="Lorbound" 
                className="h-full w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Your Lorcana HQ. Search every card, perfect your deck, and explore the meta. All in one place, built by fans for fans.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cards" className="hover:text-primary transition-colors">Card Database</Link></li>
              <li><Link href="/builder" className="hover:text-primary transition-colors">Deck Builder</Link></li>
              <li><Link href="/decks" className="hover:text-primary transition-colors">Community Decks</Link></li>
              <li><Link href="/academy" className="hover:text-primary transition-colors">Academy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/resources" className="hover:text-primary transition-colors">Resources Hub</Link></li>
              <li><Link href="/sets" className="hover:text-primary transition-colors">Sets</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-xs text-muted-foreground">
          <p className="mb-2">
            Lorbound is an unofficial fan site and is not affiliated with, endorsed by, or connected to Disney or Ravensburger.
          </p>
          <p>
            Disney Lorcana and all related trademarks are property of their respective owners. This site is created by fans, for fans.
          </p>
        </div>
      </div>
    </footer>
  );
}
