Controls Matrix (CASA ↔ OWASP ASVS ↔ Implementation)

- AuthN/Session (ASVS V2/V3):
  - Memory + sessionStorage tokens; no localStorage persistence (src/utils/auth.utils.js)
  - Refresh/expiry handling (src/contexts/AuthContext.js, SessionManager)

- CSRF (ASVS V4):
  - CSRF service adds token to state-changing requests; retries on 403 (src/services/csrf.service.js)
  - Cookie-based token with withCredentials

- XSS (ASVS V5):
  - DOMPurify sanitizer with strict style allowlist (src/utils/sanitizer.js)
  - No dangerouslySetInnerHTML; single innerHTML sink sanitized (ImpactVisualization)
  - Tooltip/user data escaped to text

- Communications (ASVS V10):
  - HTTPS, HSTS, secure WebSockets; env-based origins (nginx-secure.conf, websocketService)

- Security Headers (ASVS V14):
  - CSP no inline/eval; frame-ancestors 'self'; object-src 'none' (nginx-secure.conf)
  - X-Frame-Options, nosniff, HSTS, Referrer-Policy

- Logging/Secrets (ASVS V7/V9):
  - Redaction and reduced production logs (src/utils/logger.js)
  - No secrets in source; env-driven config

