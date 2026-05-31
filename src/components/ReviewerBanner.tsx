import { motion } from "framer-motion";
import { Eye, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

export default function ReviewerBanner() {
  const { isReviewer } = useAuth();

  if (!isReviewer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 inset-x-0 z-[9998] flex items-center justify-center gap-2 bg-primary/15 backdrop-blur-xl border-b border-primary/20 px-4 py-2 text-xs font-medium text-primary"
    >
      <Eye className="h-3.5 w-3.5" />
      <span>Canva Review Mode Active</span>
      <span className="opacity-60">—</span>
      <span className="opacity-80 flex items-center gap-1">
        <Palette className="h-3 w-3" />
        Test the integration using &quot;Improve Design&quot;
      </span>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse ml-1" />
    </motion.div>
  );
}
