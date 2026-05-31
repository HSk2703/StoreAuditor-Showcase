import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import InviteErrorBanner from "@/components/InviteErrorBanner";
import {
  Users, Plus, Mail, Shield, Loader2, UserCheck, Clock, Crown,
  RefreshCw, Copy, CheckCircle, XCircle, AlertTriangle, Trash2,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role_title: string | null;
  agency_id: string;
  user_id: string | null;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  agency_id: string | null;
}

const roleLabels: Record<string, string> = {
  agency_owner: "Owner",
  agency_admin: "Admin",
  agency_member: "Member",
  client_user: "Client",
  admin: "System Admin",
};

const roleIcons: Record<string, any> = {
  agency_owner: Crown,
  agency_admin: Shield,
  agency_member: UserCheck,
  client_user: UserCheck,
  admin: Crown,
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning bg-warning/10", label: "Pending" },
  accepted: { icon: CheckCircle, color: "text-success bg-success/10", label: "Accepted" },
  expired: { icon: AlertTriangle, color: "text-destructive bg-destructive/10", label: "Expired" },
  revoked: { icon: XCircle, color: "text-muted-foreground bg-muted", label: "Revoked" },
};

const TeamPanel = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyOwnerId, setAgencyOwnerId] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agency_member");
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);
  const [rotationCounts, setRotationCounts] = useState<Record<string, number>>({});
  const [inviteError, setInviteError] = useState<{ message: string; details?: string } | null>(null);

  const ROTATION_LIMIT = 3;

  const fetchTeam = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Try agency owned by user
      const { data: ownedAgency } = await supabase
        .from("agencies")
        .select("id, owner_user_id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      let resolvedAgencyId: string | null = ownedAgency?.id ?? null;
      let ownerId: string | null = ownedAgency?.owner_user_id ?? null;
      let manage = !!ownedAgency;

      // 2. Else, find an agency where user is personnel + has agency_admin role
      if (!resolvedAgencyId) {
        const { data: personnelRow } = await supabase
          .from("agency_personnel")
          .select("agency_id, agencies!inner(id, owner_user_id)")
          .eq("user_id", user.id)
          .maybeSingle();

        if (personnelRow) {
          resolvedAgencyId = personnelRow.agency_id;
          ownerId = (personnelRow as any).agencies?.owner_user_id ?? null;

          const { data: adminRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "agency_admin")
            .maybeSingle();
          manage = !!adminRole;
        }
      }

      setAgencyId(resolvedAgencyId);
      setAgencyOwnerId(ownerId);
      setCanManage(manage);

      if (resolvedAgencyId) {
        const { data: personnel } = await supabase
          .from("agency_personnel")
          .select("*")
          .eq("agency_id", resolvedAgencyId)
          .order("created_at", { ascending: false });
        setMembers((personnel as TeamMember[]) || []);

        const { data: inviteData } = await supabase
          .from("team_invites")
          .select("id, email, role, status, created_at, expires_at, agency_id")
          .eq("agency_id", resolvedAgencyId)
          .order("created_at", { ascending: false })
          .limit(50);
        const inviteList = (inviteData as unknown as Invite[]) || [];
        setInvites(inviteList);

        // Fetch rotation counts (last 24h) for pending invites
        const pendingIds = inviteList.filter((i) => i.status === "pending").map((i) => i.id);
        if (pendingIds.length > 0) {
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data: logs } = await supabase
            .from("invite_audit_log")
            .select("invite_id")
            .in("invite_id", pendingIds)
            .eq("action", "resent")
            .gte("created_at", since);
          const counts: Record<string, number> = {};
          (logs || []).forEach((row: any) => {
            if (row.invite_id) counts[row.invite_id] = (counts[row.invite_id] || 0) + 1;
          });
          setRotationCounts(counts);
        } else {
          setRotationCounts({});
        }
      }
    } catch (err) {
      console.error("[TeamPanel] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !user || !agencyId) return;
    setSending(true);
    setInviteError(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-agency-invite", {
        body: { action: "create", email: inviteEmail.trim(), role: inviteRole, agency_id: agencyId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.email_sent) {
        toast({ title: "Invite emailed", description: `Invitation sent to ${inviteEmail}` });
      } else {
        toast({
          title: "Invite created",
          description: `Email delivery failed. Link copied to clipboard.`,
          variant: "destructive",
        });
        setInviteError({
          message: `Invite was created but the email could not be sent to ${inviteEmail}. The link has been copied to your clipboard — share it directly with the invitee.`,
          details: data?.email_error || undefined,
        });
        if (data?.invite_link) {
          await navigator.clipboard.writeText(data.invite_link).catch(() => {});
        }
      }

      setInviteEmail("");
      setShowInvite(false);
      fetchTeam();
    } catch (err: any) {
      const msg = err?.message || "Unknown error";
      toast({ title: "Failed to send invite", description: msg, variant: "destructive" });
      setInviteError({
        message: `We couldn't send the invite to ${inviteEmail}.`,
        details: msg,
      });
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (invite: Invite) => {
    const used = rotationCounts[invite.id] || 0;
    if (used >= ROTATION_LIMIT) {
      setInviteError({
        message: `Rotation limit reached for ${invite.email}. You can rotate this invite up to ${ROTATION_LIMIT} times per 24 hours.`,
      });
      toast({
        title: "Rotation limit reached",
        description: `Wait 24h or revoke and re-create the invite.`,
        variant: "destructive",
      });
      return;
    }
    setResending(invite.id);
    setInviteError(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-agency-invite", {
        body: { action: "rotate", invite_id: invite.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.email_sent) {
        toast({ title: "Invite resent", description: `New email sent to ${invite.email}` });
      } else {
        if (data?.invite_link) {
          await navigator.clipboard.writeText(data.invite_link).catch(() => {});
        }
        toast({
          title: "Invite rotated",
          description: `Email delivery failed. Link copied to clipboard.`,
          variant: "destructive",
        });
        setInviteError({
          message: `Token rotated for ${invite.email}, but the email could not be sent. The fresh link has been copied to your clipboard.`,
          details: data?.email_error || undefined,
        });
      }
      fetchTeam();
    } catch (err: any) {
      const msg = err?.message || "Unknown error";
      toast({ title: "Failed to resend", description: msg, variant: "destructive" });
      setInviteError({
        message: `We couldn't rotate the invite for ${invite.email}.`,
        details: msg,
      });
    } finally {
      setResending(null);
    }
  };

  const handleRevoke = async (invite: Invite) => {
    try {
      const { data, error } = await supabase.rpc("revoke_agency_invite", { p_invite_id: invite.id });
      if (error) throw error;
      const result: any = typeof data === "string" ? JSON.parse(data) : data;
      if (!result?.success) throw new Error(result?.error || "Revoke failed");

      toast({ title: "Invite revoked" });
      fetchTeam();
    } catch (err: any) {
      toast({ title: "Failed to revoke", description: err.message, variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    try {
      const { data, error } = await supabase.rpc("remove_agency_member", { p_personnel_id: removingMember.id });
      if (error) throw error;
      const result: any = typeof data === "string" ? JSON.parse(data) : data;
      if (!result?.success) throw new Error(result?.error || "Remove failed");

      toast({ title: "Member removed", description: `${removingMember.name} has been removed from the agency.` });
      setRemovingMember(null);
      fetchTeam();
    } catch (err: any) {
      toast({ title: "Failed to remove member", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  if (!agencyId) {
    return (
      <div className="rounded-xl border border-dashed border-border glass-card p-12 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-foreground font-medium mb-1">Not an agency member</p>
        <p className="text-sm text-muted-foreground">You don't belong to any agency yet.</p>
      </div>
    );
  }

  const pendingInvites = invites.filter(i => i.status === "pending");
  const otherInvites = invites.filter(i => i.status !== "pending");
  const isOwner = !!agencyOwnerId && user?.id === agencyOwnerId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Team Management</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isOwner
              ? "You're the agency owner — full team control."
              : canManage
                ? "You can invite and manage team members."
                : "View-only access to your team."}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowInvite(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      {/* Persistent error banner (in addition to toasts) */}
      {inviteError && (
        <InviteErrorBanner
          message={inviteError.message}
          details={inviteError.details}
          onDismiss={() => setInviteError(null)}
        />
      )}

      {/* Team Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Owner card */}
        {isOwner && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border p-4 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(260_70%_55%)]">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">You (Owner)</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">
              <Crown className="h-2.5 w-2.5" /> Agency Owner
            </span>
          </motion.div>
        )}

        {members.map((member, i) => {
          const roleKey = (member.role_title?.toLowerCase() || "agency_member");
          const RoleIcon = roleIcons[roleKey] || UserCheck;
          const isMemberOwner = !!agencyOwnerId && member.user_id === agencyOwnerId;
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (i + 1) }}
              className="glass-card rounded-xl border p-4 hover:border-primary/20 transition-colors group relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <RoleIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email || "No email"}</p>
                </div>
                {canManage && !isMemberOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                    onClick={() => setRemovingMember(member)}
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isMemberOwner ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <RoleIcon className="h-2.5 w-2.5" /> {roleLabels[roleKey] || member.role_title || "Member"}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" /> Pending Invitations ({pendingInvites.length})
          </h3>
          <div className="space-y-2">
            {pendingInvites.map((invite) => {
              const sc = statusConfig[invite.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              const used = rotationCounts[invite.id] || 0;
              const remaining = Math.max(0, ROTATION_LIMIT - used);
              const limitReached = remaining === 0;
              return (
                <div key={invite.id} className="glass-card rounded-xl border p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon className={`h-4 w-4 shrink-0 ${sc.color.split(" ")[0]}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Role: {roleLabels[invite.role] || invite.role} · Sent {new Date(invite.created_at).toLocaleDateString()}
                        {invite.expires_at && ` · Expires ${new Date(invite.expires_at).toLocaleDateString()}`}
                      </p>
                      {used > 0 && (
                        <p className={`text-[10px] mt-0.5 ${limitReached ? "text-destructive" : "text-muted-foreground"}`}>
                          {limitReached
                            ? `Rotation limit reached (${used}/${ROTATION_LIMIT}) — resets in 24h`
                            : `${remaining} of ${ROTATION_LIMIT} rotations remaining today`}
                        </p>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleResend(invite)}
                        disabled={resending === invite.id || limitReached}
                        title={limitReached ? `Rotation limit reached (${ROTATION_LIMIT}/24h)` : `Resend with new token (${remaining} left)`}
                      >
                        {resending === invite.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRevoke(invite)}
                        title="Revoke invite"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Invites */}
      {otherInvites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Invite History</h3>
          <div className="space-y-2">
            {otherInvites.slice(0, 10).map((invite) => {
              const sc = statusConfig[invite.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              return (
                <div key={invite.id} className="glass-card rounded-xl border p-3 flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-4 w-4 ${sc.color.split(" ")[0]}`} />
                    <div>
                      <p className="text-sm text-foreground">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Role: {roleLabels[invite.role] || invite.role} · {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {members.length === 0 && pendingInvites.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-border glass-card p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-foreground font-medium mb-1">No team members yet</p>
          <p className="text-sm text-muted-foreground mb-4">Invite your team to collaborate on store optimization</p>
          {canManage && (
            <Button size="sm" onClick={() => setShowInvite(true)} className="gap-2"><Plus className="h-4 w-4" /> Invite Member</Button>
          )}
        </motion.div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Email *</label>
              <Input type="email" placeholder="member@agency.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isOwner && <SelectItem value="agency_admin">Admin — Manage team & stores</SelectItem>}
                  <SelectItem value="agency_member">Member — View & manage assigned stores</SelectItem>
                </SelectContent>
              </Select>
              {!isOwner && (
                <p className="text-[11px] text-muted-foreground mt-1">Only the agency owner can promote members to Admin.</p>
              )}
            </div>
            <div className="rounded-md bg-muted/40 border border-border p-3 text-[11px] text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Security notes</p>
              <ul className="space-y-0.5 list-disc pl-4">
                <li>Invite link is single-use & expires in 48h</li>
                <li>Invitee must verify their email to join</li>
                <li>Max 10 invites per hour per agency</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={sending || !inviteEmail.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removingMember} onOpenChange={(o) => !o && setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold text-foreground">{removingMember?.name}</span> ({removingMember?.email}) from the agency.
              They will lose access to all agency stores. This action is logged for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive hover:bg-destructive/90">
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamPanel;
