/**
 * Cookie Consent — GDPR-compliant CMP
 * Stores granular consent in localStorage and exposes helpers
 * to gate analytics/marketing scripts.
 */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  necessary: true; // always true (required)
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: number;
}

const STORAGE_KEY = "sa_cookie_consent_v1";
const CONSENT_VERSION = 1;
const CONSENT_EVENT = "sa:consent-updated";

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
  version: CONSENT_VERSION,
};

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return { ...parsed, necessary: true };
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const c = getConsent();
  return c ? Boolean(c[category]) : false;
}

export function saveConsent(partial: { analytics: boolean; marketing: boolean }): ConsentState {
  const next: ConsentState = {
    necessary: true,
    analytics: Boolean(partial.analytics),
    marketing: Boolean(partial.marketing),
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
  }
  return next;
}

export function acceptAll(): ConsentState {
  return saveConsent({ analytics: true, marketing: true });
}

export function rejectAll(): ConsentState {
  return saveConsent({ analytics: false, marketing: false });
}

export function resetConsent() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
  }
}

export function onConsentChange(cb: (state: ConsentState | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState | null>).detail ?? null);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

/* ─────────────────────────────────────────────
 * L9: Region detection — show CMP only in EEA/UK/CH (and a few opt-in privacy
 * jurisdictions). Outside those regions we auto-accept essentials so users
 * aren't presented with banner friction they aren't legally entitled to see.
 * Detection uses Intl timezone (no IP lookup, no extra request).
 * ───────────────────────────────────────────── */

const PRIVACY_TIMEZONES = new Set([
  // EU
  "Europe/Vienna","Europe/Brussels","Europe/Sofia","Europe/Zagreb","Asia/Nicosia",
  "Europe/Prague","Europe/Copenhagen","Europe/Tallinn","Europe/Helsinki","Europe/Paris",
  "Europe/Berlin","Europe/Busingen","Europe/Athens","Europe/Budapest","Europe/Dublin",
  "Europe/Rome","Europe/Riga","Europe/Vilnius","Europe/Luxembourg","Europe/Malta",
  "Europe/Amsterdam","Europe/Warsaw","Europe/Lisbon","Atlantic/Azores","Atlantic/Madeira",
  "Europe/Bucharest","Europe/Bratislava","Europe/Ljubljana","Europe/Madrid","Atlantic/Canary",
  "Europe/Stockholm",
  // EEA
  "Europe/Oslo","Atlantic/Reykjavik","Europe/Vaduz",
  // UK + CH
  "Europe/London","Europe/Belfast","Europe/Guernsey","Europe/Isle_of_Man","Europe/Jersey",
  "Europe/Zurich",
]);

export function isPrivacyRegion(): boolean {
  if (typeof Intl === "undefined") return true; // safe default
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (PRIVACY_TIMEZONES.has(tz)) return true;
    // Also catch broad Europe/* coverage as a defensive net.
    if (/^Europe\//.test(tz)) return true;
    return false;
  } catch {
    return true;
  }
}

/* ─────────────────────────────────────────────
 * Tracking script loaders (gated by consent)
 * ───────────────────────────────────────────── */

const LOADED: Record<string, boolean> = {};

export function loadClarity(projectId: string) {
  if (typeof window === "undefined" || LOADED.clarity || !projectId || projectId === "CLARITY_PROJECT_ID") return;
  LOADED.clarity = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((c: any, l: Document, a: string, r: string, i: string) => {
    c[a] = c[a] || function (...args: unknown[]) { (c[a].q = c[a].q || []).push(args); };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window as unknown as Record<string, unknown>, document, "clarity", "script", projectId);
}

// L11: strict format validators — reject anything that could break out of URL/script context
const GA_ID_RE = /^G-[A-Z0-9]{4,20}$/;
const META_PIXEL_RE = /^\d{10,20}$/;

export function loadGoogleAnalytics(measurementId: string) {
  if (typeof window === "undefined" || LOADED.ga || !measurementId) return;
  if (!GA_ID_RE.test(measurementId)) { console.warn("Invalid GA ID format; skipping load"); return; }
  LOADED.ga = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(s);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer = (window as any).dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag = function gtag(...args: unknown[]) { (window as any).dataLayer.push(args); };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag("js", new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag("config", measurementId, { anonymize_ip: true });
}

export function loadMetaPixel(pixelId: string) {
  if (typeof window === "undefined" || LOADED.metaPixel || !pixelId) return;
  if (!META_PIXEL_RE.test(pixelId)) { console.warn("Invalid Meta Pixel ID format; skipping load"); return; }
  LOADED.metaPixel = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(w, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  w.fbq("init", pixelId);
  w.fbq("track", "PageView");
}

/** Fired once on app boot AND whenever consent changes — applies the current state. */
export function applyConsentSideEffects(state: ConsentState | null) {
  // Analytics: Microsoft Clarity (project ID is currently a placeholder; will be loaded once configured)
  if (state?.analytics) {
    const clarityId = (import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined) ?? "";
    if (clarityId) loadClarity(clarityId);
    const gaId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ?? "";
    if (gaId) loadGoogleAnalytics(gaId);
  }
  if (state?.marketing) {
    const pixelId = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) ?? "";
    if (pixelId) loadMetaPixel(pixelId);
  }
}

/** Custom-event name for cross-component subscriptions. */
export const CONSENT_UPDATED_EVENT = CONSENT_EVENT;
