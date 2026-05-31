import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import ScoreRing from "@/components/ScoreRing";
import { ArrowLeft, Download, ExternalLink, AlertTriangle, CheckCircle, Lightbulb, Loader2, RefreshCw, ShieldAlert, AlertOctagon, Info, ListOrdered, Save, Zap } from "lucide-react";
import SuggestionFeedback from "@/components/SuggestionFeedback";
import { generateSuggestionId } from "@/lib/decision-tracking";
import { Button } from "@/components/ui/button";
import { getAudit, startAudit } from "@/lib/audit-service";
import { toast } from "@/hooks/use-toast";
import FixIssuesSection from "@/components/FixIssuesSection";
import CreateTaskFromIssue from "@/components/CreateTaskFromIssue";
import PageHeatmap from "@/components/PageHeatmap";
import ScorecardActions from "@/components/ScorecardActions";
import StoreBenchmark from "@/components/StoreBenchmark";
import ScoreTrend from "@/components/ScoreTrend";
import FeatureGate from "@/components/FeatureGate";
import AuditRadarChart from "@/components/AuditRadarChart";
import TrafficEstimation from "@/components/TrafficEstimation";

import CompetitorAnalysis from "@/components/CompetitorAnalysis";
import ShopifyAppPerformance from "@/components/ShopifyAppPerformance";
import ReportNav from "@/components/ReportNav";

import UpgradeTrigger from "@/components/UpgradeTrigger";
import QuickWinsSection from "@/components/QuickWinsSection";
import PostAuditCoPilotIntro from "@/components/PostAuditCoPilotIntro";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate from "@/components/ShopifyConnectionGate";

const reportSections = [
  { id: "report-overview", label: "Overview" },
  { id: "report-categories", label: "Categories" },
  { id: "report-issues", label: "Issues" },
  { id: "report-fix-order", label: "Fix Order" },
  { id: "report-recommendations", label: "Recommendations" },
  { id: "report-performance", label: "Performance" },
  { id: "report-benchmark", label: "Benchmark" },
  { id: "report-share", label: "Share" },
];

const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const priorityColors: Record<string, string> = {
  critical: "bg-critical/10 text-critical border-critical/30",
  high: "bg-[hsl(25,95%,53%)]/10 text-[hsl(25,95%,53%)] border-[hsl(25,95%,53%)]/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

const priorityBadgeColors: Record<string, string> = {
  critical: "bg-critical/15 text-critical",
  high: "bg-[hsl(25,95%,53%)]/15 text-[hsl(25,95%,53%)]",
  medium: "bg-warning/15 text-warning",
  low: "bg-muted text-muted-foreground",
};

const priorityLabels: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityIcons: Record<string, any> = {
  critical: ShieldAlert,
  high: AlertOctagon,
  medium: AlertTriangle,
  low: Info,
};

const AuditResults = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePriorityFilters, setActivePriorityFilters] = useState<Set<string>>(new Set());
  const [showCoPilot, setShowCoPilot] = useState(true);
  const [showConnectionGate, setShowConnectionGate] = useState(false);
  const { hasConnectedStore } = useStoreConnection();

  const handleApplyFix = () => {
    if (!hasConnectedStore) {
      setShowConnectionGate(true);
      return;
    }
    toast({ title: "Fix queued", description: "Kairo will apply this optimization to your store." });
  };

  useEffect(() => {
    if (!id) return;
    getAudit(id)
      .then(setAudit)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="container max-w-5xl px-4 sm:px-6 py-10 text-center">
          <p className="text-muted-foreground">{error || "Audit not found"}</p>
          <Button variant="outline" className="mt-4 min-h-[44px]" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (audit.status !== "completed") {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="container max-w-5xl px-4 sm:px-6 py-10 text-center">
          <p className="text-muted-foreground">This audit is still processing ({audit.status}).</p>
          <Button variant="outline" className="mt-4 min-h-[44px]" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const analysis = audit.raw_analysis?.ai_analysis ?? audit.raw_analysis?.analysis ?? {};
  const categoryDetails = analysis?.category_details || {};
  const issues = [...((audit.issues || []) as any[])].sort(
    (a, b) => (priorityOrder[a?.priority] ?? 3) - (priorityOrder[b?.priority] ?? 3)
  );
  const recommendations = [...((audit.recommendations || []) as any[])].sort(
    (a, b) => (priorityOrder[a?.priority] ?? 3) - (priorityOrder[b?.priority] ?? 3)
  );
  const fixOrderRecs = [...recommendations].sort(
    (a, b) => (a.fix_order ?? 999) - (b.fix_order ?? 999)
  );

  const categoryEntries = (Object.entries(categoryDetails) as [string, any][]).filter(
    ([, cat]) => cat && typeof cat === "object"
  );

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-success";
    if (score >= 50) return "bg-warning";
    return "bg-critical";
  };

  const getStatusBadge = (status: string) => {
    if (status === "good") return <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"><CheckCircle className="h-3 w-3" />Good</span>;
    if (status === "critical") return <span className="inline-flex items-center gap-1 rounded-full bg-critical/10 px-2 py-0.5 text-xs font-medium text-critical"><AlertTriangle className="h-3 w-3" />Critical</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"><AlertTriangle className="h-3 w-3" />Needs Work</span>;
  };

  const reportForLeadGen = {
    id: audit.id,
    storeUrl: audit.store_url,
    createdAt: audit.created_at,
    overallScore: audit.overall_score || 0,
    categories: Object.fromEntries(
      categoryEntries.map(([key, cat]) => [
        key === "trust_elements" ? "trustElements" : key === "product_pages" ? "productPages" : key === "mobile_experience" ? "mobileExperience" : key,
        { score: cat.score, label: cat.label, items: cat.items || [] },
      ])
    ),
  };

  const scores = [
    { label: "Homepage", score: audit.homepage_score },
    { label: "Product Pages", score: audit.product_page_score },
    { label: "Trust & Conversion", score: audit.trust_score },
    { label: "Mobile Experience", score: audit.mobile_score },
    { label: "SEO Basics", score: audit.seo_score },
  ];

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <Header />
      <ReportNav sections={reportSections} />
      <main className="container max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <PageBreadcrumb items={[
          { label: "Store Audit", href: "/store-audit" },
          { label: "Audit Report" },
        ]} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Store Audit Report</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="break-all">{audit.store_url}</span>
              <span className="text-xs shrink-0">• {new Date(audit.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 shrink-0 min-h-[44px] w-full sm:w-auto"
            onClick={async () => {
              try {
                const newId = await startAudit(audit.store_url);
                toast({ title: "Re-audit started", description: "Redirecting to new audit..." });
                navigate(`/audit/${newId}`);
              } catch (e: any) {
                toast({ title: "Failed to start audit", description: e.message, variant: "destructive" });
              }
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Re-Audit
          </Button>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          id="report-overview"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-10 flex flex-col items-center rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm shadow-score scroll-mt-20"
        >
          <p className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Overall Conversion Score
          </p>
          <ScoreRing score={audit.overall_score || 0} size={180} strokeWidth={12} />
          <p className="mt-4 text-center text-sm text-muted-foreground max-w-md px-2">
            Your store scores {audit.overall_score}/100 for conversion optimization.
            {(audit.overall_score || 0) >= 75 && " Great job! Focus on the areas below to push even higher."}
            {(audit.overall_score || 0) >= 50 && (audit.overall_score || 0) < 75 && " There's room for improvement. Check the recommendations below."}
            {(audit.overall_score || 0) < 50 && " Significant improvements needed. Start with the critical items below."}
          </p>
        </motion.div>

        {/* Revenue Opportunity Estimate */}
        {(audit.overall_score || 0) < 85 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-5 text-center"
          >
            <p className="text-sm text-muted-foreground mb-1">Estimated Revenue Opportunity</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              ${Math.round((100 - (audit.overall_score || 0)) * 47).toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You're losing potential revenue due to {Math.max(0, issues?.length || 0)} conversion gaps
            </p>
          </motion.div>
        )}

        {/* Co-Pilot Introduction */}
        <PostAuditCoPilotIntro show={showCoPilot} onDismiss={() => setShowCoPilot(false)} />

        {/* Radar Chart + Traffic Estimation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AuditRadarChart scores={{
            homepage: audit.homepage_score,
            productPages: audit.product_page_score,
            trust: audit.trust_score,
            mobile: audit.mobile_score,
            seo: audit.seo_score,
          }} />
          <TrafficEstimation overallScore={audit.overall_score || 0} storeUrl={audit.store_url} />
        </motion.div>

        {/* Category Scores Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {scores.map((s) => {
            const color = (s.score || 0) >= 75 ? "bg-success" : (s.score || 0) >= 50 ? "bg-warning" : "bg-critical";
            return (
              <div key={s.label} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1 truncate">{s.label}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-lg font-bold text-foreground">{s.score ?? "—"}</span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Score History Trend */}
        <ScoreTrend storeUrl={audit.store_url} currentAuditId={audit.id} />

        {/* Page Element Heatmap */}
        {audit.raw_analysis?.scraped && (
          <PageHeatmap scrapedData={audit.raw_analysis.scraped} />
        )}

        {/* Category Details */}
        <div id="report-categories" className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mb-8 sm:mb-10 scroll-mt-20">
          {categoryEntries.map(([key, cat], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{cat?.label || key}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xl sm:text-2xl font-bold text-foreground">{cat?.score ?? "—"}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className={`h-full rounded-full ${getScoreColor(cat?.score ?? 0)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat?.score ?? 0}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="space-y-3">
                {(cat.items || []).map((item: any) => (
                  <div key={item.name} className="rounded-md bg-surface p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Issues Detected */}
        {issues.length > 0 && (() => {
          const toggleFilter = (p: string) => {
            setActivePriorityFilters(prev => {
              const next = new Set(prev);
              if (next.has(p)) next.delete(p);
              else next.add(p);
              return next;
            });
          };
          const filteredIssues = activePriorityFilters.size === 0
            ? issues
            : issues.filter((i: any) => activePriorityFilters.has(i.priority));

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 sm:mb-10"
            >
              <h2 id="report-issues" className="mb-2 text-base sm:text-lg font-semibold text-foreground flex items-center gap-2 scroll-mt-20">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Issues Detected ({issues.length})
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Sorted by priority — fix critical issues first for maximum conversion impact.</p>
              
              {/* Priority filter toggles */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(["critical", "high", "medium", "low"] as const).map(p => {
                  const count = issues.filter((i: any) => i.priority === p).length;
                  if (count === 0) return null;
                  const isActive = activePriorityFilters.has(p);
                  const noFilters = activePriorityFilters.size === 0;
                  return (
                    <button
                      key={p}
                      onClick={() => toggleFilter(p)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all border min-h-[36px] ${
                        isActive || noFilters
                          ? `${priorityBadgeColors[p]} border-current/20 ring-1 ring-current/10`
                          : "bg-muted/50 text-muted-foreground/50 border-transparent"
                      } hover:opacity-90 cursor-pointer`}
                    >
                      {React.createElement(priorityIcons[p], { className: "h-3 w-3" })}
                      {count} {priorityLabels[p]}
                    </button>
                  );
                })}
                {activePriorityFilters.size > 0 && (
                  <button
                    onClick={() => setActivePriorityFilters(new Set())}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[36px]"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {filteredIssues.map((issue: any, i: number) => {
                  const Icon = priorityIcons[issue.priority] || Info;
                  return (
                    <motion.div
                      key={`${issue.title}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.03 }}
                      className={`rounded-lg border p-3 sm:p-4 ${priorityColors[issue.priority] || "bg-card border-border"}`}
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                            <h4 className="text-sm font-semibold break-words">{issue.title}</h4>
                            <span className={`shrink-0 self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityBadgeColors[issue.priority] || "bg-muted text-muted-foreground"}`}>
                              {priorityLabels[issue.priority] || issue.priority}
                            </span>
                          </div>
                          <p className="text-xs opacity-80 mt-1 break-words">{issue.description}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {issue.score_impact && (
                              <p className="text-[10px] opacity-60">Score impact: -{issue.score_impact} pts</p>
                            )}
                            <Button size="sm" variant="ghost" className="h-6 gap-1 text-[10px] font-semibold text-primary hover:text-primary hover:bg-primary/10" onClick={handleApplyFix}>
                              <Zap className="h-3 w-3" /> Apply Fix
                            </Button>
                            <CreateTaskFromIssue
                              issue={issue}
                              auditId={audit.id}
                              storeUrl={audit.store_url}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {filteredIssues.length === 0 && activePriorityFilters.size > 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No issues match the selected filters.</p>
              )}
            </motion.div>
          );
        })()}

        {/* Quick Wins */}
        <QuickWinsSection recommendations={recommendations} overallScore={audit.overall_score || 0} />

        {/* Recommended Fix Order */}
        {fixOrderRecs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8 sm:mb-10"
          >
            <h2 id="report-fix-order" className="mb-2 text-base sm:text-lg font-semibold text-foreground flex items-center gap-2 scroll-mt-20">
              <ListOrdered className="h-5 w-5 text-primary" />
              Recommended Fix Order
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Tackle fixes in this order for the fastest conversion improvements.</p>
            <div className="space-y-2">
              {fixOrderRecs.map((rec: any, i: number) => {
                const Icon = priorityIcons[rec.priority] || Info;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground break-words">{rec.title}</h4>
                        <div className="flex gap-1.5 shrink-0 flex-wrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityBadgeColors[rec.priority] || "bg-muted text-muted-foreground"}`}>
                            <Icon className="h-2.5 w-2.5" />
                            {priorityLabels[rec.priority] || rec.priority}
                          </span>
                          {rec.effort && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              {rec.effort === "quick_win" ? "⚡ Quick Win" : rec.effort === "moderate" ? "🔧 Moderate" : "🏗️ Significant"}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">{rec.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Optimization Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 sm:mb-10"
          >
            <h2 id="report-recommendations" className="mb-4 text-base sm:text-lg font-semibold text-foreground flex items-center gap-2 scroll-mt-20">
              <Lightbulb className="h-5 w-5 text-primary" />
              All Recommendations ({recommendations.length})
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec: any, i: number) => {
                const Icon = priorityIcons[rec.priority] || Info;
                return (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground break-words">{rec.title}</h4>
                      <div className="flex gap-1.5 shrink-0 flex-wrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadgeColors[rec.priority] || "bg-muted text-muted-foreground"}`}>
                          <Icon className="h-3 w-3" />
                          {priorityLabels[rec.priority] || rec.priority}
                        </span>
                        {rec.effort && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {rec.effort === "quick_win" ? "Quick Win" : rec.effort === "moderate" ? "Moderate" : "Significant"}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">{rec.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Button size="sm" variant="ghost" className="h-6 gap-1 text-[10px] font-semibold text-primary hover:text-primary hover:bg-primary/10" onClick={handleApplyFix}>
                        <Zap className="h-3 w-3" /> Apply Fix
                      </Button>
                      <SuggestionFeedback
                        featureName="store_audit"
                        suggestionId={generateSuggestionId("audit", rec.title || "rec", i)}
                        content={rec.description}
                        showEdit
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Shopify App Performance */}
        <motion.div id="report-performance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-8 sm:mb-10 scroll-mt-20">
          <ShopifyAppPerformance
            detectedApps={audit.raw_analysis?.detected_apps || audit.raw_analysis?.scraped?.detectedApps || []}
            appAnalysis={audit.raw_analysis?.app_analysis || null}
          />
        </motion.div>

        {/* Competitor Analysis - Pro+ */}
        <FeatureGate feature="competitor_analysis">
          <CompetitorAnalysis audit={audit} />
        </FeatureGate>

        {/* Benchmarking - Pro+ */}
        <div id="report-benchmark" className="scroll-mt-20">
          <FeatureGate feature="benchmark">
            <StoreBenchmark currentScore={audit.overall_score || 0} />
          </FeatureGate>
        </div>

        {/* Shareable Scorecard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <h2 id="report-share" className="mb-4 text-base sm:text-lg font-semibold text-foreground scroll-mt-20">Share Your Scorecard</h2>
          <ScorecardActions
            auditId={audit.id}
            storeUrl={audit.store_url}
            overallScore={audit.overall_score || 0}
            scores={{
              homepage: audit.homepage_score,
              productPages: audit.product_page_score,
              trustSignals: audit.trust_score,
              mobileExperience: audit.mobile_score,
              seo: audit.seo_score,
            }}
            date={audit.created_at}
          />
        </motion.div>

        {/* Post-Audit Upgrade Trigger */}
        <UpgradeTrigger
          variant="post-audit"
          issueCount={issues?.length || 12}
          className="mt-6"
        />

        {/* AI Insight Teaser */}
        <UpgradeTrigger
          variant="ai-teaser"
          hiddenCount={Math.max(0, (issues?.length || 5) - 3)}
          className="mt-4"
        />

        {/* Lead Generator Section */}
        <FixIssuesSection report={reportForLeadGen as any} />

        {/* Retention CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            className="flex-1 gap-2 min-h-[44px]"
            onClick={() => {
              toast({ title: "Report saved", description: "You can access it from your dashboard anytime" });
            }}
          >
            <Save className="h-4 w-4" /> Save Report
          </Button>
          <Button
            className="flex-1 gap-2 min-h-[44px] bg-gradient-to-r from-primary to-[hsl(250,70%,60%)] border-0"
            onClick={() => navigate("/dashboard")}
          >
            Continue Optimization <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </motion.div>
        <ShopifyConnectionGate open={showConnectionGate} onClose={() => setShowConnectionGate(false)} />
      </main>
    </div>
  );
};

export default AuditResults;
