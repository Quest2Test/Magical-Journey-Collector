import { SlidersHorizontal, Plus, Archive, ClipboardPaste, Copy, Droplet, Save, Sparkles, Play } from "lucide-react";
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
                <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" /> Smart Filters
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter by <strong className="text-foreground">ink color, cost, type, or set</strong>. Toggle <strong className="text-foreground">Inkable Only</strong> to refine your search. Enable <strong className="text-foreground">Smart Sync</strong> (✦ icon) to automatically lock the browser to your deck's ink colors once you hit the 2-ink maximum.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Play className="w-4 h-4 text-primary shrink-0" /> Mulligan Simulator
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click <strong className="text-foreground">Test Hand</strong> to open the simulator. Practice your opening mulligans, visualize your early turns, and test the consistency of your inkwell with realistic draw distributions.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Archive className="w-4 h-4 text-primary shrink-0" /> Main Deck &amp; Sideboard
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switch between <strong className="text-foreground">Main</strong> and <strong className="text-foreground">Sideboard</strong> tabs. Cards added while on the Sideboard tab are stored separately. Your stats and legality checks are calculated strictly from the 60+ cards in your Main Deck.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Copy className="w-4 h-4 text-primary shrink-0" /> Pro Exports &amp; Printing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Access professional export tools via the <strong className="text-foreground">Export</strong> menu:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">Registration Sheet</strong> - Official PDF for tournament play.</li>
                <li><strong className="text-foreground">Print Proxies</strong> - High-quality 2.5" × 3.5" print sheets.</li>
                <li><strong className="text-foreground">Share Image</strong> - Beautiful high-res graphics for social media.</li>
                <li><strong className="text-foreground">Text Lists</strong> - One-click copy for Melee, Pixelborn, or Inktable.</li>
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Droplet className="w-4 h-4 text-primary shrink-0" /> Live Analysis Panel
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Monitor your deck's health in real-time:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">Collection Coverage</strong> - Calculate the cost to finish your deck.</li>
                <li><strong className="text-foreground">Ink Curve</strong> - Visualize your turn-by-turn play potential.</li>
                <li><strong className="text-foreground">Uninkable Ratio</strong> - Avoid "bricking" your hand by monitoring high counts.</li>
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <Save className="w-4 h-4 text-primary shrink-0" /> Cloud Saving
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Save your progress to the cloud. Your decks are synced to your profile and can be shared with the community or kept private for competitive testing.
              </p>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
