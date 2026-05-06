import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4 h-10 transition-opacity hover:opacity-90">
              <img
                src="/LorBound_Logo.webp"
                alt="Lorbound"
                width="180"
                height="40"
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
              <li><Link href="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
              <li><Link href="/academy" className="hover:text-primary transition-colors">Academy Guide</Link></li>
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
            This website uses trademarks and/or copyrights associated with Disney Lorcana TCG, used under Ravensburger’s Community Code Policy (https://cdn.ravensburger.com/lorcana/community-code-en). 
          </p>
          <p>
            We are expressly prohibited from charging you to use or access this content. This website is not published, endorsed, or specifically approved by Disney or Ravensburger. For more information about Disney Lorcana TCG, visit https://www.disneylorcana.com/en-US/.
          </p>
          <p className="mt-2 italic opacity-80">
            This site contains affiliate links. We may receive a commission for purchases made through these links.
          </p>
        </div>
      </div>
    </footer>
  );
}
