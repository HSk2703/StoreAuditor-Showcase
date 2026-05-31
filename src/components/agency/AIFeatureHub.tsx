import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Bot, Brain, Eye, Zap, TrendingUp, Target, Lightbulb, ChevronRight,
  Sparkles, Users, BarChart3, Shield, Cpu, Workflow,
} from "lucide-react";

const aiFeatures = [
  { id: "simulator", label: "Cognitive Shopper Simulator", icon: Users, color: "from-blue-500 to-cyan-500", route: "/simulator", status: "active", impact: "+15% Conv" },
  { id: "ux-optimizer", label: "UX Auto-Optimizer", icon: Eye, color: "from-violet-500 to-purple-500", route: "/ux-optimizer", status: "active", impact: "+22% UX" },
  { id: "emotional", label: "Emotional Persuasion", icon: Brain, color: "from-pink-500 to-rose-500", route: "/emotional-personalization", status: "active", impact: "+18% Trust" },
  { id: "revenue", label: "Revenue Engine", icon: TrendingUp, color: "from-emerald-500 to-green-500", route: "/revenue-engine", status: "active", impact: "+$2.4K Rev" },
  { id: "digital-twin", label: "AI Digital Twin", icon: Cpu, color: "from-amber-500 to-orange-500", route: "/digital-twin", status: "active", impact: "+12% AOV" },
  { id: "copilot", label: "Kairo AI Assistant", icon: Bot, color: "from-primary to-[hsl(260_70%_55%)]", route: "/dashboard", status: "active", impact: "Always On" },
  { id: "growth-hub", label: "Growth Hub", icon: Sparkles, color: "from-teal-500 to-cyan-500", route: "/growth-hub", status: "active", impact: "+8 Score" },
  { id: "competitor", label: "Competitor Analysis", icon: Shield, color: "from-slate-500 to-zinc-500", route: "/competitor-analysis", status: "active", impact: "Intel" },
];

const recentActions = [
  { action: "Optimized product title for SEO", store: "Demo Store", time: "2h ago", impact: "+12% CTR" },
  { action: "Improved CTA copy on homepage", store: "Fashion Hub", time: "5h ago", impact: "+8% Conv" },
  { action: "Adjusted pricing strategy", store: "Tech Store", time: "1d ago", impact: "+$420 Rev" },
];

const goals = [
  { label: "Increase Conversion Rate", icon: TrendingUp, progress: 68 },
  { label: "Improve UX Score", icon: Shield, progress: 45 },
  { label: "Reduce Bounce Rate", icon: Target, progress: 32 },
];

const recommendations = [
  { title: "Add trust badges to checkout", impact: "High", category: "Trust" },
  { title: "Optimize mobile navigation", impact: "Medium", category: "UX" },
  { title: "Improve product descriptions with AI", impact: "High", category: "Content" },
];

const AIFeatureHub = () => {
  const navigate = useNavigate();
  const [autoPilot, setAutoPilot] = useState(false);

  return (
    <div className="space-y-6">
      {/* Auto-Pilot + Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Auto-Pilot Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(260_70%_55%)]">
                <Workflow className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Auto-Pilot</h3>
                <p className="text-xs text-muted-foreground">{autoPilot ? "Active — monitoring & optimizing" : "Paused"}</p>
              </div>
            </div>
            <Switch checked={autoPilot} onCheckedChange={setAutoPilot} />
          </div>
          {autoPilot && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 pt-3 border-t border-border/50">
              {recentActions.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate text-foreground">{a.action}</span>
                  </div>
                  <span className="text-xs text-success font-medium shrink-0 ml-2">{a.impact}</span>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full gap-1 text-xs" onClick={() => navigate("/auto-pilot")}>
                View All <ChevronRight className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* AI Goals */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-success to-success/70">
                <Target className="h-5 w-5 text-success-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">AI Goals</h3>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/goals")}>Manage</Button>
          </div>
          <div className="space-y-3">
            {goals.map((g, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground flex items-center gap-2"><g.icon className="h-3.5 w-3.5 text-muted-foreground" />{g.label}</span>
                  <span className="text-xs font-medium text-muted-foreground">{g.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Features Grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> AI Growth Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {aiFeatures.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => navigate(feature.route)}
              className="glass-card rounded-xl border p-4 cursor-pointer group hover:border-primary/30 transition-all relative overflow-hidden"
            >
              <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} mb-3`}>
                <feature.icon className="h-4.5 w-4.5 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{feature.label}</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-success font-medium">{feature.impact}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-warning to-warning/70">
            <Lightbulb className="h-5 w-5 text-warning-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">AI Recommendations</h3>
        </div>
        <div className="space-y-2">
          {recommendations.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{r.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{r.category}</span>
                  <span className={`text-[10px] font-medium ${r.impact === "High" ? "text-success" : "text-warning"}`}>{r.impact} Impact</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">Apply</Button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AIFeatureHub;
