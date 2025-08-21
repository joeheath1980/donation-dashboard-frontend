# OAuth Token Delivery Migration (URL → Secure Cookie or Code Exchange)

Goal
- Eliminate `?token=...` in OAuth callback URLs to satisfy CASA 8.3.1 (no sensitive data in query strings) and improve resilience against token leakage.

Recommended Options

Option A: Secure/HttpOnly Cookie (simplest)
1) Backend (OAuth callback):
   - After verifying the provider, mint access/refresh tokens server-side.
   - Set cookie(s):
     - `Set-Cookie: access=...; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=1800`
     - `Set-Cookie: refresh=...; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=2592000`
   - Redirect to frontend callback without tokens: `302 Location: https://app/auth/google/callback?status=success`.
2) Backend (API auth):
   - Accept cookie-based auth for authenticated APIs (e.g., `/api/users/me`).
   - Implement refresh rotation and CSRF protections for state-changing requests.
3) Frontend:
   - On callback, do not read `token` from URL. Instead call `/api/users/me` using `withCredentials: true` to hydrate UI based on cookie session.
   - Keep current JWT-in-memory path behind a feature flag until fully migrated.

Option B: One-time Code Exchange (OAuth-style)
1) Backend (OAuth callback):
   - Issue a short-lived one-time code (e.g., 60s) in the query string: `/callback?code=...&status=success`.
   - No JWTs in the URL.
2) Backend (token endpoint):
   - Add endpoint `/api/auth/exchange` to swap `code` for tokens; returns via cookies (preferred) or JSON (temporary during migration).
3) Frontend:
   - On callback, if `code` present, POST to `/api/auth/exchange` with `withCredentials: true` and then redirect.

Security Requirements
- Cookies: `Secure`, `HttpOnly`, `SameSite=Lax` (use `Strict` only if it doesn’t break IdP redirects).
- CORS:
  - Allow frontend origin.
  - `Access-Control-Allow-Credentials: true`.
  - No `*` when credentials are used.
- CSRF:
  - Keep existing CSRF protections. State-changing requests must carry CSRF token. The frontend already adds `X-CSRF-Token`.
- Logout:
  - Clear cookies server-side and revoke/expire sessions.
- Refresh:
  - Use rotation; reject reused refresh tokens.

Frontend Changes (phased)
- Phase 1 (compat, default today):
  - Keep reading `?token=` if present (legacy), but remove any logging of token values (done).
- Phase 2 (staging):
  - Backend stops sending `token` in URL and sets cookies.
  - Frontend callback attempts cookie-based session by calling `/api/users/me` (requires server to accept cookie auth).
- Phase 3 (final):
  - Remove URL token consumption paths and dead code.

Testing Checklist
- Google and Microsoft login success for new/existing users.
- Refresh works; no token leakage to URL/history/logs.
- CSRF works for POST/PUT/DELETE under cookie session.
- SameSite=Lax allows OAuth redirect; if broken, adjust Lax/None+Secure per flow.

Rollback Plan
- Temporarily re-enable `?token=` redirect path while investigating cookie/CORS issues.

Notes
- Align with Stripe/CSP constraints already in `nginx-secure.conf`.
- Document final cookie names and retention in SECURITY.md and docs/casa/final-self-assessment.md.
