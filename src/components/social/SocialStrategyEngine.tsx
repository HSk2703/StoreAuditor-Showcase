import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Target, TrendingUp, DollarSign, Users, Loader2, Sparkles, Facebook, Instagram, Youtube, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CreditCostBadge from "@/components/CreditCostBadge";
import CreditLimitModal from "@/components/CreditLimitModal";
import { useAICredits } from "@/hooks/useAICredits";

interface PlatformStrategy {
  platform: string;
  icon: React.ElementType;
  audience: string;
  goals: string[];
  contentDirection: string;
  budgetPercent: number;
  budgetAmount: number;
}

const SocialStrategyEngine = () => {
  const { user } = useAuth();
  const { checkAndDeduct, canAfford } = useAICredits();
  const [storeUrl, setStoreUrl] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("sales");
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<PlatformStrategy[] | null>(null);
  const [summary, setSummary] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);

  const generateStrategy = async () => {
    if (!storeUrl) { toast.error("Please enter your store URL"); return; }

    const creditResult = await checkAndDeduct("social_strategy");
    if (!creditResult.allowed) { setShowLimitModal(true); return; }

    setLoading(true);
    try {
      if (!user) throw new Error("No auth session");
      const { data, error } = await supabase.functions.invoke("generate-social-strategy", {
        body: { storeUrl, monthlyBudget: Number(monthlyBudget) || 1000, niche, goal },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setStrategies(data.strategies);
      setSummary(data.summary);
      toast.success("Strategy generated successfully");
    } catch (err: any) {
      console.error("Strategy generation error:", err);
      toast.error("Failed to generate strategy");
      // Fallback mock
      const budget = Number(monthlyBudget) || 1000;
      setStrategies([
        { platform: "Facebook", icon: Facebook, audience: "25-45 year old shoppers interested in " + (niche || "your niche"), goals: ["Brand Awareness", "Website Traffic", "Conversions"], contentDirection: "Product showcases, testimonials, value-driven carousel ads", budgetPercent: 35, budgetAmount: Math.round(budget * 0.35) },
        { platform: "Instagram", icon: Instagram, audience: "18-35 visual-first shoppers, lifestyle seekers", goals: ["Engagement", "Story Views", "Shopping"], contentDirection: "Reels, UGC-style posts, behind-the-scenes stories, product lifestyle shots", budgetPercent: 30, budgetAmount: Math.round(budget * 0.30) },
        { platform: "TikTok", icon: Youtube, audience: "18-30 trend-driven discovery shoppers", goals: ["Reach", "Video Views", "Conversions"], contentDirection: "Hook-driven short videos, trending sounds, problem-solution format", budgetPercent: 20, budgetAmount: Math.round(budget * 0.20) },
        { platform: "Google Ads", icon: Globe, audience: "High-intent search traffic for " + (niche || "your products"), goals: ["Search Conversions", "Shopping Ads", "Retargeting"], contentDirection: "Search ads, Shopping campaigns, Display retargeting for cart abandoners", budgetPercent: 15, budgetAmount: Math.round(budget * 0.15) },
      ]);
      setSummary(`Based on your ${niche || "e-commerce"} store, we recommend a multi-platform approach focusing on ${goal === "sales" ? "conversion-driven campaigns" : goal === "awareness" ? "reach and brand visibility" : "engagement and community building"}. Your $${budget}/mo budget is allocated to maximize ROAS across channels.`);
    } finally {
      setLoading(false);
    }
  };

  const platformIcons: Record<string, React.ElementType> = { Facebook, Instagram, TikTok: Youtube, "Google Ads": Globe };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Marketing Strategy Engine
          </CardTitle>
          <CardDescription>Generate personalized strategies based on your store data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input placeholder="Store URL" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
            <Input placeholder="Monthly Budget ($)" type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} />
            <Input placeholder="Niche / Industry" value={niche} onChange={(e) => setNiche(e.target.value)} />
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Drive Sales</SelectItem>
                <SelectItem value="awareness">Brand Awareness</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="traffic">Website Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={generateStrategy} disabled={loading || !canAfford("social_strategy")} className="w-full sm:w-auto">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating Strategy...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Strategy</>}
            </Button>
            <CreditCostBadge feature="social_strategy" />
          </div>
          <CreditLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />
        </CardContent>
      </Card>

      {/* Results */}
      {strategies && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">AI Strategy Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocation Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" /> AI Budget Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-3">
                {strategies.map((s, i) => {
                  const colors = ["bg-blue-500", "bg-pink-500", "bg-violet-500", "bg-emerald-500"];
                  return (
                    <div key={s.platform} className={`${colors[i]} flex items-center justify-center text-xs font-bold text-white`} style={{ width: `${s.budgetPercent}%` }}>
                      {s.budgetPercent}%
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                {strategies.map((s, i) => {
                  const colors = ["text-blue-500", "text-pink-500", "text-violet-500", "text-emerald-500"];
                  const dots = ["bg-blue-500", "bg-pink-500", "bg-violet-500", "bg-emerald-500"];
                  return (
                    <div key={s.platform} className="flex items-center gap-1.5 text-sm">
                      <div className={`h-2.5 w-2.5 rounded-full ${dots[i]}`} />
                      <span className="text-muted-foreground">{s.platform}</span>
                      <span className="font-semibold text-foreground">${s.budgetAmount}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((s, i) => {
              const Icon = platformIcons[s.platform] || Globe;
              const borderColors = ["border-blue-500/30", "border-pink-500/30", "border-violet-500/30", "border-emerald-500/30"];
              const bgColors = ["bg-blue-500/5", "bg-pink-500/5", "bg-violet-500/5", "bg-emerald-500/5"];
              return (
                <motion.div key={s.platform} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className={`${borderColors[i]} ${bgColors[i]}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon className="h-4 w-4" /> {s.platform}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">${s.budgetAmount}/mo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          <Users className="h-3 w-3 inline mr-1" /> Target Audience
                        </p>
                        <p className="text-sm text-foreground">{s.audience}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          <Target className="h-3 w-3 inline mr-1" /> Campaign Goals
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {s.goals.map((g) => <Badge key={g} variant="outline" className="text-xs">{g}</Badge>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          <TrendingUp className="h-3 w-3 inline mr-1" /> Content Direction
                        </p>
                        <p className="text-sm text-foreground">{s.contentDirection}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SocialStrategyEngine;
