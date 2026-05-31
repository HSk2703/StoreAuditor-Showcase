import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

const PrivacyPolicy = () => {
  usePageMeta({
    title: "Privacy Policy | Store Auditor",
    description: "How Store Auditor collects, uses, and protects merchant and visitor data — GDPR, CCPA, and LGPD aligned.",
    canonical: "/privacy",
  });
  return (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">Last updated: May 22, 2026</p>

      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Who we are</h2>
          <p>
            Store Auditor ("we," "us," "our") provides an AI-powered growth platform for Shopify and ecommerce stores.
            This Privacy Policy explains what data we collect, how we use it, who we share it with, and the rights you
            have. It applies to visitors, registered users, and people whose stores we analyze on behalf of an
            authenticated customer.
          </p>
          <p className="mt-2">
            We comply with the EU General Data Protection Regulation (GDPR), the UK Data Protection Act, the California
            Consumer Privacy Act / CPRA, Brazil's LGPD, and equivalent global frameworks. Where these laws apply, the
            stricter standard governs.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Information we collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-foreground">Account data</strong> — name, email, password hash, role, agency affiliation, profile preferences.</li>
            <li><strong className="text-foreground">Store data</strong> — Shopify store URL, product catalog, theme metadata, orders metadata, and analytics needed to run audits and AI execution.</li>
            <li><strong className="text-foreground">Usage data</strong> — pages visited, features used, AI suggestions accepted/edited/rejected, audit history.</li>
            <li><strong className="text-foreground">Integration tokens</strong> — encrypted OAuth credentials for Shopify, Canva, Google Analytics, Meta and other connected services.</li>
            <li><strong className="text-foreground">Technical data</strong> — IP address, browser, device, timestamps for security and abuse prevention.</li>
            <li><strong className="text-foreground">Cookies & similar</strong> — see our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Deliver, maintain, and improve our store-audit and optimization services.</li>
            <li>Personalize AI recommendations through your Founder Behavior Profile and Kairo Co-Pilot preferences.</li>
            <li>Execute approved AI actions on your connected stores (with full audit log and rollback).</li>
            <li>Process subscriptions, top-ups, and seat-based agency billing.</li>
            <li>Send service notifications: audit completions, weekly reports, security alerts, invites.</li>
            <li>Generate anonymized, aggregated industry benchmarks. Individual stores are never identifiable in benchmarks.</li>
            <li>Detect, investigate, and prevent fraud, abuse, and security incidents.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Legal bases (EU/UK)</h2>
          <p>We process personal data on the following legal bases:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong className="text-foreground">Contract</strong> — to provide the service you signed up for.</li>
            <li><strong className="text-foreground">Legitimate interests</strong> — service improvement, security, fraud prevention.</li>
            <li><strong className="text-foreground">Consent</strong> — analytics cookies, marketing cookies, optional AI personalization.</li>
            <li><strong className="text-foreground">Legal obligation</strong> — tax, accounting, lawful requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Sharing your information</h2>
          <p>We share data only with:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong className="text-foreground">Service providers</strong> we rely on to run the platform (managed cloud infrastructure for hosting and database, Resend for transactional email, Firecrawl for store crawling, and third-party AI providers — including analytics, automation, and language model services — for AI inference). All are bound by data-processing agreements.</li>
            <li><strong className="text-foreground">Integrations you connect</strong> — Shopify, Canva, Google, Meta — limited strictly to the scope you authorize.</li>
            <li><strong className="text-foreground">Legal authorities</strong> — only when compelled by valid legal process.</li>
            <li><strong className="text-foreground">In a corporate transaction</strong> — if Store Auditor is acquired or restructured, your data transfers under the same protections.</li>
          </ul>
          <p className="mt-2">We never sell your personal data. We never share it for third-party advertising without your explicit consent.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. International transfers</h2>
          <p>
            Some of our infrastructure is located outside your country of residence. Where data leaves the EU/UK, we
            rely on Standard Contractual Clauses (SCCs) and equivalent safeguards to ensure your information remains
            protected at GDPR-equivalent levels.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Data security</h2>
          <p>
            We use industry-standard encryption in transit (TLS 1.2+) and at rest, role-based access controls, audit
            logging on sensitive operations, and Row-Level Security on all multi-tenant data. Despite our safeguards,
            no system is 100% secure — we will notify you and the relevant authorities of any incident affecting your
            personal data within 72 hours, where required.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Data retention</h2>
          <p>
            We keep your account data for as long as your account is active. Audit history is retained for the life of
            your account. Monitoring snapshots and alerts older than 60 days are automatically purged. Logs are retained
            for up to 12 months for security and debugging. You can request full account deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">9. Your rights</h2>
          <p>Depending on your jurisdiction, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Delete your data ("right to be forgotten")</li>
            <li>Restrict or object to certain processing</li>
            <li>Receive your data in a portable format</li>
            <li>Withdraw consent at any time (without affecting prior lawful processing)</li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
          <p className="mt-2">
            To exercise any right, email <a href="mailto:privacy@storeauditor.io" className="text-primary hover:underline">privacy@storeauditor.io</a>.
            We respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">10. AI Systems &amp; Data Usage</h2>
          <p>
            Store Auditor uses AI systems to generate insights, recommendations, simulations, and workflow automation
            for connected Shopify stores. AI-generated outputs are AI-assisted and may require human review before
            implementation. Users retain full control over connected integrations and approvals.
          </p>
          <p className="mt-2">
            Store Auditor only accesses third-party integrations explicitly authorized by the user, and uses the
            minimum scopes needed to deliver the feature you enabled. Private merchant data is not used to train our
            proprietary AI models without your consent. Anonymized, aggregated benchmarks never identify an individual
            store.
          </p>
          <p className="mt-2">
            Store Auditor uses third-party AI providers and APIs — including analytics, automation, and language model
            services — to power certain platform features. These providers process data under contractual safeguards
            and do not retain prompts or outputs for model training.
          </p>
          <p className="mt-2">
            AI suggestions are never executed on your store without your explicit approval, except for low-risk actions
            you have specifically enabled in Auto-Pilot mode (product titles, descriptions, SEO meta, alt text). All
            AI activity is logged and reversible from the AI Permissions panel. You can opt out of AI personalization
            at any time in My Account → AI Learning, which resets your Founder Behavior Profile and stops Store
            Auditor from learning from your future decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">11. Children</h2>
          <p>Store Auditor is not directed at children under 16. We do not knowingly collect personal data from minors.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">12. Changes to this policy</h2>
          <p>
            We may update this policy as our service evolves. Material changes will be flagged on this page and, where
            required, communicated by email or in-app notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">13. Contact</h2>
          <p>
            For privacy-related inquiries, email{" "}
            <a href="mailto:privacy@storeauditor.io" className="text-primary hover:underline">privacy@storeauditor.io</a>{" "}
            or write to us through our <a href="/contact" className="text-primary hover:underline">contact page</a>. EU
            users may also contact our representative at the same address.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
  );
};

export default PrivacyPolicy;
