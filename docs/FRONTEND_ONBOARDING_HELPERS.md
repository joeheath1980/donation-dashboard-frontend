# Frontend Onboarding Helpers

This document contains utilities and patterns to reduce boilerplate and improve UX for onboarding.

## Utilities

- parseRetryAfter: Parse `Retry-After` header values (seconds or HTTP date) to seconds.
  - Location: `src/utils/onboarding.helpers.js`
- mapValidationErrors: Normalize validation errors into a single human‑readable message.
  - Location: `src/utils/onboarding.helpers.js`

```js
import { parseRetryAfter, mapValidationErrors } from '../../src/utils/onboarding.helpers';

const retry = response.headers.get('Retry-After');
const seconds = parseRetryAfter(retry) || 30;
```

### authFetch helper (example)

If you need fetch with Authorization + CSRF in one place, this snippet demonstrates the pattern (you can also use `apiClient`).

```js
import { SecureTokenStorage } from '../../src/utils/auth.utils';

export async function authFetch(url, options = {}) {
  const token = SecureTokenStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}
```

## VerificationGate (React)

Disable CTAs until `csrProfile.verificationStatus === 'verified'`.

- Location: `src/components/VerificationGate.jsx`
- Usage:

```jsx
import VerificationGate from '../components/VerificationGate';

<VerificationGate>
  <Link to="/create-business-campaign" className="btn-primary">Create Campaign</Link>
</VerificationGate>
```

When pending, children render disabled and a small banner appears. You can pass a `fallback` node to fully replace children when pending.

## CSR Report Download Button (S3 signed URL or local)

Support both storage modes: first try a signed URL, then fall back to local download.

```jsx
import React from 'react';
import { SecureTokenStorage } from '../../src/utils/auth.utils';

export function CSRDownloadButton() {
  const onClick = async () => {
    const token = SecureTokenStorage.getToken();
    try {
      // 1) Try signed URL (S3)
      const urlRes = await fetch('/api/business/onboarding/csr-report/url', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (urlRes.ok) {
        const data = await urlRes.json();
        if (data?.url) {
          window.open(data.url, '_blank');
          return;
        }
      }
    } catch {}

    try {
      // 2) Fallback to local download
      const dlRes = await fetch('/api/business/onboarding/csr-report/download', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!dlRes.ok) throw new Error('CSR download failed');
      const blob = await dlRes.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'csr-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert('Could not download CSR report.');
    }
  };

  return <button onClick={onClick}>Download CSR Report</button>;
}
```

## Kill‑Switch (503) Fallback Example

When enhanced onboarding is disabled, affected endpoints return `503`. Route users back to the standard onboarding flow with a friendly message.

```js
const res = await authFetch('/api/business/enhanced-onboarding/ai-research', { method: 'POST', body: JSON.stringify(body) });
if (res.status === 503) {
  alert('Enhanced onboarding is temporarily unavailable. Switching to standard onboarding.');
  navigate('/business-onboarding');
  return;
}
```

## AI Research Call with Backoff (429)

```js
const res = await authFetch('/api/business/enhanced-onboarding/ai-research', { method: 'POST', body: JSON.stringify(body) });
if (res.status === 429) {
  const retryAfter = parseRetryAfter(res.headers.get('Retry-After')) || 30;
  setError(`Rate limited. Try again in ${retryAfter} seconds.`);
  setTimeout(() => setError(null), retryAfter * 1000);
  return;
}
```

## Form Error Surfacing

```js
const body = await res.json();
const friendly = mapValidationErrors(body.errors || body.details);
setError(friendly || 'Please check the form and try again.');
```

## Frontend To‑Do (recap)

- Auth headers on enhanced onboarding: Ensure all calls include `Authorization: Bearer <token>`.
- Stop sending `businessId` on enhanced requests (preference, AI research, confirm) — server derives from token.
- Gate CTAs until verified: Disable “Create Campaign” and matching settings until `csrProfile.verificationStatus === 'verified'` (use `VerificationGate`).
- Integrate CSR download button using the snippet above (S3 signed URL, with local fallback).
- Handle 429/503: Parse `Retry-After` and show “Try again in X seconds”; on 503, fall back to the standard onboarding flow.
- Validation mapping: Render field‑level errors from server responses shaped like `{ error: 'Validation failed', details: [...] }` using `mapValidationErrors`.
