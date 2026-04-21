# Glimmercast Content Management Guide

Welcome to the newsroom! This guide will help you manage the articles and announcements on Glimmercast.

## 1. Adding a New Article

All articles are stored in `src/data/news.ts`. To add a new post, follow these steps:

1.  Open `src/data/news.ts`.
2.  Add a new block to the `NEWS_POSTS` array.
3.  Fill in the fields:
    *   `id`: A unique numeric string (e.g., `"5"`).
    *   `title`: The headline.
    *   `date`: Format `YYYY-MM-DD`.
    *   `excerpt`: A short summary (2-3 sentences) for the card view.
    *   `content`: The full text of the article.
    *   `imageUrl`: Link to a high-quality image (horizontal works best).
    *   `category`: One of `'Expansion' | 'Community' | 'Update' | 'Tournament'`.
    *   `slug`: A URL-friendly version of the title (e.g., `"set-6-teaser"`).

## 2. Embedding Cards "Tastefully"

You can reference cards directly in your article text using a special code. The system will automatically generate a link and a **Side-Card Preview** on desktop.

### How to use:
Type `[[card:id]]` anywhere in your content.

*   **Example**: `We are excited to reveal [[card:ann-1]], the first legendary glimmer of the set!`
*   **Result**: The card name is highlighted and shows a preview in the side-margin on desktop.

### 3. Highlighting a "Chase Card" (Block Feature)
If you want to dedicate a large block to a specific card (like the "Prismari Charm" example), use the feature shortcode.

*   **Example**: `[[feature:crd_4962196e0306474a8191dc8624c1b7ef|right]]`
*   **Result**: Renders a large, side-by-side card feature block with the artwork on the right and metadata on the left.
*   **Alignment**: Use `|left` or `|right` to control the card positioning.

## 4. Managing "Announced" Cards

If you saw news about a card that isn't in the official Lorcana API yet, add it to `src/data/announced-cards.ts`.

1.  Add a entry to the `ANNOUNCED_CARDS` array using card IDs starting with `ann-` (e.g., `ann-1`).
2.  Once added, you can reference it in your news articles using `[[card:ann-1]]`.

## Pro Tips:
*   **Paragraphs**: Use a single newline for new paragraphs.
*   **Bold Text**: Use standard Markdown (e.g., `**important**`).
*   **Images**: Use high-resolution images for the `imageUrl` to ensure the hero section looks premium.
