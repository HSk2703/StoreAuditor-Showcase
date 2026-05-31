import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Puzzle, ExternalLink, AlertTriangle, Zap, Smartphone, TrendingUp,
  Gauge, Lightbulb, Info,
} from "lucide-react";

interface DetectedApp {
  name: string;
  category: string;
  detectedElements: string[];
  scriptUrls: string[];
  appStoreUrl: string | null;
}

interface AppImpact {
  name: string;
  speedImpact: string;
  uxImpact: string;
  conversionInfluence: string;
  mobileImpact: string;
  insight: string;
}

interface AppAnalysis {
  apps: AppImpact[];
  overallInsight: string;
  recommendation: string | null;
}

interface Props {
  detectedApps: DetectedApp[];
  appAnalysis: AppAnalysis | null;
}

const IMPACT_CONFIG: Record<string, { label: string; className: string }> = {
  positive: { label: "Positive", className: "bg-success/15 text-success border-success/30" },
  neutral: { label: "Neutral", className: "bg-muted text-muted-foreground border-border" },
  moderate: { label: "Moderate", className: "bg-warning/15 text-warning border-warning/30" },
  high: { label: "High Impact", className: "bg-critical/15 text-critical border-critical/30" },
};

function ImpactBadge({ level }: { level: string }) {
  const config = IMPACT_CONFIG[level] || IMPACT_CONFIG.neutral;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  Reviews: "⭐",
  Popups: "💬",
  "Email & Popups": "📧",
  Upsell: "🔄",
  "Countdown Timer": "⏰",
  Personalization: "🎯",
  Analytics: "📊",
  "Live Chat": "💬",
  SEO: "🔍",
  "Page Builder": "🏗️",
  Shipping: "📦",
  "All-in-One": "🧰",
};

export default function ShopifyAppPerformance({ detectedApps, appAnalysis }: Props) {
  if (!detectedApps || detectedApps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-primary" />
            Shopify App Performance
          </CardTitle>
          <CardDescription>No Shopify apps detected on this store</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No third-party Shopify apps were detected during the audit.
          </p>
        </CardContent>
      </Card>
    );
  }

  const appImpactMap = new Map<string, AppImpact>();
  if (appAnalysis?.apps) {
    for (const a of appAnalysis.apps) {
      appImpactMap.set(a.name, a);
    }
  }

  const hasPerformanceConcern = detectedApps.length > 5 ||
    appAnalysis?.apps?.some(a => a.speedImpact === "high" || a.mobileImpact === "high");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          Shopify App Performance
        </CardTitle>
        <CardDescription>
          {detectedApps.length} app{detectedApps.length !== 1 ? "s" : ""} detected — impact analysis on speed, UX, and conversions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Warning banner if too many apps */}
        {hasPerformanceConcern && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4"
          >
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Performance Warning</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This store has {detectedApps.length} active apps that may impact page performance. Consider auditing app usage and removing unused apps.
              </p>
            </div>
          </motion.div>
        )}

        {/* AI Overall Insight */}
        {appAnalysis?.overallInsight && (
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">AI Insight</p>
              <p className="text-xs text-muted-foreground mt-0.5">{appAnalysis.overallInsight}</p>
              {appAnalysis.recommendation && (
                <p className="text-xs text-foreground mt-2 font-medium">
                  💡 {appAnalysis.recommendation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* App Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">App</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1"><Gauge className="h-3.5 w-3.5" /> Speed</span>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1"><Zap className="h-3.5 w-3.5" /> UX</span>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Conversion</span>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1"><Smartphone className="h-3.5 w-3.5" /> Mobile</span>
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {detectedApps.map((app, i) => {
                const impact = appImpactMap.get(app.name);
                return (
                  <motion.tr
                    key={app.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{CATEGORY_ICONS[app.category] || "📦"}</span>
                        <div>
                          <p className="font-medium text-foreground text-xs">{app.name}</p>
                          <p className="text-[10px] text-muted-foreground">{app.detectedElements.length} element{app.detectedElements.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">{app.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ImpactBadge level={impact?.speedImpact || "neutral"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ImpactBadge level={impact?.uxImpact || "neutral"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ImpactBadge level={impact?.conversionInfluence || "neutral"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ImpactBadge level={impact?.mobileImpact || "neutral"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {app.appStoreUrl ? (
                        <a href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            <ExternalLink className="h-3 w-3" /> View
                          </Button>
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Per-app insights */}
        {appAnalysis?.apps && appAnalysis.apps.some(a => a.insight) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> App-Specific Insights
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {appAnalysis.apps.filter(a => a.insight).map((a) => (
                <div key={a.name} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs font-medium text-foreground">{a.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{a.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
