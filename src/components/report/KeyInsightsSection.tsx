import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Props {
  storeUrl: string;
  storeName: string;
  latestAudit: any;
  previousAudit: any;
}

const KeyInsightsSection = ({ storeUrl, storeName, latestAudit, previousAudit }: Props) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-performance-insights", {
        body: {
          storeName,
          storeUrl,
          currentAudit: latestAudit
            ? {
                overall_score: latestAudit.overall_score,
                homepage_score: latestAudit.homepage_score,
                product_page_score: latestAudit.product_page_score,
                trust_score: latestAudit.trust_score,
                mobile_score: latestAudit.mobile_score,
                seo_score: latestAudit.seo_score,
                issues: latestAudit.issues,
              }
            : null,
          previousAudit: previousAudit
            ? {
                overall_score: previousAudit.overall_score,
                homepage_score: previousAudit.homepage_score,
                product_page_score: previousAudit.product_page_score,
                trust_score: previousAudit.trust_score,
                mobile_score: previousAudit.mobile_score,
                seo_score: previousAudit.seo_score,
              }
            : null,
          type: "insights",
        },
      });
      if (error) throw error;
      setInsights(data.result);
    } catch (e: any) {
      setInsights("Unable to generate insights at this time. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          Key Insights
        </CardTitle>
        <CardDescription>AI-powered analysis of store performance</CardDescription>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Generate AI-powered insights about this store's performance and optimization opportunities.
            </p>
            <Button onClick={generateInsights} disabled={loading || !latestAudit} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyInsightsSection;
