/**
 * Demo data for agency pages when dev auth bypass is active.
 * Uses stable UUIDs so cross-page navigation works.
 */

// Stable demo IDs
const DEMO_USER_ID = "00000000-0000-4000-a000-000000000001";

// Agency-specific demo identity
export const DEMO_AGENCY_USER = {
  id: "00000000-0000-4000-a000-000000000003",
  name: "Demo Agency Owner",
  email: "agency@demo.local",
};

export const DEMO_STORE_IDS = {
  store1: "d0000000-0000-4000-a000-000000000001",
  store2: "d0000000-0000-4000-a000-000000000002",
  store3: "d0000000-0000-4000-a000-000000000003",
};

export const DEMO_AUDIT_IDS = {
  audit1: "a0000000-0000-4000-a000-000000000001",
  audit2: "a0000000-0000-4000-a000-000000000002",
  audit3: "a0000000-0000-4000-a000-000000000003",
};

export const DEMO_MANAGED_STORES = [
  {
    id: DEMO_STORE_IDS.store1,
    store_name: "Luxe Skincare Co.",
    store_url: "https://luxeskincare.myshopify.com",
    client_name: "Sarah Johnson",
    notes: "Premium skincare brand, focus on mobile optimization",
    last_audit_id: DEMO_AUDIT_IDS.audit1,
    last_audit_score: 82,
    last_audit_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    user_id: DEMO_USER_ID,
  },
  {
    id: DEMO_STORE_IDS.store2,
    store_name: "Urban Fit Apparel",
    store_url: "https://urbanfit.myshopify.com",
    client_name: "Marcus Lee",
    notes: "Athletic wear brand expanding to new markets",
    last_audit_id: DEMO_AUDIT_IDS.audit2,
    last_audit_score: 64,
    last_audit_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    user_id: DEMO_USER_ID,
  },
  {
    id: DEMO_STORE_IDS.store3,
    store_name: "Artisan Home Decor",
    store_url: "https://artisanhome.myshopify.com",
    client_name: "Emily Chen",
    notes: "Handcrafted home goods, needs trust signal improvements",
    last_audit_id: DEMO_AUDIT_IDS.audit3,
    last_audit_score: 47,
    last_audit_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    user_id: DEMO_USER_ID,
  },
];

export const DEMO_TEAM_TASKS = [
  {
    id: "t0000000-0000-4000-a000-000000000001",
    user_id: DEMO_USER_ID,
    managed_store_id: DEMO_STORE_IDS.store1,
    audit_id: DEMO_AUDIT_IDS.audit1,
    title: "Add trust badges to product pages",
    description: "Implement security badges and payment trust signals on all product pages to improve conversion.",
    priority: "high",
    status: "in_progress",
    assigned_to: "Alex Rivera",
    due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    source_issue: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "t0000000-0000-4000-a000-000000000002",
    user_id: DEMO_USER_ID,
    managed_store_id: DEMO_STORE_IDS.store2,
    audit_id: DEMO_AUDIT_IDS.audit2,
    title: "Optimize mobile navigation menu",
    description: "Restructure the mobile hamburger menu for better UX and reduce bounce rate.",
    priority: "critical",
    status: "pending",
    assigned_to: "Jordan Smith",
    due_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    source_issue: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "t0000000-0000-4000-a000-000000000003",
    user_id: DEMO_USER_ID,
    managed_store_id: DEMO_STORE_IDS.store3,
    audit_id: DEMO_AUDIT_IDS.audit3,
    title: "Fix broken product image gallery",
    description: "Product image carousel not loading on Safari. Needs cross-browser testing.",
    priority: "critical",
    status: "pending",
    assigned_to: null,
    due_date: null,
    source_issue: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "t0000000-0000-4000-a000-000000000004",
    user_id: DEMO_USER_ID,
    managed_store_id: DEMO_STORE_IDS.store1,
    audit_id: DEMO_AUDIT_IDS.audit1,
    title: "Implement structured data for SEO",
    description: "Add JSON-LD product schema markup to improve search visibility.",
    priority: "medium",
    status: "completed",
    assigned_to: "Alex Rivera",
    due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    source_issue: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "t0000000-0000-4000-a000-000000000005",
    user_id: DEMO_USER_ID,
    managed_store_id: DEMO_STORE_IDS.store2,
    audit_id: DEMO_AUDIT_IDS.audit2,
    title: "Reduce homepage load time below 3s",
    description: "Compress hero images and defer non-critical JS to improve Core Web Vitals.",
    priority: "high",
    status: "in_progress",
    assigned_to: "Jordan Smith",
    due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    source_issue: null,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "t0000000-0000-4000-a000-000000000006",
    user_id: DEMO_USER_ID,
    managed_store_id: DEMO_STORE_IDS.store3,
    audit_id: DEMO_AUDIT_IDS.audit3,
    title: "Add customer reviews section",
    description: "Integrate review widget on product pages to build social proof.",
    priority: "low",
    status: "pending",
    assigned_to: null,
    due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    source_issue: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const makeDates = (daysAgoList: number[]) =>
  daysAgoList.map((d) => new Date(Date.now() - d * 86400000).toISOString());

export const DEMO_MONITORING_HISTORY = [
  // Store 1 — improving trend
  ...makeDates([28, 21, 14, 7, 2]).map((date, i) => ({
    id: `h100${i}`,
    managed_store_id: DEMO_STORE_IDS.store1,
    conversion_score: [68, 72, 75, 79, 82][i],
    previous_score: i === 0 ? null : [68, 72, 75, 79][i - 1],
    score_change: i === 0 ? null : [4, 3, 4, 3][i - 1],
    ai_insights: [
      "Initial baseline scan completed.",
      "Improved mobile responsiveness detected.",
      "Trust badge additions boosting score.",
      "Product page improvements showing results.",
      "Strong upward trend — keep optimizing!",
    ][i],
    created_at: date,
  })),
  // Store 2 — flat
  ...makeDates([21, 14, 5]).map((date, i) => ({
    id: `h200${i}`,
    managed_store_id: DEMO_STORE_IDS.store2,
    conversion_score: [62, 63, 64][i],
    previous_score: i === 0 ? null : [62, 63][i - 1],
    score_change: i === 0 ? null : [1, 1][i - 1],
    ai_insights: [
      "Baseline established. Mobile issues flagged.",
      "Minor improvements detected in page speed.",
      "Navigation issues still impacting score.",
    ][i],
    created_at: date,
  })),
  // Store 3 — dropping
  ...makeDates([14, 7, 1]).map((date, i) => ({
    id: `h300${i}`,
    managed_store_id: DEMO_STORE_IDS.store3,
    conversion_score: [55, 51, 47][i],
    previous_score: i === 0 ? null : [55, 51][i - 1],
    score_change: i === 0 ? null : [-4, -4][i - 1],
    ai_insights: [
      "Initial scan: trust signals significantly below average.",
      "Score declining — broken images detected on product pages.",
      "Critical: conversion score below 50. Immediate action recommended.",
    ][i],
    created_at: date,
  })),
];

export const DEMO_ALERTS = [
  {
    id: "al000001",
    managed_store_id: DEMO_STORE_IDS.store3,
    message: "Artisan Home Decor conversion score dropped below 50 — immediate attention required.",
    severity: "critical",
    alert_type: "score_drop",
    is_read: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "al000002",
    managed_store_id: DEMO_STORE_IDS.store3,
    message: "Broken product image gallery detected on multiple pages.",
    severity: "critical",
    alert_type: "issue_detected",
    is_read: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "al000003",
    managed_store_id: DEMO_STORE_IDS.store2,
    message: "Urban Fit mobile navigation score stagnant for 3 weeks.",
    severity: "warning",
    alert_type: "stagnation",
    is_read: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// ── Agency-role subsets (2 stores: store1 + store2) ──
const AGENCY_STORE_IDS = new Set([DEMO_STORE_IDS.store1, DEMO_STORE_IDS.store2]);

export const DEMO_AGENCY_STORES = DEMO_MANAGED_STORES.filter(s => AGENCY_STORE_IDS.has(s.id));
export const DEMO_AGENCY_TASKS = DEMO_TEAM_TASKS.filter(t => AGENCY_STORE_IDS.has(t.managed_store_id));
export const DEMO_AGENCY_MONITORING_HISTORY = DEMO_MONITORING_HISTORY.filter(h => AGENCY_STORE_IDS.has(h.managed_store_id));
export const DEMO_AGENCY_ALERTS = DEMO_ALERTS.filter(a => AGENCY_STORE_IDS.has(a.managed_store_id));


export const DEMO_STORE_MONITORING = [
  { managed_store_id: DEMO_STORE_IDS.store1, enabled: true, interval_days: 3, user_id: DEMO_USER_ID },
  { managed_store_id: DEMO_STORE_IDS.store2, enabled: true, interval_days: 7, user_id: DEMO_USER_ID },
  { managed_store_id: DEMO_STORE_IDS.store3, enabled: true, interval_days: 3, user_id: DEMO_USER_ID },
];

// Demo audit data for AgencyClientReport and PerformanceReport
export const DEMO_AUDITS: Record<string, any> = {
  [DEMO_AUDIT_IDS.audit1]: {
    id: DEMO_AUDIT_IDS.audit1,
    store_url: "https://luxeskincare.myshopify.com",
    overall_score: 82,
    homepage_score: 85,
    product_page_score: 78,
    trust_score: 88,
    mobile_score: 80,
    seo_score: 79,
    status: "completed",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    issues: [
      { title: "Missing alt text on 12 product images", description: "Product images lack descriptive alt attributes, hurting accessibility and SEO.", priority: "medium" },
      { title: "Slow LCP on mobile", description: "Largest Contentful Paint takes 4.2s on mobile devices.", priority: "high" },
    ],
    recommendations: [
      { title: "Add descriptive alt text to all product images", description: "Include product name and key attributes in alt text for better SEO and accessibility.", effort: "quick_win" },
      { title: "Optimize hero image delivery", description: "Use next-gen formats (WebP/AVIF) and implement responsive srcset for the hero banner.", effort: "moderate" },
    ],
    raw_analysis: { ai_analysis: { executive_summary: "Luxe Skincare Co. demonstrates strong trust signals and homepage design but needs mobile performance improvements. The store scores well above the Shopify average of 58/100." } },
  },
  [DEMO_AUDIT_IDS.audit2]: {
    id: DEMO_AUDIT_IDS.audit2,
    store_url: "https://urbanfit.myshopify.com",
    overall_score: 64,
    homepage_score: 70,
    product_page_score: 60,
    trust_score: 55,
    mobile_score: 68,
    seo_score: 65,
    status: "completed",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    issues: [
      { title: "No trust badges on checkout page", description: "Checkout lacks security seals and trust indicators.", priority: "high" },
      { title: "Mobile navigation menu is hard to use", description: "Hamburger menu requires 3 taps to reach product categories.", priority: "critical" },
      { title: "Missing meta descriptions on 8 pages", description: "Collection and product pages lack meta descriptions.", priority: "medium" },
    ],
    recommendations: [
      { title: "Add SSL badge and payment icons to checkout", description: "Display trust badges prominently near the checkout button.", effort: "quick_win" },
      { title: "Redesign mobile navigation", description: "Implement a mega-menu with direct category links visible on first tap.", effort: "significant" },
      { title: "Write unique meta descriptions for all pages", description: "Include primary keywords and compelling copy for each page.", effort: "moderate" },
    ],
    raw_analysis: { ai_analysis: { executive_summary: "Urban Fit Apparel has significant room for improvement, particularly in trust signals and mobile navigation. Focus on quick wins first to boost the conversion score." } },
  },
  [DEMO_AUDIT_IDS.audit3]: {
    id: DEMO_AUDIT_IDS.audit3,
    store_url: "https://artisanhome.myshopify.com",
    overall_score: 47,
    homepage_score: 52,
    product_page_score: 40,
    trust_score: 38,
    mobile_score: 50,
    seo_score: 55,
    status: "completed",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    issues: [
      { title: "Product image gallery broken on Safari", description: "Image carousel fails to load on Safari browser, affecting ~30% of visitors.", priority: "critical" },
      { title: "No customer reviews displayed", description: "Products lack social proof — no reviews or ratings visible.", priority: "high" },
      { title: "Missing return policy page", description: "No visible return/refund policy, reducing trust.", priority: "high" },
      { title: "Homepage CTA below the fold", description: "Primary call-to-action button requires scrolling to see.", priority: "medium" },
    ],
    recommendations: [
      { title: "Fix Safari image gallery compatibility", description: "Replace the current carousel library with a cross-browser compatible solution.", effort: "moderate" },
      { title: "Add a customer reviews widget", description: "Integrate Judge.me or Loox for product reviews and star ratings.", effort: "moderate" },
      { title: "Create a comprehensive return policy page", description: "Draft and publish a clear return/refund policy linked from footer and product pages.", effort: "quick_win" },
      { title: "Move primary CTA above the fold", description: "Redesign the hero section to include a prominent Shop Now button.", effort: "quick_win" },
    ],
    raw_analysis: { ai_analysis: { executive_summary: "Artisan Home Decor is in critical condition with a score of 47/100. The broken Safari gallery and lack of trust signals are the top priorities. Quick wins on the return policy and CTA placement can provide immediate improvements." } },
  },
};

// Historical audits for PerformanceReport trend charts
export function getDemoAuditHistory(storeUrl: string): any[] {
  const configs: Record<string, { scores: number[]; daysAgo: number[] }> = {
    "https://luxeskincare.myshopify.com": {
      scores: [65, 70, 74, 78, 82],
      daysAgo: [60, 45, 30, 14, 2],
    },
    "https://urbanfit.myshopify.com": {
      scores: [60, 62, 63, 64],
      daysAgo: [45, 30, 14, 5],
    },
    "https://artisanhome.myshopify.com": {
      scores: [58, 55, 51, 47],
      daysAgo: [30, 14, 7, 1],
    },
  };

  const config = configs[storeUrl];
  if (!config) return [];

  const auditForUrl = Object.values(DEMO_AUDITS).find((a) => a.store_url === storeUrl);

  return config.scores.map((score, i) => ({
    id: `demo-hist-${storeUrl}-${i}`,
    store_url: storeUrl,
    overall_score: score,
    homepage_score: Math.min(100, score + Math.round(Math.random() * 6 - 3)),
    product_page_score: Math.max(0, score - Math.round(Math.random() * 8)),
    trust_score: Math.max(0, score - Math.round(Math.random() * 10)),
    mobile_score: Math.min(100, score + Math.round(Math.random() * 4 - 2)),
    seo_score: Math.min(100, score + Math.round(Math.random() * 5 - 2)),
    status: "completed",
    created_at: new Date(Date.now() - config.daysAgo[i] * 86400000).toISOString(),
    issues: i === config.scores.length - 1 ? (auditForUrl?.issues || []) : [],
  }));
}
