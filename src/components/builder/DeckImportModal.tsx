import { FileText, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importText: string;
  onImportTextChange: (text: string) => void;
  onImport: () => void;
}

export function DeckImportModal({ open, onOpenChange, importText, onImportTextChange, onImport }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border shadow-2xl p-6 mx-4 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Import Decklist</h3>
              <p className="text-xs text-muted-foreground">Paste a decklist in any standard format</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { onOpenChange(false); onImportTextChange(""); }} className="h-8 w-8 rounded-full">
            ×
          </Button>
        </div>
        <textarea
          value={importText}
          onChange={e => onImportTextChange(e.target.value)}
          placeholder={`4 Maui - Hero to All\n4 Maleficent - Monstrous Dragon\n4 Be Prepared\n...`}
          className="w-full h-48 p-3 rounded-xl border bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">Format: <code className="bg-muted px-1 rounded">qty Name - Subtitle</code> per line</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); onImportTextChange(""); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={onImport} disabled={!importText.trim()} className="gap-2">
              <ClipboardPaste className="w-3.5 h-3.5" /> Import Deck
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
