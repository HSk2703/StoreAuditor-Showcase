import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, AlertTriangle, ChevronDown, ChevronUp, Lock, Undo2, Loader2, RotateCw, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { type KairoAction, IMPACT_LABELS, canExecuteAction, AI_NAME } from "@/lib/kairo-identity";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate from "@/components/ShopifyConnectionGate";
import { invokeEdgeFunction } from "@/lib/edge-function-utils";
import { supabase } from "@/integrations/supabase/client";

interface ActionCardProps {
  action: KairoAction;
  onApprove: (action: KairoAction) => void;
  onDismiss: (action: KairoAction) => void;
  onUndo?: (action: KairoAction) => void;
  userPlan?: string;
}

type ExecState = "idle" | "loading" | "success" | "failed" | "blocked";

interface TimelineEvent {
  ts: number;
  status: ExecState;
  label: string;
}

function mapActionType(type: string): { action_type: string; target_resource_type: string } {
  switch (type) {
    case "content_update":
      return { action_type: "description_optimization", target_resource_type: "product" };
    case "layout_change":
      return { action_type: "layout_optimization", target_resource_type: "store" };
    case "campaign_create":
      return { action_type: "campaign_creation", target_resource_type: "store" };
    case "settings_update":
      return { action_type: "settings_update", target_resource_type: "store" };
    default:
      return { action_type: type, target_resource_type: "store" };
  }
}

const STATE_DOT: Record<ExecState, string> = {
  idle: "bg-muted-foreground/40",
  loading: "bg-primary animate-pulse",
  success: "bg-emerald-400",
  failed: "bg-destructive",
  blocked: "bg-amber-400",
};

export default function ActionCard({ action, onApprove, onDismiss, onUndo, userPlan = "free" }: ActionCardProps) {
  const { isAdmin, user } = useAuth();
  const { stores, hasActiveIntegration, hasConnectedStore, showConnectionModal, setShowConnectionModal } = useStoreConnection();
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [execState, setExecState] = useState<ExecState>(
    action.status === "completed" ? "success" : action.status === "failed" ? "failed" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const impact = IMPACT_LABELS[action.impact];
  const allowed = canExecuteAction(action.type, userPlan, isAdmin);

  const pushEvent = (status: ExecState, label: string) => {
    setTimeline((prev) => [...prev, { ts: Date.now(), status, label }]);
  };

  const logToKairoActions = async (params: {
    status: string;
    output: Record<string, unknown>;
    errorMessage?: string;
  }) => {
    if (!user) return;
    try {
      await supabase.from("kairo_actions").insert({
        user_id: user.id,
        tool: "shopify",
        action_name: action.type,
        status: params.status,
        input_payload: {
          action_id: action.id,
          title: action.title,
          description: action.description,
        } as any,
        output_response: params.output as any,
        error_message: params.errorMessage ?? null,
      });
    } catch (err) {
      console.error("Failed to log kairo_action:", err);
    }
  };

  const handleApprove = async () => {
    setShowConfirm(false);

    // Active integration check (not just credentials present)
    if (!hasActiveIntegration) {
      pushEvent("blocked", hasConnectedStore ? "Blocked — Shopify integration not active" : "Blocked — no store connected");
      setExecState("blocked");
      setShowConnectionModal(true);
      await logToKairoActions({
        status: "blocked",
        output: { reason: hasConnectedStore ? "integration_inactive" : "no_store_connected" },
        errorMessage: hasConnectedStore ? "Shopify integration is disconnected or disabled" : "No store connected",
      });
      return;
    }

    const connectedStore = stores.find((s) => s.integrationActive);
    if (!connectedStore) {
      pushEvent("blocked", "Blocked — no active store");
      setExecState("blocked");
      setShowConnectionModal(true);
      return;
    }

    setExecState("loading");
    setErrorMsg(null);
    pushEvent("loading", "Sending request to backend");

    try {
      const mapped = mapActionType(action.type);
      const result = await invokeEdgeFunction({
        functionName: "execute-kairo-action",
        body: {
          store_id: connectedStore.id,
          action_type: mapped.action_type,
          target_resource_type: mapped.target_resource_type,
          target_resource_id: (action as any).target_resource_id,
          task_context: action.description,
        },
        maxRetries: 1,
        timeoutMs: 30000,
      });

      if (result?.status === "completed" || result?.applied === true) {
        setExecState("success");
        pushEvent("success", "Applied successfully");
        onApprove(action);
        toast({
          title: `✅ ${action.title}`,
          description: result?.ai_result?.expected_impact || `${AI_NAME} executed this action successfully`,
        });
        await logToKairoActions({ status: "completed", output: result });
      } else {
        const msg = result?.error_message || result?.error || "Backend did not confirm execution";
        setErrorMsg(msg);
        setExecState("failed");
        pushEvent("failed", msg);
        toast({ title: "Action failed", description: msg, variant: "destructive" });
        await logToKairoActions({ status: "failed", output: result || {}, errorMessage: msg });
      }
    } catch (err: any) {
      const msg = err?.message || "Execution failed. Please try again.";
      setErrorMsg(msg);
      setExecState("failed");
      pushEvent("failed", msg);
      toast({ title: "Action failed", description: msg, variant: "destructive" });
      await logToKairoActions({ status: "failed", output: {}, errorMessage: msg });
    }
  };

  const isLoading = execState === "loading";
  const isSuccess = execState === "success";
  const isFailed = execState === "failed";
  const isBlocked = execState === "blocked";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border backdrop-blur-sm p-3 space-y-2 ${
          isSuccess ? "border-emerald-500/30 bg-emerald-500/5" :
          isFailed ? "border-destructive/30 bg-destructive/5" :
          isBlocked ? "border-amber-500/30 bg-amber-500/5" :
          "border-border/30 bg-muted/30"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${impact.bg} ${impact.color}`}>
                {impact.label}
              </span>
              {action.estimatedUplift && (
                <span className="text-[10px] text-emerald-400 font-medium">+{action.estimatedUplift} uplift</span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">{action.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
            {isFailed && errorMsg && (
              <p className="text-[11px] text-destructive mt-1.5">{errorMsg}</p>
            )}
            {isBlocked && (
              <p className="text-[11px] text-amber-400 mt-1.5 inline-flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Connect & activate Shopify to apply
              </p>
            )}
          </div>

          {isSuccess && <Check className="h-5 w-5 text-emerald-400 shrink-0" />}
          {isFailed && <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />}
          {isBlocked && <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />}
          {isLoading && <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />}
        </div>

        {action.preview && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            {showPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showPreview ? "Hide preview" : "Preview changes"}
          </button>
        )}
        <AnimatePresence>
          {showPreview && action.preview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="text-xs bg-background/50 rounded-lg border border-border/20 p-2.5 font-mono text-muted-foreground">
                {action.preview}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline toggle */}
        {timeline.length > 0 && (
          <>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-3 w-3" />
              {showTimeline ? "Hide timeline" : `Timeline (${timeline.length})`}
            </button>
            <AnimatePresence>
              {showTimeline && (
                <motion.ol
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-1.5 pl-1 border-l border-border/40 ml-1"
                >
                  {timeline.map((ev, i) => (
                    <li key={i} className="relative pl-3 text-[11px]">
                      <span className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ${STATE_DOT[ev.status]}`} />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-foreground/85">{ev.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {new Date(ev.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                    </li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Actions */}
        {(action.status === "suggested" || isBlocked) && !isLoading && !isSuccess && !isFailed && (
          <div className="flex items-center gap-2 pt-1">
            {allowed ? (
              <Button
                size="sm"
                className="h-7 text-xs rounded-lg gap-1.5"
                onClick={() => {
                  if (!hasActiveIntegration) {
                    pushEvent("blocked", hasConnectedStore ? "Blocked — Shopify integration not active" : "Blocked — no store connected");
                    setExecState("blocked");
                    setShowConnectionModal(true);
                    return;
                  }
                  setShowConfirm(true);
                }}
              >
                <Zap className="h-3 w-3" /> Apply
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-lg gap-1.5 opacity-70"
                onClick={() => toast({ title: "Upgrade Required", description: `Upgrade to apply changes automatically`, variant: "destructive" })}
              >
                <Lock className="h-3 w-3" /> Upgrade to Apply
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs rounded-lg text-muted-foreground"
              onClick={() => onDismiss(action)}
            >
              <X className="h-3 w-3" /> Dismiss
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Applying to your store…
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs rounded-lg gap-1.5"
              onClick={() => { setExecState("idle"); setErrorMsg(null); setShowConfirm(true); }}
            >
              <RotateCw className="h-3 w-3" /> Retry
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs rounded-lg text-muted-foreground"
              onClick={() => onDismiss(action)}
            >
              <X className="h-3 w-3" /> Dismiss
            </Button>
          </div>
        )}

        {isSuccess && onUndo && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs rounded-lg text-muted-foreground gap-1"
            onClick={() => { onUndo(action); setExecState("idle"); pushEvent("idle", "Rolled back"); }}
          >
            <Undo2 className="h-3 w-3" /> Undo
          </Button>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {AI_NAME} will apply this change to your connected store. This action can be undone
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 my-2">
            <p className="text-sm font-medium">{action.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            {action.preview && (
              <pre className="text-xs font-mono mt-2 text-muted-foreground bg-background/50 rounded p-2 whitespace-pre-wrap">
                {action.preview}
              </pre>
            )}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleApprove} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Confirm & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />
    </>
  );
}
