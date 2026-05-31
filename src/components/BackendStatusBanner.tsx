import { useEffect, useState } from "react";
import { getHealthStatus, onHealthChange } from "@/lib/auth-resilience";
import { AlertTriangle, WifiOff } from "lucide-react";

type HealthStatus = ReturnType<typeof getHealthStatus>;

function label(s: HealthStatus) {
  if (s === "degraded") return "Backend is experiencing delays. Some features may be slow.";
  if (s === "down") return "Backend is currently unreachable. We'll reconnect automatically.";
  return null;
}

export default function BackendStatusBanner() {
  const [status, setStatus] = useState<HealthStatus>(getHealthStatus);

  useEffect(() => onHealthChange(setStatus), []);

  const msg = label(status);
  if (!msg) return null;

  const Icon = status === "down" ? WifiOff : AlertTriangle;

  return (
    <div className="fixed top-0 inset-x-0 z-[9998] flex items-center justify-center gap-2 bg-destructive/90 text-destructive-foreground px-4 py-2 text-sm font-medium backdrop-blur-sm">
      <Icon className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  );
}
