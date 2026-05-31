import StoreViewerShell from "@/components/store-viewer/StoreViewerShell";
import OptimizedStoreRenderer from "@/components/store-viewer/OptimizedStoreRenderer";
import type { UxChange } from "@/lib/ux-optimizer-service";
import type { DetectedSection } from "@/lib/store-capture-service";

interface StoreMockupSlideProps {
  variant: "current" | "optimized";
  changes?: UxChange[];
  className?: string;
  screenshot?: string | null;
  detectedSections?: DetectedSection[];
  variationStyle?: "trust" | "urgency" | "content" | "minimal" | "default";
}

export default function StoreMockupSlide({
  variant,
  changes,
  className,
  screenshot,
  detectedSections,
  variationStyle = "default",
}: StoreMockupSlideProps) {
  const viewerVariant = variant === "current" ? "original" : "optimized";

  return (
    <StoreViewerShell variant={viewerVariant} className={className}>
      <OptimizedStoreRenderer
        variant={viewerVariant}
        changes={changes}
        screenshot={screenshot}
        variationStyle={variationStyle}
      />
    </StoreViewerShell>
  );
}
