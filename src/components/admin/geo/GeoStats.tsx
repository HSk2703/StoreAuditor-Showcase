import { motion } from "framer-motion";
import { Users, Building2, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Props {
  totalUsers: number;
  totalAgencies: number;
  totalCountries: number;
}

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n.toLocaleString()}</>;
}

const stats = [
  { key: "users", label: "Total Users", icon: Users, accent: "from-primary/30 to-primary/5" },
  { key: "agencies", label: "Total Agencies", icon: Building2, accent: "from-accent/30 to-accent/5" },
  { key: "countries", label: "Countries Reached", icon: Globe2, accent: "from-primary/20 to-accent/10" },
] as const;

export default function GeoStats({ totalUsers, totalAgencies, totalCountries }: Props) {
  const values: Record<string, number> = {
    users: totalUsers,
    agencies: totalAgencies,
    countries: totalCountries,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="relative overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm p-5">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 pointer-events-none`}
                aria-hidden
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground tabular-nums">
                    <CountUp value={values[s.key]} />
                  </p>
                </div>
                <div className="rounded-xl bg-background/60 border border-border/50 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
