import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import { HeartbeatBadge } from "@/components/HeartbeatBadge";
import FeatureProgressOverlay from "@/components/FeatureProgressOverlay";
import { useSubscription } from "@/hooks/useSubscription";
import { useAICredits } from "@/hooks/useAICredits";
import CreditCostBadge from "@/components/CreditCostBadge";
import CreditLimitModal from "@/components/CreditLimitModal";
import FeatureGate from "@/components/FeatureGate";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Brain, Heart, Zap, Shield, Eye, TrendingUp, Target, AlertTriangle, Loader2, ArrowUpRight, Sparkles } from "lucide-react";
import SuggestionFeedback from "@/components/SuggestionFeedback";
import { generateSuggestionId } from "@/lib/decision-tracking";
import {
  runEmotionalAnalysis,
  getEmotionalAnalysisHistory,
  type EmotionalAnalysisRun,
  type EmotionalState,
  type DynamicAdjustment,
} from "@/lib/emotional-analysis-service";

const emotionConfig: Record<string, { icon: React.ReactNode; color: string; ring: string; bg: string }> = {
  trust: { icon: <Shield className="h-5 w-5" />, color: "text-emerald-500", ring: "ring-emerald-500/30", bg: "bg-emerald-500" },
  urgency: { icon: <Zap className="h-5 w-5" />, color: "text-amber-500", ring: "ring-amber-500/30", bg: "bg-amber-500" },
  hesitation: { icon: <AlertTriangle className="h-5 w-5" />, color: "text-rose-500", ring: "ring-rose-500/30", bg: "bg-rose-500" },
  excitement: { icon: <Sparkles className="h-5 w-5" />, color: "text-violet-500", ring: "ring-violet-500/30", bg: "bg-violet-500" },
  curiosity: { icon: <Eye className="h-5 w-5" />, color: "text-sky-500", ring: "ring-sky-500/30", bg: "bg-sky-500" },
  anxiety: { icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-500", ring: "ring-red-500/30", bg: "bg-red-500" },
  confidence: { icon: <Heart className="h-5 w-5" />, color: "text-blue-500", ring: "ring-blue-500/30", bg: "bg-blue-500" },
};

export default function EmotionalPersonalization() {
  const { userId, loading: subLoading } = useSubscription();
  const { checkAndDeduct, canAfford } = useAICredits();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal, requireConnection } = useStoreConnection();
  const [storeUrl, setStoreUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState<EmotionalAnalysisRun | null>(null);
  const [history, setHistory] = useState<EmotionalAnalysisRun[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (userId) getEmotionalAnalysisHistory(userId).then(setHistory).catch(console.error);
  }, [userId]);

  const handleRun = async () => {
    if (!requireConnection()) return;
    if (!storeUrl.trim() || !userId) return;
    const creditResult = await checkAndDeduct("emotional_personalization");
    if (!creditResult.allowed) { setShowLimitModal(true); return; }
    setRunning(true);
    try {
      const result = await runEmotionalAnalysis(storeUrl.trim(), userId);
      setActiveRun(result);
      setHistory((prev) => [result, ...prev]);
      toast.success("Emotional analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <FeatureGate feature="emotional_personalization">
          <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Emotional Persuasion Layer</h1>
              </div>
              <p className="text-muted-foreground text-sm">Detect visitor emotional states and optimize store elements dynamically</p>
            </motion.div>

            {/* Input */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input placeholder="Enter Shopify store URL" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} disabled={running} className="flex-1" />
                  <Button onClick={handleRun} disabled={running || !storeUrl.trim() || subLoading || !canAfford("emotional_personalization")} className="gap-2 shrink-0">
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                    {running ? "Analyzing…" : "Run Analysis"}
                  </Button>
                  <CreditCostBadge feature="emotional_personalization" />
                </div>
              </CardContent>
            </Card>

            {/* Countdown overlay */}
            <AnimatePresence>
              <FeatureProgressOverlay
                isRunning={running}
                title="Analyzing Emotional Signals"
                steps={["Scanning store elements...", "Detecting emotional triggers...", "Mapping persuasion patterns...", "Generating optimizations..."]}
                duration={20}
              />
            </AnimatePresence>

            {/* Connection Gate */}
            {!hasConnectedStore && !activeRun && (
              <StoreConnectionBanner onConnect={() => setShowConnectionModal(true)} />
            )}
            <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />

            {activeRun && (activeRun.status === "running" || activeRun.status === "pending") && (
              <Card>
                <CardContent className="py-3 flex items-center gap-3">
                  <HeartbeatBadge status={activeRun.status} lastHeartbeatAt={activeRun.last_heartbeat_at} />
                  <p className="text-sm text-muted-foreground truncate">Analyzing {activeRun.store_url}</p>
                </CardContent>
              </Card>
            )}

            {/* Results — Visual First */}
            {activeRun?.status === "completed" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Score Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreCard label="Persuasion Score" value={activeRun.persuasion_score ?? 0} max={100} icon={<Heart className="h-4 w-4" />} />
                  <ScoreCard label="Conv Uplift" value={activeRun.predicted_conversion_uplift ?? 0} max={50} suffix="%" icon={<TrendingUp className="h-4 w-4" />} />
                  <ScoreCard label="Trust Index" value={activeRun.analytics?.trust_index ?? 0} max={100} icon={<Shield className="h-4 w-4" />} />
                  <ScoreCard label="Resonance" value={activeRun.analytics?.emotional_resonance ?? 0} max={100} icon={<Brain className="h-4 w-4" />} />
                </div>

                {/* Visual Emotion Meters */}
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Detected Emotional States</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {activeRun.emotional_states.map((es, i) => (
                        <EmotionMeter key={i} state={es} index={i} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs — Adjustments, Analytics, Summary */}
                <Tabs defaultValue="adjustments" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="adjustments">Optimizations</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>

                  <TabsContent value="adjustments" className="space-y-3">
                    {activeRun.dynamic_adjustments.map((adj, i) => (
                      <AdjustmentCard key={i} adj={adj} index={i} />
                    ))}
                  </TabsContent>

                  <TabsContent value="analytics">
                    <AnalyticsPanel analytics={activeRun.analytics} />
                  </TabsContent>

                  <TabsContent value="summary">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{activeRun.ai_summary}</p>
                        <SuggestionFeedback
                          featureName="emotional_analysis"
                          suggestionId={generateSuggestionId("emotional", "summary", 0)}
                          content={activeRun.ai_summary ?? ""}
                          showEdit
                          className="mt-3"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Previous Analyses</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {history.map((run) => (
                    <Card key={run.id} className={`cursor-pointer transition-colors hover:border-primary/40 ${activeRun?.id === run.id ? "border-primary" : ""}`} onClick={() => setActiveRun(run)}>
                      <CardContent className="pt-4 pb-3 space-y-1">
                        <p className="text-sm font-medium truncate text-foreground">{run.store_url}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Badge variant={run.status === "completed" ? "default" : "secondary"} className="text-xs">{run.status}</Badge>
                            <HeartbeatBadge status={run.status} lastHeartbeatAt={run.last_heartbeat_at} />
                          </div>
                          {run.persuasion_score != null && <span>Score: {run.persuasion_score}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FeatureGate>
      </main>
      <Footer />
      <CreditLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}

/* ── Visual Emotion Meter ── */
function EmotionMeter({ state, index }: { state: EmotionalState; index: number }) {
  const cfg = emotionConfig[state.state] || emotionConfig.trust;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (state.intensity / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
    >
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r={radius} fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
            className={cfg.color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{state.intensity}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cfg.color}>{cfg.icon}</span>
        <span className="text-xs font-semibold capitalize text-foreground">{state.state}</span>
      </div>
    </motion.div>
  );
}

/* ── Score Card with radial fill ── */
function ScoreCard({ label, value, max, suffix, icon }: { label: string; value: number; max: number; suffix?: string; icon: React.ReactNode }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold text-foreground mb-2">
          {typeof value === "number" ? value.toFixed(1) : value}{suffix}
        </p>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Adjustment Card — visual comparison ── */
function AdjustmentCard({ adj, index }: { adj: DynamicAdjustment; index: number }) {
  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}>
      <Card>
        <CardContent className="pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">{adj.element.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={priorityColors[adj.priority]}>{adj.priority}</Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                +{adj.expected_uplift_percent}% <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Badge>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Current</p>
              <p className="text-sm text-foreground">{adj.current_version}</p>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-[10px] font-medium text-primary mb-1 uppercase tracking-wider">Optimized</p>
              <p className="text-sm text-foreground">{adj.optimized_version}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Analytics — visual gauges ── */
function AnalyticsPanel({ analytics }: { analytics: EmotionalAnalysisRun["analytics"] }) {
  if (!analytics) return <p className="text-muted-foreground text-sm">No analytics data</p>;
  const metrics = [
    { label: "Trust Index", value: analytics.trust_index, color: "bg-emerald-500" },
    { label: "Urgency Effectiveness", value: analytics.urgency_effectiveness, color: "bg-amber-500" },
    { label: "Social Proof", value: analytics.social_proof_strength, color: "bg-sky-500" },
    { label: "Emotional Resonance", value: analytics.emotional_resonance, color: "bg-violet-500" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                <span className="text-lg font-bold text-foreground">{m.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${m.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {analytics.persuasion_gaps?.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Persuasion Gaps ({analytics.friction_points} friction points)</p>
            <div className="flex flex-wrap gap-2">
              {analytics.persuasion_gaps.map((gap, i) => (
                <Badge key={i} variant="outline">{gap}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
