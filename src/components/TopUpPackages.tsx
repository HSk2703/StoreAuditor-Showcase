import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ShoppingCart, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TOPUP_PACKAGES } from "@/lib/ai-credits-config";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

const PACKAGE_HIGHLIGHTS = [
  ["Best for occasional boosts", "1 month bonus active"],
  ["Most popular top-up", "~30% savings vs custom"],
  ["Power user pack", "Roll over 12 months"],
];

const TopUpPackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBuy, setShowBuy] = useState(false);

  const handleBuy = () => {
    if (!user?.id) {
      navigate("/signup");
      return;
    }
    setShowBuy(true);
  };

  return (
    <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-background to-background p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary mb-3">
          <Sparkles className="h-3 w-3" /> Buy Top-Ups
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Need more AI credits this month?
        </h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Top up instantly without changing your plan. Credits roll over for 12 months.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TOPUP_PACKAGES.map((pkg, i) => (
          <motion.div
            key={pkg.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className={`p-5 h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg ${i === 1 ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                {i === 1 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{pkg.credits} AI credits</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-foreground">{pkg.priceLabel}</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                ${(pkg.priceCents / 100 / pkg.credits).toFixed(2)} per credit
              </p>

              <ul className="mt-4 space-y-1.5 flex-1">
                {PACKAGE_HIGHLIGHTS[i].map((h) => (
                  <li key={h} className="flex items-start gap-2 text-xs text-foreground">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-xs text-foreground">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Stacks on top of plan credits</span>
                </li>
              </ul>

              <Button
                onClick={handleBuy}
                variant={i === 1 ? "default" : "outline"}
                className="mt-5 w-full gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Buy Credits
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-6">
        Need a custom amount? Click <button onClick={handleBuy} className="text-primary hover:underline font-medium">Buy Credits</button> to enter any quantity (min 10).
      </p>

      <BuyCreditsModal open={showBuy} onClose={() => setShowBuy(false)} />
    </section>
  );
};

export default TopUpPackages;
