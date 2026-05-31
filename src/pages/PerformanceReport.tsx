import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isDevBypassEnabled } from "@/lib/dev-auth-bypass";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ClipboardList, UserPlus } from "lucide-react";
import {
  ArrowLeft, Download, Share2, ExternalLink, Loader2, TrendingUp, TrendingDown,
  Minus, BarChart3, PieChart as PieChartIcon, Lightbulb, FileText, Sparkles, Target, AlertTriangle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import StoreOverviewCard from "@/components/report/StoreOverviewCard";
import ImprovementTracking from "@/components/report/ImprovementTracking";
import KeyInsightsSection from "@/components/report/KeyInsightsSection";
import ClientSummarySection from "@/components/report/ClientSummarySection";
import ExportActions from "@/components/report/ExportActions";
import StoreChangeTimeline from "@/components/monitoring/StoreChangeTimeline";
import ShopifyAppPerformance from "@/components/ShopifyAppPerformance";

interface AuditRecord {
  id: string;
  created_at: string;
  overall_score: number | null;
  homepage_score: number | null;
  product_page_score: number | null;
  trust_score: number | null;
  mobile_score: number | null;
  seo_score: number | null;
  issues: any;
  status: string;
}

interface StoreInfo {
  id: string;
  store_name: string;
  store_url: string;
  client_name: string | null;
  last_audit_score: number | null;
}

const CHART_COLORS = {
  primary: "hsl(217 91% 60%)",
  success: "hsl(142 71% 45%)",
  warning: "hsl(38 92% 50%)",
  critical: "hsl(0 84% 60%)",
  muted: "hsl(215 16% 47%)",
  purple: "hsl(250 70% 55%)",
};

const PIE_COLORS = [CHART_COLORS.critical, CHART_COLORS.warning, CHART_COLORS.primary, CHART_COLORS.muted];

const TIME_FILTERS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 0 },
];

const PerformanceReport = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(0);

  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!storeId) return;
      setFetchError(null);

      try {
        if (isDevBypassEnabled() && isDevBypassEnabled()) {
          console.log("[PerformanceReport] Dev mode — fetching real data for store:", storeId);
        }

        const [storeRes, auditsRes] = await Promise.all([
          supabase.from("managed_stores").select("id, store_name, store_url, client_name, last_audit_score").eq("id", storeId).single(),
          supabase.from("store_audits").select("*").eq("status", "completed").not("overall_score", "is", null).order("created_at", { ascending: true }),
        ]);

        if (storeRes.error) throw storeRes.error;

        if (storeRes.data) {
          setStore(storeRes.data as StoreInfo);
          const storeAudits = (auditsRes.data || []).filter(
            (a: any) => a.store_url === storeRes.data.store_url
          ) as AuditRecord[];
          console.log("[PerformanceReport] Store:", storeRes.data.store_name, "Audits:", storeAudits.length);
          setAudits(storeAudits);
        }
      } catch (err: any) {
        console.error("[PerformanceReport] Fetch error:", err);
        setFetchError(err.message || "Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId]);

  const filteredAudits = useMemo(() => {
    if (timeFilter === 0) return audits;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeFilter);
    return audits.filter((a) => new Date(a.created_at) >= cutoff);
  }, [audits, timeFilter]);

  const trendData = useMemo(
    () =>
      filteredAudits.map((a) => ({
        date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: a.overall_score ?? 0,
      })),
    [filteredAudits]
  );

  const latestAudit = audits[audits.length - 1] ?? null;
  const previousAudit = audits.length >= 2 ? audits[audits.length - 2] : null;
  const scoreDiff = latestAudit && previousAudit ? (latestAudit.overall_score ?? 0) - (previousAudit.overall_score ?? 0) : null;

  const categoryData = useMemo(() => {
    if (!latestAudit) return [];
    return [
      { name: "Homepage", score: latestAudit.homepage_score ?? 0, prev: previousAudit?.homepage_score ?? 0 },
      { name: "Product Pages", score: latestAudit.product_page_score ?? 0, prev: previousAudit?.product_page_score ?? 0 },
      { name: "Trust Signals", score: latestAudit.trust_score ?? 0, prev: previousAudit?.trust_score ?? 0 },
      { name: "Mobile", score: latestAudit.mobile_score ?? 0, prev: previousAudit?.mobile_score ?? 0 },
      { name: "SEO", score: latestAudit.seo_score ?? 0, prev: previousAudit?.seo_score ?? 0 },
    ];
  }, [latestAudit, previousAudit]);

  const issueDistribution = useMemo(() => {
    if (!latestAudit?.issues) return [];
    const issues = Array.isArray(latestAudit.issues) ? latestAudit.issues : [];
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    issues.forEach((issue: any) => {
      const p = (issue.priority || issue.severity || "medium").toLowerCase();
      if (p in counts) counts[p as keyof typeof counts]++;
      else counts.medium++;
    });
    return [
      { name: "Critical", value: counts.critical },
      { name: "High", value: counts.high },
      { name: "Medium", value: counts.medium },
      { name: "Low", value: counts.low },
    ].filter((d) => d.value > 0);
  }, [latestAudit]);

  // Optimization opportunity: sum of gaps in category scores
  const opportunityScore = useMemo(() => {
    if (!latestAudit) return 0;
    const scores = [
      latestAudit.homepage_score,
      latestAudit.product_page_score,
      latestAudit.trust_score,
      latestAudit.mobile_score,
      latestAudit.seo_score,
    ].filter((s) => s !== null) as number[];
    if (scores.length === 0) return 0;
    const gaps = scores.map((s) => Math.max(0, 100 - s));
    return Math.round(gaps.reduce((a, b) => a + b, 0) / scores.length * 0.6);
  }, [latestAudit]);

  // Projection data
  const projectionData = useMemo(() => {
    if (audits.length < 2) return [];
    const recent = audits.slice(-3);
    const avgChange = recent.reduce((acc, a, i) => {
      if (i === 0) return 0;
      return acc + ((a.overall_score ?? 0) - (recent[i - 1].overall_score ?? 0));
    }, 0) / Math.max(recent.length - 1, 1);

    const lastScore = latestAudit?.overall_score ?? 0;
    const lastDate = new Date(latestAudit?.created_at ?? Date.now());

    const points = [
      { week: "Current", score: lastScore, projected: lastScore, isProjection: false },
    ];
    for (let w = 1; w <= 4; w++) {
      points.push({
        week: `Week ${w}`,
        score: null as any,
        projected: Math.min(100, Math.max(0, Math.round(lastScore + avgChange * w))),
        isProjection: true,
      });
    }
    return points;
  }, [audits, latestAudit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="container max-w-6xl py-20 text-center">
          <AlertTriangle className="h-10 w-10 text-critical mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Something went wrong while loading your data</p>
          <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="container max-w-6xl py-20 text-center">
          <p className="text-muted-foreground">Store not found.</p>
          <Button variant="ghost" onClick={() => navigate("/agency")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="container max-w-7xl py-8 space-y-8">
        {/* Breadcrumb & Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PageBreadcrumb items={[{ label: "Agency", href: "/agency" }, { label: "Reports", href: "/agency?tab=reports" }, { label: store.store_name }]} />
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mt-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Advanced Performance Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Detailed analytics for{" "}
            <span className="font-medium text-foreground">{store.store_name}</span>
          </p>
          <div className="flex items-center justify-between">
            <Tabs value="reports" onValueChange={(v) => {
              if (v === "reports") navigate("/agency?tab=reports");
              else if (v === "monitoring") navigate("/agency/monitoring");
              else if (v === "tasks") navigate("/agency/tasks");
              else if (v === "clients") navigate("/agency?tab=clients");
              else navigate("/agency");
            }}>
              <TabsList>
                <TabsTrigger value="stores">Stores</TabsTrigger>
                <TabsTrigger value="monitoring" className="gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Monitoring
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" /> Tasks
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" /> Reports
                </TabsTrigger>
                <TabsTrigger value="clients" className="gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" /> Clients
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ExportActions storeId={storeId!} storeName={store.store_name} />
          </div>
        </motion.div>

        {/* 1. Store Overview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StoreOverviewCard store={store} scoreDiff={scoreDiff} auditsCount={audits.length} />
        </motion.div>

        {/* 2. Conversion Score Trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Conversion Performance Over Time
                </CardTitle>
                <CardDescription>Track how the conversion score changes over time</CardDescription>
              </div>
              <div className="flex gap-1">
                {TIME_FILTERS.map((f) => (
                  <Button
                    key={f.label}
                    variant={timeFilter === f.days ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setTimeFilter(f.days)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {trendData.length < 2 ? (
                <p className="text-center text-sm text-muted-foreground py-12">
                  At least 2 audits are needed to display trend data.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={80} stroke={CHART_COLORS.success} strokeDasharray="4 4" strokeOpacity={0.4} />
                    <ReferenceLine y={60} stroke={CHART_COLORS.warning} strokeDasharray="4 4" strokeOpacity={0.4} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [`${value}/100`, "Score"]}
                    />
                    <Line type="monotone" dataKey="score" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.primary }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Category Breakdown + 4. Issue Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Store Optimization Breakdown
                </CardTitle>
                <CardDescription>Scores for each audit category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No audit data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={categoryData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="score" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Current" />
                      {previousAudit && <Bar dataKey="prev" fill="hsl(214 32% 91%)" radius={[4, 4, 0, 0]} name="Previous" />}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Issue Severity Distribution
                </CardTitle>
                <CardDescription>Breakdown of detected issues by priority</CardDescription>
              </CardHeader>
              <CardContent>
                {issueDistribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No issues detected.</p>
                ) : (
                  <div className="w-full" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={issueDistribution}
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={{ strokeWidth: 1 }}
                        >
                          {issueDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 5. Improvement Tracking */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ImprovementTracking categoryData={categoryData} />
        </motion.div>

        {/* 5b. Store Change History */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}>
          <StoreChangeTimeline storeUrl={store.store_url} storeName={store.store_name} />
        </motion.div>

        {/* 6. Optimization Opportunity + 7. Projection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Optimization Opportunity Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="text-6xl font-extrabold text-primary mb-2">+{opportunityScore}</div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Estimated Conversion Improvement Potential
                </p>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Fixing high-priority issues across all categories could improve your conversion performance by up to <span className="font-medium text-foreground">{opportunityScore} points</span>.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Projected Store Performance
                </CardTitle>
                <CardDescription>Predicted score over the next 4 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                {projectionData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Need at least 2 audits for projections.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={projectionData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="score" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: 5 }} connectNulls={false} />
                      <Line type="monotone" dataKey="projected" stroke={CHART_COLORS.purple} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, strokeDasharray: "0" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4" style={{ backgroundColor: CHART_COLORS.primary }} />
                    Actual
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS.purple }} />
                    Projected
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 8. Key Insights */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <KeyInsightsSection
            storeUrl={store.store_url}
            storeName={store.store_name}
            latestAudit={latestAudit}
            previousAudit={previousAudit}
          />
        </motion.div>

        {/* 9. Shopify App Performance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <ShopifyAppPerformance
            detectedApps={(latestAudit as any)?.raw_analysis?.detected_apps || (latestAudit as any)?.raw_analysis?.scraped?.detectedApps || []}
            appAnalysis={(latestAudit as any)?.raw_analysis?.app_analysis || null}
          />
        </motion.div>

        {/* 10. Client Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <ClientSummarySection
            storeName={store.store_name}
            latestAudit={latestAudit}
            previousAudit={previousAudit}
            opportunityScore={opportunityScore}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default PerformanceReport;
