# Gmail Scraper v2.2 — Working Components (Activity-First)

_Last updated: 2025-10-05_

## Backend

- **Queues & Worker** (`worker.js`, `src/queues/gmail/*`)
  - Discovery, extraction, parsing jobs chained via Bull.
  - Entry gates applied in parsing with rejection metadata.
  - Redis persistence via `gmailJobManager.storeCandidates` + TTL.
- **Job manager** (`src/services/gmailJobManager.js`)
  - Tracks phases, metrics, summary counts (candidates, rejected, committed).
  - Exposes results and status for API consumers.
- **Commit endpoint** (`src/routes/donationCommit.js`)
  - Validates edited payloads, dedupes, persists, and updates candidate status.
- **Missing donation feedback** (`src/routes/gmailFeedback.js`, `src/models/MissingDonationFeedback.js`)
  - Stores user reports for reinforcement.

## APIs

| Route | Purpose |
| --- | --- |
| `POST /api/gmail/start-search` | Launch Gmail scrape |
| `GET /api/email-search-status/:jobId` | Phase status + summary |
| `GET /api/email-search-results/:jobId` | Candidates + rejected |
| `POST /api/donations/commit` | Persist selected candidates |
| `POST /api/gmail/missing-donation` | Capture missing donation feedback |
| `GET /api/gmail/missing-donation` | Retrieve user-submitted feedback |

## Frontend (`src/components/Activity/Activity.js`)

- Multi-select Gmail review cards with inline editing (charity, amount, currency, date, type, category).
- Commit bar summarises entry-gate stats and drives `/api/donations/commit` requests.
- Accordion showing filtered-out donations with rejection reasons.
- Missing-donation form captures structured feedback and displays previous submissions.
- Outlook and forwarded flows remain available with legacy commit path.

## Configuration

```
ENABLE_GMAIL_V22=true
GMAIL_RESULTS_ACTIVITY_FIRST=true
GMAIL_RESULTS_TTL_SECONDS=604800  # optional override (7 days default)
```

Ensure Redis, MongoDB, and worker processes share the same environment variables.

