import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Award, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BenchmarkProps {
  currentScore: number;
}

interface BenchmarkData {
  total_audits: number;
  average_score: number;
  median_score: number;
  top_10_score: number;
  score_distribution: { overall_score: number }[];
}

const getPercentile = (score: number, distribution: { overall_score: number }[]) => {
  if (!distribution || distribution.length === 0) return 0;
  const below = distribution.filter((d) => d.overall_score < score).length;
  return Math.round((below / distribution.length) * 100);
};

const getPercentileColor = (pct: number) => {
  if (pct >= 75) return "text-success";
  if (pct >= 50) return "text-warning";
  return "text-critical";
};

const getPercentileBg = (pct: number) => {
  if (pct >= 75) return "bg-success/10 border-success/20";
  if (pct >= 50) return "bg-warning/10 border-warning/20";
  return "bg-critical/10 border-critical/20";
};

const StoreBenchmark = ({ currentScore }: BenchmarkProps) => {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: result, error } = await supabase.rpc("get_benchmark_stats");
      if (!error && result) setData(result as unknown as BenchmarkData);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading || !data || data.total_audits < 2) return null;

  const percentile = getPercentile(currentScore, data.score_distribution);
  const diff = currentScore - data.average_score;
  const diffLabel = diff >= 0 ? `+${diff.toFixed(0)}` : diff.toFixed(0);

  const stats = [
    {
      icon: Users,
      label: "Stores Audited",
      value: data.total_audits.toLocaleString(),
      sub: "completed audits",
    },
    {
      icon: BarChart3,
      label: "Average Score",
      value: data.average_score.toFixed(0),
      sub: "across all stores",
    },
    {
      icon: Award,
      label: "Top 10% Score",
      value: data.top_10_score.toFixed(0),
      sub: "high performers",
    },
    {
      icon: TrendingUp,
      label: "Your Percentile",
      value: `${percentile}th`,
      sub: `${diffLabel} vs average`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10"
    >
      <h2 className="mb-2 text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        Store Benchmarking
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        See how your store compares with other audited Shopify stores.
      </p>

      {/* Headline insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className={`mb-6 rounded-xl border p-5 text-center ${getPercentileBg(percentile)}`}
      >
        <p className="text-base font-medium text-foreground">
          Your store performs better than{" "}
          <span className={`text-2xl font-extrabold ${getPercentileColor(percentile)}`}>
            {percentile}%
          </span>{" "}
          of audited Shopify stores.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="rounded-lg border border-border bg-card p-4 text-center"
          >
            <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs font-medium text-foreground/80 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Mini distribution bar */}
      {data.score_distribution && data.score_distribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-lg border border-border bg-card p-5"
        >
          <p className="text-sm font-medium text-foreground mb-3">Score Distribution</p>
          <div className="flex items-end gap-px h-16">
            {(() => {
              const buckets = Array(10).fill(0);
              data.score_distribution.forEach((d) => {
                const idx = Math.min(Math.floor(d.overall_score / 10), 9);
                buckets[idx]++;
              });
              const max = Math.max(...buckets, 1);
              return buckets.map((count, idx) => {
                const isCurrentBucket = Math.min(Math.floor(currentScore / 10), 9) === idx;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isCurrentBucket ? "bg-primary" : "bg-primary/20"
                      }`}
                      style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? 4 : 1 }}
                    />
                    <span className={`text-[10px] ${isCurrentBucket ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {idx * 10}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">Low</span>
            <span className="text-[10px] text-muted-foreground">High</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StoreBenchmark;
