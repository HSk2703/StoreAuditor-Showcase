import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { invokeEdgeFunction } from "@/lib/edge-function-utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Sparkles, Image, ArrowRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FlowStep = "syncing" | "exporting" | "analyzing" | "applying" | "success" | "review" | "error";

interface AnalysisResult {
  confidence_score: number;
  visual_quality: number;
  conversion_potential: number;
  improvements: string[];
  strengths: string[];
  projected_impact: string;
  recommendation: string;
}

const stepLabels: Record<FlowStep, string> = {
  syncing: "Syncing your updated design…",
  exporting: "Exporting high-res asset…",
  analyzing: "Kairo is evaluating conversion impact…",
  applying: "Applying optimized visuals to your store…",
  success: "Design Updated Successfully",
  review: "Design Analysis Complete",
  error: "Failed to sync your Canva design",
};

const CanvaReturn = () => {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<FlowStep>("syncing");
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [applied, setApplied] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isReady) return;
    if (hasRun.current) return;
    hasRun.current = true;

    if (!user) {
      setStep("error");
      setErrorMsg("You must be logged in to sync Canva designs.");
      return;
    }

    const designId = searchParams.get("design_id") || sessionStorage.getItem("canva_return_design_id");
    const productId = searchParams.get("product_id") || sessionStorage.getItem("canva_return_product_id");
    const assetContext = searchParams.get("context") || sessionStorage.getItem("canva_return_context") || "product_image";

    if (!designId) {
      setStep("error");
      setErrorMsg("No design context found. Please start the design flow again from the Design Studio.");
      return;
    }

    // Clean up session storage
    sessionStorage.removeItem("canva_return_design_id");
    sessionStorage.removeItem("canva_return_product_id");
    sessionStorage.removeItem("canva_return_context");

    runSyncFlow(designId, productId, assetContext);
  }, [isReady, user]);

  const runSyncFlow = async (designId: string, productId: string | null, context: string) => {
    try {
      // Step 1: Fetch design data
      setStep("syncing");
      const designData = await invokeEdgeFunction({
        functionName: "canva-fetch-design",
        body: { design_id: designId },
        maxRetries: 1,
        timeoutMs: 15000,
      });

      // Step 2: Export design
      setStep("exporting");
      const exportData = await invokeEdgeFunction({
        functionName: "canva-export-design",
        body: { design_id: designId, format: "png" },
        maxRetries: 1,
        timeoutMs: 45000,
      });

      const assetUrl = exportData?.asset_urls?.[0];
      if (!assetUrl) {
        throw new Error("Export completed but no asset URL was returned.");
      }

      // Step 3: Kairo AI analysis
      setStep("analyzing");
      const analysisResult = await invokeEdgeFunction({
        functionName: "kairo-analyze-design",
        body: {
          asset_url: assetUrl,
          context,
          design_id: designId,
          design_title: designData?.title || "Canva Design",
        },
        maxRetries: 1,
        timeoutMs: 30000,
      });

      const analysisData = analysisResult?.analysis as AnalysisResult;
      setAnalysis(analysisData);

      // Step 4: Decide whether to apply
      if (analysisData?.confidence_score >= 0.8 && productId) {
        setStep("applying");
        try {
          await invokeEdgeFunction({
            functionName: "execute-kairo-action",
            body: {
              store_id: productId,
              action_type: "image_update",
              target_resource_type: "product",
              target_resource_id: productId,
              task_context: `Canva design update: ${designData?.title || designId}`,
            },
            maxRetries: 1,
            timeoutMs: 30000,
          });
          setApplied(true);
          setStep("success");
        } catch {
          // Apply failed, but analysis succeeded — show review
          setStep("review");
        }
      } else {
        setStep(analysisData?.confidence_score >= 0.8 ? "success" : "review");
      }

      toast.success("Canva design synced successfully!");
    } catch (err: unknown) {
      console.error("[CanvaReturn] Sync flow error:", err);
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to sync your Canva design. Please try again.");
    }
  };

  // Auto-redirect on success
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const isProcessing = ["syncing", "exporting", "analyzing", "applying"].includes(step);
  const stepIndex = ["syncing", "exporting", "analyzing", "applying"].indexOf(step);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg mx-auto px-6"
      >
        <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-8 shadow-[0_0_80px_hsl(var(--primary)/0.08)]">
          <AnimatePresence mode="wait">
            {/* Processing States */}
            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center gap-6"
              >
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl border border-primary/10"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-foreground">{stepLabels[step]}</h1>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
                </div>

                {/* Progress indicators */}
                <div className="flex gap-3">
                  {["Sync", "Export", "Analyze", "Apply"].map((label, i) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <motion.div
                        className={`h-2.5 w-2.5 rounded-full ${
                          i < stepIndex ? "bg-green-500" : i === stepIndex ? "bg-primary" : "bg-muted"
                        }`}
                        animate={i === stepIndex ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className={`text-[10px] ${
                        i <= stepIndex ? "text-foreground" : "text-muted-foreground/50"
                      }`}>{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Success */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="h-20 w-20 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_30px_hsl(142_71%_45%/0.2)]"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </motion.div>
                <h1 className="text-xl font-bold text-foreground">Design Updated Successfully</h1>
                <p className="text-sm text-muted-foreground">Kairo has optimized your store visuals</p>

                {analysis && (
                  <div className="w-full rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Projected Impact
                    </div>
                    <p className="text-lg font-bold text-primary">{analysis.projected_impact}</p>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                      <span>Quality: {analysis.visual_quality}/10</span>
                      <span>Conversion: {analysis.conversion_potential}/10</span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">Redirecting to dashboard…</p>
              </motion.div>
            )}

            {/* Review (confidence < 0.8) */}
            {step === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center gap-5"
              >
                <div className="h-20 w-20 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Palette className="h-10 w-10 text-amber-500" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Design Analysis Complete</h1>
                <p className="text-sm text-muted-foreground">
                  Kairo recommends reviewing this design before applying
                </p>

                {analysis && (
                  <div className="w-full space-y-3">
                    <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium text-foreground">{Math.round(analysis.confidence_score * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recommendation</span>
                        <span className="font-medium text-foreground capitalize">{analysis.recommendation}</span>
                      </div>
                    </div>

                    {analysis.improvements?.length > 0 && (
                      <div className="text-left space-y-1.5">
                        <p className="text-xs font-medium text-foreground">Suggested Improvements:</p>
                        {analysis.improvements.slice(0, 3).map((imp, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span> {imp}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/social-media?tab=design", { replace: true })}
                  >
                    Back to Studio
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-gradient-to-r from-primary to-violet-500"
                    onClick={() => navigate("/dashboard", { replace: true })}
                  >
                    Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center gap-5"
              >
                <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Sync Failed</h1>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/social-media?tab=design", { replace: true })}
                  >
                    Back to Studio
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      hasRun.current = false;
                      setStep("syncing");
                      setErrorMsg("");
                      const designId = searchParams.get("design_id");
                      if (designId) {
                        runSyncFlow(
                          designId,
                          searchParams.get("product_id"),
                          searchParams.get("context") || "product_image"
                        );
                      }
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CanvaReturn;
