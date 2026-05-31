import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowRight, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AI_NAME } from "@/lib/kairo-identity";

interface PostAuditCoPilotIntroProps {
  show: boolean;
  onDismiss: () => void;
}

const PostAuditCoPilotIntro = ({ show, onDismiss }: PostAuditCoPilotIntroProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-xl border border-primary/20 bg-card p-5 sm:p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <button onClick={onDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10">
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex flex-col sm:flex-row items-start gap-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-[0_0_20px_-4px_hsl(217_91%_60%/0.4)]">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground mb-1">
                {AI_NAME} has analyzed your store
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                "I've found several optimization opportunities. Want me to improve your store for you?"
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => navigate("/auto-pilot")}>
                  Yes, optimize my store <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={onDismiss}>
                  <Lightbulb className="h-3.5 w-3.5" /> Show recommendations
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostAuditCoPilotIntro;
