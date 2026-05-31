import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface StoreViewerShellProps {
  variant: "original" | "optimized" | "twin";
  url?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Browser chrome wrapper for store previews.
 * Glassmorphism container with traffic-light dots and URL bar.
 */
export default function StoreViewerShell({ variant, url = "store.myshopify.com", children, className }: StoreViewerShellProps) {
  const isEnhanced = variant !== "original";

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border backdrop-blur-md transition-all",
      isEnhanced
        ? "border-primary/30 ring-1 ring-primary/20 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.25)]"
        : "border-border/40 shadow-lg shadow-black/5",
      className,
    )}>
      {/* Browser chrome */}
      <div className={cn(
        "flex items-center gap-2 px-3.5 py-2 border-b",
        isEnhanced
          ? "bg-primary/[0.04] border-primary/15 backdrop-blur-xl"
          : "bg-muted/30 border-border/30 backdrop-blur-xl",
      )}>
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0,70%,60%)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(45,70%,55%)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(120,50%,50%)]" />
        </div>
        <div className={cn(
          "flex-1 mx-2 h-5 rounded-md flex items-center px-2.5 text-[8px] font-mono",
          isEnhanced
            ? "bg-primary/5 border border-primary/10 text-primary/50"
            : "bg-background/40 border border-border/20 text-muted-foreground/40",
        )}>
          {url}
        </div>
        {variant === "twin" && (
          <Badge className="text-[6px] px-1.5 py-0 h-4 bg-primary text-primary-foreground shadow shadow-primary/30 gap-0.5">
            <Sparkles className="h-2 w-2" />TWIN
          </Badge>
        )}
        {variant === "optimized" && (
          <Badge className="text-[6px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 gap-0.5" variant="outline">
            <Sparkles className="h-2 w-2" />AI
          </Badge>
        )}
      </div>

      {/* Content area */}
      <div className={cn(
        "relative",
        isEnhanced ? "bg-card/90" : "bg-card/50",
      )}>
        {children}
      </div>

      {/* Status bar */}
      <div className={cn(
        "px-3 py-1.5 border-t text-center",
        isEnhanced
          ? "bg-primary/[0.02] border-primary/10"
          : "bg-muted/20 border-border/20",
      )}>
        <p className={cn(
          "text-[8px] font-medium flex items-center justify-center gap-1",
          isEnhanced ? "text-primary" : "text-muted-foreground/50",
        )}>
          {isEnhanced && <Sparkles className="h-2.5 w-2.5" />}
          {variant === "original" ? "Original — No Optimizations" :
           variant === "twin" ? "AI-Optimized Digital Twin" :
           "AI-Generated Variation"}
        </p>
      </div>
    </div>
  );
}
