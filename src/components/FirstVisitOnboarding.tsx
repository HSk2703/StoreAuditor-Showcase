import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, Zap, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FirstVisitOnboardingProps {
  onRunAudit: (url: string) => void;
  isRunning?: boolean;
}

const ONBOARDING_KEY = "sa_first_visit_done";

const FirstVisitOnboarding = ({ onRunAudit, isRunning }: FirstVisitOnboardingProps) => {
  const [show, setShow] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShow(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShow(false);
    onRunAudit(url.trim());
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl px-6 text-center"
          >
            {/* Animated orb */}
            <motion.div
              className="mx-auto mb-8 relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="h-20 w-20 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-[0_0_40px_-8px_hsl(217_91%_60%/0.5)]">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute inset-0 h-20 w-20 mx-auto rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
            >
              Let's Optimize Your Store
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm sm:text-base mb-8"
            >
              Enter your store URL to get instant AI-powered insights
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="relative rounded-xl border border-primary/20 bg-card glow-input overflow-hidden">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="yourstore.myshopify.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-12 h-14 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base sm:text-lg"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={isRunning}
                size="lg"
                className="w-full h-12 text-base gap-2 rounded-xl bg-gradient-to-r from-primary to-[hsl(250,70%,60%)] hover:from-primary/90 hover:to-[hsl(250,70%,55%)] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)] transition-all"
              >
                {isRunning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Run AI Audit <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> 60s analysis</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Free, no signup</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-primary" /> AI-powered</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={handleSkip}
              className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstVisitOnboarding;
