import { type AuditReport } from "@/lib/types";

export const mockAuditReport: AuditReport = {
  id: "audit-001",
  storeUrl: "https://example-store.myshopify.com",
  createdAt: new Date().toISOString(),
  overallScore: 72,
  categories: {
    homepage: {
      score: 78,
      label: "Homepage",
      items: [
        { name: "Value Proposition Clarity", score: 80, status: "good", recommendation: "Your headline clearly communicates what you sell. Consider A/B testing variations." },
        { name: "Hero Section Quality", score: 75, status: "good", recommendation: "Hero image is high quality. Add a secondary CTA for users not ready to buy." },
        { name: "Call-to-Action Visibility", score: 70, status: "needs-improvement", recommendation: "Primary CTA blends with background. Use a contrasting color to make it stand out." },
      ],
    },
    productPages: {
      score: 65,
      label: "Product Pages",
      items: [
        { name: "Product Image Quality", score: 85, status: "good", recommendation: "Images are high resolution. Consider adding zoom functionality and lifestyle shots." },
        { name: "Description Structure", score: 55, status: "needs-improvement", recommendation: "Descriptions are text-heavy. Break into bullet points and use benefit-driven language." },
        { name: "Trust Signals", score: 45, status: "critical", recommendation: "No customer reviews or trust badges visible. Add reviews and security badges immediately." },
        { name: "Pricing Visibility", score: 80, status: "good", recommendation: "Pricing is clear. Consider showing savings when applicable." },
        { name: "Add-to-Cart Placement", score: 60, status: "needs-improvement", recommendation: "CTA is below the fold on mobile. Move it to a sticky position." },
      ],
    },
    mobileExperience: {
      score: 70,
      label: "Mobile Experience",
      items: [
        { name: "Mobile Responsiveness", score: 75, status: "good", recommendation: "Layout adapts well to mobile. Some images could be better optimized." },
        { name: "Loading Speed", score: 60, status: "needs-improvement", recommendation: "Page loads in 4.2s on mobile. Optimize images and lazy-load below-fold content." },
        { name: "Mobile CTA Visibility", score: 72, status: "good", recommendation: "CTAs are tappable but could be larger. Consider a sticky add-to-cart bar." },
      ],
    },
    trustElements: {
      score: 55,
      label: "Trust & Conversion",
      items: [
        { name: "Customer Reviews", score: 40, status: "critical", recommendation: "No review system found. Install a review app and actively collect customer feedback." },
        { name: "Urgency/Scarcity Elements", score: 50, status: "needs-improvement", recommendation: "No urgency indicators. Consider stock counters or limited-time offers." },
        { name: "Return Policy Visibility", score: 65, status: "needs-improvement", recommendation: "Return policy exists but is hard to find. Add a visible badge on product pages." },
        { name: "Trust Badges", score: 55, status: "needs-improvement", recommendation: "Missing payment security badges. Add SSL, payment method, and guarantee badges." },
      ],
    },
    seo: {
      score: 82,
      label: "SEO Basics",
      items: [
        { name: "Meta Title", score: 85, status: "good", recommendation: "Meta titles are present and well-structured. Keep them under 60 characters." },
        { name: "Meta Description", score: 80, status: "good", recommendation: "Descriptions are present. Make them more action-oriented with clear CTAs." },
        { name: "Heading Structure", score: 78, status: "good", recommendation: "H1 tags are used correctly. Ensure H2-H3 hierarchy is consistent across pages." },
      ],
    },
  },
};

export const mockPreviousAudits = [
  { id: "audit-001", storeUrl: "example-store.myshopify.com", score: 72, date: "2026-03-08" },
  { id: "audit-002", storeUrl: "cool-fashion.myshopify.com", score: 58, date: "2026-03-05" },
  { id: "audit-003", storeUrl: "tech-gadgets.myshopify.com", score: 85, date: "2026-03-01" },
];
