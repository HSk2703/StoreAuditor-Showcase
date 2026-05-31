import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Users, Plus, X, Loader2, TrendingUp, TrendingDown, Lightbulb, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startAudit, runScraping, runAnalysis, getAudit } from "@/lib/audit-service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CompetitorAnalysisProps {
  audit: any; // The user's completed audit
}

interface CompetitorResult {
  store_url: string;
  overall_score: number;
  homepage_score: number;
  product_page_score: number;
  trust_score: number;
  mobile_score: number;
  seo_score: number;
  audit_id: string;
}

interface AIInsights {
  insights: string[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

const SCORE_CATEGORIES = [
  { key: "overall_score", label: "Overall" },
  { key: "homepage_score", label: "Homepage" },
  { key: "product_page_score", label: "Product Pages" },
  { key: "trust_score", label: "Trust" },
  { key: "mobile_score", label: "Mobile" },
  { key: "seo_score", label: "SEO" },
] as const;

const CHART_COLORS = [
  "hsl(217, 91%, 60%)", // primary blue - user store
  "hsl(280, 70%, 55%)", // purple
  "hsl(340, 75%, 55%)", // pink
  "hsl(180, 60%, 45%)", // teal
];

const CompetitorAnalysis = ({ audit }: CompetitorAnalysisProps) => {
  const { user } = useAuth();
  const [urls, setUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [competitors, setCompetitors] = useState<CompetitorResult[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);

  const addUrl = () => {
    if (urls.length < 3) setUrls([...urls, ""]);
  };

  const removeUrl = (i: number) => {
    setUrls(urls.filter((_, idx) => idx !== i));
  };

  const updateUrl = (i: number, value: string) => {
    const next = [...urls];
    next[i] = value;
    setUrls(next);
  };

  const validUrls = urls.filter((u) => u.trim().length > 0);

  const analyzeCompetitors = async () => {
    if (validUrls.length === 0) {
      toast({ title: "Enter at least one competitor URL", variant: "destructive" });
      return;
    }

    setLoading(true);
    setCompetitors([]);
    setAiInsights(null);

    const results: CompetitorResult[] = [];

    try {
      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i].trim();
        const cleanUrl = url.startsWith("http") ? url : `https://${url}`;

        setProgress(`Auditing competitor ${i + 1}/${validUrls.length}: ${cleanUrl}`);

        // Run the full audit pipeline
        const auditId = await startAudit(cleanUrl);
        setProgress(`Scraping ${cleanUrl}...`);
        const scraped = await runScraping(auditId, cleanUrl);
        setProgress(`Analyzing ${cleanUrl}...`);
        await runAnalysis(auditId, scraped);

        // Fetch completed audit
        const completedAudit = await getAudit(auditId);

        results.push({
          store_url: cleanUrl,
          overall_score: completedAudit.overall_score || 0,
          homepage_score: completedAudit.homepage_score || 0,
          product_page_score: completedAudit.product_page_score || 0,
          trust_score: completedAudit.trust_score || 0,
          mobile_score: completedAudit.mobile_score || 0,
          seo_score: completedAudit.seo_score || 0,
          audit_id: auditId,
        });

        // Save competitor link
        await supabase.from("competitor_analyses").insert({
          source_audit_id: audit.id,
          competitor_audit_id: auditId,
          competitor_url: cleanUrl,
          user_id: user?.id,
        });
      }

      setCompetitors(results);

      // Generate AI insights
      setProgress("Generating AI comparison insights...");
      const { data: insightsData, error: insightsError } = await supabase.functions.invoke(
        "compare-competitors",
        {
          body: {
            userStore: {
              store_url: audit.store_url,
              overall_score: audit.overall_score || 0,
              homepage_score: audit.homepage_score || 0,
              product_page_score: audit.product_page_score || 0,
              trust_score: audit.trust_score || 0,
              mobile_score: audit.mobile_score || 0,
              seo_score: audit.seo_score || 0,
            },
            competitors: results,
          },
        }
      );

      if (insightsError) {
        console.error("AI insights error:", insightsError);
        toast({ title: "Comparison complete", description: "AI insights unavailable, but scores are ready." });
      } else {
        setAiInsights(insightsData);

        // Save insights to competitor_analyses
        for (const r of results) {
          await supabase
            .from("competitor_analyses")
            .update({ ai_insights: JSON.stringify(insightsData) })
            .eq("source_audit_id", audit.id)
            .eq("competitor_audit_id", r.audit_id);
        }
      }

      toast({ title: "Competitor analysis complete!" });
    } catch (e: any) {
      console.error("Competitor analysis error:", e);
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const userStore: CompetitorResult = {
    store_url: audit.store_url,
    overall_score: audit.overall_score || 0,
    homepage_score: audit.homepage_score || 0,
    product_page_score: audit.product_page_score || 0,
    trust_score: audit.trust_score || 0,
    mobile_score: audit.mobile_score || 0,
    seo_score: audit.seo_score || 0,
    audit_id: audit.id,
  };

  const allStores = [userStore, ...competitors];

  // Build chart data
  const chartData = SCORE_CATEGORIES.map((cat) => {
    const entry: any = { category: cat.label };
    allStores.forEach((store, i) => {
      const label = i === 0 ? "Your Store" : `Competitor ${i}`;
      entry[label] = (store as any)[cat.key] || 0;
    });
    return entry;
  });

  const getScoreClass = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-critical";
  };

  const getHighest = (key: string) => {
    return Math.max(...allStores.map((s) => (s as any)[key] || 0));
  };

  const shortUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="mb-2 text-lg font-semibold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Compare With Competitors
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Enter up to 3 competitor Shopify store URLs to see how your store stacks up.
      </p>

      {/* URL Inputs */}
      <div className="space-y-3 mb-4">
        {urls.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder={`Competitor ${i + 1} URL (e.g., competitor.myshopify.com)`}
              value={url}
              onChange={(e) => updateUrl(i, e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            {urls.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeUrl(i)} disabled={loading}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-8">
        {urls.length < 3 && (
          <Button variant="outline" onClick={addUrl} disabled={loading} className="gap-2 h-10 px-5 text-sm font-medium">
            <Plus className="h-4 w-4" />
            Add Competitor
          </Button>
        )}
        <Button onClick={analyzeCompetitors} disabled={loading || validUrls.length === 0} className="gap-2 h-10 px-5 text-sm font-medium">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          {loading ? "Analyzing..." : "Analyze Competitors"}
        </Button>
      </div>

      {/* Progress */}
      {loading && progress && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          {progress}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {competitors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Comparison Table */}
            <div className="mb-8 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-3 text-left font-semibold text-foreground">Store</th>
                    {SCORE_CATEGORIES.map((c) => (
                      <th key={c.key} className="p-3 text-center font-semibold text-foreground">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allStores.map((store, i) => (
                    <tr
                      key={store.audit_id}
                      className={`border-b border-border last:border-0 ${i === 0 ? "bg-primary/5" : ""}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {i === 0 && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                              You
                            </span>
                          )}
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {shortUrl(store.store_url)}
                          </span>
                        </div>
                      </td>
                      {SCORE_CATEGORIES.map((c) => {
                        const val = (store as any)[c.key] || 0;
                        const isHighest = val === getHighest(c.key) && val > 0;
                        return (
                          <td key={c.key} className="p-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${getScoreClass(val)} ${
                                isHighest ? "underline decoration-2 underline-offset-2" : ""
                              }`}
                            >
                              {val}
                              {isHighest && <Trophy className="h-3 w-3" />}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bar Chart */}
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Score Comparison Chart</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {allStores.map((_, i) => {
                    const label = i === 0 ? "Your Store" : `Competitor ${i}`;
                    return (
                      <Bar key={label} dataKey={label} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insights */}
            {aiInsights && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                  <h3 className="mb-2 text-sm font-bold text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    How Your Store Compares
                  </h3>
                  <p className="text-sm text-foreground">{aiInsights.summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {aiInsights.strengths?.length > 0 && (
                    <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                      <h4 className="mb-2 text-sm font-semibold text-success flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        Your Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {aiInsights.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-foreground leading-relaxed">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.weaknesses?.length > 0 && (
                    <div className="rounded-lg border border-critical/20 bg-critical/5 p-4">
                      <h4 className="mb-2 text-sm font-semibold text-critical flex items-center gap-1.5">
                        <TrendingDown className="h-4 w-4" />
                        Areas to Improve
                      </h4>
                      <ul className="space-y-1.5">
                        {aiInsights.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-foreground leading-relaxed">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Detailed Insights */}
                {aiInsights.insights?.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Detailed Insights
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.insights.map((insight, i) => (
                        <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompetitorAnalysis;
