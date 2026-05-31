import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  storeUrl: string;
}

const AgencyStoreTrend = ({ storeUrl }: Props) => {
  const [data, setData] = useState<{ label: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: audits } = await supabase
        .from("store_audits")
        .select("overall_score, created_at")
        .eq("store_url", storeUrl)
        .eq("status", "completed")
        .not("overall_score", "is", null)
        .order("created_at", { ascending: true });

      if (audits) {
        setData(
          audits.map((a) => ({
            label: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: a.overall_score!,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [storeUrl]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (data.length < 1) return <p className="text-sm text-muted-foreground py-4 text-center">No audit data yet.</p>;

  return (
    <div className="py-2">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} tickCount={6} />
          <ReferenceLine y={60} stroke="hsl(38 92% 50%)" strokeDasharray="4 4" strokeOpacity={0.3} />
          <ReferenceLine y={80} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" strokeOpacity={0.3} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number) => [`${value}/100`, "Score"]}
          />
          <Line type="monotone" dataKey="score" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(217 91% 60%)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgencyStoreTrend;
