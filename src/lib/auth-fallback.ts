/**
 * Multi-Provider Auth Fallback — Scaffold
 * ----------------------------------------
 * Architecture for falling back to secondary auth providers.
 * Currently a scaffold; wire up Firebase/Auth0 SDKs when API keys are available.
 */

export type AuthProvider = "primary" | "firebase" | "auth0";

export interface AuthResult {
  provider: AuthProvider;
  userId: string;
  email: string;
  accessToken: string;
}

export interface FallbackProviderConfig {
  id: AuthProvider;
  enabled: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

// ─── Provider registry ──────────────────────────────────────────────────────

const providers: FallbackProviderConfig[] = [];

export function registerProvider(config: FallbackProviderConfig) {
  providers.push(config);
}

export function getProviders(): readonly FallbackProviderConfig[] {
  return providers;
}

// ─── Fallback sign-in flow ──────────────────────────────────────────────────

export async function fallbackSignIn(
  email: string,
  password: string,
): Promise<AuthResult | null> {
  const enabledProviders = providers.filter((p) => p.enabled);

  for (const provider of enabledProviders) {
    try {
      return await provider.signIn(email, password);
    } catch (err) {
      console.warn(`[auth-fallback] ${provider.id} failed:`, err);
      continue;
    }
  }

  return null;
}

// ─── User identity mapping (scaffold) ───────────────────────────────────────

export interface UnifiedIdentity {
  primaryUserId: string;
  email: string;
  providers: { provider: AuthProvider; externalId: string }[];
}

/**
 * TODO: Implement identity linking once fallback providers are wired up.
 * This would query a `user_identities` table to map across providers.
 */
export async function resolveUnifiedIdentity(
  _email: string,
): Promise<UnifiedIdentity | null> {
  // Scaffold — will query database when providers are active
  return null;
}

// ─── Firebase scaffold ──────────────────────────────────────────────────────

/**
 * To enable: install firebase SDK, add VITE_FIREBASE_* env vars,
 * then call registerProvider with real implementation.
 */
export function scaffoldFirebaseProvider(): FallbackProviderConfig {
  return {
    id: "firebase",
    enabled: false,
    signIn: async () => {
      throw new Error("Firebase auth not configured. Add VITE_FIREBASE_API_KEY to enable.");
    },
    signUp: async () => {
      throw new Error("Firebase auth not configured.");
    },
    signOut: async () => {
      // no-op
    },
  };
}

// ─── Auth0 scaffold ─────────────────────────────────────────────────────────

export function scaffoldAuth0Provider(): FallbackProviderConfig {
  return {
    id: "auth0",
    enabled: false,
    signIn: async () => {
      throw new Error("Auth0 not configured. Add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID to enable.");
    },
    signUp: async () => {
      throw new Error("Auth0 not configured.");
    },
    signOut: async () => {
      // no-op
    },
  };
}

// ─── Auto-register scaffolds ────────────────────────────────────────────────

registerProvider(scaffoldFirebaseProvider());
registerProvider(scaffoldAuth0Provider());
