import * as React from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAllCards, useSets } from "@/hooks/useCards";
import { MOCK_DECKS } from "@/data/decks";
import { Search, Layers, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { inkHexColors } from "@/components/ui/card-display";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [, setLocation] = useLocation();
  const { data: allCards = [] } = useAllCards();
  const { data: sets = [] } = useSets();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const onSelect = (path: string) => {
    setLocation(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search cards, sets, decks..." />
      <CommandList className="max-h-[450px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Sets Group */}
        {sets.length > 0 && (
          <CommandGroup heading="Sets">
            {sets.map((set) => (
              <CommandItem
                key={set.id}
                onSelect={() => onSelect(`/sets/${set.id}`)}
                className="cursor-pointer"
              >
                <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{set.name}</span>
                  <span className="text-xs text-muted-foreground uppercase">{set.id} · {set.isPromo ? "Promo Set" : `Set ${set.setNum}`}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Decks Group */}
        <CommandGroup heading="Community Decks">
          {MOCK_DECKS.slice(0, 10).map((deck) => (
            <CommandItem
              key={deck.id}
              onSelect={() => onSelect(`/decks/${deck.id}`)}
              className="cursor-pointer"
            >
              <Trophy className="mr-2 h-4 w-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="font-medium">{deck.name}</span>
                <span className="text-xs text-muted-foreground">by {deck.author}</span>
              </div>
              <div className="ml-auto flex gap-1">
                {deck.inkColors.map(color => (
                  <div
                    key={color}
                    className="w-2 h-2 rounded-full border border-white/10"
                    style={{ backgroundColor: inkHexColors[color] }}
                  />
                ))}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Cards Group */}
        <CommandGroup heading="Cards">
          {allCards.slice(0, 200).map((card) => (
            <CommandItem
              key={card.id}
              onSelect={() => onSelect(`/cards/${encodeURIComponent(card.id)}`)}
              className="cursor-pointer"
            >
              <div
                className="mr-3 w-8 h-10 rounded shrink-0 bg-muted overflow-hidden border border-white/5"
                style={{
                  background: (card.thumbnail || card.image) ? `url(${card.thumbnail || card.image}) center/cover no-repeat` :
                    `linear-gradient(to bottom right, ${inkHexColors[card.inkColor]}44, ${inkHexColors[card.inkColor]})`
                }}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate">{card.name}</span>
                {card.subtitle && (
                  <span className="text-xs text-muted-foreground truncate italic">{card.subtitle}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] text-muted-foreground font-mono uppercase bg-muted/50 px-1 rounded">
                  {card.expansion}
                </span>
                <div
                  className="w-3 h-3 rounded-full border border-white/10"
                  style={{ backgroundColor: inkHexColors[card.inkColor] }}
                />
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

      </CommandList>
      <div className="p-2 border-t bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span><kbd className="font-sans border px-1 rounded bg-background">↑↓</kbd> Navigate</span>
          <span><kbd className="font-sans border px-1 rounded bg-background">↵</kbd> Select</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Global Search</span>
        </div>
      </div>
    </CommandDialog>
  );
}
