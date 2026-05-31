import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Globe, ShoppingBag, Brain, FileText, TrendingUp, Sparkles } from "lucide-react";
import { getStepIndex } from "@/lib/audit-service";
import { Progress } from "@/components/ui/progress";

interface AuditProgressOverlayProps {
  status: string;
  error?: string | null;
}

const steps = [
  { key: "scraping_homepage", label: "Analyzing store structure", icon: Globe },
  { key: "scraping_products", label: "Simulating customer behavior", icon: ShoppingBag },
  { key: "analyzing", label: "Detecting conversion gaps", icon: Brain },
  { key: "generating_report", label: "Generating AI optimizations", icon: FileText },
];

const dynamicSubtext = [
  "Scanning hero section & navigation…",
  "Evaluating product page layouts…",
  "Checking trust signals & reviews…",
  "Analyzing mobile responsiveness…",
  "Measuring page load performance…",
  "Identifying conversion blockers…",
  "Comparing against top performers…",
  "Calculating revenue opportunities…",
];

const AuditProgressOverlay = ({ status, error }: AuditProgressOverlayProps) => {
  const currentIndex = getStepIndex(status);
  const isFailed = status === "failed";
  const isComplete = status === "completed";
  const [elapsed, setElapsed] = useState(0);
  const [subtextIdx, setSubtextIdx] = useState(0);

  useEffect(() => {
    if (isFailed || isComplete) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFailed, isComplete]);

  useEffect(() => {
    if (isFailed || isComplete) return;
    const interval = setInterval(() => {
      setSubtextIdx((prev) => (prev + 1) % dynamicSubtext.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFailed, isComplete]);

  const stepProgress = isComplete ? 100 : isFailed ? 0 : Math.min(95, (currentIndex / steps.length) * 100 + 10);
  const timeProgress = Math.min(90, (elapsed / 30) * 100);
  const progressPercent = isComplete ? 100 : Math.max(stepProgress, timeProgress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-lg"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[hsl(260_70%_55%/0.05)]" />
        
        <div className="relative mb-6 text-center">
          {!isFailed && !isComplete && (
            <div className="mx-auto mb-5 flex flex-col items-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary shadow-[0_0_40px_-8px_hsl(217_91%_60%/0.5)]">
                  <span className="text-3xl font-bold text-primary-foreground">{elapsed}s</span>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/10"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
              </div>
            </div>
          )}
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 shadow-[0_0_30px_-8px_hsl(142_71%_45%/0.3)]"
            >
              <CheckCircle className="h-10 w-10 text-success" />
            </motion.div>
          )}
          {isFailed && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-critical/10">
              <XCircle className="h-8 w-8 text-critical" />
            </div>
          )}
          <h2 className="text-lg font-bold text-foreground">
            {isFailed ? "Audit Failed" : isComplete ? "Audit Complete!" : "Running Conversion Audit"}
          </h2>
          
          {/* Dynamic subtext */}
          {!isFailed && !isComplete && (
            <AnimatePresence mode="wait">
              <motion.p
                key={subtextIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-2 text-xs text-muted-foreground"
              >
                {dynamicSubtext[subtextIdx]}
              </motion.p>
            </AnimatePresence>
          )}
          
          {error && <p className="mt-2 text-sm text-critical">{error}</p>}
        </div>

        {/* Progress Bar */}
        {!isFailed && (
          <div className="relative mb-5">
            <Progress value={progressPercent} className="h-2.5" />
            <span className="absolute right-0 top-3 text-[10px] text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
        )}

        <div className="relative space-y-2.5">
          {steps.map((step, i) => {
            const stepIdx = getStepIndex(step.key);
            const isActive = currentIndex === stepIdx && !isFailed && !isComplete;
            const isDone = currentIndex > stepIdx || isComplete;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  isActive
                    ? "border-primary/30 bg-primary/5 shadow-[0_0_12px_-4px_hsl(217_91%_60%/0.2)]"
                    : isDone
                    ? "border-success/20 bg-success/5"
                    : "border-border/50 bg-card/50"
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : isDone
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                  ) : isDone ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? "text-primary" : isDone ? "text-success" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Animated mini stats appearing */}
        {!isFailed && !isComplete && elapsed > 8 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-5 flex items-center justify-center gap-4 text-[11px] text-muted-foreground"
          >
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> AI processing</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-primary" /> Building insights</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AuditProgressOverlay;
