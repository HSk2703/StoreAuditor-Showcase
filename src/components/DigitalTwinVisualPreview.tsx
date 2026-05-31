import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles, Zap, Layers, ArrowLeftRight,
} from "lucide-react";
import type { SimulatedChange } from "@/lib/digital-twin-service";
import StoreViewerShell from "@/components/store-viewer/StoreViewerShell";
import OptimizedStoreRenderer from "@/components/store-viewer/OptimizedStoreRenderer";
import type { DetectedSection } from "@/lib/store-capture-service";

interface DigitalTwinVisualPreviewProps {
  changes?: SimulatedChange[];
  storeName?: string;
  screenshot?: string | null;
  detectedSections?: DetectedSection[];
}

export default function DigitalTwinVisualPreview({
  changes = [],
  storeName = "Your Store",
  screenshot,
  detectedSections = [],
}: DigitalTwinVisualPreviewProps) {
  const [viewMode, setViewMode] = useState<"sideBySide" | "toggle">("sideBySide");
  const [showOriginal, setShowOriginal] = useState(false);

  const changedCount = changes.length;

  // Map SimulatedChange → UxChange format
  const uxChanges = changes.map(c => ({
    area: c.area || "",
    current: c.current_state || "",
    proposed: c.proposed_state || "",
    rationale: c.rationale || "",
    predicted_impact: c.change_title || "",
  }));

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
          <Button
            variant={viewMode === "sideBySide" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-[10px] gap-1 px-2.5"
            onClick={() => setViewMode("sideBySide")}
          >
            <Layers className="h-3 w-3" /> Side by Side
          </Button>
          <Button
            variant={viewMode === "toggle" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-[10px] gap-1 px-2.5"
            onClick={() => setViewMode("toggle")}
          >
            <ArrowLeftRight className="h-3 w-3" /> Toggle
          </Button>
        </div>

        <div className="ml-auto">
          {changedCount > 0 && (
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary gap-1 bg-primary/5">
              <Zap className="h-2.5 w-2.5" /> {changedCount} AI improvements applied
            </Badge>
          )}
        </div>
      </div>

      {/* Toggle mode */}
      {viewMode === "toggle" && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={showOriginal ? "outline" : "default"}
              size="sm"
              className="text-[10px] gap-1"
              onClick={() => setShowOriginal(false)}
            >
              <Sparkles className="h-3 w-3" /> AI Twin
            </Button>
            <Button
              variant={showOriginal ? "default" : "outline"}
              size="sm"
              className="text-[10px] gap-1"
              onClick={() => setShowOriginal(true)}
            >
              Original
            </Button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={showOriginal ? "original" : "twin"}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <StoreViewerShell variant={showOriginal ? "original" : "twin"}>
                <OptimizedStoreRenderer
                  variant={showOriginal ? "original" : "twin"}
                  changes={uxChanges}
                  screenshot={screenshot}
                  storeName={storeName}
                />
              </StoreViewerShell>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Side by side mode */}
      {viewMode === "sideBySide" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Store */}
          <div>
            <p className="text-[10px] text-muted-foreground text-center mb-2 font-semibold uppercase tracking-widest">
              {storeName} — Current
            </p>
            <StoreViewerShell variant="original">
              <OptimizedStoreRenderer
                variant="original"
                screenshot={screenshot}
                storeName={storeName}
              />
            </StoreViewerShell>
          </div>

          {/* AI Twin */}
          <div>
            <p className="text-[10px] text-primary text-center mb-2 font-semibold uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" /> {storeName} — AI Twin
            </p>
            <StoreViewerShell variant="twin">
              <OptimizedStoreRenderer
                variant="twin"
                changes={uxChanges}
                screenshot={screenshot}
                storeName={storeName}
              />
            </StoreViewerShell>
          </div>
        </div>
      )}

      {/* Change annotations */}
      {changedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          {changes.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, borderColor: "hsl(var(--primary) / 0.4)" }}
              className="flex items-center gap-2.5 rounded-lg border border-primary/15 bg-primary/[0.03] backdrop-blur-sm p-2.5 transition-all"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-foreground truncate">{c.area}</p>
                <p className="text-[9px] text-muted-foreground truncate">{c.change_title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
