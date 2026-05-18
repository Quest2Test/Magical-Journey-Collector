import { inkHexColors, getInkLogo } from "@/components/ui/card-display";
import { Card } from "@/data/cards";
import QRCode from 'qrcode';
import { getDeckArchetype } from "./card-utils";

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
  showQRCode?: boolean;
  deckUrl?: string;
  aspectRatio?: "standard" | "square";
  customArchetype?: string;
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
  showValue = true,
  showQRCode = false,
  deckUrl,
  aspectRatio = "standard",
  customArchetype
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
  const isSquare = aspectRatio === "square";
  const contentWidth = isSquare ? 1080 : 1440;
  const padding = isSquare ? 30 : 60;
  const gap = isSquare ? 10 : 16;
  const gridColumns = isSquare ? 6 : shareColumns;

  const availableWidthForGrid = contentWidth - padding * 2;
  let cardWidth = (availableWidthForGrid - (gridColumns - 1) * gap) / gridColumns;
  let cardHeight = cardWidth * (3.5 / 2.5);

  const rows = Math.ceil(deckCards.length / gridColumns);

  // Header Box Bounds
  const headerY = isSquare ? 30 : 50;
  const headerHeight = isSquare ? 115 : 160;
  const headerBottom = headerY + headerHeight;

  // Grid Top Offset - anchored tightly below the header box!
  const gridOffsetY = headerBottom + (isSquare ? 20 : 30);
  const bottomSectionHeight = isSquare ? 80 : 120;

  if (isSquare) {
    const availableVerticalSpaceForGrid = 1080 - gridOffsetY - bottomSectionHeight;
    const gridHeightNeeded = rows * cardHeight + (rows - 1) * gap;
    if (gridHeightNeeded > availableVerticalSpaceForGrid) {
      cardHeight = (availableVerticalSpaceForGrid - (rows - 1) * gap) / rows;
      cardWidth = cardHeight * (2.5 / 3.5);
    }
  }

  const gridHeight = rows * cardHeight + (rows > 0 ? rows - 1 : 0) * gap;
  const contentHeight = gridOffsetY + gridHeight + bottomSectionHeight;

  let canvasWidth = contentWidth;
  let canvasHeight = isSquare ? 1080 : contentHeight;

  // Content Offsets for centering
  const contentOffsetX = (canvasWidth - contentWidth) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Draw Base Background (Dark Slate)
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Draw Blurred Card Mosaic (The "WOW" factor)
  const mosaicCards = [...deckCards].sort(() => 0.5 - Math.random()).slice(0, 8);
  const mosaicImages = await Promise.all(mosaicCards.map(c => loadImage(c.card.image || c.card.thumbnail || "")));

  ctx.save();
  ctx.filter = 'blur(60px) saturate(1.5) brightness(0.4)';
  mosaicImages.forEach((img, i) => {
    if (img) {
      const x = (i % 4) * (canvasWidth / 4) - 100;
      const y = Math.floor(i / 4) * (canvasHeight / 2) - 100;
      const size = Math.max(canvasWidth, canvasHeight) / 2;
      ctx.drawImage(img, x, y, size, size * (img.height / img.width));
    }
  });
  ctx.restore();

  // 3. Draw Gradient Overlay for depth
  const grad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, canvasWidth);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.1)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 4. Header Section - Glassmorphism Card

  // Header Glass Background
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.beginPath();
  ctx.roundRect(padding - 20 + contentOffsetX, headerY, contentWidth - padding * 2 + 40, headerHeight, isSquare ? 20 : 32);
  ctx.fill();

  // Subtle Highlighted Gradient Border
  const borderGrad = ctx.createLinearGradient(padding - 20 + contentOffsetX, headerY, contentWidth - padding * 2 + contentOffsetX, headerY);
  borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');

  if (activeInksList.length > 0) {
    activeInksList.forEach((ink, i) => {
      const color = INK_HEX_COLORS[ink] || '#ffffff';
      const pos = 0.2 + (i * 0.6 / Math.max(1, activeInksList.length - 1));
      borderGrad.addColorStop(pos, color + '88');
    });
  } else {
    borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  }

  borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Ink Logos in Header
  let currentInkX = padding + 10 + contentOffsetX;
  const inkLogoSize = isSquare ? 32 : 45;
  const inkLogoSpacing = isSquare ? 42 : 60;
  const inkLogoY = isSquare ? headerY + 25 : headerY + 45;

  for (const ink of activeInksList) {
    const inkLogo = await loadImage(getInkLogo(ink));
    if (inkLogo) {
      const inkColor = INK_HEX_COLORS[ink] || '#fff';

      ctx.save();
      const haloGrad = ctx.createRadialGradient(currentInkX + inkLogoSize/2, inkLogoY + inkLogoSize/2, 0, currentInkX + inkLogoSize/2, inkLogoY + inkLogoSize/2, isSquare ? 25 : 35);
      haloGrad.addColorStop(0, inkColor + '44');
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(currentInkX + inkLogoSize/2, inkLogoY + inkLogoSize/2, isSquare ? 25 : 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = inkColor + '88';
      ctx.shadowBlur = 15;
      ctx.drawImage(inkLogo, currentInkX, inkLogoY, inkLogoSize, inkLogoSize);
      ctx.restore();
      currentInkX += inkLogoSpacing;
    }
  }

  // Deck Name in beautiful Ink Gradient
  const nameX = activeInksList.length > 0 ? currentInkX + 10 : padding + 10 + contentOffsetX;
  const nameY = isSquare ? headerY + 41 : headerY + 68;
  
  ctx.font = isSquare ? 'bold 36px "Outfit", "Inter", sans-serif' : 'bold 56px "Outfit", "Inter", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const nameText = deckName || 'Untitled Deck';
  const nameWidth = ctx.measureText(nameText).width;
  const nameGrad = ctx.createLinearGradient(nameX, 0, nameX + nameWidth, 0);

  const INK_GRADIENT_COLORS: Record<string, string> = {
    Amber: "#f59e0b",
    Amethyst: "#9333ea",
    Emerald: "#10b981",
    Ruby: "#ef4444",
    Sapphire: "#3b82f6",
    Steel: "#94a3b8",
  };

  if (activeInksList.length > 0) {
    if (activeInksList.length === 1) {
      const inkColor = INK_GRADIENT_COLORS[activeInksList[0]] || '#ffffff';
      nameGrad.addColorStop(0, '#ffffff');
      nameGrad.addColorStop(0.3, inkColor);
      nameGrad.addColorStop(1, inkColor);
    } else {
      const color1 = INK_GRADIENT_COLORS[activeInksList[0]] || '#ffffff';
      const color2 = INK_GRADIENT_COLORS[activeInksList[1]] || '#ffffff';
      nameGrad.addColorStop(0, color1);
      nameGrad.addColorStop(1, color2);
    }
  } else {
    nameGrad.addColorStop(0, '#ffffff');
    nameGrad.addColorStop(1, '#94a3b8');
  }

  ctx.fillStyle = nameGrad;
  ctx.fillText(nameText, nameX, nameY);

  // Stats Pills
  ctx.font = isSquare ? '600 12px "Outfit", "Inter", sans-serif' : '600 18px "Outfit", "Inter", sans-serif';
  let statsX = padding + 10 + contentOffsetX;
  const statsY = isSquare ? headerY + 85 : headerY + 115;
  const parts = [];
  const arch = customArchetype || getDeckArchetype(deckCards);
  if (arch) parts.push({ label: arch.toUpperCase(), color: '#10b981' });
  if (showFormat) parts.push({ label: format.toUpperCase(), color: '#94a3b8', isMuted: true });
  if (showCount) parts.push({ label: `${totalCards} CARDS`, color: '#94a3b8' });
  if (showValue) parts.push({ label: formatPrice(totalValue), color: '#f59e0b' });

  parts.forEach(p => {
    const textWidth = ctx.measureText(p.label).width;
    const pillPadX = isSquare ? 10 : 16;
    const pillHeight = isSquare ? 22 : 30;
    const pillWidth = textWidth + pillPadX * 2;

    ctx.fillStyle = p.isMuted ? 'rgba(148,163,184,0.1)' : 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.roundRect(statsX, statsY - pillHeight/2, pillWidth, pillHeight, pillHeight/2);
    ctx.fill();

    ctx.fillStyle = p.color;
    ctx.fillText(p.label, statsX + pillPadX, statsY);
    statsX += pillWidth + (isSquare ? 8 : 12);
  });

  // Logo in Header (Right)
  const logo = await loadImage('/LorBound_Logo.webp');
  if (logo) {
    const logoH = isSquare ? 32 : 50;
    const logoW = logo.width * (logoH / logo.height);
    ctx.drawImage(logo, contentWidth - padding - logoW - 10 + contentOffsetX, isSquare ? headerY + 25 : headerY + 55, logoW, logoH);
  }

  // 5. Grid Drawing
  const gridX = padding + contentOffsetX;
  const gridY = gridOffsetY;

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
    const col = index % gridColumns;
    const row = Math.floor(index / gridColumns);

    const totalCells = previewCells.length;
    const lastRowStartIndex = Math.floor((totalCells - 1) / gridColumns) * gridColumns;
    const isLastRow = index >= lastRowStartIndex;
    const cardsInThisRow = isLastRow ? (totalCells - lastRowStartIndex) : gridColumns;

    const rowWidth = cardsInThisRow * cardWidth + (cardsInThisRow - 1) * gap;
    const rowOffsetX = (availableWidthForGrid - rowWidth) / 2;

    const x = gridX + rowOffsetX + col * (cardWidth + gap);
    const y = gridY + row * (cardHeight + gap);

    // Card Glow
    ctx.save();
    ctx.shadowColor = (INK_HEX_COLORS[entry.card.inkColor] || '#888') + '33';
    ctx.shadowBlur = 20;

    const radius = 14;
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, radius);

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

    // Card Name Legibility Overlay
    const overlayHeight = isSquare ? 32 : 36;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y + cardHeight - overlayHeight, cardWidth, overlayHeight, [0, 0, 14, 14]);
    ctx.clip();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(x, y + cardHeight - overlayHeight, cardWidth, overlayHeight);

    ctx.fillStyle = '#ffffff';
    const labelFontSize = isSquare ? 11 : 13;
    ctx.font = `bold ${labelFontSize}px "Outfit", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let displayName = entry.card.name;
    if (ctx.measureText(displayName).width > cardWidth - 12) {
      while (displayName.length > 5 && ctx.measureText(displayName + '...').width > cardWidth - 12) {
        displayName = displayName.substring(0, displayName.length - 1);
      }
      displayName += '...';
    }

    ctx.fillText(displayName.toUpperCase(), x + cardWidth / 2, y + cardHeight - overlayHeight / 2);
    ctx.restore();

    // Quantity Badge
    const bR = isSquare ? 18 : 24;
    const bX = x + cardWidth - bR - 8;
    const bY = y + bR + 8;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.arc(bX, bY, bR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = (INK_HEX_COLORS[entry.card.inkColor] || '#fff') + 'aa';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = isSquare ? 'bold 18px "Outfit", sans-serif' : 'bold 24px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(entry.qty.toString(), bX, bY + 1);
    ctx.restore();
  });

  // 6. Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.font = isSquare ? '500 11px "Outfit", sans-serif' : '500 14px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('© DISNEY / RAVENSBURGER · ALL IMAGES PROTECTED', padding + contentOffsetX, canvasHeight - padding - 6);

  // 7. QR Code (Stylized with Logo)
  if (showQRCode && deckUrl) {
    try {
      const qrSize = isSquare ? 80 : 110;
      const qrPadding = isSquare ? 8 : 10;
      const qrX = contentWidth - padding - qrSize + contentOffsetX;
      const qrY = canvasHeight - padding - qrSize - qrPadding;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX - qrPadding, qrY - qrPadding, qrSize + qrPadding * 2, qrSize + qrPadding * 2, 14);
      ctx.fill();
      ctx.restore();

      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, deckUrl, {
        width: qrSize,
        margin: 0,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H'
      });

      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      const qrLogo = await loadImage('/Lorbound_B.png');
      if (qrLogo) {
        const logoSize = qrSize * 0.28;
        const lx = qrX + (qrSize - logoSize) / 2;
        const ly = qrY + (qrSize - logoSize) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lx + logoSize/2, ly + logoSize/2, logoSize/2 + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(qrLogo, lx, ly, logoSize, logoSize);
      }
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  }

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95)
  );

  return blob;
};

