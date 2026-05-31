import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FeatureProgressOverlayProps {
  isRunning: boolean;
  title: string;
  steps: string[];
  /** Duration in seconds for the countdown */
  duration?: number;
}

const FeatureProgressOverlay = ({ isRunning, title, steps, duration = 20 }: FeatureProgressOverlayProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!isRunning) return null;

  const progress = Math.min(95, (elapsed / duration) * 100);
  const currentStepIndex = Math.min(steps.length - 1, Math.floor((elapsed / duration) * steps.length));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-8 rounded-xl border border-primary/20 bg-card p-8 text-center space-y-5"
    >
      <div className="mx-auto flex flex-col items-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 mb-3">
          <span className="text-2xl font-bold text-primary-foreground">{elapsed}s</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <Progress value={progress} className="h-2 max-w-sm mx-auto" />
      <div className="space-y-2 max-w-xs mx-auto">
        {steps.map((step, i) => (
          <div key={i} className={`flex items-center gap-2 text-sm transition-colors ${
            i < currentStepIndex ? "text-success" : i === currentStepIndex ? "text-primary font-medium" : "text-muted-foreground"
          }`}>
            {i < currentStepIndex ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : i === currentStepIndex ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-border shrink-0" />
            )}
            {step}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FeatureProgressOverlay;
