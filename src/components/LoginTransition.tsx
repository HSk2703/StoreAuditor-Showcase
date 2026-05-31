import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const LOADING_STEPS = [
  "Loading intelligence modules…",
  "Preparing your dashboard…",
  "Syncing AI insights…",
  "Initializing growth engine…",
];

interface LoginTransitionProps {
  phase: "loading" | "success" | null;
  onComplete: () => void;
}

const LoginTransition = ({ phase, onComplete }: LoginTransitionProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through loading steps
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % LOADING_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [phase]);

  // Animate progress bar during loading
  useEffect(() => {
    if (phase !== "loading") return;
    setProgress(0);
    const start = Date.now();
    const duration = 2400;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 0.92);
      setProgress(pct * 100);
      if (elapsed < duration) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [phase]);

  // When success phase hits, snap progress and trigger redirect
  useEffect(() => {
    if (phase !== "success") return;
    setProgress(100);
    const t = setTimeout(onComplete, 1500);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  if (!phase) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="login-transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
      >
        <div className="text-center px-6 max-w-md w-full">
          {phase === "loading" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Glowing icon */}
              <div className="relative mx-auto mb-8">
                <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center shadow-[0_0_50px_-6px_hsl(var(--primary)/0.45)]">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <motion.div
                  className="absolute inset-0 h-20 w-20 mx-auto rounded-full border-2 border-primary/25"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <h1 className="text-xl font-bold text-foreground mb-2">
                Initializing your AI Growth Engine
              </h1>

              {/* Dynamic step text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-muted-foreground mb-8"
                >
                  {LOADING_STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {phase === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {/* Checkmark circle */}
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-[0_0_40px_-8px_hsl(142_71%_45%/0.35)]">
                <motion.svg
                  className="h-10 w-10 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </motion.svg>
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                You're in. Let's grow your store 🚀
              </h1>
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginTransition;
