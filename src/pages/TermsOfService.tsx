import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageMeta } from "@/lib/usePageMeta";

const TermsOfService = () => {
  usePageMeta({
    title: "Terms of Service | Store Auditor",
    description: "Terms governing use of Store Auditor's AI-assisted growth platform, including AI accuracy disclosures and merchant responsibility.",
    canonical: "/terms",
  });
  return (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: May 22, 2026</p>


      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using Store Auditor ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
          <p>Store Auditor provides AI-powered e-commerce store auditing, optimization recommendations, competitor analysis, digital twin simulations, and growth tools. The Service includes a free tier and paid subscription plans with varying feature access and AI credit allocations.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Account Registration</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide accurate and complete registration information</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>One person or entity may not maintain more than one free account</li>
            <li>You must be at least 18 years old to use the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Subscriptions & Billing</h2>
          <p>Paid plans are billed monthly or annually as selected. All paid plans include a 3-day free trial. AI credits reset monthly and unused plan credits do not roll over. Purchased credit top-ups remain valid for 1 year. You may cancel at any time; access continues until the end of the current billing period.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. AI-Assisted Functionality</h2>
          <p>Store Auditor provides AI-assisted optimization tools, not guaranteed business outcomes. AI-generated outputs (recommendations, audit insights, strategies, simulations, generated content) may contain inaccuracies and are provided as suggestions only. You are responsible for reviewing AI-assisted recommendations before implementation and remain responsible for compliance, approvals, and operational decisions on your store. Certain platform features may rely on third-party APIs and integrations, and Store Auditor is not liable for business outcomes resulting from implemented AI suggestions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Auto-Pilot Mode</h2>
          <p>When enabled, Auto-Pilot allows the AI to execute pre-approved, low-risk optimizations under merchant supervision. High-risk actions (pricing, campaigns) always require manual approval. You can disable Auto-Pilot at any time and all automated actions are logged and reversible for your review.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Agency & Multi-Tenant Use</h2>
          <p>Agency accounts may manage multiple client stores. Agency users are responsible for obtaining appropriate authorization from their clients before running audits or applying changes. Client data is partitioned and not shared between agencies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Acceptable Use</h2>
          <p>You may not use the Service to audit stores you do not own or have authorization to audit, attempt to reverse-engineer our AI systems, circumvent usage limits or credit systems, or resell access without authorization.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Intellectual Property</h2>
          <p>The Service, including all AI models, algorithms, and interface designs, is the intellectual property of Store Auditor. Audit results and generated content for your stores are yours to use freely.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Limitation of Liability</h2>
          <p>Store Auditor provides the Service "as is" without warranty. We are not liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">11. Termination</h2>
          <p>We may suspend or terminate your account for violation of these terms. You may delete your account at any time. Upon termination, your data will be retained for 30 days before permanent deletion.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">12. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
  );
};

export default TermsOfService;
