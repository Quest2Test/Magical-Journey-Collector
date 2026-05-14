import { useState, useEffect, useRef } from "react";
import { buildDeckExportImage, ExportImageParams } from "@/lib/export-image";

export function useImageExport(params: Partial<ExportImageParams> & { active: boolean }) {
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const {
    active,
    deckCards,
    deckName,
    format,
    totalCards,
    totalValue,
    shareColumns,
    inkDistribution,
    formatPrice,
    showFormat,
    showCount,
    showValue,
    showQRCode,
    deckUrl
  } = params;

  const [aspectRatio, setAspectRatio] = useState<"standard" | "square">("standard");

  useEffect(() => {
    if (!active || !deckCards || !formatPrice || !inkDistribution) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setSharePreviewUrl(null);
      return;
    }

    let isMounted = true;
    setIsGeneratingPreview(true);
    setPreviewError(null);

    const generatePreview = async () => {
      try {
        const blob = await buildDeckExportImage({
          deckCards,
          deckName: deckName || "Untitled Deck",
          format: format || "Any",
          totalCards: totalCards || 0,
          totalValue: totalValue || 0,
          shareColumns: shareColumns || 8,
          inkDistribution,
          formatPrice,
          showFormat: showFormat ?? true,
          showCount: showCount ?? true,
          showValue: showValue ?? true,
          showQRCode: showQRCode ?? false,
          deckUrl,
          aspectRatio,
        });

        if (blob && isMounted) {
          const url = URL.createObjectURL(blob);
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
          }
          previewUrlRef.current = url;
          setSharePreviewUrl(url);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to generate preview:", err);
          setPreviewError("Failed to generate the preview image.");
        }
      } finally {
        if (isMounted) setIsGeneratingPreview(false);
      }
    };

    const timeoutId = setTimeout(generatePreview, 300); // Debounce to prevent too many generations

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    active,
    deckName,
    format,
    totalCards,
    totalValue,
    shareColumns,
    showFormat,
    showCount,
    showValue,
    showQRCode,
    aspectRatio,
    // Use stringified versions for stable dependency checking of complex objects
    JSON.stringify(deckCards),
    JSON.stringify(inkDistribution),
    deckUrl
  ]);

  const handleDownload = () => {
    if (!sharePreviewUrl) return;
    const link = document.createElement('a');
    link.href = sharePreviewUrl;
    link.download = `${deckName?.replace(/\s+/g, '_') || 'deck'}_lorbound.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    sharePreviewUrl,
    isGeneratingPreview,
    previewError,
    handleDownload,
    aspectRatio,
    setAspectRatio
  };
}
