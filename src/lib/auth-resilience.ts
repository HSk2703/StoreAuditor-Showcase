/**
 * Auth Resilience Layer
 * --------------------
 * Provides timeout, retry with exponential backoff, rate limiting,
 * health checking, and standardised error handling for all auth/data requests.
 */

// ─── Timeout ────────────────────────────────────────────────────────────────

export const AUTH_TIMEOUT_MS = 12_000;

export class AuthTimeoutError extends Error {
  constructor() {
    super("Service temporarily unavailable. Please try again.");
    this.name = "AuthTimeoutError";
  }
}

export class AuthNetworkError extends Error {
  constructor(original?: string) {
    super(original ?? "Network error. Check your connection and try again.");
    this.name = "AuthNetworkError";
  }
}

export class AuthRateLimitError extends Error {
  constructor() {
    super("Too many attempts. Please wait a moment and try again.");
    this.name = "AuthRateLimitError";
  }
}

export type StandardAuthError =
  | AuthTimeoutError
  | AuthNetworkError
  | AuthRateLimitError
  | Error;

/** Wrap any promise with a hard timeout. */
export function withTimeout<T>(promise: Promise<T>, ms = AUTH_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new AuthTimeoutError()), ms)),
  ]);
}

// ─── Retry with exponential backoff ─────────────────────────────────────────

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1000, maxDelayMs = 8000, timeoutMs = AUTH_TIMEOUT_MS } = opts;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err) {
      lastError = err;

      // Don't retry on rate limit or auth credential errors
      if (err instanceof AuthRateLimitError) throw err;
      if (err instanceof Error && /invalid.*credentials|invalid.*password|email.*not.*confirmed/i.test(err.message)) throw err;

      if (attempt < maxAttempts - 1) {
        const jitter = Math.random() * 500;
        const delay = Math.min(baseDelayMs * 2 ** attempt + jitter, maxDelayMs);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

// ─── Client-side rate limiter ───────────────────────────────────────────────

const rateBuckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000,
): void {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    rateBuckets.set(key, timestamps);
    throw new AuthRateLimitError();
  }

  timestamps.push(now);
  rateBuckets.set(key, timestamps);
}

// ─── Health check ───────────────────────────────────────────────────────────

type HealthStatus = "healthy" | "degraded" | "down";
type HealthListener = (status: HealthStatus) => void;

let currentHealth: HealthStatus = "healthy";
let healthInterval: ReturnType<typeof setInterval> | null = null;
const healthListeners = new Set<HealthListener>();

export function getHealthStatus(): HealthStatus {
  return currentHealth;
}

export function onHealthChange(listener: HealthListener): () => void {
  healthListeners.add(listener);
  return () => healthListeners.delete(listener);
}

function setHealth(status: HealthStatus) {
  if (status !== currentHealth) {
    currentHealth = status;
    healthListeners.forEach((fn) => fn(status));
  }
}

export function startHealthCheck(
  pingFn: () => Promise<boolean>,
  intervalMs = 25_000,
) {
  stopHealthCheck();

  const check = async () => {
    try {
      const ok = await withTimeout(pingFn(), 8_000);
      setHealth(ok ? "healthy" : "degraded");
    } catch {
      setHealth("down");
    }
  };

  void check();
  healthInterval = setInterval(check, intervalMs);
}

export function stopHealthCheck() {
  if (healthInterval) {
    clearInterval(healthInterval);
    healthInterval = null;
  }
}

// ─── Standardised error normalisation ───────────────────────────────────────

const NETWORK_PATTERN = /failed to fetch|load failed|networkerror|fetch.*failed/i;

export function normaliseAuthError(err: unknown): StandardAuthError {
  if (err instanceof AuthTimeoutError) return err;
  if (err instanceof AuthNetworkError) return err;
  if (err instanceof AuthRateLimitError) return err;

  if (err instanceof Error) {
    if (NETWORK_PATTERN.test(err.message)) return new AuthNetworkError(err.message);
    return err;
  }

  return new Error(typeof err === "string" ? err : "An unexpected error occurred.");
}

export function friendlyErrorMessage(err: unknown): string {
  const normalised = normaliseAuthError(err);
  return normalised.message;
}

// ─── Auth event logger (in-memory, exportable) ─────────────────────────────

export type AuthEventType =
  | "login_attempt"
  | "login_success"
  | "login_failure"
  | "signup_attempt"
  | "signup_success"
  | "signup_failure"
  | "fallback_used"
  | "sso_attempt"
  | "oauth_attempt"
  | "session_refresh"
  | "health_change";

export interface AuthLogEntry {
  timestamp: number;
  event: AuthEventType;
  detail?: string;
  provider?: string;
}

const authLog: AuthLogEntry[] = [];
const MAX_LOG = 200;

export function logAuthEvent(event: AuthEventType, detail?: string, provider?: string) {
  authLog.push({ timestamp: Date.now(), event, detail, provider });
  if (authLog.length > MAX_LOG) authLog.splice(0, authLog.length - MAX_LOG);

  if (import.meta.env.DEV) {
    console.debug(`[auth] ${event}`, detail ?? "", provider ?? "");
  }
}

export function getAuthLog(): readonly AuthLogEntry[] {
  return authLog;
}
