import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUpRight, ShoppingCart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import BuyCreditsModal from "./BuyCreditsModal";
import { useAICredits } from "@/hooks/useAICredits";

interface CreditLimitModalProps {
  open: boolean;
  onClose: () => void;
}

const CreditLimitModal = ({ open, onClose }: CreditLimitModalProps) => {
  const [showBuy, setShowBuy] = useState(false);
  const { creditsUsed, creditsLimit, refetch } = useAICredits();

  if (showBuy) {
    return (
      <BuyCreditsModal
        open={true}
        onClose={() => { setShowBuy(false); onClose(); }}
        onPurchased={refetch}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/15 flex items-center justify-center mb-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle>AI Credit Limit Reached</DialogTitle>
          <DialogDescription>
            You've used all {creditsLimit} AI credits this month.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-3 mt-2">
          <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            You've generated {creditsUsed} AI insights this month
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={() => setShowBuy(true)} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Buy More Credits
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/pricing">
              Upgrade Plan <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditLimitModal;
