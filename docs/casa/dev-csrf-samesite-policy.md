Dev-only CSRF SameSite Relaxation Policy

Purpose
- Allow local development from `http://localhost:*` to call the production/staging API with CSRF protection, while keeping production cookies strict.

Backend Policy
- Use session‑backed CSRF (e.g., csurf with `cookie: false`).
- Detect dev cross‑site origins (e.g., `http://localhost:3000`) using an allowlist env var like `DEV_CSRF_ORIGINS`.
- For dev origins only:
  - Set session cookie and `XSRF-TOKEN` cookie with `SameSite=None; Secure`.
  - Keep cookies `HttpOnly` where appropriate.
- For non‑dev origins:
  - Keep `SameSite=Strict` (or `Lax`) to tighten CSRF posture.

Frontend Expectations
- Axios configured with `withCredentials: true`, `xsrfCookieName: XSRF-TOKEN`, `xsrfHeaderName: X-XSRF-TOKEN`.
- Initialize CSRF on app load (`GET /api/csrf-token`).
- Unsafe methods (POST/PUT/PATCH/DELETE) send both CSRF header and session cookie.

Browser Notes
- Some browsers block third‑party cookies by default; for cross‑site localhost → production, enable third‑party cookies for dev or serve the frontend from the same origin.

Production Safety
- Only localhost (or listed dev origins) get `SameSite=None`; production UIs continue to receive `SameSite=Strict/Lax`.

