import { Link } from "wouter";
import { useCardById } from "@/hooks/useCards";
import { ANNOUNCED_CARDS } from "@/data/announced-cards";
import { cn } from "@/lib/utils";
import { inkHexColors, CardDisplay } from "@/components/ui/card-display";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ArticleCardReferenceProps {
  cardId: string;
}

export function ArticleCardReference({ cardId }: ArticleCardReferenceProps) {
  const { data: apiCard, isLoading } = useCardById(cardId);
  
  // Also check announced cards
  const announcedCard = ANNOUNCED_CARDS.find(c => c.id === cardId);
  const card = apiCard || announcedCard;

  if (isLoading) return <span className="animate-pulse bg-muted h-4 w-12 rounded inline-block mx-1" />;
  if (!card) return <span className="text-red-500 font-bold decoration-dotted underline mx-1">[[Unknown Card: {cardId}]]</span>;

  const accentColor = inkHexColors[card.inkColor] || "#6366f1";

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Link 
          href={`/cards/${card.id}`}
          className="font-bold transition-all hover:opacity-80 cursor-pointer"
          style={{ color: accentColor }}
        >
          {card.name}
        </Link>
      </HoverCardTrigger>
      
      <HoverCardContent 
        side="top" 
        align="center" 
        className="w-64 p-0 border-0 bg-transparent shadow-none not-prose"
        sideOffset={10}
      >
        <div className="relative perspective-1000">
           {/* Drop Shadow Base */}
           <div 
             className="absolute -inset-4 blur-3xl opacity-20 -z-10 rounded-full bg-blend-screen" 
             style={{ backgroundColor: accentColor }}
           />
           <CardDisplay card={card} hideInfo={true} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
