import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Shield, Zap, BarChart3, Eye, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import AuditProgressOverlay from "@/components/AuditProgressOverlay";
import UpgradeTrigger from "@/components/UpgradeTrigger";
import CreditCostBadge from "@/components/CreditCostBadge";
import CreditLimitModal from "@/components/CreditLimitModal";
import AiAuditConsentModal, { hasSessionConsent } from "@/components/AiAuditConsentModal";
import { usePageMeta } from "@/lib/usePageMeta";
import { startAudit, runScraping, runAnalysis } from "@/lib/audit-service";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAICredits } from "@/hooks/useAICredits";

const auditCategories = [
  { icon: Eye, title: "Homepage Analysis", desc: "Layout, hero section, navigation & first impressions" },
  { icon: BarChart3, title: "Product Pages", desc: "Product presentation, CTAs & purchase flow" },
  { icon: Shield, title: "Trust & Conversion", desc: "Reviews, trust badges, social proof & urgency" },
  { icon: Smartphone, title: "Mobile Experience", desc: "Responsive design, touch targets & mobile UX" },
  { icon: Globe, title: "SEO Fundamentals", desc: "Meta tags, structure, speed & discoverability" },
  { icon: Zap, title: "Performance", desc: "Page speed, Core Web Vitals & loading times" },
];

const StoreAudit = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditStatus, setAuditStatus] = useState("pending");
  const [auditError, setAuditError] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingConsent, setPendingConsent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { planConfig, isAdmin } = useSubscription();
  const { checkAndDeduct, canAfford } = useAICredits();

  usePageMeta({
    title: "AI-Assisted Shopify Store Audit — Conversion & SEO Analysis | Store Auditor",
    description: "Run an AI-assisted audit of your Shopify store. 50+ checks across conversion, UX, SEO and mobile. AI drafts the report — you review and decide what to act on.",
    canonical: "/store-audit",
    keywords: ["Shopify audit", "AI store audit", "conversion audit", "AI-assisted CRO"],
  });

  const executeAudit = async () => {
    setIsAnalyzing(true);
    setAuditError(null);
    setAuditStatus("creating");
    try {
      const auditId = await startAudit(url.trim());
      setAuditStatus("scraping_homepage");
      const scrapedData = await runScraping(auditId, url.trim());
      setAuditStatus("generating_report");
      await runAnalysis(auditId, scrapedData);
      setAuditStatus("completed");
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

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const creditResult = await checkAndDeduct("store_audit");
    if (!creditResult.allowed) {
      setShowLimitModal(true);
      return;
    }

    if (!hasSessionConsent("audit")) {
      setPendingConsent(true);
      return;
    }
    executeAudit();
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <AiAuditConsentModal
        open={pendingConsent}
        intent="audit"
        onCancel={() => setPendingConsent(false)}
        onConfirm={() => { setPendingConsent(false); executeAudit(); }}
      />

      <AnimatePresence>
        {isAnalyzing && (
          <AuditProgressOverlay status={auditStatus} error={auditError} />
        )}
      </AnimatePresence>

      <main className="container max-w-5xl px-4 sm:px-6 pt-24 pb-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-5">
            <Zap className="h-3.5 w-3.5" /> AI-Powered Store Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Audit Your Shopify Store
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Get a comprehensive conversion audit powered by AI. Uncover hidden issues hurting your sales and get actionable recommendations.
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.form
          onSubmit={handleRunAudit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-14"
        >
          <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-xl border border-border bg-card shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://your-store.myshopify.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
                required
              />
            </div>
            <Button type="submit" disabled={isAnalyzing || !canAfford("store_audit")} size="lg" className="gap-2 h-12 px-6 rounded-lg shrink-0">
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Analyzing…
                </>
              ) : (
                <>
                  Run Audit <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <p className="text-xs text-muted-foreground">
              No sign-up required for your first audit · Results in under 60 seconds
            </p>
            <CreditCostBadge feature="store_audit" />
          </div>
        </motion.form>

        <CreditLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />

        {/* What We Analyze */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-2">
            What We Analyze
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
            Our AI evaluates your store across 6 critical areas that directly impact conversion rates and revenue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {auditCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{cat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-14 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> 10,000+ stores audited</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-primary" /> 15% avg. conversion lift</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Results in under 60s</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StoreAudit;
