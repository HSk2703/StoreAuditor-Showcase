import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareableScorecard from "@/components/ShareableScorecard";
import { getAudit } from "@/lib/audit-service";

const SharePage = () => {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getAudit(id)
      .then(setAudit)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !audit || audit.status !== "completed") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Audit not found or still processing."}</p>
        <Link to="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  const analysis = audit.raw_analysis?.ai_analysis;
  const summary =
    analysis?.executive_summary ||
    `This store scored ${audit.overall_score}/100 for conversion optimization. Review the scorecard below for category-level details.`;

  return (
    <div className="min-h-screen bg-surface">
      {/* Minimal header */}
      <header className="border-b border-border bg-card py-4">
        <div className="container max-w-4xl flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-foreground">
            Store Auditor
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl py-12">
        <div className="flex flex-col items-center">
          {/* Scorecard */}
          <ShareableScorecard
            storeUrl={audit.store_url}
            overallScore={audit.overall_score || 0}
            scores={{
              homepage: audit.homepage_score,
              productPages: audit.product_page_score,
              trustSignals: audit.trust_score,
              mobileExperience: audit.mobile_score,
              seo: audit.seo_score,
            }}
            date={audit.created_at}
          />

          {/* Summary */}
          <div className="mt-8 max-w-lg text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Audit Summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center max-w-md">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Analyze Your Shopify Store for Free
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              Get a detailed conversion audit with AI-powered recommendations to boost your store's performance.
            </p>
            <Link to="/">
              <Button size="lg" className="font-semibold">
                Start Free Audit
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharePage;
