import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakWidgetProps {
  streak: number;
}

const StreakWidget = ({ streak }: StreakWidgetProps) => {
  const isActive = streak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur-sm"
    >
      <motion.div
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Flame className={`h-4 w-4 ${isActive ? "text-orange-500" : "text-muted-foreground"}`} />
      </motion.div>
      <span className="text-sm font-bold text-foreground">{streak}</span>
      <span className="text-xs text-muted-foreground">day streak</span>
    </motion.div>
  );
};

export default StreakWidget;
