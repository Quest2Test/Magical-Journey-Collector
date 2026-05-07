import { inkHexColors, getInkLogo } from "@/components/ui/card-display";
import { Card } from "@/data/cards";

export interface ExportImageParams {
  deckCards: { card: Card; qty: number }[];
  deckName: string;
  format: string;
  totalCards: number;
  totalValue: number;
  shareColumns: number;
  inkDistribution: Record<string, number>;
  formatPrice: (val: number) => string;
  showFormat?: boolean;
  showCount?: boolean;
  showValue?: boolean;
}

const INK_HEX_COLORS: Record<string, string> = {
  Amber: "#f59e0b",
  Amethyst: "#9333ea",
  Emerald: "#10b981",
  Ruby: "#ef4444",
  Sapphire: "#3b82f6",
  Steel: "#6b7280",
};

export const buildDeckExportImage = async ({
  deckCards,
  deckName,
  format,
  totalCards,
  totalValue,
  shareColumns,
  inkDistribution,
  formatPrice,
  showFormat = true,
  showCount = true,
  showValue = true
}: ExportImageParams): Promise<Blob | null> => {
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);

      const normalizedSrc = src.includes('cards.lorcast.io')
        ? `https://images.weserv.nl/?url=${encodeURIComponent(src)}`
        : src;

      const finalSrc = normalizedSrc.startsWith('http') || normalizedSrc.startsWith('data:')
        ? normalizedSrc
        : `${window.location.origin}${normalizedSrc.startsWith('/') ? '' : '/'}${normalizedSrc}`;
      img.src = finalSrc;
    });

  const activeInksList = Object.keys(inkDistribution);
  let color1 = '#1e1b4b'; // Deep Indigo
  let color2 = '#0f172a'; // Slate 950

  if (activeInksList.length > 0) {
    const firstInk = activeInksList[0];
    color1 = INK_HEX_COLORS[firstInk] || color1;

    if (activeInksList.length >= 2) {
      const secondInk = activeInksList[1];
      color2 = INK_HEX_COLORS[secondInk] || color2;
    }
  }

  // Layout Math
  const width = 1440; // Slightly wider for 2024 standards
  const padding = 80;
  const gap = 20;
  const availableWidthForGrid = width - padding * 2;
  const cardWidth = (availableWidthForGrid - (shareColumns - 1) * gap) / shareColumns;
  const cardHeight = cardWidth * (3.5 / 2.5);

  const rows = Math.ceil(deckCards.length / shareColumns);
  const gridHeight = rows * cardHeight + (rows > 0 ? rows - 1 : 0) * gap;

  const topSectionHeight = 260;
  const bottomSectionHeight = 120;
  const height = topSectionHeight + gridHeight + bottomSectionHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Draw Base Background (Dark Slate)
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Blurred Card Mosaic (The "WOW" factor)
  // We'll pick up to 6 cards to draw large and blurred in the background
  const mosaicCards = [...deckCards].sort(() => 0.5 - Math.random()).slice(0, 8);
  const mosaicImages = await Promise.all(mosaicCards.map(c => loadImage(c.card.image || c.card.thumbnail || "")));

  ctx.save();
  ctx.filter = 'blur(60px) saturate(1.5) brightness(0.4)';
  mosaicImages.forEach((img, i) => {
    if (img) {
      const x = (i % 4) * (width / 4) - 100;
      const y = Math.floor(i / 4) * (height / 2) - 100;
      const size = Math.max(width, height) / 2;
      ctx.drawImage(img, x, y, size, size * (img.height / img.width));
    }
  });
  ctx.restore();

  // 3. Draw Gradient Overlay for depth
  const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.1)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 4. Header Section - Glassmorphism Card
  const headerY = 50;
  const headerHeight = 160;
  
  // Header Glass Background
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.beginPath();
  ctx.roundRect(padding - 20, headerY, width - padding * 2 + 40, headerHeight, 32);
  ctx.fill();
  
  // Subtle Highlighted Gradient Border
  const borderGrad = ctx.createLinearGradient(padding - 20, headerY, width - padding * 2, headerY);
  borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Bright start
  
  if (activeInksList.length > 0) {
    activeInksList.forEach((ink, i) => {
      const color = INK_HEX_COLORS[ink] || '#ffffff';
      const pos = 0.2 + (i * 0.6 / Math.max(1, activeInksList.length - 1));
      borderGrad.addColorStop(pos, color + '88'); // Add each ink color with some transparency
    });
  } else {
    borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  }
  
  borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)'); // Soft end
  
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2; // Slightly thicker for visibility
  ctx.stroke();
  ctx.restore();

  // Ink Logos in Header
  let currentInkX = padding + 10;
  for (const ink of activeInksList) {
    const inkLogo = await loadImage(getInkLogo(ink));
    if (inkLogo) {
      const inkColor = INK_HEX_COLORS[ink] || '#fff';
      
      ctx.save();
      // Subtle Glow Halo behind the logo
      const haloGrad = ctx.createRadialGradient(currentInkX + 22, headerY + 67, 0, currentInkX + 22, headerY + 67, 35);
      haloGrad.addColorStop(0, inkColor + '44');
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(currentInkX + 22, headerY + 67, 35, 0, Math.PI * 2);
      ctx.fill();

      // Draw the logo itself
      ctx.shadowColor = inkColor + '88';
      ctx.shadowBlur = 15;
      ctx.drawImage(inkLogo, currentInkX, headerY + 45, 45, 45);
      ctx.restore();
      currentInkX += 60;
    }
  }

  // Deck Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px "Outfit", "Inter", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const nameX = activeInksList.length > 0 ? currentInkX + 10 : padding + 10;
  ctx.fillText(deckName || 'Untitled Deck', nameX, headerY + 68);

  // Stats Pills
  ctx.font = '600 18px "Outfit", "Inter", sans-serif';
  let statsX = padding + 10;
  const statsY = headerY + 115;
  const parts = [];
  if (showFormat) parts.push({ label: format.toUpperCase(), color: '#6366f1' });
  if (showCount) parts.push({ label: `${totalCards} CARDS`, color: '#94a3b8' });
  if (showValue) parts.push({ label: formatPrice(totalValue), color: '#f59e0b' });

  parts.forEach(p => {
    const textWidth = ctx.measureText(p.label).width;
    const pillPadding = 16;
    const pillWidth = textWidth + pillPadding * 2;
    
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.roundRect(statsX, statsY - 15, pillWidth, 30, 15);
    ctx.fill();
    
    ctx.fillStyle = p.color;
    ctx.fillText(p.label, statsX + pillPadding, statsY);
    statsX += pillWidth + 12;
  });

  // Logo in Header (Right)
  const logo = await loadImage('/LorBound_Logo.webp');
  if (logo) {
    const lH = 50;
    const lW = logo.width * (lH / logo.height);
    ctx.drawImage(logo, width - padding - lW - 10, headerY + 55, lW, lH);
  }

  // 5. Grid Drawing
  const gridX = padding;
  const gridY = topSectionHeight;

  const previewCells = (await Promise.allSettled(
    deckCards.map(async entry => {
      const src = entry.card.image || entry.card.thumbnail || getInkLogo(entry.card.inkColor);
      const image = await loadImage(src);
      return { entry, image };
    })
  ))
    .filter((r): r is PromiseFulfilledResult<{ entry: typeof deckCards[0]; image: HTMLImageElement | null }> => r.status === 'fulfilled')
    .map(r => r.value);

  previewCells.forEach(({ entry, image }, index) => {
    const col = index % shareColumns;
    const row = Math.floor(index / shareColumns);
    const x = gridX + col * (cardWidth + gap);
    const y = gridY + row * (cardHeight + gap);

    // Card Glow (Subtle atmosphere)
    ctx.save();
    ctx.shadowColor = (INK_HEX_COLORS[entry.card.inkColor] || '#888') + '33';
    ctx.shadowBlur = 20;
    
    const radius = 14;
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, radius);
    
    // Background fill for cards without images
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    if (image) {
      ctx.save();
      ctx.clip();
      
      const imgAspect = image.width / image.height;
      const canvasAspect = cardWidth / cardHeight;
      let dW = cardWidth, dH = cardHeight, dX = x, dY = y;

      if (imgAspect > canvasAspect) {
        dW = cardHeight * imgAspect;
        dX = x - (dW - cardWidth) / 2;
      } else {
        dH = cardWidth / imgAspect;
        dY = y - (dH - cardHeight) / 2;
      }
      ctx.drawImage(image, dX, dY, dW, dH);
      ctx.restore();
    }

    // Modern Border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Premium Quantity Badge (Glass Style)
    const bR = 24;
    const bX = x + cardWidth - bR - 10;
    const bY = y + bR + 10;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.arc(bX, bY, bR, 0, Math.PI * 2);
    ctx.fill();
    
    // Badge Accent Ring
    ctx.strokeStyle = (INK_HEX_COLORS[entry.card.inkColor] || '#fff') + 'aa';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(entry.qty.toString(), bX, bY + 2);
    ctx.restore();
  });

  // 6. Footer
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '500 16px "Outfit", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('DESIGNED ON LORBOUND.INK', width - padding, height - 50);

  ctx.textAlign = 'left';
  ctx.fillText('© DISNEY / RAVENSBURGER • ALL IMAGES PROTECTED', padding, height - 50);

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95)
  );

  return blob;
};

