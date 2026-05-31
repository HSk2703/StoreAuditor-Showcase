import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Shield, UserCheck, Settings2, ArrowRight, Pencil, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AI_PERMISSIONS, EXECUTION_MODES, isLowRiskAction, loadPermissions } from "@/lib/ai-permissions";
import { useEffect, useState } from "react";

/**
 * Compact, transparent summary of what AI will auto-draft vs what
 * still requires explicit merchant approval, given current settings.
 * Drop into dashboards or the Permissions page.
 */
export default function PermissionsSummaryCard({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState(loadPermissions);

  useEffect(() => {
    const refresh = () => setState(loadPermissions());
    window.addEventListener("storage", refresh);
    // X5: cross-tab sync without a backend round-trip
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("sa_ai_permissions");
        bc.onmessage = refresh;
      }
    } catch {}
    return () => {
      window.removeEventListener("storage", refresh);
      try { bc?.close(); } catch {}
    };
  }, []);

  const mode = state.executionMode;
  const modeMeta = EXECUTION_MODES[mode];

  const enabled = AI_PERMISSIONS.filter((p) => state.permissions[p.key]);
  // What AI may auto-draft (prepare without asking): only in autopilot + low-risk
  const autoDraft = enabled.filter((p) => p.category === "action" && mode === "autopilot" && isLowRiskAction("content_update") && p.riskLevel === "low");
  // What always requires merchant approval
  const approval = enabled.filter((p) => p.category === "action" && !autoDraft.includes(p));
  const readOnly = enabled.filter((p) => p.category === "data");

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 bg-gradient-to-r from-primary/[0.06] via-transparent to-transparent flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">AI Behaviour Summary</p>
            <p className="text-xs text-muted-foreground">Current mode: <span className="text-foreground font-medium">{modeMeta.label}</span></p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0">{modeMeta.badge}</Badge>
      </div>

      <CardContent className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {modeMeta.description}. AI output is suggestion-only unless explicitly approved by you.
        </p>

        <div className={`grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
          <SummaryColumn
            tone="muted"
            icon={Eye}
            title="Read-only AI Access"
            badge={`${readOnly.length} enabled`}
            items={readOnly.map((p) => p.label)}
            empty="No data access granted"
          />
          <SummaryColumn
            tone="warning"
            icon={Pencil}
            title="Auto-drafted by AI"
            badge={`${autoDraft.length} actions`}
            items={autoDraft.map((p) => p.label)}
            empty="None — every action waits for your approval"
            helper="Low-risk only. Logged and reversible."
          />
          <SummaryColumn
            tone="primary"
            icon={UserCheck}
            title="Requires merchant approval"
            badge={`${approval.length} actions`}
            items={approval.map((p) => p.label)}
            empty="No action permissions enabled"
            helper="Human review required before execution"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/30">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> You can change these settings at any time.
          </p>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Link to="/ai-permissions">
              <Settings2 className="h-3.5 w-3.5" /> Manage permissions <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryColumn({
  icon: Icon, title, badge, items, empty, helper, tone,
}: {
  icon: any; title: string; badge: string; items: string[]; empty: string; helper?: string;
  tone: "muted" | "warning" | "primary";
}) {
  const toneClass = tone === "primary"
    ? "border-primary/30 bg-primary/[0.04]"
    : tone === "warning"
      ? "border-amber-500/30 bg-amber-500/[0.04]"
      : "border-border/30 bg-muted/15";
  const iconClass = tone === "primary" ? "text-primary" : tone === "warning" ? "text-amber-500" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-3 ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
          <p className="text-xs font-semibold text-foreground">{title}</p>
        </div>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{badge}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it} className="text-[11px] text-foreground/85 flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span> {it}
            </li>
          ))}
        </ul>
      )}
      {helper && <p className="text-[10px] text-muted-foreground mt-2 italic">{helper}</p>}
    </motion.div>
  );
}
