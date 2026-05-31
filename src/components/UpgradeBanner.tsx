import { Link } from "react-router-dom";
import { Crown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_CONFIGS } from "@/lib/plan-config";

const UpgradeBanner = () => {
  const { plan, loading, isAuthenticated, isAdmin } = useSubscription();

  if (loading || !isAuthenticated || plan !== "free" || isAdmin) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Crown className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">You're on the Free plan</p>
          <p className="text-xs text-muted-foreground">
            Upgrade to unlock enhanced analytics, AI recommendations, competitor analysis, and more.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="gap-2 shrink-0">
        <Link to="/pricing">
          View Plans <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
};

export default UpgradeBanner;
