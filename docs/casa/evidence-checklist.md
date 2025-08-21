CASA Evidence Checklist (Frontend)

- Architecture and Data Flows
  - System diagram (frontend ↔ backend ↔ Google/Stripe) and data classification
  - OAuth flows (Google) and redirect URIs

- Authentication & Session
  - Token storage design: memory + sessionStorage only; no localStorage persistence
  - Token refresh path and expiry handling
  - Logout/clear-all behavior
  - OAuth code exchange: Request/response logs for `/api/auth/exchange-code`; confirmation that tokens do not appear in URL or browser history

- CSRF Protections
  - CSRF token retrieval, caching, and header/body injection rules
  - Safe methods bypass; error-retry handling
  - Cookie flags on CSRF token (Secure/HttpOnly/SameSite=Lax or Strict) – server evidence
  - Network captures showing `X-CSRF-Token` on POST/PUT/DELETE across refactored endpoints

- XSS Controls
  - Forbidden sinks: absence of dangerouslySetInnerHTML; any innerHTML guarded by sanitizer
  - DOMPurify configuration and unit tests
  - Escaping strategy for user-provided text

- Content Security Policy
  - Final policy snippet (no unsafe-inline/eval; strict frame-ancestors; object-src 'none')
  - Validation screenshots and violation logs (see csp-validation.md)

- Transport Security
  - HSTS header; HTTPS-only production; secure WebSocket endpoints
  - OAuth redirects and callback origins validated (no mixed content)

- Logging & Secrets
  - Logger scrubbing controls; production verbosity limits
  - No secrets in source control; env-only configuration

- SDLC & Security Hygiene
  - Vulnerability management (npm audit) – report sample
  - SAST/DAST scans – report sample
  - Code review gates and change control
  - Incident response plan (token revocation/rotation)
  - CI guard evidence: `.github/workflows/forbidden-axios.yml` run output (passing) and sample failure screenshot
