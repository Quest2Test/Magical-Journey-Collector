import { Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/data/cards";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareColumns: number;
  onShareColumnsChange: (cols: number) => void;
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
  isGeneratingPreview,
  previewError,
  sharePreviewUrl,
  onDownload
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-w-full border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Share Image Preview</DialogTitle>
          <DialogDescription>
            Generate a social-ready image of your deck. Enable card thumbnails for a richer preview.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Preview your branded share image before downloading it.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 bg-muted/30 p-2 px-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-muted-foreground">Columns:</Label>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 rounded-full bg-background" 
                    onClick={() => onShareColumnsChange(Math.max(4, shareColumns - 1))} 
                    disabled={shareColumns <= 4}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-bold w-6 text-center tabular-nums">{shareColumns}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 rounded-full bg-background" 
                    onClick={() => onShareColumnsChange(Math.min(12, shareColumns + 1))} 
                    disabled={shareColumns >= 12}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="w-px h-6 bg-border/50 hidden sm:block"></div>
            </div>
          </div>

          <div className="min-h-[380px] rounded-[28px] overflow-hidden border border-border bg-muted/20 flex items-center justify-center p-4">
            {isGeneratingPreview ? (
              <div className="text-center text-sm text-muted-foreground">Generating preview…</div>
            ) : previewError ? (
              <div className="text-center text-sm text-destructive">{previewError}</div>
            ) : sharePreviewUrl ? (
              <img src={sharePreviewUrl} alt="Deck share preview" className="w-full h-auto object-contain rounded-2xl" />
            ) : (
              <div className="text-center text-sm text-muted-foreground">Preview will appear here.</div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
          <Button
            onClick={onDownload}
            disabled={isGeneratingPreview}
            className="w-full sm:w-auto"
          >
            Download Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
