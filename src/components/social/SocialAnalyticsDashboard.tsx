import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Eye, MousePointerClick, ShoppingCart, DollarSign, TrendingUp, Shield, Sparkles } from "lucide-react";
import UpgradeTrigger from "@/components/UpgradeTrigger";
import TrackingConnectionGate, { TrackingBanner, useTrackingConnection } from "@/components/TrackingConnectionGate";

const SocialAnalyticsDashboard = () => {
  const { hasTracking, loading } = useTrackingConnection();
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="pt-5 pb-4"><div className="h-16 animate-pulse rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasTracking) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Campaign Analytics
          </h2>
          <p className="text-sm text-muted-foreground">Connect tracking to see real campaign data</p>
        </div>

        <TrackingBanner onConnect={() => setShowTrackingModal(true)} />
        <TrackingConnectionGate open={showTrackingModal} onClose={() => setShowTrackingModal(false)} />

        <Card className="p-12 text-center border-dashed">
          <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">No tracking connected</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Connect your Meta Pixel and/or Google Analytics in My Account → Store Settings to unlock real-time campaign analytics
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Campaign Analytics
        </h2>
        <p className="text-sm text-muted-foreground">Live performance data from your connected tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Impressions", icon: Eye, note: "Awaiting data" },
          { label: "Clicks", icon: MousePointerClick, note: "Awaiting data" },
          { label: "Conversions", icon: ShoppingCart, note: "Awaiting data" },
          { label: "ROAS", icon: DollarSign, note: "Awaiting data" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <Badge variant="outline" className="mt-1 text-[10px]">{kpi.note}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-sm text-muted-foreground">Live analytics data will populate as campaigns are launched and tracking data flows in</p>
          <Badge variant="outline" className="mt-2 text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" /> Tracking Connected
          </Badge>
        </CardContent>
      </Card>

      <UpgradeTrigger variant="analytics-value" className="mt-2" />
    </div>
  );
};

export default SocialAnalyticsDashboard;
