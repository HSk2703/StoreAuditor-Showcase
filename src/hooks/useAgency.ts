import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";

export type AgencyRole = "agency_owner" | "agency_admin" | "agency_member" | null;

interface AgencyContext {
  agencyId: string | null;
  agencyName: string | null;
  role: AgencyRole;
  isOwner: boolean;
  canManageTeam: boolean;
  managedStoreCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Single source of truth for the current user's agency tenant context.
 *
 * Backed by the `get_agency_context()` SECURITY DEFINER RPC, which resolves
 * the user's agency, role, personnel record, and managed store count in a
 * single round-trip (Phase 3 hardening).
 */
export function useAgency(): AgencyContext {
  const { user } = useAuth();
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [role, setRole] = useState<AgencyRole>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [managedStoreCount, setManagedStoreCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const reset = useCallback(() => {
    setAgencyId(null);
    setAgencyName(null);
    setRole(null);
    setIsOwner(false);
    setManagedStoreCount(0);
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      reset();
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_agency_context", {
        p_user_id: user.id,
      });

      if (error) throw error;

      const ctx = (data ?? {}) as {
        agency?: { id: string; agency_name: string } | null;
        role?: string | null;
        isOwner?: boolean;
        managedStoreCount?: number;
      };

      if (ctx.agency) {
        setAgencyId(ctx.agency.id);
        setAgencyName(ctx.agency.agency_name);
        setIsOwner(!!ctx.isOwner);
        setManagedStoreCount(ctx.managedStoreCount ?? 0);

        // Map db role → AgencyRole (admin/client_user are not agency-tenant roles)
        const r = ctx.role;
        if (r === "agency_owner" || r === "agency_admin" || r === "agency_member") {
          setRole(r);
        } else if (ctx.isOwner) {
          setRole("agency_owner");
        } else {
          setRole("agency_member");
        }
      } else {
        reset();
      }
    } catch (err) {
      console.error("[useAgency] load failed", err);
      reset();
    } finally {
      setLoading(false);
    }
  }, [user, reset]);

  useEffect(() => {
    void load();
  }, [load]);

  const canManageTeam = isOwner || role === "agency_admin";

  return {
    agencyId,
    agencyName,
    role,
    isOwner,
    canManageTeam,
    managedStoreCount,
    loading,
    refresh: load,
  };
}
