import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, BarChart3, ClipboardList, TrendingUp } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgencies: 0,
    totalSubscriptions: 0,
    totalAudits: 0,
    pendingApplications: 0,
    activeSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const [profiles, agencies, subscriptions, audits, applications] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("agencies").select("id", { count: "exact", head: true }),
      supabase.from("subscription_applications").select("id", { count: "exact", head: true }),
      supabase.from("store_audits").select("id", { count: "exact", head: true }),
      supabase.from("subscription_applications").select("id", { count: "exact", head: true }).eq("status", "pending_payment"),
    ]);
    setStats({
      totalUsers: profiles.count || 0,
      totalAgencies: agencies.count || 0,
      totalSubscriptions: subscriptions.count || 0,
      totalAudits: audits.count || 0,
      pendingApplications: applications.count || 0,
      activeSubscribers: (subscriptions.count || 0) - (applications.count || 0),
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();

    // Poll for updates every 15 seconds (realtime removed for security)
    const interval = setInterval(() => fetchStats(), 15000);

    return () => { clearInterval(interval); };
  }, []);

  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { title: "Total Agencies", value: stats.totalAgencies, icon: Building2, color: "text-emerald-500" },
    { title: "Subscriptions", value: stats.totalSubscriptions, icon: CreditCard, color: "text-amber-500" },
    { title: "Total Audits", value: stats.totalAudits, icon: BarChart3, color: "text-violet-500" },
    { title: "Pending Payments", value: stats.pendingApplications, icon: ClipboardList, color: "text-orange-500" },
    { title: "Active Subscribers", value: stats.activeSubscribers, icon: TrendingUp, color: "text-teal-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : c.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
