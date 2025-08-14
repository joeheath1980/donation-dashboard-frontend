/**
 * Dynamic style utilities for CSP compliance
 * These utilities help handle dynamic styles without inline CSS
 */

// Common color mappings
const COLOR_MAP = {
  // Status colors
  'active': '#10b981',
  'inactive': '#6c757d',
  'pending': '#f59e0b',
  'completed': '#10b981',
  'failed': '#dc2626',
  'error': '#dc2626',
  'success': '#10b981',
  'warning': '#f59e0b',
  'info': '#3b82f6',
  
  // Tier colors
  'bronze': '#CD7F32',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'platinum': '#E5E4E2',
  'diamond': '#B9F2FF',
  
  // Chart/Category colors
  'category1': '#2D8F7B',
  'category2': '#48BB78',
  'category3': '#38A169',
  'category4': '#68D391',
  'category5': '#9AE6B4',
  
  // Default
  'default': '#6c757d',
  'primary': '#2d8f7b',
  'secondary': '#6c757d',
  'muted': '#6c757d'
};

/**
 * Get CSS class for a color value
 * @param {string} color - Color hex code or name
 * @returns {string} - CSS class name
 */
export const getColorClass = (color) => {
  if (!color) return '';
  
  // Check if it's a known color name
  const colorName = Object.keys(COLOR_MAP).find(key => COLOR_MAP[key] === color);
  if (colorName) {
    return `color-${colorName}`;
  }
  
  // Check if it's a hex color
  if (color.startsWith('#')) {
    const cleanHex = color.replace('#', '').toLowerCase();
    return `color-hex-${cleanHex}`;
  }
  
  // Return as-is if it's already a class name
  return color.includes('-') ? color : 'color-default';
};

/**
 * Get CSS class for background color
 * @param {string} color - Color hex code or name
 * @returns {string} - CSS class name
 */
export const getBackgroundClass = (color) => {
  if (!color) return '';
  
  const colorName = Object.keys(COLOR_MAP).find(key => COLOR_MAP[key] === color);
  if (colorName) {
    return `bg-${colorName}`;
  }
  
  if (color.startsWith('#')) {
    const cleanHex = color.replace('#', '').toLowerCase();
    return `bg-hex-${cleanHex}`;
  }
  
  return 'bg-default';
};

/**
 * Create conditional classes based on conditions
 * @param {Object} conditions - Object with className: condition pairs
 * @returns {string} - Space-separated class names
 */
export const conditionalClasses = (conditions) => {
  return Object.entries(conditions)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
};

/**
 * Get display class based on condition
 * @param {boolean} isVisible - Visibility condition
 * @param {string} displayType - Display type when visible (default: 'block')
 * @returns {string} - CSS class name
 */
export const getDisplayClass = (isVisible, displayType = 'block') => {
  return isVisible ? `display-${displayType}` : 'display-none';
};

/**
 * Get opacity class based on value
 * @param {number|boolean} opacity - Opacity value (0-1) or boolean
 * @returns {string} - CSS class name
 */
export const getOpacityClass = (opacity) => {
  if (typeof opacity === 'boolean') {
    return opacity ? 'opacity-10' : 'opacity-5';
  }
  
  const opacityValue = Math.round(opacity * 10);
  return `opacity-${Math.min(10, Math.max(0, opacityValue))}`;
};

/**
 * Get width class for percentage values
 * @param {number} percentage - Width percentage (0-100)
 * @returns {string} - CSS class name
 */
export const getWidthClass = (percentage) => {
  const rounded = Math.round(percentage / 5) * 5;
  return `width-${Math.min(100, Math.max(0, rounded))}`;
};

/**
 * Get transform classes for common transforms
 * @param {Object} transforms - Transform properties
 * @returns {string} - CSS class name
 */
export const getTransformClass = (transforms) => {
  const classes = [];
  
  if (transforms.rotate !== undefined) {
    const rotation = Math.round(transforms.rotate / 45) * 45;
    classes.push(`rotate-${rotation}`);
  }
  
  if (transforms.scale !== undefined) {
    const scale = Math.round(transforms.scale * 10);
    classes.push(`scale-${scale}`);
  }
  
  if (transforms.translateX !== undefined) {
    classes.push(`translate-x-${transforms.translateX}`);
  }
  
  if (transforms.translateY !== undefined) {
    classes.push(`translate-y-${transforms.translateY}`);
  }
  
  return classes.join(' ');
};

/**
 * Map tier to color class
 * @param {string} tier - Tier name
 * @returns {string} - CSS class name
 */
export const getTierColorClass = (tier) => {
  const tierMap = {
    'bronze': 'tier-bronze',
    'silver': 'tier-silver', 
    'gold': 'tier-gold',
    'platinum': 'tier-platinum',
    'diamond': 'tier-diamond'
  };
  
  return tierMap[tier?.toLowerCase()] || 'tier-bronze';
};

/**
 * Map status to color class
 * @param {string} status - Status value
 * @returns {string} - CSS class name
 */
export const getStatusColorClass = (status) => {
  const statusMap = {
    'active': 'status-active',
    'inactive': 'status-inactive',
    'pending': 'status-pending',
    'completed': 'status-completed',
    'failed': 'status-failed',
    'success': 'status-success',
    'error': 'status-error',
    'warning': 'status-warning'
  };
  
  return statusMap[status?.toLowerCase()] || 'status-default';
};

/**
 * Generate data attributes for CSS styling
 * @param {Object} attributes - Attribute values
 * @returns {Object} - Data attributes object
 */
export const createDataAttributes = (attributes) => {
  const dataAttrs = {};
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      dataAttrs[`data-${key.toLowerCase()}`] = value;
    }
  });
  
  return dataAttrs;
};