import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Receipt, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { formatCentsToUSD } from "@/lib/ai-credits-config";
import BuyCreditsModal from "@/components/BuyCreditsModal";

interface Purchase {
  id: string;
  credits_amount: number;
  credits_remaining: number;
  price_cents: number;
  status: string;
  created_at: string;
  expires_at: string;
}

const TopUpHistory = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("ai_credit_purchases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setPurchases((data || []) as Purchase[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Top-Ups & Purchase History
          </CardTitle>
          <Button size="sm" onClick={() => setShowBuy(true)} className="gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" /> Buy Credits
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No top-ups yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Buy a credit pack to keep AI features running once your plan limit hits.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {purchases.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {p.credits_amount} credits · {formatCentsToUSD(p.price_cents)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()} · {p.credits_remaining} remaining · expires {new Date(p.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={p.status === "active" ? "default" : "outline"} className="capitalize text-[10px]">
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <BuyCreditsModal open={showBuy} onClose={() => setShowBuy(false)} onPurchased={load} />
    </Card>
  );
};

export default TopUpHistory;
