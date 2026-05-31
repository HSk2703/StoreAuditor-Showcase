import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  storeUrl: string;
  currentAuditId: string;
}

interface AuditPoint {
  id: string;
  date: string;
  score: number;
  label: string;
}

const ScoreTrend = ({ storeUrl, currentAuditId }: Props) => {
  const [history, setHistory] = useState<AuditPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("store_audits")
        .select("id, created_at, overall_score")
        .eq("store_url", storeUrl)
        .eq("status", "completed")
        .not("overall_score", "is", null)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setHistory(
          data.map((d) => ({
            id: d.id,
            date: d.created_at,
            score: d.overall_score!,
            label: new Date(d.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [storeUrl]);

  if (loading || history.length < 2) return null;

  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const diff = current.score - previous.score;
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor = diff > 0 ? "text-success" : diff < 0 ? "text-critical" : "text-muted-foreground";
  const trendBg = diff > 0 ? "bg-success/10 border-success/20" : diff < 0 ? "bg-critical/10 border-critical/20" : "bg-muted border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-10"
    >
      <h2 className="mb-2 text-lg font-semibold text-foreground flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        Score History
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        Track how your store's conversion score changes over time.
      </p>

      {/* Trend summary */}
      <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 ${trendBg}`}>
        <TrendIcon className={`h-6 w-6 ${trendColor}`} />
        <div>
          <p className="text-sm font-medium text-foreground">
            {diff > 0 && `Score improved by ${diff} points since your last audit.`}
            {diff < 0 && `Score decreased by ${Math.abs(diff)} points since your last audit.`}
            {diff === 0 && "Score unchanged since your last audit."}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {history.length} audit{history.length !== 1 ? "s" : ""} recorded for this store
          </p>
        </div>
        <span className={`ml-auto text-2xl font-extrabold ${trendColor}`}>
          {diff > 0 ? "+" : ""}{diff}
        </span>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={history} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
              axisLine={false}
              tickLine={false}
              tickCount={6}
            />
            <ReferenceLine y={50} stroke="hsl(0 84% 60%)" strokeDasharray="4 4" strokeOpacity={0.3} />
            <ReferenceLine y={80} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" strokeOpacity={0.3} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 32% 91%)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}/100`, "Score"]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(217 91% 60%)"
              strokeWidth={2.5}
              dot={(props: any) => {
                const isCurrent = props.payload.id === currentAuditId;
                return (
                  <circle
                    key={props.key}
                    cx={props.cx}
                    cy={props.cy}
                    r={isCurrent ? 6 : 4}
                    fill={isCurrent ? "hsl(217 91% 60%)" : "hsl(0 0% 100%)"}
                    stroke="hsl(217 91% 60%)"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 6, fill: "hsl(217 91% 60%)" }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-critical/30" style={{ borderTop: "2px dashed" }} />
            Below 50 (critical)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-success/30" style={{ borderTop: "2px dashed" }} />
            Above 80 (good)
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreTrend;
