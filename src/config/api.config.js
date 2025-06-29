// Centralized API configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002',
  TIMEOUT: 30000,
  WITH_CREDENTIALS: true,
};

// Security Headers
export const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_TYPE: 'userType',
  USER_ID: 'currentUserId',
  BUSINESS_ID: 'businessId',
  CHARITY_ID: 'charityId',
};

// User Types
export const USER_TYPES = {
  USER: 'user',
  BUSINESS: 'business',
  CHARITY: 'charity',
  ADMIN: 'admin',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  USER_LOGIN: '/api/auth/login',
  USER_REGISTER: '/api/users/register',
  USER_PROFILE: '/api/users/me',
  
  // Business endpoints
  BUSINESS_LOGIN: '/api/business/auth/login',
  BUSINESS_SIGNUP: '/api/business/auth/signup',
  BUSINESS_PROFILE: '/api/business/me',
  BUSINESS_CAMPAIGNS: '/api/business/campaigns',
  
  // Charity endpoints
  CHARITY_LOGIN: '/api/charities/login',
  CHARITY_SIGNUP: '/api/charities/signup',
  CHARITY_PROFILE: '/api/charities/me',
  CHARITY_SEARCH: '/api/search-charities',
  CHARITIES_LIST: '/api/charities',
  
  // Donation endpoints
  DONATIONS: '/api/donations',
  
  // Payment endpoints
  BRAINTREE_TOKEN: '/api/braintree/client_token',
  BRAINTREE_CHECKOUT: '/api/braintree/checkout',
  PAYPAL_CAPTURE: '/api/paypal/capture-order',
  
  // Admin endpoints
  ADMIN_USERS: '/api/admin/users',
  ADMIN_CHARITY_REQUESTS: '/api/charity/admin/link-requests',
  
  // Other endpoints
  MATCHING_OPPORTUNITIES: '/api/matchingOpportunities',
  GLOBALGIVING_PROJECTS: '/api/globalgiving/projects/recommended',
};

// Logging utility - only logs in development
export const secureLog = (message, data) => {
  if (isDevelopment) {
    // Filter out sensitive data
    const sanitizedData = data ? sanitizeData(data) : undefined;
    console.log(`[DEV] ${message}`, sanitizedData);
  }
};

// Sanitize sensitive data from logs
const sanitizeData = (data) => {
  const sensitive = ['token', 'password', 'jwt', 'authorization', 'cookie'];
  
  if (typeof data === 'string') {
    return sensitive.some(term => data.toLowerCase().includes(term)) ? '[REDACTED]' : data;
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitive.some(term => key.toLowerCase().includes(term))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    });
    
    return sanitized;
  }
  
  return data;
};

// Get API URL with endpoint
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Check if HTTPS is being used (for production)
export const checkHttps = () => {
  if (process.env.NODE_ENV === 'production' && !window.location.protocol.includes('https')) {
    console.warn('WARNING: Application should use HTTPS in production');
  }
};

export default API_CONFIG;