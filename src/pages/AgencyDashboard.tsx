import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { isDevBypassEnabled } from "@/lib/dev-auth-bypass";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { startAudit, runScraping, runAnalysis } from "@/lib/audit-service";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Play, Loader2, Building2, AlertTriangle, Search,
  ClipboardList, BarChart3, UserPlus, Rocket, Brain, Share2,
  Activity, Users, Workflow,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthProvider";

// Modular components
import GlobalOverview from "@/components/agency/GlobalOverview";
import StoreCard from "@/components/agency/StoreCard";

// Lazy loaded panels
const AIFeatureHub = lazy(() => import("@/components/agency/AIFeatureHub"));
const SocialGrowthTab = lazy(() => import("@/components/agency/SocialGrowthTab"));
const AnalyticsPanel = lazy(() => import("@/components/agency/AnalyticsPanel"));
const ClientAccessManager = lazy(() => import("@/components/agency/ClientAccessManager"));
const AgencyStoreTrend = lazy(() => import("@/components/AgencyStoreTrend"));
const MonitoringPanel = lazy(() => import("@/components/agency/MonitoringPanel"));
const TasksPanel = lazy(() => import("@/components/agency/TasksPanel"));
const TeamPanel = lazy(() => import("@/components/agency/TeamPanel"));

interface ManagedStore {
  id: string;
  store_name: string;
  store_url: string;
  client_name: string | null;
  notes: string | null;
  last_audit_id: string | null;
  last_audit_score: number | null;
  last_audit_date: string | null;
  created_at: string;
}

const TABS = [
  { value: "stores", label: "Overview", icon: Rocket },
  { value: "ai-engine", label: "AI Control", icon: Brain },
  { value: "monitoring", label: "Monitoring", icon: Activity },
  { value: "tasks", label: "Tasks", icon: ClipboardList },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "social", label: "Social", icon: Share2 },
  { value: "team", label: "Team", icon: Users },
  { value: "clients", label: "Clients", icon: UserPlus },
] as const;

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stores, setStores] = useState<ManagedStore[]>([]);
  const [connectedStoreIds, setConnectedStoreIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<ManagedStore | null>(null);
  const activeTab = searchParams.get("tab") || "stores";
  const setActiveTab = (tab: string) => {
    setSelectedStore(null);
    if (tab === "stores") setSearchParams({});
    else setSearchParams({ tab });
  };
  const [addForm, setAddForm] = useState({ store_name: "", store_url: "", client_name: "", notes: "" });
  const [adding, setAdding] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [auditingIds, setAuditingIds] = useState<Set<string>>(new Set());
  const [selectedTrend, setSelectedTrend] = useState<ManagedStore | null>(null);
  const { user } = useAuth();
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setFetchError(null);
    try {
      if (isDevBypassEnabled()) {
        console.log("[AgencyDashboard] Dev mode — using real user ID:", user?.id);
      }
      const [storesRes, credsRes] = await Promise.all([
        supabase.from("managed_stores").select("*").order("created_at", { ascending: false }),
        supabase.from("store_credentials" as any).select("managed_store_id"),
      ]);
      if (storesRes.error) throw storesRes.error;
      setStores((storesRes.data as ManagedStore[]) || []);
      const connIds = new Set<string>((credsRes.data || []).map((c: any) => c.managed_store_id));
      setConnectedStoreIds(connIds);
    } catch (err: any) {
      console.error("[AgencyDashboard] Fetch error:", err);
      setFetchError(err.message || "Failed to load stores");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchStores();
    else setLoading(false);
  }, [user, fetchStores]);

  const handleAdd = async () => {
    if (!addForm.store_name.trim() || !addForm.store_url.trim()) return;
    setAdding(true);
    let url = addForm.store_url.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    const { error } = await supabase.from("managed_stores").insert({
      user_id: user.id,
      store_name: addForm.store_name.trim(),
      store_url: url,
      client_name: addForm.client_name.trim() || null,
      notes: addForm.notes.trim() || null,
    });
    if (error) {
      toast({ title: "Failed to add store", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Store added" });
      setAddForm({ store_name: "", store_url: "", client_name: "", notes: "" });
      setShowAdd(false);
      fetchStores();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("managed_stores").delete().eq("id", id);
    setStores((s) => s.filter((st) => st.id !== id));
    if (selectedStore?.id === id) setSelectedStore(null);
    toast({ title: "Store removed" });
  };

  const runSingleAudit = async (store: ManagedStore) => {
    setAuditingIds((prev) => new Set(prev).add(store.id));
    try {
      const auditId = await startAudit(store.store_url);
      const scraped = await runScraping(auditId, store.store_url);
      await runAnalysis(auditId, scraped);
      const { data: audit } = await supabase
        .from("store_audits")
        .select("overall_score, created_at")
        .eq("id", auditId)
        .single();
      await supabase.from("managed_stores").update({
        last_audit_id: auditId,
        last_audit_score: audit?.overall_score ?? null,
        last_audit_date: audit?.created_at ?? new Date().toISOString(),
      }).eq("id", store.id);
      toast({ title: `Audit complete for ${store.store_name}`, description: `Score: ${audit?.overall_score ?? "N/A"}` });
    } catch (e: any) {
      toast({ title: `Audit failed for ${store.store_name}`, description: e.message, variant: "destructive" });
    } finally {
      setAuditingIds((prev) => { const n = new Set(prev); n.delete(store.id); return n; });
      fetchStores();
    }
  };

  const runBulkAudit = async () => {
    const eligible = stores.filter((s) => !auditingIds.has(s.id));
    if (eligible.length === 0) return;
    setBulkRunning(true);
    for (const store of eligible) await runSingleAudit(store);
    setBulkRunning(false);
  };

  // Derived
  const avgScore = stores.filter((s) => s.last_audit_score !== null).length > 0
    ? Math.round(stores.reduce((a, s) => a + (s.last_audit_score || 0), 0) / stores.filter((s) => s.last_audit_score !== null).length)
    : null;
  const healthyCount = stores.filter((s) => (s.last_audit_score ?? 0) >= 80).length;
  const criticalCount = stores.filter((s) => s.last_audit_score !== null && s.last_audit_score < 60).length;
  const filteredStores = stores.filter((s) =>
    s.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.store_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.client_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex items-center justify-center py-20">
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
          <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">AI Growth Operating System</h1>
          <p className="text-muted-foreground mb-6">Sign in to manage and grow multiple Shopify stores</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </main>
      </div>
    );
  }

  const lazyFallback = <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="container max-w-7xl py-6">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <PageBreadcrumb items={[{ label: "Agency" }]} />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Growth OS</h1>
              <p className="text-sm text-muted-foreground">Centralized AI-powered agency command center</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAdd(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Store
              </Button>
              {stores.length > 0 && (
                <Button variant="outline" onClick={runBulkAudit} disabled={bulkRunning} className="gap-2">
                  {bulkRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Audit All
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-none">
              <TabsList className="bg-muted/50 inline-flex w-max h-auto gap-0.5 p-1">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs px-3 py-1.5 whitespace-nowrap">
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsList className="hidden md:flex bg-muted/50 flex-wrap h-auto gap-0.5 p-1">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs px-3 py-1.5">
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* ====== OVERVIEW / STORES TAB ====== */}
        {activeTab === "stores" && !selectedStore && (
          <>
            <GlobalOverview
              totalStores={stores.length}
              avgScore={avgScore}
              healthyCount={healthyCount}
              criticalCount={criticalCount}
            />

            {stores.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search stores..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
              </motion.div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[200px] rounded-xl" />)}
              </div>
            ) : fetchError ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-critical/30 bg-critical/5 p-12 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-critical mb-3" />
                <p className="text-foreground font-medium mb-1">Something went wrong</p>
                <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
                <Button size="sm" onClick={() => { setLoading(true); fetchStores(); }}>Retry</Button>
              </motion.div>
            ) : filteredStores.length === 0 && stores.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-border glass-card p-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(260_70%_55%)] mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">Connect your first store to start AI-powered growth</p>
                <p className="text-sm text-muted-foreground mb-6">Add a Shopify store to unlock audits, analytics, and AI automation</p>
                <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Store</Button>
              </motion.div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No stores match "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStores.map((store, i) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    index={i}
                    isAuditing={auditingIds.has(store.id)}
                    isShopifyConnected={connectedStoreIds.has(store.id)}
                    onRunAudit={() => runSingleAudit(store)}
                    onViewTrend={() => setSelectedTrend(store)}
                    onViewPerformance={() => navigate(`/agency/performance/${store.id}`)}
                    onViewReport={() => navigate(`/agency/report/${store.id}`)}
                    onDelete={() => handleDelete(store.id)}
                    onSelect={() => setSelectedStore(store)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Store Detail */}
        {activeTab === "stores" && selectedStore && (
          <Suspense fallback={lazyFallback}>
            <AnalyticsPanel store={selectedStore} onBack={() => setSelectedStore(null)} />
          </Suspense>
        )}

        {/* ====== AI CONTROL TAB ====== */}
        {activeTab === "ai-engine" && (
          <Suspense fallback={lazyFallback}>
            <AIFeatureHub />
          </Suspense>
        )}

        {/* ====== MONITORING TAB ====== */}
        {activeTab === "monitoring" && (
          <Suspense fallback={lazyFallback}>
            <MonitoringPanel />
          </Suspense>
        )}

        {/* ====== TASKS TAB ====== */}
        {activeTab === "tasks" && (
          <Suspense fallback={lazyFallback}>
            <TasksPanel />
          </Suspense>
        )}

        {/* ====== REPORTS TAB ====== */}
        {activeTab === "reports" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.filter(s => s.last_audit_id).map(store => (
                <div key={store.id} className="glass-card rounded-xl border p-5 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/agency/performance/${store.id}`)}>
                  <h3 className="font-semibold text-foreground mb-1">{store.store_name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{store.client_name || store.store_url.replace(/^https?:\/\//, "")}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-2xl font-bold ${store.last_audit_score && store.last_audit_score >= 80 ? "text-success" : store.last_audit_score && store.last_audit_score >= 60 ? "text-warning" : "text-critical"}`}>
                      {store.last_audit_score ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {store.last_audit_date ? new Date(store.last_audit_date).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <Button size="sm" className="w-full gap-2"><BarChart3 className="h-3.5 w-3.5" /> View Report</Button>
                </div>
              ))}
              {stores.filter(s => s.last_audit_id).length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No audit data yet — run an audit to generate reports</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ====== SOCIAL TAB ====== */}
        {activeTab === "social" && (
          <Suspense fallback={lazyFallback}>
            <SocialGrowthTab />
          </Suspense>
        )}

        {/* ====== TEAM TAB ====== */}
        {activeTab === "team" && (
          <Suspense fallback={lazyFallback}>
            <TeamPanel />
          </Suspense>
        )}

        {/* ====== CLIENTS TAB ====== */}
        {activeTab === "clients" && (
          <Suspense fallback={lazyFallback}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <ClientAccessManager
                userId={user.id}
                stores={stores.map(s => ({ id: s.id, store_name: s.store_name }))}
              />
            </motion.div>
          </Suspense>
        )}

        {/* Add Store Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Shopify Store</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium text-foreground">Store Name *</label>
                <Input placeholder="My Store" value={addForm.store_name} onChange={(e) => setAddForm((f) => ({ ...f, store_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Store URL *</label>
                <Input placeholder="https://mystore.com" value={addForm.store_url} onChange={(e) => setAddForm((f) => ({ ...f, store_url: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Client Name</label>
                <Input placeholder="Client Inc." value={addForm.client_name} onChange={(e) => setAddForm((f) => ({ ...f, client_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Notes</label>
                <Textarea placeholder="Notes about this store..." value={addForm.notes} onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleAdd} disabled={adding || !addForm.store_name.trim() || !addForm.store_url.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Store
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Trend Dialog */}
        <Dialog open={!!selectedTrend} onOpenChange={() => setSelectedTrend(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{selectedTrend?.store_name} — Score Trend</DialogTitle></DialogHeader>
            <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
              {selectedTrend && <AgencyStoreTrend storeUrl={selectedTrend.store_url} />}
            </Suspense>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AgencyDashboard;
