import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export interface CountryRow {
  country: string;
  user_count: number;
  agency_count: number;
  total_count: number;
}

interface Props {
  countries: CountryRow[];
  totalPlatform: number;
  limit?: number;
}

export default function TopCountries({ countries, totalPlatform, limit = 10 }: Props) {
  const top = countries.slice(0, limit);
  const max = top[0]?.total_count ?? 1;

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Top Countries</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Ranked by combined users + agencies</p>
        </div>
        <TrendingUp className="h-4 w-4 text-primary" />
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No country data available yet.</p>
      ) : (
        <ul className="space-y-3">
          {top.map((c, i) => {
            const widthPct = (c.total_count / max) * 100;
            const sharePct = totalPlatform > 0 ? (c.total_count / totalPlatform) * 100 : 0;
            return (
              <li key={c.country} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground tabular-nums w-5">{i + 1}.</span>
                    <span className="font-medium text-foreground truncate">{c.country}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground tabular-nums shrink-0">
                    <span>{c.total_count.toLocaleString()}</span>
                    <span className="text-primary/80 w-12 text-right">{sharePct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.35)" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
