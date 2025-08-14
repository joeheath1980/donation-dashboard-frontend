import { sanitizeText } from '../utils/sanitize';

describe('sanitizeText', () => {
  it('escapes HTML tags to prevent XSS', () => {
    const malicious = '<img src=x onerror=alert(1) />';
    const sanitized = sanitizeText(malicious);
    expect(sanitized).toBe('&lt;img src=x onerror=alert(1) /&gt;');
    expect(sanitized).not.toContain('<img');
  });

  it('handles quotes correctly', () => {
    const malicious = '"double" and \'single\'';
    const sanitized = sanitizeText(malicious);
    expect(sanitized).toBe('&quot;double&quot; and &#39;single&#39;');
  });
});
