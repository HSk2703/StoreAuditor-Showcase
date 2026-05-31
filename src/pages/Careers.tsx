import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Sparkles, Globe, Brain, Rocket, ArrowRight, Mail, Heart, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VALUES = [
  { icon: Brain, title: "AI-first by default", desc: "We build with AI in the loop on every workflow — from product to ops to support. If a process can be automated, we automate it." },
  { icon: Rocket, title: "Ship fast, ship correct", desc: "Speed without sloppiness. Weekly releases, ruthless testing, and a culture that rewards both audacity and craft." },
  { icon: Globe, title: "Distributed and async", desc: "We hire the best people regardless of geography. Outcomes matter. Calendars don't." },
  { icon: Zap, title: "High signal, low ceremony", desc: "Short Slack messages, decision docs over meetings, no status theater. We trust each other to do the work." },
];

const Careers = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
        </div>
        <div className="container relative mx-auto px-4 py-20 max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-[0_0_40px_-8px_hsl(var(--primary)/0.5)]"
          >
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-[1.1]">
            Build the AI Growth OS{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(250,70%,65%)] to-primary bg-clip-text text-transparent">
              for Ecommerce
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            We're a small, opinionated team building the platform that will run modern Shopify brands. If you want to work
            on hard problems with people who ship — keep reading.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="p-6 sm:p-10 border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">Our Mission</p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
            Give every Shopify merchant the AI growth team a top-1% brand can afford.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Modern ecommerce optimization is broken. Tools generate reports, not results. Consultants charge thousands for
            PDFs that never ship. We're building the AI-assisted layer that closes the gap — analyzing stores, drafting
            optimizations, executing approved changes safely under merchant supervision, and learning from every outcome.
            The merchants we serve grow faster. The ones who don't get left behind.
          </p>
        </Card>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 pb-16 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">How we work</h2>
          <p className="text-muted-foreground">Our culture, in four principles.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-5 h-full hover:border-primary/40 transition-all">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="container mx-auto px-4 pb-16 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Open roles</h2>
          <p className="text-muted-foreground">Hiring resumes soon.</p>
        </div>
        <Card className="p-8 text-center border-dashed border-border/60 bg-muted/20">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground mb-2">No current openings at the moment</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            We're not actively recruiting today, but we always want to hear from exceptional people. If you'd be a great
            fit, send us your story — we keep a short list.
          </p>
        </Card>
      </section>

      {/* Apply */}
      <section className="container mx-auto px-4 pb-20 max-w-3xl">
        <Card className="p-6 sm:p-8 border-primary/30 bg-primary/[0.04] text-center">
          <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Get in touch</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Tell us what you're great at, what you've shipped, and where you'd add the most value. Short emails preferred.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <a href="mailto:careers@storeauditor.io">
                careers@storeauditor.io <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Learn about Store Auditor</Link>
            </Button>
          </div>
        </Card>
      </section>
    </main>
    <Footer />
  </div>
);

export default Careers;
