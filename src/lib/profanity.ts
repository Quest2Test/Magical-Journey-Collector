/**
 * Simple profanity filter for usernames and deck names.
 * This is a client-side check to reduce common issues with offensive content.
 */

const BAD_WORDS = [
  "fuck", "shit", "piss", "dick", "cunt", "nigger", "faggot", "asshole", 
  "bitch", "bastard", "slut", "whore", "cock", "vagina", "retard",
  "pussy", "cum", "ejaculate", "porn", "hitler", "nazi"
];

// Add some common leetspeak variants
const VARIANTS = {
  'a': ['4', '@'],
  'e': ['3'],
  'i': ['1', '!'],
  'o': ['0'],
  's': ['5', '$'],
  't': ['7']
};

export function isProfane(text: string): boolean {
  if (!text) return false;
  
  // 1. Translate leetspeak to base letters
  let translated = text.toLowerCase();
  for (const [letter, variants] of Object.entries(VARIANTS)) {
    variants.forEach(variant => {
      translated = translated.replaceAll(variant, letter);
    });
  }

  // 2. Remove all non-alphanumeric characters to catch "s.h.i.t" or "b a d"
  const normalized = translated.replace(/[^a-z0-9]/g, '');

  // 3. Check against bad words
  return BAD_WORDS.some(word => normalized.includes(word));
}

export function containsProfanity(text: string): boolean {
  return isProfane(text);
}
