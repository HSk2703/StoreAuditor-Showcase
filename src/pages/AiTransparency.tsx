import { useEffect } from "react";
import { usePageMeta } from "@/lib/usePageMeta";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  Database,
  FileCheck,
  Lock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const sections = [
  {
    id: "how-we-use-ai",
    icon: Sparkles,
    title: "How Store Auditor uses AI",
    body: (
      <>
        <p>Store Auditor uses AI models and orchestration workflows to assist Shopify merchants with growth optimization. AI is applied in the following supervised contexts:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>Analyzing store performance, content, and conversion signals</li>
          <li>Generating optimization suggestions and prioritized recommendations</li>
          <li>Simulating user and shopper behavior to estimate the impact of changes before deployment</li>
          <li>Assisting marketing and content workflows (drafts, calendars, ad ideas)</li>
          <li>Automating operational tasks that the merchant has explicitly approved</li>
        </ul>
        <p className="text-foreground font-medium pt-1">
          Store Auditor does not replace human decision-making. Users remain in full control of all connected systems and approvals.
        </p>
      </>
    ),
  },
  {
    id: "responsible-use",
    icon: UserCheck,
    title: "Responsible AI use &amp; human oversight",
    body: (
      <>
        <p>Every AI-assisted action is governed by an explicit operating mode chosen by the merchant:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li><strong className="text-foreground">Manual</strong> — AI only suggests; the merchant performs the action.</li>
          <li><strong className="text-foreground">Assisted</strong> — AI prepares a change; the merchant reviews and approves before execution.</li>
          <li><strong className="text-foreground">Auto-Pilot</strong> — AI executes low-risk, pre-approved task types within bounds the merchant sets, with every action logged and reversible.</li>
        </ul>
        <p>Higher-risk actions (pricing changes, theme code edits, billing) always require explicit human confirmation regardless of mode.</p>
      </>
    ),
  },
  {
    id: "ai-outputs",
    icon: FileCheck,
    title: "AI-generated outputs",
    body: (
      <>
        <p>Any text, suggestion, simulation, mockup, or report labeled as AI-assisted is generated with the help of large language models and may contain inaccuracies. Merchants are advised to review AI outputs before publishing or implementing them.</p>
        <p className="rounded-md border border-primary/20 bg-primary/[0.04] px-3 py-2 text-sm">
          <Sparkles className="inline h-3.5 w-3.5 mr-1.5 text-primary -mt-0.5" />
          Kairo's recommendations, simulations, and generated outputs are AI-assisted and should be reviewed before implementation.
        </p>
      </>
    ),
  },
  {
    id: "data-sources",
    icon: Database,
    title: "Data sources &amp; integrations",
    body: (
      <>
        <p>Store Auditor may connect with the following third-party platforms when a merchant authorizes them:</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
          {[
            "Shopify",
            "Google Analytics",
            "Meta Ads",
            "Google Search Console",
            "CRM systems",
            "Composio-supported integrations",
            "User-authorized third-party tools",
          ].map((p) => (
            <li key={p} className="rounded-md border border-border/60 bg-muted/30 px-3 py-1.5">{p}</li>
          ))}
        </ul>
        <p className="text-foreground font-medium pt-1">
          Store Auditor only accesses data from integrations explicitly connected and authorized by the user through secure OAuth authentication flows.
        </p>
        <p>We do not train proprietary AI models on private merchant data without consent.</p>
      </>
    ),
  },
  {
    id: "consent-attribution",
    icon: ShieldCheck,
    title: "Consent &amp; attribution",
    body: (
      <>
        <p>Store Auditor follows a consent-first architecture. We rely on user-authorized integrations and third-party APIs (such as Shopify, Google, Meta, OpenAI, Google Gemini, and Composio-connected providers) that maintain their own consent, attribution, and usage policies.</p>
        <p>Generated content that incorporates branded or licensed assets remains the responsibility of the merchant to validate before public use.</p>
        <p>
          See the{" "}
          <Link to="/ai-data-policy" className="text-primary underline hover:no-underline">
            AI Data Policy
          </Link>{" "}
          for the full integration authorization model.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    icon: Lock,
    title: "User privacy &amp; security",
    body: (
      <>
        <p>Merchant data is stored in our managed backend with row-level security so each account can only access its own records. Authentication uses standard OAuth 2.0 and JWT-based sessions, and admin actions are append-only logged.</p>
        <p>For specifics, review the <Link to="/privacy" className="text-primary underline hover:no-underline">Privacy Policy</Link> and <Link to="/terms" className="text-primary underline hover:no-underline">Terms of Service</Link>.</p>
      </>
    ),
  },
  {
    id: "limitations",
    icon: AlertTriangle,
    title: "Limitations of AI systems",
    body: (
      <>
        <p>AI models can make mistakes. Outputs may be incomplete, out of date, or occasionally wrong. Store Auditor mitigates this with deterministic guardrails, rollback support on automated actions, and clear labeling of AI-generated content — but human judgment is still required for any consequential decision.</p>
        <p>If you spot inaccurate or harmful output, please report it via the <Link to="/contact" className="text-primary underline hover:no-underline">contact form</Link>.</p>
      </>
    ),
  },
];

const AiTransparency = () => {
  usePageMeta({
    title: "AI Transparency & Responsible Use | Store Auditor",
    description: "Where Store Auditor uses AI, what stays under human control, and how third-party data is accessed. Built for transparency.",
    canonical: "/ai-transparency",
  });


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-28 pb-12 sm:pt-32 sm:pb-16">
          <div className="container max-w-3xl px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Responsible AI
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                AI Transparency &amp; Responsible Use
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Store Auditor is an AI-assisted growth operating system for Shopify merchants. This page explains exactly where AI is used, what stays under human control, and how third-party data is accessed.
              </p>
            </motion.div>
          </div>
        </section>

        {/* TOC */}
        <section className="pb-6">
          <div className="container max-w-3xl px-4 sm:px-6">
            <nav
              aria-label="On this page"
              className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                On this page
              </p>
              <ul className="grid sm:grid-cols-2 gap-1.5 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <s.icon className="h-3.5 w-3.5 text-primary/70" />
                      <span dangerouslySetInnerHTML={{ __html: s.title }} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {/* Sections */}
        <section className="pb-16 sm:pb-24">
          <div className="container max-w-3xl px-4 sm:px-6 space-y-10">
            {sections.map((s, i) => (
              <motion.article
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2
                    className="text-xl sm:text-2xl font-bold text-foreground"
                    dangerouslySetInnerHTML={{ __html: s.title }}
                  />
                </div>
                <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed [&_strong]:text-foreground">
                  {s.body}
                </div>
              </motion.article>
            ))}

            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 sm:p-8 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                Questions about how we use AI?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Read the AI Data Policy for the consent and attribution model, or reach out directly.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild>
                  <Link to="/ai-data-policy" className="gap-2">
                    Read AI Data Policy <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AiTransparency;
