import { sanitizeHTML, escapeHTML, sanitizeTooltipData } from './sanitizer';

describe('HTML Sanitization', () => {
  describe('sanitizeTooltipData', () => {
    it('should escape script tags', () => {
      const malicious = '<script>alert("XSS")</script>';
      const result = sanitizeTooltipData(malicious);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;&#x2F;script&gt;');
    });

    it('should escape onclick attributes', () => {
      const malicious = '<div onclick="alert(\'XSS\')">Click me</div>';
      const result = sanitizeTooltipData(malicious);
      expect(result).not.toContain('<div');
      expect(result).toContain('&lt;div');
      expect(result).toContain('&lt;&#x2F;div&gt;');
    });

    it('should escape img tags with onerror', () => {
      const malicious = '<img src=x onerror="alert(\'XSS\')">';
      const result = sanitizeTooltipData(malicious);
      expect(result).not.toContain('<img');
      expect(result).toContain('&lt;img');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeTooltipData(null)).toBe('');
      expect(sanitizeTooltipData(undefined)).toBe('');
    });

    it('should preserve safe text', () => {
      const safe = 'This is a safe donation to Red Cross';
      const result = sanitizeTooltipData(safe);
      expect(result).toBe('This is a safe donation to Red Cross');
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags but keep content', () => {
      const html = '<div>Hello <script>alert("XSS")</script>World</div>';
      const result = sanitizeHTML(html);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove dangerous attributes', () => {
      const html = '<div onclick="alert(\'XSS\')" class="safe">Content</div>';
      const result = sanitizeHTML(html);
      expect(result).toContain('class="safe"');
      expect(result).not.toContain('onclick');
    });

    it('should allow safe HTML tags', () => {
      const html = '<span class="tooltip"><strong>Bold</strong> and <em>italic</em></span>';
      const result = sanitizeHTML(html);
      expect(result).toContain('<span');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
    });

    it('should allow safe style properties', () => {
      const html = '<span style="color: red; font-weight: bold;">Text</span>';
      const result = sanitizeHTML(html);
      expect(result).toContain('color:');
      expect(result).toContain('font-weight:');
    });

    it('should remove dangerous style properties', () => {
      const html = '<span style="position: absolute; background: url(javascript:alert(1))">Text</span>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('position');
      expect(result).not.toContain('javascript');
    });
  });

  describe('escapeHTML', () => {
    it('should escape all HTML special characters', () => {
      const unsafe = '&<>"\'/ Test';
      const result = escapeHTML(unsafe);
      expect(result).toBe('&amp;&lt;&gt;&quot;&#039;&#x2F; Test');
    });

    it('should handle complex XSS attempts', () => {
      const xss = '</script><script>alert(String.fromCharCode(88,83,83))</script>';
      const result = escapeHTML(xss);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });
});

// Test data that simulates malicious user input
export const maliciousTestData = {
  activities: [
    {
      type: 'donation',
      details: '<script>alert("XSS in details")</script>$100',
      recipient: '<img src=x onerror="alert(\'XSS in recipient\')">Red Cross',
      pointsEarned: 100,
      isDecayed: false
    },
    {
      type: 'volunteer',
      details: 'onclick="alert()" 5 hours',
      recipient: '"><script>alert(1)</script>',
      pointsEarned: 50,
      isDecayed: false
    }
  ]
};