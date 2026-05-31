import { type AuditStatus } from "@/lib/types";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: AuditStatus;
}

const config: Record<AuditStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  good: { label: "Good", icon: CheckCircle, className: "bg-success/10 text-success" },
  "needs-improvement": { label: "Needs Work", icon: AlertTriangle, className: "bg-warning/10 text-warning" },
  critical: { label: "Critical", icon: XCircle, className: "bg-critical/10 text-critical" },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { label, icon: Icon, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

export default StatusBadge;
