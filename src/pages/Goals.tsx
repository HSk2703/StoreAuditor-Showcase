import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, TrendingUp, Eye, DollarSign, BarChart3, Plus, Zap, CheckCircle2,
  Clock, ArrowUpRight, Sparkles, ChevronRight, AlertTriangle, Lightbulb, Lock
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { AI_NAME } from "@/lib/kairo-identity";
import ScoreRing from "@/components/ScoreRing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import GoalActivationGate from "@/components/GoalActivationGate";

type GoalType = "revenue" | "conversion" | "traffic" | "roas" | "custom";
type Priority = "low" | "medium" | "high";
type Timeframe = "7" | "30" | "90";
type TaskStatus = "pending" | "approved" | "executing" | "completed";

interface GoalTask {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  status: TaskStatus;
  estimatedUplift: string;
}

interface Goal {
  id: string;
  type: GoalType;
  targetValue: string;
  timeframe: Timeframe;
  priority: Priority;
  progress: number;
  status: "active" | "completed" | "paused";
  createdAt: string;
  strategy: string[];
  tasks: GoalTask[];
  insights: string[];
}

const GOAL_TYPES: { value: GoalType; label: string; icon: typeof TrendingUp; gradient: string }[] = [
  { value: "revenue", label: "Increase Revenue", icon: DollarSign, gradient: "from-emerald-500 to-green-400" },
  { value: "conversion", label: "Increase Conversion Rate", icon: TrendingUp, gradient: "from-blue-500 to-cyan-400" },
  { value: "traffic", label: "Increase Traffic", icon: Eye, gradient: "from-violet-500 to-purple-400" },
  { value: "roas", label: "Improve ROAS", icon: BarChart3, gradient: "from-amber-500 to-orange-400" },
  { value: "custom", label: "Custom Goal", icon: Target, gradient: "from-pink-500 to-rose-400" },
];

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  high: { label: "High", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-muted-foreground", icon: Clock },
  approved: { label: "Approved", color: "text-blue-400", icon: CheckCircle2 },
  executing: { label: "Executing", color: "text-amber-400", icon: Zap },
  completed: { label: "Completed", color: "text-emerald-400", icon: CheckCircle2 },
};

// MOCK_GOALS removed — Goals uses real database data only
const Goals = () => {
  const { isAdmin, user } = useAuth();
  const { plan: currentPlan } = useSubscription();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal, requireConnection } = useStoreConnection();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [showActivationGate, setShowActivationGate] = useState(false);
  const [newGoal, setNewGoal] = useState<{ type: GoalType; target: string; timeframe: Timeframe; priority: Priority }>({
    type: "revenue", target: "", timeframe: "30", priority: "medium",
  });
  const [activeTab, setActiveTab] = useState("active");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const isPaidPlan = isAdmin || ["starter", "growth", "pro", "agency"].includes(currentPlan);
  const canCreateMore = isAdmin || goals.length < (isPaidPlan ? 10 : 2);
  const canCreateGoals = isAdmin || hasConnectedStore;

  // Load goals from database
  const loadGoals = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("goals" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const mapped: Goal[] = ((data as any[]) || []).map((row: any) => ({
        id: row.id,
        type: row.goal_type as GoalType,
        targetValue: row.target_value,
        timeframe: String(row.timeframe) as Timeframe,
        priority: row.priority as Priority,
        progress: row.progress || 0,
        status: row.status as "active" | "completed" | "paused",
        createdAt: row.created_at,
        strategy: row.strategy || [],
        tasks: row.tasks || [],
        insights: row.insights || [],
      }));
      setGoals(mapped);
    } catch (err: any) {
      console.error("Failed to load goals:", err);
    } finally {
      setDbLoading(false);
    }
  }, [user]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const handleCreateGoal = async () => {
    if (!newGoal.target || !user) return;
    const strategy = [
      "Analyzing store data and integrations...",
      "Building personalized strategy...",
    ];
    const insights = [`${AI_NAME} is generating your strategy — check back shortly.`];

    try {
      const { data, error } = await supabase.from("goals" as any).insert({
        user_id: user.id,
        goal_type: newGoal.type,
        target_value: newGoal.target,
        timeframe: parseInt(newGoal.timeframe),
        priority: newGoal.priority,
        strategy,
        tasks: [],
        insights,
      } as any).select().single();

      if (error) throw error;
      const row = data as any;
      const goal: Goal = {
        id: row.id,
        type: row.goal_type,
        targetValue: row.target_value,
        timeframe: String(row.timeframe) as Timeframe,
        priority: row.priority,
        progress: 0,
        status: "active",
        createdAt: row.created_at,
        strategy,
        tasks: [],
        insights,
      };
      setGoals((prev) => [goal, ...prev]);
      setCreateOpen(false);
      setNewGoal({ type: "revenue", target: "", timeframe: "30", priority: "medium" });
      toast({ title: "Goal created!" });
    } catch (err: any) {
      toast({ title: "Failed to create goal", description: err.message, variant: "destructive" });
    }
  };

  const handleTaskAction = async (goalId: string, taskId: string, action: "approve" | "execute") => {
    const updatedGoals = goals.map((g) =>
      g.id === goalId
        ? {
            ...g,
            tasks: g.tasks.map((t) =>
              t.id === taskId
                ? { ...t, status: (action === "approve" ? "approved" : "executing") as TaskStatus }
                : t
            ),
          }
        : g
    );
    setGoals(updatedGoals);

    const goal = updatedGoals.find((g) => g.id === goalId);
    if (goal) {
      await supabase.from("goals" as any).update({ tasks: goal.tasks, updated_at: new Date().toISOString() } as any).eq("id", goalId);
    }
  };

  const goalTypeConfig = (type: GoalType) => GOAL_TYPES.find((g) => g.value === type)!;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* Connection Gate */}
        {!hasConnectedStore && (
          <div className="mb-8">
            <StoreConnectionBanner onConnect={() => setShowConnectionModal(true)} />
          </div>
        )}
        <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />
        <GoalActivationGate open={showActivationGate} onClose={() => setShowActivationGate(false)} />

        {/* Hero */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 text-left">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" /> Goals
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Set targets — {AI_NAME} plans &amp; executes the strategy
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-full gap-2"
                disabled={!canCreateMore}
                onClick={(e) => {
                  if (!canCreateGoals) {
                    e.preventDefault();
                    setShowActivationGate(true);
                  }
                }}
              >
                <Plus className="h-4 w-4" /> New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Create Goal
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Goal Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_TYPES.map((gt) => (
                      <button
                        key={gt.value}
                        onClick={() => setNewGoal((p) => ({ ...p, type: gt.value }))}
                        className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                          newGoal.type === gt.value
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${gt.gradient} flex items-center justify-center`}>
                          <gt.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{gt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="target">Target Value</Label>
                  <Input
                    id="target"
                    placeholder="e.g. +20%, $10,000, 5,000 visitors"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal((p) => ({ ...p, target: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Timeframe</Label>
                    <Select value={newGoal.timeframe} onValueChange={(v) => setNewGoal((p) => ({ ...p, timeframe: v as Timeframe }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newGoal.priority} onValueChange={(v) => setNewGoal((p) => ({ ...p, priority: v as Priority }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleCreateGoal} className="w-full rounded-full gap-2" disabled={!newGoal.target}>
                  <Zap className="h-4 w-4" /> Activate Auto-Pilot
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!canCreateMore && !isPaidPlan && (
          <Card className="mb-6 p-4 border-primary/30 bg-primary/5 flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Free plan limited to 2 goals.{" "}
              <a href="/pricing" className="text-primary font-medium hover:underline">
                Unlock full Auto-Pilot →
              </a>
            </p>
          </Card>
        )}

        {/* Active Goals */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Goals</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {goals.filter((g) => g.status === "active").length === 0 ? (
              <Card className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No active goals yet. Create one to get started.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {goals
                  .filter((g) => g.status === "active")
                  .map((goal) => {
                    const config = goalTypeConfig(goal.type);
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card
                          className="p-0 overflow-hidden cursor-pointer hover:border-primary/40 transition-all"
                          onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left">
                             <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0`}>
                               <config.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                             </div>
                             <div className="flex-1 min-w-0 text-left">
                               <div className="flex items-center gap-2 flex-wrap">
                                 <h3 className="font-semibold text-foreground text-sm sm:text-base">{config.label}</h3>
                                 <Badge variant="outline" className="text-xs font-mono">
                                   {goal.targetValue}
                                 </Badge>
                                 <Badge variant="outline" className={`text-xs ${PRIORITY_CONFIG[goal.priority].color}`}>
                                   {PRIORITY_CONFIG[goal.priority].label}
                                 </Badge>
                               </div>
                               <p className="text-xs text-muted-foreground mt-1">
                                 {goal.timeframe}-day goal · {goal.tasks.filter((t) => t.status === "completed").length}/{goal.tasks.length} tasks done
                               </p>
                             </div>
                             <div className="shrink-0">
                               <ScoreRing score={goal.progress} size={48} strokeWidth={4} />
                             </div>
                             <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform shrink-0 ${selectedGoal?.id === goal.id ? "rotate-90" : ""}`} />
                          </div>

                          {/* Progress bar */}
                          <div className="px-5 pb-4">
                            <Progress value={goal.progress} className="h-1.5" />
                          </div>
                        </Card>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {selectedGoal?.id === goal.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid md:grid-cols-3 gap-4 pt-4">
                                {/* Strategy Roadmap */}
                                <Card className="p-4">
                                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4 text-primary" /> Strategy Roadmap
                                  </h4>
                                  <div className="space-y-3">
                                    {goal.strategy.map((step, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                        <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{step}</p>
                                      </div>
                                    ))}
                                  </div>
                                </Card>

                                {/* Action Pipeline */}
                                <Card className="p-4">
                                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                                    <Zap className="h-4 w-4 text-amber-400" /> Action Pipeline
                                  </h4>
                                  <div className="space-y-2">
                                    {goal.tasks.map((task) => {
                                      const sc = STATUS_CONFIG[task.status];
                                      return (
                                        <div key={task.id} className="rounded-lg border border-border p-3 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">{task.title}</span>
                                            <span className={`text-[10px] font-medium ${sc.color} flex items-center gap-1`}>
                                              <sc.icon className="h-3 w-3" /> {sc.label}
                                            </span>
                                          </div>
                                          <p className="text-xs text-muted-foreground">{task.description}</p>
                                          <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[10px]">
                                              <ArrowUpRight className="h-3 w-3 mr-0.5" /> {task.estimatedUplift}
                                            </Badge>
                                            {task.status === "pending" && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs rounded-full"
                                                onClick={(e) => { e.stopPropagation(); handleTaskAction(goal.id, task.id, "approve"); }}
                                              >
                                                Approve
                                              </Button>
                                            )}
                                            {task.status === "approved" && (
                                              <Button
                                                size="sm"
                                                className="h-7 text-xs rounded-full gap-1"
                                                onClick={(e) => { e.stopPropagation(); handleTaskAction(goal.id, task.id, "execute"); }}
                                              >
                                                <Zap className="h-3 w-3" /> Execute
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </Card>

                                {/* Insights */}
                                <Card className="p-4">
                                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                                    <Lightbulb className="h-4 w-4 text-amber-400" /> Live Insights
                                  </h4>
                                  <div className="space-y-3">
                                    {goal.insights.map((insight, i) => (
                                      <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                                        <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <Card className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Completed goals will appear here.</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Performance Summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-5 text-left">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tasks Completed</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              {goals.reduce((sum, g) => sum + g.tasks.filter((t) => t.status === "completed").length, 0)}
            </p>
            <p className="text-xs text-emerald-500 mt-1">across all goals</p>
          </Card>
          <Card className="p-5 text-left">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Strategies</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              {goals.filter((g) => g.status === "active").length}
            </p>
            <p className="text-xs text-primary mt-1">{AI_NAME} is optimizing</p>
          </Card>
          <Card className="p-5 text-left">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Progress</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              {goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0}%
            </p>
            <p className="text-xs text-amber-500 mt-1">toward targets</p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Goals;
