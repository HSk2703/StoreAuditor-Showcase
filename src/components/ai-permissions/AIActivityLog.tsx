import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Undo2, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_NAME } from "@/lib/kairo-identity";
import type { AIActivityEntry } from "@/lib/ai-permissions";

const RESULT_CONFIG = {
  success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Success" },
  failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
  rolled_back: { icon: Undo2, color: "text-amber-400", bg: "bg-amber-500/10", label: "Rolled Back" },
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/30", label: "Pending" },
};

// Demo log entries
const DEMO_LOG: AIActivityEntry[] = [
  { id: "1", timestamp: new Date(Date.now() - 3600000).toISOString(), actionType: "content_update", title: "Updated Hero CTA text", result: "success", detail: "Changed 'Browse' → 'Shop Now — Free Shipping'", undoAvailable: true },
  { id: "2", timestamp: new Date(Date.now() - 7200000).toISOString(), actionType: "layout_change", title: "Added trust badges above fold", result: "success", detail: "Inserted payment + SSL badges in hero section", undoAvailable: true },
  { id: "3", timestamp: new Date(Date.now() - 86400000).toISOString(), actionType: "content_update", title: "Rewrote product descriptions (3 items)", result: "success", detail: "AI-optimized copy for top 3 products", undoAvailable: false },
  { id: "4", timestamp: new Date(Date.now() - 172800000).toISOString(), actionType: "campaign_create", title: "Created holiday promo campaign", result: "failed", detail: "Meta Ads connection required", undoAvailable: false },
];

export default function AIActivityLog() {
  const [filter, setFilter] = useState<string>("all");
  const entries = filter === "all" ? DEMO_LOG : DEMO_LOG.filter((e) => e.actionType === filter);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> {AI_NAME} Activity Log
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="content_update">Content</SelectItem>
              <SelectItem value="layout_change">Layout</SelectItem>
              <SelectItem value="campaign_create">Campaigns</SelectItem>
              <SelectItem value="settings_update">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No activity recorded yet</p>
        )}
        <AnimatePresence>
          {entries.map((entry, i) => {
            const cfg = RESULT_CONFIG[entry.result];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/20"
              >
                <div className={`h-7 w-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${cfg.color} border-current/30`}>{cfg.label}</Badge>
                  </div>
                  {entry.detail && <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{formatTime(entry.timestamp)}</p>
                </div>
                {entry.undoAvailable && entry.result === "success" && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground shrink-0">
                    <Undo2 className="h-3 w-3" /> Undo
                  </Button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
