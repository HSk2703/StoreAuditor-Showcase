import { useState, useEffect } from "react";
import FeatureProgressOverlay from "@/components/FeatureProgressOverlay";
import { AnimatePresence } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { useAICredits } from "@/hooks/useAICredits";
import CreditCostBadge from "@/components/CreditCostBadge";
import CreditLimitModal from "@/components/CreditLimitModal";
import FeatureGate from "@/components/FeatureGate";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  DollarSign, Loader2, Rocket, AlertTriangle, FlaskConical,
  TrendingUp, Target, ArrowUpRight, Clock, Zap, Shield, BarChart3,
} from "lucide-react";
import SuggestionFeedback from "@/components/SuggestionFeedback";
import { generateSuggestionId } from "@/lib/decision-tracking";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  runRevenueEngine, getRevenueEngineHistory,
  type RevenueEngineRun, type DetectedIssue, type Experiment, type PrioritizedAction,
} from "@/lib/revenue-engine-service";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import { HeartbeatBadge } from "@/components/HeartbeatBadge";

const severityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

export default function RevenueEngine() {
  const { userId, loading: subLoading } = useSubscription();
  const { checkAndDeduct, canAfford } = useAICredits();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal, requireConnection } = useStoreConnection();
  const [storeUrl, setStoreUrl] = useState("");
  const [revenue, setRevenue] = useState("");
  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState<RevenueEngineRun | null>(null);
  const [history, setHistory] = useState<RevenueEngineRun[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (userId) getRevenueEngineHistory(userId).then(setHistory).catch(console.error);
  }, [userId]);

  const handleRun = async () => {
    if (!requireConnection()) return;
    if (!storeUrl.trim() || !userId) return;
    const creditResult = await checkAndDeduct("revenue_engine");
    if (!creditResult.allowed) { setShowLimitModal(true); return; }
    setRunning(true);
    try {
      const result = await runRevenueEngine(storeUrl.trim(), userId, undefined, revenue ? parseFloat(revenue) : undefined);
      setActiveRun(result);
      setHistory((prev) => [result, ...prev]);
      toast.success("Revenue engine analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  // Build chart data from experiments
  const experimentChartData = activeRun?.experiments?.map((exp) => ({
    name: exp.name.substring(0, 20),
    uplift: exp.variations?.[0]?.predicted_uplift_percent || 0,
    revenue: exp.expected_monthly_revenue_gain || 0,
  })) || [];

  const issueImpactData = activeRun?.detected_issues?.slice(0, 6).map((issue) => ({
    name: issue.title.substring(0, 18),
    impact: issue.estimated_revenue_impact_monthly || 0,
  })) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <FeatureGate feature="revenue_engine">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Autonomous Revenue Engine</h1>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Agency</Badge>
              </div>
              <p className="text-muted-foreground text-sm">AI-powered issue detection, automated A/B test design, and micro-experiment roadmaps</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Shopify store URL" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} disabled={running} className="flex-1" />
                    <Input placeholder="Monthly revenue (optional)" value={revenue} onChange={(e) => setRevenue(e.target.value)} disabled={running} type="number" className="sm:w-56" />
                  </div>
                  <Button onClick={handleRun} disabled={running || !storeUrl.trim() || subLoading || !canAfford("revenue_engine")} className="gap-2 self-start">
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                    {running ? "Analyzing…" : "Launch Revenue Engine"}
                  </Button>
                  <CreditCostBadge feature="revenue_engine" />
                </div>
              </CardContent>
            </Card>

            {/* Countdown overlay */}
            <AnimatePresence>
              <FeatureProgressOverlay
                isRunning={running}
                title="Launching Revenue Engine"
                steps={["Analyzing store data...", "Detecting revenue leaks...", "Designing experiments...", "Building strategy..."]}
                duration={25}
              />
            </AnimatePresence>

            {/* Connection Gate */}
            {!hasConnectedStore && !activeRun && (
              <StoreConnectionBanner onConnect={() => setShowConnectionModal(true)} />
            )}
            <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />

            {activeRun && (activeRun.status === "running" || activeRun.status === "pending") && (
              <Card className="border-border">
                <CardContent className="py-3 flex items-center gap-3">
                  <HeartbeatBadge status={activeRun.status} lastHeartbeatAt={activeRun.last_heartbeat_at} />
                  <p className="text-sm text-muted-foreground truncate">Analyzing {activeRun.store_url}</p>
                </CardContent>
              </Card>
            )}

            {activeRun?.status === "completed" && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Predicted Revenue", value: `$${fmt(activeRun.predicted_monthly_revenue)}`, icon: <DollarSign className="h-5 w-5" />, color: "text-success" },
                    { label: "Revenue Uplift", value: `+${activeRun.predicted_revenue_uplift?.toFixed(1)}%`, icon: <TrendingUp className="h-5 w-5" />, color: "text-primary" },
                    { label: "Issues Found", value: String(activeRun.detected_issues.length), icon: <AlertTriangle className="h-5 w-5" />, color: "text-destructive" },
                    { label: "Confidence", value: `${activeRun.confidence_score?.toFixed(0)}%`, icon: <Target className="h-5 w-5" />, color: "text-primary" },
                  ].map((kpi) => (
                    <Card key={kpi.label} className="border-border overflow-hidden">
                      <CardContent className="pt-5 pb-4">
                        <div className={`flex items-center gap-2 mb-2 ${kpi.color}`}>{kpi.icon}<span className="text-xs font-medium text-muted-foreground">{kpi.label}</span></div>
                        <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                        {kpi.label === "Confidence" && <Progress value={activeRun.confidence_score || 0} className="h-1.5 mt-2" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Visual Charts */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Experiment Uplift Chart */}
                  {experimentChartData.length > 0 && (
                    <Card className="border-border">
                      <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /> Experiment Uplift Comparison</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={experimentChartData} margin={{ left: 0, right: 10 }}>
                              <XAxis dataKey="name" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                              <YAxis tickFormatter={(v) => `+${v}%`} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`+${v}%`, "Predicted Uplift"]} />
                              <Bar dataKey="uplift" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Revenue Impact by Issue */}
                  {issueImpactData.length > 0 && (
                    <Card className="border-border">
                      <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Revenue Lost per Issue</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueImpactData} layout="vertical" margin={{ left: 0, right: 20 }}>
                              <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                              <YAxis type="category" dataKey="name" width={100} fontSize={10} stroke="hsl(var(--muted-foreground))" />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}/mo`, "Lost Revenue"]} />
                              <Bar dataKey="impact" radius={[0, 6, 6, 0]} fill="hsl(0, 70%, 55%)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Tabs defaultValue="experiments" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="experiments">Experiments</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                  </TabsList>

                  <TabsContent value="experiments" className="space-y-3">
                    {activeRun.experiments.map((exp, i) => (
                      <ExperimentCard key={i} experiment={exp} />
                    ))}
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-3">
                    {activeRun.prioritized_actions.sort((a, b) => a.rank - b.rank).map((action, i) => (
                      <ActionCard key={i} action={action} />
                    ))}
                  </TabsContent>

                  <TabsContent value="issues" className="space-y-3">
                    {activeRun.detected_issues.map((issue, i) => (
                      <IssueCard key={i} issue={issue} />
                    ))}
                  </TabsContent>
                </Tabs>
              </>
            )}

            {history.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Previous Runs</h2>
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
                          {run.predicted_revenue_uplift != null && <span>+{run.predicted_revenue_uplift.toFixed(1)}%</span>}
                        </div>
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

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const typeLabels: Record<string, string> = { ab_test: "A/B Test", multivariate: "Multivariate", personalization: "Personalization", price_test: "Price Test" };
  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{experiment.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{typeLabels[experiment.type] || experiment.type}</Badge>
            <Badge variant="outline" className={severityColors[experiment.priority]}>{experiment.priority}</Badge>
          </div>
        </div>

        {/* A/B Test Visual Comparison */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Control</p>
            </div>
            <p className="text-sm text-foreground">{experiment.control}</p>
          </div>
          {experiment.variations.map((v, i) => (
            <div key={i} className="rounded-lg border border-primary/20 bg-primary/5 p-3 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">{v.name}</p>
                </div>
                <Badge className="bg-success/10 text-success border-success/20 text-xs gap-0.5">
                  +{v.predicted_uplift_percent}% <ArrowUpRight className="h-3 w-3" />
                </Badge>
              </div>
              <p className="text-sm text-foreground">{v.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {experiment.estimated_duration_days}d</span>
          <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {experiment.traffic_allocation_percent}% traffic</span>
          <span className="flex items-center gap-1 text-success font-medium"><DollarSign className="h-3 w-3" /> +${fmt(experiment.expected_monthly_revenue_gain)}/mo</span>
        </div>
        <SuggestionFeedback
          featureName="revenue_engine"
          suggestionId={generateSuggestionId("revenue", experiment.name, 0)}
          content={experiment.hypothesis}
          showEdit
          className="mt-2"
        />
      </CardContent>
    </Card>
  );
}

function IssueCard({ issue }: { issue: DetectedIssue }) {
  return (
    <Card className="border-border">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-semibold text-foreground text-sm">{issue.title}</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={severityColors[issue.severity]}>{issue.severity}</Badge>
            <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-xs">-${fmt(issue.estimated_revenue_impact_monthly)}/mo</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{issue.description}</p>
      </CardContent>
    </Card>
  );
}

function ActionCard({ action }: { action: PrioritizedAction }) {
  const catColors: Record<string, string> = { quick_win: "bg-success/10 text-success", experiment: "bg-primary/10 text-primary", strategic: "bg-violet-500/10 text-violet-600" };
  return (
    <Card className="border-border">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{action.rank}</div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">{action.action}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={catColors[action.category] || ""}>{action.category.replace("_", " ")}</Badge>
              <Badge variant="outline" className="text-xs">{action.effort} effort</Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">+${fmt(action.expected_revenue_gain)}/mo</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
