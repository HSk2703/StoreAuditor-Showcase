import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, CheckCircle2, XCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationStat {
  provider: string;
  connected_count: number;
}

const allIntegrations = [
  { name: "Google Analytics", provider: "google_analytics", category: "Analytics", logo: "https://www.google.com/s2/favicons?domain=analytics.google.com&sz=64" },
  { name: "Hotjar", provider: "hotjar", category: "Analytics", logo: "https://www.google.com/s2/favicons?domain=hotjar.com&sz=64", ai: true },
  { name: "Mixpanel", provider: "mixpanel", category: "Analytics", logo: "https://www.google.com/s2/favicons?domain=mixpanel.com&sz=64" },
  { name: "PostHog", provider: "posthog", category: "Analytics", logo: "https://www.google.com/s2/favicons?domain=posthog.com&sz=64", ai: true },
  { name: "Amplitude", provider: "amplitude", category: "Analytics", logo: "https://www.google.com/s2/favicons?domain=amplitude.com&sz=64", ai: true },
  { name: "Google Ads", provider: "google_ads", category: "Advertising", logo: "https://www.google.com/s2/favicons?domain=ads.google.com&sz=64" },
  { name: "Meta Ads", provider: "meta_ads", category: "Advertising", logo: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64" },
  { name: "TikTok Ads", provider: "tiktok_ads", category: "Advertising", logo: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=64" },
  { name: "Shopify", provider: "shopify", category: "Ecommerce", logo: "https://www.google.com/s2/favicons?domain=shopify.com&sz=64" },
  { name: "Replo", provider: "replo", category: "Ecommerce", logo: "https://www.google.com/s2/favicons?domain=replo.app&sz=64", ai: true },
  { name: "Gorgias", provider: "gorgias", category: "Ecommerce", logo: "https://www.google.com/s2/favicons?domain=gorgias.com&sz=64", ai: true },
  { name: "Klaviyo", provider: "klaviyo", category: "Email & SMS", logo: "https://www.google.com/s2/favicons?domain=klaviyo.com&sz=64", ai: true },
  { name: "Omnisend", provider: "omnisend", category: "Email & SMS", logo: "https://www.google.com/s2/favicons?domain=omnisend.com&sz=64" },
  { name: "ChatGPT API", provider: "chatgpt", category: "AI Tools", logo: "https://www.google.com/s2/favicons?domain=openai.com&sz=64", ai: true },
  { name: "Canva", provider: "canva", category: "Design", logo: "https://www.google.com/s2/favicons?domain=canva.com&sz=64", ai: true },
  { name: "Jitter", provider: "jitter", category: "Design", logo: "https://www.google.com/s2/favicons?domain=jitter.video&sz=64" },
  { name: "Figma", provider: "figma", category: "Design", logo: "https://www.google.com/s2/favicons?domain=figma.com&sz=64" },
  { name: "n8n", provider: "n8n", category: "Automation", logo: "https://www.google.com/s2/favicons?domain=n8n.io&sz=64", ai: true },
  { name: "Zapier", provider: "zapier", category: "Automation", logo: "https://www.google.com/s2/favicons?domain=zapier.com&sz=64" },
  { name: "Make", provider: "make", category: "Automation", logo: "https://www.google.com/s2/favicons?domain=make.com&sz=64" },
  { name: "HubSpot", provider: "hubspot", category: "CRM", logo: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=64" },
  { name: "Linear", provider: "linear", category: "CRM", logo: "https://www.google.com/s2/favicons?domain=linear.app&sz=64" },
  { name: "Stripe", provider: "stripe", category: "Payments", logo: "https://www.google.com/s2/favicons?domain=stripe.com&sz=64" },
  { name: "Slack", provider: "slack", category: "Communication", logo: "https://www.google.com/s2/favicons?domain=slack.com&sz=64" },
  { name: "Telegram", provider: "telegram", category: "Communication", logo: "https://www.google.com/s2/favicons?domain=telegram.org&sz=64" },
];

const AdminIntegrations = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("user_integrations")
      .select("provider, status")
      .eq("status", "connected")
      .then(({ data }) => {
        const map: Record<string, number> = {};
        (data as any[] || []).forEach((r) => {
          map[r.provider] = (map[r.provider] || 0) + 1;
        });
        setStats(map);
        setLoading(false);
      });
  }, []);

  const totalConnections = Object.values(stats).reduce((a, b) => a + b, 0);
  const activeProviders = Object.keys(stats).length;

  const filtered = allIntegrations.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Tools & Integrations</h1>
      <p className="text-sm text-muted-foreground mb-6">Monitor user-connected integrations across the platform.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{allIntegrations.length}</p>
            <p className="text-xs text-muted-foreground">Available Tools</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{loading ? "…" : totalConnections}</p>
            <p className="text-xs text-muted-foreground">Total Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{loading ? "…" : activeProviders}</p>
            <p className="text-xs text-muted-foreground">Active Providers</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => {
          const count = stats[i.provider] || 0;
          return (
            <Card key={i.provider} className={count > 0 ? "border-success/30" : ""}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border">
                  <img src={i.logo} alt={i.name} className="h-6 w-6 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CardTitle className="text-sm">{i.name}</CardTitle>
                    {i.ai && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/30 text-primary gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{i.category}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {loading ? "…" : `${count} connection${count !== 1 ? "s" : ""}`}
                </div>
                {count > 0 ? (
                  <Badge variant="outline" className="text-[10px] border-success/30 text-success gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <XCircle className="h-3 w-3" /> No connections
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminIntegrations;
