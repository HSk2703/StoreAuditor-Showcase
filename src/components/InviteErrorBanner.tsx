import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteErrorBannerProps {
  title?: string;
  message: string;
  details?: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

/**
 * Persistent (non-toast) error banner for invite operations.
 * Use alongside toasts so users on slow networks who miss the toast
 * still see the failure context.
 */
const InviteErrorBanner = ({
  title = "Invite failed",
  message,
  details,
  onDismiss,
  onRetry,
}: InviteErrorBannerProps) => {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 flex items-start gap-3"
    >
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="text-xs text-destructive/90 mt-1">{message}</p>
        {details && (
          <p className="text-[11px] text-destructive/70 mt-1 font-mono break-all">{details}</p>
        )}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3 h-7 text-xs border-destructive/30 hover:bg-destructive/10"
          >
            Try again
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default InviteErrorBanner;
