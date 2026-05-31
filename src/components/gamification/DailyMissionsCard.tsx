import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { DAILY_MISSIONS, type DailyMission } from "@/lib/gamification-config";

interface DailyMissionsCardProps {
  completedIds: string[];
}

const DailyMissionsCard = ({ completedIds }: DailyMissionsCardProps) => {
  const totalXp = DAILY_MISSIONS.reduce((sum, m) => sum + (completedIds.includes(m.id) ? m.xp : 0), 0);
  const maxXp = DAILY_MISSIONS.reduce((sum, m) => sum + m.xp, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Daily Missions</h3>
        <span className="text-xs font-semibold text-primary">{totalXp}/{maxXp} XP</span>
      </div>

      <div className="space-y-2">
        {DAILY_MISSIONS.map((mission, i) => {
          const done = completedIds.includes(mission.id);
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                done
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-card hover:bg-accent/50"
              }`}
            >
              <span className="text-base">{mission.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${done ? "text-success line-through" : "text-foreground"}`}>
                  {mission.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{mission.description}</p>
              </div>
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <span className="text-[10px] font-bold text-primary shrink-0">+{mission.xp} XP</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMissionsCard;
