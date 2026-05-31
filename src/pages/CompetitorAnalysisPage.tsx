import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Plus, X, Loader2, TrendingUp, TrendingDown, Lightbulb, Trophy, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { startAudit, runScraping, runAnalysis, getAudit } from "@/lib/audit-service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

interface StoreResult {
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

const CATEGORIES = [
  { key: "overall_score", label: "Overall" },
  { key: "homepage_score", label: "Homepage" },
  { key: "product_page_score", label: "Product Pages" },
  { key: "trust_score", label: "Trust" },
  { key: "mobile_score", label: "Mobile" },
  { key: "seo_score", label: "SEO" },
] as const;

const COLORS = ["hsl(217, 91%, 60%)", "hsl(280, 70%, 55%)", "hsl(340, 75%, 55%)", "hsl(180, 60%, 45%)"];

const CompetitorAnalysisPage = () => {
  const { user } = useAuth();
  const [yourUrl, setYourUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [stores, setStores] = useState<StoreResult[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);

  const addCompetitor = () => {
    if (competitorUrls.length < 3) setCompetitorUrls([...competitorUrls, ""]);
  };

  const removeCompetitor = (i: number) => setCompetitorUrls(competitorUrls.filter((_, idx) => idx !== i));
  const updateCompetitor = (i: number, val: string) => {
    const n = [...competitorUrls];
    n[i] = val;
    setCompetitorUrls(n);
  };

  const validCompetitors = competitorUrls.filter((u) => u.trim().length > 0);

  const runAnalysisFlow = async () => {
    if (!yourUrl.trim()) {
      toast({ title: "Enter your store URL", variant: "destructive" });
      return;
    }
    if (validCompetitors.length === 0) {
      toast({ title: "Enter at least one competitor URL", variant: "destructive" });
      return;
    }

    setLoading(true);
    setStores([]);
    setAiInsights(null);

    const allUrls = [yourUrl.trim(), ...validCompetitors.map((u) => u.trim())];
    const results: StoreResult[] = [];

    try {
      for (let i = 0; i < allUrls.length; i++) {
        const url = allUrls[i].startsWith("http") ? allUrls[i] : `https://${allUrls[i]}`;
        const label = i === 0 ? "your store" : `competitor ${i}`;
        setProgress(`Auditing ${label}: ${url}`);

        const auditId = await startAudit(url);
        setProgress(`Scraping ${label}...`);
        const scraped = await runScraping(auditId, url);
        setProgress(`Analyzing ${label}...`);
        await runAnalysis(auditId, scraped);
        const audit = await getAudit(auditId);

        results.push({
          store_url: url,
          overall_score: audit.overall_score || 0,
          homepage_score: audit.homepage_score || 0,
          product_page_score: audit.product_page_score || 0,
          trust_score: audit.trust_score || 0,
          mobile_score: audit.mobile_score || 0,
          seo_score: audit.seo_score || 0,
          audit_id: auditId,
        });

        if (i > 0) {
          await supabase.from("competitor_analyses").insert({
            source_audit_id: results[0].audit_id,
            competitor_audit_id: auditId,
            competitor_url: url,
            user_id: user?.id,
          });
        }
      }

      setStores(results);

      setProgress("Generating AI comparison insights...");
      const { data, error } = await supabase.functions.invoke("compare-competitors", {
        body: { userStore: results[0], competitors: results.slice(1) },
      });

      if (!error && data) {
        setAiInsights(data);
        for (const r of results.slice(1)) {
          await supabase.from("competitor_analyses")
            .update({ ai_insights: JSON.stringify(data) })
            .eq("source_audit_id", results[0].audit_id)
            .eq("competitor_audit_id", r.audit_id);
        }
      }

      toast({ title: "Competitor analysis complete!" });
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const chartData = stores.length > 0
    ? CATEGORIES.map((cat) => {
        const entry: any = { category: cat.label };
        stores.forEach((store, i) => {
          entry[i === 0 ? "Your Store" : `Competitor ${i}`] = (store as any)[cat.key] || 0;
        });
        return entry;
      })
    : [];

  const shortUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const scoreClass = (s: number) => (s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-red-500");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Users className="h-7 w-7 text-primary" /> Competitor Analysis
          </h1>
          <p className="text-muted-foreground mb-8">
            Audit your store alongside up to 3 competitors and get AI-powered comparative insights.
          </p>

          {/* Inputs */}
          <Card className="p-5 mb-6">
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Your Store URL</label>
                <Input value={yourUrl} onChange={(e) => setYourUrl(e.target.value)} placeholder="your-store.myshopify.com" disabled={loading} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Competitor URLs</label>
                {competitorUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={url} onChange={(e) => updateCompetitor(i, e.target.value)} placeholder={`Competitor ${i + 1} URL`} disabled={loading} className="flex-1" />
                    {competitorUrls.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCompetitor(i)} disabled={loading}><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {competitorUrls.length < 3 && (
                <Button variant="outline" onClick={addCompetitor} disabled={loading} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Competitor
                </Button>
              )}
              <Button onClick={runAnalysisFlow} disabled={loading || !yourUrl.trim() || validCompetitors.length === 0} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Run Comparison"}
              </Button>
            </div>
          </Card>

          {loading && progress && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" /> {progress}
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {stores.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Table */}
                <div className="mb-8 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="p-3 text-left font-semibold text-foreground">Store</th>
                        {CATEGORIES.map((c) => (
                          <th key={c.key} className="p-3 text-center font-semibold text-foreground">{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((store, i) => (
                        <tr key={store.audit_id} className={`border-b border-border last:border-0 ${i === 0 ? "bg-primary/5" : ""}`}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {i === 0 && <Badge className="text-[10px]">You</Badge>}
                              <Link to={`/audit/${store.audit_id}`} className="font-medium text-foreground hover:text-primary truncate max-w-[180px]">
                                {shortUrl(store.store_url)}
                              </Link>
                            </div>
                          </td>
                          {CATEGORIES.map((c) => {
                            const val = (store as any)[c.key] || 0;
                            return (
                              <td key={c.key} className="p-3 text-center">
                                <span className={`font-bold ${scoreClass(val)}`}>{val}</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart */}
                <Card className="mb-8 p-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Score Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {stores.map((_, i) => (
                        <Bar key={i} dataKey={i === 0 ? "Your Store" : `Competitor ${i}`} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* AI Insights */}
                {aiInsights && (
                  <div className="space-y-4">
                    <Card className="p-5 border-primary/20 bg-primary/5">
                      <h3 className="mb-2 text-sm font-bold text-foreground flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" /> Summary
                      </h3>
                      <p className="text-sm text-foreground">{aiInsights.summary}</p>
                    </Card>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {aiInsights.strengths?.length > 0 && (
                        <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
                          <h4 className="mb-2 text-sm font-semibold text-emerald-500 flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Your Strengths</h4>
                          <ul className="space-y-1">{aiInsights.strengths.map((s, i) => <li key={i} className="text-xs text-foreground">• {s}</li>)}</ul>
                        </Card>
                      )}
                      {aiInsights.weaknesses?.length > 0 && (
                        <Card className="p-4 border-red-500/20 bg-red-500/5">
                          <h4 className="mb-2 text-sm font-semibold text-red-500 flex items-center gap-1.5"><TrendingDown className="h-4 w-4" /> Areas to Improve</h4>
                          <ul className="space-y-1">{aiInsights.weaknesses.map((w, i) => <li key={i} className="text-xs text-foreground">• {w}</li>)}</ul>
                        </Card>
                      )}
                    </div>
                    {aiInsights.insights?.length > 0 && (
                      <Card className="p-4">
                        <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-primary" /> Detailed Insights</h4>
                        <div className="space-y-2">
                          {aiInsights.insights.map((ins, i) => (
                            <p key={i} className="text-xs text-muted-foreground pl-4 border-l-2 border-primary/20">{ins}</p>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default CompetitorAnalysisPage;
