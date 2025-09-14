# Beta Testing Infrastructure

This document outlines the end‑to‑end approach for running a safe, effective beta for Do‑Nation, covering tester onboarding, support, feedback collection, documentation, privacy/compliance, and triage/release processes.

## Objectives
- Validate core flows with real users while minimizing risk to data and uptime
- Collect actionable feedback to prioritize fixes and improvements
- Ensure legal/privacy compliance (Google API Limited Use, local laws)
- Keep the experience supportive and low‑friction for testers

## Scope & Environments
- Primary environment: Production with feature flags OR Staging (recommended)
- Public docs (live now):
  - Terms: `/terms_of_service.html`
  - Privacy: `/privacy_policy.html`
  - Beta Agreement: `/beta_testing_agreement.html`
- Optional: Dedicated staging subdomain (e.g., `beta.do-nation.space`) with separate database and Stripe test keys

## 1) User Onboarding Flow
Goal: Get testers from invite → active within 5 minutes.

1. Invitation
   - Invite email includes: overview, expectations, Beta Agreement link, and support contact.
   - Eligibility: Gmail users preferred (for receipt import testing).

2. Account Creation
   - Path: normal signup or OAuth (Google/Microsoft).
   - Show Beta Agreement on signup (checkbox + link to `/beta_testing_agreement.html`).
   - Require email verification.

3. First‑Run Checklist (in‑app)
   - Step 1: Profile basics (name, username, privacy defaults)
   - Step 2: Email forwarding setup (Gmail/Outlook instructions)
   - Step 3: Import a test receipt OR enable demo data
   - Step 4: View Impact Score + Perks overview

4. Time‑to‑First‑Value
   - Ensure a sample donation/receipt is visible within 2–3 minutes via demo data or fast import.

Implementation TODOs:
- Add “I agree to the Beta Testing Participation Agreement” checkbox to signup/onboarding; log acceptance timestamp.
- Provide a “Use demo data” quick path for testers without immediate emails to forward.
- Add a banner on first login linking to a quick 2‑minute guided tour.

## 2) Support System
Provide a single, reliable contact channel for testers.

- Primary contact: `joeheath@do-nation.space` (consider alias `support@do-nation.space`)
- Hours/SLA: Acknowledge within 1 business day; critical issues same day
- Escalation: Security/privacy issues → immediate attention
- Knowledge base: Link to Troubleshooting section in the Tester Guide (see Section 4)

Implementation TODOs:
- Add “Contact Support” link in footer and account/help menus (mailto with prefilled subject).
- Create auto‑reply template acknowledging receipt and linking FAQs.

## 3) Feedback Collection
Collect consistent, triage‑ready reports via a simple form; keep email as fallback.

- Primary: Google Form (proposed): `https://forms.gle/REPLACE_WITH_FORM_ID`
  - Required fields: Contact email, Environment (Prod/Staging), Severity (S0–S3), URL, Steps to Reproduce, Expected vs Actual, Screenshots permitted
- Alternate: Email to `joeheath@do-nation.space`
- Optional: In‑app “Report a bug” menu item linking to the form; prefill URL and user id.

Severity definitions:
- S0 Critical: Data loss, payments broken, login outage
- S1 Major: Core feature broken with no workaround
- S2 Minor: Usability/UI issues; workaround exists
- S3 Suggestion: Enhancement or idea

Triage workflow:
- Intake → Label by severity → Assign owner → ETA
- Weekly review for S2/S3; rolling fixes for S0/S1

Implementation TODOs:
- Add “Report a bug” link in the app header/help menu → Google Form (prefilled `window.location.href`).
- Create a triage board (GitHub Projects/Issues or Notion) with S‑labels and owners.

## 4) Testing Documentation
Deliver a short, practical guide targeting first‑time testers.

Contents (new file to author): `docs/BETA_TESTER_GUIDE.md`
- Getting Started (signup, Beta Agreement, verification)
- Email Forwarding setup (Gmail/Outlook)
- Viewing your Impact Score & dashboard
- Privacy controls; how to opt out / delete data
- How to report bugs (Google Form link) and contact support
- Known limitations (beta) and expected rough edges

Implementation TODOs:
- Author `docs/BETA_TESTER_GUIDE.md` and link it from the welcome email and in‑app Help.

## 5) Compliance & Data Handling
- Terms/Privacy/Beta Agreement: updated and published (done)
- Google API Limited Use: reinforced in Terms/Privacy/Beta Agreement
- Data minimization: Only process emails explicitly forwarded/authorized
- Opt‑out & deletion: Provide clear path in Settings → Privacy; confirm deletion via email

Implementation TODOs:
- Ensure a visible link to Terms, Privacy, and Beta Agreement in the app footer.
- Add a “Request Account Deletion” CTA in Privacy Settings (if not already present), referencing SLA.

## 6) Instrumentation & Telemetry (Optional, Privacy‑respecting)
- Frontend error reporting (e.g., capture JS errors with redaction)
- Minimal usage analytics: page views and key events (opt‑in if desired)
- Performance logging for slow endpoints

Implementation TODOs:
- Add a client‑side error boundary with non‑PII logs.
- Gate any analytics behind a clear consent toggle.

## 7) Release Cadence & Comms
- Cadence: Weekly beta drops; hotfix as needed for S0/S1
- Changelog: Keep a short “What’s new” note for testers
- Broadcast: Email updates to testers after substantial changes

## 8) Roles & Ownership
- Program Lead: Product/Founder (owns scope and prioritization)
- Engineering: Implements fixes and improvements
- Support: First response and triage; documentation updates

## 9) Quick Checklists

Onboarding Readiness
- [ ] Beta Agreement checkbox in signup/onboarding
- [ ] Links in footer: Terms, Privacy, Beta Agreement
- [ ] Demo data path to first value

Support & Feedback
- [ ] Support mailto in footer/menu
- [ ] Google Form live; in‑app link added
- [ ] Triage board and labels (S0–S3) configured

Docs
- [ ] Publish `docs/BETA_TESTER_GUIDE.md`
- [ ] Add Troubleshooting & Known Issues

Compliance
- [ ] Confirm Google API Limited Use adherence
- [ ] Validate deletion/opt‑out path in Privacy Settings

## 10) Next Steps (Proposed Order)
1. Create Google Form and wire “Report a bug” links (prefill page URL)
2. Add Beta Agreement checkbox + acceptance logging at signup
3. Publish `docs/BETA_TESTER_GUIDE.md` and link it in the app help/footer
4. Add support mailto and footer links (Terms/Privacy/Agreement)
5. Set up triage labels/board and define ownership

