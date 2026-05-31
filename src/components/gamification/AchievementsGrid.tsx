import { motion } from "framer-motion";
import { ACHIEVEMENTS, TIER_COLORS, type Achievement } from "@/lib/gamification-config";
import { Lock } from "lucide-react";

interface AchievementsGridProps {
  unlockedIds: string[];
}

const AchievementsGrid = ({ unlockedIds }: AchievementsGridProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Achievements</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {ACHIEVEMENTS.map((ach, i) => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: unlocked ? 1.08 : 1.02 }}
              className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all cursor-default ${
                unlocked
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card opacity-50"
              }`}
            >
              <div className={`text-2xl ${unlocked ? "" : "grayscale"}`}>{ach.icon}</div>
              <span className="text-[10px] font-bold text-foreground leading-tight">{ach.title}</span>
              <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-gradient-to-r text-white ${TIER_COLORS[ach.tier]}`}>
                {ach.tier}
              </span>
              {!unlocked && (
                <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-muted-foreground" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsGrid;
