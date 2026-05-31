import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MockupSection {
  type: "header" | "hero" | "product-grid" | "cta" | "trust-badges" | "content" | "footer" | "testimonials" | "newsletter";
  label: string;
  highlighted?: boolean;
  improvementLabel?: string;
  height?: string;
}

const defaultCurrentSections: MockupSection[] = [
  { type: "header", label: "Header / Nav", height: "h-8" },
  { type: "hero", label: "Hero Banner", height: "h-20" },
  { type: "product-grid", label: "Product Grid", height: "h-28" },
  { type: "content", label: "Content Section", height: "h-14" },
  { type: "footer", label: "Footer", height: "h-8" },
];

const defaultOptimizedSections: MockupSection[] = [
  { type: "header", label: "Sticky Nav + Search", height: "h-8", highlighted: true, improvementLabel: "Enhanced Nav" },
  { type: "hero", label: "Dynamic Hero + CTA", height: "h-24", highlighted: true, improvementLabel: "Improved CTA" },
  { type: "trust-badges", label: "Trust Badges Bar", height: "h-6", highlighted: true, improvementLabel: "New Section" },
  { type: "product-grid", label: "Optimized Product Grid", height: "h-28", highlighted: true, improvementLabel: "Better Layout" },
  { type: "testimonials", label: "Social Proof", height: "h-14", highlighted: true, improvementLabel: "New Section" },
  { type: "newsletter", label: "Email Capture", height: "h-10", highlighted: true, improvementLabel: "New Section" },
  { type: "footer", label: "Footer", height: "h-8" },
];

const sectionStyles: Record<string, { bg: string; pattern: string }> = {
  header: { bg: "bg-muted", pattern: "flex items-center justify-between px-2" },
  hero: { bg: "bg-primary/10", pattern: "flex items-center justify-center" },
  "product-grid": { bg: "bg-muted/50", pattern: "grid grid-cols-3 gap-1 p-1.5" },
  cta: { bg: "bg-primary/20", pattern: "flex items-center justify-center" },
  "trust-badges": { bg: "bg-success/10", pattern: "flex items-center justify-center gap-2" },
  content: { bg: "bg-muted/30", pattern: "flex flex-col gap-1 p-1.5 justify-center" },
  footer: { bg: "bg-muted", pattern: "flex items-center justify-center" },
  testimonials: { bg: "bg-accent", pattern: "flex items-center justify-center gap-1" },
  newsletter: { bg: "bg-primary/5", pattern: "flex items-center justify-center" },
};

function SectionBlock({ section }: { section: MockupSection }) {
  const style = sectionStyles[section.type] || sectionStyles.content;
  return (
    <div className={cn("relative rounded-sm border border-border/50", section.height || "h-10", style.bg, style.pattern, section.highlighted && "ring-1 ring-primary/40 border-primary/30")}>
      {section.type === "header" && (
        <>
          <div className="h-2 w-8 rounded-sm bg-foreground/20" />
          <div className="flex gap-1">
            {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-5 rounded-sm bg-foreground/10" />)}
          </div>
          <div className="h-2.5 w-6 rounded-sm bg-primary/40" />
        </>
      )}
      {section.type === "hero" && (
        <div className="text-center space-y-1">
          <div className="h-2 w-20 mx-auto rounded-sm bg-foreground/20" />
          <div className="h-1.5 w-28 mx-auto rounded-sm bg-foreground/10" />
          <div className="h-3.5 w-14 mx-auto rounded-sm bg-primary/50 mt-1" />
        </div>
      )}
      {section.type === "product-grid" && (
        <>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-sm bg-background border border-border/30 flex flex-col items-center justify-center p-0.5 gap-0.5">
              <div className="h-5 w-full rounded-sm bg-muted" />
              <div className="h-1 w-3/4 rounded-sm bg-foreground/10" />
              <div className="h-1 w-1/2 rounded-sm bg-primary/20" />
            </div>
          ))}
        </>
      )}
      {section.type === "trust-badges" && (
        <>
          {["★", "✓", "🔒", "📦"].map((icon, i) => (
            <div key={i} className="flex items-center gap-0.5 text-[7px] text-success">
              <span>{icon}</span>
              <div className="h-1 w-4 rounded-sm bg-success/20" />
            </div>
          ))}
        </>
      )}
      {section.type === "testimonials" && (
        <>
          {[1, 2].map(i => (
            <div key={i} className="rounded-sm bg-background border border-border/30 p-1 flex-1">
              <div className="h-1 w-full rounded-sm bg-foreground/10 mb-0.5" />
              <div className="h-1 w-3/4 rounded-sm bg-foreground/5" />
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map(s => <div key={s} className="h-1 w-1 rounded-full bg-warning/60" />)}
              </div>
            </div>
          ))}
        </>
      )}
      {section.type === "newsletter" && (
        <div className="flex items-center gap-1">
          <div className="h-3 w-20 rounded-sm bg-muted border border-border/50" />
          <div className="h-3 w-8 rounded-sm bg-primary/40" />
        </div>
      )}
      {section.type === "content" && (
        <>
          <div className="h-1.5 w-3/4 rounded-sm bg-foreground/10" />
          <div className="h-1 w-full rounded-sm bg-foreground/5" />
          <div className="h-1 w-2/3 rounded-sm bg-foreground/5" />
        </>
      )}
      {section.type === "cta" && <div className="h-4 w-16 rounded-sm bg-primary/50" />}
      {section.type === "footer" && (
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-1 w-4 rounded-sm bg-foreground/10" />)}
        </div>
      )}
      {section.highlighted && section.improvementLabel && (
        <div className="absolute -top-1.5 -right-1 z-10">
          <Badge className="text-[7px] px-1 py-0 h-3 bg-primary text-primary-foreground leading-none">
            {section.improvementLabel}
          </Badge>
        </div>
      )}
    </div>
  );
}

interface StoreMockupPreviewProps {
  title: string;
  sections?: MockupSection[];
  variant?: "current" | "optimized";
  uplift?: number;
  className?: string;
}

export default function StoreMockupPreview({
  title,
  sections,
  variant = "current",
  uplift,
  className,
}: StoreMockupPreviewProps) {
  const displaySections = sections || (variant === "optimized" ? defaultOptimizedSections : defaultCurrentSections);

  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", variant === "optimized" && "ring-1 ring-primary/20", className)}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 border-b border-border">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-destructive/40" />
          <div className="h-2 w-2 rounded-full bg-warning/40" />
          <div className="h-2 w-2 rounded-full bg-success/40" />
        </div>
        <div className="flex-1 mx-2 h-4 rounded-sm bg-background/80 border border-border/50 flex items-center px-1.5">
          <span className="text-[8px] text-muted-foreground truncate">store.myshopify.com</span>
        </div>
      </div>

      {/* Title bar */}
      <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-1.5">
          {variant === "optimized" && (
            <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 bg-primary/5 text-primary border-primary/20">
              AI Optimized
            </Badge>
          )}
          {uplift != null && uplift > 0 && (
            <Badge className="text-[8px] px-1.5 py-0 h-4 bg-success/10 text-success border-success/20" variant="outline">
              +{uplift.toFixed(1)}% Conv. Lift
            </Badge>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="p-2 space-y-1">
        {displaySections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
      </div>
    </div>
  );
}

export { defaultCurrentSections, defaultOptimizedSections };
export type { MockupSection as MockupSectionType };
