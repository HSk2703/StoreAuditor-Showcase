import { motion } from "framer-motion";
import { Store, Zap, DollarSign, Bot } from "lucide-react";

interface Props {
  totalStores: number;
  avgScore: number | null;
  healthyCount: number;
  criticalCount: number;
}

const stats = [
  { key: "stores", label: "Stores Managed", icon: Store, color: "from-primary to-primary/70" },
  { key: "score", label: "Avg Performance", icon: Zap, color: "from-success to-success/70" },
  { key: "healthy", label: "Healthy Stores", icon: DollarSign, color: "from-warning to-warning/70" },
  { key: "automations", label: "AI Automations", icon: Bot, color: "from-primary to-[hsl(260_70%_55%)]" },
];

const GlobalOverview = ({ totalStores, avgScore, healthyCount, criticalCount }: Props) => {
  const values: Record<string, string> = {
    stores: String(totalStores),
    score: avgScore !== null ? `${avgScore}/100` : "—",
    healthy: String(healthyCount),
    automations: criticalCount > 0 ? `${criticalCount} alerts` : "All clear",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="glass-card rounded-xl border p-4 relative overflow-hidden group hover:border-primary/30 transition-colors"
        >
          <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${s.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.color}`}>
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{s.label}</p>
              <p className="text-xl font-bold text-foreground">{values[s.key]}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GlobalOverview;
