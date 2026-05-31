import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, Target, Lightbulb, ChevronRight, TrendingUp, Shield, Sparkles, RotateCcw, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useKairoActions } from "@/hooks/useKairoActions";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface GoalData {
  id: string;
  goal_type: string;
  target_value: string;
  progress: number;
  status: string;
}

const goalIcons: Record<string, any> = {
  revenue: TrendingUp,
  conversion: Target,
  ux: Shield,
  traffic: TrendingUp,
};

const statusIcon: Record<string, any> = {
  completed: CheckCircle2,
  failed: XCircle,
  rolled_back: RotateCcw,
  executing: Loader2,
  pending: Clock,
};

const statusColor: Record<string, string> = {
  completed: "text-success",
  failed: "text-critical",
  rolled_back: "text-muted-foreground",
  executing: "text-primary",
  pending: "text-muted-foreground",
};

const AIControlPanel = () => {
  const [autoPilot, setAutoPilot] = useState(false);
  const [autoPilotStoreId, setAutoPilotStoreId] = useState<string | null>(null);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { actions, loading: actionsLoading, executing, rollbackAction } = useKairoActions();

  const recentActions = actions.slice(0, 5);

  // Fetch auto-pilot state from first managed store
  useEffect(() => {
    if (!user) return;
    const fetchAutoPilot = async () => {
      const { data } = await supabase
        .from("managed_stores")
        .select("id, auto_pilot_enabled")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) {
        setAutoPilot(!!data.auto_pilot_enabled);
        setAutoPilotStoreId(data.id);
      }
    };
    fetchAutoPilot();
  }, [user]);

  const handleAutoPilotToggle = async (enabled: boolean) => {
    setAutoPilot(enabled);
    if (autoPilotStoreId) {
      await supabase
        .from("managed_stores")
        .update({ auto_pilot_enabled: enabled } as any)
        .eq("id", autoPilotStoreId);
    }
  };

  // Fetch real goals from DB
  useEffect(() => {
    if (!user) { setGoalsLoading(false); return; }
    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from("goals")
          .select("id, goal_type, target_value, progress, status")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(5);
        if (!error && data) setGoals(data);
      } catch { /* silent */ }
      setGoalsLoading(false);
    };
    fetchGoals();
  }, [user]);

  // Derive recommendations from recent completed actions
  const recommendations = recentActions
    .filter(a => a.status === "completed" && a.ai_reasoning)
    .slice(0, 3)
    .map(a => ({
      title: a.result_summary || `${a.action_type} on ${a.target_resource_type}`,
      impact: a.credits_cost >= 10 ? "High" : "Medium",
      category: a.target_resource_type,
    }));

  const fallbackRecommendations = recommendations.length === 0
    ? [
        { title: "Run a store audit to get AI recommendations", impact: "High", category: "Audit" },
        { title: "Connect Shopify to enable auto-optimization", impact: "High", category: "Setup" },
      ]
    : [];

  const allRecommendations = [...recommendations, ...fallbackRecommendations].slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Auto-Pilot Section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(260_70%_55%)]">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Auto-Pilot</h3>
              <p className="text-xs text-muted-foreground">{autoPilot ? "Active — monitoring & optimizing" : "Paused — toggle to activate"}</p>
            </div>
          </div>
          <Switch checked={autoPilot} onCheckedChange={handleAutoPilotToggle} />
        </div>

        {/* Real Action History */}
        <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent AI Actions</h4>
            <span className="text-[10px] text-muted-foreground">{actions.length} total</span>
          </div>

          {actionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : recentActions.length === 0 ? (
            <div className="text-center py-4">
              <Sparkles className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No AI actions yet. Assign tasks to Kairo to get started.</p>
            </div>
          ) : (
            <AnimatePresence>
              {recentActions.map((action) => {
                const SIcon = statusIcon[action.status] || Clock;
                const sColor = statusColor[action.status] || "text-muted-foreground";
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <SIcon className={`h-3.5 w-3.5 shrink-0 ${sColor} ${action.status === "executing" ? "animate-spin" : ""}`} />
                      <div className="min-w-0">
                        <span className="truncate text-foreground block text-xs">
                          {action.result_summary || `${action.action_type} on ${action.target_resource_type}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {action.executed_at ? format(new Date(action.executed_at), "MMM d, h:mm a") : format(new Date(action.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {action.status === "completed" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />Undo
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Rollback this action?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will revert the Shopify changes made by this optimization back to their original state. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => rollbackAction(action.id)}>
                                Confirm Rollback
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          <Button variant="ghost" size="sm" className="w-full gap-1 text-xs mt-1" onClick={() => navigate("/auto-pilot")}>
            View All Actions <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>

      {/* AI Goals — from DB */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-success to-success/70">
              <Target className="h-5 w-5 text-success-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">AI Goals</h3>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/goals")}>
            Manage
          </Button>
        </div>
        <div className="space-y-3">
          {goalsLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-8 rounded" />)
          ) : goals.length === 0 ? (
            <div className="text-center py-4">
              <Target className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No active goals. Create one to track AI progress.</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => navigate("/goals")}>
                Create Goal
              </Button>
            </div>
          ) : (
            goals.map((g, i) => {
              const GIcon = goalIcons[g.goal_type] || Target;
              return (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground flex items-center gap-2">
                      <GIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {g.goal_type.charAt(0).toUpperCase() + g.goal_type.slice(1)}: {g.target_value}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${g.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* AI Recommendations — derived from actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-warning to-warning/70">
            <Lightbulb className="h-5 w-5 text-warning-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">AI Recommendations</h3>
        </div>
        <div className="space-y-2">
          {allRecommendations.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{r.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{r.category}</span>
                  <span className={`text-[10px] font-medium ${r.impact === "High" ? "text-success" : "text-warning"}`}>
                    {r.impact} Impact
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AIControlPanel;
