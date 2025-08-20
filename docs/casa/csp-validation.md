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

