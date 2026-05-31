import { motion, type Variants } from "framer-motion";
import {
  Brain, Zap, Shield, Users, Target, TrendingUp, Rocket, Eye,
  Layers, DollarSign, Sparkles, ArrowRight, CheckCircle2, Globe
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AI_NAME } from "@/lib/kairo-identity";
import { usePageMeta } from "@/lib/usePageMeta";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } }),
};
const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

// PROBLEMS list consolidated into a single tagline in the section below.

const HOW_IT_WORKS = [
  { icon: Eye, title: "Analyze", desc: "50+ AI-powered checks across UX, SEO, trust, mobile, and conversion" },
  { icon: Brain, title: "Strategize", desc: `${AI_NAME} builds personalized action plans based on your data` },
  { icon: Zap, title: "Execute", desc: "AI prepares draft changes for titles, descriptions, SEO and pricing — you approve before they go live" },
  { icon: TrendingUp, title: "Scale", desc: "Auto-Pilot batches low-risk updates and surfaces high-impact ones for your approval" },
];

const DIFFERENTIATORS = [
  { icon: Rocket, title: "Real Execution, Not Suggestions", desc: "From intelligence to action — Kairo transforms data into live store optimizations through the Shopify Admin API" },
  { icon: Globe, title: "Shopify-Native Intelligence", desc: "Deep Shopify AI optimization gives us access to products, inventory, themes, and analytics that no generic eCommerce automation platform can match" },
  { icon: Brain, title: "Adaptive AI That Learns", desc: `${AI_NAME} studies your decisions, preferences, and outcomes to deliver smarter AI CRO tools and recommendations over time` },
  { icon: Layers, title: "Agency-Scale Architecture", desc: "Multi-store dashboards, white-label reports, team tasks, and client portals — built for teams managing 50+ stores" },
  { icon: DollarSign, title: "Revenue-Obsessed", desc: "AI revenue optimization is at the core — from Digital Twin scenarios to the Autonomous Revenue Engine, every feature drives measurable growth" },
  { icon: Shield, title: "Full Governance & Control", desc: "AI that doesn't stop at recommendations — it drives measurable growth through approved automations, with every action logged and reversible" },
];

const TRUST_SIGNALS = [
  { value: "50+", label: "AI-assisted checks per audit" },
  { value: "12", label: "AI-assisted growth modules" },
  { value: "<60s", label: "First audit result" },
  { value: "100%", label: "Reversible AI actions" },
];

const About = () => {
  usePageMeta({
    title: "About Store Auditor — AI-Assisted Growth OS for Shopify | Store Auditor",
    description: "Store Auditor is an AI-assisted growth operating system for Shopify merchants. Audit, simulate, and execute optimizations with human oversight and reversible actions.",
    canonical: "/about",
    keywords: ["About Store Auditor", "AI-assisted Shopify", "merchant-controlled AI", "ecommerce growth OS"],
  });
  return (
  <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
    <Header />
    <main className="flex-1">
      {/* ── HERO / VISION ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.06] blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[80px]" />
        </div>
        <div className="container relative mx-auto px-4 pt-28 pb-20 max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-[0_0_50px_-8px_hsl(var(--primary)/0.5)]"
          >
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <motion.h1
            variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-5 leading-[1.15]"
          >
            The{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(250,70%,65%)] to-primary bg-clip-text text-transparent">
              AI Growth Operating System
            </span>
            <br />for Shopify
          </motion.h1>
          <motion.p
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A merchant-controlled Shopify growth platform that doesn't just analyze your store — it{" "}
            <span className="text-foreground font-semibold">drafts AI-assisted optimizations</span> you approve and execute on connected systems,
            learns from every decision you make, and compounds eCommerce growth under human supervision
          </motion.p>
          <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" className="flex items-center justify-center gap-3 flex-wrap">
            <Button asChild size="lg" className="rounded-full gap-2 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]">
              <Link to="/store-audit">Start Free Audit <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-primary/30 hover:bg-primary/5">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">Why Existing Tools Fail</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              The eCommerce optimization space is broken — tools generate reports, not results
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "Tools provide insights but no execution",
                "Manual optimization slows growth",
                "No feedback loop to improve performance",
                "Fragmented tools create inefficiencies",
              ].map((problem, i) => (
                <motion.li
                  key={problem}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/60 backdrop-blur-sm p-4"
                >
                  <div className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{problem}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-5">
              <Zap className="h-3.5 w-3.5" />
              The AI Execution Layer
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              From Insight to Impact in{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(250,70%,65%)] bg-clip-text text-transparent">Seconds</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Store Auditor is the first AI CRO tool that combines deep analysis with supervised Shopify execution
            </p>
          </motion.div>

          <Card className="p-6 sm:p-8 border-primary/20 bg-primary/[0.02]">
            <p className="text-muted-foreground leading-relaxed text-center">
              We believe every Shopify store — whether a scrappy startup or a scaled agency — deserves access to world-class
              conversion rate optimization AI.
              Store Auditor democratizes the kind of deep UX analysis, competitive benchmarking, and AI revenue optimization that was previously only
              available to brands spending six figures on consultants.{" "}
              <span className="text-foreground font-semibold">From intelligence to action — {AI_NAME} transforms data into live store optimizations</span>
            </p>
          </Card>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Four steps from audit to AI-assisted Shopify growth</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 text-center group"
              >
                <div className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                </div>
                <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DIFFERENT ── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">What Makes Us Different</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Built for execution, not just reporting</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIFFERENTIATORS.map((d, i) => (
              <motion.div
                key={d.title}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="p-5 h-full hover:border-primary/30 transition-all group">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors shadow-[0_0_15px_-4px_hsl(var(--primary)/0.15)]">
                    <d.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Built for Scale & Security</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Enterprise-grade infrastructure with complete data governance</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
            {TRUST_SIGNALS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-4 text-center"
              >
                <p className="text-2xl font-extrabold bg-gradient-to-r from-primary to-[hsl(250,70%,65%)] bg-clip-text text-transparent">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              "Built with enterprise-grade security to protect your store and data",
              "Your data stays protected with advanced access control and monitoring",
              "Every AI action logged, auditable, and fully reversible",
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-foreground font-medium">{t}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Ready to grow your store?</h2>
            <p className="text-muted-foreground mb-8">Run your first free Shopify AI optimization audit in under a minute</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button asChild size="lg" className="rounded-full gap-2 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]">
                <Link to="/store-audit">Start Free Audit <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-primary/30 hover:bg-primary/5">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
  );
};

export default About;
