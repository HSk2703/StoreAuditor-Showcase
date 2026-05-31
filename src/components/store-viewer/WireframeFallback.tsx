import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, ShoppingCart, Search, ChevronRight, Star,
} from "lucide-react";

interface WireframeFallbackProps {
  variant: "original" | "optimized" | "twin";
  className?: string;
}

/**
 * High-fidelity wireframe mockup fallback when no screenshot is available.
 * Full store layout: nav → hero → trust → products → social proof → CTA → footer.
 */
export default function WireframeFallback({ variant, className }: WireframeFallbackProps) {
  const opt = variant !== "original";

  return (
    <div className={cn("bg-card/50", opt && "bg-card/80", className)}>
      {/* Navigation */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2.5 border-b transition-all",
        opt ? "bg-primary/5 border-primary/20" : "bg-muted/40 border-border/40",
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("h-4 w-16 rounded", opt ? "bg-primary/30" : "bg-foreground/15")} />
          <div className="hidden sm:flex items-center gap-2">
            {["Shop", "New", "Sale"].map(t => (
              <div key={t} className={cn("h-2.5 rounded px-2", opt ? "w-10 bg-primary/15" : "w-8 bg-foreground/8")} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {opt && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 80, opacity: 1 }}
              className="h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center px-1.5">
              <Search className="h-2.5 w-2.5 text-primary/50" />
            </motion.div>
          )}
          <ShoppingCart className={cn("h-3.5 w-3.5", opt ? "text-primary/60" : "text-muted-foreground/40")} />
        </div>
      </div>

      {/* Hero */}
      <div className={cn("relative overflow-hidden transition-all", opt ? "h-36 sm:h-44" : "h-28 sm:h-36")}>
        <div className={cn("absolute inset-0", opt ? "bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10" : "bg-gradient-to-br from-muted/60 to-muted/30")} />
        <div className="relative h-full flex flex-col items-center justify-center gap-2 p-4">
          <div className={cn("rounded-sm", opt ? "h-3 w-36 bg-primary/30" : "h-2.5 w-28 bg-foreground/12")} />
          <div className={cn("rounded-sm", opt ? "h-2 w-48 bg-primary/15" : "h-1.5 w-36 bg-foreground/6")} />
          {opt ? (
            <motion.div whileHover={{ scale: 1.05 }}
              className="mt-2 h-7 px-5 rounded-md bg-primary/50 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20">
              <span className="text-[8px] font-bold text-primary-foreground tracking-wide">SHOP THE COLLECTION</span>
              <ChevronRight className="h-2.5 w-2.5 text-primary-foreground/80" />
            </motion.div>
          ) : (
            <div className="mt-1 h-5 w-16 rounded bg-muted-foreground/20" />
          )}
        </div>
        {opt && (
          <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        )}
      </div>

      {/* Trust bar (optimized only) */}
      {opt && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="flex items-center justify-center gap-4 py-2 bg-primary/[0.03] border-y border-primary/10">
          {[{ icon: "🚚", label: "Free Shipping" }, { icon: "🔒", label: "Secure" }, { icon: "↩️", label: "Returns" }, { icon: "⭐", label: "4.9 Rated" }].map(t => (
            <div key={t.label} className="flex items-center gap-1">
              <span className="text-[8px]">{t.icon}</span>
              <span className="text-[7px] text-primary/60 font-medium">{t.label}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Product grid */}
      <div className="p-3 sm:p-4">
        {opt && (
          <div className="flex items-center justify-between mb-2.5">
            <div className="h-2.5 w-24 rounded bg-primary/20" />
            <div className="h-2 w-12 rounded bg-primary/10" />
          </div>
        )}
        <div className={cn("grid gap-2", opt ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3")}>
          {Array.from({ length: opt ? 8 : 6 }).map((_, i) => (
            <motion.div key={i} whileHover={opt ? { y: -2, boxShadow: "0 8px 16px -4px hsl(var(--primary) / 0.15)" } : {}}
              className={cn("rounded-md border overflow-hidden transition-all", opt ? "border-primary/15 bg-card/80" : "border-border/20 bg-muted/20")}>
              <div className={cn("aspect-square", opt ? "bg-primary/[0.04]" : "bg-muted/40")} />
              <div className="p-1.5 space-y-0.5">
                <div className={cn("h-1.5 rounded-sm", opt ? "w-full bg-foreground/12" : "w-3/4 bg-foreground/6")} />
                <div className="flex items-center justify-between">
                  <div className={cn("h-1.5 rounded-sm", opt ? "w-8 bg-primary/25" : "w-6 bg-foreground/8")} />
                  {opt && i < 3 && (
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <div key={s} className="h-1 w-1 rounded-full bg-warning/50" />)}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social proof (optimized only) */}
      {opt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mx-3 sm:mx-4 mb-3 p-3 rounded-lg bg-primary/[0.03] border border-primary/10">
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-2.5 w-2.5 text-warning" />
            <div className="h-2 w-20 rounded bg-foreground/10" />
          </div>
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className="flex-1 rounded-md border border-primary/10 bg-card/60 p-2">
                <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <div key={s} className="h-1 w-1 rounded-full bg-warning/60" />)}</div>
                <div className="h-1 w-full rounded bg-foreground/5 mb-0.5" />
                <div className="h-1 w-3/4 rounded bg-foreground/3" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <div className={cn("flex items-center justify-center py-4", opt ? "bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" : "bg-muted/20")}>
        {opt ? (
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 hsl(var(--primary)/0)", "0 0 20px 4px hsl(var(--primary)/0.15)", "0 0 0 0 hsl(var(--primary)/0)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="h-7 px-6 rounded-md bg-primary/40 flex items-center gap-1.5">
            <span className="text-[7px] font-bold text-primary-foreground tracking-wider">EXPLORE BESTSELLERS</span>
            <ChevronRight className="h-2.5 w-2.5 text-primary-foreground/80" />
          </motion.div>
        ) : (
          <div className="h-5 w-20 rounded bg-muted-foreground/15" />
        )}
      </div>

      {/* Footer */}
      <div className={cn("px-4 py-3 border-t", opt ? "border-primary/10 bg-primary/[0.02]" : "border-border/30 bg-muted/20")}>
        <div className="flex justify-between items-center">
          <div className="flex gap-3">{[1, 2, 3].map(i => <div key={i} className={cn("h-1.5 rounded", opt ? "w-8 bg-primary/10" : "w-6 bg-foreground/5")} />)}</div>
          {opt && <div className="flex gap-1.5">{[1, 2, 3].map(i => <div key={i} className="h-3 w-3 rounded-full bg-primary/10" />)}</div>}
        </div>
      </div>
    </div>
  );
}
