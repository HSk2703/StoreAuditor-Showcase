import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Search, Globe, Cpu, BarChart3, Zap, TrendingUp,
  Brain, Eye, DollarSign, Layers, Sparkles,
  Target, Flame, Trophy, Megaphone, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import AuditProgressOverlay from "@/components/AuditProgressOverlay";
import ScoreRing from "@/components/ScoreRing";
import FirstVisitOnboarding from "@/components/FirstVisitOnboarding";
import ToolkitShowcase from "@/components/ToolkitShowcase";
import AiTransparencyNotice from "@/components/AiTransparencyNotice";
import CinematicHero from "@/components/hero/CinematicHero";

import AiAuditConsentModal, { hasSessionConsent } from "@/components/AiAuditConsentModal";
import { startAudit, runScraping, runAnalysis } from "@/lib/audit-service";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } }),
};
const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const aiFeatures = [
  { icon: TrendingUp, title: "Store Audit & Score", desc: "50+ conversion checks with AI recommendations", color: "from-emerald-500/20 to-emerald-500/5" },
  { icon: Brain, title: "Cognitive Simulator", desc: "AI personas simulate real customer journeys", color: "from-violet-500/20 to-violet-500/5" },
  { icon: Eye, title: "UX Auto-Optimizer", desc: "AI generates improved layouts with uplift prediction", color: "from-blue-500/20 to-blue-500/5" },
  { icon: Sparkles, title: "Emotional Persuasion", desc: "Dynamic personalized copy based on visitor signals", color: "from-pink-500/20 to-pink-500/5" },
  { icon: DollarSign, title: "Revenue Engine", desc: "AI-assisted experiments to lift conversion, reviewed before launch", color: "from-amber-500/20 to-amber-500/5" },
  { icon: Layers, title: "AI Digital Twin", desc: "Virtual store replica for risk-free scenario testing", color: "from-cyan-500/20 to-cyan-500/5" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Store Auditor",
      "url": "https://storeauditor.io",
      "logo": "https://storeauditor.io/logo-icon.png",
      "description": "AI-assisted growth operating system for Shopify stores. Analyze performance, optimize conversions, and automate growth workflows with merchant-controlled execution.",
      "sameAs": [],
      "foundingDate": "2024",
      "knowsAbout": ["Shopify", "Conversion Rate Optimization", "AI Analytics", "Ecommerce Growth"]
    },
    {
      "@type": "WebSite",
      "name": "Store Auditor",
      "url": "https://storeauditor.io",
      "description": "AI-Assisted Growth Operating System for Shopify Stores — audit, simulate, optimize, and scale with human oversight.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://storeauditor.io/store-audit?url={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Store Auditor?",
          "acceptedAnswer": { "@type": "Answer", "text": "Store Auditor is an AI-powered growth operating system that analyzes Shopify stores for conversion optimization, UX issues, SEO health, and mobile responsiveness — then provides actionable recommendations to increase revenue." }
        },
        {
          "@type": "Question",
          "name": "How does the AI Store Audit work?",
          "acceptedAnswer": { "@type": "Answer", "text": "Enter your Shopify store URL and our AI runs 50+ conversion checks, analyzing your homepage, product pages, trust signals, mobile experience, and SEO. You get a detailed score with prioritized recommendations in seconds." }
        },
        {
          "@type": "Question",
          "name": "Is there a free plan?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes! The free plan includes 3 audits per month, basic conversion scoring, and top 5 recommendations. No credit card required." }
        },
        {
          "@type": "Question",
          "name": "What is the AI Growth Score?",
          "acceptedAnswer": { "@type": "Answer", "text": "The AI Growth Score is a composite metric that measures every optimization across your store — from conversion rate and UX quality to SEO health and mobile performance. It updates in real-time as you implement improvements." }
        },
        {
          "@type": "Question",
          "name": "Can I use Store Auditor for multiple stores?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. The Agency plan supports unlimited stores with white-label reports, team task management, and store monitoring. Individual plans support auditing multiple URLs as well." }
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "Store Auditor",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "0",
        "highPrice": "199",
        "priceCurrency": "USD",
        "offerCount": "5"
      }
    }
  ]
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditStatus, setAuditStatus] = useState("pending");
  const [auditError, setAuditError] = useState<string | null>(null);
  const [pendingAuditUrl, setPendingAuditUrl] = useState<string | null>(null);

  const runAuditFlow = async (auditUrl: string) => {
    setUrl(auditUrl);
    setIsAnalyzing(true);
    setAuditError(null);
    setAuditStatus("creating");
    try {
      const auditId = await startAudit(auditUrl);
      setAuditStatus("scraping_homepage");
      const scrapedData = await runScraping(auditId, auditUrl);
      setAuditStatus("generating_report");
      await runAnalysis(auditId, scrapedData);
      setAuditStatus("completed");
      setTimeout(() => navigate(`/audit/${auditId}`), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audit failed";
      setAuditError(message);
      setAuditStatus("failed");
      toast({ title: "Audit Failed", description: message, variant: "destructive" });
      setTimeout(() => { setIsAnalyzing(false); setAuditStatus("pending"); setAuditError(null); }, 3000);
    }
  };

  const requestAudit = (auditUrl: string) => {
    if (hasSessionConsent("audit")) runAuditFlow(auditUrl);
    else setPendingAuditUrl(auditUrl);
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    requestAudit(url.trim());
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <FirstVisitOnboarding onRunAudit={requestAudit} isRunning={isAnalyzing} />

      <AiAuditConsentModal
        open={!!pendingAuditUrl}
        intent="audit"
        onCancel={() => setPendingAuditUrl(null)}
        onConfirm={() => {
          const u = pendingAuditUrl;
          setPendingAuditUrl(null);
          if (u) runAuditFlow(u);
        }}
      />

      <AnimatePresence>
        {isAnalyzing && <AuditProgressOverlay status={auditStatus} error={auditError} />}
      </AnimatePresence>

      {/* ── HERO ── */}
      <CinematicHero
        url={url}
        setUrl={setUrl}
        onSubmit={handleStart}
        isAnalyzing={isAnalyzing}
      />

      <div className="container max-w-3xl px-4 sm:px-6 mt-4 mb-8 relative z-10">
        <AiTransparencyNotice variant="compact" />
      </div>


      {/* ── SIX INTELLIGENT SYSTEMS ── */}
      <section id="features" className="bg-surface py-16 sm:py-24 scroll-mt-20">
        <div className="container max-w-6xl px-4 sm:px-6">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-14">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-5"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Cpu className="h-3.5 w-3.5" />
              Powered by Advanced AI
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance px-2">Six Intelligent Systems Powering Your Growth</h2>
            <p className="text-muted-foreground mx-auto text-sm sm:text-base max-w-lg px-2">Every tool works together to drive measurable results</p>
          </motion.div>
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-7 overflow-hidden group cursor-pointer">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 mb-5 group-hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.3)]">
                    <f.icon className="h-5.5 w-5.5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTO-PILOT + GOALS ── */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-5xl px-4 sm:px-6">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Set Goals. Approve. Let AI Assist Execution</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">Define your business targets and our AI drafts the strategy and tasks — you stay in control of what gets executed under merchant supervision</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-4">
            {[
              { icon: Target, label: "Set Goal", desc: "Revenue, conversion, or traffic target", step: 1 },
              { icon: Brain, label: "AI Strategy", desc: "AI-drafted action plan for your review", step: 2 },
              { icon: Zap, label: "Approved Execution", desc: "Tasks run on Auto-Pilot under your oversight", step: 3 },
              { icon: TrendingUp, label: "Results", desc: "Real-time performance tracking", step: 4 },
            ].map((item, i) => (
              <motion.div key={item.label} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="text-center group">
                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{item.step}</div>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPOSIO TOOLKIT SHOWCASE (moved up for SEO + flow) ── */}
      <ToolkitShowcase />

      {/* ── GROWTH SCORE ── */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="container max-w-5xl px-4 sm:px-6">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance px-2">Track Your Growth in Real-Time</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">Your AI Growth Score measures every optimization across your store</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-3 items-center">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 flex flex-col items-center text-center shadow-score">
              <ScoreRing score={78} size={140} />
              <p className="mt-4 text-sm font-semibold text-foreground">AI Growth Score</p>
              <p className="text-xs text-muted-foreground mt-1">Level: Growth Hacker</p>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Leaderboard</p>
                  <p className="text-xs text-muted-foreground">Rank #12 globally</p>
                </div>
              </div>
              {[
                { name: "FastShop", score: 92 },
                { name: "GlowBeauty", score: 87 },
                { name: "Your Store", score: 78, highlight: true },
              ].map((s) => (
                <div key={s.name} className={`flex items-center justify-between px-3 py-2 rounded-lg ${s.highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/50"}`}>
                  <span className={`text-xs font-medium ${s.highlight ? "text-primary" : "text-foreground"}`}>{s.name}</span>
                  <span className={`text-xs font-bold ${s.highlight ? "text-primary" : "text-muted-foreground"}`}>{s.score}</span>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 flex flex-col items-center text-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="text-2xl font-bold text-foreground">12</span>
                <span className="text-sm text-muted-foreground">day streak</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`h-8 w-5 rounded-sm ${i < 5 ? "bg-primary/80" : "bg-muted"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Keep your streak to unlock rewards</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL MEDIA AI ── */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-5xl px-4 sm:px-6">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance px-2">Automate Your Marketing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">AI-powered campaigns across every platform, launched in one click</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-3">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 col-span-1 sm:col-span-2">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Campaign Dashboard</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { platform: "Meta", metric: "+24% ROAS", color: "bg-blue-500/10 text-blue-500" },
                  { platform: "Google", metric: "+18% CTR", color: "bg-emerald-500/10 text-emerald-500" },
                  { platform: "TikTok", metric: "+31% Reach", color: "bg-pink-500/10 text-pink-500" },
                ].map((p) => (
                  <div key={p.platform} className={`rounded-lg p-3 ${p.color.split(" ")[0]}`}>
                    <p className={`text-xs font-bold ${p.color.split(" ")[1]}`}>{p.platform}</p>
                    <p className="text-lg font-bold text-foreground mt-1">{p.metric}</p>
                  </div>
                ))}
              </div>
              <Button size="sm" className="mt-4 gap-2 rounded-lg" onClick={() => navigate("/social-media")}>
                <Megaphone className="h-3.5 w-3.5" /> Launch Campaign
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">AI Creatives</p>
              <div className="space-y-3">
                {["Product showcase", "Story template", "Carousel ad"].map((t) => (
                  <div key={t} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-surface py-16 sm:py-24 scroll-mt-20">
        <div className="container max-w-6xl px-4 sm:px-6">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">Choose the plan that fits your growth stage</p>
          </motion.div>
          <PricingCards compact />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground px-4">
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 3-day free trial</span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-2xl px-4 sm:px-6 text-center">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Start optimizing your store today</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Free audit, no signup, results in seconds</p>
            <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="gap-2 px-8 shadow-md min-h-[44px]">
              Run Free Audit <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
