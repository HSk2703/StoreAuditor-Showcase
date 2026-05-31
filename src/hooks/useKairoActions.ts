import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "@/lib/edge-function-utils";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/hooks/use-toast";

export interface AIAction {
  id: string;
  store_id: string;
  agency_id: string | null;
  user_id: string;
  action_type: string;
  target_resource_type: string;
  target_resource_id: string | null;
  payload_before: any;
  payload_after: any;
  ai_reasoning: string | null;
  result_summary: string | null;
  status: string;
  error_message: string | null;
  credits_cost: number;
  executed_at: string | null;
  rolled_back_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useKairoActions(storeId?: string) {
  const { user } = useAuth();
  const [actions, setActions] = useState<AIAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const fetchActions = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      let query = supabase
        .from("ai_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (storeId) {
        query = query.eq("store_id", storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActions((data as unknown as AIAction[]) || []);
    } catch (err: any) {
      console.error("Failed to fetch AI actions:", err);
    } finally {
      setLoading(false);
    }
  }, [user, storeId]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const executeAction = useCallback(async (params: {
    store_id: string;
    action_type: string;
    target_resource_type: string;
    target_resource_id?: string;
    task_context?: string;
  }) => {
    setExecuting(true);
    try {
      const result = await invokeEdgeFunction({
        functionName: "execute-kairo-action",
        body: params,
        maxRetries: 1,
        timeoutMs: 30000,
      });

      toast({
        title: result.status === "completed" ? "Kairo action completed" : "Action failed",
        description: result.ai_result?.expected_impact || result.ai_result?.reasoning || "Check action log for details",
        variant: result.status === "completed" ? "default" : "destructive",
      });

      await fetchActions();
      return result;
    } catch (err: any) {
      toast({
        title: "Execution failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setExecuting(false);
    }
  }, [fetchActions]);

  const rollbackAction = useCallback(async (actionId: string) => {
    try {
      const result = await invokeEdgeFunction({
        functionName: "rollback-kairo-action",
        body: { action_id: actionId },
        maxRetries: 1,
        timeoutMs: 30000,
      });
      toast({
        title: "Action rolled back",
        description: result.shopify_reverted
          ? "Shopify changes have been reverted"
          : "Action marked as rolled back",
      });
      await fetchActions();
    } catch (err: any) {
      toast({ title: "Rollback failed", description: err.message, variant: "destructive" });
    }
  }, [fetchActions]);

  return {
    actions,
    loading,
    executing,
    executeAction,
    rollbackAction,
    refetch: fetchActions,
  };
}
