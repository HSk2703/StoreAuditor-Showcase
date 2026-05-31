import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, CheckCircle, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AI_NAME } from "@/lib/kairo-identity";
import { loadPermissions, savePermissions } from "@/lib/ai-permissions";
import AIMascot from "@/components/copilot/AIMascot";

interface Props {
  onComplete: () => void;
}

export default function AIOnboardingModal({ onComplete }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const perms = loadPermissions();
    if (!perms.onboardingCompleted) setOpen(true);
  }, []);

  const handleConfigure = () => {
    const perms = loadPermissions();
    savePermissions({ ...perms, onboardingCompleted: true });
    setOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    const perms = loadPermissions();
    savePermissions({ ...perms, onboardingCompleted: true });
    setOpen(false);
  };

  const features = [
    { icon: Zap, text: "AI drafts optimizations based on your store data" },
    { icon: Shield, text: "No changes happen without your explicit approval" },
    { icon: CheckCircle, text: "Every action is logged, reviewable, and reversible" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg border-border/30 bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
          <button onClick={handleSkip} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex justify-center mb-4">
            <AIMascot state="responding" size="lg" />
          </div>
          <h2 className="text-xl font-bold text-center text-foreground">
            Configure {AI_NAME} — AI-Assisted Mode
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {AI_NAME} prepares store optimizations. You stay in full control — every action requires your approval.
          </p>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-foreground">{f.text}</p>
            </motion.div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleConfigure} className="flex-1 gap-2">
              Configure Access <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleSkip} className="text-muted-foreground">
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
