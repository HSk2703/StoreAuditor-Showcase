import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Trophy, Shield, Loader2 } from "lucide-react";
import { getLevelForScore } from "@/lib/gamification-config";
import { useLeaderboard } from "@/hooks/useLeaderboard";

interface LeaderboardTabProps {
  isAdmin?: boolean;
}

const LeaderboardTab = ({ isAdmin }: LeaderboardTabProps) => {
  const { entries, loading } = useLeaderboard();

  const trendIcon = (t: "up" | "down" | "stable") => {
    if (t === "up") return <TrendingUp className="h-3.5 w-3.5 text-success" />;
    if (t === "down") return <TrendingDown className="h-3.5 w-3.5 text-critical" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-foreground">Leaderboard</h3>
        </div>
      </div>

      <div className="divide-y divide-border">
        {loading && (
          <div className="p-8 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}
        {!loading && entries.map((entry, i) => {
          const level = getLevelForScore(entry.score);
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors"
            >
              <span className={`text-sm font-extrabold w-6 text-center ${
                entry.rank === 1 ? "text-amber-400" : entry.rank === 2 ? "text-slate-400" : entry.rank === 3 ? "text-amber-600" : "text-muted-foreground"
              }`}>
                {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{entry.storeName}</span>
                  {isAdmin && <Shield className="h-3 w-3 text-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground">{level.icon} {level.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {trendIcon(entry.trend)}
                <span className="text-sm font-bold text-foreground">{entry.score}</span>
              </div>
            </motion.div>
          );
        })}
        {!loading && entries.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No entries yet — complete missions to appear on the leaderboard
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTab;
