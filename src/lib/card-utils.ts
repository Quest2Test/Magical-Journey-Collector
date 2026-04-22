import { Card } from "@/data/cards";

/**
 * Returns the formatted subtitle for a card.
 * For Action and Song cards, it prepends "Action" or "Action - " to the subtitle.
 * This ensures consistency across the app as requested by the user.
 */
export function getFormattedSubtitle(card: Card): string | undefined {
  if (card.type === 'Action' || card.type === 'Song') {
    const base = 'Action';
    const sub = card.subtitle || (card.type === 'Song' ? 'Song' : '');
    
    if (!sub) return base;
    
    // If the subtitle already contains 'Action', don't prepend it again
    if (sub.startsWith('Action')) return sub;
    
    // For Songs, ensure 'Song' is part of the subtitle if not already
    if (card.type === 'Song' && !sub.toLowerCase().includes('song')) {
      return `${base} - Song${card.subtitle ? ` - ${card.subtitle}` : ''}`;
    }
    
    return `${base} - ${sub}`;
  }
  
  return card.subtitle;
}

/**
 * Returns the display type for a card.
 * For Songs, it returns "Action" to be consistent with the "Action - Song" subtitle.
 */
export function getDisplayType(card: Card): string {
  if (card.type === 'Song') return 'Action';
  return card.type;
}