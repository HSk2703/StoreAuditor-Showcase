import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, Users, BarChart3, FileText, Shield, Eye, ClipboardList, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthProvider";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const features = [
  { icon: Users, title: "Multi-Client Management", desc: "Add and manage unlimited Shopify stores for all your clients from one dashboard." },
  { icon: BarChart3, title: "Automated Audits", desc: "Run AI-powered store audits for each client with scheduled re-audits and monitoring." },
  { icon: FileText, title: "White-Label Reports", desc: "Generate branded PDF reports with your agency logo, colors, and custom messaging." },
  { icon: Eye, title: "Real-Time Monitoring", desc: "Track score changes, detect issues, and get alerts when client stores degrade." },
  { icon: ClipboardList, title: "Task Manager", desc: "Assign tasks from audit findings with Kanban board and team collaboration." },
  { icon: Shield, title: "Client Portal", desc: "Give clients read-only access to their reports and improvement tracking." },
];

const AgencyLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="container max-w-4xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">For Shopify Agencies</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
              Scale Your Agency with <span className="text-primary">AI-Powered</span> Store Audits
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Manage all your clients' Shopify stores, run automated audits, deliver white-label reports, and track improvements — all from one platform.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {user ? (
                <Button size="lg" className="gap-2" onClick={() => navigate("/agency")}>
                  Go to Agency Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button size="lg" className="gap-2 text-base px-8 py-6 shadow-lg" onClick={() => navigate("/agency/signup")}>
                    🚀 Signup Today (It's Free!) <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
                View Pricing
              </Button>
            </div>
            {!user && (
              <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
                Manage stores, track performance, and unlock AI-driven revenue growth
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container max-w-6xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Everything your agency needs</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Built for Shopify agencies that want to deliver more value to clients with less manual work.</p>
          </motion.div>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "50+", label: "Conversion Checks" },
              { value: "10x", label: "Faster Audits" },
              { value: "100%", label: "White-Label" },
              { value: "24/7", label: "Store Monitoring" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="container max-w-2xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Ready to grow your agency?</h2>
            <p className="text-muted-foreground mb-4">Join agencies already using Store Auditor to deliver data-driven optimization for their clients.</p>
            {user ? (
              <Button size="lg" className="gap-2" onClick={() => navigate("/agency")}>
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="gap-2 text-base px-8 py-6 shadow-lg" onClick={() => navigate("/agency/signup")}>
                    🚀 Signup Today (It's Free!) <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
                <p className="text-sm text-muted-foreground mt-3">
                  Manage stores, track performance, and unlock AI-driven revenue growth
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AgencyLanding;
