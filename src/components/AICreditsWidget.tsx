import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Zap, Clock, ShoppingCart, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAICredits } from "@/hooks/useAICredits";
import { AI_CREDIT_COSTS, AI_CREDIT_LABELS } from "@/lib/ai-credits-config";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { Link } from "react-router-dom";

interface AICreditsWidgetProps {
  compact?: boolean;
}

const AICreditsWidget = ({ compact = false }: AICreditsWidgetProps) => {
  const {
    isAdmin, creditsUsed, creditsLimit, creditsRemaining,
    topupRemaining, periodEnd, usagePercent, isLow, isExhausted,
    loading, refetch,
  } = useAICredits();
  const [showBuy, setShowBuy] = useState(false);

  if (loading) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur-sm animate-pulse">
        <CardContent className="p-4 h-24" />
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <span className="text-xs font-semibold text-foreground">AI Credits</span>
          </div>
          <span className="text-lg font-bold text-foreground">Unlimited</span>
          <p className="text-[10px] text-muted-foreground mt-1">Admin bypass active</p>
        </CardContent>
      </Card>
    );
  }

  const daysUntilReset = periodEnd
    ? Math.max(0, Math.ceil((new Date(periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const progressColor = isExhausted
    ? "bg-destructive"
    : isLow
    ? "bg-amber-500"
    : "bg-primary";

  return (
    <>
      <Card className={`border-border bg-card/80 backdrop-blur-sm ${isExhausted ? "border-destructive/30" : isLow ? "border-amber-500/30" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isExhausted ? "bg-destructive/15" : "bg-violet-500/15"}`}>
                <Brain className={`h-3.5 w-3.5 ${isExhausted ? "text-destructive" : "text-violet-500"}`} />
              </div>
              <span className="text-xs font-semibold text-foreground">AI Credits</span>
            </div>
            {!compact && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={() => setShowBuy(true)}>
                <ShoppingCart className="h-3 w-3" /> Buy More
              </Button>
            )}
          </div>

          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-bold text-foreground">{creditsUsed}</span>
            <span className="text-xs text-muted-foreground">/ {creditsLimit}</span>
            {topupRemaining > 0 && (
              <span className="text-[10px] text-emerald-500 ml-1">+{topupRemaining} bonus</span>
            )}
          </div>

          <div className="relative mb-2">
            <Progress value={usagePercent} className="h-1.5" />
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all ${progressColor}`}
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            />
          </div>

          {isExhausted ? (
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <p className="text-[10px] font-medium text-destructive">
                You've reached your AI usage limit
              </p>
            </div>
          ) : isLow ? (
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <p className="text-[10px] font-medium text-amber-500">
                You're running low on AI credits
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Resets in {daysUntilReset} days</span>
            </div>
            {(isExhausted || isLow) && (
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-5 text-[9px] px-2" onClick={() => setShowBuy(true)}>
                  Buy Credits
                </Button>
                <Button asChild size="sm" className="h-5 text-[9px] px-2">
                  <Link to="/pricing">Upgrade</Link>
                </Button>
              </div>
            )}
          </div>

          {!compact && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Credit costs per feature:</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {Object.entries(AI_CREDIT_COSTS).slice(0, 6).map(([key, cost]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground truncate">{AI_CREDIT_LABELS[key]}</span>
                    <span className="text-[9px] font-semibold text-foreground ml-1">{cost}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BuyCreditsModal open={showBuy} onClose={() => setShowBuy(false)} onPurchased={refetch} />
    </>
  );
};

export default AICreditsWidget;
