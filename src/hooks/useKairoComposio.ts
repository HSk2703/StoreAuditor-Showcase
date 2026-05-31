import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "@/lib/edge-function-utils";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/hooks/use-toast";

export interface KairoActionRow {
  id: string;
  user_id: string;
  agency_id: string | null;
  tool: string;
  action_name: string;
  input_payload: any;
  output_response: any;
  status: "pending" | "success" | "failed" | "rolled_back";
  rollback_data: any;
  rolled_back_at: string | null;
  error_message: string | null;
  created_at: string;
}

export function useKairoComposio() {
  const { user } = useAuth();
  const [actions, setActions] = useState<KairoActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const refetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("kairo_actions" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) setActions((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  const execute = useCallback(async (params: {
    tool: string;
    action: string;
    payload?: Record<string, unknown>;
    agency_id?: string | null;
    rollback_data?: Record<string, unknown>;
  }) => {
    setExecuting(true);
    try {
      const result = await invokeEdgeFunction({
        functionName: "kairo-execute",
        body: params,
        maxRetries: 1,
        timeoutMs: 30000,
      });
      toast({
        title: result.status === "success" ? "Kairo executed action" : "Action failed",
        description: result.status === "success"
          ? `${params.tool} → ${params.action}`
          : result.error || "Check activity log",
        variant: result.status === "success" ? "default" : "destructive",
      });
      await refetch();
      return result;
    } catch (err: any) {
      const msg = err?.message || "Execution failed";
      toast({ title: "Execution failed", description: msg, variant: "destructive" });
      throw err;
    } finally {
      setExecuting(false);
    }
  }, [refetch]);

  const rollback = useCallback(async (action_id: string) => {
    try {
      const result = await invokeEdgeFunction({
        functionName: "kairo-rollback",
        body: { action_id },
        maxRetries: 1,
        timeoutMs: 30000,
      });
      toast({
        title: "Action rolled back",
        description: result.reverted ? "Reverted via Composio" : (result.reason || "Marked as rolled back"),
      });
      await refetch();
      return result;
    } catch (err: any) {
      toast({ title: "Rollback failed", description: err?.message || "Error", variant: "destructive" });
      throw err;
    }
  }, [refetch]);

  return { actions, loading, executing, execute, rollback, refetch };
}
