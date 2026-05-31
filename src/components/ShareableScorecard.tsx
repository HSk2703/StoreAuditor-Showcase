import { forwardRef } from "react";

interface ScorecardProps {
  storeUrl: string;
  overallScore: number;
  scores: {
    homepage: number | null;
    productPages: number | null;
    trustSignals: number | null;
    mobileExperience: number | null;
    seo: number | null;
  };
  date: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-critical";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-success/10 border-success/30";
  if (score >= 60) return "bg-warning/10 border-warning/30";
  return "bg-critical/10 border-critical/30";
};

const getScoreBarColor = (score: number) => {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-warning";
  return "bg-critical";
};

const categories = [
  { key: "homepage" as const, label: "Homepage", icon: "🏠" },
  { key: "productPages" as const, label: "Product Pages", icon: "🛍️" },
  { key: "trustSignals" as const, label: "Trust Signals", icon: "🛡️" },
  { key: "mobileExperience" as const, label: "Mobile Experience", icon: "📱" },
  { key: "seo" as const, label: "SEO", icon: "🔍" },
];

const ShareableScorecard = forwardRef<HTMLDivElement, ScorecardProps>(
  ({ storeUrl, overallScore, scores, date }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[540px] rounded-2xl border border-border bg-card p-8 shadow-lg"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Store Auditor
          </div>
          <h2 className="text-lg font-bold text-foreground truncate">{storeUrl}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Audited on {new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Overall Score */}
        <div className={`mx-auto mb-8 flex flex-col items-center rounded-xl border p-6 ${getScoreBg(overallScore)}`}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Overall Conversion Score
          </p>
          <span className={`text-6xl font-extrabold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </span>
          <span className="text-sm text-muted-foreground font-medium">/ 100</span>
        </div>

        {/* Category Scores */}
        <div className="space-y-3 mb-8">
          {categories.map(({ key, label, icon }) => {
            const score = scores[key];
            const val = score ?? 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-base w-6 text-center">{icon}</span>
                <span className="text-sm font-medium text-foreground w-36">{label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreBarColor(val)}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-8 text-right ${getScoreColor(val)}`}>
                  {score ?? "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Footer branding */}
        <p className="text-center text-xs text-muted-foreground">
          Generated with <span className="font-semibold text-primary">Store Auditor</span>
        </p>
      </div>
    );
  }
);

ShareableScorecard.displayName = "ShareableScorecard";

export default ShareableScorecard;
