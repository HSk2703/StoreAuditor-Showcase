import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ArrowDown, ArrowUp, Minus, Plus, X, Eye,
  Shield, ShoppingCart, Smartphone, Search, FileText, Clock,
  ChevronDown, ChevronUp, Loader2, GitCompareArrows,
} from "lucide-react";

interface Snapshot {
  id: string;
  store_url: string;
  audit_id: string;
  snapshot_data: any;
  changes_detected: any[] | null;
  ai_analysis: string | null;
  created_at: string;
}

interface Props {
  storeUrl: string;
  storeName: string;
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "text-critical", bg: "bg-critical/10", border: "border-critical/20", label: "Critical" },
  high: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", label: "High" },
  medium: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Medium" },
  low: { color: "text-muted-foreground", bg: "bg-muted", border: "border-border", label: "Low" },
  info: { color: "text-success", bg: "bg-success/10", border: "border-success/20", label: "Improvement" },
};

const getChangeIcon = (type: string) => {
  switch (type) {
    case "removed": return <X className="h-3.5 w-3.5" />;
    case "added": return <Plus className="h-3.5 w-3.5" />;
    case "decreased": return <ArrowDown className="h-3.5 w-3.5" />;
    case "increased": return <ArrowUp className="h-3.5 w-3.5" />;
    case "changed": return <GitCompareArrows className="h-3.5 w-3.5" />;
    default: return <Minus className="h-3.5 w-3.5" />;
  }
};

const getPageIcon = (page: string) => {
  return page === "productPage" ? <ShoppingCart className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />;
};

const StoreChangeTimeline = ({ storeUrl, storeName }: Props) => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("store_snapshots")
        .select("*")
        .eq("store_url", storeUrl)
        .order("created_at", { ascending: false })
        .limit(20);
      setSnapshots((data as Snapshot[]) || []);
      setLoading(false);
    };
    load();
  }, [storeUrl]);

  const snapshotsWithChanges = snapshots.filter(
    (s) => s.changes_detected && s.changes_detected.length > 0
  );
  const displaySnapshots = showAll ? snapshotsWithChanges : snapshotsWithChanges.slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (snapshotsWithChanges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-primary" />
            Store Change History
          </CardTitle>
          <CardDescription>Structural changes detected between audits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No changes detected yet. Changes will appear after multiple audits.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          Store Change History
        </CardTitle>
        <CardDescription>
          {snapshotsWithChanges.length} audit{snapshotsWithChanges.length !== 1 ? "s" : ""} with detected changes for {storeName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {displaySnapshots.map((snap, idx) => {
                const changes = snap.changes_detected || [];
                const criticalCount = changes.filter((c: any) => c.severity === "critical").length;
                const highCount = changes.filter((c: any) => c.severity === "high").length;
                const isExpanded = expandedId === snap.id;
                let aiData: any = null;
                try { aiData = snap.ai_analysis ? JSON.parse(snap.ai_analysis) : null; } catch {}

                return (
                  <motion.div
                    key={snap.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative pl-10"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${
                      criticalCount > 0 ? "bg-critical border-critical" :
                      highCount > 0 ? "bg-warning border-warning" :
                      "bg-primary border-primary"
                    }`} />

                    <div
                      className={`rounded-lg border p-4 cursor-pointer transition-colors hover:bg-muted/30 ${
                        criticalCount > 0 ? "border-critical/20" :
                        highCount > 0 ? "border-warning/20" :
                        "border-border"
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : snap.id)}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(snap.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {changes.length} change{changes.length !== 1 ? "s" : ""} detected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {criticalCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-critical/10 px-2 py-0.5 text-[10px] font-bold text-critical">
                              {criticalCount} critical
                            </span>
                          )}
                          {highCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">
                              {highCount} high
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>

                      {/* Summary of top changes */}
                      {!isExpanded && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {changes.slice(0, 3).map((c: any, i: number) => {
                            const sev = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.medium;
                            return (
                              <span key={i} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${sev.bg} ${sev.color} border ${sev.border}`}>
                                {getChangeIcon(c.type)}
                                {c.label} {c.type}
                              </span>
                            );
                          })}
                          {changes.length > 3 && (
                            <span className="text-[10px] text-muted-foreground px-1">+{changes.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {/* Expanded details */}
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
                          {changes.map((c: any, i: number) => {
                            const sev = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.medium;
                            return (
                              <div key={i} className={`rounded-md border p-3 ${sev.bg} ${sev.border}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`${sev.color}`}>{getChangeIcon(c.type)}</span>
                                  <span className="text-sm font-medium text-foreground">{c.label}</span>
                                  {getPageIcon(c.page)}
                                  <span className="text-[10px] text-muted-foreground">{c.page === "productPage" ? "Product Page" : "Homepage"}</span>
                                  <span className={`ml-auto text-[10px] font-bold uppercase ${sev.color}`}>{sev.label}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                  <div className="rounded bg-background/50 p-2">
                                    <span className="text-muted-foreground">Previous: </span>
                                    <span className="font-medium text-foreground">{String(c.previousValue)}</span>
                                  </div>
                                  <div className="rounded bg-background/50 p-2">
                                    <span className="text-muted-foreground">Current: </span>
                                    <span className="font-medium text-foreground">{String(c.currentValue)}</span>
                                  </div>
                                </div>
                                {/* AI insight for this field */}
                                {aiData?.analyses?.find((a: any) => a.field === c.field) && (
                                  <div className="mt-2 rounded bg-primary/5 border border-primary/10 p-2 text-xs">
                                    <p className="text-foreground font-medium">
                                      {aiData.analyses.find((a: any) => a.field === c.field)?.impact}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5">
                                      → {aiData.analyses.find((a: any) => a.field === c.field)?.action}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* AI Summary */}
                          {aiData?.summary && (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                              <p className="text-xs font-medium text-primary mb-1">AI Impact Assessment</p>
                              <p className="text-sm text-foreground">{aiData.summary}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {snapshotsWithChanges.length > 5 && !showAll && (
            <div className="text-center mt-4">
              <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
                Show all {snapshotsWithChanges.length} entries
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreChangeTimeline;
