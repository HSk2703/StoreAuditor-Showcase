import { motion } from "framer-motion";
import { MousePointer2, Image, ShieldCheck, Navigation, Type, Star, CreditCard, Truck, CheckCircle } from "lucide-react";
import { useState } from "react";

interface PageHeatmapProps {
  scrapedData: {
    homepage: any;
    productPage: any | null;
  };
}

type ElementType = "cta" | "image" | "trust" | "heading" | "nav" | "review" | "price" | "shipping";

interface PageZone {
  id: string;
  label: string;
  elements: { type: ElementType; label: string; present: boolean; intensity: "high" | "medium" | "low" | "none" }[];
}

const elementConfig: Record<ElementType, { icon: typeof MousePointer2; color: string; label: string }> = {
  cta: { icon: MousePointer2, color: "hsl(var(--primary))", label: "CTAs" },
  image: { icon: Image, color: "hsl(142 71% 45%)", label: "Images" },
  trust: { icon: ShieldCheck, color: "hsl(38 92% 50%)", label: "Trust Signals" },
  heading: { icon: Type, color: "hsl(250 70% 55%)", label: "Headings" },
  nav: { icon: Navigation, color: "hsl(200 80% 50%)", label: "Navigation" },
  review: { icon: Star, color: "hsl(38 92% 50%)", label: "Reviews" },
  price: { icon: CreditCard, color: "hsl(142 71% 45%)", label: "Pricing" },
  shipping: { icon: Truck, color: "hsl(200 80% 50%)", label: "Shipping Info" },
};

function buildHomepageZones(hp: any): PageZone[] {
  return [
    {
      id: "nav",
      label: "Navigation Bar",
      elements: [
        { type: "nav", label: "Navigation menu", present: hp.hasNavigation, intensity: hp.hasNavigation ? "high" : "none" },
        { type: "trust", label: "Trust indicators in header", present: hp.hasFavicon, intensity: hp.hasFavicon ? "low" : "none" },
      ],
    },
    {
      id: "hero",
      label: "Hero / Above the Fold",
      elements: [
        { type: "heading", label: `H1 headings (${hp.h1Headings?.length || 0})`, present: (hp.h1Headings?.length || 0) > 0, intensity: (hp.h1Headings?.length || 0) > 0 ? "high" : "none" },
        { type: "cta", label: `CTA buttons (${hp.ctaCount || 0})`, present: (hp.ctaCount || 0) > 0, intensity: hp.ctaCount >= 2 ? "high" : hp.ctaCount === 1 ? "medium" : "none" },
        { type: "image", label: "Hero images", present: hp.imageCount > 0, intensity: hp.imageCount >= 3 ? "high" : hp.imageCount > 0 ? "medium" : "none" },
      ],
    },
    {
      id: "social",
      label: "Social Proof Section",
      elements: [
        { type: "review", label: "Customer reviews", present: hp.hasReviews, intensity: hp.hasReviews ? "high" : "none" },
        { type: "trust", label: "Social proof elements", present: hp.hasSocialProof, intensity: hp.hasSocialProof ? "high" : "none" },
      ],
    },
    {
      id: "content",
      label: "Content / Products",
      elements: [
        { type: "heading", label: `H2 headings (${hp.h2Headings?.length || 0})`, present: (hp.h2Headings?.length || 0) > 0, intensity: (hp.h2Headings?.length || 0) >= 3 ? "high" : (hp.h2Headings?.length || 0) > 0 ? "medium" : "none" },
        { type: "image", label: `Product images (${hp.imageCount} total)`, present: hp.imageCount > 3, intensity: hp.imageCount >= 10 ? "high" : hp.imageCount > 3 ? "medium" : "low" },
        { type: "cta", label: "Secondary CTAs", present: hp.ctaCount >= 2, intensity: hp.ctaCount >= 3 ? "high" : hp.ctaCount >= 2 ? "medium" : "none" },
      ],
    },
    {
      id: "footer",
      label: "Footer / Trust Zone",
      elements: [
        { type: "trust", label: "Trust badges", present: hp.hasTrustBadges, intensity: hp.hasTrustBadges ? "high" : "none" },
        { type: "shipping", label: "Return/shipping info", present: hp.hasReturnPolicy || hp.hasShippingInfo, intensity: (hp.hasReturnPolicy && hp.hasShippingInfo) ? "high" : (hp.hasReturnPolicy || hp.hasShippingInfo) ? "medium" : "none" },
        { type: "nav", label: "Footer navigation", present: hp.navLinkCount > 5, intensity: hp.navLinkCount > 10 ? "high" : hp.navLinkCount > 5 ? "medium" : "low" },
      ],
    },
  ];
}

function buildProductZones(pp: any): PageZone[] {
  return [
    {
      id: "nav",
      label: "Navigation Bar",
      elements: [
        { type: "nav", label: "Navigation menu", present: pp.hasNavigation, intensity: pp.hasNavigation ? "high" : "none" },
      ],
    },
    {
      id: "product-hero",
      label: "Product Images & Title",
      elements: [
        { type: "image", label: `Product images (${pp.imageCount})`, present: pp.imageCount > 0, intensity: pp.imageCount >= 5 ? "high" : pp.imageCount >= 2 ? "medium" : pp.imageCount > 0 ? "low" : "none" },
        { type: "heading", label: "Product title", present: !!pp.productTitle, intensity: pp.productTitle ? "high" : "none" },
        { type: "price", label: "Price display", present: pp.hasPrice, intensity: pp.hasPrice ? "high" : "none" },
      ],
    },
    {
      id: "product-cta",
      label: "Add to Cart Zone",
      elements: [
        { type: "cta", label: `Buy buttons (${pp.ctaCount})`, present: pp.ctaCount > 0, intensity: pp.ctaCount >= 2 ? "high" : pp.ctaCount === 1 ? "medium" : "none" },
        { type: "trust", label: "Trust badges near CTA", present: pp.hasTrustBadges, intensity: pp.hasTrustBadges ? "high" : "none" },
        { type: "shipping", label: "Shipping info", present: pp.hasShippingInfo, intensity: pp.hasShippingInfo ? "medium" : "none" },
      ],
    },
    {
      id: "product-desc",
      label: "Product Description",
      elements: [
        { type: "heading", label: `Section headings (${pp.h2Headings?.length || 0})`, present: (pp.h2Headings?.length || 0) > 0, intensity: (pp.h2Headings?.length || 0) >= 2 ? "high" : (pp.h2Headings?.length || 0) > 0 ? "medium" : "none" },
        { type: "image", label: "Descriptive images", present: pp.imageCount > 3, intensity: pp.imageCount > 6 ? "high" : pp.imageCount > 3 ? "medium" : "none" },
      ],
    },
    {
      id: "product-reviews",
      label: "Reviews & Trust",
      elements: [
        { type: "review", label: "Customer reviews", present: pp.hasReviews, intensity: pp.hasReviews ? "high" : "none" },
        { type: "trust", label: "Return policy", present: pp.hasReturnPolicy, intensity: pp.hasReturnPolicy ? "medium" : "none" },
      ],
    },
  ];
}

const intensityOpacity: Record<string, number> = {
  high: 0.6,
  medium: 0.35,
  low: 0.15,
  none: 0,
};

const PageHeatmap = ({ scrapedData }: PageHeatmapProps) => {
  const [activePage, setActivePage] = useState<"homepage" | "product">("homepage");
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const hp = scrapedData.homepage;
  const pp = scrapedData.productPage;

  const zones = activePage === "homepage" ? buildHomepageZones(hp) : pp ? buildProductZones(pp) : [];

  const activeTypes = new Set<ElementType>();
  zones.forEach(z => z.elements.forEach(e => { if (e.present) activeTypes.add(e.type); }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Page Element Heatmap</h2>
          <p className="text-sm text-muted-foreground mt-1">Visual map of where key conversion elements appear on the page structure</p>
        </div>
        <div className="flex rounded-lg border border-border bg-surface p-0.5">
          <button
            onClick={() => setActivePage("homepage")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activePage === "homepage" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Homepage
          </button>
          <button
            onClick={() => setActivePage("product")}
            disabled={!pp}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activePage === "product" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:text-foreground"
            } ${!pp ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Product Page
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Page wireframe */}
        <div className="relative flex-1 rounded-lg border-2 border-dashed border-border bg-surface/50 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-critical/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/40" />
            <div className="ml-2 flex-1 rounded bg-background/80 px-3 py-1.5 text-xs text-foreground/70 truncate font-medium">
              {activePage === "homepage" ? hp.pageTitle || "Homepage" : pp?.pageTitle || "Product Page"}
            </div>
          </div>

          {/* Zone list — use natural flow instead of absolute positioning */}
          <div className="divide-y divide-border/30">
            {zones.map((zone, zi) => {
              const isHovered = hoveredZone === zone.id;
              const presentElements = zone.elements.filter(e => e.present);
              const dominantElement = presentElements.length > 0
                ? presentElements.reduce((a, b) => intensityOpacity[a.intensity] >= intensityOpacity[b.intensity] ? a : b)
                : null;

              const bgColor = dominantElement ? elementConfig[dominantElement.type].color : "transparent";
              const opacity = dominantElement ? intensityOpacity[dominantElement.intensity] : 0;
              const missingCount = zone.elements.filter(e => !e.present).length;

              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: zi * 0.06 }}
                  className={`relative cursor-pointer transition-all duration-200 px-4 py-4 ${
                    isHovered ? "z-10 ring-2 ring-primary/40 ring-inset" : ""
                  }`}
                  style={{
                    background: opacity > 0
                      ? `linear-gradient(135deg, ${bgColor.replace(")", ` / ${opacity})`).replace("hsl", "hsla").replace("hsla(", "hsl(")}, transparent)`
                      : "transparent",
                  }}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-sm font-semibold transition-colors shrink-0 ${
                      isHovered ? "text-foreground" : "text-foreground/60"
                    }`}>
                      {zone.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {zone.elements.map((el, ei) => {
                        const cfg = elementConfig[el.type];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={ei}
                            className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform ${
                              isHovered ? "scale-110" : ""
                            }`}
                            style={{
                              backgroundColor: el.present ? `${cfg.color.replace(")", " / 0.25)").replace("hsl", "hsl")}` : "hsl(var(--muted))",
                            }}
                            title={`${el.label}: ${el.present ? "Found" : "Missing"}`}
                          >
                            <Icon
                              className="h-3.5 w-3.5"
                              style={{ color: el.present ? cfg.color : "hsl(var(--muted-foreground))" }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {missingCount > 0 && (
                    <div className="mt-1 text-right">
                      <span className="text-xs font-semibold text-critical">
                        {missingCount} missing
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-full lg:w-64 shrink-0 space-y-3">
          {/* Legend */}
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Legend</p>
            <div className="space-y-2">
              {(Object.entries(elementConfig) as [ElementType, typeof elementConfig[ElementType]][]).map(([type, cfg]) => {
                const Icon = cfg.icon;
                const isActive = activeTypes.has(type);
                return (
                  <div key={type} className={`flex items-center gap-2.5 text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground/60"}`}>
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded shrink-0"
                      style={{ backgroundColor: isActive ? `${cfg.color.replace(")", " / 0.2)").replace("hsl", "hsl")}` : "hsl(var(--muted))" }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: isActive ? cfg.color : undefined }} />
                    </div>
                    <span className="truncate">{cfg.label}</span>
                    {isActive ? (
                      <CheckCircle className="ml-auto h-4 w-4 text-success shrink-0" />
                    ) : (
                      <span className="ml-auto text-xs font-bold text-critical shrink-0">✕</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hovered zone detail */}
          {hoveredZone && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-primary/5 p-3"
            >
              <p className="text-sm font-bold text-primary mb-2">
                {zones.find(z => z.id === hoveredZone)?.label}
              </p>
              <div className="space-y-2">
                {zones.find(z => z.id === hoveredZone)?.elements.map((el, i) => {
                  const cfg = elementConfig[el.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: el.present ? cfg.color : "hsl(var(--muted-foreground))" }} />
                      <div>
                        <span className={el.present ? "text-foreground font-medium" : "text-muted-foreground line-through"}>
                          {el.label}
                        </span>
                        {!el.present && (
                          <span className="ml-1.5 text-critical text-xs font-semibold">Not found</span>
                        )}
                        {el.present && el.intensity !== "none" && (
                          <span className={`ml-1.5 text-xs font-medium ${
                            el.intensity === "high" ? "text-success" : el.intensity === "medium" ? "text-warning" : "text-muted-foreground"
                          }`}>
                            ({el.intensity})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {!hoveredZone && (
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm text-muted-foreground text-center">
                Hover over a page section to see element details
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PageHeatmap;
