import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";

export interface GrowthData {
  overall: number;
  subScores: {
    conversion: number;
    ux: number;
    traffic: number;
    marketing: number;
  };
  xp: number;
  streak: number;
  missionsCompleted: number;
  achievementsUnlocked: string[];
}

const EMPTY_DATA: GrowthData = {
  overall: 0,
  subScores: { conversion: 0, ux: 0, traffic: 0, marketing: 0 },
  xp: 0,
  streak: 0,
  missionsCompleted: 0,
  achievementsUnlocked: [],
};

export function useGrowthScore() {
  const { user } = useAuth();
  const [data, setData] = useState<GrowthData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data: row, error } = await supabase
        .from("growth_scores")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle() as any;

      if (error) throw error;

      if (row) {
        setData({
          overall: row.overall ?? 0,
          subScores: {
            conversion: row.conversion ?? 0,
            ux: row.ux ?? 0,
            traffic: row.traffic ?? 0,
            marketing: row.marketing ?? 0,
          },
          xp: row.xp ?? 0,
          streak: row.streak ?? 0,
          missionsCompleted: row.missions_completed ?? 0,
          achievementsUnlocked: row.achievements_unlocked ?? [],
        });
      } else {
        // Initialize row for new user
        await supabase.from("growth_scores").insert({ user_id: user.id } as any);
        setData(EMPTY_DATA);
      }
    } catch (e) {
      console.error("Failed to fetch growth scores:", e);
      setData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
