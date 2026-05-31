import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles, GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  maxHeight?: number;
  className?: string;
}

/**
 * Draggable before/after comparison slider.
 * Shows original store on left, AI-optimized on right.
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "AI Optimized",
  maxHeight = 600,
  className,
}: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onMouseDown = () => { isDragging.current = true; };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };
    const onUp = () => { isDragging.current = false; };

    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-xl border border-border/30 select-none", className)}
      style={{ maxHeight }}
    >
      {/* After image (full width, background) */}
      <div className="relative">
        <img
          src={afterImage}
          alt="Optimized store"
          className="w-full h-auto brightness-[1.05] contrast-[1.03]"
          draggable={false}
          loading="lazy"
        />
        {/* Subtle enhancement glow */}
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/10 shadow-[inset_0_0_40px_-12px_hsl(var(--primary)/0.1)]" />
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImage}
          alt="Original store"
          className="w-full h-auto brightness-[0.9] saturate-[0.85]"
          style={{ width: containerRef.current?.offsetWidth || "100%" }}
          draggable={false}
          loading="lazy"
        />
        {/* Dim overlay */}
        <div className="absolute inset-0 bg-foreground/[0.03] pointer-events-none" />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 z-30 cursor-col-resize"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      >
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-primary/60 shadow-[0_0_8px_hsl(var(--primary)/0.4)]" style={{ left: "50%", transform: "translateX(-50%)" }} />

        {/* Handle grip */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center h-10 w-8 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30 backdrop-blur-md border border-primary/50"
        >
          <GripVertical className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-20">
        <Badge variant="outline" className="text-[8px] bg-background/80 backdrop-blur-md border-border/30 text-muted-foreground">
          {beforeLabel}
        </Badge>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <Badge className="text-[8px] bg-primary/90 text-primary-foreground backdrop-blur-md border-primary/30 gap-0.5 shadow shadow-primary/20">
          <Sparkles className="h-2 w-2" /> {afterLabel}
        </Badge>
      </div>
    </div>
  );
}
