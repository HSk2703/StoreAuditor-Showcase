import { useEffect, useState } from "react";
import { Brain, TrendingUp, Shield, Palette, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFounderProfile } from "@/lib/decision-tracking";
import { supabase } from "@/integrations/supabase/client";

const preferenceIcons: Record<string, React.ReactNode> = {
  tone_preference: <Target className="h-3.5 w-3.5" />,
  design_preference: <Palette className="h-3.5 w-3.5" />,
  strategy_bias: <TrendingUp className="h-3.5 w-3.5" />,
  risk_level: <Shield className="h-3.5 w-3.5" />,
};

export default function FounderProfileWidget() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const p = await getFounderProfile(user.id);
      if (p) setProfile(p);
    })();
  }, []);

  if (!profile) return null;

  const total = profile.total_accepts + profile.total_rejects + profile.total_edits + profile.total_ignores;
  if (total < 3) return null; // Not enough data yet

  const acceptRate = total > 0 ? Math.round((profile.total_accepts / total) * 100) : 0;

  const preferences = [
    { key: "tone_preference", label: "Tone", value: profile.tone_preference },
    { key: "design_preference", label: "Design", value: profile.design_preference },
    { key: "strategy_bias", label: "Strategy", value: profile.strategy_bias },
    { key: "risk_level", label: "Risk Level", value: profile.risk_level },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Your AI Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {preferences.map((p) => (
            <div key={p.key} className="flex items-center gap-1.5 text-xs">
              {preferenceIcons[p.key]}
              <span className="text-muted-foreground">{p.label}:</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                {p.value}
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>{total} AI interactions tracked</span>
          <span>{acceptRate}% acceptance rate</span>
        </div>
        {profile.top_features?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.top_features.slice(0, 3).map((f: string) => (
              <Badge key={f} variant="outline" className="text-[10px] capitalize">
                {f.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
