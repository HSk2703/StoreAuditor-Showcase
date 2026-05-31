import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  rank: number;
  storeName: string;
  score: number;
  level: string;
  trend: "up" | "down" | "stable";
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_leaderboard_top20") as any;

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: LeaderboardEntry[] = data.map((row: any) => ({
            rank: Number(row.rank),
            storeName: row.store_name || "Store Owner",
            score: row.score,
            level: "",
            trend: row.streak > 3 ? "up" as const : row.streak === 0 ? "down" as const : "stable" as const,
          }));
          setEntries(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { entries, loading };
}
