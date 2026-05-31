import { motion } from "framer-motion";
import { getLevelForScore, getNextLevel, getLevelProgress, SUB_SCORES } from "@/lib/gamification-config";

interface GrowthScoreRingProps {
  score: number;
  subScores: Record<string, number>;
  size?: number;
  showBreakdown?: boolean;
}

const GrowthScoreRing = ({ score, subScores, size = 180, showBreakdown = true }: GrowthScoreRingProps) => {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const level = getLevelForScore(score);
  const nextLevel = getNextLevel(score);
  const levelProgress = getLevelProgress(score);

  const getColor = (s: number) => {
    if (s >= 75) return "hsl(var(--success))";
    if (s >= 50) return "hsl(var(--warning))";
    return "hsl(var(--critical))";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Ring */}
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full opacity-30 blur-xl"
          style={{ background: `radial-gradient(circle, ${getColor(score)} 0%, transparent 70%)` }}
        />

        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={12}
            opacity={0.4}
          />
          {/* Score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${getColor(score)})` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-extrabold text-foreground leading-none"
            style={{ fontSize: size * 0.22 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {score}
          </motion.span>
          <span className="text-muted-foreground font-medium" style={{ fontSize: size * 0.07 }}>
            AI Growth Score
          </span>
        </div>
      </div>

      {/* Level Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-2"
      >
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${level.gradient} text-white text-xs font-bold shadow-md`}>
          <span>{level.icon}</span>
          <span>{level.name}</span>
        </div>
        {nextLevel && (
          <div className="flex items-center gap-2 w-40">
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${nextLevel.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, delay: 1 }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{nextLevel.icon} {nextLevel.name}</span>
          </div>
        )}
      </motion.div>

      {/* Sub-score breakdown */}
      {showBreakdown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-xs space-y-2"
        >
          {SUB_SCORES.map((sub, i) => {
            const val = subScores[sub.key] ?? 0;
            return (
              <div key={sub.key} className="flex items-center gap-2">
                <span className="text-sm w-5 text-center">{sub.icon}</span>
                <span className="text-xs font-medium text-foreground w-20">{sub.label}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${sub.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8, delay: 1.3 + i * 0.1 }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-7 text-right">{val}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default GrowthScoreRing;
