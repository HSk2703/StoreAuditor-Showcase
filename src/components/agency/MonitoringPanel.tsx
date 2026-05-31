import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Minus,
  Bell, TrendingUp, X, Download, Palette,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { exportMonitoringPDF, type BrandingOptions } from "@/lib/pdf-monitoring-export";
import AgencyBrandingSettings from "@/components/agency/AgencyBrandingSettings";
import StoreChangeTimeline from "@/components/monitoring/StoreChangeTimeline";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

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

const MonitoringPanel = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [showBranding, setShowBranding] = useState(false);
  const [branding, setBranding] = useState<BrandingOptions | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  const fetchData = useCallback(async () => {
    if (!user) return;
    setFetchError(null);
    try {
      const { data: monitoring, error: monErr } = await supabase
        .from("store_monitoring")
        .select("managed_store_id")
        .eq("user_id", user.id)
        .eq("enabled", true);
      if (monErr) throw monErr;
      const monitoredIds = (monitoring || []).map((m: any) => m.managed_store_id);
      if (monitoredIds.length === 0) {
        setStores([]); setHistory([]); setAlerts([]); setLoading(false);
        return;
      }
      const [storesRes, historyRes, alertsRes] = await Promise.all([
        supabase.from("managed_stores").select("id, store_name, store_url, last_audit_score, last_audit_date").in("id", monitoredIds),
        supabase.from("store_monitoring_history").select("*").in("managed_store_id", monitoredIds).order("created_at", { ascending: false }).limit(100),
        supabase.from("store_alerts").select("*").in("managed_store_id", monitoredIds).order("created_at", { ascending: false }).limit(50),
      ]);
      if (storesRes.error) throw storesRes.error;
      setStores((storesRes.data as StoreRow[]) || []);
      setHistory((historyRes.data as HistoryRow[]) || []);
      setAlerts((alertsRes.data as AlertRow[]) || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load monitoring data");
      setStores([]); setHistory([]); setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
  }, [user, fetchData]);

  const dismissAlert = async (id: string) => {
    await supabase.from("store_alerts").update({ is_read: true }).eq("id", id);
    setAlerts((a) => a.filter((al) => al.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-critical/30 bg-critical/5 p-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-critical mb-3" />
        <p className="text-foreground font-medium mb-1">Failed to load monitoring data</p>
        <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
        <Button size="sm" onClick={() => { setLoading(true); fetchData(); }}>Retry</Button>
      </motion.div>
    );
  }

  if (stores.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-border glass-card p-16 text-center">
        <Activity className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-foreground font-medium mb-1">No monitored stores</p>
        <p className="text-sm text-muted-foreground">Enable monitoring on stores in the Stores tab to start tracking</p>
      </motion.div>
    );
  }

  const unreadAlerts = alerts.filter((a) => !a.is_read);
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

  const latestByStore = new Map<string, HistoryRow>();
  for (const h of history) {
    if (!latestByStore.has(h.managed_store_id)) {
      latestByStore.set(h.managed_store_id, h);
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Store Health Monitoring</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowBranding(true)}>
            <Palette className="h-3.5 w-3.5" /> Branding
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportMonitoringPDF(stores, history, alerts, branding)}>
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Branding Dialog */}
      <Dialog open={showBranding} onOpenChange={setShowBranding}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>White-Label Branding</DialogTitle></DialogHeader>
          {user && <AgencyBrandingSettings userId={user.id} onBrandingChange={(b) => setBranding(b)} />}
        </DialogContent>
      </Dialog>

      {/* Alert Summary */}
      {unreadAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border border-critical/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-critical" />
            <span className="text-sm font-semibold text-foreground">Health Alerts</span>
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-critical/10 px-2 py-0.5 text-xs font-bold text-critical">
              {unreadAlerts.length}
            </span>
          </div>
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
                      alert.severity === "critical" ? "border-critical/30 bg-critical/5" : "border-warning/30 bg-warning/5"
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

      {/* Performance Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stores.map((store) => {
            const latest = latestByStore.get(store.id);
            const change = latest?.score_change ?? null;
            const status = getStatusLabel(change);
            const score = latest?.conversion_score ?? store.last_audit_score;
            const isSelected = chartStoreId === store.id;

            return (
              <motion.div
                key={store.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedStore(store.id)}
                className={`glass-card rounded-xl border p-4 cursor-pointer transition-all ${
                  isSelected ? "border-primary/40 ring-1 ring-primary/20" : "hover:border-primary/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground truncate">{store.store_name}</h3>
                  <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`text-3xl font-bold ${
                      score && score >= 80 ? "text-success" : score && score >= 60 ? "text-warning" : "text-critical"
                    }`}>
                      {score ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/100</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(change)}`}>
                    {getChangeIcon(change)}
                    <span>{change !== null ? (change > 0 ? `+${change}` : change) : "—"}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {latest ? new Date(latest.created_at).toLocaleDateString() : store.last_audit_date ? new Date(store.last_audit_date).toLocaleDateString() : "Never checked"}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Score History Chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Score History — {stores.find((s) => s.id === chartStoreId)?.store_name}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickCount={6} />
              <ReferenceLine y={60} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.3} />
              <ReferenceLine y={80} stroke="hsl(var(--success))" strokeDasharray="4 4" strokeOpacity={0.3} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`${value}/100`, "Score"]}
              />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* AI Insights */}
      {(() => {
        const latestInsights = history.filter((h) => h.ai_insights).slice(0, 5);
        if (latestInsights.length === 0) return null;
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h3 className="text-sm font-semibold text-foreground mb-3">AI Insights</h3>
            <div className="space-y-2">
              {latestInsights.map((h) => {
                const store = stores.find((s) => s.id === h.managed_store_id);
                return (
                  <div key={h.id} className="glass-card rounded-xl border p-4">
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

      {/* Store Change Timeline */}
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
  );
};

export default MonitoringPanel;
