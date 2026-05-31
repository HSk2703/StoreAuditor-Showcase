import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Loader2, ShieldCheck, AlertTriangle, TrendingUp,
  ArrowUp, ArrowDown, Minus, Bell, X, FileBarChart,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import WeeklyReportCard from "@/components/client/WeeklyReportCard";
import { useAuth } from "@/contexts/AuthProvider";

interface StoreData {
  id: string;
  store_name: string;
  store_url: string;
  last_audit_score: number | null;
  last_audit_id: string | null;
  last_audit_date: string | null;
}

interface HistoryRow {
  id: string;
  managed_store_id: string;
  conversion_score: number | null;
  previous_score: number | null;
  score_change: number | null;
  ai_insights: string | null;
  created_at: string;
}

interface AlertRow {
  id: string;
  managed_store_id: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

const getScoreColor = (score: number | null) => {
  if (score === null) return "text-muted-foreground";
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-critical";
};

const getScoreBg = (score: number | null) => {
  if (score === null) return "bg-muted";
  if (score >= 80) return "bg-success/10 border-success/20";
  if (score >= 60) return "bg-warning/10 border-warning/20";
  return "bg-critical/10 border-critical/20";
};

const getScoreLabel = (score: number | null) => {
  if (score === null) return "No data";
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Needs Improvement";
  return "Critical";
};

const ClientPortal = () => {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [audits, setAudits] = useState<Map<string, any>>(new Map());
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: access } = await supabase
      .from("client_store_access")
      .select("managed_store_id")
      .eq("client_user_id", user.id);

    const storeIds = (access || []).map((a: any) => a.managed_store_id);

    if (storeIds.length === 0) {
      setStores([]);
      setLoading(false);
      return;
    }

    const [storesRes, historyRes, alertsRes, reportsRes] = await Promise.all([
      supabase.from("managed_stores")
        .select("id, store_name, store_url, last_audit_score, last_audit_id, last_audit_date")
        .in("id", storeIds),
      supabase.from("store_monitoring_history")
        .select("*")
        .in("managed_store_id", storeIds)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("store_alerts")
        .select("*")
        .in("managed_store_id", storeIds)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("weekly_reports")
        .select("*")
        .in("managed_store_id", storeIds)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const storeList = (storesRes.data as StoreData[]) || [];
    setStores(storeList);
    setHistory((historyRes.data as HistoryRow[]) || []);
    setAlerts((alertsRes.data as AlertRow[]) || []);
    setWeeklyReports((reportsRes.data as any[]) || []);

    const auditIds = storeList.map(s => s.last_audit_id).filter(Boolean);
    if (auditIds.length > 0) {
      const { data: auditData } = await supabase
        .from("store_audits")
        .select("id, overall_score, homepage_score, product_page_score, trust_score, mobile_score, seo_score, issues, created_at")
        .in("id", auditIds);
      const map = new Map<string, any>();
      (auditData || []).forEach((a: any) => map.set(a.id, a));
      setAudits(map);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!isReady) return;
    if (user) fetchData();
    else setLoading(false);
  }, [isReady, user, fetchData]);

  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="container max-w-4xl py-20 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Client Portal</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your store's performance reports.</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </main>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="container max-w-4xl py-20 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">No Store Access</h1>
          <p className="text-sm text-muted-foreground">Your agency hasn't granted you access to any stores yet. Please contact them for an invitation.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="container max-w-5xl py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Your Store Dashboard</h1>
          <p className="text-sm text-muted-foreground">View your store's conversion performance and audit results.</p>
        </motion.div>

        {stores.map((store, idx) => {
          const audit = store.last_audit_id ? audits.get(store.last_audit_id) : null;
          const storeHistory = history
            .filter(h => h.managed_store_id === store.id)
            .reverse()
            .map(h => ({
              label: new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              score: h.conversion_score ?? 0,
            }));
          const storeAlerts = alerts.filter(a => a.managed_store_id === store.id);
          const latestHistory = history.find(h => h.managed_store_id === store.id);
          const change = latestHistory?.score_change ?? null;

          return (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="mb-8"
            >
              {/* Store header */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-foreground">{store.store_name}</h2>
                <span className="text-xs text-muted-foreground">{store.store_url.replace(/^https?:\/\//, "")}</span>
              </div>

              {/* Score + Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Main Score */}
                <div className={`rounded-xl border p-6 text-center ${getScoreBg(store.last_audit_score)}`}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Conversion Score</p>
                  <p className={`text-5xl font-extrabold ${getScoreColor(store.last_audit_score)}`}>
                    {store.last_audit_score ?? "—"}
                  </p>
                  <p className={`text-sm font-medium mt-1 ${getScoreColor(store.last_audit_score)}`}>
                    {getScoreLabel(store.last_audit_score)}
                  </p>
                  {change !== null && change !== 0 && (
                    <div className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${change > 0 ? "text-success" : "text-critical"}`}>
                      {change > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {change > 0 ? `+${change}` : change} from last audit
                    </div>
                  )}
                </div>

                {/* Category scores */}
                {audit && (
                  <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Homepage", score: audit.homepage_score },
                      { label: "Product Pages", score: audit.product_page_score },
                      { label: "Trust Signals", score: audit.trust_score },
                      { label: "Mobile UX", score: audit.mobile_score },
                      { label: "SEO", score: audit.seo_score },
                    ].map((cat) => (
                      <div key={cat.label} className="rounded-lg border border-border bg-card p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{cat.label}</p>
                        <p className={`text-xl font-bold ${getScoreColor(cat.score)}`}>{cat.score ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alerts */}
              {storeAlerts.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-critical" /> Active Alerts
                  </h3>
                  <div className="space-y-2">
                    {storeAlerts.slice(0, 3).map(alert => (
                      <div
                        key={alert.id}
                        className={`rounded-lg border p-3 text-sm ${
                          alert.severity === "critical" ? "border-critical/30 bg-critical/5" : "border-warning/30 bg-warning/5"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === "critical" ? "text-critical" : "text-warning"}`} />
                          <p className="text-foreground">{alert.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {audit?.issues && (audit.issues as any[]).length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Key Issues</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(audit.issues as any[]).slice(0, 4).map((issue: any, i: number) => (
                      <div key={i} className={`rounded-lg border p-3 ${
                        issue.priority === "high" ? "border-critical/20 bg-critical/5" : issue.priority === "medium" ? "border-warning/20 bg-warning/5" : "border-border bg-card"
                      }`}>
                        <p className="text-sm font-medium text-foreground">{issue.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History Chart */}
              {storeHistory.length > 1 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Score History
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={storeHistory} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} tickCount={5} />
                      <ReferenceLine y={60} stroke="hsl(38 92% 50%)" strokeDasharray="4 4" strokeOpacity={0.3} />
                      <ReferenceLine y={80} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" strokeOpacity={0.3} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: 8, fontSize: 12 }}
                        formatter={(value: number) => [`${value}/100`, "Score"]}
                      />
                      <Line type="monotone" dataKey="score" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(217 91% 60%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Weekly Reports */}
              {(() => {
                const storeReports = weeklyReports.filter(r => r.managed_store_id === store.id);
                if (storeReports.length === 0) return null;
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileBarChart className="h-4 w-4 text-primary" /> Weekly Reports
                    </h3>
                    <div className="space-y-4">
                      {storeReports.map((report, i) => (
                        <WeeklyReportCard
                          key={report.id}
                          report={report}
                          storeName={store.store_name}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          );
        })}
      </main>
    </div>
  );
};

export default ClientPortal;
