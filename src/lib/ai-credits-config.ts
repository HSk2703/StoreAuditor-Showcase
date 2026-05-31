/** AI credit costs per feature */
export const AI_CREDIT_COSTS: Record<string, number> = {
  store_audit: 5,
  ux_optimizer: 10,
  digital_twin: 15,
  emotional_personalization: 10,
  cognitive_simulator: 5,
  social_content: 3,
  social_strategy: 5,
  competitor_analysis: 5,
  ai_recommendations: 3,
  revenue_engine: 15,
  audit_chat: 1,
};

export const AI_CREDIT_LABELS: Record<string, string> = {
  store_audit: "Store Audit",
  ux_optimizer: "UX Optimizer",
  digital_twin: "Digital Twin",
  emotional_personalization: "Emotional Personalization",
  cognitive_simulator: "Cognitive Simulator",
  social_content: "Social Content Generation",
  social_strategy: "Social Strategy",
  competitor_analysis: "Competitor Analysis",
  ai_recommendations: "AI Recommendations",
  revenue_engine: "Revenue Engine",
  audit_chat: "AI Chat",
};

/** Plan credit limits */
export const PLAN_CREDIT_LIMITS: Record<string, number> = {
  free: 10,
  starter: 100,
  growth: 300,
  pro: 1000,
  agency: 4000,
};

/** Top-up packages */
export const TOPUP_PACKAGES = [
  { credits: 100, priceCents: 2500, label: "100 Credits", priceLabel: "$25" },
  { credits: 200, priceCents: 5000, label: "200 Credits", priceLabel: "$50" },
  { credits: 300, priceCents: 7500, label: "300 Credits", priceLabel: "$75" },
] as const;

/** Price per credit in cents for custom amounts */
export const CREDIT_PRICE_CENTS = 25; // $0.25 per credit

export function calculateTopupPrice(credits: number): number {
  return Math.ceil(credits * CREDIT_PRICE_CENTS);
}

export function formatCentsToUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
