import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  profession: string | null;
  experience_level: string | null;
  subscription_plan: string;
  subscription_status: string;
  stores_managed: number | null;
  created_at: string;
}

const AdminIndividuals = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setProfiles(data || []);
      setLoading(false);
    };
    fetchProfiles();

    // Poll for updates every 15 seconds (realtime removed for security)
    const interval = setInterval(() => {
      supabase.from("profiles").select("*").order("created_at", { ascending: false })
        .then(({ data }) => { if (data) setProfiles(data); });
    }, 15000);

    return () => { clearInterval(interval); };
  }, []);

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.country || "").toLowerCase().includes(search.toLowerCase())
  );

  const planColor = (plan: string) => {
    switch (plan) {
      case "starter": return "bg-blue-100 text-blue-700";
      case "pro": return "bg-violet-100 text-violet-700";
      case "agency": return "bg-amber-100 text-amber-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Individuals Database</h1>
          <p className="text-sm text-muted-foreground">{profiles.length} registered individual users</p>
        </div>
      </div>
      <Input placeholder="Search by name, email, or country…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Profession</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No individuals found.</TableCell></TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell className="text-muted-foreground">{[p.city, p.country].filter(Boolean).join(", ") || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.profession || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{p.experience_level || "—"}</Badge></TableCell>
                  <TableCell><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${planColor(p.subscription_plan)}`}>{p.subscription_plan}</span></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminIndividuals;
