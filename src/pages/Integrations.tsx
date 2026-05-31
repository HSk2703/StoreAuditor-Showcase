import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import {
  CheckCircle2, Loader2, Link2, Unlink, Search, Sparkles, ArrowRight,
  ChevronLeft, ChevronRight, LayoutGrid, Lock, Zap, AlertCircle, X, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

// -------- Types --------
interface Tool {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  no_auth?: boolean;
  aiPowered?: boolean;
}
interface UserIntegration {
  provider: string;
  status: string;
  account_name: string | null;
  last_verified_at?: string | null;
}


const PAGE_SIZE = 24;
const PREVIEW_SIZE = 12;
const RECENT_KEY = "integrations:recent-searches";

function useDebounced<T>(value: T, delay = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function fallbackLogo(t: Tool) {
  if (t.logo) return t.logo;
  return `https://www.google.com/s2/favicons?domain=${t.id}.com&sz=64`;
}

// -------- Page --------
export default function Integrations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [registryTotal, setRegistryTotal] = useState(0);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState(params.get("q") || "");
  const debouncedSearch = useDebounced(search, 200);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>(params.get("cat") || "all");
  const [page, setPage] = useState<number>(() => Math.max(1, parseInt(params.get("page") || "1", 10) || 1));

  const [connected, setConnected] = useState<Record<string, UserIntegration>>({});
  const [connectDialog, setConnectDialog] = useState<Tool | null>(null);
  const [detailTool, setDetailTool] = useState<Tool | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [recentlyConnected, setRecentlyConnected] = useState<string | null>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw).slice(0, 5));
    } catch { /* noop */ }
  }, []);

  // Fetch global registry
  const fetchTools = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.functions.invoke("composio-global-tools");
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to load tools");
      setTools(data.tools || []);
      setCategories(data.categories || []);
      setRegistryTotal(data.total || (data.tools || []).length);
      setStale(Boolean(data.stale));
    } catch (e: any) {
      setLoadError(e?.message || "Could not reach the integrations registry");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchTools(); }, [fetchTools]);

  // Fetch user connections
  const fetchConnected = useCallback(async () => {
    if (!user) { setConnected({}); return; }
    const { data } = await supabase
      .from("user_integrations" as any)
      .select("provider, status, account_name, last_verified_at")
      .eq("user_id", user.id);

    const map: Record<string, UserIntegration> = {};
    (data as any[] || []).forEach((i) => { map[i.provider] = i; });
    setConnected(map);
  }, [user]);
  useEffect(() => { fetchConnected(); }, [fetchConnected]);

  // Realtime cross-tab sync
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { provider: string; status: string } | undefined;
      if (!detail?.provider) { fetchConnected(); return; }
      setConnected((prev) => ({
        ...prev,
        [detail.provider]: {
          provider: detail.provider,
          status: detail.status,
          account_name: prev[detail.provider]?.account_name ?? null,
        },
      }));
    };
    const onFocus = () => fetchConnected();
    window.addEventListener("integration:changed", handler);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("integration:changed", handler);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchConnected]);

  // Sync URL state
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch.trim()) next.set("q", debouncedSearch.trim());
    if (activeCategory !== "all") next.set("cat", activeCategory);
    if (page > 1) next.set("page", String(page));
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeCategory, page]);

  // Reset page on filter change
  useEffect(() => { setPage(1); /* eslint-disable-next-line */ }, [debouncedSearch, activeCategory]);

  // Filtered tools
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return tools.filter((t) => {
      if (activeCategory !== "all" && (t.category || "Other") !== activeCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q)
      );
    });
  }, [tools, debouncedSearch, activeCategory]);

  // Auth gating: anonymous users see preview only
  const visibleLimit = user ? page * PAGE_SIZE : PREVIEW_SIZE;
  const visible = filtered.slice(0, visibleLimit);
  const hasMore = user && visible.length < filtered.length;

  // Connected tools
  const connectedTools = useMemo(() => {
    return tools.filter((t) => {
      const c = connected[t.id];
      return c && (c.status === "connected" || c.status === "active");
    });
  }, [tools, connected]);

  const connectedCount = connectedTools.length;
  const aiPoweredCount = useMemo(
    () => tools.filter((t) => /\bai\b|gpt|gemini|llm/i.test(t.name + " " + (t.description || ""))).length,
    [tools]
  );

  // Search suggestions
  const suggestions = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return [];
    return tools
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [debouncedSearch, tools]);

  function pushRecent(q: string) {
    if (!q.trim()) return;
    const next = [q.trim(), ...recent.filter((r) => r !== q.trim())].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  // Connect flow — secure OAuth only, no manual credentials.
  const openConnect = (tool: Tool) => {
    if (!user) { navigate("/login?next=/integrations"); return; }
    setDetailTool(null);
    setConnectDialog(tool);
  };

  const handleConnect = async () => {
    if (!user || !connectDialog) return;
    setConnecting(true);
    try {
      const callbackUrl = `${window.location.origin}/integrations/return?provider=${encodeURIComponent(connectDialog.id)}`;
      const { data, error } = await supabase.functions.invoke("composio-initiate-connection", {
        body: { toolkit: connectDialog.id, callback_url: callbackUrl },
      });
      if (error || !data?.success || !data?.redirect_url) {
        throw new Error(data?.error || error?.message || "Could not start secure connection");
      }
      // Append the connected_account_id so our return page can finalize it.
      const url = new URL(data.redirect_url);
      const returnUrl = new URL(callbackUrl);
      returnUrl.searchParams.set("connected_account_id", data.connected_account_id || "");
      // Some providers honor a state/redirect_uri override; we rely on Composio's
      // configured callback. We rebuild the local return URL with the id so we
      // can resolve it once the user lands back here.
      sessionStorage.setItem(
        `composio:pending:${connectDialog.id}`,
        data.connected_account_id || "",
      );
      window.location.href = url.toString();
    } catch (e: any) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
      setConnecting(false);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!user) return;
    await supabase.from("user_integrations" as any)
      .update({ status: "disconnected", access_token: null, refresh_token: null })
      .eq("user_id", user.id).eq("provider", provider);
    setConnected((prev) => {
      const next = { ...prev };
      if (next[provider]) next[provider] = { ...next[provider], status: "disconnected" };
      return next;
    });
    window.dispatchEvent(new CustomEvent("integration:changed", {
      detail: { provider, status: "disconnected" },
    }));
    toast({ title: "Disconnected", description: "Integration has been disconnected." });
  };

  // Open ?tool=<id> deep links
  useEffect(() => {
    const t = params.get("tool");
    if (t && tools.length) {
      const found = tools.find((x) => x.id === t);
      if (found) openConnect(found);
      const next = new URLSearchParams(params);
      next.delete("tool");
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools]);

  // Horizontal category scroller
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };
  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [categories.length]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <Header />
      <main className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-10 mt-16">
        <PageBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Integrations" }]} />

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-4">
            <Zap className="h-3 w-3" /> Powered by Kairo
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Integrations Hub
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Kairo operates across your entire stack — connect, automate, and scale.
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <MetricTile
              label="Integrations"
              value={loading ? null : `${registryTotal.toLocaleString()}+`}
              accent="primary"
            />
            <MetricTile
              label="Connected"
              value={loading ? null : connectedCount.toLocaleString()}
              accent="success"
            />
            <MetricTile
              label="AI-Powered"
              value={loading ? null : `${aiPoweredCount.toLocaleString()}+`}
              accent="accent"
            />
          </div>
        </motion.section>

        {/* Connected tools strip */}
        {user && connectedTools.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Your Connected Tools
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {connectedTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDetailTool(t)}
                  className="shrink-0 w-44 rounded-xl border border-success/30 bg-success/5 backdrop-blur-sm p-3 text-left hover:border-success/50 transition group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-8 w-8 rounded-lg border border-success/30 bg-background/50 flex items-center justify-center overflow-hidden">
                      <img src={fallbackLogo(t)} alt="" className="h-5 w-5" loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-success ml-auto" />
                  </div>
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-[10px] text-success/80 truncate">Connected</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search + Browse Categories */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search 1,000+ integrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              onKeyDown={(e) => { if (e.key === "Enter") pushRecent(search); }}
              className="pl-10 h-11 bg-card/40 backdrop-blur-sm border-border/60"
              disabled={loading && !tools.length}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search dropdown */}
            <AnimatePresence>
              {searchFocused && (suggestions.length > 0 || recent.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                        Suggestions
                      </p>
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={() => { setSearch(s.name); pushRecent(s.name); setDetailTool(s); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-primary/10 text-left"
                        >
                          <img src={fallbackLogo(s)} alt="" className="h-4 w-4 rounded" loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                          <span className="text-sm">{s.name}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground">{s.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {recent.length > 0 && (
                    <div className="p-2 border-t border-border/40">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                        Recent
                      </p>
                      {recent.map((r) => (
                        <button
                          key={r}
                          onMouseDown={() => setSearch(r)}
                          className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-primary/10 text-muted-foreground"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Browse categories popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-11 gap-2 border-border/60 bg-card/40 backdrop-blur-sm">
                <LayoutGrid className="h-4 w-4" /> Browse Categories
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[min(92vw,520px)] p-0 border-border/60 bg-card/95 backdrop-blur-xl">
              <div className="p-3 border-b border-border/40">
                <p className="text-sm font-semibold">All Categories</p>
                <p className="text-xs text-muted-foreground">{categories.length} categories · {registryTotal.toLocaleString()}+ tools</p>
              </div>
              <div className="grid grid-cols-2 gap-1 p-2 max-h-[60vh] overflow-y-auto">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-left text-sm hover:bg-primary/10 ${activeCategory === "all" ? "bg-primary/10 text-primary" : ""}`}
                >
                  <span>All</span>
                  <span className="text-xs opacity-70">{registryTotal}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setActiveCategory(c.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-left text-sm hover:bg-primary/10 ${activeCategory === c.name ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-xs opacity-70 ml-2">{c.count}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Horizontal scrollable categories */}
        {!loading && categories.length > 0 && (
          <div className="relative mb-6">
            {showLeft && (
              <>
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
                <button
                  onClick={() => scrollerRef.current?.scrollBy({ left: -240, behavior: "smooth" })}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-center hover:border-primary/40"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            )}
            {showRight && (
              <>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
                <button
                  onClick={() => scrollerRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-center hover:border-primary/40"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            <div
              ref={scrollerRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-1 px-1"
              style={{ scrollbarWidth: "none" }}
            >
              <CategoryPill
                active={activeCategory === "all"}
                label="All"
                count={registryTotal}
                onClick={() => setActiveCategory("all")}
              />
              {categories.map((c) => (
                <CategoryPill
                  key={c.name}
                  active={activeCategory === c.name}
                  label={c.name}
                  count={c.count}
                  onClick={() => setActiveCategory(c.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl bg-card/40" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && loadError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertCircle className="h-7 w-7 text-destructive mx-auto mb-3" />
            <p className="text-sm font-semibold mb-1">Couldn't reach the integrations registry</p>
            <p className="text-xs text-muted-foreground mb-4">{loadError}</p>
            <Button size="sm" variant="outline" onClick={fetchTools}>Retry</Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !loadError && filtered.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-10 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold mb-1">No tools match your filters</p>
            <p className="text-xs text-muted-foreground mb-4">Try clearing your search or picking a different category.</p>
            <Button size="sm" variant="outline" onClick={() => { setSearch(""); setActiveCategory("all"); }}>
              Reset filters
            </Button>
          </div>
        )}

        {/* Grid */}
        {!loading && !loadError && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
              <span>
                Showing <span className="font-semibold text-foreground">{visible.length.toLocaleString()}</span> of{" "}
                <span className="font-semibold text-foreground">{filtered.length.toLocaleString()}</span>
                {stale && <span className="ml-2 text-warning">(cached)</span>}
              </span>
            </div>

            <div className="relative">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((tool) => {
                  const conn = connected[tool.id];
                  const isConnected = conn?.status === "connected" || conn?.status === "active";
                  const justConnected = recentlyConnected === tool.id;
                  // Z7: surface stale verification (>24h since last refresh)
                  const isStale = !!(
                    isConnected &&
                    conn?.last_verified_at &&
                    Date.now() - new Date(conn.last_verified_at).getTime() > 24 * 60 * 60 * 1000
                  );
                  return (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isConnected={isConnected}
                      isStale={isStale}
                      justConnected={justConnected}
                      onOpen={() => setDetailTool(tool)}
                      onConnect={() => openConnect(tool)}
                      onDisconnect={() => handleDisconnect(tool.id)}
                    />
                  );
                })}

              </div>

              {/* Auth-gated blur overlay for anonymous */}
              {!user && filtered.length > PREVIEW_SIZE && (
                <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent via-background/80 to-background flex flex-col items-center justify-end pb-6 pointer-events-none">
                  <div className="pointer-events-auto rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-xl px-6 py-5 text-center shadow-2xl max-w-sm">
                    <Lock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Unlock 1,000+ integrations powered by Kairo</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Sign in to browse the full ecosystem and connect tools in one click.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => navigate("/signup?next=/integrations")} className="gap-1">
                        Sign Up <ArrowRight className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate("/login?next=/integrations")}>
                        Log In
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} className="gap-1.5">
                  Load more <span className="opacity-60">({(filtered.length - visible.length).toLocaleString()} remaining)</span>
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail dialog */}
      <Dialog open={!!detailTool} onOpenChange={(o) => !o && setDetailTool(null)}>
        <DialogContent className="max-w-md">
          {detailTool && (() => {
            const conn = connected[detailTool.id];
            const isConnected = conn?.status === "connected" || conn?.status === "active";
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center overflow-hidden">
                      <img src={fallbackLogo(detailTool)} alt="" className="h-7 w-7"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="text-base">{detailTool.name}</DialogTitle>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                        {detailTool.category || "Other"}
                      </p>
                    </div>
                  </div>
                  <DialogDescription className="pt-2 leading-relaxed">
                    {detailTool.description || "Composio integration"}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  {isConnected ? (
                    <Badge variant="outline" className="border-success/40 text-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-border text-muted-foreground">Not connected</Badge>
                  )}
                  {detailTool.no_auth && (
                    <Badge variant="outline" className="border-primary/30 text-primary">No auth required</Badge>
                  )}
                </div>
                <DialogFooter className="mt-4 gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="ghost" onClick={() => { handleDisconnect(detailTool.id); setDetailTool(null); }}>
                        <Unlink className="h-3.5 w-3.5 mr-1.5" /> Disconnect
                      </Button>
                      <Button onClick={() => openConnect(detailTool)}>
                        <Link2 className="h-3.5 w-3.5 mr-1.5" /> Reconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setDetailTool(null)}>Close</Button>
                      <Button onClick={() => openConnect(detailTool)}>Connect</Button>
                    </>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Connect dialog — Secure OAuth only */}
      <Dialog open={!!connectDialog} onOpenChange={(o) => !o && setConnectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {connectDialog && (
                <img src={fallbackLogo(connectDialog)} alt="" className="h-10 w-10 rounded-lg border border-border/60 bg-muted/40 p-1"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
              )}
              <div className="min-w-0">
                <DialogTitle>Connect {connectDialog?.name}</DialogTitle>
                <DialogDescription className="mt-1">
                  {connectDialog?.description || `Securely link your ${connectDialog?.name} account to Kairo.`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Permissions requested</p>
              <ul className="text-xs text-foreground/90 space-y-1.5">
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Read account profile and metadata</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Perform actions you approve in Kairo</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Disconnect anytime — revokes access instantly</li>
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-semibold text-foreground">Secure OAuth connection</span> — we never see or store your password. You'll authorize on {connectDialog?.name}'s site.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConnectDialog(null)} disabled={connecting}>Cancel</Button>
            <Button onClick={handleConnect} disabled={connecting} className="gap-1.5">
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {connecting ? "Redirecting..." : `Connect with ${connectDialog?.name ?? "Provider"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -------- Sub-components --------

function MetricTile({
  label, value, accent,
}: { label: string; value: string | null; accent: "primary" | "success" | "accent" }) {
  const accentClass =
    accent === "success" ? "from-success/15 to-success/5 border-success/30"
    : accent === "accent" ? "from-accent/15 to-accent/5 border-accent/30"
    : "from-primary/15 to-primary/5 border-primary/30";
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${accentClass} backdrop-blur-sm p-4 text-center sm:text-left`}>
      {value === null ? (
        <Skeleton className="h-7 w-20 mb-1" />
      ) : (
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      )}
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function CategoryPill({
  active, label, count, onClick,
}: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 backdrop-blur-sm ${
        active
          ? "bg-gradient-to-r from-primary/30 via-accent/20 to-primary/20 border-primary text-foreground shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]"
          : "bg-card/40 border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-[0_0_12px_-4px_hsl(var(--primary)/0.4)]"
      }`}
    >
      {label}
      <span className="ml-1.5 opacity-70">{count.toLocaleString()}</span>
    </motion.button>
  );
}

function ToolCard({
  tool, isConnected, isStale, justConnected, onOpen, onConnect, onDisconnect,
}: {
  tool: Tool;
  isConnected: boolean;
  isStale?: boolean;
  justConnected: boolean;
  onOpen: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}) {

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1, y: 0,
        boxShadow: justConnected
          ? "0 0 0 2px hsl(var(--success)/0.6), 0 0 30px -5px hsl(var(--success)/0.6)"
          : undefined,
      }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      className={`group relative text-left rounded-2xl border p-4 backdrop-blur-sm transition-all overflow-hidden flex flex-col ${
        isConnected
          ? "border-success/40 bg-gradient-to-br from-success/[0.08] to-success/[0.02] hover:border-success/60 hover:shadow-[0_0_24px_-6px_hsl(var(--success)/0.5)]"
          : "border-border/60 bg-gradient-to-br from-card/70 to-card/30 hover:border-primary/50 hover:shadow-[0_0_28px_-6px_hsl(var(--primary)/0.5)]"
      }`}
    >
      {/* Subtle gradient sheen */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)/0.15), transparent 40%, hsl(var(--accent)/0.12))",
        }}
      />

      <div className="relative flex items-start gap-3 mb-2">
        <div className={`h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center overflow-hidden ${
          isConnected ? "border-success/40 bg-success/10" : "border-border/60 bg-muted/40"
        }`}>
          <img src={fallbackLogo(tool)} alt="" className="h-6 w-6 rounded" loading="lazy" decoding="async"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-semibold truncate">{tool.name}</h3>
            {isConnected && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-success/40 text-success">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Live
              </Badge>
            )}
            {isStale && (
              <Badge
                variant="outline"
                className="text-[9px] h-4 px-1.5 border-destructive/50 text-destructive gap-0.5"
                title="Token last verified more than 24 hours ago — reconnect if calls start failing."
              >
                <AlertCircle className="h-2.5 w-2.5" /> Stale
              </Badge>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 truncate">
            {tool.category || "Other"}
          </p>
        </div>
      </div>

      <p className="relative text-xs text-muted-foreground line-clamp-2 flex-1 min-h-[32px]">
        {tool.description || "Composio integration"}
      </p>

      <div className="relative pt-3" onClick={(e) => e.stopPropagation()}>
        {isConnected ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1 border-success/30"
              onClick={onConnect}>
              <Link2 className="h-3 w-3" /> Manage
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive"
              onClick={onDisconnect} aria-label="Disconnect">
              <Unlink className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button size="sm" className="w-full h-8 text-xs gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={onConnect}>
            Connect <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.button>
  );
}
