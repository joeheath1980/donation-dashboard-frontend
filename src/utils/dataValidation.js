// Shared utility functions for data validation across business profile components

/**
 * Utility function for API calls with fallback data
 * @param {string} endpoint - API endpoint to fetch
 * @param {Object} fallbackData - Default data to return on error
 * @returns {Promise<Object>} API response or fallback data
 */
export const fetchWithFallback = async (endpoint, fallbackData = {}) => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint}, using fallback`);
    return fallbackData;
  }
};

/**
 * Check if ESG scores contain any valid (non-zero) data
 * @param {Object} scores - ESG scores object
 * @returns {boolean} True if any score is greater than 0
 */
export const hasValidESGScores = (scores) => {
  return scores && (
    scores.environmental > 0 || 
    scores.social > 0 || 
    scores.governance > 0
  );
};

/**
 * Check if sustainability metrics contain any valid (non-zero) data
 * @param {Object} metrics - Sustainability metrics object
 * @returns {boolean} True if any metric value is greater than 0
 */
export const hasValidMetrics = (metrics) => {
  return metrics && Object.values(metrics).some(v => v > 0);
};

/**
 * Check if performance metrics have meaningful data
 * @param {Object} metrics - Performance metrics object
 * @returns {boolean} True if any meaningful metric exists
 */
export const hasValidPerformanceMetrics = (metrics) => {
  return metrics && (
    (metrics.monthlyTrend && metrics.monthlyTrend.length > 0) ||
    metrics.employeeEngagement > 0 ||
    metrics.budgetUtilization > 0 ||
    metrics.averageMultiplier > 1 ||
    metrics.donorRetention > 0 ||
    (metrics.yearOverYear && (metrics.yearOverYear.amount > 0 || metrics.yearOverYear.donors > 0))
  );
};

/**
 * Check if activity stats have meaningful data
 * @param {Object} stats - Activity stats object
 * @returns {boolean} True if any stat is greater than 0
 */
export const hasValidActivityStats = (stats) => {
  return stats && (
    stats.activeDonors > 0 || 
    stats.todayTotal > 0 || 
    stats.currentStreak > 0
  );
};

/**
 * Format large numbers for display (e.g., 1500 -> "1.5K")
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Data Quality Badge configuration
 */
export const DATA_QUALITY_BADGES = {
  high: { color: 'green', label: 'Verified Data' },
  medium: { color: 'yellow', label: 'Partial Data' },
  low: { color: 'orange', label: 'Limited Data' },
  none: { color: 'gray', label: 'Estimated' }
};

/**
 * Get data quality badge configuration
 * @param {string} quality - Data quality level
 * @returns {Object} Badge configuration object
 */
export const getDataQualityBadge = (quality) => {
  return DATA_QUALITY_BADGES[quality] || DATA_QUALITY_BADGES.none;
};

/**
 * Check if impact score is valid for display
 * @param {number} score - Impact score
 * @returns {boolean} True if score should be displayed
 */
export const hasValidImpactScore = (score) => {
  return score && score > 0;
};

/**
 * Check if impact score should be shown as provisional
 * @param {number} score - Impact score
 * @returns {boolean} True if score should show provisional state
 */
export const isProvisionalScore = (score) => {
  return score > 0 && score < 30;
};