import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Send, UserPlus, Trash2, Mail, CheckCircle, Clock, X,
  FileBarChart, MessageSquare,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface ManagedStore {
  id: string;
  store_name: string;
}

interface Invitation {
  id: string;
  client_email: string;
  managed_store_id: string;
  status: string;
  created_at: string;
}

interface ClientAccess {
  id: string;
  client_user_id: string;
  managed_store_id: string;
  created_at: string;
}

interface ReportSetting {
  id: string;
  managed_store_id: string;
  enabled: boolean;
  custom_message: string | null;
  last_report_at: string | null;
}

interface Props {
  userId: string;
  stores: ManagedStore[];
}

const ClientAccessManager = ({ userId, stores }: Props) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [accessList, setAccessList] = useState<ClientAccess[]>([]);
  const [reportSettings, setReportSettings] = useState<ReportSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStoreId, setInviteStoreId] = useState("");
  const [sending, setSending] = useState(false);
  const [savingReport, setSavingReport] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const fetchData = useCallback(async () => {
    const [invRes, accessRes, reportRes] = await Promise.all([
      supabase
        .from("client_invitations")
        .select("*")
        .eq("agency_user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_store_access")
        .select("*")
        .eq("granted_by", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("weekly_report_settings")
        .select("*")
        .eq("user_id", userId),
    ]);
    setInvitations((invRes.data as Invitation[]) || []);
    setAccessList((accessRes.data as ClientAccess[]) || []);
    setReportSettings((reportRes.data as ReportSetting[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateRawToken = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteStoreId) return;
    setSending(true);

    const rawToken = generateRawToken();

    // Hash the token server-side via RPC, then store it on the invite row
    const { data: hashData, error: hashErr } = await supabase.rpc("hash_invite_token", {
      p_token: rawToken,
    });

    if (hashErr || !hashData) {
      toast({
        title: "Failed to send invitation",
        description: hashErr?.message ?? "Could not hash token",
        variant: "destructive",
      });
      setSending(false);
      return;
    }

    const { error } = await supabase.from("client_invitations").insert({
      agency_user_id: userId,
      managed_store_id: inviteStoreId,
      client_email: inviteEmail.trim().toLowerCase(),
      token_hash: hashData as string,
    });

    if (error) {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const inviteUrl = `${window.location.origin}/accept-invite?token=${rawToken}`;
      try {
        await navigator.clipboard.writeText(inviteUrl);
        toast({
          title: "Invitation created",
          description: `Link copied to clipboard. Share it with ${inviteEmail.trim()}.`,
        });
      } catch {
        toast({
          title: "Invitation created",
          description: `Share this link with ${inviteEmail.trim()}: ${inviteUrl}`,
        });
      }
      setInviteEmail("");
      setInviteStoreId("");
      setShowInvite(false);
      fetchData();
    }
    setSending(false);
  };

  const revokeAccess = async (accessId: string) => {
    await supabase.from("client_store_access").delete().eq("id", accessId);
    setAccessList(a => a.filter(item => item.id !== accessId));
    toast({ title: "Access revoked" });
  };

  const cancelInvitation = async (invId: string) => {
    await supabase.from("client_invitations").update({ status: "cancelled" }).eq("id", invId);
    setInvitations(inv => inv.map(i => i.id === invId ? { ...i, status: "cancelled" } : i));
    toast({ title: "Invitation cancelled" });
  };

  const getStoreName = (storeId: string) =>
    stores.find(s => s.id === storeId)?.store_name || "Unknown Store";

  const getReportSetting = (storeId: string) =>
    reportSettings.find(s => s.managed_store_id === storeId);

  const toggleWeeklyReport = async (storeId: string, currentlyEnabled: boolean) => {
    setSavingReport(storeId);
    const existing = getReportSetting(storeId);
    if (existing) {
      await supabase
        .from("weekly_report_settings")
        .update({ enabled: !currentlyEnabled, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("weekly_report_settings").insert({
        managed_store_id: storeId,
        user_id: userId,
        enabled: true,
      });
    }
    toast({ title: !currentlyEnabled ? "Weekly reports enabled" : "Weekly reports disabled" });
    await fetchData();
    setSavingReport(null);
  };

  const saveCustomMessage = async (storeId: string) => {
    setSavingReport(storeId);
    const existing = getReportSetting(storeId);
    if (existing) {
      await supabase
        .from("weekly_report_settings")
        .update({ custom_message: messageText.trim() || null, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("weekly_report_settings").insert({
        managed_store_id: storeId,
        user_id: userId,
        enabled: false,
        custom_message: messageText.trim() || null,
      });
    }
    toast({ title: "Custom message saved" });
    setEditingMessage(null);
    await fetchData();
    setSavingReport(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const pendingInvitations = invitations.filter(i => i.status === "pending");
  const acceptedInvitations = invitations.filter(i => i.status === "accepted");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Client Access</h2>
          <p className="text-sm text-muted-foreground">Invite clients to view their store reports.</p>
        </div>
        <Button onClick={() => setShowInvite(true)} size="sm" className="gap-2" disabled={stores.length === 0}>
          <UserPlus className="h-4 w-4" /> Invite Client
        </Button>
      </div>

      {/* Active Access */}
      {accessList.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Active Access</h3>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Store</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Weekly Report</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Since</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessList.map(access => {
                  const setting = getReportSetting(access.managed_store_id);
                  const isEnabled = setting?.enabled ?? false;
                  const isSaving = savingReport === access.managed_store_id;
                  return (
                    <tr key={access.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 text-foreground font-mono text-xs">{access.client_user_id.slice(0, 8)}…</td>
                      <td className="px-4 py-2 text-foreground">{getStoreName(access.managed_store_id)}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleWeeklyReport(access.managed_store_id, isEnabled)}
                              disabled={isSaving}
                            />
                          </div>
                          {isEnabled && editingMessage !== access.managed_store_id && (
                            <button
                              onClick={() => {
                                setEditingMessage(access.managed_store_id);
                                setMessageText(setting?.custom_message || "");
                              }}
                              className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                            >
                              <MessageSquare className="h-2.5 w-2.5" />
                              {setting?.custom_message ? "Edit note" : "Add note"}
                            </button>
                          )}
                          {isEnabled && editingMessage === access.managed_store_id && (
                            <div className="w-full min-w-[200px] space-y-1 mt-1">
                              <Textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Custom message for client…"
                                rows={2}
                                className="text-xs"
                              />
                              <div className="flex gap-1">
                                <Button size="sm" variant="default" className="h-6 text-xs px-2" onClick={() => saveCustomMessage(access.managed_store_id)} disabled={isSaving}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setEditingMessage(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                          {isEnabled && setting?.custom_message && editingMessage !== access.managed_store_id && (
                            <p className="text-[10px] text-muted-foreground italic max-w-[160px] truncate" title={setting.custom_message}>
                              "{setting.custom_message}"
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground text-xs">{new Date(access.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" size="icon" title="Revoke access" onClick={() => revokeAccess(access.id)}>
                          <Trash2 className="h-4 w-4 text-critical" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Pending Invitations</h3>
          <div className="space-y-2">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {inv.client_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStoreName(inv.managed_store_id)} · Sent {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" title="Cancel" onClick={() => cancelInvitation(inv.id)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {accessList.length === 0 && pendingInvitations.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <UserPlus className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-foreground font-medium">No clients invited yet</p>
          <p className="text-xs text-muted-foreground mb-3">Invite clients to give them access to their store's reports.</p>
          <Button size="sm" onClick={() => setShowInvite(true)} className="gap-2" disabled={stores.length === 0}>
            <UserPlus className="h-3.5 w-3.5" /> Invite Client
          </Button>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Client Email</label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Store Access</label>
              <Select value={inviteStoreId} onValueChange={setInviteStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store…" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.store_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              The client will need to sign up at <span className="font-mono text-primary">/client/accept-invite</span> using this email to access their store dashboard.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInvite} disabled={sending || !inviteEmail.trim() || !inviteStoreId} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAccessManager;
