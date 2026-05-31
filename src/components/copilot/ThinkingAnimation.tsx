import { motion } from "framer-motion";

export default function ThinkingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-2.5 items-start"
    >
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
        <motion.div
          className="h-3 w-3 rounded-full bg-gradient-to-br from-violet-400 to-purple-500"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-muted/40 backdrop-blur-sm border border-border/30 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-violet-400"
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Analyzing your data...</span>
      </div>
    </motion.div>
  );
}
