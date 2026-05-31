import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy, Rocket, Store, Brush, Users, ChevronDown, ArrowRight, MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    cat: "Getting started",
    icon: Rocket,
    items: [
      {
        q: "How do I run my first store audit?",
        a: "Go to the Store Audit page, paste your Shopify store URL, and click 'Run Audit.' Results return in under 60 seconds and cover homepage, product pages, mobile, SEO, trust, and conversion. No signup required for your first audit.",
      },
      {
        q: "Do I need a Shopify store to use Store Auditor?",
        a: "Audits work on any public ecommerce site, but features like Auto-Pilot, AI Execution (Kairo), and the Revenue Engine require Shopify because they push real changes through the Shopify Admin API.",
      },
      {
        q: "What's included in the free plan?",
        a: "3 audits per month, the Growth Score, top recommendations, shareable reports, and access to the Growth Hub. Paid plans add Shopify integration, AI execution, multi-store management, and the Agency Growth OS.",
      },
    ],
  },
  {
    cat: "Shopify connection",
    icon: Store,
    items: [
      {
        q: "How do I connect my Shopify store?",
        a: "Open Integrations from the dashboard sidebar, click 'Connect Shopify,' and you'll be redirected to your Shopify admin to authorize Store Auditor. We use OAuth 2.0 — we never see or store your password.",
      },
      {
        q: "What permissions does the Shopify connection request?",
        a: "Read products, orders, themes, and analytics; write products and themes for AI execution. You can review the exact scopes during the install flow and revoke at any time from your Shopify admin → Apps.",
      },
      {
        q: "Can I disconnect the Shopify store?",
        a: "Yes, anytime — from Integrations → Shopify → Disconnect, or from your Shopify admin. Disconnecting stops all AI executions immediately. Your audit history stays in your account.",
      },
    ],
  },
  {
    cat: "Canva integration",
    icon: Brush,
    items: [
      {
        q: "How does the Canva integration work?",
        a: "From any UX recommendation, click 'Open in Canva' to launch a pre-filled design template based on the AI's suggestion. Edit in Canva, save, and import the result back into your store. We use Canva's official OAuth 2.0 + PKCE flow.",
      },
      {
        q: "What Canva permissions do you request?",
        a: "design:content:read, design:content:write, design:meta:read. We use these only to create and read the specific designs you initiate from Store Auditor.",
      },
      {
        q: "Why am I getting redirected back without logging in?",
        a: "Canva uses PKCE, which requires a clean session. Try clearing browser cookies for canva.com, then retry from Integrations → Canva → Connect.",
      },
    ],
  },
  {
    cat: "AI features",
    icon: Users,
    items: [
      {
        q: "What's Kairo and how does it work?",
        a: "Kairo is the AI co-pilot that powers all AI features — recommendations, simulations, the Revenue Engine, the Digital Twin, and AI execution. Kairo learns from the suggestions you accept, edit, and reject to personalize over time.",
      },
      {
        q: "How safe is Auto-Pilot?",
        a: "Auto-Pilot only executes low-risk optimizations (product titles, descriptions, SEO meta, alt text, Canva-driven creative). High-risk actions (theme code, pricing, deletions) always require your approval. Every action is logged and reversible from the AI Permissions panel.",
      },
      {
        q: "How are AI credits used?",
        a: "Each AI feature costs a small number of credits — see your plan's credit allowance in Pricing. Credits reset monthly. You can buy top-ups anytime from My Account → Credits.",
      },
    ],
  },
];

const HelpCenter = () => {
  const [open, setOpen] = useState<string | null>(null);

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
              <LifeBuoy className="h-3.5 w-3.5" />
              Help Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
              How can we help?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Setup guides, FAQs, and answers to the most common questions about Store Auditor, Shopify connections, AI features, and integrations.
            </p>
          </div>
        </section>

        {/* Quick links */}
        <section className="container mx-auto px-4 py-10 max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FAQS.map((c) => {
              const Icon = c.icon;
              return (
                <a key={c.cat} href={`#${c.cat.toLowerCase().replace(/\s+/g, "-")}`} className="group">
                  <Card className="p-4 hover:border-primary/40 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{c.cat}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.items.length} articles</p>
                  </Card>
                </a>
              );
            })}
          </div>
        </section>

        {/* FAQs by category */}
        <section className="container mx-auto px-4 pb-12 max-w-3xl">
          {FAQS.map((c) => (
            <div key={c.cat} id={c.cat.toLowerCase().replace(/\s+/g, "-")} className="mb-10 scroll-mt-20">
              <div className="flex items-center gap-2 mb-4">
                <c.icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">{c.cat}</h2>
              </div>
              <div className="space-y-2">
                {c.items.map((it) => {
                  const id = `${c.cat}-${it.q}`;
                  const isOpen = open === id;
                  return (
                    <Card key={id} className="overflow-hidden">
                      <button
                        type="button"
                        className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors"
                        onClick={() => setOpen(isOpen ? null : id)}
                      >
                        <span className="text-sm font-medium text-foreground">{it.q}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{it.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Still need help */}
        <section className="container mx-auto px-4 pb-20 max-w-3xl">
          <Card className="p-6 border-primary/20 bg-primary/[0.03] text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">Our team typically replies within one business day.</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button asChild>
                <Link to="/contact" className="gap-1.5">Contact support <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/docs">Read API docs</Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
