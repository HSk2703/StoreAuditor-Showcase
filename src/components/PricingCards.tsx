import { useState } from "react";
import { Check, X, Zap, Crown, Star, Sparkles, TrendingUp } from "lucide-react";
import { PLAN_CREDIT_LIMITS } from "@/lib/ai-credits-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import AgencySeatCalculator from "@/components/AgencySeatCalculator";

const pricingPlans = [
  {
    tier: "free",
    name: "Free",
    monthlyPrice: 0,
    features: [
      { text: "3 store audits / month", included: true },
      { text: "AI conversion score", included: true },
      { text: "Top 5 recommendations", included: true },
      { text: "Shareable audit reports", included: true },
      { text: "Growth Score tracking", included: true },
      { text: "Shopify Integration", included: false },
      { text: "AI Execution (Kairo)", included: false },
      { text: "Auto-Pilot Optimization", included: false },
    ],
    cta: "Get Started Free",
    ctaLink: "/signup",
    highlighted: false,
    icon: Star,
  },
  {
    tier: "starter",
    name: "Starter",
    monthlyPrice: 19,
    features: [
      { text: "15 audits / month", included: true },
      { text: "Full category breakdown", included: true },
      { text: "CRO insights & priorities", included: true },
      { text: "Cognitive Shopper Simulator", included: true },
      { text: "Shopify Integration", included: true },
      { text: "Score history & trends", included: true },
      { text: "Growth Hub & achievements", included: true },
      { text: "PDF export & standard support", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=starter",
    highlighted: false,
    icon: Zap,
  },
  {
    tier: "growth",
    name: "Growth",
    monthlyPrice: 49,
    features: [
      { text: "50 audits / month", included: true },
      { text: "Everything in Starter", included: true },
      { text: "Competitor analysis", included: true },
      { text: "AI Execution (Kairo)", included: true },
      { text: "Goals & Auto-Pilot", included: true },
      { text: "Growth Hub & achievements", included: true },
      { text: "Real-time AI Actions", included: true },
      { text: "Page Heatmaps & Benchmarks", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=growth",
    highlighted: true,
    icon: TrendingUp,
  },
  {
    tier: "pro",
    name: "Pro",
    monthlyPrice: 99,
    features: [
      { text: "150 audits / month", included: true },
      { text: "Everything in Growth", included: true },
      { text: "UX Auto-Optimizer", included: true },
      { text: "Emotional Persuasion Layer", included: true },
      { text: "Autonomous Revenue Engine", included: true },
      { text: "AI Digital Twin", included: true },
      { text: "Social Media AI suite", included: true },
      { text: "Multi-Store & Priority support", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=pro",
    highlighted: false,
    icon: Crown,
  },
  {
    tier: "agency",
    name: "Agency",
    monthlyPrice: 199,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited audits & stores", included: true },
      { text: "Autonomous Revenue Engine", included: true },
      { text: "AI Digital Twin", included: true },
      { text: "Cognitive Simulator (unlimited)", included: true },
      { text: "White-label reports", included: true },
      { text: "Client portal & alerts", included: true },
      { text: "Auto-Pilot Optimization", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=agency&type=agency",
    highlighted: false,
    icon: Sparkles,
  },
];

export const plans = pricingPlans.map((p) => ({
  name: p.name,
  price: p.monthlyPrice === 0 ? "$0" : `$${p.monthlyPrice}`,
  period: p.monthlyPrice === 0 ? "forever" : "/month",
  description: "",
  features: p.features,
  cta: p.cta,
  ctaLink: p.ctaLink,
  highlighted: p.highlighted,
}));

interface PricingCardsProps {
  compact?: boolean;
}

const COMPARE_FEATURES: [string, ...(boolean | string)[]][] = [
  ["AI Credits / month", "10", "100", "300", "1,000", "4,000"],
  ["Store Audits", "3/mo", "15/mo", "50/mo", "150/mo", "Unlimited"],
  ["AI Conversion Score", true, true, true, true, true],
  ["Growth Score & Tracking", true, true, true, true, true],
  ["Shopify Integration", false, true, true, true, true],
  ["CRO Insights & Priorities", false, true, true, true, true],
  ["Cognitive Shopper Simulator", false, true, true, true, true],
  ["Growth Hub Access", false, true, true, true, true],
  ["PDF Export", false, true, true, true, true],
  ["Competitor Analysis", false, false, true, true, true],
  ["AI Recommendations Engine", false, false, true, true, true],
  ["AI Execution (Kairo)", false, false, true, true, true],
  ["Page Heatmaps & Benchmarks", false, false, true, true, true],
  ["Goals & Auto-Pilot", false, false, true, true, true],
  ["UX Auto-Optimizer", false, false, false, true, true],
  ["Emotional Persuasion Layer", false, false, false, true, true],
  ["Social Media AI Suite", false, false, false, true, true],
  ["Campaign Builder & Scheduler", false, false, false, true, true],
  ["Autonomous Revenue Engine", false, false, false, true, true],
  ["AI Digital Twin", false, false, false, true, true],
  ["Multi-Store Support", false, false, false, true, true],
  ["Team Access & Tasks", false, false, false, false, true],
  ["White-Label Reports", false, false, false, false, true],
  ["Client Portal & Alerts", false, false, false, false, true],
];

const PricingCards = ({ compact = false }: PricingCardsProps) => {
  const [yearly, setYearly] = useState(false);
  const [boostAddon, setBoostAddon] = useState(false);

  return (
    <div className="space-y-10">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium transition-colors ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly(!yearly)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors ${yearly ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${yearly ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-medium transition-colors ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
          <span className="ml-1.5 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Save 10%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
        {pricingPlans.map((plan) => {
          const yearlyTotal = Math.round(plan.monthlyPrice * 12 * 0.9);
          const monthlyEquiv = yearly ? Math.round(yearlyTotal / 12) : plan.monthlyPrice;
          const isFree = plan.monthlyPrice === 0;
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.name}
              className={`rounded-xl border p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative group ${
                plan.highlighted
                  ? "border-primary bg-primary/[0.03] shadow-[0_0_30px_-5px_hsl(var(--primary)/0.25)] ring-2 ring-primary/30 z-10"
                  : "border-border bg-card hover:border-primary/20"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${plan.highlighted ? "bg-primary/15" : "bg-muted"}`}>
                  <PlanIcon className={`h-4 w-4 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              </div>

              {/* Price — primary: $/mo */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">{isFree ? "$0" : `$${monthlyEquiv}`}</span>
                <span className="text-sm text-muted-foreground">{isFree ? "forever" : "/month"}</span>
              </div>

              {/* Subtext: billed annually or yearly total */}
              {!isFree && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {yearly ? `$${yearlyTotal}/year · billed annually` : "billed monthly"}
                </p>
              )}

              {/* 3-day free trial badge */}
              {!isFree && (
                <p className="mt-2 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block w-fit">
                  3-day free trial
                </p>
              )}

              {/* AI credits */}
              <div className="mt-3 flex items-center gap-1.5 bg-primary/10 rounded-lg px-2.5 py-1.5 w-fit">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {PLAN_CREDIT_LIMITS[plan.tier]?.toLocaleString()} AI credits/mo
                </span>
              </div>

              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-xs">
                    {f.included ? (
                      <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-6 w-full min-h-[40px] rounded-lg text-sm transition-all duration-300 ${plan.highlighted ? "shadow-md group-hover:shadow-lg" : "group-hover:shadow-md"}`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link to={plan.ctaLink}>{plan.cta}</Link>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Agency seat calculator */}
      <AgencySeatCalculator yearly={yearly} />

      {/* AI Growth Boost Add-on */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">AI Growth Boost</h3>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Add-on</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced AI optimization, deeper analytics, and priority execution
                <span className="font-medium text-foreground"> — Recover 10x your subscription cost</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">+$29/mo · Includes tools worth $500/month</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Switch checked={boostAddon} onCheckedChange={setBoostAddon} />
            <span className="text-sm font-medium text-foreground">{boostAddon ? "Added" : "Add"}</span>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      {!compact && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-foreground text-center mb-6">Compare All Features</h3>
          <div className="overflow-x-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                  {["Free", "Starter", "Growth", "Pro", "Agency"].map((t) => (
                    <th key={t} className={`px-3 py-3 text-center font-semibold ${t === "Pro" ? "text-primary" : "text-foreground"}`}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_FEATURES.map(([feature, ...tiers], i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{feature as string}</td>
                    {(tiers as (boolean | string)[]).map((val, j) => (
                      <td key={j} className="px-3 py-2.5 text-center">
                        {typeof val === "string" ? (
                          <span className="font-medium text-foreground">{val}</span>
                        ) : val ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCards;
