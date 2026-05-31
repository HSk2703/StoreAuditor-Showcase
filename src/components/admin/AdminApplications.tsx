import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { logAdminAction } from "@/lib/admin-audit";

interface SubApp {
  id: string;
  user_id: string;
  plan_selected: string;
  user_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminApplications = () => {
  const [apps, setApps] = useState<SubApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchApps = async () => {
    setLoading(true);
    let q = supabase.from("subscription_applications").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("subscription_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      void logAdminAction("subscription_application.update_status", "subscription_application", id, { status });
      toast({ title: "Status updated" });
      fetchApps();
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "default";
      case "pending_payment": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Applications Tracking</h1>
      <p className="text-sm text-muted-foreground mb-6">Track user upgrade stages: Initiated → Pending Payment → Completed</p>

      <div className="flex gap-2 mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="initiated">Initiated</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : apps.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications found.</TableCell></TableRow>
            ) : (
              apps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.user_id.slice(0, 8)}…</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{a.user_type}</Badge></TableCell>
                  <TableCell className="capitalize font-medium">{a.plan_selected}</TableCell>
                  <TableCell><Badge variant={statusColor(a.status) as any} className="capitalize">{a.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {a.status === "initiated" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "pending_payment")}>
                          Mark Pending
                        </Button>
                      )}
                      {a.status !== "completed" && (
                        <Button size="sm" onClick={() => updateStatus(a.id, "completed")}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminApplications;
