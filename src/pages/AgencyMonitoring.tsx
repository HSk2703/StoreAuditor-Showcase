import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isDevBypassEnabled } from "@/lib/dev-auth-bypass";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Minus, ArrowLeft,
  Bell, Loader2, TrendingUp, CheckCircle, X, Building2, Download, Palette, ClipboardList, BarChart3, UserPlus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportMonitoringPDF, type BrandingOptions } from "@/lib/pdf-monitoring-export";
import AgencyBrandingSettings from "@/components/agency/AgencyBrandingSettings";
import StoreChangeTimeline from "@/components/monitoring/StoreChangeTimeline";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useAuth } from "@/contexts/AuthProvider";

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

interface StoreRow {
  id: string;
  store_name: string;
  store_url: string;
  last_audit_score: number | null;
  last_audit_date: string | null;
}

const getChangeIcon = (change: number | null) => {
  if (change === null || change === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (change > 0) return <ArrowUp className="h-4 w-4 text-success" />;
  return <ArrowDown className="h-4 w-4 text-critical" />;
};

const getChangeColor = (change: number | null) => {
  if (change === null || change === 0) return "text-muted-foreground";
  if (change > 0) return "text-success";
  return "text-critical";
};

const getStatusLabel = (change: number | null) => {
  if (change === null || change === 0) return { text: "Unchanged", color: "text-muted-foreground" };
  if (change > 0) return { text: "Improved", color: "text-success" };
  return { text: "Dropped", color: "text-critical" };
};

const AgencyMonitoring = () => {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [showBranding, setShowBranding] = useState(false);
  const [branding, setBranding] = useState<BrandingOptions | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("agency_branding")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBranding({
            company_name: data.company_name || undefined,
            logo_url: data.logo_url || undefined,
            primary_color: data.primary_color || undefined,
            secondary_color: data.secondary_color || undefined,
            footer_text: data.footer_text || undefined,
          });
        }
      });
  }, [user]);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setFetchError(null);

    try {
      if (isDevBypassEnabled() && isDevBypassEnabled()) {
        console.log("[AgencyMonitoring] Dev mode — using real user ID:", user.id);
      }

      const { data: monitoring, error: monErr } = await supabase
        .from("store_monitoring")
        .select("managed_store_id")
        .eq("user_id", user.id)
        .eq("enabled", true);

      if (monErr) throw monErr;
      const monitoredIds = (monitoring || []).map((m: any) => m.managed_store_id);

      if (monitoredIds.length === 0) {
        setStores([]);
        setHistory([]);
        setAlerts([]);
        setLoading(false);
        return;
      }

      const [storesRes, historyRes, alertsRes] = await Promise.all([
        supabase.from("managed_stores").select("id, store_name, store_url, last_audit_score, last_audit_date").in("id", monitoredIds),
        supabase.from("store_monitoring_history").select("*").in("managed_store_id", monitoredIds).order("created_at", { ascending: false }).limit(100),
        supabase.from("store_alerts").select("*").in("managed_store_id", monitoredIds).order("created_at", { ascending: false }).limit(50),
      ]);

      if (storesRes.error) throw storesRes.error;
      console.log("[AgencyMonitoring] Monitored stores:", storesRes.data?.length ?? 0);

      setStores((storesRes.data as StoreRow[]) || []);
      setHistory((historyRes.data as HistoryRow[]) || []);
      setAlerts((alertsRes.data as AlertRow[]) || []);
    } catch (err: any) {
      console.error("[AgencyMonitoring] Fetch error:", err);
      setFetchError(err.message || "Failed to load monitoring data");
      setStores([]);
      setHistory([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isReady) return;
    if (user) fetchData();
    else setLoading(false);
  }, [isReady, user, fetchData]);

  const dismissAlert = async (id: string) => {
    await supabase.from("store_alerts").update({ is_read: true }).eq("id", id);
    setAlerts((a) => a.filter((al) => al.id !== id));
  };

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
        <main className="container max-w-5xl py-20 text-center">
          <Activity className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Conversion Monitoring</h1>
          <p className="text-muted-foreground mb-6">Sign in to access monitoring.</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </main>
      </div>
    );
  }

  const unreadAlerts = alerts.filter((a) => !a.is_read);

  // Build chart data for selected store or all stores
  const chartStoreId = selectedStore || (stores.length > 0 ? stores[0].id : null);
  const chartData = chartStoreId
    ? history
        .filter((h) => h.managed_store_id === chartStoreId)
        .reverse()
        .map((h) => ({
          label: new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: h.conversion_score ?? 0,
        }))
    : [];

  // Latest history per store for the performance table
  const latestByStore = new Map<string, HistoryRow>();
  for (const h of history) {
    if (!latestByStore.has(h.managed_store_id)) {
      latestByStore.set(h.managed_store_id, h);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="container max-w-6xl py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <PageBreadcrumb items={[
            { label: "Agency", href: "/agency" },
            { label: "Monitoring" },
          ]} />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Activity className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Conversion Monitoring</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Track store performance over time with automated audits.</p>
              <Tabs value="monitoring" onValueChange={(v) => {
                if (v === "monitoring") return;
                if (v === "tasks") navigate("/agency/tasks");
                else if (v === "clients") navigate("/agency?tab=clients");
                else if (v === "reports") navigate("/agency?tab=reports");
                else navigate("/agency");
              }}>
                <TabsList>
                  <TabsTrigger value="stores">Stores</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
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
            </div>
          {stores.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowBranding(true)}
              >
                <Palette className="h-4 w-4" /> Branding
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => exportMonitoringPDF(stores, history, alerts, branding)}
              >
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          )}
          </div>
        </motion.div>

        {/* Branding Dialog */}
        <Dialog open={showBranding} onOpenChange={setShowBranding}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>White-Label Branding</DialogTitle>
            </DialogHeader>
            {user && (
              <AgencyBrandingSettings
                userId={user.id}
                onBrandingChange={(b) => setBranding(b)}
              />
            )}
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : fetchError ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-dashed border-critical/30 bg-critical/5 p-12 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-critical mb-3" />
            <p className="text-foreground font-medium mb-1">Something went wrong while loading your data</p>
            <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
            <Button size="sm" onClick={() => { setLoading(true); fetchData(); }} className="gap-2">Retry</Button>
          </motion.div>
        ) : stores.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Activity className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-foreground font-medium mb-1">🚀 No monitored stores</p>
            <p className="text-sm text-muted-foreground mb-4">
              Enable monitoring on stores in the Agency Dashboard to start tracking performance.
            </p>
            <Button size="sm" onClick={() => navigate("/agency")}>Go to Agency Dashboard</Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Alerts */}
            {unreadAlerts.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-critical" />
                  Store Health Alerts
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-critical/10 px-2 py-0.5 text-xs font-bold text-critical">
                    {unreadAlerts.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  <AnimatePresence>
                    {unreadAlerts.slice(0, 5).map((alert) => {
                      const store = stores.find((s) => s.id === alert.managed_store_id);
                      return (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                            alert.severity === "critical"
                              ? "border-critical/30 bg-critical/5"
                              : "border-warning/30 bg-warning/5"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle className={`h-4 w-4 mt-0.5 ${alert.severity === "critical" ? "text-critical" : "text-warning"}`} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{store?.store_name}</p>
                              <p className="text-xs text-muted-foreground">{alert.message}</p>
                            </div>
                          </div>
                          <button onClick={() => dismissAlert(alert.id)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Performance Table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <h2 className="text-lg font-semibold text-foreground mb-3">Store Performance</h2>
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Store</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Latest Score</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Previous</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Change</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Last Checked</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((store) => {
                        const latest = latestByStore.get(store.id);
                        const change = latest?.score_change ?? null;
                        const status = getStatusLabel(change);
                        return (
                          <tr
                            key={store.id}
                            className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
                              chartStoreId === store.id ? "bg-primary/5" : ""
                            }`}
                            onClick={() => setSelectedStore(store.id)}
                          >
                            <td className="px-4 py-3 font-medium text-foreground">{store.store_name}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-lg font-bold text-foreground">
                                {latest?.conversion_score ?? store.last_audit_score ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground">
                              {latest?.previous_score ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 font-medium ${getChangeColor(change)}`}>
                                {getChangeIcon(change)}
                                {change !== null ? (change > 0 ? `+${change}` : change) : "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                              {latest
                                ? new Date(latest.created_at).toLocaleDateString()
                                : store.last_audit_date
                                ? new Date(store.last_audit_date).toLocaleDateString()
                                : "Never"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            {/* Score History Chart */}
            {chartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Conversion Score History
                  {chartStoreId && (
                    <span className="text-sm font-normal text-muted-foreground">
                      — {stores.find((s) => s.id === chartStoreId)?.store_name}
                    </span>
                  )}
                </h2>
                <div className="rounded-lg border border-border bg-card p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} tickCount={6} />
                      <ReferenceLine y={60} stroke="hsl(38 92% 50%)" strokeDasharray="4 4" strokeOpacity={0.3} />
                      <ReferenceLine y={80} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" strokeOpacity={0.3} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: 8, fontSize: 12 }}
                        formatter={(value: number) => [`${value}/100`, "Score"]}
                      />
                      <Line type="monotone" dataKey="score" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(217 91% 60%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* AI Insights */}
            {(() => {
              const latestInsights = history.filter((h) => h.ai_insights).slice(0, 5);
              if (latestInsights.length === 0) return null;
              return (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <h2 className="text-lg font-semibold text-foreground mb-3">AI Insights</h2>
                  <div className="space-y-2">
                    {latestInsights.map((h) => {
                      const store = stores.find((s) => s.id === h.managed_store_id);
                      return (
                        <div key={h.id} className="rounded-lg border border-border bg-card p-4">
                          <p className="text-xs text-muted-foreground mb-1">
                            {store?.store_name} · {new Date(h.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-foreground">{h.ai_insights}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}

            {/* Store Change History */}
            {selectedStore && (() => {
              const selStore = stores.find((s) => s.id === selectedStore);
              if (!selStore) return null;
              return (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <StoreChangeTimeline storeUrl={selStore.store_url} storeName={selStore.store_name} />
                </motion.div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
};

export default AgencyMonitoring;
