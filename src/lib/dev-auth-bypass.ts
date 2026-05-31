/**
 * Development Auth Bypass
 * -----------------------
 * When DEV_AUTH_BYPASS is true AND in a non-production build,
 * performs a REAL Supabase sign-in so auth.uid() works in RLS policies.
 * Stores dev role metadata separately for UI overrides.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Configuration ──────────────────────────────────────────────────────────

// L10: Force-disable in production builds regardless of env. The bypass MUST
// only ever activate in `vite dev` mode, never in a production bundle.
const IS_PROD = import.meta.env.PROD === true || import.meta.env.MODE === "production";
const DEV_AUTH_BYPASS = !IS_PROD && import.meta.env.DEV === true;

const ALLOWED_EMAIL = !IS_PROD ? (import.meta.env.VITE_DEV_AUTH_EMAIL || "") : "";
const ALLOWED_PASSWORD = !IS_PROD ? (import.meta.env.VITE_DEV_AUTH_PASSWORD || "") : "";

const DEV_META_KEY = "dev-auth-meta";

export type DevRole = "admin" | "user" | "agency";

// ─── Public API ─────────────────────────────────────────────────────────────

export function isDevBypassEnabled(): boolean {
  return DEV_AUTH_BYPASS;
}

/**
 * Performs a REAL Supabase sign-in using the allowed credentials.
 * Stores the dev role in localStorage for UI overrides.
 * Returns the real session on success, null on failure.
 */
export async function devSignIn(
  email: string,
  password: string,
  role: DevRole = "user",
): Promise<{ success: boolean; error?: string }> {
  if (!DEV_AUTH_BYPASS) return { success: false, error: "Dev bypass disabled" };
  if (email.trim().toLowerCase() !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
    return { success: false, error: "Credentials don't match dev bypass" };
  }

  // Perform real Supabase auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    console.error("[DevBypass] Real sign-in failed:", error.message);
    return { success: false, error: error.message };
  }

  // Store dev role metadata for UI overrides
  try {
    localStorage.setItem(DEV_META_KEY, JSON.stringify({ role, userId: data.user?.id }));
  } catch {
    // silent
  }

  console.log(`[DevBypass] Real sign-in successful as ${role}, user: ${data.user?.id}`);
  return { success: true };
}

export function getDevMeta(): { role: DevRole; userId?: string } | null {
  if (!DEV_AUTH_BYPASS) return null;
  try {
    const raw = localStorage.getItem(DEV_META_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getDevRole(): DevRole | null {
  return getDevMeta()?.role ?? null;
}

export async function devSignOut(): Promise<void> {
  try {
    localStorage.removeItem(DEV_META_KEY);
    // Also clear the old key if it exists
    localStorage.removeItem("dev-auth-session");
  } catch {
    // silent
  }
  // Sign out from real Supabase session
  await supabase.auth.signOut().catch(() => undefined);
}

export function isDevSession(): boolean {
  return DEV_AUTH_BYPASS && getDevMeta() !== null;
}

/** Remove stale dev meta when no real session exists */
export function clearStaleMeta(): void {
  try {
    localStorage.removeItem(DEV_META_KEY);
    localStorage.removeItem("dev-auth-session");
  } catch {
    // silent
  }
}

/** @deprecated - no longer needed since we use real auth */
export function getDevSession(): null {
  return null;
}

/** @deprecated - no longer needed since we use real auth.uid() */
export function getResolvedDevUserId(): string | null {
  return null;
}
