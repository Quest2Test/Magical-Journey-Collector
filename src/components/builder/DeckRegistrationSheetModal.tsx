import { FileText, Printer, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/data/cards";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckCards: { card: Card; qty: number }[];
  deckName: string;
}

export function DeckRegistrationSheetModal({ open, onOpenChange, deckCards, deckName }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Sort cards alphabetically
  const sortedCards = useMemo(() => {
    return [...deckCards].sort((a, b) => a.card.name.localeCompare(b.card.name));
  }, [deckCards]);

  const totalCards = deckCards.reduce((acc, curr) => acc + curr.qty, 0);

  // Determine which ink colors are present in the deck
  const activeInks = useMemo(() => {
    const inks = new Set<string>();
    deckCards.forEach(entry => {
      inks.add(entry.card.inkColor);
      if (entry.card.allInkColors) {
        entry.card.allInkColors.forEach(c => inks.add(c));
      }
    });
    return Array.from(inks);
  }, [deckCards]);

  const handlePrint = () => {
    setIsPrinting(true);
    onOpenChange(false);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500);
    }, 200);
  };

  const INK_COLORS = ['Amber', 'Amethyst', 'Emerald', 'Ruby', 'Sapphire', 'Steel'];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Tournament Registration Sheet
            </DialogTitle>
            <DialogDescription>
              Print the original style registration sheet for your deck.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This will generate the registration sheet matching your original design, including ink checkboxes and deck stats.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" /> Open Print Dialog
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render Registration Sheet outside #root via Portal ONLY when printing */}
      {isPrinting && createPortal(
        <>
          <style>{`
            * { box-sizing: border-box; }
            @media print {
              body > *:not(#deck-registration-sheet) { display: none !important; }
              #deck-registration-sheet { display: block !important; }
              body { background: white !important; margin: 0; padding: 0; color: black !important; font-family: 'Times New Roman', serif !important; }
              
              @page {
                size: portrait;
                margin: 0;
              }
            }

            #deck-registration-sheet {
              display: none;
              width: 8.5in;
              height: 11in;
              background: white;
              padding: 0.75in;
              position: relative;
              color: black;
            }

            .sheet-header {
              border-bottom: 2px solid black;
              padding-bottom: 15px;
              margin-bottom: 25px;
              position: relative;
            }

            .sheet-header h1 {
              font-size: 28pt;
              font-family: serif;
              font-weight: bold;
              margin: 0;
              text-transform: uppercase;
            }

            .sheet-header h2 {
              font-size: 14pt;
              font-family: serif;
              margin: 5px 0 0 0;
            }

            .total-cards-box {
              position: absolute;
              top: 0;
              right: 0;
              border: 2px solid black;
              padding: 5px 15px;
              font-size: 12pt;
              font-weight: bold;
              font-family: sans-serif;
            }

            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px 40px;
              margin-bottom: 30px;
            }

            .info-field {
              border-bottom: 1px solid #999;
              padding-bottom: 5px;
            }

            .info-label {
              font-size: 8pt;
              font-weight: bold;
              text-transform: uppercase;
              color: #444;
              display: block;
              margin-bottom: 15px;
              font-family: sans-serif;
            }

            .info-value {
              font-size: 12pt;
              font-weight: bold;
            }

            .ink-selection {
              margin-bottom: 30px;
            }

            .ink-label {
              font-size: 8pt;
              font-weight: bold;
              text-transform: uppercase;
              display: block;
              margin-bottom: 10px;
              font-family: sans-serif;
            }

            .ink-options {
              display: flex;
              gap: 20px;
            }

            .ink-option {
              display: flex;
              items-center: center;
              gap: 6px;
              font-size: 10pt;
              font-weight: bold;
              font-family: sans-serif;
            }

            .checkbox {
              width: 14px;
              height: 14px;
              border: 1.5px solid black;
              display: inline-block;
              position: relative;
            }

            .checkbox.checked::after {
              content: '✓';
              position: absolute;
              top: -4px;
              left: 0;
              font-size: 12pt;
            }

            .card-list-columns {
              display: grid;
              grid-template-columns: 1fr 1fr;
              column-gap: 40px;
            }

            .column-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid black;
              padding-bottom: 5px;
              margin-bottom: 10px;
              font-size: 10pt;
              font-weight: bold;
              font-family: sans-serif;
            }

            .card-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 1px solid #eee;
              height: 26px;
              padding-bottom: 3px;
            }

            .card-name-cell {
              flex: 1;
              font-size: 10pt;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .card-qty-cell {
              width: 40px;
              text-align: right;
              font-weight: bold;
              font-size: 11pt;
            }

            .sheet-footer {
              margin-top: 60px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
            }

            .signature-line {
              border-top: 1px solid black;
              padding-top: 5px;
              font-size: 8pt;
              font-weight: bold;
              text-transform: uppercase;
              font-family: sans-serif;
            }

            .disclaimer {
              font-size: 7pt;
              margin-top: 5px;
              font-style: italic;
              color: #666;
            }
          `}</style>
          
          <div id="deck-registration-sheet">
            <div className="sheet-header">
              <div className="total-cards-box">Total Cards: {totalCards}</div>
              <h1>DISNEY LORCANA</h1>
              <h2>Deck Registration Sheet</h2>
            </div>

            <div className="info-grid">
              <div className="info-field">
                <span className="info-label">First Name</span>
                <div className="info-value"></div>
              </div>
              <div className="info-field">
                <span className="info-label">Last Name</span>
                <div className="info-value"></div>
              </div>
              <div className="info-field">
                <span className="info-label">Melee.gg Username / Email</span>
                <div className="info-value"></div>
              </div>
              <div className="info-field">
                <span className="info-label">Date</span>
                <div className="info-value"></div>
              </div>
              <div className="info-field" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">Deck Name</span>
                <div className="info-value">{deckName}</div>
              </div>
            </div>

            <div className="ink-selection">
              <span className="ink-label">Ink Colors (Select up to 2)</span>
              <div className="ink-options">
                {INK_COLORS.map(ink => (
                  <div key={ink} className="ink-option">
                    <div className={`checkbox ${activeInks.includes(ink) ? 'checked' : ''}`}></div>
                    {ink}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-list-columns">
              {/* Left Column */}
              <div>
                <div className="column-header">
                  <span>CARD NAME</span>
                  <span>QTY</span>
                </div>
                {Array.from({ length: 26 }).map((_, i) => {
                  const entry = sortedCards[i];
                  return (
                    <div key={i} className="card-row">
                      <div className="card-name-cell">
                        {entry ? (
                          <>
                            <span style={{ fontWeight: 'bold' }}>{entry.card.name}</span>
                            {entry.card.subtitle && <span style={{ opacity: 0.7, fontStyle: 'italic' }}> - {entry.card.subtitle}</span>}
                          </>
                        ) : ''}
                      </div>
                      <div className="card-qty-cell">{entry ? entry.qty : ''}</div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div>
                <div className="column-header">
                  <span>CARD NAME</span>
                  <span>QTY</span>
                </div>
                {Array.from({ length: 26 }).map((_, i) => {
                  const entry = sortedCards[i + 26];
                  return (
                    <div key={i} className="card-row">
                      <div className="card-name-cell">
                        {entry ? (
                          <>
                            <span style={{ fontWeight: 'bold' }}>{entry.card.name}</span>
                            {entry.card.subtitle && <span style={{ opacity: 0.7, fontStyle: 'italic' }}> - {entry.card.subtitle}</span>}
                          </>
                        ) : ''}
                      </div>
                      <div className="card-qty-cell">{entry ? entry.qty : ''}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sheet-footer">
              <div>
                <div className="signature-line">Player Signature</div>
                <div className="disclaimer">I certify this list exactly matches my physical deck.</div>
              </div>
              <div>
                <div className="signature-line">Judge / TO Signature (Optional)</div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
