import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Rocket, Store, ShoppingBag, CreditCard, LayoutDashboard, Zap, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AI_NAME } from "@/lib/kairo-identity";

const STEPS = [
  { icon: Store, label: "Connect your store", description: "Link your Shopify store to enable AI analysis" },
  { icon: ShoppingBag, label: "Install via Shopify", description: "Authorize access to your store data" },
  { icon: CreditCard, label: "Choose your growth plan", description: "Select Growth or above for full AI capabilities" },
  { icon: LayoutDashboard, label: "Return to dashboard", description: "Your store is now ready for optimization" },
  { icon: Zap, label: `Activate ${AI_NAME}`, description: "Turn on your AI-assisted growth co-pilot" },
];

interface ShopifyConnectionGateProps {
  open: boolean;
  onClose: () => void;
}

export default function ShopifyConnectionGate({ open, onClose }: ShopifyConnectionGateProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-primary/20 bg-card/95 backdrop-blur-xl">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-primary/[0.08] blur-[80px]" />
        </div>

        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-[0_0_40px_-8px_hsl(var(--primary)/0.5)]"
          >
            <Rocket className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-foreground"
          >
            🚀 Unlock AI Growth Engine
          </motion.h2>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed"
          >
            Connect your store to activate {AI_NAME} — your AI-assisted growth co-pilot that analyzes, drafts optimizations, and executes only the changes you approve
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative px-6 pb-2">
          <div className="space-y-1">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Step {i + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative px-6 pb-6 pt-2">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              asChild
              className="w-full h-12 text-base font-bold gap-2 rounded-xl shadow-[0_0_30px_-6px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_-4px_hsl(var(--primary)/0.5)] transition-all duration-300"
            >
              <Link to="/agency?tab=overview" onClick={onClose}>
                <Zap className="h-5 w-5" />
                Connect Store & Activate AI
              </Link>
            </Button>
          </motion.div>
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            Requires Shopify store connection · Growth plan or above recommended
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Inline banner version for pages */
export function StoreConnectionBanner({ onConnect }: { onConnect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.03] to-transparent p-6 sm:p-8 text-center"
    >
      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-[0_0_30px_-6px_hsl(var(--primary)/0.4)]">
        <Rocket className="h-7 w-7 text-primary-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        🚀 Connect your store to activate the AI Growth Engine
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {AI_NAME} needs access to your Shopify store to generate real AI insights, execute optimizations, and drive growth
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground"
          >
            <step.icon className="h-3 w-3 text-primary" />
            <span>{step.label}</span>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={onConnect}
        className="h-11 px-8 text-sm font-bold gap-2 rounded-xl shadow-[0_0_25px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_35px_-3px_hsl(var(--primary)/0.5)] transition-all duration-300"
      >
        <Zap className="h-4 w-4" />
        Activate AI Growth
      </Button>
    </motion.div>
  );
}
