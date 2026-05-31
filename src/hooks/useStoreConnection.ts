import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";

interface ConnectedStore {
  id: string;
  store_name: string;
  store_url: string;
  hasCredentials: boolean;
  integrationActive: boolean;
}

export function useStoreConnection() {
  const { user } = useAuth();
  const [stores, setStores] = useState<ConnectedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const fetchStores = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data: managedStores, error } = await supabase
        .from("managed_stores")
        .select("id, store_name, store_url")
        .eq("user_id", user.id);

      if (error) throw error;

      if (!managedStores || managedStores.length === 0) {
        setStores([]);
        setLoading(false);
        return;
      }

      const { data: credentials } = await supabase
        .from("store_credentials")
        .select("managed_store_id, shopify_access_token, shopify_scopes")
        .eq("user_id", user.id);

      const credMap = new Map<string, { token: string; scopes: string[] | null }>(
        (credentials || []).map((c: any) => [
          c.managed_store_id,
          { token: c.shopify_access_token, scopes: c.shopify_scopes },
        ])
      );

      const mapped: ConnectedStore[] = managedStores.map((s) => {
        const cred = credMap.get(s.id);
        const hasCredentials = Boolean(cred);
        // Integration is "active" only when credentials exist AND token is non-empty AND scopes granted.
        const integrationActive = Boolean(
          cred && cred.token && cred.token.length > 0 && cred.scopes && cred.scopes.length > 0
        );
        return {
          id: s.id,
          store_name: s.store_name,
          store_url: s.store_url,
          hasCredentials,
          integrationActive,
        };
      });

      setStores(mapped);
    } catch (err) {
      console.error("Failed to fetch store connections:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const hasConnectedStore = stores.some((s) => s.hasCredentials);
  const hasActiveIntegration = stores.some((s) => s.integrationActive);

  const requireConnection = useCallback(() => {
    if (!hasActiveIntegration) {
      setShowConnectionModal(true);
      return false;
    }
    return true;
  }, [hasActiveIntegration]);

  return {
    stores,
    loading,
    hasConnectedStore,
    hasActiveIntegration,
    showConnectionModal,
    setShowConnectionModal,
    requireConnection,
    refetch: fetchStores,
  };
}
