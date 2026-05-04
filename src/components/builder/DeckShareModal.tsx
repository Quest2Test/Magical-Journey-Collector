import { Minus, Plus, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareColumns: number;
  onShareColumnsChange: (cols: number) => void;
  showFormat: boolean;
  onShowFormatChange: (val: boolean) => void;
  showCount: boolean;
  onShowCountChange: (val: boolean) => void;
  showValue: boolean;
  onShowValueChange: (val: boolean) => void;
  isGeneratingPreview: boolean;
  previewError: string | null;
  sharePreviewUrl: string | null;
  onDownload: () => void;
}

export function DeckShareModal({
  open,
  onOpenChange,
  shareColumns,
  onShareColumnsChange,
  showFormat,
  onShowFormatChange,
  showCount,
  onShowCountChange,
  showValue,
  onShowValueChange,
  isGeneratingPreview,
  previewError,
  sharePreviewUrl,
  onDownload
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-full border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Settings2 className="w-5 h-5" />
              </div>
              <DialogTitle className="font-serif text-2xl">Share Image Preview</DialogTitle>
            </div>
            <DialogDescription>
              Customize and generate a high-quality image of your deck.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 min-h-[420px] rounded-[28px] overflow-hidden border border-border/50 bg-muted/20 flex items-center justify-center p-4 relative group">
              {isGeneratingPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <div className="text-sm font-medium text-muted-foreground">Generating premium preview…</div>
                </div>
              ) : previewError ? (
                <div className="text-center text-sm text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 max-w-xs">{previewError}</div>
              ) : sharePreviewUrl ? (
                <img src={sharePreviewUrl} alt="Deck share preview" className="w-full h-auto object-contain rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-[1.01]" />
              ) : (
                <div className="text-center text-sm text-muted-foreground">Preview will appear here.</div>
              )}
            </div>

            <div className="lg:w-80 flex flex-col gap-5 p-5 rounded-3xl bg-muted/30 border border-border/40 backdrop-blur-sm">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Grid Layout</Label>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50">
                  <span className="text-sm font-medium">Columns</span>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" 
                      onClick={() => onShareColumnsChange(Math.max(4, shareColumns - 1))} 
                      disabled={shareColumns <= 4}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-base font-bold w-4 text-center tabular-nums">{shareColumns}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" 
                      onClick={() => onShareColumnsChange(Math.min(12, shareColumns + 1))} 
                      disabled={shareColumns >= 12}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/40 my-1"></div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Display Info</Label>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium">Format</span>
                    <Switch checked={showFormat} onCheckedChange={onShowFormatChange} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium">Card Count</span>
                    <Switch checked={showCount} onCheckedChange={onShowCountChange} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium">Market Value</span>
                    <Switch checked={showValue} onCheckedChange={onShowValueChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/20 border-t border-border/50 flex flex-col gap-3 sm:flex-row justify-end items-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={onDownload}
            disabled={isGeneratingPreview}
            className="w-full sm:w-auto rounded-xl px-8 shadow-lg shadow-primary/20"
          >
            Download Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
