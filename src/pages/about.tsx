import { BookHeart, Mail, Code } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-6">About Lorbound</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          A dedicated space for Lorcana players to build, share, and discover.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <BookHeart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">The Story</h2>
          </div>
          <p>
            Lorbound was born out of a simple need: a fast, clean, and beautiful way to build Lorcana decks.
            While there are many great tools out there, we wanted something that felt less like a spreadsheet
            and more like a premium companion app for the game we love.
          </p>
          <p>
            We focus on speed, information density, and a thoughtful user experience. Whether you're a competitive
            player tweaking a tournament list or a collector tracking your foils, Lorbound is built for you.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Code className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Open & Evolving</h2>
          </div>
          <p>
            This site is actively maintained and frequently updated. New sets are added as soon as cards are officially revealed.
            We're constantly working on new features like collection tracking, draft simulators, and advanced meta analytics.
          </p>
        </section>

        <hr className="border-border my-12" />

        <section className="bg-muted/50 p-6 rounded-xl border border-dashed">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" /> Contact
          </h2>
          <p className="text-sm mb-4">
            Have a feature request, found a bug, or just want to say hi? Reach out to us.
          </p>
          <a href="mailto:lorbound@proton.me" className="text-primary hover:underline font-medium">
            lorbound@proton.me
          </a>
        </section>

        <section className="text-sm text-muted-foreground pt-8">
          <h3 className="font-bold text-foreground mb-2">Fan Site Disclaimer</h3>
          <p>
            Lorbound is an unofficial fan site and is not affiliated with, endorsed by, or connected to Disney or Ravensburger.
            Disney Lorcana and all related trademarks, logos, and card art are the property of their respective owners.
          </p>
          <p className="mt-2">
            This site is created by fans, for fans, under fair use principles for informational and educational purposes.
          </p>
        </section>
      </div>
    </div>
  );
}