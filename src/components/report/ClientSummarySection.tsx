import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { toast } from "@/hooks/use-toast";

interface Props {
  storeName: string;
  latestAudit: any;
  previousAudit: any;
  opportunityScore: number;
}

const ClientSummarySection = ({ storeName, latestAudit, previousAudit, opportunityScore }: Props) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-performance-insights", {
        body: {
          storeName,
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
            ? { overall_score: previousAudit.overall_score }
            : null,
          opportunityScore,
          type: "summary",
        },
      });
      if (error) throw error;
      setSummary(data.result);
    } catch {
      setSummary("Unable to generate summary. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({ title: "Summary copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Client Executive Summary
        </CardTitle>
        <CardDescription>A concise summary suitable for sharing with clients</CardDescription>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div>
            <div className="rounded-lg border border-border bg-muted/30 p-5 prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={copySummary} className="gap-2">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Summary"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a client-ready executive summary of the store's performance.
            </p>
            <Button onClick={generateSummary} disabled={loading || !latestAudit} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Generate Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientSummarySection;
