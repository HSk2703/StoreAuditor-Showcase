# Security Headers (N10 / V4 / X2)

`public/_headers` is shipped to Cloudflare Pages / Lovable hosting and applies
the full set at the edge. The `<meta http-equiv>` tags in `index.html` remain as
defense-in-depth for any host that ignores `_headers`.

## Current edge headers

| Header | Value |
| --- | --- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-site` |
| `Content-Security-Policy` | see `public/_headers` |

## CSP posture (X2)

- **`script-src`** — `'unsafe-inline'` has been **removed**. All third-party
  analytics (Clarity, GA, Meta Pixel) load from external origins on the
  allowlist. New inline scripts will be blocked by the browser — author them
  as external files.
- **`style-src`** — `'unsafe-inline'` is **retained**. This is a deliberate
  accepted risk: Radix UI primitives (used by every shadcn component) inject
  inline `style="..."` attributes for positioning popovers, tooltips, dialogs,
  and animations. Removing `'unsafe-inline'` from `style-src` would break the
  component library at runtime.
- **Future tightening path** — Adopt CSP nonces via a server-rendered shell
  (would require migrating off pure SPA Vite). Until then, the inline-style
  surface is constrained to Radix-generated positioning and Tailwind utility
  classes, which is a low-impact XSS vector.

## Rotation runbook

See `OPS_RUNBOOK.md` for cron secret rotation procedures.
