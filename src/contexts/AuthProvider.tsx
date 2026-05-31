import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearLocalAuthState, isAuthNetworkError } from "@/lib/auth-session";
import { startHealthCheck, stopHealthCheck, logAuthEvent, withTimeout } from "@/lib/auth-resilience";
import { isDevBypassEnabled, getDevMeta, clearStaleMeta } from "@/lib/dev-auth-bypass";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isReady: boolean;
  displayName: string | null;
  isAdmin: boolean;
  isReviewer: boolean;
  accountLoading: boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isReady: false,
  displayName: null,
  isAdmin: false,
  isReviewer: false,
  accountLoading: false,
  refreshRoles: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReviewer, setIsReviewer] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // ── Health check ────────────────────────────────────────────────────────
  useEffect(() => {
    startHealthCheck(async () => {
      try {
        const { error } = await withTimeout(supabase.auth.getSession(), 8_000);
        return !error;
      } catch {
        return false;
      }
    }, 25_000);

    return () => stopHealthCheck();
  }, []);

  // ── Session bootstrap ───────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      if (!nextSession && isDevBypassEnabled()) {
        clearStaleMeta();
      }
      setSession(nextSession);
      setIsReady(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    const bootstrapSession = async () => {
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession(), 12_000);
        if (error) throw error;
        applySession(data.session);
      } catch (error) {
        if (!active) return;
        console.error("Auth session restore failed", error);
        logAuthEvent("login_failure", "session restore failed", "primary");
        if (isAuthNetworkError(error)) {
          clearLocalAuthState();
          await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        }
        applySession(null);
      }
    };

    void bootstrapSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Profile + role fetch ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    if (!isReady) return;

    if (!session?.user) {
      setDisplayName(null);
      setIsAdmin(false);
      setIsReviewer(false);
      setAccountLoading(false);
      return;
    }

    const user = session.user;
    const fallbackName = user.email?.split("@")[0] || "User";
    setDisplayName((current) => current ?? fallbackName);
    setAccountLoading(true);

    const syncAndFetch = async () => {
      const [profileResult, adminResult] = await Promise.allSettled([
        supabase.from("profiles").select("full_name, is_reviewer").eq("user_id", user.id).maybeSingle() as unknown as Promise<{ data: { full_name: string | null; is_reviewer: boolean } | null; error: any }>,
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      ]);

      if (cancelled) return;

      let profileName: string | null = null;
      if (profileResult.status === "fulfilled" && profileResult.value.data?.full_name) {
        profileName = profileResult.value.data.full_name;
      }

      if (profileResult.status === "fulfilled" && !profileResult.value.data) {
        const oauthName = user.user_metadata?.full_name || user.user_metadata?.name || fallbackName;
        await supabase.from("profiles").upsert({
          user_id: user.id,
          email: user.email || "",
          full_name: oauthName,
          subscription_plan: "free",
          subscription_status: "active",
        }, { onConflict: "user_id" }).then(({ error }) => {
          if (error) console.warn("Profile sync failed:", error.message);
        });
        profileName = oauthName;
      }

      // Default-deny admin: only true on explicit successful resolution
      let nextIsAdmin =
        adminResult.status === "fulfilled"
          ? Boolean(adminResult.value.data)
          : false;

      if (isDevBypassEnabled()) {
        const devMeta = getDevMeta();
        if (devMeta?.role === "admin") {
          nextIsAdmin = true;
        }
      }

      const nextIsReviewer =
        profileResult.status === "fulfilled"
          ? Boolean(profileResult.value.data?.is_reviewer)
          : false;

      if (!cancelled) {
        setDisplayName(profileName || fallbackName);
        setIsAdmin(nextIsAdmin);
        setIsReviewer(nextIsReviewer);
      }
    };

    syncAndFetch().finally(() => {
      if (!cancelled) setAccountLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isReady, session, refreshTick]);

  // Public API: re-run profile + role fetch (used after invite accept, role grant, etc.)
  const refreshRoles = useCallback(async () => {
    setRefreshTick((t) => t + 1);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    session,
    user: session?.user ?? null,
    isReady,
    displayName,
    isAdmin,
    isReviewer,
    accountLoading,
    refreshRoles,
  }), [session, isReady, displayName, isAdmin, isReviewer, accountLoading, refreshRoles]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
