import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ChevronRight, Flame } from "lucide-react";
import { getLevelForScore } from "@/lib/gamification-config";
import { useGrowthScore } from "@/hooks/useGrowthScore";

const GrowthScoreWidget = () => {
  const navigate = useNavigate();
  const { data, loading } = useGrowthScore();
  const level = getLevelForScore(data.overall);
  const score = data.overall;

  if (loading) return null;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return "hsl(var(--success))";
    if (s >= 50) return "hsl(var(--warning))";
    return "hsl(var(--critical))";
  };

  return (
    <Card
      className="border-border bg-card/80 backdrop-blur-sm cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={() => navigate("/growth-hub")}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Mini ring */}
          <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
            <svg width={64} height={64} className="-rotate-90">
              <circle cx={32} cy={32} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={5} opacity={0.4} />
              <motion.circle
                cx={32} cy={32} r={radius} fill="none"
                stroke={getColor(score)} strokeWidth={5} strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold text-foreground">{score}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-bold text-foreground">AI Growth Score</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${level.gradient} text-white text-[10px] font-bold`}>
                {level.icon} {level.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>{data.streak} day streak</span>
              <span>·</span>
              <span>{data.xp.toLocaleString()} XP</span>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthScoreWidget;
