import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { TrendingDown, TrendingUp, AlertTriangle, Lightbulb, Zap, User } from "lucide-react";

interface ResponseCardProps {
  content: string;
  role: "user" | "assistant";
  index: number;
  isStreaming?: boolean;
}

function detectMetric(text: string): { value: string; label: string; trend: "up" | "down" } | null {
  const dropMatch = text.match(/(\d+(?:\.\d+)?%)\s*(?:drop|decrease|decline|down)/i);
  if (dropMatch) return { value: dropMatch[1], label: "Change", trend: "down" };
  const upMatch = text.match(/(\d+(?:\.\d+)?%)\s*(?:increase|improve|up|growth|uplift)/i);
  if (upMatch) return { value: upMatch[1], label: "Change", trend: "up" };
  return null;
}

function getResponseIcon(content: string) {
  if (/warning|critical|issue|problem|error/i.test(content)) return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  if (/improve|increase|growth|revenue/i.test(content)) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (/tip|suggest|recommend|try/i.test(content)) return <Lightbulb className="h-4 w-4 text-cyan-400" />;
  return <Zap className="h-4 w-4 text-blue-400" />;
}

export default function ResponseCard({ content, role, index, isStreaming }: ResponseCardProps) {
  const metric = role === "assistant" ? detectMetric(content) : null;

  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end gap-2"
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm bg-primary text-primary-foreground">
          {content}
        </div>
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex gap-2.5"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
          {getResponseIcon(content)}
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {/* Metric card if detected */}
        {metric && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-3 py-2"
          >
            {metric.trend === "down" ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            )}
            <span className={`text-lg font-bold ${metric.trend === "down" ? "text-destructive" : "text-emerald-400"}`}>
              {metric.value}
            </span>
            <span className="text-xs text-muted-foreground">{metric.label}</span>
          </motion.div>
        )}

        {/* Main response */}
        <div className="rounded-2xl rounded-bl-sm bg-muted/40 backdrop-blur-sm border border-border/30 px-4 py-3 text-sm">
          <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-1.5 [&_ul]:mt-1 [&_li]:mt-0 [&_p]:leading-relaxed [&_strong]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {isStreaming && (
            <motion.span
              className="inline-block w-1.5 h-4 bg-primary/60 rounded-full ml-0.5"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
