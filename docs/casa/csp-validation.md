CSP Validation Guide (Staging)

1) Deploy hardened CSP (nginx-secure.conf)
- Ensure the server loads the updated Content-Security-Policy without 'unsafe-inline' or 'unsafe-eval'.
- Permit only required origins: Google, Stripe, your API/WebSocket endpoints.

2) Smoke test the app
- Launch staging and exercise common pages: login, dashboards, charts, Stripe components, OAuth callbacks.
- Open DevTools Console → filter for 'securitypolicyviolation'. Gather any violations.

3) Test page with strict meta CSP
- Open public/csp-test.html directly to confirm baseline CSP behaviors.
- Ensure no violations beyond expected blocked inline usage.

4) Investigate any violations
- Typical causes: leftover inline scripts/styles from third-party widgets or dev shortcuts.
- Fix by moving to external assets or by adding nonces/hashes. Do not re-enable unsafe-inline.

5) Record Evidence
- Screenshots of: Headers tab showing CSP; Console showing zero violations during normal flows; any third-party embeds functioning.
- Keep policy version and commit SHA.

6) JSON-LD With Nonce (optional, recommended)
- For structured data on public profiles, use a per-request nonce instead of allowing unsafe-inline.
- Frontend: `public/index.html` contains `<meta name="csp-nonce" content="__CSP_NONCE__">`. Components read it via `getCspNonce()` and only render JSON-LD when `REACT_APP_ENABLE_JSON_LD=true`.
- Edge (nginx): inject the nonce into CSP and HTML.

Example nginx snippet:

  # Generate per-request nonce using $request_id and allow only nonced scripts
  add_header Content-Security-Policy "\
    default-src 'self'; \
    script-src 'self' https://apis.google.com https://www.gstatic.com https://www.google.com https://www.googletagmanager.com https://js.stripe.com 'nonce-$request_id'; \
    style-src 'self' https://fonts.googleapis.com; \
    font-src 'self' https://fonts.gstatic.com data:; \
    img-src 'self' https: data: blob:; \
    connect-src 'self' https://api.stripe.com https://do-nation.space wss://do-nation.space; \
    frame-src 'self' https://accounts.google.com https://www.google.com https://js.stripe.com https://hooks.stripe.com; \
    frame-ancestors 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests;" always;

  # Replace placeholder nonce in HTML with $request_id
  sub_filter_once off;
  sub_filter '__CSP_NONCE__' $request_id;

Notes:
- Keep `script-src` strict; do not re-enable `'unsafe-inline'`.
- If JSON-LD is not required, set `REACT_APP_ENABLE_JSON_LD` to false (default) and keep CSP unchanged.
