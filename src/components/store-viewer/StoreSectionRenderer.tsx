import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ZoomIn, ZoomOut, Move, RotateCcw,
} from "lucide-react";
import type { DetectedSection } from "@/lib/store-capture-service";
import type { UxChange } from "@/lib/ux-optimizer-service";

/* ── Section improvement overlay ── */
function SectionAnnotation({ section, isImproved, improvementLabel, onClick }: {
  section: DetectedSection;
  isImproved: boolean;
  improvementLabel?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.3 + section.estimatedPosition * 0.005 }}
      className="absolute left-1/2 -translate-x-1/2 z-20 cursor-pointer group"
      style={{ top: `${section.estimatedPosition}%` }}
      onClick={onClick}
    >
      {isImproved ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-[8px] font-bold backdrop-blur-lg border border-primary/50 shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
          <Sparkles className="h-2.5 w-2.5" />
          <span>{improvementLabel || "AI Improved"}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 text-foreground/70 text-[7px] font-medium backdrop-blur-lg border border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
          {section.label}
        </div>
      )}

      {/* Glow line connecting to section */}
      {isImproved && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none"
          style={{ width: "200%" }}
        />
      )}
    </motion.div>
  );
}

/* ── Improvement highlight zones ── */
function ImprovementZone({ section, isActive }: { section: DetectedSection; isActive: boolean }) {
  if (!isActive) return null;

  const height = section.type === "hero" ? 20 :
                 section.type === "products" ? 25 :
                 section.type === "navigation" ? 5 :
                 section.type === "footer" ? 8 : 12;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{
        top: `${section.estimatedPosition}%`,
        height: `${height}%`,
      }}
    >
      {/* Glowing border box */}
      <div className="absolute inset-x-2 inset-y-0 rounded-lg border-2 border-primary/30 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]" />
      {/* Gradient fill */}
      <div className="absolute inset-x-2 inset-y-0 rounded-lg bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
    </motion.div>
  );
}

interface StoreSectionRendererProps {
  screenshot: string;
  sections: DetectedSection[];
  changes?: UxChange[];
  variant: "original" | "optimized" | "twin";
  maxHeight?: number;
  enableZoom?: boolean;
}

export default function StoreSectionRenderer({
  screenshot,
  sections,
  changes = [],
  variant,
  maxHeight = 600,
  enableZoom = true,
}: StoreSectionRendererProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  const isEnhanced = variant !== "original";
  const changedAreas = changes.map(c => c.area.toLowerCase());

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.25, 3)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.25, 0.5)), []);
  const handleReset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onMouseUp = () => setIsPanning(false);

  return (
    <div className="relative group">
      {/* Zoom controls */}
      {enableZoom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 z-30 flex gap-1 p-1 rounded-lg bg-background/80 backdrop-blur-md border border-border/30 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleZoomIn}>
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleZoomOut}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          {zoom !== 1 && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleReset}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
          {zoom > 1 && (
            <Badge variant="outline" className="text-[8px] h-6 px-1.5">
              <Move className="h-2.5 w-2.5 mr-0.5" />{Math.round(zoom * 100)}%
            </Badge>
          )}
        </motion.div>
      )}

      {/* Screenshot container with zoom + pan */}
      <div
        ref={containerRef}
        className={cn(
          "overflow-hidden",
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        )}
        style={{ maxHeight }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "top center",
            transition: isPanning ? "none" : "transform 0.3s ease-out",
          }}
        >
          {/* The actual screenshot */}
          <img
            src={screenshot}
            alt="Store screenshot"
            className={cn(
              "w-full h-auto select-none pointer-events-none",
              variant === "original" && "brightness-[0.92] saturate-[0.85]",
              variant === "optimized" && "brightness-[1.04] contrast-[1.02]",
              variant === "twin" && "brightness-[1.06] contrast-[1.04] saturate-[1.08]",
            )}
            draggable={false}
            loading="lazy"
          />

          {/* Section overlays for enhanced views */}
          {isEnhanced && sections.map(section => {
            const isImproved = changedAreas.some(a =>
              section.label.toLowerCase().includes(a) ||
              a.includes(section.type) ||
              section.type.includes(a)
            );
            const matchedChange = changes.find(c =>
              section.label.toLowerCase().includes(c.area.toLowerCase()) ||
              c.area.toLowerCase().includes(section.type)
            );

            return (
              <div key={section.type}>
                <ImprovementZone
                  section={section}
                  isActive={isImproved || activeSection === section.type}
                />
                <SectionAnnotation
                  section={section}
                  isImproved={isImproved}
                  improvementLabel={matchedChange?.predicted_impact || matchedChange?.area}
                  onClick={() => setActiveSection(
                    activeSection === section.type ? null : section.type
                  )}
                />
              </div>
            );
          })}

          {/* Dimming overlay for original */}
          {variant === "original" && (
            <div className="absolute inset-0 bg-foreground/[0.03] pointer-events-none" />
          )}

          {/* Enhancement glow border for twin/optimized */}
          {isEnhanced && (
            <div className="absolute inset-0 pointer-events-none rounded-sm border-2 border-primary/15 shadow-[inset_0_0_50px_-15px_hsl(var(--primary)/0.12)]" />
          )}
        </div>
      </div>

      {/* Section count indicator */}
      {isEnhanced && sections.length > 0 && (
        <div className="absolute bottom-2 left-2 z-20">
          <Badge variant="outline" className="text-[8px] bg-background/70 backdrop-blur-md border-border/30 gap-1">
            <Sparkles className="h-2 w-2 text-primary" />
            {sections.filter(s => changedAreas.some(a =>
              s.label.toLowerCase().includes(a) || a.includes(s.type)
            )).length} improved sections
          </Badge>
        </div>
      )}
    </div>
  );
}
