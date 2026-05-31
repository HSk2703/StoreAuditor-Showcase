import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Star, ShoppingCart, Search, ChevronRight, Shield, Truck, RotateCcw,
  Clock, Flame, BadgeCheck, Heart, Eye, Zap, ArrowRight, Menu,
  Package, CreditCard, Award, MessageCircle, ChevronDown,
} from "lucide-react";
import type { UxChange } from "@/lib/ux-optimizer-service";

interface OptimizedStoreRendererProps {
  variant: "original" | "optimized" | "twin";
  changes?: UxChange[];
  screenshot?: string | null;
  storeName?: string;
  variationStyle?: "trust" | "urgency" | "content" | "minimal" | "default";
}

/**
 * Renders a structured store UI with visible AI improvements applied.
 * Original = muted, basic layout. Optimized/Twin = enhanced with changes applied.
 */
export default function OptimizedStoreRenderer({
  variant,
  changes = [],
  screenshot,
  storeName = "Your Store",
  variationStyle = "default",
}: OptimizedStoreRendererProps) {
  const opt = variant !== "original";
  const isTwin = variant === "twin";
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  // Determine style based on variation or changes
  const style = variationStyle !== "default" ? variationStyle : inferStyle(changes);

  return (
    <div className={cn(
      "relative overflow-hidden text-foreground",
      opt ? "bg-card" : "bg-card/60",
    )}>
      {/* Screenshot background layer (if available) */}
      {screenshot && (
        <div className="absolute inset-0 z-0">
          <img
            src={screenshot}
            alt="Store background"
            className={cn(
              "w-full h-full object-cover object-top",
              opt ? "opacity-[0.08] blur-sm" : "opacity-[0.15] blur-[1px]",
            )}
            loading="lazy"
            draggable={false}
          />
        </div>
      )}

      <div className="relative z-10">
        {/* ── URGENCY BANNER (optimized only) ── */}
        {opt && (style === "urgency" || style === "default") && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className={cn(
              "flex items-center justify-center gap-2 py-1.5 text-[9px] font-bold tracking-wider",
              isTwin
                ? "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground"
                : "bg-gradient-to-r from-destructive/90 to-destructive text-destructive-foreground",
            )}
          >
            <Flame className="h-3 w-3" />
            <span>🔥 LIMITED TIME — FREE SHIPPING ON ALL ORDERS + 20% OFF</span>
            <Clock className="h-3 w-3 ml-1" />
            <span className="font-mono">02:14:33</span>
          </motion.div>
        )}

        {/* ── NAVIGATION ── */}
        <NavSection opt={opt} isTwin={isTwin} storeName={storeName} style={style} />

        {/* ── HERO SECTION ── */}
        <HeroSection opt={opt} isTwin={isTwin} style={style} />

        {/* ── TRUST BAR ── */}
        {opt && <TrustBar isTwin={isTwin} style={style} />}

        {/* ── PRODUCT GRID ── */}
        <ProductGrid opt={opt} isTwin={isTwin} style={style} hoveredProduct={hoveredProduct} setHoveredProduct={setHoveredProduct} />

        {/* ── SOCIAL PROOF (optimized only) ── */}
        {opt && <SocialProofSection isTwin={isTwin} style={style} />}

        {/* ── CTA SECTION ── */}
        <CTASection opt={opt} isTwin={isTwin} style={style} />

        {/* ── FOOTER ── */}
        <FooterSection opt={opt} isTwin={isTwin} />
      </div>
    </div>
  );
}

function inferStyle(changes: UxChange[]): "trust" | "urgency" | "content" | "minimal" | "default" {
  const text = changes.map(c => `${c.proposed} ${c.rationale}`).join(" ").toLowerCase();
  if (text.includes("trust") || text.includes("badge") || text.includes("review")) return "trust";
  if (text.includes("urgency") || text.includes("scarcity") || text.includes("limited")) return "urgency";
  if (text.includes("content") || text.includes("story") || text.includes("education")) return "content";
  if (text.includes("minimal") || text.includes("clean") || text.includes("simple")) return "minimal";
  return "default";
}

/* ── SUB-COMPONENTS ── */

function NavSection({ opt, isTwin, storeName, style }: { opt: boolean; isTwin: boolean; storeName: string; style: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2.5 border-b transition-all",
      opt ? "bg-card/95 border-border/20 backdrop-blur-xl" : "bg-muted/30 border-border/40",
    )}>
      <div className="flex items-center gap-4">
        {opt && <Menu className="h-3.5 w-3.5 text-muted-foreground sm:hidden" />}
        <span className={cn(
          "font-bold tracking-tight",
          opt ? "text-[11px] text-foreground" : "text-[10px] text-muted-foreground",
        )}>
          {storeName.toUpperCase()}
        </span>
        <div className="hidden sm:flex items-center gap-3">
          {(opt ? ["New Arrivals", "Best Sellers", "Collections", "Sale"] : ["Shop", "About"]).map(t => (
            <span key={t} className={cn(
              "text-[9px] font-medium cursor-pointer transition-colors",
              opt ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/50",
            )}>{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {opt && (
          <div className="hidden sm:flex items-center h-6 w-28 rounded-full bg-muted/50 border border-border/30 px-2.5 gap-1.5">
            <Search className="h-2.5 w-2.5 text-muted-foreground/50" />
            <span className="text-[8px] text-muted-foreground/40">Search products...</span>
          </div>
        )}
        {opt && <Heart className="h-3.5 w-3.5 text-muted-foreground/50 cursor-pointer hover:text-destructive transition-colors" />}
        <div className="relative">
          <ShoppingCart className={cn("h-3.5 w-3.5", opt ? "text-foreground/70" : "text-muted-foreground/30")} />
          {opt && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary text-[6px] font-bold text-primary-foreground flex items-center justify-center"
            >
              2
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSection({ opt, isTwin, style }: { opt: boolean; isTwin: boolean; style: string }) {
  return (
    <div className={cn(
      "relative overflow-hidden transition-all",
      opt ? "min-h-[180px] sm:min-h-[220px]" : "min-h-[120px] sm:min-h-[150px]",
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0",
        opt
          ? isTwin
            ? "bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5"
            : style === "urgency"
              ? "bg-gradient-to-br from-destructive/15 via-background to-primary/10"
              : style === "trust"
                ? "bg-gradient-to-br from-emerald-500/10 via-background to-primary/10"
                : "bg-gradient-to-br from-primary/15 via-background to-accent/10"
          : "bg-gradient-to-br from-muted/50 to-muted/20",
      )} />

      <div className="relative h-full flex flex-col justify-center p-6 sm:p-8">
        {opt ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md space-y-3"
          >
            {/* Headline */}
            <div className="space-y-1">
              {style === "urgency" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[8px] font-bold mb-1"
                >
                  <Flame className="h-2.5 w-2.5" /> ENDING TONIGHT — 30% OFF
                </motion.div>
              )}
              <h2 className={cn(
                "font-bold tracking-tight leading-tight",
                isTwin ? "text-lg sm:text-xl" : "text-base sm:text-lg",
              )}>
                {style === "trust"
                  ? "Trusted by 50,000+ Happy Customers"
                  : style === "urgency"
                    ? "Don't Miss Our Biggest Sale Ever"
                    : style === "content"
                      ? "Crafted with Purpose, Designed for You"
                      : "Discover Your New Favorites"}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                {style === "trust"
                  ? "⭐ 4.9/5 rating • 100% satisfaction guarantee • Free returns"
                  : style === "urgency"
                    ? "Only 127 items left at this price. Order in the next 2 hours for same-day shipping"
                    : "Premium quality essentials curated by experts, delivered to your door"}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold tracking-wide transition-all",
                  isTwin
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : style === "urgency"
                      ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30"
                      : "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                )}
              >
                {style === "urgency" ? "GRAB THE DEAL" : "SHOP NOW"}
                <ArrowRight className="h-3 w-3" />
              </motion.button>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-medium border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all">
                {style === "content" ? "Our Story" : "View All"}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Trust indicators under CTA */}
            {style === "trust" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 pt-1"
              >
                {[
                  { icon: <Shield className="h-2.5 w-2.5" />, text: "Secure Checkout" },
                  { icon: <BadgeCheck className="h-2.5 w-2.5" />, text: "Verified Brand" },
                  { icon: <RotateCcw className="h-2.5 w-2.5" />, text: "30-Day Returns" },
                ].map(t => (
                  <div key={t.text} className="flex items-center gap-1 text-[7px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {t.icon} {t.text}
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Original: bland, generic */
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-foreground/10" />
            <div className="h-2 w-48 rounded bg-foreground/5" />
            <div className="h-6 w-20 rounded bg-muted-foreground/15 mt-2" />
          </div>
        )}
      </div>

      {/* Animated bottom line (optimized) */}
      {opt && (
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
      )}
    </div>
  );
}

function TrustBar({ isTwin, style }: { isTwin: boolean; style: string }) {
  const items = style === "trust"
    ? [
        { icon: <Shield className="h-3 w-3" />, label: "100% Secure" },
        { icon: <Award className="h-3 w-3" />, label: "Award Winning" },
        { icon: <Truck className="h-3 w-3" />, label: "Free Shipping" },
        { icon: <RotateCcw className="h-3 w-3" />, label: "Easy Returns" },
        { icon: <MessageCircle className="h-3 w-3" />, label: "24/7 Support" },
      ]
    : [
        { icon: <Truck className="h-3 w-3" />, label: "Free Shipping" },
        { icon: <Shield className="h-3 w-3" />, label: "Secure Payment" },
        { icon: <RotateCcw className="h-3 w-3" />, label: "30-Day Returns" },
        { icon: <Star className="h-3 w-3" />, label: "4.9★ Rated" },
      ];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className={cn(
        "flex items-center justify-center gap-5 py-2 border-y",
        isTwin
          ? "bg-primary/[0.04] border-primary/10"
          : "bg-muted/30 border-border/20",
      )}
    >
      {items.map(t => (
        <div key={t.label} className={cn(
          "flex items-center gap-1.5 text-[8px] font-medium",
          isTwin ? "text-primary/70" : "text-muted-foreground",
        )}>
          {t.icon}
          <span>{t.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

function ProductGrid({ opt, isTwin, style, hoveredProduct, setHoveredProduct }: {
  opt: boolean; isTwin: boolean; style: string;
  hoveredProduct: number | null; setHoveredProduct: (v: number | null) => void;
}) {
  const products = opt
    ? [
        { name: "Premium Essentials Tee", price: "$49", oldPrice: "$65", badge: "Best Seller", rating: 4.9, reviews: 2847 },
        { name: "Classic Comfort Hoodie", price: "$89", oldPrice: "$120", badge: "Limited Stock", rating: 4.8, reviews: 1923 },
        { name: "Signature Canvas Bag", price: "$129", oldPrice: null, badge: "New Arrival", rating: 4.7, reviews: 856 },
        { name: "Organic Cotton Pants", price: "$75", oldPrice: "$95", badge: null, rating: 4.6, reviews: 1204 },
        { name: "Minimalist Watch", price: "$199", oldPrice: "$249", badge: "Editor's Pick", rating: 4.9, reviews: 3102 },
        { name: "Eco-Friendly Sneakers", price: "$145", oldPrice: null, badge: "Trending", rating: 4.8, reviews: 2156 },
      ]
    : [
        { name: "", price: "$49", oldPrice: null, badge: null, rating: 0, reviews: 0 },
        { name: "", price: "$89", oldPrice: null, badge: null, rating: 0, reviews: 0 },
        { name: "", price: "$129", oldPrice: null, badge: null, rating: 0, reviews: 0 },
        { name: "", price: "$75", oldPrice: null, badge: null, rating: 0, reviews: 0 },
        { name: "", price: "$199", oldPrice: null, badge: null, rating: 0, reviews: 0 },
        { name: "", price: "$145", oldPrice: null, badge: null, rating: 0, reviews: 0 },
      ];

  return (
    <div className="p-3 sm:p-5">
      {opt && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-foreground">
            {style === "urgency" ? "🔥 Selling Fast" : style === "trust" ? "⭐ Top Rated Products" : "Featured Collection"}
          </h3>
          <span className="text-[9px] text-primary font-medium cursor-pointer flex items-center gap-0.5 hover:underline">
            View All <ChevronRight className="h-2.5 w-2.5" />
          </span>
        </div>
      )}

      <div className={cn("grid gap-2.5", opt ? "grid-cols-3 sm:grid-cols-3" : "grid-cols-3")}>
        {products.map((p, i) => (
          <motion.div
            key={i}
            whileHover={opt ? { y: -3, transition: { duration: 0.2 } } : {}}
            onMouseEnter={() => opt && setHoveredProduct(i)}
            onMouseLeave={() => setHoveredProduct(null)}
            className={cn(
              "rounded-lg overflow-hidden border transition-all group",
              opt
                ? "border-border/30 bg-card shadow-sm hover:shadow-lg hover:border-primary/20 cursor-pointer"
                : "border-border/15 bg-muted/20",
            )}
          >
            {/* Product Image placeholder */}
            <div className={cn(
              "relative aspect-square overflow-hidden",
              opt ? "bg-gradient-to-br from-muted/40 to-muted/60" : "bg-muted/30",
            )}>
              {/* Badge */}
              {opt && p.badge && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded text-[7px] font-bold",
                    p.badge === "Best Seller"
                      ? "bg-primary text-primary-foreground"
                      : p.badge === "Limited Stock"
                        ? "bg-destructive text-destructive-foreground"
                        : p.badge === "Trending"
                          ? "bg-amber-500 text-white"
                          : "bg-foreground/80 text-background",
                  )}
                >
                  {p.badge}
                </motion.div>
              )}

              {/* Quick action overlay */}
              {opt && hoveredProduct === i && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-foreground/5 flex items-center justify-center gap-2 z-10"
                >
                  <div className="h-7 w-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-border/30">
                    <Eye className="h-3 w-3 text-foreground/70" />
                  </div>
                  <div className="h-7 w-7 rounded-full bg-primary/90 flex items-center justify-center shadow-md">
                    <ShoppingCart className="h-3 w-3 text-primary-foreground" />
                  </div>
                </motion.div>
              )}

              {/* Placeholder visual */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center",
                opt ? "text-muted-foreground/20" : "text-muted-foreground/10",
              )}>
                <Package className={cn("h-8 w-8", opt && "h-10 w-10")} />
              </div>
            </div>

            {/* Product Info */}
            <div className={cn("p-2 space-y-1", opt ? "bg-card" : "bg-transparent")}>
              {opt ? (
                <>
                  <p className="text-[9px] text-foreground font-medium leading-tight line-clamp-1">{p.name}</p>
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <div className="flex gap-[1px]">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={cn("h-2 w-2", s <= Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-muted/40")} />
                      ))}
                    </div>
                    <span className="text-[7px] text-muted-foreground">({p.reviews.toLocaleString()})</span>
                  </div>
                  {/* Price */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-foreground">{p.price}</span>
                    {p.oldPrice && (
                      <span className="text-[8px] text-muted-foreground line-through">{p.oldPrice}</span>
                    )}
                    {p.oldPrice && (
                      <span className="text-[7px] font-bold text-destructive">
                        SAVE {Math.round((1 - parseInt(p.price.slice(1)) / parseInt(p.oldPrice.slice(1))) * 100)}%
                      </span>
                    )}
                  </div>
                  {/* Quick add */}
                  {style === "urgency" && i < 2 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full mt-1 py-1 rounded text-[7px] font-bold bg-primary text-primary-foreground"
                    >
                      ADD TO CART — Only {3 + i} left
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  <div className="h-1.5 w-3/4 rounded bg-foreground/8" />
                  <div className="h-1.5 w-8 rounded bg-foreground/6" />
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SocialProofSection({ isTwin, style }: { isTwin: boolean; style: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 sm:mx-5 mb-3 p-3 rounded-xl bg-muted/30 border border-border/20"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex gap-[1px]">
          {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
        </div>
        <span className="text-[10px] font-bold text-foreground">4.9 out of 5</span>
        <span className="text-[9px] text-muted-foreground">Based on 12,847 reviews</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { name: "Sarah M.", text: "Best quality I've found online. Fits perfectly!", stars: 5 },
          { name: "James K.", text: "Fast shipping, amazing customer service. Will buy again!", stars: 5 },
        ].map((r, i) => (
          <div key={i} className="rounded-lg border border-border/20 bg-card/60 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[6px] font-bold text-primary">{r.name[0]}</span>
              </div>
              <span className="text-[8px] font-medium text-foreground">{r.name}</span>
              <BadgeCheck className="h-2.5 w-2.5 text-primary" />
            </div>
            <div className="flex gap-[1px]">
              {[1,2,3,4,5].map(s => <Star key={s} className={cn("h-2 w-2", s <= r.stars ? "text-amber-400 fill-amber-400" : "text-muted/40")} />)}
            </div>
            <p className="text-[8px] text-muted-foreground leading-relaxed">"{r.text}"</p>
          </div>
        ))}
      </div>

      {style !== "minimal" && (
        <div className="flex items-center justify-center gap-4 mt-2.5 pt-2 border-t border-border/10">
          {[
            { value: "50K+", label: "Happy Customers" },
            { value: "99%", label: "Satisfaction" },
            { value: "<24h", label: "Avg Delivery" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[10px] font-bold text-foreground">{s.value}</p>
              <p className="text-[7px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CTASection({ opt, isTwin, style }: { opt: boolean; isTwin: boolean; style: string }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-5 px-4",
      opt
        ? isTwin
          ? "bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10"
          : "bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
        : "bg-muted/20",
    )}>
      {opt ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h3 className="text-xs font-bold text-foreground">
            {style === "urgency"
              ? "⏰ Sale Ends at Midnight"
              : style === "trust"
                ? "✅ Join 50,000+ Satisfied Customers"
                : "Ready to Transform Your Style?"}
          </h3>
          <p className="text-[9px] text-muted-foreground max-w-xs">
            {style === "trust"
              ? "Shop with confidence — 30-day money-back guarantee"
              : "Free shipping on orders over $50. No questions asked returns"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={style === "urgency" ? {
              boxShadow: ["0 0 0 0 hsl(var(--primary)/0)", "0 0 20px 4px hsl(var(--primary)/0.2)", "0 0 0 0 hsl(var(--primary)/0)"],
            } : {}}
            transition={style === "urgency" ? { duration: 2, repeat: Infinity } : {}}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-bold tracking-wide flex items-center gap-1.5",
              isTwin
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30"
                : "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
            )}
          >
            <Zap className="h-3 w-3" />
            {style === "urgency" ? "CLAIM YOUR DISCOUNT" : "EXPLORE COLLECTION"}
            <ArrowRight className="h-3 w-3" />
          </motion.button>
        </motion.div>
      ) : (
        <div className="h-6 w-24 rounded bg-muted-foreground/15" />
      )}
    </div>
  );
}

function FooterSection({ opt, isTwin }: { opt: boolean; isTwin: boolean }) {
  return (
    <div className={cn(
      "px-4 py-3 border-t",
      opt ? "border-border/10 bg-muted/20" : "border-border/20 bg-muted/10",
    )}>
      {opt ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {["About", "Contact", "FAQ", "Shipping"].map(l => (
                <span key={l} className="text-[7px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{l}</span>
              ))}
            </div>
            <div className="flex gap-2">
              {[CreditCard, Shield, Package].map((Icon, i) => (
                <Icon key={i} className="h-3 w-3 text-muted-foreground/40" />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 text-[7px] text-muted-foreground/50">
            <Shield className="h-2 w-2" /> Secured by SSL • All rights reserved
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          {[1,2,3].map(i => <div key={i} className="h-1.5 w-8 rounded bg-foreground/5" />)}
        </div>
      )}
    </div>
  );
}
