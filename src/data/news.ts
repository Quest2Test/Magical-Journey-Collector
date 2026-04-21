export interface NewsPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: 'Expansion' | 'Community' | 'Update' | 'Tournament';
  slug: string;
}

export const NEWS_POSTS: NewsPost[] = [
  {
    id: "1",
    title: "Azurite Sea: Expedition into the Unknown",
    date: "2024-10-15",
    excerpt: "The sixth set of Disney Lorcana is here! Explore the depths of the Azurite Sea with new characters and powerful glimmers.",
    content: "Prepare to set sail! Azurite Sea brings a maritime flair to Disney Lorcana, featuring beloved characters from Big Hero 6 and Chip 'n Dale: Rescue Rangers. \n\nOne of the most anticipated reveals is [[card:ann-1]], a powerhouse that provides incredible utility for Sapphire decks. Not to be outdone, [[card:ann-2]] brings a chemical blast of board control to the Amethyst lineup. Discover new mechanics and build decks that will conquer the high seas.",
    imageUrl: "https://images.lucasfilm.com/wp-content/uploads/2024/09/DL_AzuriteSea_KeyArt.jpg", // Placeholder until verified
    category: "Expansion",
    slug: "azurite-sea-reveal"
  },
  {
    id: "2",
    title: "The Inkwell Chronicles: Site Launch",
    date: "2024-10-10",
    excerpt: "Welcome to Glimmercast! Our new dashboard and collection tracker is now live for all users.",
    content: "We are thrilled to launch Glimmercast. Our mission is to provide the most premium collection tracking experience for Lorcana players. Browse cards, build decks, and track your progress across every set.",
    imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop",
    category: "Update",
    slug: "site-launch"
  },
  {
    id: "3",
    title: "Competitive Corner: Meta Shift after Shimmering Skies",
    date: "2024-10-05",
    excerpt: "Analysis of the recent tournament results and the rising dominance of Amethyst/Ruby control.",
    content: "Shimmering Skies has settled into the meta, and we're seeing some fascinating shifts. Amethyst/Ruby continues to be a powerhouse, but Emerald/Steel is making a strong comeback with new tech cards.",
    imageUrl: "https://images.unsplash.com/photo-1550741113-503d693ef244?q=80&w=2070&auto=format&fit=crop",
    category: "Community",
    slug: "meta-shift-shimmering-skies"
  },
  {
    id: "4",
    title: "Glimmer Spotlight: The Big Hero 6 Debut",
    date: "2024-10-20",
    excerpt: "Analysis of the first characters from Big Hero 6 joining the Lorcana roster.",
    content: "The tides of the Azurite Sea are bringing some heavy hitters to the table. Most notably, we have the arrival of the Big Hero 6 team, led by none other than [[card:ann-1]]. \n\nBaymax brings a new level of durability to Sapphire decks with his incredible willpower and support capabilities. Paired with the technical genius of [[card:ann-2]], players can expect a high-synergy playstyle that rewards clever chemical interactions and defensive posturing. \n\nWe expect these cards to define the early meta of Set 6. Stay tuned as we reveal more characters from the San Fransokyo lineup in the coming weeks!",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop",
    category: "Expansion",
    slug: "big-hero-6-spotlight"
  },
  {
    id: "5",
    title: "The Legends of Set 1: High-Stakes Glimmers",
    date: "2024-10-22",
    excerpt: "Revisiting the most impactful cards from The First Chapter and why they still dominate.",
    content: "Even with many new expansions on the horizon, the foundation laid by 'The First Chapter' remains unshakable. \n\n[[feature:crd_4962196e0306474a8191dc8624c1b7ef|left]] \n\nThe most fearsome presence in any Ruby deck is undoubtedly [[card:crd_4962196e0306474a8191dc8624c1b7ef]], whose ability to banish any opposing character upon entry turns the tide of any game instantly. \n\nMid-range strategies still bow to the pure power of [[card:crd_23bbbd44361b4dcf9942bd281212a613]], a card that offers consistent board control and pressure. Meanwhile, Sapphire enthusiasts continue to find value in the utility provided by [[card:crd_d9f3b86af85f48579ed9d0d7ce0de129]], proving that Set 1 glimmers are built to last. \n\nWhether you are a new Illumineer or a veteran, mastering these classic cards is essential for any competitive play.",
    imageUrl: "https://images.unsplash.com/photo-1610818812904-7404b0dc20d5?q=80&w=2070&auto=format&fit=crop",
    category: "Community",
    slug: "set-1-legends"
  }
];
