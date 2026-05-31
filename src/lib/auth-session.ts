export const withTimeout = <T>(promise: Promise<T>, ms = 12000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Authentication service is temporarily unreachable. Please try again shortly.")), ms)
    ),
  ]);

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

const AUTH_STORAGE_KEY = projectId ? `sb-${projectId}-auth-token` : null;
const AUTH_CODE_VERIFIER_KEY = projectId ? `sb-${projectId}-auth-token-code-verifier` : null;

const AUTH_PUBLIC_ROUTES = new Set([
  "/login",
  "/admin/login",
  "/admin/reset-password",
  "/client/accept-invite",
  "/auth/shopify",
  "/auth/sso",
]);

const AUTH_NETWORK_ERROR_PATTERN = /failed to fetch|load failed|networkerror/i;

type StoredSessionLike = {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  currentSession?: StoredSessionLike | null;
  session?: StoredSessionLike | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asStoredSession = (value: unknown): StoredSessionLike | null => {
  if (!isRecord(value)) return null;
  return value as StoredSessionLike;
};

const resolveStoredSession = (value: unknown): StoredSessionLike | null => {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const resolved = resolveStoredSession(entry);
      if (resolved) return resolved;
    }
    return null;
  }

  const session = asStoredSession(value);
  if (!session) return null;

  if (typeof session.expires_at === "number" || session.access_token || session.refresh_token) {
    return session;
  }

  if (session.currentSession) {
    return resolveStoredSession(session.currentSession);
  }

  if (session.session) {
    return resolveStoredSession(session.session);
  }

  return null;
};

const getStoredAuthPayload = (): unknown => {
  if (typeof window === "undefined" || !AUTH_STORAGE_KEY) return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export const isPublicAuthRoute = (pathname: string) => AUTH_PUBLIC_ROUTES.has(pathname);

export const isAuthNetworkError = (error: unknown) =>
  error instanceof Error && AUTH_NETWORK_ERROR_PATTERN.test(error.message);

export const clearLocalAuthState = () => {
  if (typeof window === "undefined") return false;

  let cleared = false;

  if (AUTH_STORAGE_KEY && window.localStorage.getItem(AUTH_STORAGE_KEY) !== null) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    cleared = true;
  }

  if (AUTH_CODE_VERIFIER_KEY && window.localStorage.getItem(AUTH_CODE_VERIFIER_KEY) !== null) {
    window.localStorage.removeItem(AUTH_CODE_VERIFIER_KEY);
    cleared = true;
  }

  return cleared;
};

export const pruneExpiredAuthState = () => {
  const payload = getStoredAuthPayload();

  if (!payload) return false;
  if (typeof payload === "string") return clearLocalAuthState();

  const session = resolveStoredSession(payload);
  if (!session) return clearLocalAuthState();

  if (typeof session.expires_at !== "number") return false;

  const expiresAtMs = session.expires_at * 1000;

  if (expiresAtMs <= Date.now()) {
    return clearLocalAuthState();
  }

  return false;
};