import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Globe, Cpu, BarChart3, Search, Zap, Shield, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageMeta } from "@/lib/usePageMeta";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const steps = [
  {
    icon: Globe,
    step: "01",
    title: "Enter Your Shopify Store URL",
    desc: "Paste your store link and our AI instantly begins a comprehensive analysis. No login required for your first audit.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Performs Deep Analysis",
    desc: "Our AI scrapes your store and evaluates 50+ conversion factors across homepage, product pages, mobile UX, SEO, trust signals, and page speed.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get Your Audit Report",
    desc: "Receive a detailed score breakdown with prioritized issues ranked by revenue impact — critical fixes first, quick wins highlighted.",
  },
  {
    icon: Zap,
    step: "04",
    title: "Fix & Optimize",
    desc: "Follow the AI-recommended fix order. Each issue includes actionable steps so you or your developer can implement changes immediately.",
  },
];

const whatWeCheck = [
  "Homepage layout & messaging clarity",
  "Product page conversion elements",
  "Mobile responsiveness & UX",
  "SEO meta tags & structure",
  "Trust signals & social proof",
  "Page speed & performance",
  "Navigation & information architecture",
  "Cart & checkout friction points",
];

const HowItWorks = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: "How It Works — AI-Assisted Shopify Audits Step by Step | Store Auditor",
    description: "See how Store Auditor turns your Shopify URL into an AI-assisted optimization plan. Every step is transparent, reviewable, and merchant-approved.",
    canonical: "/how-it-works",
    keywords: ["how AI audit works", "Shopify optimization steps", "AI-assisted CRO", "store audit process"],
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="container max-w-3xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How Store Auditor Works</h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              From URL to actionable optimization plan in under a minute. Here's exactly what happens when you audit your store.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 sm:py-20">
        <div className="container max-w-3xl px-4 sm:px-6">
          <div className="space-y-8">
            {steps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
                className="flex gap-5 items-start">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-md">
                    <s.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  {i < steps.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                </div>
                <div className="pt-1">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Step {s.step}</div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section className="py-12 sm:py-20 bg-surface">
        <div className="container max-w-3xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Search className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-foreground mb-2">What We Analyze</h2>
            <p className="text-muted-foreground text-sm">50+ conversion factors across these key areas</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatWeCheck.map((item, i) => (
              <motion.div key={item} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-2xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to audit your store?</h2>
            <p className="text-muted-foreground mb-6">Get your free conversion score in under 60 seconds.</p>
            <Button size="lg" className="gap-2" onClick={() => navigate("/store-audit")}>
              Start Free Audit <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
