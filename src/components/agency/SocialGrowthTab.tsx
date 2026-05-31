import { motion } from "framer-motion";
import { Instagram, Facebook, Share2, BarChart3, PenTool, Calendar, Sparkles, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const platforms = [
  { name: "Instagram", icon: Instagram },
  { name: "Facebook", icon: Facebook },
  { name: "TikTok", icon: Share2 },
];

const previewMetrics = [
  { label: "Followers", icon: Sparkles },
  { label: "Engagement rate", icon: BarChart3 },
  { label: "Top post reach", icon: Calendar },
];

const SocialGrowthTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Connected Platforms — empty state, no fake metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {platforms.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl border p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <p.icon className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs h-7 mt-1" onClick={() => navigate("/social-media")}>
              <Plug className="h-3 w-3 mr-1.5" /> Connect
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Preview of metrics that will appear once connected */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl border p-5"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Live performance preview</h3>
              <p className="text-[11px] text-muted-foreground">Connect your accounts to start tracking real metrics</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {previewMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center"
            >
              <div className="h-8 w-8 rounded-lg bg-background mx-auto mb-2 flex items-center justify-center">
                <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground">{m.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting connection</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions — link to real Social Media Hub */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="glass-card rounded-xl border p-5"
      >
        <h3 className="font-semibold text-foreground mb-4">Quick actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate("/social-media")}>
            <PenTool className="h-4 w-4 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">Generate post</p>
              <p className="text-[10px] text-muted-foreground">AI content creation</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate("/social-media")}>
            <Calendar className="h-4 w-4 text-warning" />
            <div className="text-left">
              <p className="text-sm font-medium">Schedule content</p>
              <p className="text-[10px] text-muted-foreground">Plan calendar</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate("/social-media")}>
            <BarChart3 className="h-4 w-4 text-success" />
            <div className="text-left">
              <p className="text-sm font-medium">Open analytics</p>
              <p className="text-[10px] text-muted-foreground">Track performance</p>
            </div>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialGrowthTab;
