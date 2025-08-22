// Helper to parse Retry-After header values (seconds or HTTP-date)
export function parseRetryAfter(value) {
  if (!value) return null;
  // Numeric seconds
  const asNum = Number(value);
  if (Number.isFinite(asNum)) return Math.max(0, Math.floor(asNum));
  // HTTP-date
  const ts = Date.parse(value);
  if (!Number.isNaN(ts)) {
    const diffMs = ts - Date.now();
    return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
  }
  return null;
}

// Map server-side validation errors into a flat string for display
// Accepts arrays like [{ field, message }] or objects { field: message }
export function mapValidationErrors(errors) {
  if (!errors) return '';
  if (Array.isArray(errors)) {
    return errors.map(e => (e && (e.message || e.error || String(e)))).filter(Boolean).join('; ');
  }
  if (typeof errors === 'object') {
    return Object.entries(errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
  }
  return String(errors);
}

