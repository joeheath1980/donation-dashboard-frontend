import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML string to prevent XSS attacks
 * Allows safe HTML tags but removes dangerous attributes and scripts
 */
export const sanitizeHTML = (dirty) => {
  // Return empty string for null/undefined
  if (!dirty) return '';
  
  // Convert to string if not already
  const dirtyString = String(dirty);
  
  // Configure DOMPurify to allow safe tags only
  const config = {
    ALLOWED_TAGS: ['span', 'div', 'i', 'b', 'strong', 'em', 'br', 'hr'],
    ALLOWED_ATTR: ['class', 'style'],
    KEEP_CONTENT: true, // Keep text content even if tags are removed
  };

  // Strictly control which inline CSS is allowed in style attribute
  const ALLOWED_STYLE_PROPS = new Set(['color', 'font-size', 'font-weight', 'opacity']);
  
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (data.attrName === 'style') {
      const safeRules = [];
      const rules = String(data.attrValue).split(';');
      for (const rule of rules) {
        if (!rule.trim()) continue;
        const [rawProp, ...rest] = rule.split(':');
        if (!rawProp || rest.length === 0) continue;
        const prop = rawProp.trim().toLowerCase();
        const value = rest.join(':').trim();
        if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
        const lowerVal = value.toLowerCase();
        // Block any javascript, expression, or url() usage
        if (lowerVal.includes('javascript') || lowerVal.includes('expression') || lowerVal.includes('url(')) continue;
        safeRules.push(`${prop}: ${value}`);
      }
      if (safeRules.length) {
        data.attrValue = safeRules.join('; ');
      } else {
        // Drop style attribute entirely if no safe rules remain
        data.keepAttr = false;
      }
    }
  });
  
  const clean = DOMPurify.sanitize(dirtyString, config);
  // Remove hooks to avoid side effects for subsequent calls
  if (DOMPurify.removeAllHooks) DOMPurify.removeAllHooks();
  return clean;
};

/**
 * Escapes HTML special characters for safe display as text
 * Use this when you want to display user input as plain text only
 */
export const escapeHTML = (unsafe) => {
  if (!unsafe) return '';
  
  const text = String(unsafe);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitizes user data for tooltip display
 * Escapes user input while preserving safe formatting
 */
export const sanitizeTooltipData = (data) => {
  if (!data) return '';
  
  // For user-provided data, escape HTML to prevent XSS
  // This ensures malicious input like <script> becomes &lt;script&gt;
  return escapeHTML(data);
};
