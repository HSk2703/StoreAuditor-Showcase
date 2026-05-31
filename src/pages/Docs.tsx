import { Link } from "react-router-dom";
import { BookOpen, Key, Plug, Webhook, ArrowRight, Lock, Code2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/lib/usePageMeta";

const Docs = () => {
  usePageMeta({
    title: "Developer Docs — API, Webhooks & Integrations | Store Auditor",
    description: "Build with Store Auditor. Authenticate, integrate, and extend our AI-assisted Shopify growth platform with documented APIs and webhook payloads.",
    canonical: "/docs",
    keywords: ["Store Auditor API", "Shopify API docs", "AI audit API", "webhooks"],
  });
  return (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[100px]" />
        </div>
        <div className="container relative mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            Developer Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Build with Store Auditor
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to authenticate, integrate, and extend Store Auditor — from API access to webhook payloads.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-4xl space-y-10">
        {/* Authentication */}
        <Card className="p-6 sm:p-8" id="authentication">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Authentication</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Store Auditor uses JWT-based authentication backed by Lovable Cloud. End users sign in with email/password
            or Google OAuth and receive a session token automatically managed by the SDK. For programmatic access from
            your own services, generate an API key from <Link to="/account" className="text-primary hover:underline">My Account → API Keys</Link>.
          </p>
          <div className="rounded-xl bg-muted/40 border border-border/60 p-4 font-mono text-xs overflow-x-auto">
            <p className="text-muted-foreground mb-1"># Authenticate via Bearer token</p>
            <p className="text-foreground">curl https://api.storeauditor.io/v1/audits \</p>
            <p className="text-foreground">  -H "Authorization: Bearer YOUR_API_KEY"</p>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Tokens are scoped to your account and never exposed in browser storage.
          </div>
        </Card>

        {/* Integrations */}
        <Card className="p-6 sm:p-8" id="integrations">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Integrations</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Store Auditor connects to the platforms your store already runs on. Each integration is OAuth 2.0 based,
            uses scoped permissions, and can be disconnected at any time.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: "Shopify", desc: "Read & write products, themes, orders, and analytics for AI execution." },
              { title: "Canva", desc: "OAuth 2.0 + PKCE for design generation and back-import." },
              { title: "Google Analytics", desc: "Read aggregated traffic for the Performance Report." },
              { title: "Meta Pixel", desc: "Marketing event tracking — gated by user consent." },
              { title: "Firecrawl", desc: "Powers competitor and visual analysis through structured scraping." },
              { title: "Resend", desc: "Transactional email for invites, alerts, and weekly reports." },
            ].map((i) => (
              <div key={i.title} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-sm font-semibold text-foreground">{i.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Webhooks */}
        <Card className="p-6 sm:p-8" id="webhooks">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Webhook className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Webhooks</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Subscribe to events to receive real-time notifications when audits complete, AI actions run, scores change,
            or alerts fire. Webhook payloads are signed with HMAC-SHA256 — verify signatures before acting on them.
          </p>
          <div className="space-y-2 mb-4">
            {[
              { event: "audit.completed", desc: "Fires when an audit finishes processing." },
              { event: "ai.action.executed", desc: "Fires when Kairo executes a Shopify change." },
              { event: "score.changed", desc: "Fires when a managed store's score moves." },
              { event: "alert.created", desc: "Fires when a new monitoring alert is generated." },
            ].map((w) => (
              <div key={w.event} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Code2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-mono text-foreground">{w.event}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/60 p-4 font-mono text-xs overflow-x-auto">
            <p className="text-muted-foreground mb-1"># Verify a webhook signature (Node.js)</p>
            <p className="text-foreground">const sig = req.headers["x-storeauditor-signature"];</p>
            <p className="text-foreground">const expected = crypto.createHmac("sha256", SECRET)</p>
            <p className="text-foreground">  .update(JSON.stringify(req.body)).digest("hex");</p>
            <p className="text-foreground">if (sig !== expected) return res.status(401).end();</p>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-6 border-primary/20 bg-primary/[0.04] text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Need an API key or have a question?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Email <a href="mailto:dev@storeauditor.io" className="text-primary hover:underline">dev@storeauditor.io</a>{" "}
            or open a ticket through our help center.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button asChild>
              <Link to="/help-center" className="gap-1.5">Help Center <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </Card>
      </section>
    </main>
    <Footer />
  </div>
  );
};

export default Docs;
