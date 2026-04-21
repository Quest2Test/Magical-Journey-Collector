import { Card } from "@/data/cards";

export interface CardLegality {
  core: 'Legal' | 'Not Legal' | 'Banned';
  infinity: 'Legal' | 'Not Legal' | 'Banned';
}

export function getCardLegality(card: Card, allCards: Card[]): CardLegality {
  const fullName = card.subtitle ? `${card.name} - ${card.subtitle}` : card.name;
  
  let core: CardLegality['core'] = 'Not Legal';
  let infinity: CardLegality['infinity'] = 'Legal';

  // Banned lists
  if (fullName === "Hiram Flaversham - Toymaker") {
    core = 'Banned';
    infinity = 'Banned';
  } else if (fullName === "Fortisphere") {
    core = 'Banned';
  } else {
    // Core Constructed Rotation Rules (Set 9 Rotation)
    // Legal formats must be Set 5 or later
    const hasLegalPrint = allCards.some(c => {
      const cName = c.subtitle ? `${c.name} - ${c.subtitle}` : c.name;
      if (cName !== fullName) return false;
      if (c.setNum === undefined || isNaN(c.setNum)) return false;
      return c.setNum >= 5;
    });

    if (hasLegalPrint) {
      core = 'Legal';
    }
  }

  return { core, infinity };
}
