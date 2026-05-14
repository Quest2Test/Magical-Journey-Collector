import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { Settings, Share2, Award, Sparkles, Layers, Gem, Flag, PieChart as PieChartIcon, Download, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { useCollection, Collection, CollectionEntry } from "@/hooks/useCollection";
import { isFoilOnly } from "@/lib/pricing";
import { useAllCards, useSets, useCardLookup } from "@/hooks/useCards";
import { CardDisplay, inkHexColors, rarityIcons } from "@/components/ui/card-display";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Label as RechartsLabel } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetaTags } from "@/components/layout/MetaTags";
import { SetProgressCard } from "@/components/profile/SetProgressCard";
import { SET_ACRONYMS } from "@/lib/sets";
import { getCardPricing } from "@/lib/pricing";
import { CHALLENGES } from "@/data/challenges";
import { useWishlist, WishlistEntry } from "@/hooks/useWishlist";
import { isProfane } from "@/lib/profanity";

export default function Profile() {
  const [match, params] = useRoute("/profile/:username");
  const [, setLocation] = useLocation();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const { data: dbChallenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      // Try both isActive and is_active column names
      let { data, error } = await supabase.from("challenges").select("*").or("isActive.eq.true,is_active.eq.true");
      
      // Fallback: if the above fails (e.g. columns don't exist), try selecting all
      if (error) {
        const { data: allData } = await supabase.from("challenges").select("*");
        data = allData;
      }

      // Merge with local static challenges
      const localChallenges = (await import("@/data/challenges")).CHALLENGES;
      const combined = [...localChallenges, ...(data || [])];
      
      // Deduplicate by ID
      const seen = new Set();
      return combined.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
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
    Enchanted: "#ec4899",
    Rare: "#3b82f6",
    Uncommon: "#10b981",
    Common: "#6b7280",
    Iconic: "#ef4444",
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
    
    // 1. Validation
    const cleanUsername = formData.username.trim();
    if (cleanUsername.length < 3) {
      return toast({ title: "Username too short", description: "Minimum 3 characters required.", variant: "destructive" });
    }
    if (cleanUsername.length > 20) {
      return toast({ title: "Username too long", description: "Maximum 20 characters allowed.", variant: "destructive" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return toast({ title: "Invalid username", description: "Only letters, numbers, and underscores allowed.", variant: "destructive" });
    }
    
    // Profanity check
    if (isProfane(cleanUsername)) {
      return toast({ 
        title: "Username restricted", 
        description: "Please choose a username that follows our community guidelines.", 
        variant: "destructive" 
      });
    }

    setIsLoading(true);

    try {
      // 2. Check Uniqueness if changed
      if (cleanUsername !== user?.user_metadata?.username) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", cleanUsername)
          .maybeSingle();
        
        if (existing) {
          throw new Error("Username already taken. Please choose another.");
        }
      }

      // 3. Update Auth Metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          username: cleanUsername,
          avatar_url: formData.avatar_url,
          is_public: formData.is_public
        }
      });

      if (error) throw error;

      // 4. Update Profile Table (Sync)
      // Note: We do this manually here in addition to any DB triggers for maximum robustness
      await supabase.from("profiles").upsert({
        id: user!.id,
        username: cleanUsername,
        avatar_url: formData.avatar_url,
        is_public: formData.is_public,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
      setIsOpen(false);
      
      // If username changed, redirect to new URL to keep link stable
      if (cleanUsername !== params?.username) {
        setLocation(`/profile/${cleanUsername}`);
      }
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
  const isPublicView = isOwnProfile || !!(targetProfile?.is_public);
  const { wishlist } = useWishlist(activeUserId, { enabled: isPublicView });
  const { collection, collectedCount, totalCopies, clearCollection } = useCollection(activeUserId, { enabled: isPublicView });
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
    const costCounts: Record<string, number> = {
      "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7+": 0
    };
    const typeCounts: Record<string, number> = {
      Character: 0, Action: 0, Item: 0, Location: 0, Song: 0
    };
    const franchiseCounts: Record<string, number> = {};

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

    for (const [cardId, entry] of Object.entries(collection as Collection)) {
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

      if (card.cost !== undefined) {
        const costKey = card.cost >= 7 ? "7+" : card.cost.toString();
        if (costCounts[costKey] !== undefined) {
            costCounts[costKey] += qty;
        } else {
            costCounts[costKey] = qty;
        }
      }

      const cardType = card.type?.includes("Song") ? "Song" : (card.type || "Other");
      if (typeCounts[cardType] !== undefined) {
        typeCounts[cardType] += qty;
      } else {
        typeCounts[cardType] = qty;
      }

      if (card.franchise) {
        franchiseCounts[card.franchise] = (franchiseCounts[card.franchise] || 0) + qty;
      }

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

    const rarityOrder = ["Iconic", "Enchanted", "Epic", "Legendary", "Super Rare", "Rare", "Uncommon", "Common"];
    const rarityChartData = Object.entries(rarityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => rarityOrder.indexOf(a.name) - rarityOrder.indexOf(b.name));

    const costChartData = Object.entries(costCounts)
      .map(([name, value]) => ({ name, value }));

    const typeChartData = Object.entries(typeCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const franchiseChartData = Object.entries(franchiseCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    collectedCardsInfo.sort((a, b) => b.totalOwnedVal - a.totalOwnedVal);
    const topCards = collectedCardsInfo.slice(0, 10);

    const level = Math.floor(collectedCount / 50) + 1;
    const progressToNext = (collectedCount % 50) * 2; // 0-100%

    // Evaluation Engine for Dynamic Badges
    const achievements = dbChallenges.map((challenge) => {
      let earned = false;
      let condition = challenge.condition;
      
      // Safety: Parse condition if it's a JSON string from the DB
      if (typeof condition === 'string') {
        try {
          condition = JSON.parse(condition);
        } catch (e) {
          console.error("Failed to parse challenge condition", e);
          return null;
        }
      }

      if (!condition) return null;

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
    }).filter(a => a !== null);

    const rarityTierColors: Record<string, string> = {
      Common: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      Uncommon: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      Rare: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      "Super Rare": "text-purple-500 bg-purple-500/10 border-purple-500/20",
      Legendary: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      Epic: "text-violet-500 bg-violet-500/10 border-violet-500/20",
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
      costChartData,
      typeChartData,
      franchiseChartData,
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
            {!isOwnProfile && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-destructive transition-colors"
                onClick={async () => {
                  try {
                    const { error } = await supabase.from("reports").insert({
                      reporter_id: user?.id,
                      target_id: activeUserId,
                      target_type: "profile",
                      reason: "Flagged via public profile view"
                    });

                    if (error) throw error;

                    toast({
                      title: "Profile Reported",
                      description: "Thank you. Our moderation team will review this profile shortly.",
                      variant: "destructive"
                    });
                  } catch (e: any) {
                    toast({
                      title: "Report Failed",
                      description: "There was an issue sending your report.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Flag className="w-4 h-4 mr-2" /> Report
              </Button>
            )}
            {isOwnProfile && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" /> Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/40">
                  <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="font-serif text-2xl">Profile Settings</DialogTitle>
                    <DialogDescription>
                      Manage your identity and collection privacy settings.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-0">
                    <div className="p-6 pt-2 space-y-6">
                      {/* Identity Section */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <Icons.User className="w-3 h-3" /> Identity
                        </h3>
                        <div className="grid gap-4 bg-muted/20 p-4 rounded-2xl border border-border/30">
                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-bold text-foreground/70">Unique Username</Label>
                            <Input
                              id="username"
                              value={formData.username}
                              onChange={(e) => setFormData(p => ({ ...p, username: e.target.value.substring(0, 20) }))}
                              placeholder="illumina_123"
                              className="h-10 bg-background/50"
                            />
                            <div className="flex justify-between items-center px-1">
                              <p className="text-[9px] text-muted-foreground italic">Only letters, numbers, and underscores.</p>
                              <p className="text-[9px] font-mono text-muted-foreground">{formData.username.length}/20</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="avatar_url" className="text-xs font-bold text-foreground/70">Avatar Image URL</Label>
                            <Input
                              id="avatar_url"
                              value={formData.avatar_url}
                              onChange={(e) => setFormData(p => ({ ...p, avatar_url: e.target.value }))}
                              placeholder="https://images.com/my-avatar.jpg"
                              className="h-10 bg-background/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Privacy Section */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <Icons.Lock className="w-3 h-3" /> Privacy & Social
                        </h3>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-muted/20">
                          <div className="space-y-1">
                            <Label htmlFor="is_public" className="text-sm font-bold">Public Profile</Label>
                            <p className="text-[11px] text-muted-foreground leading-tight max-w-[240px]">Allow other Illumineers to view your collection value, analysis, and wishlist.</p>
                          </div>
                          <Switch
                            id="is_public"
                            checked={formData.is_public}
                            onCheckedChange={(checked) => setFormData(p => ({ ...p, is_public: checked }))}
                          />
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm" 
                          className="w-full h-10 rounded-xl gap-2 border border-border/40"
                          onClick={handleShareProfile}
                        >
                          <Share2 className="w-4 h-4" /> Copy Profile URL
                        </Button>
                      </div>

                      {/* Danger Zone */}
                      <div className="space-y-4 pt-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-destructive/70 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> Danger Zone
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            className="h-10 rounded-xl bg-background/50 w-full" 
                            onClick={handleExportCollection}
                          >
                            <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="sm" 
                            className="h-11 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive/20 justify-start px-4" 
                            onClick={async () => {
                              if (confirm("Permanently delete all your decks? This cannot be undone.")) {
                                const { error } = await supabase.from("decks").delete().eq("user_id", user?.id);
                                if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
                                else toast({ title: "Decks Deleted", variant: "destructive" });
                              }
                            }}
                          >
                            <Icons.Layers className="w-3.5 h-3.5 mr-2" /> Clear My Decks
                          </Button>

                          <Button 
                            type="button"
                            variant="destructive" 
                            size="sm" 
                            className="h-11 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive/20 justify-start px-4" 
                            onClick={async () => {
                              if (confirm("Wipe your entire collection? This cannot be undone.")) {
                                const { error } = await supabase.from("collections").delete().eq("user_id", user?.id);
                                if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
                                else toast({ title: "Collection Purged", variant: "destructive" });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset Collection
                          </Button>

                          <Button 
                            type="button"
                            variant="destructive" 
                            size="sm" 
                            className="h-11 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive/20 justify-start px-4" 
                            onClick={async () => {
                              if (confirm("Clear your entire wishlist?")) {
                                const { error } = await supabase.from("wishlists").delete().eq("user_id", user?.id);
                                if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
                                else toast({ title: "Wishlist Cleared", variant: "destructive" });
                              }
                            }}
                          >
                            <Icons.Sparkles className="w-3.5 h-3.5 mr-2" /> Clear Wishlist
                          </Button>

                          <Button 
                            type="button"
                            variant="destructive" 
                            size="sm" 
                            className="h-11 rounded-xl bg-destructive hover:bg-destructive/90 text-white justify-start px-4" 
                            onClick={async () => {
                              if (confirm("ABSOLUTE DATA WIPE: This will delete everything (Decks, Collection, Wishlist, and Profile Metadata). Your account login will remain, but all progress will be lost. Proceed?")) {
                                setIsLoading(true);
                                try {
                                  await Promise.all([
                                    supabase.from("decks").delete().eq("user_id", user?.id),
                                    supabase.from("collections").delete().eq("user_id", user?.id),
                                    supabase.from("wishlists").delete().eq("user_id", user?.id),
                                    supabase.from("profiles").delete().eq("id", user?.id)
                                  ]);
                                  
                                  // Sign out the user after wiping data
                                  await signOut();
                                  
                                  toast({ title: "Account & Data Deleted", description: "Your Lorbound profile and all associated data have been permanently removed.", variant: "destructive" });
                                  window.location.href = "/";
                                } catch (e: any) {
                                  toast({ title: "Wipe Failed", description: e.message, variant: "destructive" });
                                } finally {
                                  setIsLoading(false);
                                }
                              }
                            }}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Wipe All Data
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border/50 flex gap-3">
                       <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                       <Button type="submit" className="flex-[2] rounded-xl shadow-lg shadow-primary/20" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Icons.Save className="w-4 h-4 mr-2" />}
                        Update Profile
                      </Button>
                    </div>
                  </form>
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
            <TabsTrigger value="wishlist" className="bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 font-serif text-lg">Wishlist</TabsTrigger>
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
            {isPublicView ? (
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
            ) : (
              <div className="py-20 text-center bg-muted/10 border border-dashed rounded-3xl flex flex-col items-center">
                <Icons.Lock className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-serif font-bold mb-2">Set Progress Hidden</h3>
                <p className="text-muted-foreground max-w-sm">This player's set completion data is private.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="mt-4 focus-visible:ring-0">
            {isPublicView ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Ink Pie */}
                <div className="bg-card border rounded-2xl p-6 shadow-md shadow-primary/5 hover:shadow-lg transition-shadow">
                  <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-primary rounded-full"></span> Ink Affinity
                  </h3>
                  {dashboardData?.inkChartData.length ? (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.inkChartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {dashboardData.inkChartData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={inkHexColors[entry.name as keyof typeof inkHexColors] || '#000'} className="drop-shadow-sm hover:opacity-80 transition-opacity" />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`${value} cards`, '']}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                          />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">No data for analysis.</div>
                  )}
                </div>

                {/* Rarity Pie */}
                <div className="bg-card border rounded-2xl p-6 shadow-md shadow-primary/5 hover:shadow-lg transition-shadow">
                  <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-purple-500 rounded-full"></span> Rarity Spectrum
                  </h3>
                  {dashboardData?.rarityChartData.length ? (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.rarityChartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {dashboardData.rarityChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={rarityColors[entry.name] || '#9ca3af'} className="drop-shadow-sm hover:opacity-80 transition-opacity" />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`${value} cards`, '']}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                          />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">No data for analysis.</div>
                  )}
                </div>

                {/* Card Type Distribution */}
                <div className="bg-card border rounded-2xl p-6 shadow-md shadow-primary/5 hover:shadow-lg transition-shadow">
                  <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Card Types
                  </h3>
                  {dashboardData?.typeChartData?.length ? (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.typeChartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {dashboardData.typeChartData.map((entry: any, index: number) => {
                              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="drop-shadow-sm hover:opacity-80 transition-opacity" />;
                            })}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`${value} cards`, '']}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                          />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">No data for analysis.</div>
                  )}
                </div>

                {/* Cost Curve */}
                <div className="bg-card border rounded-2xl p-6 shadow-md shadow-primary/5 hover:shadow-lg transition-shadow lg:col-span-2 xl:col-span-1">
                  <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-blue-500 rounded-full"></span> Cost Curve
                  </h3>
                  {dashboardData?.costChartData?.some((d: any) => d.value > 0) ? (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.costChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} dy={10}>
                            <RechartsLabel value="Ink Cost" offset={-15} position="insideBottom" fill="hsl(var(--muted-foreground))" fontSize={11} fontWeight={600} />
                          </XAxis>
                          <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="value" name="Cards" fill="url(#costGradient)" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">No data for analysis.</div>
                  )}
                </div>

                {/* Top Franchises */}
                <div className="bg-card border rounded-2xl p-6 shadow-md shadow-primary/5 hover:shadow-lg transition-shadow lg:col-span-2">
                  <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-amber-500 rounded-full"></span> Top Franchises
                  </h3>
                  {dashboardData?.franchiseChartData?.length ? (
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.franchiseChartData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
                          <defs>
                            <linearGradient id="franchiseGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.9}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} width={100} />
                          <Tooltip
                            cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="value" name="Cards" fill="url(#franchiseGradient)" radius={[0, 6, 6, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[320px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">No data for analysis.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center bg-muted/10 border border-dashed rounded-3xl flex flex-col items-center">
                <PieChartIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-serif font-bold mb-2">Analysis Hidden</h3>
                <p className="text-muted-foreground max-w-sm">Detailed collection analysis is private for this profile.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-8 mt-4 focus-visible:ring-0">
            {isPublicView ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {wishlist.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
                    No items in wishlist yet.
                  </div>
                ) : (
                  wishlist.map((item: WishlistEntry) => {
                    const card = (lookup as Record<string, any>)[item.cardId];
                    if (!card) return null;
                    
                    // Auto-correct variant for Enchanted/Iconic cards which are foil-only
                    const actualVariant = isFoilOnly(card) ? "foil" : item.variant;
                    const pricing = getCardPricing(card);
                    const price = actualVariant === "foil" ? pricing.foil : pricing.normal;
                    
                    return (
                      <div key={`${card.id}-${actualVariant}`} className="space-y-2 relative">
                        <CardDisplay card={card} />
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{card.rarity}</span>
                          <span className="text-[10px] font-bold text-emerald-500">{price > 0 ? formatPrice(price) : "N/A"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
               <div className="py-20 text-center bg-card border rounded-3xl">
                 <Icons.Lock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                 <h2 className="text-xl font-bold">This wishlist is private</h2>
               </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="mt-4 focus-visible:ring-0">
            {isPublicView ? (
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
            ) : (
              <div className="py-20 text-center bg-muted/10 border border-dashed rounded-3xl flex flex-col items-center">
                <Icons.Award className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-serif font-bold mb-2">Achievements Hidden</h3>
                <p className="text-muted-foreground max-w-sm">This player's achievements and challenges are private.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
