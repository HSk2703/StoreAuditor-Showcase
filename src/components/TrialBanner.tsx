import { useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { getUserTrial, isTrialActive, getTrialRemainingHours, type FreeTrial } from "@/lib/free-trial-service";

const TrialBanner = () => {
  const { user } = useAuth();
  const [trial, setTrial] = useState<FreeTrial | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserTrial(user.id).then(setTrial).catch(console.error);
  }, [user]);

  if (!trial || !isTrialActive(trial)) return null;

  const hoursLeft = getTrialRemainingHours(trial);
  const daysLeft = Math.ceil(hoursLeft / 24);

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium text-foreground">
          Free Trial — {trial.plan_name}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left` : `${hoursLeft}h left`}
        </span>
      </div>
      <Button asChild size="sm" variant="default" className="rounded-full text-xs px-4">
        <Link to="/pricing">Upgrade Now</Link>
      </Button>
    </div>
  );
};

export default TrialBanner;
