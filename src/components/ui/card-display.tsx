import { Card } from "@/data/cards";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Music, MapPin, Plus } from "lucide-react";
import { Button } from "./button";
import { useState, memo } from "react";
import { getFormattedSubtitle, getDisplayType } from "@/lib/card-utils";

interface CardDisplayProps {
  card: Card;
  className?: string;
  showQuickAdd?: boolean;
  onQuickAdd?: (card: Card) => void;
  returnTo?: string;
  ownedCount?: number;
  useThumbnail?: boolean;
  hideInfo?: boolean;
}

export const inkGradients: Record<string, string> = {
  Amber: "from-[#fcd34d] to-[#d97706]",
  Amethyst: "from-[#c084fc] to-[#7e22ce]",
  Emerald: "from-[#34d399] to-[#047857]",
  Ruby: "from-[#f87171] to-[#b91c1c]",
  Sapphire: "from-[#60a5fa] to-[#1d4ed8]",
  Steel: "from-[#9ca3af] to-[#374151]",
};

export const inkHexColors: Record<string, string> = {
  Amber: "#f59e0b",
  Amethyst: "#9333ea",
  Emerald: "#10b981",
  Ruby: "#ef4444",
  Sapphire: "#3b82f6",
  Steel: "#6b7280",
};

export const inkTextColors: Record<string, string> = {
  Amber: "#f59e0b",
  Amethyst: "#d8b4fe",
  Emerald: "#10b981",
  Ruby: "#ef4444",
  Sapphire: "#3b82f6",
  Steel: "#d1d5db",
};

export const rarityIcons: Record<string, string> = {
  "Common": "/rarities/Common.webp",
  "Uncommon": "/rarities/Uncommon.webp",
  "Rare": "/rarities/Rare.webp",
  "Super Rare": "/rarities/Super_Rare.webp",
  "Epic": "/rarities/epic.webp",
  "Legendary": "/rarities/Legendary.webp",
  "Enchanted": "/rarities/Enchanted.webp",
  "Iconic": "/rarities/iconic.webp",
  "Promo": "/rarities/Promo.webp",
};

export function isDisney100(card: Card): boolean {
  // Logic to detect Disney 100 promo cards
  // Usually they are in set 'D100' or have it in the name/set name
  return !!(
    card.expansion?.toLowerCase() === "d100" ||
    card.set?.toLowerCase().includes("disney 100") ||
    card.subtitle?.toLowerCase().includes("disney 100")
  );
}


const inkColors = {
  Amber: "bg-[#f59e0b]",
  Amethyst: "bg-[#9333ea]",
  Emerald: "bg-[#10b981]",
  Ruby: "bg-[#ef4444]",
  Sapphire: "bg-[#3b82f6]",
  Steel: "bg-[#6b7280]",
};

export const getInkLogo = (ink: string) => `/inks/COLOR_${ink.toUpperCase()}_RGB.webp`;

export const CardDisplay = memo(function CardDisplay({
  card,
  className,
  showQuickAdd,
  onQuickAdd,
  returnTo,
  ownedCount,
  useThumbnail = false,
  hideInfo = false
}: CardDisplayProps) {
  const isCharacter = card.type === "Character";
  const isSong = card.type === "Song";
  const isLocation = card.type === "Location";
  const [imgError, setImgError] = useState(false);
  const hasRealImage = !!card.image && !imgError;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group relative flex flex-col", className)}
    >
      {ownedCount !== undefined && ownedCount > 0 && (
        <div className="absolute -top-2 -right-2 z-20 flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-background border border-primary/30 shadow-lg text-[10px] font-bold text-primary">
          {ownedCount}
        </div>
      )}
      <Link href={`/cards/${encodeURIComponent(card.id)}${returnTo ? `?from=${returnTo}` : ""}`} className="block relative aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-border/50 bg-card">
        {hasRealImage ? (
          <img
            src={useThumbnail ? (card.thumbnail || card.image) : card.image}
            alt={card.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0">
            <img src="/LCardBack.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", inkGradients[card.inkColor] ?? inkGradients.Amber)} />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}


        {/* Text overlay removed as per user request for a clean card-back look */}

        {showQuickAdd && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none group-hover:pointer-events-auto">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onQuickAdd?.(card);
              }}
              size="sm"
              className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> Quick Add
            </Button>
          </div>
        )}
      </Link>
      {!hideInfo && (
        <div className="mt-1.5 px-0.5">
          <p className="text-sm font-semibold truncate leading-tight">{card.name}</p>
          <p className="text-[10px] text-muted-foreground truncate leading-tight">
            {getFormattedSubtitle(card) || getDisplayType(card)}
          </p>
          {card.franchise && (
            <p className="text-[9px] font-bold uppercase tracking-wider text-primary/70 truncate mt-0.5">
              {card.franchise}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
});
