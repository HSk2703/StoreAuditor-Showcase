import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { startAudit, runScraping, runAnalysis } from "@/lib/audit-service";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  ClipboardList, Plus, Loader2, CheckCircle2, Clock, PlayCircle,
  ShieldAlert, AlertOctagon, AlertTriangle, Info, RefreshCw, Trash2,
  Calendar, User, Search, Filter, LayoutList, Columns3, Bot, Zap,
} from "lucide-react";
import { format } from "date-fns";
import KanbanBoard from "@/components/KanbanBoard";
import { useKairoActions } from "@/hooks/useKairoActions";

interface TeamTask {
  id: string;
  user_id: string;
  managed_store_id: string;
  audit_id: string | null;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  source_issue: any;
  created_at: string;
  updated_at: string;
}

interface ManagedStore {
  id: string;
  store_name: string;
  store_url: string;
}

const priorityConfig: Record<string, { icon: any; color: string; badge: string; label: string }> = {
  critical: { icon: ShieldAlert, color: "text-critical", badge: "bg-critical/15 text-critical", label: "Critical" },
  high: { icon: AlertOctagon, color: "text-[hsl(25,95%,53%)]", badge: "bg-[hsl(25,95%,53%)]/15 text-[hsl(25,95%,53%)]", label: "High" },
  medium: { icon: AlertTriangle, color: "text-warning", badge: "bg-warning/15 text-warning", label: "Medium" },
  low: { icon: Info, color: "text-muted-foreground", badge: "bg-muted text-muted-foreground", label: "Low" },
};

const statusConfig: Record<string, { icon: any; color: string; badge: string; label: string }> = {
  pending: { icon: Clock, color: "text-muted-foreground", badge: "bg-muted text-muted-foreground", label: "Pending" },
  in_progress: { icon: PlayCircle, color: "text-primary", badge: "bg-primary/15 text-primary", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-success", badge: "bg-success/15 text-success", label: "Completed" },
};

const TasksPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { executeAction, executing: kairoExecuting } = useKairoActions();
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [stores, setStores] = useState<ManagedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [reauditingTaskId, setReauditingTaskId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", managed_store_id: "", priority: "medium", assigned_to: "", due_date: undefined as Date | undefined,
  });
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    setFetchError(null);
    try {
      const [{ data: taskData, error: taskErr }, { data: storeData, error: storeErr }] = await Promise.all([
        supabase.from("team_tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("managed_stores").select("id, store_name, store_url"),
      ]);
      if (taskErr) throw taskErr;
      if (storeErr) throw storeErr;
      setTasks((taskData as TeamTask[]) || []);
      setStores((storeData as ManagedStore[]) || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load tasks");
      setTasks([]); setStores([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
  }, [user, fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel("team-tasks-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_tasks" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.managed_store_id || !user) return;
    setCreating(true);
    const { error } = await supabase.from("team_tasks").insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      managed_store_id: form.managed_store_id,
      priority: form.priority,
      assigned_to: form.assigned_to.trim() || null,
      due_date: form.due_date?.toISOString() || null,
    });
    if (error) {
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created" });
      setForm({ title: "", description: "", managed_store_id: "", priority: "medium", assigned_to: "", due_date: undefined });
      setShowCreate(false);
      fetchData();
    }
    setCreating(false);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from("team_tasks").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", taskId);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from("team_tasks").delete().eq("id", taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast({ title: "Task deleted" });
  };

  const handleReaudit = async (task: TeamTask) => {
    const store = stores.find((s) => s.id === task.managed_store_id);
    if (!store) return;
    setReauditingTaskId(task.id);
    try {
      const auditId = await startAudit(store.store_url);
      const scraped = await runScraping(auditId, store.store_url);
      await runAnalysis(auditId, scraped);
      await supabase.from("team_tasks").update({ audit_id: auditId, updated_at: new Date().toISOString() }).eq("id", task.id);
      toast({ title: "Re-audit complete" });
      navigate(`/audit/${auditId}`);
    } catch (e: any) {
      toast({ title: "Re-audit failed", description: e.message, variant: "destructive" });
    } finally {
      setReauditingTaskId(null);
    }
  };

  const storeMap = Object.fromEntries(stores.map((s) => [s.id, s.store_name]));

  const filtered = tasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterStore !== "all" && t.managed_store_id !== filterStore) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-critical/30 bg-critical/5 p-12 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-critical mb-3" />
        <p className="text-foreground font-medium mb-1">Failed to load tasks</p>
        <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
        <Button size="sm" onClick={() => { setLoading(true); fetchData(); }}>Retry</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.pending, color: "text-muted-foreground" },
          { label: "In Progress", value: stats.in_progress, color: "text-primary" },
          { label: "Completed", value: stats.completed, color: "text-success" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px]"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.store_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5 ml-auto">
          <button onClick={() => setViewMode("list")} className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <LayoutList className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode("kanban")} className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "kanban" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Columns3 className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Tasks Content */}
      {tasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-border glass-card p-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-foreground font-medium mb-1">No tasks yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create tasks from detected issues or add them manually</p>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> Create Task</Button>
        </motion.div>
      ) : viewMode === "kanban" ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <KanbanBoard tasks={filtered} storeMap={storeMap} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} onReaudit={handleReaudit} reauditingTaskId={reauditingTaskId} />
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border glass-card p-12 text-center">
          <p className="text-muted-foreground">No tasks match your filters</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <AnimatePresence>
            {filtered.map((task) => {
              const pCfg = priorityConfig[task.priority] || priorityConfig.medium;
              const sCfg = statusConfig[task.status] || statusConfig.pending;
              const PIcon = pCfg.icon;
              const SIcon = sCfg.icon;
              const isReauditing = reauditingTaskId === task.id;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="glass-card rounded-xl border p-4 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => {
                        const next = task.status === "pending" ? "in_progress" : task.status === "in_progress" ? "completed" : "pending";
                        updateTaskStatus(task.id, next);
                      }}
                      className={`mt-0.5 shrink-0 rounded-full p-1 transition-colors ${sCfg.badge}`}
                    >
                      <SIcon className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-semibold ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pCfg.badge}`}>
                            <PIcon className="h-2.5 w-2.5" />{pCfg.label}
                          </span>
                          {task.assigned_to === "Kairo" && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">
                              <Bot className="h-2.5 w-2.5" />AI
                            </span>
                          )}
                        </div>
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" />{storeMap[task.managed_store_id] || "—"}</span>
                        {task.assigned_to && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{task.assigned_to}</span>}
                        {task.due_date && (
                          <span className={`inline-flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-critical font-medium" : ""}`}>
                            <Calendar className="h-3 w-3" />{format(new Date(task.due_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {task.assigned_to !== "Kairo" && task.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={async () => {
                            await supabase.from("team_tasks").update({ assigned_to: "Kairo", updated_at: new Date().toISOString() }).eq("id", task.id);
                            setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, assigned_to: "Kairo" } : t));
                            toast({ title: "Assigned to Kairo" });
                          }}
                        >
                          <Bot className="h-3.5 w-3.5" />Kairo
                        </Button>
                      )}
                      {task.assigned_to === "Kairo" && task.status !== "completed" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1.5 text-xs"
                          disabled={kairoExecuting}
                          onClick={() => executeAction({
                            store_id: task.managed_store_id,
                            action_type: "content_update",
                            target_resource_type: "product",
                            task_context: `${task.title}${task.description ? ": " + task.description : ""}`,
                          })}
                        >
                          {kairoExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}Execute
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={isReauditing} onClick={() => handleReaudit(task)}>
                          {isReauditing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Re-Audit
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-critical" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Title *</label>
              <Input placeholder="Fix missing trust badges" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea placeholder="Details..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Store *</label>
                <Select value={form.managed_store_id} onValueChange={(v) => setForm((f) => ({ ...f, managed_store_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                  <SelectContent>{stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.store_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Assigned To</label>
                <Input placeholder="Team member or Kairo" value={form.assigned_to} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.due_date && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />{form.due_date ? format(form.due_date, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={form.due_date} onSelect={(d) => setForm((f) => ({ ...f, due_date: d }))} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !form.title.trim() || !form.managed_store_id}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPanel;
