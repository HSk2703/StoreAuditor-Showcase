import { useState, useEffect, lazy, Suspense } from "react";
import FeatureProgressOverlay from "@/components/FeatureProgressOverlay";
import { AnimatePresence } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { useAICredits } from "@/hooks/useAICredits";
import CreditCostBadge from "@/components/CreditCostBadge";
import CreditLimitModal from "@/components/CreditLimitModal";
import { captureStore, detectSectionsFromHtml, type DetectedSection } from "@/lib/store-capture-service";
import FeatureGate from "@/components/FeatureGate";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Cpu, Loader2, DollarSign, TrendingUp, ShieldAlert, Layers, ArrowUpRight,
  ArrowDownRight, Tag, BarChart3, AlertTriangle, CheckCircle2, Clock, ChevronDown,
} from "lucide-react";
import SuggestionFeedback from "@/components/SuggestionFeedback";
import { generateSuggestionId } from "@/lib/decision-tracking";
import {
  runDigitalTwin, getDigitalTwinHistory, type DigitalTwinRun,
} from "@/lib/digital-twin-service";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import { HeartbeatBadge } from "@/components/HeartbeatBadge";

const DigitalTwinVisualPreview = lazy(() => import("@/components/DigitalTwinVisualPreview"));

const severityBadge: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-7 w-48" />
      </div>
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

export default function DigitalTwin() {
  const { userId, loading: subLoading } = useSubscription();
  const { checkAndDeduct, canAfford } = useAICredits();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal, requireConnection } = useStoreConnection();
  const [storeUrl, setStoreUrl] = useState("");
  const [scenario, setScenario] = useState("general");
  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState<DigitalTwinRun | null>(null);
  const [history, setHistory] = useState<DigitalTwinRun[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [detectedSections, setDetectedSections] = useState<DetectedSection[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setHistoryLoading(true);
    getDigitalTwinHistory(userId)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [userId]);

  const handleRun = async () => {
    if (!requireConnection()) return;
    if (!storeUrl.trim() || !userId) return;
    const creditResult = await checkAndDeduct("digital_twin");
    if (!creditResult.allowed) { setShowLimitModal(true); return; }
    setRunning(true);
    setScreenshot(null);
    setDetectedSections([]);
    try {
      const [captureResult, twinResult] = await Promise.allSettled([
        captureStore(storeUrl.trim()),
        runDigitalTwin(storeUrl.trim(), userId, scenario),
      ]);

      if (captureResult.status === "fulfilled" && captureResult.value.screenshot) {
        setScreenshot(captureResult.value.screenshot);
        if (captureResult.value.html) {
          setDetectedSections(detectSectionsFromHtml(captureResult.value.html));
        }
      }

      if (twinResult.status === "fulfilled") {
        setActiveRun(twinResult.value);
        setHistory((prev) => [twinResult.value, ...prev]);
        toast.success("Digital Twin simulation complete!");
      } else {
        throw twinResult.reason;
      }
    } catch (e: any) {
      toast.error(e.message || "Simulation failed");
    } finally {
      setRunning(false);
    }
  };

  const run = activeRun;
  const snap = run?.baseline_snapshot;

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Header />
      <main className="flex-1 container px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <FeatureGate feature="digital_twin">
          {subLoading ? (
            <PageSkeleton />
          ) : (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary glow-primary">
                    <Cpu className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">AI Digital Twin</h1>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Agency</Badge>
                </div>
                <p className="text-muted-foreground">Create a virtual store replica — see the future version of your store visually before deploying.</p>
              </div>

              {/* Input */}
              <Card className="glass-card">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Shopify store URL" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} disabled={running} className="flex-1 bg-background/50" />
                    <Select value={scenario} onValueChange={setScenario} disabled={running}>
                      <SelectTrigger className="sm:w-52 bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Analysis</SelectItem>
                        <SelectItem value="pricing">Pricing Strategy</SelectItem>
                        <SelectItem value="layout">Layout & UX</SelectItem>
                        <SelectItem value="full_redesign">Full Redesign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleRun} disabled={running || !storeUrl.trim() || subLoading || !canAfford("digital_twin")} className="gap-2 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
                    {running ? "Simulating…" : "Create Digital Twin"}
                  </Button>
                  <CreditCostBadge feature="digital_twin" />
                </CardContent>
              </Card>
              <CreditLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />

              {/* Countdown overlay */}
              <AnimatePresence>
                <FeatureProgressOverlay
                  isRunning={running}
                  title="Creating Digital Twin"
                  steps={["Building store replica...", "Simulating scenarios...", "Predicting outcomes...", "Generating report..."]}
                  duration={25}
                />
              </AnimatePresence>

              {/* Connection Gate */}
              {!hasConnectedStore && !run && (
                <StoreConnectionBanner onConnect={() => setShowConnectionModal(true)} />
              )}
              <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />

              {run && (run.status === "running" || run.status === "pending") && (
                <Card className="glass-card">
                  <CardContent className="py-3 flex items-center gap-3">
                    <HeartbeatBadge status={run.status} lastHeartbeatAt={run.last_heartbeat_at} />
                    <p className="text-sm text-muted-foreground truncate">Simulating {run.store_url}</p>
                  </CardContent>
                </Card>
              )}

              {run?.status === "completed" && run.simulated_changes && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DeltaCard label="Conversion Rate" baseline={run.baseline_conversion_rate} predicted={run.predicted_conversion_rate} suffix="%" icon={<TrendingUp className="h-4 w-4" />} />
                    <DeltaCard label="Avg Order Value" baseline={run.baseline_aov} predicted={run.predicted_aov} prefix="$" icon={<Tag className="h-4 w-4" />} />
                    <DeltaCard label="Monthly Revenue" baseline={run.baseline_monthly_revenue} predicted={run.predicted_monthly_revenue} prefix="$" icon={<DollarSign className="h-4 w-4" />} />
                    <MetricCard label="Confidence" value={`${run.confidence_score?.toFixed(0)}%`} icon={<BarChart3 className="h-4 w-4" />} />
                  </div>

                  {/* Visual Store Simulation - lazy loaded */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" /> Interactive Store Simulation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
                        <DigitalTwinVisualPreview
                          changes={run.simulated_changes ?? []}
                          storeName={snap?.store_name || "Your Store"}
                          screenshot={screenshot}
                          detectedSections={detectedSections}
                        />
                      </Suspense>
                    </CardContent>
                  </Card>

                  {/* Baseline snapshot — collapsible */}
                  {snap && (
                    <Collapsible>
                      <Card className="glass-card">
                        <CardHeader className="pb-2">
                          <CollapsibleTrigger className="flex items-center justify-between w-full">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Layers className="h-4 w-4 text-primary" /> Baseline Snapshot — {snap.store_name}
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <p className="text-muted-foreground"><span className="font-medium text-foreground">Visitors:</span> {snap.estimated_monthly_visitors?.toLocaleString()}/mo</p>
                              <p className="text-muted-foreground"><span className="font-medium text-foreground">Strengths:</span> {snap.key_strengths?.join(", ")}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground"><span className="font-medium text-foreground">Tech:</span> {snap.tech_stack_observations?.join(", ")}</p>
                              <p className="text-muted-foreground"><span className="font-medium text-foreground">Weaknesses:</span> {snap.key_weaknesses?.join(", ")}</p>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )}

                  {/* Tabs */}
                  <Tabs defaultValue="changes" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5 bg-muted/50">
                      <TabsTrigger value="changes">Changes</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                      <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                      <TabsTrigger value="risks">Risks</TabsTrigger>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>

                    <TabsContent value="changes" className="space-y-3">
                      {(run.simulated_changes ?? []).map((c, i) => (
                        <Card key={i} className="glass-card">
                          <CardContent className="pt-4 pb-3 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-semibold text-foreground">{c.change_title}</span>
                              <div className="flex gap-2">
                                <Badge variant="outline">{c.area}</Badge>
                                <Badge variant="outline" className={severityBadge[c.risk_level]}>risk: {c.risk_level}</Badge>
                                <Badge variant="outline">{c.implementation_effort} effort</Badge>
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Current</p>
                                <p className="text-sm text-foreground">{c.current_state}</p>
                              </div>
                              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                                <p className="text-xs font-medium text-primary mb-1">Simulated</p>
                                <p className="text-sm text-foreground">{c.proposed_state}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span>Conv: <strong className={c.predicted_conversion_delta >= 0 ? "text-emerald-600" : "text-destructive"}>{c.predicted_conversion_delta >= 0 ? "+" : ""}{c.predicted_conversion_delta}pp</strong></span>
                              <span>AOV: <strong className={c.predicted_aov_delta >= 0 ? "text-emerald-600" : "text-destructive"}>{c.predicted_aov_delta >= 0 ? "+$" : "-$"}{Math.abs(c.predicted_aov_delta)}</strong></span>
                              <span>Revenue: <strong className={c.predicted_revenue_delta >= 0 ? "text-emerald-600" : "text-destructive"}>{c.predicted_revenue_delta >= 0 ? "+$" : "-$"}{Math.abs(c.predicted_revenue_delta).toLocaleString()}/mo</strong></span>
                              <span>Confidence: {c.confidence}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{c.rationale}</p>
                            <SuggestionFeedback
                              featureName="digital_twin"
                              suggestionId={generateSuggestionId("twin", c.change_title, i)}
                              content={c.rationale}
                              showEdit
                              className="mt-2"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-4">
                      {run.pricing_analysis && (
                        <>
                          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <MetricCard label="Price Position" value={run.pricing_analysis.current_price_positioning} icon={<Tag className="h-4 w-4" />} />
                            <MetricCard label="Sensitivity" value={`${run.pricing_analysis.price_sensitivity_score}/100`} icon={<BarChart3 className="h-4 w-4" />} />
                            <MetricCard label="Discount Threshold" value={`${run.pricing_analysis.optimal_discount_threshold}%`} icon={<DollarSign className="h-4 w-4" />} />
                            <MetricCard label="Bundle Score" value={`${run.pricing_analysis.bundle_opportunity_score}/100`} icon={<Layers className="h-4 w-4" />} />
                          </div>
                          {(run.pricing_analysis?.price_tests ?? []).map((pt, i) => (
                            <Card key={i} className="glass-card">
                              <CardContent className="pt-4 pb-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-foreground">{pt.test_name}</span>
                                  <Badge variant="outline" className={pt.predicted_revenue_change_percent >= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                                    {pt.predicted_revenue_change_percent >= 0 ? "+" : ""}{pt.predicted_revenue_change_percent}% revenue
                                  </Badge>
                                </div>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                  <span>Current: <strong className="text-foreground">{pt.current_price_point}</strong></span>
                                  <span>Test: <strong className="text-foreground">{pt.tested_price_point}</strong></span>
                                  <span>Volume: {pt.predicted_volume_change_percent >= 0 ? "+" : ""}{pt.predicted_volume_change_percent}%</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{pt.recommendation}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="scenarios" className="space-y-3">
                      {(run.impact_predictions ?? []).map((sc, i) => (
                        <Card key={i} className="glass-card">
                          <CardContent className="pt-4 pb-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{sc.scenario_name}</span>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                +{sc.uplift_percent}% <ArrowUpRight className="h-3 w-3 ml-0.5" />
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div><p className="text-xs text-muted-foreground">Conv. Rate</p><p className="font-bold text-foreground">{sc.predicted_conversion_rate}%</p></div>
                              <div><p className="text-xs text-muted-foreground">AOV</p><p className="font-bold text-foreground">${sc.predicted_aov}</p></div>
                              <div><p className="text-xs text-muted-foreground">Revenue</p><p className="font-bold text-foreground">${sc.predicted_monthly_revenue?.toLocaleString()}</p></div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sc.implementation_timeline}</span>
                              <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Risk: {sc.risk_score}/100</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="risks" className="space-y-3">
                      {(run.risk_assessment ?? []).map((r, i) => (
                        <Card key={i} className="glass-card">
                          <CardContent className="pt-4 pb-3 flex items-start gap-3">
                            <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${r.severity === "critical" || r.severity === "high" ? "text-destructive" : "text-amber-500"}`} />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{r.risk}</span>
                                <Badge variant="outline" className={severityBadge[r.severity]}>{r.severity}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Mitigation:</span> {r.mitigation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {(run.risk_assessment ?? []).length === 0 && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No significant risks identified.</p>
                      )}
                    </TabsContent>

                    <TabsContent value="summary">
                      <Card className="glass-card">
                        <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
                          {run.ai_executive_summary?.split("\n").map((p, i) => (
                            <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Apply to Shopify CTA */}
                  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardContent className="pt-6 pb-5 flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-sm font-bold text-foreground">Apply These Changes to Your Store</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Deploy AI-recommended changes directly to your Shopify store with one click</p>
                      </div>
                      <Button disabled className="gap-2 shrink-0 opacity-75">
                        <Cpu className="h-4 w-4" /> Apply to Shopify
                        <Badge variant="outline" className="ml-1 text-[9px]">Coming Soon</Badge>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* History */}
              {historyLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
                  </div>
                </div>
              ) : history.length > 0 ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Previous Simulations</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {history.map((h) => (
                      <Card key={h.id} className={`glass-card cursor-pointer transition-all hover:border-primary/40 ${activeRun?.id === h.id ? "border-primary ring-1 ring-primary/20" : ""}`} onClick={() => setActiveRun(h)}>
                        <CardContent className="pt-4 pb-3 space-y-1">
                          <p className="text-sm font-medium truncate text-foreground">{h.store_url}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex gap-1.5 items-center">
                              <Badge variant={h.status === "completed" ? "default" : "secondary"} className="text-xs">{h.status}</Badge>
                              <Badge variant="outline" className="text-xs">{h.scenario_type}</Badge>
                              <HeartbeatBadge status={h.status} lastHeartbeatAt={h.last_heartbeat_at} />
                            </div>
                            {h.predicted_monthly_revenue != null && <span>${h.predicted_monthly_revenue.toLocaleString()}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </FeatureGate>
      </main>
      <Footer />
    </div>
  );
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="glass-card glow-primary">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">{icon}<span className="text-xs font-medium">{label}</span></div>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function DeltaCard({ label, baseline, predicted, prefix = "", suffix = "", icon }: { label: string; baseline: number | null; predicted: number | null; prefix?: string; suffix?: string; icon: React.ReactNode }) {
  const b = baseline ?? 0;
  const p = predicted ?? 0;
  const delta = p - b;
  const positive = delta >= 0;
  return (
    <Card className="glass-card glow-primary">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">{icon}<span className="text-xs font-medium">{label}</span></div>
        <p className="text-xl font-bold text-foreground">{prefix}{fmt(predicted)}{suffix}</p>
        <p className={`text-xs font-medium flex items-center gap-0.5 ${positive ? "text-emerald-600" : "text-destructive"}`}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {positive ? "+" : ""}{prefix}{fmt(delta)}{suffix} vs baseline
        </p>
      </CardContent>
    </Card>
  );
}
