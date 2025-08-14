/**
 * CSP-safe styling utilities
 * These utilities help apply dynamic styles without using inline style attributes,
 * which would violate Content Security Policy restrictions.
 */

/**
 * Creates CSS custom properties (variables) for dynamic values
 * @param {Object} values - Object with CSS variable names and values
 * @returns {Object} - Object with CSS custom properties
 */
export const createCSSVariables = (values) => {
  const cssVars = {};
  Object.entries(values).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    cssVars[cssVarName] = value;
  });
  return cssVars;
};

/**
 * Generates data attributes for CSS styling
 * @param {Object} attributes - Object with data attribute names and values
 * @returns {Object} - Object with data attributes
 */
export const createDataAttributes = (attributes) => {
  const dataAttrs = {};
  Object.entries(attributes).forEach(([key, value]) => {
    dataAttrs[`data-${key}`] = value;
  });
  return dataAttrs;
};

/**
 * Creates className string based on conditions
 * @param {Object} classes - Object with className as key and condition as value
 * @returns {string} - Space-separated className string
 */
export const conditionalClasses = (classes) => {
  return Object.entries(classes)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
};

/**
 * Generates width/height classes for common percentages
 * @param {number} percentage - Percentage value (0-100)
 * @returns {string} - CSS class name for the percentage
 */
export const getPercentageClass = (percentage) => {
  // Round to nearest 5% for predefined classes
  const rounded = Math.round(percentage / 5) * 5;
  return `width-${rounded}`;
};

/**
 * Generates opacity classes
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} - CSS class name for the opacity
 */
export const getOpacityClass = (opacity) => {
  const opacityValue = Math.round(opacity * 10);
  return `opacity-${opacityValue}`;
};