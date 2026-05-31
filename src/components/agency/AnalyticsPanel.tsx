import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Smartphone, Eye, DollarSign, AlertTriangle, TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const AgencyStoreTrend = lazy(() => import("@/components/AgencyStoreTrend"));

interface ManagedStore {
  id: string;
  store_name: string;
  store_url: string;
  client_name: string | null;
  last_audit_id: string | null;
  last_audit_score: number | null;
  last_audit_date: string | null;
}

interface Props {
  store: ManagedStore;
  onBack: () => void;
}

const scoreBreakdown = [
  { label: "UX Score", icon: Eye, value: 78, color: "text-primary" },
  { label: "Conversion", icon: Zap, value: 65, color: "text-warning" },
  { label: "Speed", icon: TrendingUp, value: 82, color: "text-success" },
  { label: "Trust", icon: Shield, value: 71, color: "text-primary" },
];

const AnalyticsPanel = ({ store, onBack }: Props) => {
  const score = store.last_audit_score;

  return (
    <div className="space-y-6">
      {/* Back + Store Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-foreground">{store.store_name}</h2>
          <p className="text-xs text-muted-foreground">{store.store_url.replace(/^https?:\/\//, "")}</p>
        </div>
      </motion.div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {scoreBreakdown.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl border p-4 text-center"
          >
            <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Insights */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-warning to-warning/70">
            <DollarSign className="h-5 w-5 text-warning-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Revenue Insights</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-critical/5">
            <p className="text-xl font-bold text-critical">$2,400</p>
            <p className="text-[10px] text-muted-foreground mt-1">Est Revenue Loss/mo</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/5">
            <p className="text-xl font-bold text-success">$3,800</p>
            <p className="text-[10px] text-muted-foreground mt-1">Potential Gain</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning/5">
            <p className="text-xl font-bold text-warning">5</p>
            <p className="text-[10px] text-muted-foreground mt-1">Conversion Blockers</p>
          </div>
        </div>
      </motion.div>

      {/* Trend Graph */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl border p-5">
        <h3 className="font-semibold text-foreground mb-3">Performance Trend</h3>
        <Suspense fallback={<Skeleton className="h-[200px] w-full rounded-lg" />}>
          <AgencyStoreTrend storeUrl={store.store_url} />
        </Suspense>
      </motion.div>
    </div>
  );
};

export default AnalyticsPanel;
