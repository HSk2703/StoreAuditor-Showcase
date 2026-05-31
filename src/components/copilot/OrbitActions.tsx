import { motion, AnimatePresence } from "framer-motion";
import { Search, Palette, TrendingUp, Lightbulb, BarChart3, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { playHoverTick } from "./sounds";

interface OrbitAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  color: string;
}

interface OrbitActionsProps {
  visible: boolean;
  onAction: (prompt: string) => void;
}

const defaultActions: OrbitAction[] = [
  { icon: <Search className="h-3.5 w-3.5" />, label: "Audit", prompt: "Run a quick audit summary of my store", color: "from-blue-500 to-cyan-500" },
  { icon: <Palette className="h-3.5 w-3.5" />, label: "UX", prompt: "What UX improvements should I make?", color: "from-violet-500 to-purple-500" },
  { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "Revenue", prompt: "How can I increase my store revenue?", color: "from-emerald-500 to-green-500" },
  { icon: <Lightbulb className="h-3.5 w-3.5" />, label: "Insights", prompt: "What are my top 3 priorities right now?", color: "from-amber-500 to-orange-500" },
  { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "Analytics", prompt: "Break down my latest audit scores", color: "from-pink-500 to-rose-500" },
  { icon: <Zap className="h-3.5 w-3.5" />, label: "Quick Wins", prompt: "Give me 3 quick wins I can implement today", color: "from-cyan-500 to-blue-500" },
];

export default function OrbitActions({ visible, onAction }: OrbitActionsProps) {
  const location = useLocation();

  const actions = useMemo(() => {
    const path = location.pathname;
    if (path.includes("audit")) return defaultActions.filter(a => ["Audit", "Quick Wins", "Insights"].includes(a.label));
    if (path.includes("ux-optimizer")) return defaultActions.filter(a => ["UX", "Quick Wins", "Insights"].includes(a.label));
    if (path.includes("revenue")) return defaultActions.filter(a => ["Revenue", "Analytics", "Insights"].includes(a.label));
    return defaultActions.slice(0, 5);
  }, [location.pathname]);

  // Orbit expanding up-left from bottom-right anchor
  const radius = 56;
  // Spread from ~180° (left) to ~90° (up) — upper-left quadrant relative to orb
  const startAngle = Math.PI; // left
  const endAngle = Math.PI / 2; // up

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 pointer-events-none" style={{ overflow: "visible" }}>
          {actions.map((action, i) => {
            const angle = startAngle - (i / (actions.length - 1 || 1)) * (startAngle - endAngle);
            const x = Math.cos(angle) * radius;
            const y = -Math.sin(angle) * radius; // negative because CSS y is inverted
            return (
              <motion.button
                key={action.label}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{ scale: 1, opacity: 1, x, y }}
                exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 350, damping: 22 }}
                whileHover={{ scale: 1.3 }}
                onHoverStart={() => playHoverTick()}
                onClick={() => onAction(action.prompt)}
                className={`pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br ${action.color} text-white shadow-lg cursor-pointer z-10 group`}
                title={action.label}
              >
                {action.icon}
                {/* Tooltip */}
                <span className="absolute right-full mr-2 whitespace-nowrap text-[10px] font-medium bg-card/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-lg border border-border/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
