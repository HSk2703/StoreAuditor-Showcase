import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";

interface HeartbeatBadgeProps {
  status: string;
  lastHeartbeatAt: string | null | undefined;
  /** seconds without heartbeat before we consider the run stalled */
  stallSeconds?: number;
}

/**
 * Visual indicator for long-running AI jobs. Distinguishes
 * "still working" from "stalled" using last_heartbeat_at.
 */
export function HeartbeatBadge({ status, lastHeartbeatAt, stallSeconds = 30 }: HeartbeatBadgeProps) {
  if (status !== "running" && status !== "pending") return null;

  const last = lastHeartbeatAt ? new Date(lastHeartbeatAt).getTime() : 0;
  const ageSec = last ? Math.floor((Date.now() - last) / 1000) : Infinity;
  const stalled = ageSec > stallSeconds;

  if (stalled) {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <AlertTriangle className="h-3 w-3" />
        Stalled
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1.5">
      <Loader2 className="h-3 w-3 animate-spin" />
      Working{Number.isFinite(ageSec) ? ` · ${ageSec}s` : ""}
    </Badge>
  );
}
