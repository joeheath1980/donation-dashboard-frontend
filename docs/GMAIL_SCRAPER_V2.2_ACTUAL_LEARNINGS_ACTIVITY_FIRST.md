# Gmail Scraper v2.2 — Actual Learnings (Activity-First)

1. **Precision-first pays off.** Entry gates + manual commit mean users no longer see noisy data. The empty candidate list with non-zero gate stats confirms the filters work.
2. **Transparency increases trust.** Surfacing rejected donations with reasons helps users understand what was filtered and guides future refinements.
3. **Feedback loop is critical.** A missing-donation form gives us structured, high-signal data to improve recall without loosening gate thresholds prematurely.
4. **State separation matters.** Keeping candidate status (`pending`, `committed`, `duplicate`, `error`) in Redis avoids race conditions and simplifies UI updates.
5. **Phase telemetry accelerates debugging.** Summary counts and metrics per job make it obvious where a scrape stalled or why nothing surfaced.

## Next Experiments

- Analyse missing-donation reports weekly to prioritise query adjustments and charity whitelist expansions.
- Build attachment OCR stage and meter its impact on recall before widening search queries.
- Add admin review tooling for MissingDonationFeedback so ops can triage and label ground truth.

