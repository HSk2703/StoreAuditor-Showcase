import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface AuditRadarChartProps {
  scores: {
    homepage: number | null;
    productPages: number | null;
    trust: number | null;
    mobile: number | null;
    seo: number | null;
  };
}

const AuditRadarChart = ({ scores }: AuditRadarChartProps) => {
  const data = [
    { category: "Homepage", score: scores.homepage ?? 0 },
    { category: "Products", score: scores.productPages ?? 0 },
    { category: "Trust", score: scores.trust ?? 0 },
    { category: "Mobile", score: scores.mobile ?? 0 },
    { category: "SEO", score: scores.seo ?? 0 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">Score Radar</h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AuditRadarChart;
