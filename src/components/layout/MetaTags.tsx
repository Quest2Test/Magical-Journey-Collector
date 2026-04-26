import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAllCards, useSets } from "@/hooks/useCards";

export function MetaTags() {
  const [location] = useLocation();
  const { data: allCards = [] } = useAllCards();
  const { data: sets = [] } = useSets();

  useEffect(() => {
    const siteName = "Lorbound";
    let title = siteName;
    let description = "Lorbound is the ultimate Lorcana Deck Builder and Lorcana Collection Tracker. Discover cards, build competitive decks, track your collection.";
    let ogImage = "/opengraph.jpg"; // Default fallback

    // Map routes to titles/descriptions
    if (location === "/") {
      title = `${siteName} | Lorcana Deck Builder & Collection Tracker`;
    } else if (location === "/cards") {
      title = `Card Database | ${siteName}`;
      description = "Browse every Disney Lorcana card with real-time pricing and collection tracking.";
    } else if (location.startsWith("/cards/")) {
      const cardId = location.split("/")[2]?.split("?")[0];
      const card = allCards.find(c => c.id === cardId);
      if (card) {
        title = `${card.name}${card.subtitle ? ` - ${card.subtitle}` : ""} | ${siteName}`;
        description = `View details for ${card.name} from ${card.set}. Check market prices, ink color, and abilities.`;
        if (card.image) ogImage = card.image;
      }
    } else if (location === "/builder") {
      title = `Lorcana Deck Builder | ${siteName}`;
      description = "Create and optimize your Lorcana decks with the ultimate Lorcana Deck Builder.";
    } else if (location === "/decks") {
      title = `Community Decks | ${siteName}`;
      description = "Discover the latest top-performing Lorcana decks from the community.";
    } else if (location === "/meta") {
      title = `Meta Analysis | ${siteName}`;
      description = "Stay ahead of the game with our deep-dive analysis of the competitive Lorcana meta.";
    } else if (location === "/sets") {
      title = `Lorcana Collection Tracker | ${siteName}`;
      description = "Track your collection completion across every Lorcana set with our Lorcana Collection Tracker.";
    } else if (location.startsWith("/sets/")) {
      const setId = location.split("/")[2]?.split("?")[0];
      const set = sets.find(s => s.id === setId);
      if (set) {
        title = `${set.name} Complete Set List | ${siteName}`;
        description = `Browse all cards in the ${set.name} expansion and track your set completion percentage.`;
      }
    } else if (location === "/resources") {
      title = `Expert Resources & Tools | ${siteName}`;
      description = "Essential links, official rules, and community tools for every Lorcana Illumineer.";
    } else if (location === "/academy") {
      title = `Inkbound Academy | Learn Lorcana`;
      description = "Master the Great Illuminary with our comprehensive guide to rules, ink theory, and competitive play.";
    } else if (location.startsWith("/profile/")) {
      const username = location.split("/")[2]?.split("?")[0];
      title = `${username}'s Profile | ${siteName}`;
      description = `View ${username}'s Lorcana collection, stats, and achievements on Lorbound.`;
    }

    // Update Main Title
    document.title = title;

    // Helper for Meta Tags
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        if (property) element.setAttribute("property", name);
        else element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin + location);

    updateMeta("description", description);
    
    // Open Graph
    updateMeta("og:title", title, true);
    updateMeta("og:description", description, true);
    updateMeta("og:image", ogImage, true);
    updateMeta("og:url", window.location.href, true);
    updateMeta("og:type", "website", true);
    
    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);

    // JSON-LD Structured Data
    let jsonLdScript = document.querySelector('#json-ld-seo');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = "json-ld-seo";
      jsonLdScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(jsonLdScript);
    }

    let schema: any = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": window.location.origin,
      "description": description
    };

    // Card Specific Schema
    if (location.startsWith("/cards/")) {
      const cardId = location.split("/")[2]?.split("?")[0];
      const card = allCards.find(c => c.id === cardId);
      if (card) {
        schema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": card.name,
          "image": card.image,
          "description": `${card.name} - ${card.subtitle}. A ${card.rarity} card from ${card.set}.`,
          "brand": {
            "@type": "Brand",
            "name": "Disney Lorcana"
          }
        };
      }
    }

    jsonLdScript.textContent = JSON.stringify(schema);

  }, [location, allCards, sets]);

  return null;
}
