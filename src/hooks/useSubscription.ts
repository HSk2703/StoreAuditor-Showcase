import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlanTier, hasFeatureAccess, PLAN_CONFIGS } from "@/lib/plan-config";
import { useAuth } from "@/contexts/AuthProvider";
import { getDevRole, isDevBypassEnabled } from "@/lib/dev-auth-bypass";

interface SubscriptionState {
  plan: PlanTier;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userType: "individual" | "agency" | null;
}

type ResolvedSubscriptionState = Omit<SubscriptionState, "loading">;

const subscriptionCache = new Map<string, ResolvedSubscriptionState>();
const subscriptionRequestCache = new Map<string, Promise<ResolvedSubscriptionState>>();

async function fetchSubscriptionState(userId: string): Promise<ResolvedSubscriptionState> {
  // In dev mode, log that we're fetching real subscription data
  if (isDevBypassEnabled() && isDevBypassEnabled()) {
    console.log("[useSubscription] Dev mode — fetching real subscription for user:", userId);
  }

  const [profileResult, agencyResult] = await Promise.allSettled([
    supabase
      .from("profiles")
      .select("subscription_plan, subscription_status")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("agencies")
      .select("subscription_plan, subscription_active")
      .eq("owner_user_id", userId)
      .maybeSingle(),
  ]);

  const profile = profileResult.status === "fulfilled" ? profileResult.value.data : null;
  const agency = agencyResult.status === "fulfilled" ? agencyResult.value.data : null;

  if (profile) {
    const plan =
      profile.subscription_status === "active" || profile.subscription_status === "completed"
        ? (profile.subscription_plan as PlanTier)
        : "free";

    return {
      plan,
      isAuthenticated: true,
      userId,
      userType: "individual",
    };
  }

  if (agency?.subscription_active) {
    return {
      plan: "agency",
      isAuthenticated: true,
      userId,
      userType: "agency",
    };
  }

  return {
    plan: "free",
    isAuthenticated: true,
    userId,
    userType: agency ? "agency" : "individual",
  };
}

function getSubscriptionState(userId: string, forceRefresh = false): Promise<ResolvedSubscriptionState> {
  if (forceRefresh) {
    subscriptionCache.delete(userId);
    subscriptionRequestCache.delete(userId);
  }

  const cached = subscriptionCache.get(userId);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inFlight = subscriptionRequestCache.get(userId);
  if (inFlight) {
    return inFlight;
  }

  const request = fetchSubscriptionState(userId)
    .then((nextState) => {
      subscriptionCache.set(userId, nextState);
      return nextState;
    })
    .finally(() => {
      subscriptionRequestCache.delete(userId);
    });

  subscriptionRequestCache.set(userId, request);
  return request;
}

export function useSubscription() {
  const { user, isReady, isAdmin } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    loading: true,
    isAuthenticated: false,
    userId: null,
    userType: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    if (user?.id) {
      subscriptionCache.delete(user.id);
      subscriptionRequestCache.delete(user.id);
    }
    setRefreshKey((value) => value + 1);
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    if (!isReady) {
      setState((prev) => ({ ...prev, loading: true }));
      return;
    }

    if (!user) {
      setState({
        plan: "free",
        loading: false,
        isAuthenticated: false,
        userId: null,
        userType: null,
      });
      return;
    }

    const cached = subscriptionCache.get(user.id);
    if (cached && refreshKey === 0) {
      setState({ ...cached, loading: false });
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: !cached,
      isAuthenticated: true,
      userId: user.id,
    }));

    getSubscriptionState(user.id, refreshKey > 0)
      .then((nextState) => {
        if (cancelled) return;
        setState({ ...nextState, loading: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          plan: "free",
          loading: false,
          isAuthenticated: true,
          userId: user.id,
          userType: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, user, refreshKey]);

  // Admin bypasses all feature checks — check both AuthProvider and dev bypass directly
  const effectiveAdmin = isAdmin || getDevRole() === "admin";
  const canAccess = useCallback(
    (feature: string) => effectiveAdmin ? true : hasFeatureAccess(state.plan, feature),
    [state.plan, effectiveAdmin],
  );
  const planConfig = useMemo(() => PLAN_CONFIGS[state.plan], [state.plan]);

  return {
    ...state,
    canAccess,
    planConfig,
    refetch,
    isAdmin: effectiveAdmin,
  };
}
