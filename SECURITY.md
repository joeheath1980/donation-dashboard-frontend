# Security Policy

We take the security of our users and partners seriously. This document summarizes how the frontend protects sensitive data and how to report vulnerabilities.

## Reporting a Vulnerability
- Email: security@do-nation.space
- Please include reproduction steps, impact assessment, and affected versions.
- We will acknowledge within 3 business days and provide status updates until resolution.

## Frontend Security Overview
- Authentication: JWT access tokens stored in memory + sessionStorage (no localStorage persistence). CSRF tokens via secure cookies.
- CSRF: Token fetched on app load and attached to state‑changing requests via axios interceptor (see `src/services/csrf.service.js`).
- XSS: No `dangerouslySetInnerHTML`. Any HTML rendering is sanitized with DOMPurify using a strict style allowlist (see `src/utils/sanitizer.js`).
- CSP: Hardened policy (no `unsafe-inline` or `unsafe-eval`), strict `frame-ancestors`, and limited third‑party origins (see `nginx-secure.conf`).
- WebSockets: Authenticated using Bearer token from secure storage; websocket-only transport with reconnection/backoff.
- Logging: Sensitive data redacted and production logs minimized (see `src/utils/logger.js`).
 - OAuth: URL tokens removed. Frontend uses short‑lived code exchange via `/api/auth/exchange-code`. See `docs/casa/oauth-cookie-migration.md`.
 - Request Centralization: All state‑changing requests go through a centralized apiClient which adds Authorization and CSRF automatically. CI forbids direct axios usage outside approved files.

## CASA (Google Cloud Application Security Assessment)
- CASA docs live in `docs/casa`. See:
  - `docs/casa/README.md` – summary & scope
  - `docs/casa/controls-matrix.md` – CASA ↔ ASVS ↔ implementation
  - `docs/casa/evidence-checklist.md` – artifacts for the LOV
  - `docs/casa/csp-validation.md` – CSP validation plan
  - `docs/casa/oauth-cookie-migration.md` – plan to remove tokens from URL and use cookies/code exchange
  - `docs/casa/final-self-assessment.md` – finalized mapping and statuses

## Build & CI Security
- NPM Audit: `.github/workflows/security-audit.yml`
- SAST (Semgrep): `.github/workflows/sast-semgrep.yml`
- DAST (ZAP Baseline): `.github/workflows/dast-zap-baseline.yml` (manual trigger with staging URL)

## Responsible Disclosure
We do not pursue legal action against researchers who report security vulnerabilities responsibly.
