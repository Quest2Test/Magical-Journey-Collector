import { FileText } from "lucide-react";
import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/data/cards";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckCards: { card: Card; qty: number }[];
}

export function DeckPrintProxiesModal({ open, onOpenChange, deckCards }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Flatten and chunk cards into pages of 9
  const pages = useMemo(() => {
    const flattened = deckCards.flatMap(({ card, qty }) =>
      Array.from({ length: qty }, () => card)
    );
    const chunks: Card[][] = [];
    for (let i = 0; i < flattened.length; i += 9) {
      chunks.push(flattened.slice(i, i + 9));
    }
    return chunks;
  }, [deckCards]);

  const handlePrint = () => {
    setIsPrinting(true);
    onOpenChange(false);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500);
    }, 200);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Print Proxies
            </DialogTitle>
            <DialogDescription>
              Print your deck as standard TCG-sized (2.5" × 3.5") proxies — 9 cards per page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your browser's print dialog will open. Set <strong>paper size to A4 or Letter</strong> and make sure <strong>"Print backgrounds"</strong> is enabled for best results. Margins should be set to <strong>None</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handlePrint} className="gap-2">
                <FileText className="w-4 h-4" /> Open Print Dialog
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render Print Sheet outside #root via Portal ONLY when printing */}
      {isPrinting && createPortal(
        <>
          <style>{`
            @media print {
              body > *:not(#proxy-print-sheet) { display: none !important; }
              #proxy-print-sheet { display: block !important; }
              body { background: white !important; margin: 0; padding: 0; }
              .proxy-page {
                page-break-after: always;
                display: grid !important;
                grid-template-columns: repeat(3, 2.5in);
                grid-template-rows: repeat(3, 3.5in);
                gap: 0.05in;
                padding: 0.25in;
                justify-content: center;
                align-content: start;
              }
              .proxy-page:last-child { page-break-after: auto; }
            }
            #proxy-print-sheet { display: none; }
          `}</style>
          <div id="proxy-print-sheet">
            {pages.map((page, pageIdx) => (
              <div key={pageIdx} className="proxy-page">
                {page.map((card, cardIdx) => (
                  <div key={`${pageIdx}-${cardIdx}`} style={{
                    width: '2.5in',
                    height: '3.5in',
                    borderRadius: '0.1in',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                    position: 'relative',
                    boxSizing: 'border-box'
                  }}>
                    {card.image ? (
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: '#1a1a2e', 
                        color: 'white', 
                        padding: '0.2in', 
                        textAlign: 'center' 
                      }}>
                        <p style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '0.05in' }}>{card.name}</p>
                        {card.subtitle && <p style={{ fontSize: '9pt', opacity: 0.8 }}>{card.subtitle}</p>}
                        <div style={{ marginTop: 'auto', fontSize: '8pt', opacity: 0.6 }}>
                          {card.inkColor} · Cost {card.cost}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
