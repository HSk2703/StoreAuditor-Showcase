import { motion } from "framer-motion";
import { useMemo } from "react";

export type MascotState = "idle" | "listening" | "thinking" | "responding" | "alerting";

interface AIMascotProps {
  state: MascotState;
  size?: "sm" | "md" | "lg";
  unreadCount?: number;
  onClick?: () => void;
}

const stateColors: Record<MascotState, { core: string; glow: string; ring: string }> = {
  idle: { core: "from-blue-500 via-indigo-500 to-violet-500", glow: "shadow-blue-500/40", ring: "border-blue-400/30" },
  listening: { core: "from-cyan-400 via-blue-500 to-indigo-500", glow: "shadow-cyan-400/50", ring: "border-cyan-400/40" },
  thinking: { core: "from-violet-500 via-purple-500 to-fuchsia-500", glow: "shadow-purple-500/50", ring: "border-purple-400/40" },
  responding: { core: "from-emerald-400 via-cyan-500 to-blue-500", glow: "shadow-emerald-400/50", ring: "border-emerald-400/40" },
  alerting: { core: "from-amber-400 via-orange-500 to-red-500", glow: "shadow-orange-500/50", ring: "border-orange-400/50" },
};

const sizeMap = { sm: 40, md: 56, lg: 80 };

export default function AIMascot({ state, size = "md", unreadCount = 0, onClick }: AIMascotProps) {
  const s = sizeMap[size];
  const colors = stateColors[state];

  const pulseVariants = useMemo(() => ({
    idle: { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } },
    listening: { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8], transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const } },
    thinking: { rotate: [0, 360], scale: [1, 1.1, 1], transition: { rotate: { duration: 2, repeat: Infinity, ease: "linear" as const }, scale: { duration: 1, repeat: Infinity, ease: "easeInOut" as const } } },
    responding: { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const } },
    alerting: { scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const } },
  }), []);

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer group"
      style={{ width: s, height: s }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer ring pulse */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 ${colors.ring}`}
        animate={{ scale: [1, 1.4, 1.6], opacity: [0.5, 0.2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className={`absolute inset-0 rounded-full border ${colors.ring}`}
        animate={{ scale: [1, 1.2, 1.35], opacity: [0.4, 0.15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
      />

      {/* Glow layer */}
      <motion.div
        className={`absolute rounded-full bg-gradient-to-br ${colors.core} blur-xl ${colors.glow}`}
        style={{ width: s * 0.9, height: s * 0.9 }}
        animate={pulseVariants[state]}
      />

      {/* Core orb */}
      <motion.div
        className={`relative rounded-full bg-gradient-to-br ${colors.core} shadow-lg ${colors.glow} flex items-center justify-center overflow-hidden`}
        style={{ width: s * 0.7, height: s * 0.7 }}
        animate={pulseVariants[state]}
      >
        {/* Inner shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/30 to-white/0"
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: state === "thinking" ? 1 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Neural pattern */}
        <svg viewBox="0 0 40 40" className="w-1/2 h-1/2 opacity-80" fill="none">
          <circle cx="20" cy="12" r="2" fill="white" opacity="0.9" />
          <circle cx="12" cy="24" r="2" fill="white" opacity="0.7" />
          <circle cx="28" cy="24" r="2" fill="white" opacity="0.7" />
          <circle cx="20" cy="30" r="1.5" fill="white" opacity="0.5" />
          <line x1="20" y1="14" x2="12" y2="22" stroke="white" strokeWidth="0.8" opacity="0.6" />
          <line x1="20" y1="14" x2="28" y2="22" stroke="white" strokeWidth="0.8" opacity="0.6" />
          <line x1="12" y1="26" x2="28" y2="26" stroke="white" strokeWidth="0.8" opacity="0.4" />
          <line x1="20" y1="14" x2="20" y2="28" stroke="white" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </motion.div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center z-20 border-2 border-background"
        >
          {unreadCount}
        </motion.span>
      )}
    </motion.button>
  );
}
