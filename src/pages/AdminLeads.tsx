import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Mail, Store, DollarSign, LogOut, Download } from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  name: string;
  email: string;
  store_url: string;
  revenue_range: string;
  issue_type: string;
  created_at: string;
}

const AdminLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("get-leads");
      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl py-8">
        <PageBreadcrumb items={[
          { label: "Admin", href: "/admin/login" },
          { label: "Leads" },
        ]} />
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Service Leads
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {leads.length} lead{leads.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
                navigate("/admin/login");
              }}

              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (leads.length === 0) return;
                const headers = ["Name", "Email", "Store URL", "Revenue Range", "Issue Type", "Date"];
                const rows = leads.map((l) => [
                  l.name,
                  l.email,
                  l.store_url,
                  l.revenue_range,
                  l.issue_type,
                  format(new Date(l.created_at), "yyyy-MM-dd HH:mm:ss"),
                ].map((v) => `"${v.replace(/"/g, '""')}"`).join(","));
                const csv = [headers.join(","), ...rows].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={leads.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Mail className="h-4 w-4" /> Total Leads
            </div>
            <p className="text-2xl font-bold text-foreground">{leads.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Store className="h-4 w-4" /> Unique Stores
            </div>
            <p className="text-2xl font-bold text-foreground">
              {new Set(leads.map((l) => l.store_url)).size}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" /> Top Revenue
            </div>
            <p className="text-lg font-bold text-foreground">
              {leads.length > 0
                ? leads.reduce((top, l) => {
                    const order = ["Under $1,000/mo", "$1,000 - $5,000/mo", "$5,000 - $20,000/mo", "$20,000 - $50,000/mo", "$50,000+/mo"];
                    return order.indexOf(l.revenue_range) > order.indexOf(top) ? l.revenue_range : top;
                  }, leads[0].revenue_range)
                : "—"}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive mb-6">
            {error}
          </div>
        )}

        {/* Leads table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Store URL</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Loading leads…
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No leads yet. They'll appear here when someone submits the form.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                        {lead.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={lead.store_url.startsWith("http") ? lead.store_url : `https://${lead.store_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {lead.store_url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{lead.revenue_range}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.issue_type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AdminLeads;
