import { useState, useRef } from "react";
import {
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle2,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  RefreshCw,
  Trash2,
  Calendar,
  User,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

const priorityConfig: Record<string, { icon: any; badge: string; label: string }> = {
  critical: { icon: ShieldAlert, badge: "bg-critical/15 text-critical", label: "Critical" },
  high: { icon: AlertOctagon, badge: "bg-[hsl(25,95%,53%)]/15 text-[hsl(25,95%,53%)]", label: "High" },
  medium: { icon: AlertTriangle, badge: "bg-warning/15 text-warning", label: "Medium" },
  low: { icon: Info, badge: "bg-muted text-muted-foreground", label: "Low" },
};

const columns = [
  { key: "pending", label: "Pending", icon: Clock, headerColor: "text-muted-foreground", borderColor: "border-muted-foreground/20", bgColor: "bg-muted/30" },
  { key: "in_progress", label: "In Progress", icon: PlayCircle, headerColor: "text-primary", borderColor: "border-primary/20", bgColor: "bg-primary/5" },
  { key: "completed", label: "Completed", icon: CheckCircle2, headerColor: "text-success", borderColor: "border-success/20", bgColor: "bg-success/5" },
] as const;

interface KanbanBoardProps {
  tasks: TeamTask[];
  storeMap: Record<string, string>;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  onReaudit: (task: TeamTask) => void;
  reauditingTaskId: string | null;
}

const KanbanBoard = ({ tasks, storeMap, onUpdateStatus, onDelete, onReaudit, reauditingTaskId }: KanbanBoardProps) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    // Add a slight delay to allow the drag image to form
    requestAnimationFrame(() => {
      const el = document.getElementById(`kanban-card-${taskId}`);
      if (el) el.style.opacity = "0.4";
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const el = document.getElementById(`kanban-card-${draggedTaskId}`);
    if (el) el.style.opacity = "1";
    setDraggedTaskId(null);
    setDragOverColumn(null);
    dragCounter.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    dragCounter.current[columnKey] = (dragCounter.current[columnKey] || 0) + 1;
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = (e: React.DragEvent, columnKey: string) => {
    dragCounter.current[columnKey] = (dragCounter.current[columnKey] || 0) - 1;
    if (dragCounter.current[columnKey] <= 0) {
      dragCounter.current[columnKey] = 0;
      if (dragOverColumn === columnKey) setDragOverColumn(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== columnKey) {
        onUpdateStatus(taskId, columnKey);
      }
    }
    setDragOverColumn(null);
    setDraggedTaskId(null);
    dragCounter.current = {};
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        const isOver = dragOverColumn === col.key;
        const ColIcon = col.icon;

        return (
          <div
            key={col.key}
            className={`rounded-xl border-2 transition-all duration-200 ${
              isOver
                ? `${col.borderColor} ring-2 ring-offset-2 ring-offset-surface ${col.borderColor.replace("border-", "ring-")}`
                : "border-border"
            } ${col.bgColor} p-3`}
            onDragEnter={(e) => handleDragEnter(e, col.key)}
            onDragLeave={(e) => handleDragLeave(e, col.key)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className={`flex items-center gap-2 text-sm font-semibold ${col.headerColor}`}>
                <ColIcon className="h-4 w-4" />
                {col.label}
              </div>
              <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${col.bgColor} ${col.headerColor}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[120px]">
              {colTasks.map((task) => {
                const pCfg = priorityConfig[task.priority] || priorityConfig.medium;
                const PIcon = pCfg.icon;
                const isReauditing = reauditingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    id={`kanban-card-${task.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-lg border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                      draggedTaskId === task.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-semibold leading-snug ${
                          task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                        }`}>
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2 pl-6">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pl-6 mb-2">
                      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${pCfg.badge}`}>
                        <PIcon className="h-2.5 w-2.5" />
                        {pCfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground pl-6">
                      <span className="inline-flex items-center gap-0.5">
                        <ClipboardList className="h-2.5 w-2.5" />
                        {storeMap[task.managed_store_id] || "—"}
                      </span>
                      {task.assigned_to && (
                        <span className="inline-flex items-center gap-0.5">
                          <User className="h-2.5 w-2.5" />
                          {task.assigned_to}
                        </span>
                      )}
                      {task.due_date && (
                        <span className={`inline-flex items-center gap-0.5 ${new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-critical font-medium" : ""}`}>
                          <Calendar className="h-2.5 w-2.5" />
                          {format(new Date(task.due_date), "MMM d")}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border/50">
                      {task.status === "completed" && (
                        <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px] px-2" disabled={isReauditing} onClick={() => onReaudit(task)}>
                          {isReauditing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                          Re-Audit
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(task.id)}>
                        <Trash2 className="h-3 w-3 text-critical" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className={`rounded-lg border-2 border-dashed ${col.borderColor} p-4 text-center transition-colors ${
                  isOver ? "bg-card/80" : ""
                }`}>
                  <p className="text-xs text-muted-foreground">
                    {isOver ? "Drop here" : "No tasks"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
