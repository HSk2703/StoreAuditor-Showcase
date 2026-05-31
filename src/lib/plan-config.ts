export type PlanTier = "free" | "starter" | "growth" | "pro" | "agency";

export interface PlanConfig {
  name: string;
  price: number;
  auditsPerMonth: number;
  simulationsPerMonth: number;
  aiCreditsPerMonth: number;
  features: string[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  free: {
    name: "Free",
    price: 0,
    auditsPerMonth: 3,
    simulationsPerMonth: 0,
    aiCreditsPerMonth: 10,
    features: [
      "basic_audit",
      "basic_analytics",
      "score_overview",
      "previous_audits",
    ],
  },
  starter: {
    name: "Starter",
    price: 19,
    auditsPerMonth: 15,
    simulationsPerMonth: 3,
    aiCreditsPerMonth: 100,
    features: [
      "basic_audit",
      "basic_analytics",
      "score_overview",
      "previous_audits",
      "enhanced_analytics",
      "cro_insights",
      "issue_prioritization",
      "export_pdf",
      "cognitive_simulator",
      "shopify_integration",
    ],
  },
  growth: {
    name: "Growth",
    price: 49,
    auditsPerMonth: 50,
    simulationsPerMonth: 10,
    aiCreditsPerMonth: 300,
    features: [
      "basic_audit",
      "basic_analytics",
      "score_overview",
      "previous_audits",
      "enhanced_analytics",
      "cro_insights",
      "issue_prioritization",
      "export_pdf",
      "cognitive_simulator",
      "advanced_analytics",
      "competitor_analysis",
      "ai_recommendations",
      "heatmap",
      "score_trends",
      "benchmark",
      "priority_processing",
    ],
  },
  pro: {
    name: "Pro",
    price: 99,
    auditsPerMonth: 150,
    simulationsPerMonth: -1,
    aiCreditsPerMonth: 1000,
    features: [
      "basic_audit",
      "basic_analytics",
      "score_overview",
      "previous_audits",
      "enhanced_analytics",
      "cro_insights",
      "issue_prioritization",
      "export_pdf",
      "cognitive_simulator",
      "advanced_analytics",
      "competitor_analysis",
      "ai_recommendations",
      "heatmap",
      "score_trends",
      "benchmark",
      "priority_processing",
      "ux_optimizer",
      "emotional_personalization",
      "social_media",
      "campaigns",
    ],
  },
  agency: {
    name: "Agency",
    price: 199,
    auditsPerMonth: -1,
    simulationsPerMonth: -1,
    aiCreditsPerMonth: 4000,
    features: [
      "basic_audit",
      "basic_analytics",
      "score_overview",
      "previous_audits",
      "enhanced_analytics",
      "cro_insights",
      "issue_prioritization",
      "export_pdf",
      "cognitive_simulator",
      "advanced_analytics",
      "competitor_analysis",
      "ai_recommendations",
      "heatmap",
      "score_trends",
      "benchmark",
      "priority_processing",
      "ux_optimizer",
      "emotional_personalization",
      "social_media",
      "campaigns",
      "multi_store",
      "client_management",
      "agency_branding",
      "weekly_reports",
      "team_tasks",
      "monitoring",
      "revenue_engine",
      "digital_twin",
    ],
  },
};

export const FEATURE_LABELS: Record<string, string> = {
  basic_audit: "Store Audit",
  basic_analytics: "Basic Analytics",
  score_overview: "Score Overview",
  previous_audits: "Audit History",
  enhanced_analytics: "Enhanced Analytics",
  cro_insights: "CRO Insights",
  issue_prioritization: "Issue Prioritization",
  export_pdf: "PDF Export",
  advanced_analytics: "Advanced Analytics",
  competitor_analysis: "Competitor Analysis",
  ai_recommendations: "AI Recommendations",
  heatmap: "Page Heatmap",
  score_trends: "Score Trends",
  benchmark: "Store Benchmark",
  priority_processing: "Priority Processing",
  multi_store: "Multi-Store Dashboard",
  client_management: "Client Management",
  agency_branding: "Agency Branding",
  weekly_reports: "Weekly Reports",
  team_tasks: "Team Tasks",
  monitoring: "Store Monitoring",
  cognitive_simulator: "Cognitive Shopper Simulator",
  shopify_integration: "Shopify Integration",
  ux_optimizer: "Generative UX Auto-Optimizer",
  emotional_personalization: "Emotional Persuasion Layer",
  revenue_engine: "Autonomous Revenue Engine",
  digital_twin: "AI Digital Twin",
  social_media: "Social Media Management",
  campaigns: "Campaign Builder",
};

/** Minimum plan required for each feature */
export const FEATURE_MIN_PLAN: Record<string, PlanTier> = {
  basic_audit: "free",
  basic_analytics: "free",
  score_overview: "free",
  previous_audits: "free",
  enhanced_analytics: "starter",
  cro_insights: "starter",
  issue_prioritization: "starter",
  export_pdf: "starter",
  cognitive_simulator: "starter",
  shopify_integration: "starter",
  advanced_analytics: "growth",
  competitor_analysis: "growth",
  ai_recommendations: "growth",
  heatmap: "growth",
  score_trends: "growth",
  benchmark: "growth",
  priority_processing: "growth",
  ux_optimizer: "pro",
  emotional_personalization: "pro",
  social_media: "pro",
  campaigns: "pro",
  multi_store: "agency",
  client_management: "agency",
  agency_branding: "agency",
  weekly_reports: "agency",
  team_tasks: "agency",
  monitoring: "agency",
  revenue_engine: "agency",
  digital_twin: "agency",
};

const PLAN_ORDER: Record<PlanTier, number> = { free: 0, starter: 1, growth: 2, pro: 3, agency: 4 };

export function hasFeatureAccess(userPlan: PlanTier, feature: string): boolean {
  const minPlan = FEATURE_MIN_PLAN[feature];
  if (!minPlan) return false;
  return PLAN_ORDER[userPlan] >= PLAN_ORDER[minPlan];
}

export function getMinPlanForFeature(feature: string): PlanTier {
  return FEATURE_MIN_PLAN[feature] || "agency";
}
