import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Trophy, Sparkles, ArrowUpRight,
  ArrowDownRight, Minus, Layers, Eye, Camera,
} from "lucide-react";
import type { UxVariation } from "@/lib/ux-optimizer-service";
import type { DetectedSection } from "@/lib/store-capture-service";
import StoreMockupSlide from "./StoreMockupSlide";

/* ── Metric Pill ── */
const MetricPill = ({ label, value, suffix = "", invert = false }: { label: string; value: number; suffix?: string; invert?: boolean }) => {
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = value === 0;
  return (
    <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-muted/50 border border-border/30">
      <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
      <span className={cn(
        "text-[10px] font-bold flex items-center gap-0.5",
        isPositive ? "text-emerald-500" : isNeutral ? "text-muted-foreground" : "text-destructive"
      )}>
        {isPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : isNeutral ? <Minus className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
        {value > 0 ? "+" : ""}{value.toFixed(1)}{suffix}
      </span>
    </div>
  );
};

/* ── Variation Info Header ── */
function VariationHeader({ variation, activeIndex, bestIndex }: {
  variation: UxVariation;
  activeIndex: number;
  bestIndex: number;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            {activeIndex === bestIndex && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                <Trophy className="h-3 w-3" /> Best Pick
              </div>
            )}
            <h3 className="text-sm font-bold text-foreground">{variation?.name}</h3>
            <Badge variant="outline" className="text-[10px]">{variation?.confidence_score}% confidence</Badge>
          </div>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            variation?.implementation_effort === "low" ? "bg-emerald-500/10 text-emerald-600" :
            variation?.implementation_effort === "medium" ? "bg-amber-500/10 text-amber-600" :
            "bg-destructive/10 text-destructive"
          )}>
            {variation?.implementation_effort} effort
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{variation?.strategy}</p>
        <div className="flex flex-wrap gap-2">
          <MetricPill label="Conversion" value={variation?.predicted_metrics?.conversion_rate_change ?? 0} suffix="pp" />
          <MetricPill label="Bounce" value={variation?.predicted_metrics?.bounce_rate_change ?? 0} suffix="pp" invert />
          <MetricPill label="Cart Add" value={variation?.predicted_metrics?.cart_add_rate_change ?? 0} suffix="pp" />
          <MetricPill label="Overall Uplift" value={variation?.predicted_metrics?.overall_uplift_percentage ?? 0} suffix="%" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Changes Grid ── */
function ChangesGrid({ changes }: { changes: UxVariation["changes"] }) {
  if (!changes?.length) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {changes.map((change, ci) => (
        <motion.div
          key={ci}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: ci * 0.05 }}
          className="group relative rounded-lg border border-border/40 bg-card/60 backdrop-blur-sm p-3 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Badge variant="secondary" className="text-[9px]">{change.area}</Badge>
              <span className="text-[9px] text-primary font-bold">{change.predicted_impact}</span>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{change.proposed}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Infer variation style from name/strategy ── */
function inferVariationStyle(name: string, strategy: string): "trust" | "urgency" | "content" | "minimal" | "default" {
  const text = `${name} ${strategy}`.toLowerCase();
  if (text.includes("trust") || text.includes("review") || text.includes("social proof")) return "trust";
  if (text.includes("urgency") || text.includes("scarcity") || text.includes("driven")) return "urgency";
  if (text.includes("content") || text.includes("story") || text.includes("rich")) return "content";
  if (text.includes("minimal") || text.includes("clean")) return "minimal";
  return "default";
}

/* ── Main Slider ── */
interface VariationSliderProps {
  variations: UxVariation[];
  bestIndex: number;
  screenshot?: string | null;
  detectedSections?: DetectedSection[];
}

export default function VariationSlider({ variations, bestIndex, screenshot, detectedSections }: VariationSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "compare">("single");
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container || !container.children[0]) return;
    const slideWidth = container.children[0].getBoundingClientRect().width;
    const gap = 24;
    container.scrollTo({ left: index * (slideWidth + gap), behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isDragging.current || !container.children[0]) return;
    const slideWidth = container.children[0].getBoundingClientRect().width;
    const gap = 24;
    const idx = Math.round(container.scrollLeft / (slideWidth + gap));
    setActiveIndex(Math.min(idx, variations.length - 1));
  }, [variations.length]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    scrollStartX.current = containerRef.current?.scrollLeft ?? 0;
    document.body.style.userSelect = "none";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    containerRef.current.scrollLeft = scrollStartX.current - (e.clientX - dragStartX.current);
  };
  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.userSelect = "";
    handleScroll();
  };

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  const variation = variations[activeIndex];
  const hasRealScreenshot = !!screenshot;

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">AI Layout Variations</h2>
          <Badge variant="outline" className="text-[10px] border-primary/20 text-primary gap-1">
            <Sparkles className="h-2.5 w-2.5" /> {variations.length} variations
          </Badge>
          {hasRealScreenshot && (
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 gap-1 bg-emerald-500/5">
              <Camera className="h-2.5 w-2.5" /> Real Store UI
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-muted/30 border border-border/30">
            <Button
              variant={viewMode === "single" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-[10px] px-2.5"
              onClick={() => setViewMode("single")}
            >
              Variation
            </Button>
            <Button
              variant={viewMode === "compare" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-[10px] gap-1 px-2.5"
              onClick={() => setViewMode("compare")}
            >
              <Eye className="h-3 w-3" /> Compare
            </Button>
          </div>

          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={activeIndex === 0} onClick={() => scrollToIndex(activeIndex - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={activeIndex === variations.length - 1} onClick={() => scrollToIndex(activeIndex + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Variation info header */}
      <VariationHeader variation={variation} activeIndex={activeIndex} bestIndex={bestIndex} />

      {/* Current store shown once in compare mode */}
      {viewMode === "compare" && (
        <div className="mb-4">
          <p className="text-[10px] text-muted-foreground text-center mb-2 font-semibold uppercase tracking-wider">Current Store</p>
          <div className="max-w-[440px] mx-auto">
            <StoreMockupSlide variant="current" screenshot={screenshot} />
          </div>
        </div>
      )}

      {/* Variations carousel */}
      <div className="relative">
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none cursor-grab active:cursor-grabbing"
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          style={{ scrollbarWidth: "none" }}
        >
          {variations.map((v, i) => {
            const vStyle = inferVariationStyle(v.name, v.strategy);
            return (
              <div
                key={v.id || i}
                className="snap-center shrink-0"
                style={{ width: "min(90vw, 440px)" }}
              >
                <StoreMockupSlide
                  variant="optimized"
                  changes={v.changes}
                  screenshot={screenshot}
                  variationStyle={vStyle}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2">
        {variations.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === activeIndex
                ? "w-6 h-2 bg-primary shadow-lg shadow-primary/30"
                : "w-2 h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
            )}
          />
        ))}
      </div>

      {/* Changes list */}
      {variation && <ChangesGrid changes={variation.changes} />}
    </div>
  );
}
