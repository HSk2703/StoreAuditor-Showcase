import { Link } from "react-router-dom";
import { Lock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { getMinPlanForFeature, FEATURE_LABELS, PLAN_CONFIGS } from "@/lib/plan-config";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  inline?: boolean;
  fallback?: React.ReactNode;
}

const FeatureGate = ({ feature, children, inline = false, fallback }: FeatureGateProps) => {
  const { canAccess, loading } = useSubscription();

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-24 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  // canAccess already returns true for admins via useSubscription
  if (canAccess(feature)) return <>{children}</>;

  const minPlan = getMinPlanForFeature(feature);
  const planName = PLAN_CONFIGS[minPlan].name;
  const featureLabel = FEATURE_LABELS[feature] || feature;

  if (fallback) return <>{fallback}</>;

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>{featureLabel} — <Link to="/pricing" className="text-primary hover:underline">{planName}+ plan</Link></span>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden">
      <div className="pointer-events-none select-none opacity-30 blur-[2px] p-4">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-foreground">{featureLabel}</h3>
        <p className="mb-4 max-w-xs text-sm text-muted-foreground">
          Upgrade to the <span className="font-medium text-foreground">{planName}</span> plan to unlock this feature.
        </p>
        <Button asChild size="sm" className="gap-2">
          <Link to="/pricing">
            Upgrade Now <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default FeatureGate;
