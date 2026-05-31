import { motion } from "framer-motion";
import {
  ArrowUp, ArrowDown, Minus, FileBarChart, AlertTriangle, Lightbulb, MessageSquare,
} from "lucide-react";

interface WeeklyReport {
  id: string;
  managed_store_id: string;
  conversion_score: number | null;
  previous_score: number | null;
  score_change: number | null;
  issues_detected: any[];
  recommendations: any[];
  ai_summary: string | null;
  custom_message: string | null;
  report_period_start: string | null;
  report_period_end: string;
  created_at: string;
}

interface Props {
  report: WeeklyReport;
  storeName: string;
  index: number;
}

const getScoreColor = (score: number | null) => {
  if (score === null) return "text-muted-foreground";
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-critical";
};

const getChangeIcon = (change: number | null) => {
  if (change === null || change === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (change > 0) return <ArrowUp className="h-4 w-4 text-success" />;
  return <ArrowDown className="h-4 w-4 text-critical" />;
};

const WeeklyReportCard = ({ report, storeName, index }: Props) => {
  const periodEnd = new Date(report.report_period_end);
  const periodStart = report.report_period_start ? new Date(report.report_period_start) : null;
  const issues = (report.issues_detected || []) as any[];
  const recommendations = (report.recommendations || []) as any[];
  const highPriorityIssues = issues.filter((i: any) => i?.priority === "high");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Weekly Performance Report
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {periodStart
              ? `${periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Score section */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</p>
            <p className={`text-4xl font-extrabold ${getScoreColor(report.conversion_score)}`}>
              {report.conversion_score ?? "—"}
            </p>
          </div>
          {report.score_change !== null && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Change</p>
              <div className={`flex items-center gap-1 text-lg font-bold ${report.score_change > 0 ? "text-success" : report.score_change < 0 ? "text-critical" : "text-muted-foreground"}`}>
                {getChangeIcon(report.score_change)}
                {report.score_change > 0 ? `+${report.score_change}` : report.score_change}
              </div>
            </div>
          )}
          {report.previous_score !== null && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Previous</p>
              <p className="text-lg font-semibold text-muted-foreground">{report.previous_score}</p>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {report.ai_summary && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-foreground">{report.ai_summary}</p>
          </div>
        )}

        {/* Custom agency message */}
        {report.custom_message && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary flex items-center gap-1 mb-1">
              <MessageSquare className="h-3 w-3" /> From your agency
            </p>
            <p className="text-sm text-foreground">{report.custom_message}</p>
          </div>
        )}

        {/* Issues */}
        {issues.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              Detected Issues ({issues.length})
              {highPriorityIssues.length > 0 && (
                <span className="text-critical">· {highPriorityIssues.length} high priority</span>
              )}
            </h4>
            <div className="space-y-1.5">
              {issues.slice(0, 5).map((issue: any, i: number) => (
                <div
                  key={i}
                  className={`rounded-lg border p-2.5 text-sm ${
                    issue?.priority === "high"
                      ? "border-critical/20 bg-critical/5"
                      : issue?.priority === "medium"
                      ? "border-warning/20 bg-warning/5"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="font-medium text-foreground">{issue?.title || "Issue"}</p>
                  {issue?.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{issue.description}</p>
                  )}
                </div>
              ))}
              {issues.length > 5 && (
                <p className="text-xs text-muted-foreground">+{issues.length - 5} more issues</p>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              Recommendations
            </h4>
            <div className="space-y-1.5">
              {recommendations.slice(0, 3).map((rec: any, i: number) => (
                <div key={i} className="rounded-lg border border-border bg-card p-2.5 text-sm">
                  <p className="font-medium text-foreground">{rec?.title || rec?.text || "Recommendation"}</p>
                  {rec?.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WeeklyReportCard;
