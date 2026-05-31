import { useState, useEffect, useRef } from "react";
import AIOnboardingModal from "@/components/ai-permissions/AIOnboardingModal";
import FirstVisitOnboarding from "@/components/FirstVisitOnboarding";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Clock, ExternalLink, BarChart3, Rocket } from "lucide-react";
import UpgradeTrigger from "@/components/UpgradeTrigger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import AuditProgressOverlay from "@/components/AuditProgressOverlay";
import UpgradeBanner from "@/components/UpgradeBanner";
import AICreditsWidget from "@/components/AICreditsWidget";
import FounderProfileWidget from "@/components/FounderProfileWidget";
import GrowthScoreWidget from "@/components/gamification/GrowthScoreWidget";
import { startAudit, runScraping, runAnalysis, getPreviousAudits } from "@/lib/audit-service";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditStatus, setAuditStatus] = useState("pending");
  const [auditError, setAuditError] = useState<string | null>(null);
  const [previousAudits, setPreviousAudits] = useState<any[]>([]);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plan, planConfig, loading: subLoading, isAdmin } = useSubscription();

  const auditCompleteRef = useRef(false);
  const auditIdRef = useRef<string | null>(null);

  useEffect(() => {
    getPreviousAudits().then((audits) => {
      setPreviousAudits(audits);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = audits.filter(a => new Date(a.created_at) >= startOfMonth);
      setMonthlyCount(thisMonth.length);
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    supabase
      .from("social_media_posts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth)
      .then(({ count }) => setCampaignCount(count || 0));
  }, []);

  const auditsLeft = isAdmin || planConfig.auditsPerMonth === -1
    ? "Unlimited"
    : Math.max(0, planConfig.auditsPerMonth - monthlyCount);
  const isAtLimit = !isAdmin && planConfig.auditsPerMonth !== -1 && monthlyCount >= planConfig.auditsPerMonth;

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (isAtLimit) {
      toast({
        title: "Audit limit reached",
        description: `You've used all ${planConfig.auditsPerMonth} audits this month. Upgrade your plan for more.`,
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAuditError(null);
    setAuditStatus("creating");
    auditCompleteRef.current = false;
    auditIdRef.current = null;

    try {
      const auditId = await startAudit(url.trim());
      auditIdRef.current = auditId;
      setAuditStatus("scraping_homepage");

      const scrapedData = await runScraping(auditId, url.trim());
      setAuditStatus("generating_report");

      await runAnalysis(auditId, scrapedData);

      setAuditStatus("completed");
      setMonthlyCount((c) => c + 1);

      setTimeout(() => navigate(`/audit/${auditId}`), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audit failed";
      setAuditError(message);
      setAuditStatus("failed");
      toast({ title: "Audit Failed", description: message, variant: "destructive" });
      setTimeout(() => {
        setIsAnalyzing(false);
        setAuditStatus("pending");
        setAuditError(null);
      }, 3000);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-critical";
  };

  const completedAudits = previousAudits.filter(a => a.status === "completed");

  const auditLimit = isAdmin ? 999 : planConfig.auditsPerMonth === -1 ? 999 : planConfig.auditsPerMonth;
  const auditPct = auditLimit === 999 ? 0 : Math.min(100, (monthlyCount / auditLimit) * 100);

  const campaignLimit = plan === "free" ? 0 : plan === "starter" ? 5 : plan === "growth" ? 20 : 999;
  const campaignPct = campaignLimit === 0 || campaignLimit === 999 ? 0 : Math.min(100, (campaignCount / campaignLimit) * 100);



  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <FirstVisitOnboarding
        onRunAudit={(storeUrl) => {
          setUrl(storeUrl);
          // Trigger audit programmatically
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
          setTimeout(() => {
            const form = document.querySelector<HTMLFormElement>("#dashboard-audit-form");
            if (form) form.requestSubmit();
            else {
              // Fallback: run audit directly
              setIsAnalyzing(true);
              setAuditError(null);
              setAuditStatus("creating");
              auditCompleteRef.current = false;
              auditIdRef.current = null;
              startAudit(storeUrl).then(async (auditId) => {
                auditIdRef.current = auditId;
                setAuditStatus("scraping_homepage");
                const scrapedData = await runScraping(auditId, storeUrl);
                setAuditStatus("generating_report");
                await runAnalysis(auditId, scrapedData);
                setAuditStatus("completed");
                setMonthlyCount((c) => c + 1);
                setTimeout(() => navigate(`/audit/${auditId}`), 1200);
              }).catch((err) => {
                const message = err instanceof Error ? err.message : "Audit failed";
                setAuditError(message);
                setAuditStatus("failed");
                toast({ title: "Audit Failed", description: message, variant: "destructive" });
                setTimeout(() => {
                  setIsAnalyzing(false);
                  setAuditStatus("pending");
                  setAuditError(null);
                }, 3000);
              });
            }
          }, 100);
        }}
        isRunning={isAnalyzing}
      />
      <AIOnboardingModal onComplete={() => navigate("/ai-permissions")} />
      <Header />

      <AnimatePresence>
        {isAnalyzing && (
          <AuditProgressOverlay status={auditStatus} error={auditError} />
        )}
      </AnimatePresence>

      <main className="container max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
        <PageBreadcrumb items={[{ label: "Dashboard" }]} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Enter your Shopify store URL to run a real conversion audit
          </p>
        </motion.div>

        {/* Growth Score Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="mb-6"
        >
          <GrowthScoreWidget />
        </motion.div>

        <div className="mb-6">
          <UpgradeBanner />
        </div>

        {/* Usage Tracking Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        >
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-foreground">Audits Used</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-lg font-bold text-foreground">{monthlyCount}</span>
                <span className="text-xs text-muted-foreground">
                  / {auditLimit === 999 ? "∞" : auditLimit}
                </span>
              </div>
              <Progress value={auditLimit === 999 ? 0 : auditPct} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {typeof auditsLeft === "number" ? `${auditsLeft} remaining` : "Unlimited"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Rocket className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-foreground">Campaigns</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-lg font-bold text-foreground">{campaignCount}</span>
                <span className="text-xs text-muted-foreground">
                  / {campaignLimit === 0 ? "0" : campaignLimit === 999 ? "∞" : campaignLimit}
                </span>
              </div>
              <Progress value={campaignPct} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {campaignLimit === 0 ? "Upgrade to unlock" : campaignLimit === 999 ? "Unlimited" : `${Math.max(0, campaignLimit - campaignCount)} remaining`}
              </p>
            </CardContent>
          </Card>

          <AICreditsWidget />
          <FounderProfileWidget />
        </motion.div>

        <motion.form
          onSubmit={handleRunAudit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-10 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              Shopify Store URL
            </label>
            <span className="text-xs text-muted-foreground">
              {typeof auditsLeft === "number" ? `${auditsLeft} audit${auditsLeft !== 1 ? "s" : ""} left this month` : "Unlimited audits"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://your-store.myshopify.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-9 h-12"
                required
              />
            </div>
            <Button type="submit" disabled={isAnalyzing || isAtLimit} className="gap-2 min-h-[44px] h-12 w-full sm:w-auto">
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Analyzing...
                </>
              ) : isAtLimit ? (
                "Limit Reached"
              ) : (
                <>
                  Run Audit
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {isAtLimit && (
            <div className="mt-3">
              <UpgradeTrigger variant="usage-limit" limitType="audit" />
            </div>
          )}
          {!isAtLimit && (
            <p className="mt-2 text-xs text-muted-foreground">
              We'll fetch and analyze your store's homepage and product pages in real-time
            </p>
          )}
        </motion.form>

        {completedAudits.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="mb-4 text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Previous Audits
            </h2>
            <div className="space-y-2">
              {completedAudits.map((audit) => (
                <button
                  key={audit.id}
                  onClick={() => navigate(`/audit/${audit.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 sm:p-4 text-left shadow-sm transition-colors hover:bg-accent min-h-[44px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{audit.store_url}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold shrink-0 ml-3 ${getScoreColor(audit.overall_score)}`}>
                    {audit.overall_score ?? "—"}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;