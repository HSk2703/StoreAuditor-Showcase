import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { TOPUP_PACKAGES, calculateTopupPrice, formatCentsToUSD, CREDIT_PRICE_CENTS } from "@/lib/ai-credits-config";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}

const BuyCreditsModal = ({ open, onClose, onPurchased }: BuyCreditsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customCredits, setCustomCredits] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const customAmount = parseInt(customCredits) || 0;
  const customPrice = calculateTopupPrice(customAmount);

  const handlePurchase = async () => {
    if (!user?.id) return;

    const payload: { package_index?: number; custom_credits?: number } = {};

    if (isCustom) {
      if (customAmount < 10) {
        toast({ title: "Minimum 10 credits", variant: "destructive" });
        return;
      }
      payload.custom_credits = customAmount;
    } else if (selectedPackage !== null) {
      payload.package_index = selectedPackage;
    } else {
      return;
    }

    setPurchasing(true);
    try {
      const idempotencyKey = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
      const { data, error } = await supabase.functions.invoke("purchase-credits", {
        body: { ...payload, idempotency_key: idempotencyKey },
        headers: { "Idempotency-Key": idempotencyKey },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Purchase failed");

      toast({
        title: "Credits purchased!",
        description: `${data.credits} AI credits have been added to your account.`,
      });
      onPurchased?.();
      onClose();
    } catch (err) {
      toast({
        title: "Purchase failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Buy AI Credits
          </DialogTitle>
          <DialogDescription>
            Credits are added instantly and roll over monthly (1 year expiry).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {TOPUP_PACKAGES.map((pkg, i) => (
            <Card
              key={i}
              className={`cursor-pointer transition-all ${
                !isCustom && selectedPackage === i
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              }`}
              onClick={() => { setSelectedPackage(i); setIsCustom(false); }}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{pkg.label}</p>
                    <p className="text-[10px] text-muted-foreground">${(pkg.priceCents / 100 / pkg.credits).toFixed(2)}/credit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{pkg.priceLabel}</span>
                  {!isCustom && selectedPackage === i && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Custom amount */}
          <Card
            className={`cursor-pointer transition-all ${
              isCustom ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
            }`}
            onClick={() => { setIsCustom(true); setSelectedPackage(null); }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">Custom Amount</p>
              </div>
              {isCustom && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min={10}
                    placeholder="Enter credits (min 10)"
                    value={customCredits}
                    onChange={(e) => setCustomCredits(e.target.value)}
                    className="h-9"
                  />
                  <span className="text-sm font-bold text-foreground whitespace-nowrap min-w-[60px] text-right">
                    {customAmount >= 10 ? formatCentsToUSD(customPrice) : "—"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={handlePurchase}
          disabled={purchasing || (!isCustom && selectedPackage === null) || (isCustom && customAmount < 10)}
          className="w-full mt-4 gap-2"
        >
          {purchasing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Complete Purchase
            </>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Credits expire after 1 year. Unused plan credits reset monthly.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsModal;
