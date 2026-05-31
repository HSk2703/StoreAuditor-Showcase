import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Agency {
  id: string;
  agency_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  employees_count: string | null;
  years_in_business: string | null;
  subscription_plan: string;
  subscription_active: boolean;
  services: string[] | null;
  seats_purchased: number;
  extra_seats: number;
  created_at: string;
}

const AdminAgencies = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("agencies").select("*").order("created_at", { ascending: false });
      setAgencies(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = agencies.filter(
    (a) =>
      a.agency_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.country || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agencies Database</h1>
          <p className="text-sm text-muted-foreground">{agencies.length} registered agencies</p>
        </div>
      </div>
      <Input placeholder="Search by name, email, or country…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Years</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No agencies found.</TableCell></TableRow>
            ) : (
              filtered.map((a) => {
                const baseSeats = a.seats_purchased ?? 3;
                const extraSeats = a.extra_seats ?? 0;
                const totalSeats = baseSeats + extraSeats;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.agency_name}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell className="text-muted-foreground">{[a.city, a.country].filter(Boolean).join(", ") || "—"}</TableCell>
                    <TableCell>{a.employees_count || "—"}</TableCell>
                    <TableCell>{a.years_in_business || "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{a.subscription_plan}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="font-semibold text-foreground">{totalSeats}</span>
                      {extraSeats > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">({baseSeats}+{extraSeats})</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.subscription_active ? "default" : "outline"}>
                        {a.subscription_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAgencies;
