import { useState, useEffect } from "react";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Loader2, Clock, CheckCircle, XCircle, Sparkles, ChevronDown, AlertTriangle,
  Zap, Timer, Camera,
} from "lucide-react";
import FeatureProgressOverlay from "@/components/FeatureProgressOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SuggestionFeedback from "@/components/SuggestionFeedback";
import { generateSuggestionId } from "@/lib/decision-tracking";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import FeatureGate from "@/components/FeatureGate";
import UpgradeBanner from "@/components/UpgradeBanner";
import CreditCostBadge from "@/components/CreditCostBadge";
import CreditLimitModal from "@/components/CreditLimitModal";
import VariationSlider from "@/components/ux-optimizer/VariationSlider";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { logFeatureUsage } from "@/lib/simulation-service";
import {
  runUxOptimizer, saveUxOptimizationRun, getUxOptimizationRuns,
  type UxOptimizationResults,
} from "@/lib/ux-optimizer-service";
import { captureStore, detectSectionsFromHtml, type DetectedSection } from "@/lib/store-capture-service";

const UxOptimizer = () => {
  const [storeUrl, setStoreUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<UxOptimizationResults | null>(null);
  const [previousRuns, setPreviousRuns] = useState<any[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [detectedSections, setDetectedSections] = useState<DetectedSection[]>([]);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "capturing" | "done" | "failed">("idle");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { toast } = useToast();
  const { plan, userId, canAccess } = useSubscription();
  const { checkAndDeduct, canAfford } = useAICredits();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal, requireConnection } = useStoreConnection();
  const hasAccess = canAccess("ux_optimizer");

  useEffect(() => {
    if (!userId) return;
    getUxOptimizationRuns(userId).then(setPreviousRuns).catch(console.error);
  }, [userId]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireConnection()) return;
    if (!storeUrl.trim() || !userId) return;
    const creditResult = await checkAndDeduct("ux_optimizer");
    if (!creditResult.allowed) { setShowLimitModal(true); return; }
    setIsRunning(true);
    setResults(null);
    setScreenshot(null);
    setDetectedSections([]);
    setCaptureStatus("capturing");

    try {
      const [captureResult, optimizerResult] = await Promise.allSettled([
        captureStore(storeUrl.trim()),
        (async () => {
          await logFeatureUsage(userId, "ux_optimizer", plan, { store_url: storeUrl });
          return runUxOptimizer(storeUrl.trim(), undefined, undefined, userId);
        })(),
      ]);

      if (captureResult.status === "fulfilled" && captureResult.value.screenshot) {
        setScreenshot(captureResult.value.screenshot);
        if (captureResult.value.html) {
          setDetectedSections(detectSectionsFromHtml(captureResult.value.html));
        }
        setCaptureStatus("done");
      } else {
        setCaptureStatus("failed");
      }

      if (optimizerResult.status === "fulfilled") {
        const res = optimizerResult.value;
        setResults(res);
        await saveUxOptimizationRun(userId, storeUrl.trim(), res);
        toast({
          title: "Optimization complete",
          description: "AI UX variations generated successfully.",
        });
      } else {
        throw optimizerResult.reason;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Optimization failed";
      toast({ title: "Optimization Failed", description: msg, variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const loadPrevious = (run: any) => {
    if (run.current_analysis && run.variations) {
      setResults({
        current_analysis: run.current_analysis,
        variations: run.variations,
        comparison_summary: run.comparison_summary || "",
        quick_wins: [],
        best_variation_index: run.best_variation_index ?? 0,
      });
      setStoreUrl(run.store_url);
      setScreenshot(null);
      setDetectedSections([]);
      setCaptureStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <Header />
      <main className="container max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <PageBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Generative UX Auto-Optimizer" }]} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Palette className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Generative UX Auto-Optimizer</h1>
          </div>
          <p className="text-muted-foreground text-sm">AI-generated layout variations with real store screenshots and predicted conversion uplift</p>
        </motion.div>

        <UpgradeBanner />

        <FeatureGate feature="ux_optimizer">
          {/* Input */}
          <motion.form onSubmit={handleRun} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-2">Store URL</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input type="url" placeholder="https://your-store.myshopify.com" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} className="h-12 flex-1" required />
              <Button type="submit" disabled={isRunning || !hasAccess || !canAfford("ux_optimizer")} className="gap-2 min-h-[44px] h-12 w-full sm:w-auto">
                {isRunning ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Generate Variations</>}
              </Button>
            </div>
            <div className="flex items-center justify-end mt-2">
              <CreditCostBadge feature="ux_optimizer" />
            </div>
          </motion.form>
          <CreditLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />

          {/* Loading */}
          <AnimatePresence>
            <FeatureProgressOverlay
              isRunning={isRunning}
              title="Analyzing Store UX"
              steps={[
                "Capturing real store screenshot...",
                "Detecting page sections...",
                "Evaluating usability...",
                "Generating AI variations...",
                "Building visual overlays...",
              ]}
              duration={30}
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
              {/* Screenshot status */}
              {captureStatus === "done" && screenshot && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-3">
                  <Camera className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Real store screenshot captured — variations show your actual store UI with AI improvement overlays
                  </p>
                </div>
              )}

              {/* Key Insights Summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Layout Score", value: results.current_analysis?.layout_score ?? 0 },
                  { label: "Usability", value: results.current_analysis?.usability_score ?? 0 },
                  { label: "Conv Potential", value: results.current_analysis?.conversion_potential ?? 0 },
                ].map(s => (
                  <Card key={s.label} className="text-center backdrop-blur-sm bg-card/80">
                    <CardContent className="pt-4 pb-3">
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <Progress value={s.value} className="h-1.5 mt-1" />
                      <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <Collapsible>
                <Card className="border-border bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <CardTitle className="text-base">Current Store Analysis</CardTitle>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-emerald-500 mb-2 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Strengths</p>
                          <ul className="space-y-1">
                            {(results.current_analysis?.strengths ?? []).map((s, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-destructive mb-2 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Weaknesses</p>
                          <ul className="space-y-1">
                            {(results.current_analysis?.weaknesses ?? []).map((w, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Interactive slider with real screenshot support */}
              <VariationSlider
                variations={results.variations ?? []}
                bestIndex={results.best_variation_index ?? 0}
                screenshot={screenshot}
                detectedSections={detectedSections}
              />

              {/* Quick Wins */}
              {results.quick_wins && results.quick_wins.length > 0 && (
                <Card className="border-border bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Quick Wins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.quick_wins.map((qw, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                          <Badge variant="outline" className="text-[10px] shrink-0"><Timer className="h-3 w-3 mr-1" />{qw.effort}</Badge>
                          <span className="text-sm text-foreground flex-1">{qw.change}</span>
                          <span className="text-xs text-primary font-medium shrink-0">{qw.predicted_impact}</span>
                          <SuggestionFeedback
                            featureName="ux_optimizer"
                            suggestionId={generateSuggestionId("ux", qw.change, i)}
                            content={qw.change}
                            className="ml-auto"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comparison Summary */}
              {results.comparison_summary && (
                <Card className="border-border bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base">AI Comparison Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{results.comparison_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Apply to Shopify CTA */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
                <CardContent className="pt-6 pb-5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-foreground">Apply These Changes to Your Store</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">One-click deployment of AI-recommended UX improvements directly to your Shopify store</p>
                  </div>
                  <Button
                    onClick={() => { if (!requireConnection()) return; }}
                    disabled={!hasConnectedStore}
                    className="gap-2 shrink-0"
                  >
                    <Sparkles className="h-4 w-4" /> Apply to Shopify
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Previous Runs */}
          {previousRuns.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Previous Runs
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {previousRuns.map((run) => (
                  <Card key={run.id} className="cursor-pointer hover:border-primary/40 transition-colors bg-card/80 backdrop-blur-sm" onClick={() => loadPrevious(run)}>
                    <CardContent className="pt-4 pb-3 space-y-1">
                      <p className="text-sm font-medium truncate text-foreground">{run.store_url}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant={run.status === "completed" ? "default" : "secondary"} className="text-[10px]">{run.status}</Badge>
                        {run.predicted_overall_uplift != null && <span>+{run.predicted_overall_uplift.toFixed(1)}%</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </FeatureGate>
      </main>
    </div>
  );
};

export default UxOptimizer;
