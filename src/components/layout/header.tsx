import { lazy, Suspense, useState } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Search, Menu, Heart, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { MetaTags } from "./MetaTags";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { useCurrency } from "@/components/currency-provider";

const SearchModal = lazy(() => import("./SearchModal"));

const routePrefetch = new Map<string, () => Promise<any>>([
  ["/cards", () => import("@/pages/cards")],
  ["/builder", () => import("@/pages/builder")],
  ["/decks", () => import("@/pages/decks")],
  ["/sets", () => import("@/pages/sets")],
  ["/resources", () => import("@/pages/resources")],
  ["/academy", () => import("@/pages/academy")],
  ["/wishlist", () => import("@/pages/wishlist")],
]);

export function Header() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const prefetchRoute = (href: string) => {
    routePrefetch.get(href)?.();
  };

  const links = [
    { href: "/cards", label: "Cards" },
    { href: "/builder", label: "Builder" },
    { href: "/decks", label: "Decks" },
    { href: "/sets", label: "Sets" },
    { href: "/resources", label: "Resources" },
    { href: "/academy", label: "Academy" },
  ];

  // Keyboard shortcut for search
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MetaTags />
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
            <img
              src="/LorBound_Logo.webp"
              alt="Lorbound"
              width="120"
              height="40"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((link) => {
              if (link.label === "Decks") {
                return (
                  <DropdownMenu key={link.label}>
                    <DropdownMenuTrigger className={`flex items-center gap-1 transition-colors hover:text-foreground/80 ${location.startsWith("/decks") || location.startsWith("/public-decks") ? "text-foreground" : "text-foreground/60"
                      }`}>
                      Decks
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem asChild>
                        <Link href="/decks" className="cursor-pointer w-full">My Decks</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/public-decks" className="cursor-pointer w-full">Public Decks</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => prefetchRoute(link.href)}
                  className={`transition-colors hover:text-foreground/80 ${location.startsWith(link.href) ? "text-foreground" : "text-foreground/60"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="hidden sm:flex relative text-pink-500 hover:text-pink-600 hover:bg-pink-500/10">
              <Heart className="h-5 w-5 fill-current" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Suspense fallback={null}>
            {isSearchOpen ? (
              <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
            ) : null}
          </Suspense>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hidden sm:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ""} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.user_metadata.full_name && <p className="font-medium">{user.user_metadata.full_name}</p>}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.user_metadata.username || user.id}`} className="cursor-pointer w-full display-block">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.user_metadata.username || user.id}?settings=true`} className="cursor-pointer w-full display-block">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Currency
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={currency} onValueChange={(v: any) => setCurrency(v)}>
                      <DropdownMenuRadioItem value="usd">USD ($)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="eur">EUR (€)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="gbp">GBP (£)</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600" onClick={signOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href={`/login?returnTo=${encodeURIComponent(location)}`}>Sign In</Link>
            </Button>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <div className="mb-4">
                <img
                  src="/LorBound_Logo.webp"
                  alt="Lorbound"
                  width="180"
                  height="40"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <nav className="flex flex-col gap-4">
                {links.map((link) => {
                  if (link.label === "Decks") {
                    return (
                      <div key="Decks" className="flex flex-col gap-2">
                        <span className="text-lg font-bold text-foreground/80">Decks</span>
                        <div className="flex flex-col gap-2 pl-4 border-l-2 border-border/50 ml-1">
                          <Link href="/decks" onClick={() => setIsOpen(false)} className={`text-base font-medium transition-colors hover:text-foreground/80 ${location.startsWith("/decks") ? "text-foreground" : "text-foreground/60"}`}>
                            My Decks
                          </Link>
                          <Link href="/public-decks" onClick={() => setIsOpen(false)} className={`text-base font-medium transition-colors hover:text-foreground/80 ${location.startsWith("/public-decks") ? "text-foreground" : "text-foreground/60"}`}>
                            Public Decks
                          </Link>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => prefetchRoute(link.href)}
                      className={`text-lg font-medium transition-colors hover:text-foreground/80 ${location.startsWith(link.href) ? "text-foreground" : "text-foreground/60"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-pink-500 ${location === "/wishlist" ? "text-pink-500" : "text-foreground/60"
                    } flex items-center gap-2`}
                >
                  <Heart className="h-5 w-5 fill-current" /> Wishlist
                </Link>
              </nav>
              <div className="mt-auto">
                {user ? (
                  <Button variant="destructive" className="w-full" onClick={() => { signOut(); setIsOpen(false); }}>
                    Log out
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/login?returnTo=${encodeURIComponent(location)}`} onClick={() => setIsOpen(false)}>Sign In</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
