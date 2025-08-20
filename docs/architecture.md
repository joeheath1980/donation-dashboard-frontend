# Frontend Architecture

## Overview
- React 18 application created with Create React App (CRA) and react-app-rewired for minor build tweaks.
- Core domains: Auth, Impact (scoring & analytics), Matching, Business & Charity portals.
- Communication via axios instance with interceptors for Authorization and CSRF; real‑time via socket.io.

## Key Modules
- `src/services/api.service.js` – axios instance (`apiClient`) + domain services; applies JWT and CSRF.
- `src/services/csrf.service.js` – token retrieval, caching, retry logic.
- `src/utils/auth.utils.js` – secure token storage (memory + sessionStorage), session manager, helpers.
- `src/utils/sanitizer.js` – DOMPurify configuration and escaping utilities.
- `src/contexts/*` – global state: AuthContext, ImpactContext, WebSocketContext.
- `src/components/*` – UI components organized by feature; CSS Modules for styles.

## Data Flow (Text)
1. User signs in → AuthContext stores JWT in memory + sessionStorage.
2. `apiClient` reads JWT for Authorization headers.
3. On first state‑changing request, CSRF service fetches CSRF token and injects into headers/body.
4. Responses pass through interceptors (401 → clear auth; 403 CSRF → refresh/retry; 429 → rate‑limit UX).
5. WebSocket connects using JWT for auth; events update UI via contexts.

## Security Considerations
- No inline scripts/styles (CSP friendly).
- Sanitized HTML rendering; avoid DOM sinks.
- Strict CSP in `nginx-secure.conf` and validation guidance in `docs/casa/csp-validation.md`.
- Memory‑first token storage; no localStorage persistence.

