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
      title = `Lorcana Deck Builder | Create & Export Decks | ${siteName}`;
      description = "The ultimate Lorcana Deck Builder. Create, test, and export your decks.";
    } else if (location === "/decks") {
      title = `My Decks | ${siteName}`;
      description = "Manage your personal library of Disney Lorcana decks.";
    } else if (location === "/public-decks") {
      title = `Community Decks | Top Lorcana Deck Lists | ${siteName}`;
      description = "Discover the latest top-performing Lorcana decks and tournament winning lists from the community.";
    } else if (location === "/wishlist") {
      title = `My Wishlist | Lorcana Collection Goals | ${siteName}`;
      description = "Track the cards you need to complete your collection and monitor their market value.";
    } else if (location === "/sets") {
      title = `Lorcana Collection Tracker | Set Completion | ${siteName}`;
      description = "Track your collection completion across every Lorcana set. See your progress and missing cards.";
    } else if (location.startsWith("/sets/")) {
      const setId = location.split("/")[2]?.split("?")[0];
      const set = sets.find(s => s.id === setId);
      if (set) {
        title = `${set.name} Checklist | Lorcana Collection Tracker | ${siteName}`;
        description = `Browse the full ${set.name} card list. Track your pulls and monitor set completion percentage.`;
      }
    } else if (location === "/resources") {
      title = `Lorcana Resources & Tools | ${siteName}`;
      description = "Official rules, community tools, and essential links for every Lorcana Illumineer.";
    } else if (location === "/academy") {
      title = `Inkbound Academy | Learn Disney Lorcana | ${siteName}`;
      description = "Master the Great Illuminary with our comprehensive guide to rules, ink theory, and competitive play.";
    } else if (location.startsWith("/decks/")) {
      title = `Deck Details | Lorcana Deck Builder | ${siteName}`;
      description = "View deck composition, ink distribution, and card analysis for this Disney Lorcana deck.";
    } else if (location.startsWith("/cards/")) {
      title = `Card Details | Lorcana Collection Tracker | ${siteName}`;
      description = "View card stats, market prices, and set information for this Disney Lorcana card.";
    } else if (location.startsWith("/profile/")) {
      const username = location.split("/")[2]?.split("?")[0];
      title = `${username}'s Illumineer Profile | ${siteName}`;
      description = `View ${username}'s Lorcana collection stats, achievements, and public decks on Lorbound.`;
    } else if (location === "/login") {
      title = `Sign In | ${siteName}`;
      description = "Sign in to Lorbound to manage your Lorcana collection and decks.";
    } else if (location === "/about") {
      title = `About Lorbound | The Ultimate Lorcana Toolkit`;
      description = "Learn more about the team behind Lorbound and our mission to provide the best tools for the Lorcana community.";
    } else if (location === "/privacy") {
      title = `Privacy Policy | ${siteName}`;
      description = "Your privacy matters. Read about how we handle your data on Lorbound.";
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
