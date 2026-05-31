import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SubApp {
  id: string;
  user_id: string;
  plan_selected: string;
  user_type: string;
  status: string;
  created_at: string;
}

const AdminSubscribers = () => {
  const [apps, setApps] = useState<SubApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("subscription_applications").select("*").order("created_at", { ascending: false });
      setApps(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const completed = apps.filter((a) => a.status === "completed").length;
  const pending = apps.filter((a) => a.status === "pending_payment").length;
  const initiated = apps.filter((a) => a.status === "initiated").length;

  const planPrices: Record<string, number> = { free: 0, starter: 15, pro: 30, agency: 99 };
  const revenue = apps
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (planPrices[a.plan_selected] || 0), 0);

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "default";
      case "pending_payment": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Subscribers & Financials</h1>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        {[
          { label: "Total Revenue (est.)", value: `$${revenue}/mo` },
          { label: "Completed", value: completed },
          { label: "Pending Payment", value: pending },
          { label: "Initiated", value: initiated },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-foreground">{loading ? "…" : c.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : apps.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No subscriptions yet.</TableCell></TableRow>
            ) : (
              apps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.user_id.slice(0, 8)}…</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{a.user_type}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{a.plan_selected}</Badge></TableCell>
                  <TableCell><Badge variant={statusColor(a.status) as any} className="capitalize">{a.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSubscribers;
