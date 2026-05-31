import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight, Lock, TrendingUp, Rocket, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeTriggerProps {
  variant: "post-audit" | "usage-limit" | "ai-teaser" | "campaign-launch" | "analytics-value";
  issueCount?: number;
  hiddenCount?: number;
  limitType?: string;
  className?: string;
}

const triggerConfigs = {
  "post-audit": {
    icon: Sparkles,
    title: (props: UpgradeTriggerProps) => `You've uncovered ${props.issueCount || 12} growth opportunities`,
    description: "Unlock the full optimization suite to fix every issue and maximize your store's conversion rate.",
    cta: "Unlock Full Optimization",
    accent: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/15",
  },
  "usage-limit": {
    icon: Lock,
    title: (props: UpgradeTriggerProps) => `You've reached your ${props.limitType || "audit"} limit`,
    description: "Upgrade your plan to continue growing your store with unlimited access.",
    cta: "Continue Growing Your Store",
    accent: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/15",
  },
  "ai-teaser": {
    icon: Eye,
    title: (props: UpgradeTriggerProps) => `${props.hiddenCount || 3} more high-impact insights hidden`,
    description: "Upgrade to see all AI-powered insights and unlock recommendations that could boost your revenue.",
    cta: "Unlock All Insights",
    accent: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-500/15",
  },
  "campaign-launch": {
    icon: Rocket,
    title: () => "Launch with AI automation",
    description: "Upgrade to Pro to access automated campaign launching, scheduling, and AI-optimized content delivery.",
    cta: "Upgrade to Launch Campaigns",
    accent: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/15",
  },
  "analytics-value": {
    icon: TrendingUp,
    title: () => "See full performance breakdown",
    description: "You're viewing partial analytics. Upgrade to access the complete performance dashboard with actionable metrics.",
    cta: "Unlock Full Analytics",
    accent: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-500/15",
  },
};

const UpgradeTrigger = (props: UpgradeTriggerProps) => {
  const { variant, className = "" } = props;
  const config = triggerConfigs[variant];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border border-primary/15 bg-gradient-to-r ${config.accent} p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className={`h-11 w-11 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">{config.title(props)}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{config.description}</p>
        </div>
        <Button asChild size="sm" className="gap-2 shrink-0 shadow-sm">
          <Link to="/pricing">
            {config.cta} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default UpgradeTrigger;
