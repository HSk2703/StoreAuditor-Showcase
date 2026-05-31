import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Search, Activity, TrendingUp, Users, BarChart3, ThumbsUp, ThumbsDown, Pencil, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FounderProfile {
  id: string;
  user_id: string;
  tone_preference: string;
  design_preference: string;
  strategy_bias: string;
  risk_level: string;
  top_features: string[];
  total_accepts: number;
  total_rejects: number;
  total_edits: number;
  total_ignores: number;
  cumulative_score: number;
  last_updated_at: string;
  created_at: string;
}

interface DecisionEvent {
  id: string;
  user_id: string;
  feature_name: string;
  suggestion_id: string;
  action_type: string;
  confidence_weight: number;
  created_at: string;
}

interface FeatureStats {
  feature: string;
  total: number;
  accepts: number;
  rejects: number;
  edits: number;
  ignores: number;
  score: number;
}

const AdminBehavioralAnalytics = () => {
  const [profiles, setProfiles] = useState<FounderProfile[]>([]);
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [featureStats, setFeatureStats] = useState<FeatureStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [profilesRes, eventsRes] = await Promise.all([
      supabase.from("founder_profiles" as any).select("*").order("last_updated_at", { ascending: false }),
      supabase.from("ai_decision_events" as any).select("*").order("created_at", { ascending: false }).limit(500),
    ]);

    const p = (profilesRes.data ?? []) as unknown as FounderProfile[];
    const e = (eventsRes.data ?? []) as unknown as DecisionEvent[];
    setProfiles(p);
    setEvents(e);

    // Compute feature stats
    const statsMap: Record<string, FeatureStats> = {};
    e.forEach((ev) => {
      if (!statsMap[ev.feature_name]) {
        statsMap[ev.feature_name] = { feature: ev.feature_name, total: 0, accepts: 0, rejects: 0, edits: 0, ignores: 0, score: 0 };
      }
      const s = statsMap[ev.feature_name];
      s.total++;
      s.score += ev.confidence_weight;
      if (ev.action_type === "accepted") s.accepts++;
      if (ev.action_type === "rejected") s.rejects++;
      if (ev.action_type === "edited") s.edits++;
      if (ev.action_type === "ignored") s.ignores++;
    });
    setFeatureStats(Object.values(statsMap).sort((a, b) => b.total - a.total));
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(
    (p) => p.user_id.includes(searchTerm) || p.tone_preference.includes(searchTerm) || p.risk_level.includes(searchTerm)
  );

  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map((e) => e.user_id)).size;
  const acceptRate = totalEvents > 0 ? Math.round((events.filter((e) => e.action_type === "accepted").length / totalEvents) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Behavioral Analytics
        </h1>
        <p className="text-sm text-muted-foreground">Track how users interact with AI suggestions across all features</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<Activity className="h-4 w-4" />} label="Total Events" value={totalEvents.toLocaleString()} />
        <SummaryCard icon={<Users className="h-4 w-4" />} label="Active Users" value={String(uniqueUsers)} />
        <SummaryCard icon={<ThumbsUp className="h-4 w-4" />} label="Accept Rate" value={`${acceptRate}%`} />
        <SummaryCard icon={<Brain className="h-4 w-4" />} label="User Profiles" value={String(profiles.length)} />
      </div>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profiles" className="gap-1.5"><Brain className="h-3.5 w-3.5" /> User Profiles</TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Feature Stats</TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by user ID or preference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>

          {filteredProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No founder profiles yet. Profiles are generated after users interact with AI suggestions.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="border-border">
                  <CardContent className="pt-4 pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <code className="text-[10px] text-muted-foreground truncate max-w-[180px]">{profile.user_id}</code>
                      <Badge variant="outline" className="text-[10px]">Score: {profile.cumulative_score}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <PreferenceItem label="Tone" value={profile.tone_preference} />
                      <PreferenceItem label="Design" value={profile.design_preference} />
                      <PreferenceItem label="Strategy" value={profile.strategy_bias} />
                      <PreferenceItem label="Risk" value={profile.risk_level} />
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground border-t border-border pt-2">
                      <span className="flex items-center gap-1"><ThumbsUp className="h-2.5 w-2.5 text-emerald-500" />{profile.total_accepts}</span>
                      <span className="flex items-center gap-1"><ThumbsDown className="h-2.5 w-2.5 text-destructive" />{profile.total_rejects}</span>
                      <span className="flex items-center gap-1"><Pencil className="h-2.5 w-2.5 text-primary" />{profile.total_edits}</span>
                      <span className="flex items-center gap-1"><Eye className="h-2.5 w-2.5" />{profile.total_ignores} ignored</span>
                    </div>
                    {profile.top_features?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.top_features.slice(0, 4).map((f) => (
                          <Badge key={f} variant="secondary" className="text-[9px] capitalize">{f.replace(/_/g, " ")}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="features">
          {featureStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No feature interaction data yet.</p>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Accepts</TableHead>
                    <TableHead className="text-right">Rejects</TableHead>
                    <TableHead className="text-right">Edits</TableHead>
                    <TableHead className="text-right">Ignores</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureStats.map((s) => (
                    <TableRow key={s.feature}>
                      <TableCell className="font-medium capitalize">{s.feature.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-right">{s.total}</TableCell>
                      <TableCell className="text-right text-emerald-600">{s.accepts}</TableCell>
                      <TableCell className="text-right text-destructive">{s.rejects}</TableCell>
                      <TableCell className="text-right text-primary">{s.edits}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{s.ignores}</TableCell>
                      <TableCell className="text-right font-semibold">{s.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No decision events tracked yet.</p>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Suggestion</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 100).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell><code className="text-[10px]">{e.user_id.slice(0, 8)}…</code></TableCell>
                      <TableCell className="capitalize text-sm">{e.feature_name.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.suggestion_id}</TableCell>
                      <TableCell><ActionBadge action={e.action_type} /></TableCell>
                      <TableCell className="text-right font-mono text-xs">{e.confidence_weight > 0 ? "+" : ""}{e.confidence_weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <p className="text-lg font-bold text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PreferenceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">{value}</Badge>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    edited: "bg-primary/10 text-primary border-primary/20",
    viewed: "bg-muted text-muted-foreground border-border",
    ignored: "bg-muted text-muted-foreground border-border",
    clicked: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  return <Badge variant="outline" className={`text-[10px] capitalize ${styles[action] || ""}`}>{action}</Badge>;
}

export default AdminBehavioralAnalytics;
