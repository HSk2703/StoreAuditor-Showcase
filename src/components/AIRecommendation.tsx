import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AuditCategory } from "@/lib/types";
import { generateAIRecommendation } from "@/lib/ai-recommendations";
import ReactMarkdown from "react-markdown";

interface AIRecommendationProps {
  categoryKey: string;
  category: AuditCategory;
}

const AIRecommendation = ({ categoryKey, category }: AIRecommendationProps) => {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateAIRecommendation(categoryKey, category);
      setRecommendation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recommendation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        {!recommendation && !isLoading && !error && (
          <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Get AI Recommendations
            </Button>
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-md bg-primary/5 p-4 text-sm text-primary"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI recommendations...
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-md bg-destructive/10 p-4"
          >
            <div className="flex items-center gap-2 text-sm text-destructive mb-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Retry
            </Button>
          </motion.div>
        )}

        {recommendation && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-primary/20 bg-primary/5 p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Recommendation
            </div>
            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
              <ReactMarkdown>{recommendation}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIRecommendation;
