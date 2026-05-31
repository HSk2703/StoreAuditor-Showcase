import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Copy, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareableScorecard from "./ShareableScorecard";
import { toast } from "@/hooks/use-toast";

interface ScorecardActionsProps {
  auditId: string;
  storeUrl: string;
  overallScore: number;
  scores: {
    homepage: number | null;
    productPages: number | null;
    trustSignals: number | null;
    mobileExperience: number | null;
    seo: number | null;
  };
  date: string;
}

const ScorecardActions = ({ auditId, storeUrl, overallScore, scores, date }: ScorecardActionsProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${auditId}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `scorecard-${storeUrl.replace(/[^a-z0-9]/gi, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast({ title: "Download failed", description: "Could not generate image.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleShare = () => {
    const text = `Check out this Store Auditor scorecard: ${overallScore}/100 for ${storeUrl}`;
    if (navigator.share) {
      navigator.share({ title: "Store Auditor Scorecard", text, url: shareUrl }).catch(() => {});
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Scorecard (visible for capture) */}
      <div className="mb-6 overflow-hidden rounded-2xl">
        <ShareableScorecard
          ref={cardRef}
          storeUrl={storeUrl}
          overallScore={overallScore}
          scores={scores}
          date={date}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handleDownload} disabled={downloading} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {downloading ? "Generating…" : "Download Scorecard"}
        </Button>
        <Button onClick={handleCopyLink} variant="outline" className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Share Link"}
        </Button>
        <Button onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share on Social
        </Button>
      </div>
    </div>
  );
};

export default ScorecardActions;
