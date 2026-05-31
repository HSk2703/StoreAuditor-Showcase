import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Activity } from "lucide-react";

interface Props {
  managedStoreId: string;
  userId: string;
}

const MonitoringToggle = ({ managedStoreId, userId }: Props) => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("store_monitoring")
        .select("enabled")
        .eq("managed_store_id", managedStoreId)
        .maybeSingle();
      if (data) setEnabled(data.enabled);
      setLoading(false);
    };
    load();
  }, [managedStoreId]);

  const toggle = async () => {
    const newVal = !enabled;
    setEnabled(newVal);

    const { data: existing } = await supabase
      .from("store_monitoring")
      .select("id")
      .eq("managed_store_id", managedStoreId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("store_monitoring")
        .update({ enabled: newVal, updated_at: new Date().toISOString() })
        .eq("managed_store_id", managedStoreId);
    } else {
      await supabase.from("store_monitoring").insert({
        managed_store_id: managedStoreId,
        user_id: userId,
        enabled: newVal,
      });
    }

    toast({
      title: newVal ? "Monitoring enabled" : "Monitoring disabled",
      description: newVal ? "Audits will run automatically every 3 days." : "Automatic audits stopped.",
    });
  };

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        enabled
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      }`}
      title={enabled ? "Monitoring active" : "Enable monitoring"}
    >
      <Activity className="h-3 w-3" />
      {enabled ? "ON" : "OFF"}
    </button>
  );
};

export default MonitoringToggle;
