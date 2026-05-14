export const SET_GRADIENTS: Record<string, string> = {
  "1": "from-blue-900/60 via-purple-900/40 to-background",
  "2": "from-amber-900/60 via-red-900/40 to-background",
  "3": "from-emerald-900/60 via-teal-900/40 to-background",
  "4": "from-purple-900/60 via-pink-900/40 to-background",
  "5": "from-yellow-900/60 via-orange-900/40 to-background",
  "6": "from-sky-900/60 via-indigo-900/40 to-background",
  "7": "from-rose-900/60 via-orange-900/40 to-background",
  "8": "from-violet-900/60 via-indigo-900/40 to-background",
  "9": "from-pink-900/60 via-rose-900/40 to-background",
  "10": "from-amber-900/60 via-yellow-900/40 to-background",
  "11": "from-blue-900/60 via-indigo-900/40 to-background",
  "12": "from-teal-900/60 via-emerald-900/40 to-background",
};

export const SET_COLORS: Record<string, string> = {
  "1": "from-blue-500/20 to-purple-500/20",
  "2": "from-amber-500/20 to-red-500/20",
  "3": "from-emerald-500/20 to-teal-500/20",
  "4": "from-purple-600/20 to-pink-500/20",
  "5": "from-yellow-500/20 to-orange-500/20",
  "6": "from-sky-500/20 to-indigo-500/20",
  "7": "from-rose-500/20 to-orange-400/20",
  "8": "from-violet-500/20 to-indigo-500/20",
  "9": "from-pink-500/20 to-rose-500/20",
  "10": "from-amber-500/20 to-yellow-500/20",
  "11": "from-blue-500/20 to-indigo-500/20",
  "12": "from-teal-500/20 to-emerald-500/20",
};

export const SET_ACCENT: Record<string, string> = {
  "1": "#6366f1", // TFC
  "2": "#f59e0b", // ROF
  "3": "#10b981", // ITI
  "4": "#a855f7", // URS
  "5": "#f97316", // SSK
  "6": "#38bdf8", // ARC
  "7": "#fb923c", // ARI
  "8": "#8b5cf6", // WIN
  "9": "#fc6ef4", // FAB
  "10": "#fbbf24", // WHI
  "11": "#a78bfa", // WIN2
  "12": "#2dd4bf", // WUN
};

export const SET_ACRONYMS: Record<string, string> = {
  "1": "TFC",
  "2": "ROTF",
  "3": "ITI",
  "4": "UR",
  "5": "SS",
  "6": "AZS",
  "7": "AI",
  "8": "ROJ",
  "9": "FAB",
  "10": "WITW",
  "11": "WIN",
  "12": "WUN",
};

// Map of set IDs to background images in /public/setsbg
export const SET_BACKGROUNDS: Record<string, string> = {
  "1": "/setsbg/S1.jpg", 
  "2": "/setsbg/S2.jpg", 
  "3": "/setsbg/S3.webp",
  "4": "/setsbg/S4.png",
  "5": "/setsbg/S5_B.png",
  "6": "/setsbg/S6.png",
  "7": "/setsbg/S7.jpg",
  "8": "/setsbg/S8.jpg",
  "9": "/setsbg/S09.jpg", // Corrected filename (S09 vs S9)
  "10": "/setsbg/S10.jpg",
  "11": "/setsbg/S11.jpg",
  "12": "/setsbg/S12.jpg",
};

// Map of set IDs to specific logo files (optional overrides)
export const SET_LOGOS: Record<string, string> = {
  "1": "/sets/TFC_White.png",
};
