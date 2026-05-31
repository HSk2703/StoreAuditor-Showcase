import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Rocket, Plus, Calendar, DollarSign, Target, Users,
  Zap, CheckCircle2, Clock, AlertTriangle, Facebook, Instagram, Youtube, Globe
} from "lucide-react";
import { toast } from "sonner";
import UpgradeTrigger from "@/components/UpgradeTrigger";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: "draft" | "ready" | "launched";
  budget: number;
  targeting: string;
  objective: string;
  creative: string;
  startDate: string;
}

const SocialCampaignBuilder = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", platform: "facebook", budget: "500", targeting: "", objective: "conversions", creative: "", startDate: "" });
  const [autoOptimize, setAutoOptimize] = useState(true);

  const platformIcons: Record<string, React.ElementType> = { facebook: Facebook, instagram: Instagram, tiktok: Youtube, google: Globe };
  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    draft: { color: "text-muted-foreground", icon: Clock },
    ready: { color: "text-amber-500", icon: AlertTriangle },
    launched: { color: "text-green-500", icon: CheckCircle2 },
  };

  const addCampaign = () => {
    if (!form.name) { toast.error("Enter a campaign name"); return; }
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      name: form.name,
      platform: form.platform,
      status: "draft",
      budget: Number(form.budget) || 500,
      targeting: form.targeting || "Broad audience — AI will optimize",
      objective: form.objective,
      creative: form.creative || "AI-generated creative pending",
      startDate: form.startDate || new Date().toISOString().split("T")[0],
    };
    setCampaigns((prev) => [...prev, newCampaign]);
    setForm({ name: "", platform: "facebook", budget: "500", targeting: "", objective: "conversions", creative: "", startDate: "" });
    setShowForm(false);
    toast.success("Campaign created");
  };

  const launchCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "launched" as const } : c));
    toast.success("Campaign launched (simulated) — connect ad accounts for live execution");
  };

  const markReady = (id: string) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "ready" as const } : c));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" /> Campaign Builder
          </h2>
          <p className="text-sm text-muted-foreground">Create, configure, and launch ad campaigns</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="auto-opt" checked={autoOptimize} onCheckedChange={setAutoOptimize} />
            <Label htmlFor="auto-opt" className="text-sm">Auto Optimize</Label>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      {/* New Campaign Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input placeholder="Campaign Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Budget ($)" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                <Select value={form.objective} onValueChange={(v) => setForm({ ...form, objective: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversions">Conversions</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                <Input placeholder="Targeting (optional)" value={form.targeting} onChange={(e) => setForm({ ...form, targeting: e.target.value })} />
              </div>
              <Textarea placeholder="Creative brief (optional)" value={form.creative} onChange={(e) => setForm({ ...form, creative: e.target.value })} rows={2} />
            </CardContent>
            <CardFooter className="gap-2">
              <Button onClick={addCampaign}>Create Campaign</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 && !showForm ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Rocket className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No campaigns yet — create your first one</p>
            <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c, i) => {
            const PlatformIcon = platformIcons[c.platform] || Globe;
            const StatusIcon = statusConfig[c.status]?.icon || Clock;
            const statusColor = statusConfig[c.status]?.color || "text-muted-foreground";
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <PlatformIcon className="h-4 w-4" /> {c.name}
                      </CardTitle>
                      <Badge variant={c.status === "launched" ? "default" : "secondary"} className="capitalize gap-1">
                        <StatusIcon className={`h-3 w-3 ${statusColor}`} /> {c.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" /> Budget: <span className="text-foreground font-medium">${c.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-3.5 w-3.5" /> Objective: <span className="text-foreground font-medium capitalize">{c.objective}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> <span className="text-foreground">{c.targeting}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> Start: <span className="text-foreground">{c.startDate}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    {c.status === "draft" && <Button size="sm" variant="outline" onClick={() => markReady(c.id)}>Mark Ready</Button>}
                    {c.status === "ready" && (
                      <Button size="sm" className="gap-1" onClick={() => launchCampaign(c.id)}>
                        <Zap className="h-3.5 w-3.5" /> 1-Click Launch
                      </Button>
                    )}
                    {c.status === "launched" && <Badge variant="outline" className="text-green-500 border-green-500/30">Live</Badge>}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Campaign Launch Upgrade Trigger */}
      <UpgradeTrigger variant="campaign-launch" className="mt-2" />
    </div>
  );
};

export default SocialCampaignBuilder;
