import { ShieldCheck, Database, Lock, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-6">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          How we handle data at Lorbound.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Data Collection & Usage</h2>
          </div>
          <p>
            Lorbound is designed to be as low-impact as possible. We only collect the information necessary to provide you with a great deck-building experience:
          </p>
          <ul>
            <li><strong>Account Information:</strong> If you choose to register, we store your email address and an encrypted version of your password via Supabase.</li>
            <li><strong>User Content:</strong> Decks you create and cards in your collection are stored in our database so you can access them across different devices.</li>
            <li><strong>Preferences:</strong> Settings like your preferred currency, card language, and site theme are saved to ensure a consistent experience.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Performance & Storage</h2>
          </div>
          <p>
            To keep Lorbound fast, we use your browser's <strong>Local Storage</strong> and <strong>Session Storage</strong>. This is used to cache large sets of card data (from the Lorcast API) so you don't have to download thousands of images and data points every time you refresh the page.
          </p>
          <p>
            We do not use tracking cookies for advertising purposes, and we do not sell your data to third parties.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Third-Party Services</h2>
          </div>
          <p>
            We integrate with a few trusted services to power Lorbound:
          </p>
          <ul>
            <li><strong>Supabase:</strong> For our secure authentication and database infrastructure.</li>
            <li><strong>Lorcast API:</strong> To provide up-to-date card information and community data.</li>
            <li><strong>TCGPlayer / Cardmarket:</strong> For providing live market pricing and purchase links.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Affiliate Disclosure</h2>
          </div>
          <p>
            Lorbound participates in affiliate programs with <strong>TCGPlayer</strong>. This means that when you click on certain links on our site (such as "Buy on TCGPlayer") and make a purchase, we may receive a small commission at no additional cost to you.
          </p>
          <p>
            These commissions help us cover the costs of hosting, development, and keeping Lorbound ad-free for the community. We only link to reputable marketplaces that we use ourselves.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Children's Privacy</h2>
          </div>
          <p>
            Given our site's theme, we take children's privacy seriously. Lorbound is intended for users who are at least 13 years of age (or 16 in certain jurisdictions). We do not knowingly collect personal information from children under these ages. If you believe we have accidentally collected such data, please contact us immediately for deletion.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Your Rights & Data Deletion</h2>
          </div>
          <p>
            You have the right to access, update, or delete your personal information at any time. 
          </p>
          <ul>
            <li><strong>Access/Update:</strong> You can manage your profile and deck data directly through your account settings.</li>
            <li><strong>Deletion:</strong> If you wish to permanently delete your account and all associated data, you can do so through the account dashboard or by contacting us at the email below.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold m-0">Security & Updates</h2>
          </div>
          <p>
            We use industry-standard encryption (SSL/TLS) to protect your data during transit. While no system is 100% secure, we use reputable infrastructure (Supabase) to minimize risks.
          </p>
          <p className="mt-4">
            We may update this policy occasionally. Any significant changes will be reflected in the "Last updated" date below.
          </p>
        </section>

        <hr className="border-border my-12" />

        <section className="text-sm text-muted-foreground bg-muted/30 p-8 rounded-2xl border border-border/50">
          <h3 className="font-bold text-foreground mb-4">Disclaimer & Legal</h3>
          <p>
            Lorbound is an unofficial fan site. It is not affiliated with, endorsed by, or connected to Disney or Ravensburger in any way. 
          </p>
          <p className="mt-4">
            Disney Lorcana and all related trademarks, logos, and card art are the property of Disney and Ravensburger. This site is created under fair use principles for the benefit of the community.
          </p>
          <p className="mt-8 pt-4 border-t border-border/50">
            <strong>Questions?</strong> Reach out to us at:<br />
            <a href="mailto:lorbound@proton.me" className="text-primary hover:underline">lorbound@proton.me</a>
          </p>
          <p className="mt-4 opacity-70 italic">
            Last updated: April 17, 2026
          </p>
        </section>
      </div>
    </div>
  );
}
