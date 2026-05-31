import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  store: {
    store_name: string;
    store_url: string;
    client_name: string | null;
    last_audit_score: number | null;
  };
  scoreDiff: number | null;
  auditsCount: number;
}

const StoreOverviewCard = ({ store, scoreDiff, auditsCount }: Props) => {
  const score = store.last_audit_score;
  const getHealthConfig = (s: number | null) => {
    if (s === null) return { label: "No Data", color: "text-muted-foreground", bg: "bg-muted", border: "border-border", Icon: AlertTriangle };
    if (s >= 80) return { label: "Excellent", color: "text-success", bg: "bg-success/10", border: "border-success/20", Icon: CheckCircle };
    if (s >= 60) return { label: "Needs Improvement", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", Icon: AlertTriangle };
    return { label: "Critical", color: "text-critical", bg: "bg-critical/10", border: "border-critical/20", Icon: XCircle };
  };

  const health = getHealthConfig(score);
  const TrendIcon = scoreDiff && scoreDiff > 0 ? TrendingUp : scoreDiff && scoreDiff < 0 ? TrendingDown : Minus;
  const trendColor = scoreDiff && scoreDiff > 0 ? "text-success" : scoreDiff && scoreDiff < 0 ? "text-critical" : "text-muted-foreground";

  return (
    <Card className={`border-2 ${health.border}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Score ring */}
          <div className={`flex-shrink-0 w-28 h-28 rounded-full ${health.bg} flex items-center justify-center`}>
            <div className="text-center">
              <div className={`text-4xl font-extrabold ${health.color}`}>{score ?? "—"}</div>
              <div className="text-[10px] text-muted-foreground font-medium">/100</div>
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{store.store_name}</h2>
            {store.client_name && <p className="text-sm text-muted-foreground">Client: {store.client_name}</p>}
            <a href={store.store_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
              {store.store_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className={`flex items-center gap-1.5 text-sm font-medium ${health.color}`}>
                <health.Icon className="h-4 w-4" />
                {health.label}
              </div>
              {scoreDiff !== null && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                  <TrendIcon className="h-4 w-4" />
                  {scoreDiff > 0 ? "+" : ""}{scoreDiff} since last audit
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {auditsCount} audit{auditsCount !== 1 ? "s" : ""} recorded
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreOverviewCard;
