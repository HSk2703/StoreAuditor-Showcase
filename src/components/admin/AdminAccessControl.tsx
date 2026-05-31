import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, UserPlus, Trash2, ShieldAlert, ShieldCheck, Users, Crown,
  Search, Info,
} from "lucide-react";
import { logAdminAction } from "@/lib/admin-audit";

/* ----------------------------- Role definitions ----------------------------- */

type AppRole =
  | "admin"
  | "agency_owner"
  | "agency_admin"
  | "agency_member"
  | "client_user";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "System Admin",
  agency_owner: "Agency Owner",
  agency_admin: "Agency Admin",
  agency_member: "Agency Member",
  client_user: "Client User",
};

const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "Full platform access. Use sparingly.",
  agency_owner: "Auto-assigned when a user creates an agency. Cannot be granted manually.",
  agency_admin: "Granted automatically when a user accepts an agency-admin team invite.",
  agency_member: "Granted automatically when a user accepts an agency-member team invite.",
  client_user: "Granted automatically when a user accepts a client portal invite.",
};

/** Roles that may be granted directly from this admin panel.
 *  Agency/client roles are intentionally omitted — they are issued
 *  through their own invite flows to keep tenant scoping intact. */
const GRANTABLE_ROLES: AppRole[] = ["admin"];

const ROLE_VARIANT: Record<AppRole, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  agency_owner: "default",
  agency_admin: "default",
  agency_member: "secondary",
  client_user: "outline",
};

/* --------------------------------- Types ---------------------------------- */

interface UserRoleRow {
  id: string;
  user_id: string;
  role: string;
}

interface ProfileInfo {
  user_id: string;
  email: string;
  full_name: string;
}

/* -------------------------------- Component -------------------------------- */

const AdminAccessControl = () => {
  const [roles, setRoles] = useState<UserRoleRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);
  const [search, setSearch] = useState("");

  // Grant form
  const [grantEmail, setGrantEmail] = useState("");
  const [grantRole, setGrantRole] = useState<AppRole>("admin");

  // Confirmation for grant
  const [pendingGrant, setPendingGrant] = useState<{ email: string; role: AppRole; user_id: string } | null>(null);
  const [pendingRemove, setPendingRemove] = useState<UserRoleRow | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    setRoles(rolesData || []);

    if (rolesData && rolesData.length > 0) {
      const userIds = [...new Set(rolesData.map((r) => r.user_id))];
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);
      const map: Record<string, ProfileInfo> = {};
      (profileData || []).forEach((p) => { map[p.user_id] = p; });
      setProfiles(map);
    } else {
      setProfiles({});
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  /** Look up a user_id by email via profiles (admin can view all profiles via RLS). */
  const resolveUserIdByEmail = async (email: string): Promise<{ user_id: string; full_name: string } | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .eq("email", email)
      .maybeSingle();
    if (error) {
      toast({ title: "Lookup failed", description: error.message, variant: "destructive" });
      return null;
    }
    return data ?? null;
  };

  const handleGrantClick = async () => {
    const email = grantEmail.trim().toLowerCase();
    if (!email) {
      toast({ title: "Enter an email address", variant: "destructive" });
      return;
    }

    if (!GRANTABLE_ROLES.includes(grantRole)) {
      toast({
        title: "Role cannot be granted here",
        description: `${ROLE_LABELS[grantRole]} is assigned through its own invite flow, not this panel.`,
        variant: "destructive",
      });
      return;
    }

    const profile = await resolveUserIdByEmail(email);
    if (!profile) {
      toast({
        title: "User not found",
        description: `No registered account exists for ${email}. The user must sign up first before a role can be granted.`,
        variant: "destructive",
      });
      return;
    }

    // Already has the role?
    const existing = roles.find((r) => r.user_id === profile.user_id && r.role === grantRole);
    if (existing) {
      toast({
        title: "Role already granted",
        description: `${profile.full_name || email} already has the ${ROLE_LABELS[grantRole]} role.`,
        variant: "destructive",
      });
      return;
    }

    setPendingGrant({ email, role: grantRole, user_id: profile.user_id });
  };

  const confirmGrant = async () => {
    if (!pendingGrant) return;
    setGranting(true);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: pendingGrant.user_id, role: pendingGrant.role });

    if (error) {
      toast({
        title: "Failed to grant role",
        description: error.message,
        variant: "destructive",
      });
    } else {
      void logAdminAction("role.grant", "user_role", pendingGrant.user_id, {
        email: pendingGrant.email, role: pendingGrant.role,
      });
      toast({
        title: "Role granted",
        description: `${ROLE_LABELS[pendingGrant.role]} granted to ${pendingGrant.email}.`,
      });
      setGrantEmail("");
      setPendingGrant(null);
      fetchData();
    }
    setGranting(false);
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", pendingRemove.id);
    if (error) {
      toast({ title: "Failed to remove role", description: error.message, variant: "destructive" });
    } else {
      void logAdminAction("role.revoke", "user_role", pendingRemove.id, {
        user_id: pendingRemove.user_id, role: pendingRemove.role,
      });
      toast({ title: "Role removed" });
      fetchData();
    }
    setPendingRemove(null);
  };

  const labelFor = (r: string) => ROLE_LABELS[r as AppRole] ?? r;
  const variantFor = (r: string) => ROLE_VARIANT[r as AppRole] ?? "outline";

  // Filter roles by search
  const filteredRoles = roles.filter((r) => {
    if (!search.trim()) return true;
    const profile = profiles[r.user_id];
    const haystack = `${profile?.email ?? ""} ${profile?.full_name ?? ""} ${r.role}`.toLowerCase();
    return haystack.includes(search.toLowerCase().trim());
  });

  // Group by role for the count summary
  const roleCounts: Partial<Record<AppRole, number>> = {};
  roles.forEach((r) => {
    const k = r.role as AppRole;
    roleCounts[k] = (roleCounts[k] ?? 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Access Control</h1>
        <p className="text-muted-foreground">
          Grant platform-level roles to existing users. Agency and client roles are auto-assigned through their own invite flows.
        </p>
      </div>

      {/* Role-distribution summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(ROLE_LABELS) as AppRole[]).map((role) => {
          const Icon = role === "admin" ? Crown : role === "agency_owner" ? ShieldCheck : Users;
          return (
            <div key={role} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{ROLE_LABELS[role]}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{roleCounts[role] ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* Grant Role */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Grant Platform Role</h2>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 mb-4 flex gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
          <p>
            Use this panel to grant <strong className="text-foreground">System Admin</strong> to existing users only.
            <br />
            <strong className="text-foreground">Agency invites</strong> are sent from each agency's Team panel.
            <strong className="text-foreground"> Client portal access</strong> is sent from the agency's Client Manager.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="user@example.com (must already have an account)"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            type="email"
            className="flex-1 min-w-[240px]"
            onKeyDown={(e) => e.key === "Enter" && handleGrantClick()}
          />
          <Select value={grantRole} onValueChange={(v) => setGrantRole(v as AppRole)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GRANTABLE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGrantClick} disabled={granting} className="gap-2">
            {granting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Grant Role
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          {ROLE_DESCRIPTIONS[grantRole]}
        </p>
      </div>

      {/* All Roles */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            All Role Assignments ({roles.length})
          </h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-64 text-xs"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {roles.length === 0
                    ? "No roles assigned yet."
                    : "No roles match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((r) => {
                const profile = profiles[r.user_id];
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{profile?.full_name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{profile?.email || r.user_id}</TableCell>
                    <TableCell>
                      <Badge variant={variantFor(r.role)}>{labelFor(r.role)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingRemove(r)}
                        className="text-destructive hover:text-destructive gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirm grant */}
      <AlertDialog open={!!pendingGrant} onOpenChange={(open) => !open && setPendingGrant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Grant {pendingGrant ? ROLE_LABELS[pendingGrant.role] : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will give <strong className="text-foreground">{pendingGrant?.email}</strong> full platform access including all data, all agencies, and all admin functions.
              <br /><br />
              This action takes effect immediately and is auditable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGrant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Grant Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm revoke */}
      <AlertDialog open={!!pendingRemove} onOpenChange={(open) => !open && setPendingRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke role?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the <strong className="text-foreground">{pendingRemove ? labelFor(pendingRemove.role) : ""}</strong> role from{" "}
              <strong className="text-foreground">{pendingRemove ? (profiles[pendingRemove.user_id]?.email ?? pendingRemove.user_id) : ""}</strong>?
              <br /><br />
              The user will lose access immediately. This action does not delete their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAccessControl;
