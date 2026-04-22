import { useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { useDecks } from "@/hooks/useDecks";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormattedSubtitle } from "@/lib/card-utils";

export default function DeckPrint() {
  const { id } = useParams();
  const { decks } = useDecks();

  const deck = useMemo(() => decks.find(d => d.id === id), [decks, id]);

  useEffect(() => {
    // Add specific print styling when this component mounts
    document.body.classList.add("print-mode");
    return () => {
      document.body.classList.remove("print-mode");
    };
  }, []);

  if (!deck) {
    return (
      <div className="flex h-screen items-center justify-center print:hidden">
        <p className="text-muted-foreground text-xl">Deck not found.</p>
      </div>
    );
  }

  // Ensure entries are sorted alphabetically for the judges
  const sortedEntries = [...deck.entries].sort((a, b) => a.card.name.localeCompare(b.card.name));

  // A standard A4 sheet can comfortably fit around 30-40 rows in a single column 
  // if font size is standard. We could split it into two columns to be safe.
  const midpoint = Math.ceil(sortedEntries.length / 2);
  const column1 = sortedEntries.slice(0, midpoint);
  const column2 = sortedEntries.slice(midpoint);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-10">
      
      {/* Non-Printable Header Actions */}
      <div className="print:hidden w-full bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center fixed top-0 z-50">
        <div className="text-slate-200">
          <h1 className="font-bold">Tournament Registration Sheet</h1>
          <p className="text-sm opacity-70">Format: Standard A4 | Use Ctrl+P to print</p>
        </div>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Printer className="w-4 h-4" /> Print Document
        </Button>
      </div>

      {/* The Printable A4 Area */}
      {/* We use pt-24 normally, but print:pt-0 so the header space disappears entirely in print mode */}
      <div className="pt-24 print:pt-0 w-full max-w-[210mm] mx-auto px-8 bg-white" style={{ minHeight: '297mm' }}>
        
        {/* Document Header */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-black">
          <div>
            <h1 className="text-3xl font-bold font-serif uppercase tracking-wider mb-1">Disney Lorcana</h1>
            <h2 className="text-xl font-semibold opacity-80">Deck Registration Sheet</h2>
          </div>
          <div className="text-right">
            <p className="text-sm border border-black px-3 py-1 inline-block font-bold bg-gray-100">
              Total Cards: {deck.totalCards}
            </p>
          </div>
        </div>

        {/* Player Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
          <div className="border-b border-gray-400 pb-1">
            <span className="text-xs uppercase font-bold text-gray-500 block">First Name</span>
            <div className="h-6"></div>
          </div>
          <div className="border-b border-gray-400 pb-1">
            <span className="text-xs uppercase font-bold text-gray-500 block">Last Name</span>
            <div className="h-6"></div>
          </div>
          
          <div className="border-b border-gray-400 pb-1">
            <span className="text-xs uppercase font-bold text-gray-500 block">Melee.gg Username / Email</span>
            <div className="h-6"></div>
          </div>
          <div className="border-b border-gray-400 pb-1">
            <span className="text-xs uppercase font-bold text-gray-500 block">Date</span>
            <div className="h-6"></div>
          </div>
          
          <div className="border-b border-gray-400 pb-1 col-span-2">
            <span className="text-xs uppercase font-bold text-gray-500 block">Deck Name</span>
            <div className="h-6 font-semibold">{deck.name}</div>
          </div>
        </div>

        {/* Deck Inks Checkbox Area */}
        <div className="mb-6">
          <span className="text-xs uppercase font-bold text-gray-500 block mb-2">Ink Colors (Select up to 2)</span>
          <div className="flex gap-4">
            {["Amber", "Amethyst", "Emerald", "Ruby", "Sapphire", "Steel"].map(ink => (
              <div key={ink} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 border-2 border-black flex items-center justify-center ${deck.inkColors.includes(ink) ? "bg-black" : ""}`}>
                  {deck.inkColors.includes(ink) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm font-semibold">{ink}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The Card Grid */}
        <div className="grid grid-cols-2 gap-x-12 mt-8">
          
          {/* Column 1 */}
          <div>
            <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-2">
              <span className="font-bold text-sm">CARD NAME</span>
              <span className="font-bold text-sm">QTY</span>
            </div>
            {column1.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-200">
                <div className="text-[13px] leading-tight">
                  <span className="font-bold block">{entry.card.name}</span>
                  {getFormattedSubtitle(entry.card) && <span className="text-gray-600 block text-[11px] italic">{getFormattedSubtitle(entry.card)}</span>}
                </div>
                <div className="font-bold text-lg w-8 text-center">{entry.qty}</div>
              </div>
            ))}
            {/* Blank filler lines if small deck */}
            {Array.from({ length: Math.max(0, 18 - column1.length) }).map((_, i) => (
              <div key={`blank1-${i}`} className="flex justify-between items-center py-3 border-b border-gray-200">
                <div className="w-full"></div>
                <div className="w-8 border-l border-gray-200"></div>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div>
            <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-2">
              <span className="font-bold text-sm">CARD NAME</span>
              <span className="font-bold text-sm">QTY</span>
            </div>
            {column2.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-200">
                <div className="text-[13px] leading-tight">
                  <span className="font-bold block">{entry.card.name}</span>
                  {getFormattedSubtitle(entry.card) && <span className="text-gray-600 block text-[11px] italic">{getFormattedSubtitle(entry.card)}</span>}
                </div>
                <div className="font-bold text-lg w-8 text-center">{entry.qty}</div>
              </div>
            ))}
            {/* Blank filler lines if small deck */}
            {Array.from({ length: Math.max(0, 18 - column2.length) }).map((_, i) => (
              <div key={`blank2-${i}`} className="flex justify-between items-center py-3 border-b border-gray-200">
                <div className="w-full"></div>
                <div className="w-8 border-l border-gray-200"></div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Signature */}
        <div className="mt-16 pt-8 border-t border-gray-400 grid grid-cols-2 gap-8">
          <div>
            <div className="border-b border-black pb-1">
              <span className="text-xs uppercase font-bold text-gray-500 block">Player Signature</span>
              <div className="h-8"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">I certify this list exactly matches my physical deck.</p>
          </div>
          <div>
            <div className="border-b border-black pb-1">
              <span className="text-xs uppercase font-bold text-gray-500 block">Judge / TO Signature (Optional)</span>
              <div className="h-8"></div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { 
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />
    </div>
  );
}
