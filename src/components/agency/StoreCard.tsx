import { motion } from "framer-motion";
import { Play, BarChart3, FileText, Trash2, Loader2, ExternalLink, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, ShoppingBag, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  index: number;
  isAuditing: boolean;
  isShopifyConnected?: boolean;
  onRunAudit: () => void;
  onViewTrend: () => void;
  onViewPerformance: () => void;
  onViewReport: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

const getScoreConfig = (score: number | null) => {
  if (score === null) return { color: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", label: "No Data" };
  if (score >= 80) return { color: "text-success", bg: "bg-success/10", ring: "ring-success/30", label: "Healthy" };
  if (score >= 60) return { color: "text-warning", bg: "bg-warning/10", ring: "ring-warning/30", label: "Needs Work" };
  return { color: "text-critical", bg: "bg-critical/10", ring: "ring-critical/30", label: "Critical" };
};

const StoreCard = ({ store, index, isAuditing, isShopifyConnected, onRunAudit, onViewTrend, onViewPerformance, onViewReport, onDelete, onSelect }: Props) => {
  const navigate = useNavigate();
  const config = getScoreConfig(store.last_audit_score);
  const StatusIcon = store.last_audit_score === null ? AlertTriangle : store.last_audit_score >= 80 ? CheckCircle : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={onSelect}
      className="glass-card rounded-xl border p-5 cursor-pointer group hover:border-primary/40 hover:glow-primary transition-all duration-300 relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{store.store_name}</h3>
          <a
            href={store.store_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
          >
            {store.store_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            <ExternalLink className="h-3 w-3" />
          </a>
          {store.client_name && (
            <p className="text-xs text-muted-foreground mt-1">Client: {store.client_name}</p>
          )}
        </div>

        {/* Score Ring */}
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${config.bg} ring-2 ${config.ring}`}>
          <span className={`text-lg font-bold ${config.color}`}>
            {store.last_audit_score ?? "—"}
          </span>
        </div>
      </div>

      {/* Status + Last Audit */}
      <div className="flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 font-medium ${config.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          {isShopifyConnected ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              <Link2 className="h-2.5 w-2.5" />Shopify
            </span>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/auth/shopify"); }}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <ShoppingBag className="h-2.5 w-2.5" />Connect
            </button>
          )}
        </div>
        <span className="text-muted-foreground">
          {store.last_audit_date
            ? new Date(store.last_audit_date).toLocaleDateString()
            : "No audits yet"}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs h-8"
          disabled={isAuditing}
          onClick={onRunAudit}
        >
          {isAuditing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          Run Audit
        </Button>
        {store.last_audit_id && (
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8" onClick={onViewPerformance}>
            <BarChart3 className="h-3 w-3" /> Insights
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onViewTrend}>
          <TrendingUp className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-critical hover:text-critical" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default StoreCard;
