import { motion } from "framer-motion";
import { Activity, CheckCircle2, XCircle, Clock, Undo2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKairoComposio } from "@/hooks/useKairoComposio";

const statusStyle = {
  success: { Icon: CheckCircle2, cls: "text-emerald-400" },
  failed: { Icon: XCircle, cls: "text-destructive" },
  pending: { Icon: Clock, cls: "text-amber-400" },
  rolled_back: { Icon: Undo2, cls: "text-muted-foreground" },
} as const;

export default function KairoActivityLog() {
  const { actions, loading, rollback } = useKairoComposio();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading Kairo activity…
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl border border-border/40 bg-muted/20">
        <Activity className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">No Kairo actions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Approve a fix from your audit and Kairo will execute it through Composio
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((a) => {
        const style = statusStyle[a.status] ?? statusStyle.pending;
        const Icon = style.Icon;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/40 bg-muted/20 backdrop-blur-sm p-3 flex items-start gap-3"
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.cls}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {a.tool}
                </span>
                <span className="text-sm font-medium truncate">{a.action_name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(a.created_at).toLocaleString()} · {a.status}
              </p>
              {a.error_message && (
                <p className="text-xs text-destructive mt-1 line-clamp-2">{a.error_message}</p>
              )}
            </div>
            {a.status === "success" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1"
                onClick={() => rollback(a.id)}
              >
                <Undo2 className="h-3 w-3" /> Rollback
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
