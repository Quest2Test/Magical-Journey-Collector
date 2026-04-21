import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { Settings, Share2, Award, Sparkles, Layers, Gem, Flag, PieChart as PieChartIcon, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { useCollection } from "@/hooks/useCollection";
import { useAllCards, useSets, useCardLookup } from "@/hooks/useCards";
import { CardDisplay, inkHexColors, rarityIcons } from "@/components/ui/card-display";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetaTags } from "@/components/layout/MetaTags";
import { SetProgressCard } from "@/components/profile/SetProgressCard";
import { SET_ACRONYMS } from "@/lib/sets";
import { getCardPricing } from "@/lib/pricing";
import { CHALLENGES } from "@/data/challenges";

export default function Profile() {
  const [match, params] = useRoute("/profile/:username");
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const { data: dbChallenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data } = await supabase.from("challenges").select("*").eq("isActive", true);
      return data || [];
    }
  });

  useEffect(() => {
    if (!authLoading && !user && (params?.username === 'me' || !params?.username)) {
      setLocation("/login");
    }
  }, [user, authLoading, params, setLocation]);

  const [isOpen, setIsOpen] = useState(() => window.location.search.includes('settings=true'));
  const [isLoading, setIsLoading] = useState(false);
  const [setFilter, setSetFilter] = useState<"main" | "promo" | "all">("main");
  const [formData, setFormData] = useState({
    username: "",
    avatar_url: "",
    is_public: false
  });

  const rarityColors: Record<string, string> = {
    Legendary: "#f59e0b",
    "Super Rare": "#9333ea",
    Epic: "#c084fc",
    Rare: "#3b82f6",
    Uncommon: "#10b981",
    Common: "#6b7280",
    Iconic: "#06b6d4",
    Special: "#ef4444",
  };

  const isOwnProfile = user && ((user.user_metadata?.username && user.user_metadata?.username === params?.username) || user.id === params?.username || params?.username === 'me');

  const displayUsername = isOwnProfile ? (user?.user_metadata?.username || user?.user_metadata?.full_name || "New Player") : params?.username;
  const displayAvatar = isOwnProfile ? user?.user_metadata?.avatar_url : undefined;

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.user_metadata?.username || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        is_public: !!user.user_metadata?.is_public
      });
    }
  }, [user, isOpen]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          avatar_url: formData.avatar_url,
          is_public: formData.is_public
        }
      });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  // Dashboard Data Aggregation
  // ---------------------------
  const { data: allCards = [], isLoading: loadingCards, isError: errorCards } = useAllCards();
  const { data: lookup = {} } = useCardLookup();
  const { data: allSets = [], isLoading: loadingSets, isError: errorSets } = useSets();

  // Fetch target profile if not own
  const { data: targetProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", params?.username],
    queryFn: async () => {
      if (!params?.username || params.username === 'me') return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_public")
        .eq("username", params.username)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!params?.username && !isOwnProfile
  });

  const activeUserId = isOwnProfile ? user?.id : targetProfile?.id;
  const { collection, collectedCount, totalCopies, clearCollection } = useCollection(activeUserId);

  const isPublicView = isOwnProfile || (targetProfile?.is_public);
  const displayUsernameFinal = isOwnProfile ? displayUsername : (targetProfile?.username || params?.username);
  const displayAvatarFinal = isOwnProfile ? displayAvatar : targetProfile?.avatar_url;

  const handleExportCollection = () => {
    const rows = [["Card Name", "Set ID", "Collector Number", "Normal Qty", "Foil Qty", "Normal Price", "Foil Price", "Total Value"]];
    allCards.forEach(card => {
      const entry = collection[card.id];
      if (entry && (entry.normal > 0 || entry.foil > 0)) {
        const pricing = getCardPricing(card);
        const cardTotalValue = (entry.normal * pricing.normal) + (entry.foil * pricing.foil);

        rows.push([
          `"${card.name}"`,
          card.expansion,
          card.cardNum?.toString() || "",
          entry.normal.toString(),
          entry.foil.toString(),
          pricing.normal.toFixed(2),
          pricing.foil.toFixed(2),
          cardTotalValue.toFixed(2)
        ]);
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_lorcana_collection.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Collection Exported", description: "Your collection CSV has been downloaded." });
  };

  const handleShareProfile = () => {
    const url = window.location.origin + `/profile/${params?.username || user?.user_metadata?.username || user?.id || 'me'}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Your profile link is now in your clipboard." });
  };

  const dashboardData = useMemo(() => {
    if (!allCards.length || !collection) return null;

    let totalValue = 0;
    let totalNormalValue = 0;
    let totalFoilValue = 0;
    let totalNormalCopies = 0;
    let totalFoilCopies = 0;
    let totalUniqueFoils = 0;

    const inkCounts: Record<string, number> = {
      Amber: 0, Amethyst: 0, Emerald: 0, Ruby: 0, Sapphire: 0, Steel: 0
    };

    const rarityCounts: Record<string, number> = {};

    const collectedCardsInfo: any[] = [];
    const setProgressStats: Record<string, { collected: number, total: number, name: string, isPromo: boolean, releasedAt?: string, image?: string }> = {};

    for (const set of allSets) {
      setProgressStats[set.id] = {
        collected: 0,
        total: set.count,
        name: set.name,
        isPromo: set.isPromo,
        releasedAt: set.releasedAt,
        image: undefined as string | undefined
      };
    }

    for (const [cardId, entry] of Object.entries(collection)) {
      const card = (lookup as Record<string, any>)[cardId];
      if (!card || (entry.normal === 0 && entry.foil === 0)) continue;

      const qty = entry.normal + entry.foil;
      totalNormalCopies += entry.normal;
      totalFoilCopies += entry.foil;
      if (entry.foil > 0) totalUniqueFoils += 1;

      const pricing = getCardPricing(card);
      const cardValNormal = (entry.normal * pricing.normal);
      const cardValFoil = (entry.foil * pricing.foil);

      totalNormalValue += cardValNormal;
      totalFoilValue += cardValFoil;
      totalValue += (cardValNormal + cardValFoil);

      if (inkCounts[card.inkColor] !== undefined) {
        inkCounts[card.inkColor] += qty;
      }

      const rarity = card.rarity || "Common";
      rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;

      collectedCardsInfo.push({
        card,
        totalOwnedVal: cardValNormal + cardValFoil,
        bestPrice: Math.max(pricing.normal, pricing.foil),
        isFoilOwned: entry.foil > 0
      });

      if (setProgressStats[card.expansion]) {
        setProgressStats[card.expansion].collected += 1;
        if (!setProgressStats[card.expansion].image && card.image) {
          setProgressStats[card.expansion].image = card.image;
        }
      }
    }

    const inkChartData = Object.entries(inkCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    const dominantInk = inkChartData.length > 0
      ? [...inkChartData].sort((a, b) => b.value - a.value)[0].name
      : "None";

    const inkTitles: Record<string, string> = {
      Amber: "Amber Custodian",
      Amethyst: "Amethyst Sage",
      Emerald: "Emerald Trickster",
      Ruby: "Ruby Sorcerer",
      Sapphire: "Sapphire Strategist",
      Steel: "Steel Warmaster",
      None: "Novice Illumineer"
    };

    const rarityOrder = ["Legendary", "Super Rare", "Rare", "Uncommon", "Common", "Special"];
    const rarityChartData = Object.entries(rarityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => rarityOrder.indexOf(a.name) - rarityOrder.indexOf(b.name));

    collectedCardsInfo.sort((a, b) => b.totalOwnedVal - a.totalOwnedVal);
    const topCards = collectedCardsInfo.slice(0, 10);

    const level = Math.floor(collectedCount / 50) + 1;
    const progressToNext = (collectedCount % 50) * 2; // 0-100%

    // Evaluation Engine for Dynamic Badges
    const achievements = dbChallenges.map((challenge) => {
      let earned = false;
      const condition = challenge.condition;

      switch (condition.metric) {
        case 'total_cards':
          earned = collectedCount >= condition.target;
          break;
        case 'unique_foils':
          earned = totalUniqueFoils >= condition.target;
          break;
        case 'ink_diversity':
          earned = inkChartData.length >= condition.target;
          break;
        case 'legendary_count':
          earned = (rarityCounts['Legendary'] || 0) >= condition.target;
          break;
        case 'enchanted_count':
          earned = (rarityCounts['Enchanted'] || 0) >= condition.target;
          break;
        case 'total_value':
          earned = totalValue >= condition.target;
          break;
        case 'set_completion':
          if (condition.setId && setProgressStats[condition.setId]) {
            const stats = setProgressStats[condition.setId];
            const pct = (stats.collected / stats.total) * 100;
            earned = pct >= condition.target;
          }
          break;
      }

      return { ...challenge, earned };
    });

    const rarityTierColors: Record<string, string> = {
      Common: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      Uncommon: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      Rare: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      "Super Rare": "text-purple-500 bg-purple-500/10 border-purple-500/20",
      Legendary: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      Enchanted: "text-pink-500 bg-pink-500/10 border-pink-500/20"
    };

    return {
      totalValue,
      totalNormalValue,
      totalFoilValue,
      totalNormalCopies,
      totalFoilCopies,
      totalUniqueFoils,
      inkChartData,
      rarityChartData,
      topCards,
      setProgressStats,
      level,
      progressToNext,
      inkTitle: inkTitles[dominantInk as keyof typeof inkTitles] || "Illumineer",
      achievements,
      rarityTierColors
    };
  }, [allCards, allSets, collection, lookup]);


  if (loadingCards || loadingSets || loadingProfile) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Fetching Lorcana card data...</p>
      </div>
    );
  }

  if (errorCards || errorSets) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-2">
          <Flag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold">Data Connection Issue</h2>
        <p className="text-muted-foreground max-w-md">We're having trouble reaching the Lorcast API to retrieve card data. This usually resolves itself in a few minutes.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Try Refreshing
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col min-h-[60vh]">
      <div className="max-w-5xl mx-auto w-full">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 relative pb-8 border-b">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
            <AvatarImage src={displayAvatarFinal} />
            <AvatarFallback className="text-4xl">{(displayUsernameFinal || "U").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-3xl font-serif font-bold">{displayUsernameFinal}</h1>
              <span className="px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary self-center md:self-auto">
                {dashboardData?.inkTitle || "Illumineer"}
              </span>
            </div>
            <div className="flex flex-col gap-1 max-w-sm mx-auto md:mx-0">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                <p className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Illumineer Level {dashboardData?.level || 1}
                </p>
                <span>{dashboardData?.progressToNext || 0}%</span>
              </div>
              <Progress value={dashboardData?.progressToNext || 0} className="h-2 border border-primary/10" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleShareProfile}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            {isOwnProfile && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" /> Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                    <DialogDescription>
                      Managed your identity and collection privacy settings.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Display Name</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                          placeholder="Your username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar_url">Avatar Image URL</Label>
                        <Input
                          id="avatar_url"
                          value={formData.avatar_url}
                          onChange={(e) => setFormData(p => ({ ...p, avatar_url: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="space-y-0.5">
                          <Label htmlFor="is_public">Public Profile</Label>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight leading-none pt-0.5">Allow others to see your collection value</p>
                        </div>
                        <Switch
                          id="is_public"
                          checked={formData.is_public}
                          onCheckedChange={(checked) => setFormData(p => ({ ...p, is_public: checked }))}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Changes
                    </Button>
                  </form>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">Data Management</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="w-full" onClick={handleExportCollection}>
                        <Download className="w-3 h-3 mr-2" /> Export CSV
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full" onClick={() => {
                        if (confirm("Confirm: Wipe all collection data?")) {
                          clearCollection();
                          toast({ title: "Collections Cleared" });
                        }
                      }}>
                        <Trash2 className="w-3 h-3 mr-2" /> Reset
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="overview" className="w-full space-y-8">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent border-b rounded-none gap-6 mb-2">
            <TabsTrigger value="overview" className="bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 font-serif text-lg">Overview</TabsTrigger>
            <TabsTrigger value="collections" className="bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 font-serif text-lg">Collections</TabsTrigger>
            <TabsTrigger value="analysis" className="bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 font-serif text-lg">Analysis</TabsTrigger>
            <TabsTrigger value="challenges" className="bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 font-serif text-lg">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-4 focus-visible:ring-0">
            {isPublicView && dashboardData ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="font-medium text-sm">Collection Value</h3>
                    </div>
                    <div className="text-3xl font-serif font-bold text-amber-500 mb-1">
                      {formatPrice(dashboardData.totalValue)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Normal</span>
                        <span>{formatPrice(dashboardData.totalNormalValue)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-amber-600/80">
                        <span>Cold Foil</span>
                        <span>{formatPrice(dashboardData.totalFoilValue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Layers className="w-4 h-4" />
                      <h3 className="font-medium text-sm">Collection Depth</h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold">{collectedCount}</span>
                      <span className="text-xs font-medium text-muted-foreground">/ {allCards.length} Cards</span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={(collectedCount / Math.max(allCards.length, 1)) * 100} className="h-1.5" />
                      <p className="text-[10px] text-right text-muted-foreground font-bold">{((collectedCount / Math.max(allCards.length, 1)) * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-medium text-sm">Foil Tracking</h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-primary">{dashboardData.totalFoilCopies}</span>
                      <span className="text-xs font-medium text-muted-foreground">Foils</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                      In <span className="text-foreground">{dashboardData.totalUniqueFoils}</span> unique cards
                    </p>
                  </div>

                  <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <PieChartIcon className="w-4 h-4" />
                      <h3 className="font-medium text-sm">Total Card Copies</h3>
                    </div>
                    <div className="text-3xl font-bold">
                      {totalCopies}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-2">
                      Avg. <span className="text-foreground">{(totalCopies / Math.max(collectedCount, 1)).toFixed(1)}</span> per card
                    </p>
                  </div>
                </div>

                {/* Top Treasures */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-2 text-foreground/90">
                      <Gem className="w-5 h-5 text-amber-500" /> Top Treasures
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Highest Value Holdings</p>
                  </div>
                  {dashboardData.topCards.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {dashboardData.topCards.map((info: any, i: number) => (
                        <div key={info.card.id} className="group relative">
                          <CardDisplay card={info.card} />
                          <div className="absolute -top-3 -right-3 bg-background/80 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 shadow-lg z-10 transition-transform group-hover:scale-110 flex flex-col items-end">
                            <span className="text-[9px] uppercase font-black text-muted-foreground/80 leading-none mb-0.5 tracking-tighter">Market</span>
                            <span className={cn(
                              "text-sm font-black leading-tight tracking-tight",
                              info.isFoilOwned ? "text-amber-500" : "text-foreground"
                            )}>
                              {formatPrice(info.bestPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/10 border border-dashed rounded-xl p-16 text-center text-muted-foreground flex flex-col items-center">
                      <Layers className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-serif">The vault is currently empty.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed rounded-2xl">
                <Layers className="w-16 h-16 text-muted-foreground/30 mb-6" />
                <h3 className="text-xl font-serif font-bold mb-2">Private Collection</h3>
                <p className="text-muted-foreground text-center max-w-sm px-4">This player's collection is set to private.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-4 focus-visible:ring-0">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Set Progress</h2>
                  <p className="text-sm text-muted-foreground">Track your completion across all Lorcana sets</p>
                </div>

                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                  <button
                    onClick={() => setSetFilter("main")}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                      setFilter === "main" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Main Sets
                  </button>
                  <button
                    onClick={() => setSetFilter("promo")}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                      setFilter === "promo" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Promos
                  </button>
                  <button
                    onClick={() => setSetFilter("all")}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                      setFilter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                </div>
              </div>

              {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(dashboardData.setProgressStats)
                    .filter(([_, stats]: [string, any]) => {
                      if (setFilter === "main") return !stats.isPromo;
                      if (setFilter === "promo") return stats.isPromo;
                      return true;
                    })
                    .sort((a, b) => {
                      // Sort by release date (ascending)
                      return (new Date(a[1].releasedAt || 0).getTime()) - (new Date(b[1].releasedAt || 0).getTime());
                    })
                    .map(([id, stats]: [string, any]) => (
                      <SetProgressCard
                        key={id}
                        name={stats.name}
                        setId={id}
                        setCode={SET_ACRONYMS[id] || id}
                        collected={stats.collected}
                        total={stats.total}
                        releasedAt={stats.releasedAt}
                        image={stats.image}
                      />
                    ))
                  }
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4 focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Ink Pie */}
              <div className="bg-card border rounded-xl p-6 shadow-sm shadow-indigo-500/5">
                <h3 className="font-serif font-bold text-xl mb-6">Ink Affinity</h3>
                {dashboardData?.inkChartData.length ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.inkChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {dashboardData.inkChartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={inkHexColors[entry.name as keyof typeof inkHexColors] || '#000'} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value} cards`, '']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data for analysis.</div>
                )}
              </div>

              {/* Rarity Pie */}
              <div className="bg-card border rounded-xl p-6 shadow-sm shadow-indigo-500/5">
                <h3 className="font-serif font-bold text-xl mb-6">Rarity Spectrum</h3>
                {dashboardData?.rarityChartData.length ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.rarityChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {dashboardData.rarityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={rarityColors[entry.name] || '#9ca3af'} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value} cards`, '']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data for analysis.</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="mt-4 focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {dashboardData?.achievements.map((ach: any) => {
                const Icon = (Icons as any)[ach.iconName] || Icons.Award;
                const tierColors = dashboardData.rarityTierColors[ach.tier] || "";
                return (
                  <div
                    key={ach.id}
                    className={cn(
                      "group relative bg-card border rounded-2xl p-6 transition-all duration-300 overflow-hidden",
                      ach.earned ? "shadow-md hover:shadow-xl ring-2 ring-primary/5" : "opacity-60 grayscale bg-muted/50"
                    )}
                  >
                    {/* Seasonal Indicator */}
                    {ach.type === 'Seasonal' && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 rounded-bl-xl text-[9px] font-black uppercase tracking-widest text-white shadow-xl z-20">
                        Seasonal Event
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        {ach.badgeImageUrl ? (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-border shadow-sm mb-2 shrink-0">
                            <img src={ach.badgeImageUrl} alt={ach.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={cn(
                            "p-3 rounded-xl ring-1 ring-inset mb-2 shrink-0 flex items-center justify-center w-14 h-14",
                            ach.earned ? tierColors : "bg-muted text-muted-foreground"
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                        )}
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border",
                          ach.earned ? tierColors : "border-muted-foreground/30 text-muted-foreground/50"
                        )}>
                          {ach.tier}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors">{ach.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {ach.description}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          ach.earned ? "bg-green-500 animate-pulse" : "bg-slate-300"
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                          {ach.earned ? "Achievement Unlocked" : "Progressing..."}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
