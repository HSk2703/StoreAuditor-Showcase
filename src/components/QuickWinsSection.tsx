import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, CheckCircle, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate from "@/components/ShopifyConnectionGate";

interface QuickWin {
  title: string;
  description: string;
  impact: string;
  effort: string;
  category: string;
}

interface QuickWinsSectionProps {
  recommendations: any[];
  overallScore: number;
}

const QuickWinsSection = ({ recommendations, overallScore }: QuickWinsSectionProps) => {
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [previewWin, setPreviewWin] = useState<QuickWin | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConnectionGate, setShowConnectionGate] = useState(false);
  const { hasConnectedStore } = useStoreConnection();

  const quickWins: QuickWin[] = recommendations
    .filter((r: any) => r.effort === "quick_win" || r.priority === "critical" || r.priority === "high")
    .slice(0, 5)
    .map((r: any) => ({
      title: r.title,
      description: r.description,
      impact: r.priority === "critical" ? "+8-12% conversion" : r.priority === "high" ? "+5-8% conversion" : "+2-4% conversion",
      effort: r.effort === "quick_win" ? "5 min" : "15 min",
      category: r.category || "Optimization",
    }));

  if (quickWins.length === 0) return null;

  const appliedCount = appliedIds.size;
  const progressScore = Math.min(100, overallScore + appliedCount * 3);
  const targetScore = Math.min(100, overallScore + quickWins.length * 3);

  const handleApply = (idx: number) => {
    if (!hasConnectedStore) {
      setShowConnectionGate(true);
      return;
    }
    setPreviewWin(quickWins[idx]);
  };

  const confirmApply = () => {
    if (!previewWin) return;
    const idx = quickWins.indexOf(previewWin);
    setAppliedIds(prev => new Set(prev).add(idx));
    setPreviewWin(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Wins You Can Apply Now
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">High-impact fixes that take minutes, not hours</p>
        </div>
      </div>

      {/* Store connection required banner */}
      {!hasConnectedStore && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4 mb-4 flex items-center gap-3"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Connect your store to apply AI-powered optimizations</p>
            <p className="text-xs text-muted-foreground">Shopify connection required to execute changes</p>
          </div>
          <Button size="sm" className="shrink-0 gap-1.5 rounded-full shadow-[0_0_15px_-4px_hsl(var(--primary)/0.3)]" onClick={() => setShowConnectionGate(true)}>
            <Zap className="h-3.5 w-3.5" /> Connect
          </Button>
        </motion.div>
      )}

      {/* Progress momentum */}
      <div className="rounded-lg border border-border bg-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Your store is {progressScore}% optimized
          </span>
          <span className="text-xs text-muted-foreground">
            Apply {Math.max(0, quickWins.length - appliedCount)} more to reach {targetScore}%
          </span>
        </div>
        <Progress value={progressScore} className="h-2.5" />
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {quickWins.map((win, i) => {
          const isApplied = appliedIds.has(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className={`rounded-xl border p-4 transition-all ${
                isApplied
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-semibold text-foreground">{win.title}</h4>
                {isApplied && <CheckCircle className="h-4 w-4 text-success shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{win.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <TrendingUp className="h-2.5 w-2.5" /> {win.impact}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    ⚡ {win.effort}
                  </span>
                </div>
                {!isApplied && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleApply(i)}>
                    Apply Fix <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Preview/Confirm Dialog */}
      <Dialog open={!!previewWin} onOpenChange={() => setPreviewWin(null)}>
        <DialogContent className="sm:max-w-md border-primary/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Apply: {previewWin?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{previewWin?.description}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Before</p>
                <p className="text-sm font-semibold text-critical">Needs Fix</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 rounded-lg border border-success/30 bg-success/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">After</p>
                <p className="text-sm font-semibold text-success">Optimized</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Expected impact: {previewWin?.impact}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewWin(null)}>Cancel</Button>
            <Button onClick={confirmApply} className="gap-1.5 shadow-[0_0_15px_-4px_hsl(var(--primary)/0.3)]">
              <CheckCircle className="h-3.5 w-3.5" /> Confirm & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success toast overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl border border-success/30 bg-card p-4 shadow-lg flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Fix Applied</p>
              <p className="text-xs text-muted-foreground">Your optimization score has increased</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShopifyConnectionGate open={showConnectionGate} onClose={() => setShowConnectionGate(false)} />
    </motion.div>
  );
};

export default QuickWinsSection;
