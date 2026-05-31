import { useEffect } from "react";
import { usePageMeta } from "@/lib/usePageMeta";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, Database, FileText, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const AiDataPolicy = () => {
  usePageMeta({
    title: "AI Data Policy | Store Auditor",
    description: "Consent, attribution, and provider details for every AI capability inside Store Auditor — what data is processed, where, and by whom.",
    canonical: "/ai-data-policy",
  });


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
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
                  Consent &amp; Attribution
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                AI Data Policy
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                How Store Auditor accesses third-party data, what we do with it, and the consent model behind every AI-assisted feature.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pb-16 sm:pb-24">
          <div className="container max-w-3xl px-4 sm:px-6 space-y-10">
            <article className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed [&_strong]:text-foreground">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Authorization model</h2>
              </div>
              <p>
                Store Auditor follows a <strong>consent-first</strong> architecture. We never access third-party data unless the merchant explicitly connects an integration via the secure OAuth flow inside the Integrations Hub.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Each integration uses scoped OAuth tokens issued by the source platform (Shopify, Google, Meta, etc.).</li>
                <li>Tokens are stored encrypted and may be revoked at any time from the Integrations page.</li>
                <li>Revoking an integration immediately stops all AI workflows that depend on it.</li>
              </ul>
            </article>

            <article className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed [&_strong]:text-foreground">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Third-party providers we may use</h2>
              </div>
              <p>
                Store Auditor relies on user-authorized integrations and third-party APIs that maintain their own consent, attribution, and usage policies. These include (but are not limited to):
              </p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                {[
                  "Shopify",
                  "Google (Analytics, Search Console, Ads)",
                  "Meta (Facebook &amp; Instagram Ads)",
                  "OpenAI",
                  "Google Gemini",
                  "Composio-connected providers",
                ].map((p) => (
                  <li
                    key={p}
                    className="rounded-md border border-border/60 bg-muted/30 px-3 py-1.5"
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                ))}
              </ul>
              <p>
                Each of these providers governs how its data, content, and AI outputs may be used. By connecting an integration, the merchant agrees to comply with the corresponding provider terms.
              </p>
            </article>

            <article className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed [&_strong]:text-foreground">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Attribution &amp; ownership</h2>
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Source data (analytics, product, store content) remains owned by the merchant and the originating platform.</li>
                <li>AI-generated drafts (copy, images, suggestions) are provided to the merchant for review and remain the merchant's responsibility to validate before public use.</li>
                <li>Store Auditor does not train proprietary models on private merchant data without explicit consent.</li>
                <li>Where third-party AI providers (OpenAI, Google Gemini) are invoked, their data-handling terms apply for the duration of the request.</li>
              </ul>
            </article>

            <article className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed [&_strong]:text-foreground">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your rights &amp; revocation</h2>
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Disconnect any integration at any time from the Integrations Hub.</li>
                <li>Request export or deletion of your account data via the <Link to="/contact" className="text-primary underline hover:no-underline">contact form</Link>.</li>
                <li>Review related policies: <Link to="/privacy" className="text-primary underline hover:no-underline">Privacy Policy</Link>, <Link to="/terms" className="text-primary underline hover:no-underline">Terms of Service</Link>, <Link to="/cookies" className="text-primary underline hover:no-underline">Cookies</Link>.</li>
              </ul>
            </article>

            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 sm:p-8 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                Want the full AI transparency overview?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                See where AI is used across Store Auditor and how human oversight is enforced.
              </p>
              <Button asChild>
                <Link to="/ai-transparency" className="gap-2">
                  AI Transparency &amp; Responsible Use <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AiDataPolicy;
