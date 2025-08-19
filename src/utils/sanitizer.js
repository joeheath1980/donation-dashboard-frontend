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
    ALLOWED_STYLE_PROPS: ['color', 'font-size', 'font-weight', 'opacity'],
    KEEP_CONTENT: true, // Keep text content even if tags are removed
  };
  
  return DOMPurify.sanitize(dirtyString, config);
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