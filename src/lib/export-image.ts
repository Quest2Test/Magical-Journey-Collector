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
}

export const buildDeckExportImage = async ({
  deckCards,
  deckName,
  format,
  totalCards,
  totalValue,
  shareColumns,
  inkDistribution,
  formatPrice
}: ExportImageParams): Promise<Blob | null> => {
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      const normalizedSrc = src.includes('cards.lorcast.io')
        ? `/api/image-proxy?url=${encodeURIComponent(src)}`
        : src;
      const finalSrc = normalizedSrc.startsWith('http') || normalizedSrc.startsWith('data:')
        ? normalizedSrc
        : `${window.location.origin}${normalizedSrc.startsWith('/') ? '' : '/'}${normalizedSrc}`;
      img.src = finalSrc;
    });

  // Determine Background Gradient based on active inks
  const activeInksList = Object.keys(inkDistribution);
  let color1 = '#7c3aed';
  let color2 = '#0ea5e9';

  if (activeInksList.length === 1 && inkHexColors[activeInksList[0] as keyof typeof inkHexColors]) {
    const inkColor = inkHexColors[activeInksList[0] as keyof typeof inkHexColors] as string;
    color1 = inkColor;
    color2 = '#0f172a'; // Fade to dark
  } else if (activeInksList.length >= 2) {
    color1 = inkHexColors[activeInksList[0] as keyof typeof inkHexColors] as string || color1;
    color2 = inkHexColors[activeInksList[1] as keyof typeof inkHexColors] as string || color2;
  }

  const gridCards = deckCards;
  
  // Layout Math
  const width = 1400;
  const padding = 60;
  const gap = 16;
  const availableWidthForGrid = width - padding * 2;
  const cardWidth = (availableWidthForGrid - (shareColumns - 1) * gap) / shareColumns;
  const cardHeight = cardWidth * (3.5 / 2.5); // Standard TCG aspect ratio

  const rows = Math.ceil(gridCards.length / shareColumns);
  const gridHeight = rows * cardHeight + (rows > 0 ? rows - 1 : 0) * gap;
  
  const topSectionHeight = 180;
  const bottomSectionHeight = 80;
  const height = topSectionHeight + gridHeight + bottomSectionHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Draw Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);
  
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.65;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  // Draw Header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(deckName || 'Untitled Deck', padding, 50);

  ctx.font = '24px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`${format} Format · ${totalCards} cards · ${formatPrice(totalValue)}`, padding, 125);

  // Draw Logo (Top Right)
  const logo = await loadImage('/LorBound_Logo.webp');
  if (logo) {
    const logoHeight = 45;
    const logoWidth = logo.width * (logoHeight / logo.height);
    const logoX = width - padding - logoWidth;
    const logoY = 55;
    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
  }

  const gridX = padding;
  const gridY = topSectionHeight;

  // Load Images
  const previewCells = (await Promise.allSettled(
    gridCards.map(async entry => {
      const src = entry.card.image || entry.card.thumbnail || getInkLogo(entry.card.inkColor);
      const image = await loadImage(src);
      return { entry, image };
    })
  ))
    .filter((r): r is PromiseFulfilledResult<{ entry: typeof gridCards[0]; image: HTMLImageElement | null }> => r.status === 'fulfilled')
    .map(r => r.value);

  // Draw Cards
  previewCells.forEach(({ entry, image }, index) => {
    const col = index % shareColumns;
    const row = Math.floor(index / shareColumns);
    const x = gridX + col * (cardWidth + gap);
    const y = gridY + row * (cardHeight + gap);

    const radius = 12; // Rounded corners for authentic card look
    
    // Define the rounded rectangle path
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + cardWidth - radius, y);
    ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radius);
    ctx.lineTo(x + cardWidth, y + cardHeight - radius);
    ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - radius, y + cardHeight);
    ctx.lineTo(x + radius, y + cardHeight);
    ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    // Card Background (fills the rounded rect)
    ctx.fillStyle = inkHexColors[entry.card.inkColor as keyof typeof inkHexColors] ?? '#888';
    ctx.fill();

    // Card Image
    if (image) {
      try {
        ctx.save();
        ctx.clip(); // Clip to rounded corners
        
        // Implement object-fit: cover logic to prevent stretching
        const imgAspect = image.width / image.height;
        const canvasAspect = cardWidth / cardHeight;
        let drawWidth = cardWidth;
        let drawHeight = cardHeight;
        let drawX = x;
        let drawY = y;
        
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas
          drawWidth = cardHeight * imgAspect;
          drawX = x - (drawWidth - cardWidth) / 2;
        } else {
          // Image is taller than canvas (or square)
          drawHeight = cardWidth / imgAspect;
          drawY = y - (drawHeight - cardHeight) / 2;
        }
        
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      } catch {
        // fallback handled by rect fill above
      }
    }

    // Card Border/Shadow (strokes the rounded rect)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Quantity Badge (Sleek Circle in Top Right)
    const badgeRadius = 22;
    const badgeX = x + cardWidth - badgeRadius - 8;
    const badgeY = y + badgeRadius + 8;
    
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Adjust text rendering slightly down for perfect visual centering
    ctx.fillText(entry.qty.toString(), badgeX, badgeY + 2);
  });

  // Draw Footer - Lorbound Logo in top right replaces text footer

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  );

  if (blob) {
    return blob;
  }

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch {
    return null;
  }
};
