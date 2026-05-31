import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { isDevBypassEnabled } from "@/lib/dev-auth-bypass";
import { Loader2, AlertTriangle, Lightbulb, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import ShareableScorecard from "@/components/ShareableScorecard";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { exportClientReportPDF, type ClientReportBranding } from "@/lib/pdf-client-report";
import { toast } from "@/hooks/use-toast";

const AgencyClientReport = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [branding, setBranding] = useState<ClientReportBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!storeId) return;
      setFetchError(null);

      try {
        if (isDevBypassEnabled() && isDevBypassEnabled()) {
          console.log("[AgencyClientReport] Dev mode — fetching real data for store:", storeId);
        }

        const { data: s, error: storeErr } = await supabase.from("managed_stores").select("*").eq("id", storeId).single();
        if (storeErr) throw storeErr;
        if (!s || !s.last_audit_id) { setLoading(false); return; }
        setStore(s);

        // Load audit and branding in parallel
        const [auditRes, brandingRes] = await Promise.all([
          supabase.from("store_audits").select("*").eq("id", s.last_audit_id).single(),
          supabase.from("agency_branding").select("*").eq("user_id", s.user_id).maybeSingle(),
        ]);

        console.log("[AgencyClientReport] Audit loaded:", !!auditRes.data, "Branding:", !!brandingRes.data);
        setAudit(auditRes.data);
        if (brandingRes.data) {
          setBranding({
            company_name: brandingRes.data.company_name || undefined,
            logo_url: brandingRes.data.logo_url || undefined,
            primary_color: brandingRes.data.primary_color || undefined,
            secondary_color: brandingRes.data.secondary_color || undefined,
            footer_text: brandingRes.data.footer_text || undefined,
            contact_email: (brandingRes.data as any).contact_email || undefined,
            website_url: (brandingRes.data as any).website_url || undefined,
          });
        }
      } catch (err: any) {
        console.error("[AgencyClientReport] Fetch error:", err);
        setFetchError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId]);

  const handleExportPDF = async () => {
    if (!store || !audit) return;
    setExporting(true);
    try {
      const analysis = audit.raw_analysis?.ai_analysis;
      const summary = analysis?.executive_summary || `${store.store_name} scored ${audit.overall_score}/100 for conversion optimization.`;
      await exportClientReportPDF({
        store_name: store.store_name,
        store_url: store.store_url,
        client_name: store.client_name,
        overall_score: audit.overall_score || 0,
        homepage_score: audit.homepage_score,
        product_page_score: audit.product_page_score,
        trust_score: audit.trust_score,
        mobile_score: audit.mobile_score,
        seo_score: audit.seo_score,
        issues: audit.issues || [],
        recommendations: audit.recommendations || [],
        summary,
        created_at: audit.created_at,
      }, branding || undefined);
      toast({ title: "PDF exported successfully" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="container max-w-4xl py-10 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-critical mb-3" />
          <p className="text-foreground font-medium mb-1">Something went wrong while loading your data</p>
          <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!store || !audit) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="container max-w-4xl py-10 text-center">
          <p className="text-muted-foreground">Report not available. Run an audit first.</p>
          <Link to="/agency"><Button variant="outline" className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const issues = (audit.issues || []) as any[];
  const recommendations = (audit.recommendations || []) as any[];
  const analysis = audit.raw_analysis?.ai_analysis;
  const summary = analysis?.executive_summary || `${store.store_name} scored ${audit.overall_score}/100 for conversion optimization.`;

  const brandedName = branding?.company_name;
  const brandedColor = branding?.primary_color;

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="container max-w-4xl py-10">
        <PageBreadcrumb items={[
          { label: "Agency", href: "/agency" },
          { label: "Client Report" },
        ]} />

        {/* Branded Header */}
        <div className="mb-8 rounded-lg border border-border overflow-hidden">
          <div
            className="px-6 py-5 flex items-center gap-4"
            style={{ backgroundColor: brandedColor || "hsl(var(--primary))" }}
          >
            {branding?.logo_url && (
              <img src={branding.logo_url} alt="Agency logo" className="h-10 w-auto max-w-[140px] object-contain rounded bg-white/10 p-1" />
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">
                {brandedName || "Store Auditor"}
              </h1>
              <p className="text-sm text-white/80">Shopify Store Performance Report</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shrink-0"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export PDF
            </Button>
          </div>
          <div className="px-6 py-3 bg-card border-t border-border flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-foreground">{store.store_name}</span>
              {store.client_name && <span className="text-sm text-muted-foreground ml-2">— Prepared for: {store.client_name}</span>}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(audit.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Scorecard */}
        <div className="flex justify-center mb-10">
          <ShareableScorecard
            storeUrl={store.store_url}
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
        </div>

        {/* Summary */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Performance Summary</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>

        {/* Key Issues */}
        {issues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-warning" /> Key Issues ({issues.length})
            </h2>
            <div className="space-y-3">
              {issues.map((issue: any, i: number) => {
                const color = issue.priority === "high" ? "border-critical/20 bg-critical/5" : issue.priority === "medium" ? "border-warning/20 bg-warning/5" : "border-success/20 bg-success/5";
                return (
                  <div key={i} className={`rounded-lg border p-4 ${color}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        issue.priority === "high" ? "bg-critical/10 text-critical" : issue.priority === "medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                      }`}>{issue.priority}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" /> Recommendations ({recommendations.length})
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec: any, i: number) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                    {rec.effort && (
                      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {rec.effort === "quick_win" ? "Quick Win" : rec.effort === "moderate" ? "Moderate" : "Significant"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground space-y-1">
          <p>
            {brandedName
              ? <>Prepared by <span className="font-semibold" style={{ color: brandedColor }}>{brandedName}</span></>
              : <>Generated with <span className="font-semibold text-primary">Store Auditor</span></>
            }
            {" • "}
            {new Date(audit.created_at).toLocaleDateString()}
          </p>
          {(branding?.contact_email || branding?.website_url) && (
            <p className="text-muted-foreground">
              {branding.contact_email && <span>{branding.contact_email}</span>}
              {branding.contact_email && branding.website_url && " • "}
              {branding.website_url && <span>{branding.website_url}</span>}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgencyClientReport;
