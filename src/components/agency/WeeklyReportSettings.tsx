import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileBarChart, Calendar, MessageSquare } from "lucide-react";

interface ManagedStore {
  id: string;
  store_name: string;
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

const WeeklyReportSettings = ({ userId, stores }: Props) => {
  const [settings, setSettings] = useState<ReportSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from("weekly_report_settings")
      .select("*")
      .eq("user_id", userId);
    setSettings((data as ReportSetting[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleEnabled = async (storeId: string, currentlyEnabled: boolean) => {
    setSaving(storeId);
    const existing = settings.find((s) => s.managed_store_id === storeId);

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

    toast({
      title: !currentlyEnabled ? "Weekly reports enabled" : "Weekly reports disabled",
    });
    await fetchSettings();
    setSaving(null);
  };

  const saveCustomMessage = async (storeId: string) => {
    setSaving(storeId);
    const existing = settings.find((s) => s.managed_store_id === storeId);

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
    await fetchSettings();
    setSaving(null);
  };

  const getSettingForStore = (storeId: string) =>
    settings.find((s) => s.managed_store_id === storeId);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <FileBarChart className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-foreground font-medium">No stores available</p>
        <p className="text-xs text-muted-foreground">Add stores in the Stores tab to configure weekly reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-primary" />
          Automatic Weekly Reports
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enable automated weekly audits and reports visible in the Client Portal.
        </p>
      </div>

      <div className="space-y-3">
        {stores.map((store) => {
          const setting = getSettingForStore(store.id);
          const isEnabled = setting?.enabled ?? false;
          const isSaving = saving === store.id;

          return (
            <div
              key={store.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{store.store_name}</p>
                    {setting?.last_report_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        Last report: {new Date(setting.last_report_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleEnabled(store.id, isEnabled)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Custom message section */}
              {isEnabled && (
                <div className="mt-3 pt-3 border-t border-border">
                  {editingMessage === store.id ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Custom Report Message
                      </label>
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Add a personalized note for your client's weekly report..."
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveCustomMessage(store.id)}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingMessage(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingMessage(store.id);
                        setMessageText(setting?.custom_message || "");
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      {setting?.custom_message ? "Edit custom message" : "Add custom message for client"}
                    </button>
                  )}
                  {setting?.custom_message && editingMessage !== store.id && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{setting.custom_message}"
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyReportSettings;
