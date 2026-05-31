import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { AI_CREDIT_COSTS } from "@/lib/ai-credits-config";

export interface AIUsageSummary {
  isAdmin: boolean;
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  topupRemaining: number;
  periodEnd: string | null;
  planType: string;
  totalAvailable: number;
  usagePercent: number;
  isLow: boolean;
  isExhausted: boolean;
}

const defaultSummary: AIUsageSummary = {
  isAdmin: false,
  creditsUsed: 0,
  creditsLimit: 10,
  creditsRemaining: 10,
  topupRemaining: 0,
  periodEnd: null,
  planType: "free",
  totalAvailable: 10,
  usagePercent: 0,
  isLow: false,
  isExhausted: false,
};

export function useAICredits() {
  const { user, isAdmin } = useAuth();
  const [summary, setSummary] = useState<AIUsageSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user?.id) {
      setSummary(defaultSummary);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_ai_usage_summary", {
        p_user_id: user.id,
      });

      if (error) throw error;

      const d = data as any;
      if (d.is_admin) {
        setSummary({
          isAdmin: true,
          creditsUsed: 0,
          creditsLimit: -1,
          creditsRemaining: -1,
          topupRemaining: 0,
          periodEnd: d.period_end,
          planType: "admin",
          totalAvailable: -1,
          usagePercent: 0,
          isLow: false,
          isExhausted: false,
        });
      } else {
        const totalAvailable = d.credits_remaining + d.topup_remaining;
        const usagePercent = d.credits_limit > 0
          ? Math.min(100, (d.credits_used / d.credits_limit) * 100)
          : 0;
        setSummary({
          isAdmin: false,
          creditsUsed: d.credits_used,
          creditsLimit: d.credits_limit,
          creditsRemaining: d.credits_remaining,
          topupRemaining: d.topup_remaining,
          periodEnd: d.period_end,
          planType: d.plan_type,
          totalAvailable,
          usagePercent,
          isLow: usagePercent >= 80 && usagePercent < 100,
          isExhausted: d.credits_remaining <= 0 && d.topup_remaining <= 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch AI usage:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const checkAndDeduct = useCallback(
    async (featureName: string): Promise<{ allowed: boolean; reason?: string }> => {
      if (!user?.id) return { allowed: false, reason: "not_authenticated" };
      if (isAdmin) return { allowed: true };

      const cost = AI_CREDIT_COSTS[featureName] || 1;

      try {
        const { data, error } = await supabase.rpc("check_and_deduct_credits", {
          p_user_id: user.id,
          p_feature_name: featureName,
          p_credits_cost: cost,
        });

        if (error) throw error;

        const result = data as any;
        // Refresh summary after deduction
        fetchUsage();

        if (result.allowed) {
          return { allowed: true };
        }
        return { allowed: false, reason: result.reason || "limit_reached" };
      } catch (err) {
        console.error("Credit check failed:", err);
        return { allowed: false, reason: "error" };
      }
    },
    [user?.id, isAdmin, fetchUsage]
  );

  const canAfford = useCallback(
    (featureName: string): boolean => {
      if (summary.isAdmin) return true;
      const cost = AI_CREDIT_COSTS[featureName] || 1;
      return summary.totalAvailable >= cost;
    },
    [summary]
  );

  return {
    ...summary,
    loading,
    checkAndDeduct,
    canAfford,
    refetch: fetchUsage,
  };
}
