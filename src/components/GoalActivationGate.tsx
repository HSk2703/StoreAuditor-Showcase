import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Store, ShoppingBag, CreditCard, Zap, Target, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AI_NAME } from "@/lib/kairo-identity";

const STEPS = [
  { icon: Store, label: "Connect Store", description: "Link your Shopify store" },
  { icon: ShoppingBag, label: "Install via Shopify", description: "Authorize store data access" },
  { icon: CreditCard, label: "Choose plan", description: "Growth or above for AI execution" },
  { icon: Zap, label: `Activate ${AI_NAME}`, description: "Enable your AI Growth Engine" },
  { icon: Target, label: "Create Goals", description: "Set targets and let AI execute" },
];

interface GoalActivationGateProps {
  open: boolean;
  onClose: () => void;
}

export default function GoalActivationGate({ open, onClose }: GoalActivationGateProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-primary/20 bg-card/95 backdrop-blur-xl">
        <div className="relative px-6 pt-8 pb-4 text-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-primary/[0.08] blur-[80px]" />
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-[0_0_40px_-8px_hsl(var(--primary)/0.5)]"
          >
            <Target className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative text-xl font-bold text-foreground"
          >
            🎯 Activate AI Growth Engine
          </motion.h2>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed"
          >
            Connect your store and activate {AI_NAME} to start setting and achieving growth goals
          </motion.p>
        </div>

        <div className="px-6 pb-2">
          <div className="space-y-1">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <div className="h-6 w-6 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button asChild size="lg" className="w-full h-12 text-base font-bold rounded-xl gap-2 shadow-[0_0_30px_-6px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_-4px_hsl(var(--primary)/0.5)] transition-all duration-300">
              <Link to="/auto-pilot">
                <Sparkles className="h-4 w-4" /> Connect & Activate
              </Link>
            </Button>
          </motion.div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
            I'll do this later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
