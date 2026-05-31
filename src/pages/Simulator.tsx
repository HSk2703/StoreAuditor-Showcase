import { useState, useEffect } from "react";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Users, TrendingUp, ShoppingCart, ArrowRight, Loader2, Clock,
  Smartphone, Monitor, Tablet, MapPin, Target, AlertTriangle, CheckCircle,
  XCircle, BarChart3, Zap, Eye, Heart,
} from "lucide-react";
import FeatureProgressOverlay from "@/components/FeatureProgressOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import FeatureGate from "@/components/FeatureGate";
import UpgradeBanner from "@/components/UpgradeBanner";
import UpgradeTrigger from "@/components/UpgradeTrigger";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import {
  runSimulation, saveSimulationRun, logFeatureUsage, getSimulationRuns,
  getMonthlySimulationCount, type SimulationResults, type SimulationPersona,
} from "@/lib/simulation-service";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  FunnelChart, Funnel, LabelList, PieChart, Pie,
} from "recharts";

const deviceIcon = (device: string) => {
  if (device === "mobile") return <Smartphone className="h-4 w-4" />;
  if (device === "tablet") return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
};

const outcomeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  purchased: { color: "text-success", icon: <CheckCircle className="h-4 w-4" /> },
  abandoned_cart: { color: "text-warning", icon: <ShoppingCart className="h-4 w-4" /> },
  bounced: { color: "text-destructive", icon: <XCircle className="h-4 w-4" /> },
  left_at_checkout: { color: "text-warning", icon: <AlertTriangle className="h-4 w-4" /> },
  added_to_cart_only: { color: "text-muted-foreground", icon: <ShoppingCart className="h-4 w-4" /> },
};

const FUNNEL_COLORS = ["hsl(215, 70%, 55%)", "hsl(200, 65%, 50%)", "hsl(170, 60%, 45%)", "hsl(140, 55%, 45%)", "hsl(100, 50%, 45%)"];
const DROP_COLORS = ["hsl(0, 80%, 60%)", "hsl(25, 85%, 55%)", "hsl(45, 80%, 50%)", "hsl(100, 50%, 50%)"];

const PersonaCard = ({ persona }: { persona: SimulationPersona }) => {
  const oc = outcomeConfig[persona?.outcome] || outcomeConfig.bounced;
  if (!persona) return null;
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {persona.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{persona.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {persona.age}y • {persona.gender} • {persona.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {deviceIcon(persona.device)}
            <Badge variant="outline" className="text-xs capitalize">
              {persona.intent.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {(["trust", "urgency", "hesitation", "excitement"] as const).map((emotion) => (
            <div key={emotion} className="text-center">
              <p className="text-[10px] text-muted-foreground capitalize">{emotion}</p>
              <Progress value={persona.emotional_state?.[emotion] ?? 0} className="h-1.5 mt-1" />
              <p className="text-xs font-medium mt-0.5">{persona.emotional_state?.[emotion] ?? 0}%</p>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">Journey ({(persona.journey ?? []).length} steps)</p>
          <div className="relative pl-4 space-y-3 border-l-2 border-primary/20">
            {(persona.journey ?? []).map((step, si) => {
              const riskHue = Math.max(0, 120 - step.drop_off_risk * 1.2);
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.08 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[calc(1rem+5px)] top-1 h-2.5 w-2.5 rounded-full border-2 border-background"
                    style={{ backgroundColor: `hsl(${riskHue} 60% 50%)` }}
                  />
                  <div className="rounded-md border border-border bg-card/60 p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">{step.page}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">{step.duration_seconds}s</span>
                        <div
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `hsl(${riskHue} 60% 95%)`,
                            color: `hsl(${riskHue} 60% 35%)`,
                          }}
                        >
                          {step.drop_off_risk}% risk
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{step.action}</p>
                    {step.emotional_shift && (
                      <p className="text-[10px] text-primary/80 mt-1 flex items-center gap-1">
                        <Heart className="h-2.5 w-2.5" /> {step.emotional_shift}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className={`flex items-center gap-1.5 text-sm font-medium ${oc.color}`}>
            {oc.icon}
            <span className="capitalize">{persona.outcome.replace(/_/g, " ")}</span>
          </div>
          <span className="text-sm font-semibold text-foreground">${(persona.estimated_cart_value ?? 0).toFixed(0)}</span>
        </div>
        {persona.abandonment_reason && (
          <p className="text-xs text-muted-foreground italic">"{persona.abandonment_reason}"</p>
        )}
      </CardContent>
    </Card>
  );
};

/** Funnel chart from drop-off analysis */
const FunnelViz = ({ dropOff }: { dropOff: SimulationResults["drop_off_analysis"] }) => {
  const data = dropOff.map((d, i) => ({
    name: d.page,
    value: 100 - d.drop_off_percentage,
    dropOff: d.drop_off_percentage,
    fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
  }));

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" width={90} fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(v: number) => [`${v.toFixed(0)}% retained`, "Users"]}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

/** Drop-off bar chart */
const DropOffChart = ({ dropOff }: { dropOff: SimulationResults["drop_off_analysis"] }) => {
  const data = dropOff.map((d, i) => ({
    name: d.page,
    value: d.drop_off_percentage,
    reason: d.primary_reason,
    fix: d.fix_suggestion,
    fill: DROP_COLORS[Math.min(Math.floor(d.drop_off_percentage / 25), 3)],
  }));

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Drop-off Hotspots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={(v) => `${v}%`} fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-[220px]">
                      <p className="text-sm font-semibold text-foreground">{d.name}</p>
                      <p className="text-xs text-destructive font-medium">{d.value}% drop-off</p>
                      <p className="text-xs text-muted-foreground mt-1">{d.reason}</p>
                      <p className="text-xs text-primary mt-1">💡 {d.fix}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

/** Scroll depth / engagement heatmap */
const EngagementHeatmap = ({ insights }: { insights: SimulationResults["heatmap_insights"] }) => {
  const sections = [
    { name: "Hero / Header", engagement: 90 },
    { name: "Product Grid", engagement: 70 },
    { name: "Trust Section", engagement: 55 },
    { name: "Reviews", engagement: 45 },
    { name: "Footer / CTA", engagement: 30 },
  ];

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Scroll Depth Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sections.map((s, i) => {
            const hue = s.engagement > 60 ? 140 : s.engagement > 40 ? 45 : 0;
            return (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0 text-right">{s.name}</span>
                <div className="flex-1 h-6 rounded-md overflow-hidden bg-muted/30 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.engagement}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="h-full rounded-md"
                    style={{ background: `hsl(${hue}, 60%, 50%)` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-foreground">{s.engagement}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-success mb-1.5 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> High Engagement</p>
            <ul className="space-y-1">
              {insights.high_engagement_areas.map((area, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success mt-1.5 shrink-0" />{area}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-destructive mb-1.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Low Engagement</p>
            <ul className="space-y-1">
              {insights.low_engagement_areas.map((area, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />{area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Simulator = () => {
  const [storeUrl, setStoreUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [previousRuns, setPreviousRuns] = useState<any[]>([]);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const { toast } = useToast();
  const { plan, planConfig, userId, canAccess, loading: subLoading, isAdmin } = useSubscription();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal, requireConnection } = useStoreConnection();

  const hasAccess = canAccess("cognitive_simulator");
  const simsLeft = isAdmin || planConfig.simulationsPerMonth === -1
    ? "Unlimited" : Math.max(0, planConfig.simulationsPerMonth - monthlyCount);
  const isAtLimit = !isAdmin && planConfig.simulationsPerMonth !== -1 && monthlyCount >= planConfig.simulationsPerMonth;

  useEffect(() => {
    if (!userId) return;
    getSimulationRuns(userId).then(setPreviousRuns).catch(console.error);
    getMonthlySimulationCount(userId).then(setMonthlyCount).catch(console.error);
  }, [userId]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireConnection()) return;
    if (!storeUrl.trim() || !userId) return;
    if (isAtLimit) {
      toast({ title: "Simulation limit reached", description: "Upgrade your plan for more simulations.", variant: "destructive" });
      return;
    }
    setIsRunning(true);
    setResults(null);
    try {
      await logFeatureUsage(userId, "cognitive_simulator", plan, { store_url: storeUrl });
      const simResults = await runSimulation(storeUrl.trim(), 5);
      setResults(simResults);
      await saveSimulationRun(userId, storeUrl.trim(), simResults);
      setMonthlyCount((c) => c + 1);
      toast({
        title: "Simulation complete",
        description: "AI shopper simulation finished successfully.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Simulation failed";
      toast({ title: "Simulation Failed", description: msg, variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const loadPreviousResult = (run: any) => {
    if (run.results) {
      setResults(run.results as SimulationResults);
      setStoreUrl(run.store_url);
    }
  };

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <Header />
      <main className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <PageBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Cognitive Shopper Simulator" }]} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Cognitive Shopper Simulator</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            AI-powered simulation engine that generates realistic shopper personas to predict conversion behavior
          </p>
        </motion.div>

        <UpgradeBanner />

        <FeatureGate feature="cognitive_simulator">
          {/* Input Form */}
          <motion.form onSubmit={handleRun} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-8 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">Store URL</label>
              <span className="text-xs text-muted-foreground">
                {typeof simsLeft === "number" ? `${simsLeft} simulation${simsLeft !== 1 ? "s" : ""} left this month` : "Unlimited simulations"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input type="url" placeholder="https://your-store.myshopify.com" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} className="h-12 flex-1" required />
              <Button type="submit" disabled={isRunning || isAtLimit || !hasAccess} className="gap-2 min-h-[44px] h-12 w-full sm:w-auto">
                {isRunning ? <><Loader2 className="h-4 w-4 animate-spin" /> Simulating...</> : <><Brain className="h-4 w-4" /> Run Simulation</>}
              </Button>
            </div>
            {isAtLimit && <p className="mt-2 text-xs text-destructive">Monthly limit reached. <a href="/pricing" className="underline">Upgrade</a> for more.</p>}
          </motion.form>

          {/* Running indicator */}
          <AnimatePresence>
            <FeatureProgressOverlay
              isRunning={isRunning}
              title="Generating AI Shopper Personas"
              steps={["Scraping store data...", "Building shopper personas...", "Simulating journeys...", "Generating insights..."]}
              duration={25}
            />
          </AnimatePresence>

          {/* Connection Gate */}
          {!hasConnectedStore && !results && (
            <StoreConnectionBanner onConnect={() => setShowConnectionModal(true)} />
          )}
          <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />

          {/* Results */}
          {results && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* KPI Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Conversion Rate", value: `${(results.aggregate_metrics?.predicted_conversion_rate ?? 0).toFixed(1)}%`, icon: <Target className="h-4 w-4" /> },
                  { label: "Monthly Revenue", value: `$${(results.aggregate_metrics?.predicted_monthly_revenue ?? 0).toLocaleString()}`, icon: <TrendingUp className="h-4 w-4" /> },
                  { label: "Avg Cart Value", value: `$${(results.aggregate_metrics?.average_cart_value ?? 0).toFixed(0)}`, icon: <ShoppingCart className="h-4 w-4" /> },
                  { label: "Bounce Rate", value: `${(results.aggregate_metrics?.bounce_rate ?? 0).toFixed(1)}%`, icon: <XCircle className="h-4 w-4" /> },
                  { label: "Cart Abandon", value: `${(results.aggregate_metrics?.cart_abandonment_rate ?? 0).toFixed(1)}%`, icon: <AlertTriangle className="h-4 w-4" /> },
                  { label: "Avg Session", value: `${Math.round(results.aggregate_metrics?.average_session_duration_seconds ?? 0)}s`, icon: <Clock className="h-4 w-4" /> },
                ].map((m) => (
                  <Card key={m.label} className="border-border">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center text-muted-foreground mb-1">{m.icon}</div>
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Visual Charts Row */}
              {(results.drop_off_analysis?.length ?? 0) > 0 && (
                <div className="grid lg:grid-cols-2 gap-4">
                  <FunnelViz dropOff={results.drop_off_analysis} />
                  <DropOffChart dropOff={results.drop_off_analysis} />
                </div>
              )}

              <Tabs defaultValue="personas" className="w-full">
                <TabsList className="w-full flex">
                  <TabsTrigger value="personas" className="flex-1 gap-1"><Users className="h-3.5 w-3.5" /> Personas</TabsTrigger>
                  <TabsTrigger value="engagement" className="flex-1 gap-1"><Eye className="h-3.5 w-3.5" /> Engagement</TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex-1 gap-1"><Zap className="h-3.5 w-3.5" /> Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="personas" className="mt-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(results.personas ?? []).map((p) => <PersonaCard key={p.id} persona={p} />)}
                  </div>
                </TabsContent>

                <TabsContent value="engagement" className="mt-4">
                  {results.heatmap_insights && <EngagementHeatmap insights={results.heatmap_insights} />}
                  <Card className="border-border mt-4">
                    <CardHeader><CardTitle className="text-base text-primary flex items-center gap-2"><MapPin className="h-4 w-4" /> Recommended CTA Positions</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(results.heatmap_insights?.recommended_cta_positions ?? []).map((pos, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{pos}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-4">
                  <Card className="border-border">
                    <CardHeader><CardTitle className="text-base">Top Recommendations</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {(results.top_recommendations ?? []).map((rec, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border flex items-start gap-3">
                          <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"} className="text-[10px] shrink-0 mt-0.5">{rec.priority}</Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{rec.area}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{rec.issue}</p>
                            <p className="text-xs text-foreground mt-1">{rec.suggestion}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0 text-success">{rec.predicted_uplift}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* AI Summary */}
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Summary</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{results.summary}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Previous Runs */}
          {!results && previousRuns.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Previous Simulations
              </h2>
              <div className="space-y-2">
                {previousRuns.slice(0, 10).map((run) => (
                  <button key={run.id} onClick={() => loadPreviousResult(run)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 sm:p-4 text-left shadow-sm transition-colors hover:bg-accent min-h-[44px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <Brain className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{run.store_url}</p>
                        <p className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleDateString()} • {run.persona_count} personas</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-foreground">{run.predicted_conversion_rate ? `${Number(run.predicted_conversion_rate).toFixed(1)}%` : "—"}</p>
                      <p className="text-[10px] text-muted-foreground">conversion</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </FeatureGate>

        {/* Analytics Value Upgrade Trigger */}
        <UpgradeTrigger variant="analytics-value" className="mt-6" />
      </main>
    </div>
  );
};

export default Simulator;
