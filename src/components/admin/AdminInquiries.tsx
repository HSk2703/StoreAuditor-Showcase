import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

interface Lead {
  id: string;
  name: string;
  email: string;
  store_url: string;
  revenue_range: string;
  issue_type: string;
  created_at: string;
}

const AdminInquiries = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("get-leads");
    if (!error) setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.store_url.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Name", "Email", "Store URL", "Revenue Range", "Issue Type", "Date"];
    const rows = filtered.map((l) =>
      [l.name, l.email, l.store_url, l.revenue_range, l.issue_type, format(new Date(l.created_at), "yyyy-MM-dd")].map((v) => `"${v}"`).join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Direct Inquiries</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" />Export</Button>
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
      </div>
      <Input placeholder="Search leads…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No inquiries found.</TableCell></TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell><a href={`mailto:${l.email}`} className="text-primary hover:underline">{l.email}</a></TableCell>
                  <TableCell className="max-w-[200px] truncate">{l.store_url}</TableCell>
                  <TableCell><Badge variant="secondary">{l.revenue_range}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{l.issue_type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(l.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminInquiries;
