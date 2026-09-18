# Security Audit & Hardening — taaqib-portfolio

Last reviewed: Sep 2026 (Next 15.5.25, React 19.3)

## Applied

| Layer | Control | Where |
|---|---|---|
| Headers | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | `next.config.mjs` (all routes) |
| Headers | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` | `next.config.mjs` + `src/middleware.ts` |
| Headers | `X-Content-Type-Options: nosniff` | `next.config.mjs` |
| Headers | `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/interest-cohort denied) | `next.config.mjs` |
| CSP | Strict nonce-based CSP generated per request in middleware: `script-src 'self' 'nonce-…' 'strict-dynamic'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`. `'unsafe-eval'`/`'unsafe-inline'` only added in dev (HMR). `style-src 'unsafe-inline'` required by framer-motion/Next inline styles. | `src/middleware.ts` |
| Cookies | All `document.cookie` writes (Google Translate `googtrans`) carry `Secure; SameSite=Lax` | `src/components/LanguageToggle.tsx` |
| Rate limiting | All LLM/email endpoints rate-limited per-IP with bounded memory: chat 30/h, playground 20/h, mcp-review 10/h, contact 5/h | `src/lib/rate-limit.ts` + API routes |
| Input validation | Zod schema on contact; server-side caps on tokens/prompt/history sizes across all AI routes | API routes |

## Verified — no action needed

- **Open redirects:** No `redirect()` calls, no `redirects()` in `next.config.mjs`, no URL-parameter-driven navigation, no `location.assign/replace/href=` writes. All `router.push`/`scrollTo` targets are hardcoded literals; external links (`github.com`, `wa.me`, `linkedin.com`, netlify demo) are user-initiated `<a href>`/`window.open` with fixed URLs — not redirect endpoints.
- **Cookies:** no auth/session cookies exist (no auth in this app); the only cookie is `googtrans` (fixed above). Google Translate also sets its own cookie server-side on its own domain — outside our control.
- **Dependencies:** `npm audit` → 0 vulnerabilities (Next 14→15 upgrade + postcss override pinned in `package.json`).

## Intentionally skipped

- **Private CV storage (Supabase signed URLs):** the portfolio has no Supabase dependency, and the CV is intentionally public — recruiters are the audience. Moving it to a private bucket + signed-URL flow adds infrastructure and failure modes with zero security benefit. The CV remains a static file at `public/taaqib-masood-cv.pdf`.

## Known limits

- Rate limiting is in-memory → per-instance on Vercel (best-effort, not a global quota). Upgrade path: Upstash Redis or Vercel WAF if abuse ever appears.
- CSP allows `style-src 'unsafe-inline'` (framer-motion + Next inject inline styles) and `data:/blob:` in `img-src` (Next image internals). No `unsafe-inline` in `script-src` in production.
- Post-deploy check recommended: open DevTools console on `/` and `/playground` and confirm zero CSP violation reports (middleware + static headers verified by `bun scripts/check-headers.mjs`, but a real-browser pass catches anything the allowlist missed, e.g. Google Translate internals).
