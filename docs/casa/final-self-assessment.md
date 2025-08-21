# CASA Final Self‑Assessment (Frontend + Edge)

Scope
- App: Donation Dashboard React frontend, Nginx edge config.
- Context: This document maps the provided CASA requirement list to the current implementation, with evidence links and gaps/TBDs for backend/infra items.

Summary
- Overall: High alignment for frontend and edge controls (CSP, CSRF headering, anti‑automation, logging, XSS). Several items require backend confirmation (cookie flags, storage encryption, MFA, authorization decisions).
- Recent Changes (2025‑08‑21):
  - Implemented OAuth code‑exchange; removed tokens from URLs across all callbacks.
  - Centralized all state‑changing requests through a single apiClient; CSRF applied automatically.
  - Added CI guard to forbid direct axios outside approved files.
  - Added email change verification page; CSRF‑exempt per backend policy.
- Notable items:
  - 2.1.1 Password min length: frontend now enforces ≥12. Backend must enforce too.
  - 8.2.2 Browser storage: Access tokens are memory‑only, with optional sessionStorage fallback; flag available to disable fallback for stricter posture.

Evidence Legend
- Files under repo root use clickable paths (e.g., `src/services/csrf.service.js`).
- Edge config: `nginx-secure.conf` (deployed).
- CASA docs: `docs/casa/*` (controls matrix, checklist, CSP validation).

Detailed Mapping

1) 1.1.4 Trust boundaries, components, data flows
- Status: Compliant
- Evidence: `docs/casa/README.md`, `docs/architecture.md`, `docs/casa/evidence-checklist.md` (system diagram + data classification)

2) 1.14.6 No deprecated client tech (Flash/ActiveX/etc.)
- Status: Compliant
- Evidence: React app; no such tech present. CSP blocks plugins (`object-src 'none'`). See `nginx-secure.conf`.

3) 1.4.1 Enforce access control on trusted server layer
- Status: Backend‑owned (TBD)
- Evidence: Frontend does not gatekeep; relies on API authZ. Confirm on backend routers/controllers.

4) 1.8.1 Identify/classify sensitive data
- Status: Compliant (frontend scope)
- Evidence: `docs/casa/README.md` (classification), `docs/casa/evidence-checklist.md`.

5) 1.8.2 Protection requirements by classification
- Status: Partial (needs backend sign‑off)
- Evidence: Frontend uses CSP, XSS mitigations, token handling; backend to confirm encryption/retention/scopes.

6) 10.3.2 Integrity protections; no code from untrusted sources
- Status: Compliant (CSP‑restricted); SRI N/A for dynamic SDKs
- Evidence: `nginx-secure.conf` CSP allow‑lists Google/Stripe only; scripts otherwise bundled. No dynamic `eval`/`new Function`.

7) 10.3.3 Subdomain takeover protections
- Status: Infra‑owned (TBD)
- Evidence: Requires DNS/process evidence outside repo.

8) 11.1.4 Anti‑automation controls (excessive calls/DoS)
- Status: Compliant (edge)
- Evidence: `nginx-secure.conf` rate limits (login stricter), conn limits; client handles 429 (`src/services/api.service.js`).

9) 12.4.1 Untrusted files stored outside web root
- Status: Backend‑owned (TBD)
- Evidence: Requires storage path evidence (API server). Frontend not serving uploads.

10) 12.4.2 AV scanning for uploaded files
- Status: Backend‑owned (TBD)
- Evidence: Requires AV scan pipeline on upload path.

11) 13.1.3 API URLs do not expose sensitive info
- Status: Compliant (APIs)
- Evidence: Auth via `Authorization: Bearer` (`src/services/api.service.js`); no tokens/passwords in API URLs.

12) 13.1.4 Authorization decisions at URI and resource level
- Status: Backend‑owned (TBD)
- Evidence: Confirm router and model‑level checks server‑side.

13) 13.2.1 Enabled REST methods valid for user/action
- Status: Backend‑owned (TBD)
- Evidence: Confirm verb allow‑list on backend routes.

14) 14.1.1 Secure, repeatable build/deploy (CI/CD)
- Status: Compliant (frontend)
- Evidence: `.github/workflows/*` (audit, SAST, ZAP baseline). Nginx config codified.

15) 14.1.4 Automated redeploy/runbook/restore
- Status: Partial (frontend OK; infra TBD)
- Evidence: CI scripts present; infra backup/restore confirmation needed.

16) 14.1.5 Verify integrity of security‑relevant configs
- Status: Partial (process)
- Evidence: Configs in VCS; require admin verification procedure (change control, checksums) — add to runbook.

17) 14.3.2 Debug modes disabled in production
- Status: Compliant
- Evidence: CRA production build; logger suppresses non‑errors in prod (`src/utils/logger.js`); Nginx serves static with secure headers.

18) 14.5.2 Origin header not used for auth decisions
- Status: Backend‑owned (TBD)
- Evidence: Confirm server does not trust `Origin` for authZ.

19) 2.1.1 User passwords ≥ 12 chars
- Status: Compliant (frontend) / Backend TBD
- Evidence: Updated validator to ≥12 (`src/utils/validation.js`); Business signup uses `minLength="12"`. Backend enforcement required.

20) 2.3.1 Initial passwords/codes random, ≥6 chars, expire
- Status: Backend‑owned (TBD)
- Evidence: Requires server control.

21) 2.4.1 Password storage salted + hashed with approved KDF
- Status: Backend‑owned (TBD)
- Evidence: Requires server control.

22) 2.5.4 No shared/default accounts
- Status: Backend/Org (TBD)
- Evidence: Policy/enforcement on backend.

23) 2.6.1 Lookup secrets one‑time use
- Status: Backend‑owned (TBD)

24) 2.7.2 OOB verifier expires codes ≤10 minutes
- Status: Backend‑owned (TBD)

25) 2.7.6 Initial auth code ≥20 bits entropy
- Status: Backend‑owned (TBD)

26) 3.3.1 Logout/expiration invalidates session token (back button)
- Status: Partial
- Evidence: Frontend clears tokens (`SecureTokenStorage.clearAll()`); backend should revoke/expire tokens on logout.

27) 3.3.3 Terminate other sessions on password change
- Status: Backend‑owned (TBD)

28) 3.4.1 Cookie session tokens use Secure
- Status: Backend‑owned (CSRF cookie)
- Evidence: Confirm CSRF cookie has `Secure`.

29) 3.4.2 Cookie session tokens use HttpOnly
- Status: Backend‑owned (CSRF cookie)
- Evidence: Confirm `HttpOnly`.

30) 3.4.3 Cookie session tokens use SameSite
- Status: Backend‑owned (CSRF cookie)
- Evidence: Confirm `SameSite=Lax|Strict`.

31) 3.5.2 Use session tokens, not static API keys
- Status: Compliant
- Evidence: JWTs used; no static API keys in client; Stripe uses publishable key only.

32) 3.5.3 Stateless tokens protected by signatures/cryptography
- Status: Backend‑owned (TBD)
- Evidence: Backend signs JWT; frontend only decodes `exp` for UX.

33) 3.7.1 Re‑auth before sensitive actions
- Status: Backend/UX (TBD)
- Evidence: Confirm server enforces re‑auth for high‑risk operations.

34) 4.1.1 Enforce access control on trusted layer
- Status: Backend‑owned (TBD)

35) 4.1.2 Policy attributes not user‑manipulable
- Status: Backend‑owned (TBD)

36) 4.1.3 Least privilege
- Status: Backend‑owned (TBD)

37) 4.1.5 Access control fails securely
- Status: Backend‑owned (TBD)

38) 4.2.1 Protect against IDOR (CRUD)
- Status: Backend‑owned (TBD)

39) 4.2.2 Strong anti‑CSRF for authenticated functionality
- Status: Compliant (client adds CSRF header; cookie based)
- Evidence: `src/services/csrf.service.js` + axios interceptor; `withCredentials` enabled; all state‑changing calls refactored to use apiClient.

40) 4.3.1 Admin interfaces use MFA
- Status: Backend/IdP (TBD)

41) 4.3.2 Directory browsing disabled; no .git/.svn disclosure
- Status: Compliant (edge)
- Evidence: `nginx-secure.conf` blocks hidden/backup files; default `autoindex` not enabled.

42) 5.1.1 Defenses vs HTTP parameter pollution
- Status: Backend‑owned (TBD)

43) 5.1.5 Redirects/forwards allow‑list or warn
- Status: Compliant (frontend)
- Evidence: App navigates internally; external links use `rel="noopener noreferrer"`. Backend OAuth redirect allow‑list required (TBD).

44) 5.2.3 Sanitize inputs to mail systems
- Status: Compliant (client usage)
- Evidence: `mailto:` constructions use `encodeURIComponent` (e.g., `MatchSuccessModal`). Server mailers TBD.

45) 5.2.4 Avoid eval/dynamic code exec; sanitize if unavoidable
- Status: Compliant
- Evidence: No `eval`/`new Function`; React rendering; strict sanitizer.

46) 5.2.5 Protect against template injection
- Status: Compliant
- Evidence: React escapes; sanitized HTML sink only (`ImpactVisualization` with `sanitizeHTML`).

47) 5.2.6 SSRF protections
- Status: Backend‑owned (TBD)

48) 5.2.7 Sanitize/sandbox SVG scriptable content
- Status: N/A (frontend usage)
- Evidence: No user‑supplied SVG rendered.

49) 5.3.1 Context‑aware output encoding
- Status: Compliant
- Evidence: React escapes by default; explicit HTML goes through DOMPurify (`src/utils/sanitizer.js`).

50) 5.3.10 Protect against XPath/XML injection
- Status: Backend‑owned (TBD)

51) 5.3.3 Escape protects against XSS (reflected/stored/DOM)
- Status: Compliant
- Evidence: No `dangerouslySetInnerHTML`; tooltip uses `sanitizeHTML`; user text escapes via `escapeHTML`.

52) 5.3.4 Parameterized queries/ORM for DB
- Status: Backend‑owned (TBD)

53) 5.3.6 Protect against JSON injection/eval
- Status: Compliant
- Evidence: No JSON `eval`; axios JSON APIs only.

54) 5.3.7 Protect against LDAP injection
- Status: Backend‑owned (TBD)

55) 5.3.8 Protect against OS command injection
- Status: Backend‑owned (TBD)

56) 5.3.9 Protect against LFI/RFI
- Status: Backend‑owned (TBD)

57) 5.5.2 Restrict XML parsers / disable XXE
- Status: Backend‑owned (TBD)

58) 6.1.1 Regulated private data encrypted at rest
- Status: Backend‑owned (TBD)

59) 6.2.1 Crypto modules fail securely (no padding oracle)
- Status: Backend‑owned (TBD)

60) 6.2.3 IV/cipher config securely set
- Status: Backend‑owned (TBD)

61) 6.2.4 Crypto algorithms configurable/upgradable
- Status: Backend‑owned (TBD)

62) 6.2.7 Encrypted data authenticated (AEAD/HMAC)
- Status: Backend‑owned (TBD)

63) 6.2.8 Constant‑time crypto operations
- Status: Backend‑owned (TBD)

64) 6.3.2 GUIDs are v4/CSPRNG
- Status: Backend‑owned (TBD)

65) 6.4.2 Keys not exposed; use vault/HSM
- Status: Backend‑owned (TBD)

66) 7.1.1 Do not log credentials/payment; tokens hashed/redacted
- Status: Compliant
- Evidence: `src/utils/logger.js` redacts sensitive keys/values; prod suppresses non‑error logs.

67) 8.1.1 Protect sensitive data from caching (servers, LB)
- Status: Compliant (edge)
- Evidence: `nginx-secure.conf` sets `Cache-Control: no-store` for API and HTML.

68) 8.2.2 Browser storage does not contain sensitive data
- Status: Partial → Configurable Strict
- Evidence: Access token held in memory by default; sessionStorage fallback is feature‑flagged (`REACT_APP_ENABLE_SESSION_STORAGE_TOKENS`). Set to `false` to meet strict requirement without code change.

69) 8.3.1 Sensitive data not in query strings
- Status: Compliant (frontend)
- Evidence: OAuth token‑in‑URL removed. Frontend requires code exchange via `/api/auth/exchange-code`. See callbacks in `src/components/*Callback.js` and `docs/casa/oauth-cookie-migration.md`.

70) 8.3.5 Access to sensitive data is audited (without logging data)
- Status: Backend‑owned (TBD)
- Evidence: Frontend logging scrubs; server audit logs required.

Notes
- CSP Validation: See `docs/casa/csp-validation.md` for staging procedure and evidence to collect (headers + zero violations screenshots).
- Controls Matrix: `docs/casa/controls-matrix.md` maps CASA ↔ ASVS ↔ implementation.
- Evidence Checklist: `docs/casa/evidence-checklist.md` enumerates artifacts to attach for review.

CI Guard and Developer Controls
- CI: `.github/workflows/forbidden-axios.yml` blocks direct axios usage to ensure CSRF/auth interceptors are always applied.
- Script: `scripts/check_forbidden_axios.sh` lists violations if present.

Action Items
- Remove token in URL for OAuth; deliver via HttpOnly cookie or short‑lived code for exchange.
- Consider removing `sessionStorage` token fallback or move to HttpOnly cookies for strict 8.2.2 compliance.
- Confirm backend: password ≥12, cookie flags (Secure/HttpOnly/SameSite), authZ at URI/resource level, IDOR protections, encryption at rest, MFA for admin, SSRF/XXE defenses, audit logging.

---
Commit SHA (frontend change in this PR): updates password min length to 12.
