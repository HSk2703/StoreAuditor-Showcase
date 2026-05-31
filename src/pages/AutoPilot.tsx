import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Brain, BarChart3, CheckCircle, ArrowRight, Rocket, Target, TrendingUp, Lock, Play, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthProvider";
import { AI_NAME } from "@/lib/kairo-identity";
import { toast } from "@/hooks/use-toast";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { icon: Brain, title: `${AI_NAME} Analyzes`, description: "AI scans your store data, audit scores, and user behavior patterns", color: "from-blue-500 to-cyan-500" },
  { icon: Target, title: "Actions Prepared", description: "High-impact improvements are identified and queued for your approval", color: "from-violet-500 to-purple-500" },
  { icon: Shield, title: "You Approve", description: "Review each action with full preview before anything is applied", color: "from-amber-500 to-orange-500" },
  { icon: Rocket, title: "Auto-Applied", description: "Changes are safely executed on your store with rollback capability", color: "from-emerald-500 to-green-500" },
];

const bestPractices = [
  { title: "Start with Content Updates", description: "Begin by approving headline and CTA text changes — lowest risk, highest impact", icon: BookOpen },
  { title: "Review Before Peak Hours", description: "Apply changes during low-traffic periods so you can monitor impact safely", icon: BarChart3 },
  { title: "Use Batch Approvals", description: "Let actions accumulate and review them together for a holistic view", icon: CheckCircle },
  { title: "Monitor Performance", description: "Track conversion changes after each batch to understand what works", icon: TrendingUp },
];

export default function AutoPilot() {
  const { user, isAdmin } = useAuth();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal, requireConnection } = useStoreConnection();
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(false);
  const [performanceStats, setPerformanceStats] = useState([
    { label: "Actions Executed", value: "—" },
    { label: "Avg Conversion Uplift", value: "—" },
    { label: "Revenue Impact", value: "—" },
    { label: "Actions Rolled Back", value: "—" },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) { setLoadingStats(false); return; }
    (async () => {
      try {
        const { data: actions } = await supabase
          .from("ai_actions")
          .select("status, rolled_back_at, result_summary")
          .eq("user_id", user.id) as any;

        const list = actions || [];
        const executed = list.filter((a: any) => a.status === "completed").length;
        const rolledBack = list.filter((a: any) => a.rolled_back_at).length;

        setPerformanceStats([
          { label: "Actions Executed", value: String(executed) },
          { label: "Avg Conversion Uplift", value: executed > 0 ? "Tracked" : "—" },
          { label: "Revenue Impact", value: executed > 0 ? "Tracked" : "—" },
          { label: "Actions Rolled Back", value: String(rolledBack) },
        ]);
      } catch (e) {
        console.error("Failed to load autopilot stats:", e);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [user]);

  const handleToggle = (val: boolean) => {
    if (!requireConnection()) return;
    setAutoPilotEnabled(val);
    toast({
      title: val ? "Auto-Pilot Enabled (Beta)" : "Auto-Pilot Disabled",
      description: val
        ? `${AI_NAME} will prepare optimization batches for your approval`
        : "Switched to manual mode — use the Co-Pilot for suggestions",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Zap className="h-4 w-4" /> Beta
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {AI_NAME} Auto-Pilot
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let {AI_NAME} continuously optimize your store with AI-prepared actions — you stay in control with approval-based execution
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm px-6 py-4 shadow-lg">
              <Switch
                checked={autoPilotEnabled}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-primary"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {autoPilotEnabled ? "Auto-Pilot Active" : "Enable Auto-Pilot"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {autoPilotEnabled ? `${AI_NAME} is preparing optimization batches` : "AI will prepare actions for batch approval"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Connection Gate */}
        {!hasConnectedStore && (
          <StoreConnectionBanner onConnect={() => setShowConnectionModal(true)} />
        )}
        <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />

        {/* Tabs */}
        <Tabs defaultValue="how-it-works" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl mx-auto">
            <TabsTrigger value="how-it-works" className="text-xs sm:text-sm">How It Works</TabsTrigger>
            <TabsTrigger value="guides" className="text-xs sm:text-sm">Guides</TabsTrigger>
            <TabsTrigger value="best-practices" className="text-xs sm:text-sm">Best Practices</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
          </TabsList>

          {/* How It Works */}
          <TabsContent value="how-it-works">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-border/30 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6 text-center space-y-3">
                      <div className={`inline-flex h-12 w-12 rounded-xl bg-gradient-to-br ${step.color} items-center justify-center text-white mx-auto`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div className="text-xs font-bold text-muted-foreground">STEP {i + 1}</div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Safety features */}
            <Card className="mt-8 border-border/30 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-primary" /> Safety & Trust
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { title: "No Action Without Approval", desc: `${AI_NAME} never modifies your store without explicit confirmation` },
                    { title: "Full Change Preview", desc: "See exactly what will change before you approve any action" },
                    { title: "Undo & Rollback", desc: "Every action can be reversed — your store is always safe" },
                  ].map((f) => (
                    <div key={f.title} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guides */}
          <TabsContent value="guides">
            <div className="space-y-6">
              {[
                {
                  title: "Getting Started with Auto-Pilot",
                  steps: [
                    "Run a Store Audit to give Kairo baseline data",
                    "Open the Co-Pilot and ask 'What should I optimize?'",
                    "Review suggested actions in the Action Cards",
                    "Click 'Apply' on actions you approve",
                    "Enable Auto-Pilot to get batch suggestions automatically",
                  ],
                },
                {
                  title: "Using Actions via Co-Pilot",
                  steps: [
                    "Say 'Improve my homepage' in the Co-Pilot chat",
                    "Kairo will analyze and prepare specific changes",
                    "Each change appears as an Action Card with preview",
                    "Approve individually or batch-approve all",
                    "Track results in the Performance tab",
                  ],
                },
              ].map((guide) => (
                <Card key={guide.title} className="border-border/30 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Play className="h-4 w-4 text-primary" /> {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm text-muted-foreground pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Best Practices */}
          <TabsContent value="best-practices">
            <div className="grid sm:grid-cols-2 gap-4">
              {bestPractices.map((bp, i) => (
                <motion.div
                  key={bp.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="h-full border-border/30 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <CardContent className="pt-6 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <bp.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{bp.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{bp.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceStats.map((metric) => (
                <Card key={metric.label} className="border-border/30 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    {loadingStats ? (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/30 border border-border/30 text-muted-foreground">
                <BarChart3 className="h-5 w-5" />
                <p className="text-sm">Performance data will appear here as you use Auto-Pilot actions</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
