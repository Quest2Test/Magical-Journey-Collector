import { SlidersHorizontal, Plus, Archive, ClipboardPaste, Copy, Droplet, Save, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeckGuideModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Deck Builder Guide
          </DialogTitle>
          <DialogDescription>Master the Lorcana Deck Builder with these quick tips and features.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4 mt-2">
          <div className="space-y-5 pb-4">

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" /> Browsing &amp; Smart Filters
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Scroll the entire Lorcana catalog. Filter by <strong className="text-foreground">ink color, cost, type, set</strong>, or toggle <strong className="text-foreground">Inkable Only</strong>. Enable <strong className="text-foreground">Smart Sync</strong> (✦ icon) to automatically lock the browser to your deck's ink colors once you hit the 2-ink maximum.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Plus className="w-4 h-4 text-primary shrink-0" /> Building Your Deck
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click any card on the left to add it to your deck. The builder enforces all Lorcana rules: <strong className="text-foreground">max 4 copies</strong> of any card identity (including alternate arts) and a <strong className="text-foreground">60-card deck limit</strong>. Hover any card in the deck list to see a full card preview floating on the left.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Archive className="w-4 h-4 text-primary shrink-0" /> Sideboard / Maybeboard
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switch the canvas between <strong className="text-foreground">Main</strong> and <strong className="text-foreground">Sideboard</strong> using the toggle at the top of the deck panel. Cards added while on the Sideboard tab go to a separate list. All statistics are calculated from the Main Deck only.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <ClipboardPaste className="w-4 h-4 text-primary shrink-0" /> Importing a Decklist
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click <strong className="text-foreground">Import</strong> and paste any text decklist. Supported formats:
              </p>
              <ul className="text-sm text-muted-foreground space-y-0.5 ml-4 list-disc">
                <li><strong className="text-foreground">Standard:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">4 Stitch - Carefree Surfer</code></li>
                <li><strong className="text-foreground">With x prefix:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">4x Stitch - Carefree Surfer</code></li>
                <li><strong className="text-foreground">With set codes:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">4 Stitch (TFC) [12]</code> - stripped automatically.</li>
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Copy className="w-4 h-4 text-primary shrink-0" /> Exporting Your Deck
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Click <strong className="text-foreground">Export</strong> to access all formats:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">Tournament Registration Sheet</strong> - generates an official-style PDF sheet for tournament play.</li>
                <li><strong className="text-foreground">Print Proxies</strong> - prints cards at standard TCG size (2.5" × 3.5"), 9 per page.</li>
                <li><strong className="text-foreground">Melee / Pixelborn / Inktable</strong> - copies format-compatible text lists to your clipboard.</li>
                <li><strong className="text-foreground">Share Image</strong> - generates a shareable image with your deck list and branding.</li>
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Droplet className="w-4 h-4 text-primary shrink-0" /> Deck Analysis Panel
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Live deck health metrics:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">Collection Coverage</strong> - missing cards &amp; market cost to finish (sign-in required).</li>
                <li><strong className="text-foreground">Ink Colors</strong> - stacked bar showing ink split.</li>
                <li><strong className="text-foreground">Ink Curve</strong> - color-coded stacked bars per cost slot by ink.</li>
                <li><strong className="text-foreground">Type Breakdown</strong> - Characters, Actions, Songs, Items, Locations.</li>
                <li><strong className="text-foreground">Uninkables</strong> - high ratios risk bricking your inkwell.</li>
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Save className="w-4 h-4 text-primary shrink-0" /> Saving Decks
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hit <strong className="text-foreground">Save</strong> to store your deck to My Decks (requires a free account).
              </p>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
