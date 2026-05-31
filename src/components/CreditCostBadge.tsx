import { Zap } from "lucide-react";
import { AI_CREDIT_COSTS } from "@/lib/ai-credits-config";
import { useAICredits } from "@/hooks/useAICredits";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CreditCostBadgeProps {
  feature: string;
  className?: string;
}

const CreditCostBadge = ({ feature, className = "" }: CreditCostBadgeProps) => {
  const cost = AI_CREDIT_COSTS[feature] || 1;
  const { canAfford, isAdmin } = useAICredits();

  if (isAdmin) return null;

  const affordable = canAfford(feature);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              affordable
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            } ${className}`}
          >
            <Zap className="h-2.5 w-2.5" />
            {cost} {cost === 1 ? "credit" : "credits"}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {affordable
              ? `This action costs ${cost} AI credit${cost !== 1 ? "s" : ""}`
              : `Not enough credits (need ${cost})`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CreditCostBadge;
