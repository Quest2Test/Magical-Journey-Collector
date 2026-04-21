import React from 'react';
import { cn } from "@/lib/utils";

export const SYMBOL_ICONS: Record<string, { symbol: React.ReactNode; color: string; bg: string; label: string }> = {
  "{E}": { 
    symbol: <path d="M21 12a9 9 0 01-9 9m-9-9a9 9 0 019-9m0 0V1m0 0L7.5 4.5M12 1l4.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />, 
    color: "text-white", 
    bg: "bg-slate-700 shadow-sm",
    label: "Exert"
  },
  "{I}": { 
    symbol: <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" fill="currentColor" />, 
    color: "text-amber-950", 
    bg: "bg-amber-400 shadow-sm",
    label: "Ink"
  },
  "{L}": { 
    symbol: <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" fill="currentColor" />, 
    color: "text-white", 
    bg: "bg-fuchsia-600 shadow-sm",
    label: "Lore"
  },
  "{S}": { 
    symbol: <path d="M12 2v2m0 16v2m10-10h-2M4 10H2m16.36-6.36l-1.42 1.42M7.05 16.95l-1.42 1.42M16.95 16.95l1.42 1.42M7.05 7.05L5.63 5.63M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />, 
    color: "text-white", 
    bg: "bg-red-600 shadow-sm",
    label: "Strength"
  },
  "{W}": { 
    symbol: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" />, 
    color: "text-white", 
    bg: "bg-blue-600 shadow-sm",
    label: "Willpower"
  },
};

export function highlightRulesText(text: string) {
  if (!text || text === "null") return null;
  const keywords = [
    "Rush", "Evasive", "Ward", "Challenger", "Singer", "Reckless", "Bodyguard",
    "Support", "Shift", "Resist", "Challenge", "Banish", "Quest", "Draw", "Sing", 
    "Ready", "Exert",
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  const iconRegex = /(\{[EILSW]\})/g;

  const lines = text.split("\n");
  
  return lines.map((line, lineIdx) => {
    let abilityName = null;
    let mainText = line;
    
    // Look for ALL CAPS ability at start
    const abilityMatch = line.match(/^([A-Z][A-Z0-9\s!?'"’„.,-]{2,})(?=\s+[A-Z][a-z]|\s*\{|\s*-|$)/);
    if (abilityMatch) {
      const candidate = abilityMatch[1].trim();
      // Only treat as ability title if it's all caps (ignores keywords like "Shift")
      if (candidate.length > 2 && !/[a-z]/.test(candidate)) {
        abilityName = candidate;
        mainText = line.substring(abilityName.length).trim();
      }
    }
    
    const formatSegment = (segment: string) => {
      const parts = segment.split(keywordRegex);
      return parts.map((part, pIdx) => {
        if (keywords.includes(part)) {
          return <strong key={pIdx} className="font-bold text-primary underline decoration-primary/30 underline-offset-2">{part}</strong>;
        }
        const subParts = part.split(iconRegex);
        return subParts.map((sub, sIdx) => {
          if (SYMBOL_ICONS[sub]) {
            const icon = SYMBOL_ICONS[sub];
            return (
              <span key={`i-${sIdx}`} title={icon.label} className={cn("inline-flex items-center justify-center w-4 h-4 rounded-full mx-0.5 align-middle shadow-sm", icon.bg, icon.color)}>
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">{icon.symbol}</svg>
              </span>
            );
          }
          return sub;
        });
      });
    };

    const parensRegex = /(\([^)]+\))/g;
    const segments = mainText.split(parensRegex);
    
    const formattedRest = segments.map((seg, sIdx) => {
      if (seg.startsWith("(") && seg.endsWith(")")) {
        return <span key={sIdx} className="italic text-muted-foreground/70 text-[0.92em]">{formatSegment(seg)}</span>;
      }
      return <span key={sIdx}>{formatSegment(seg)}</span>;
    });

    return (
      <div key={lineIdx} className={cn("mb-4 last:mb-0", abilityName ? "" : "pl-0")}>
        {abilityName && (
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px flex-1 bg-primary/10" />
            <span className="font-bold tracking-[0.1em] text-primary text-[0.7rem] uppercase">
              {abilityName}
            </span>
            <span className="h-px flex-1 bg-primary/10" />
          </div>
        )}
        <div className="text-foreground/90 leading-relaxed font-sans">{formattedRest}</div>
      </div>
    );
  });
}
