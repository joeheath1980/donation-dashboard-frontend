// Centralized API configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002',
  TIMEOUT: 30000,
  WITH_CREDENTIALS: true,
};

// Application external links
export const APP_LINKS = {
  BUG_REPORT_FORM_URL: process.env.REACT_APP_BUG_REPORT_FORM_URL || 'mailto:joeheath@do-nation.space?subject=Beta%20Bug%20Report'
};

// Security Headers
export const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
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
  USER_LOGOUT: '/api/users/logout',
  USER_GIVING_PROFILE: '/api/users/giving-profile',
  
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
  // ARCHIVED: PayPal and Braintree endpoints - replaced with Stripe
  // BRAINTREE_TOKEN: '/api/braintree/client_token',
  // BRAINTREE_CHECKOUT: '/api/braintree/checkout',
  // PAYPAL_CAPTURE: '/api/paypal/capture-order',
  
  // Admin endpoints
  ADMIN_USERS: '/api/admin/users',
  ADMIN_CHARITY_REQUESTS: '/api/charity/admin/link-requests',
  ADMIN_DONATIONS: '/api/admin/donations',
  ADMIN_CAMPAIGNS: '/api/admin/campaigns',
  ADMIN_BUSINESS_PARTNERS: '/api/admin/business-partners',
  ADMIN_CHARITIES: '/api/admin/charities',
  ADMIN_ANALYTICS: '/api/admin/analytics',
  ADMIN_CONTENT: '/api/admin/content',
  
  // Admin Receipt Approval
  ADMIN_RECEIPT_PENDING: '/api/admin/receipt-approval/pending',
  ADMIN_RECEIPT_DETAILS: '/api/admin/receipt-approval/pending',
  ADMIN_RECEIPT_APPROVE: '/api/admin/receipt-approval/approve',
  ADMIN_RECEIPT_REJECT: '/api/admin/receipt-approval/reject',
  ADMIN_RECEIPT_STATS: '/api/admin/receipt-approval/stats',
  
  // Admin Matching Engine
  ADMIN_MATCHING_RULES: '/api/admin/matching/rules',
  ADMIN_MATCHING_STATS: '/api/admin/matching/stats',
  ADMIN_MATCHING_ACTIVE: '/api/admin/matching/active',
  ADMIN_MATCHING_MULTIPLIERS: '/api/admin/matching/multipliers',
  
  // Admin System Health
  ADMIN_HEALTH_DATABASE: '/api/health/database',
  ADMIN_HEALTH_EMAIL: '/api/health/email',
  ADMIN_HEALTH_PAYMENT: '/api/health/payment',
  ADMIN_HEALTH_WEBSOCKET: '/api/health/websocket',
  ADMIN_HEALTH_REDIS: '/api/health/redis',
  ADMIN_HEALTH_OPENAI: '/api/health/openai',
  ADMIN_EMAIL_STATS: '/api/admin/integrations/email-stats',
  ADMIN_WEBSOCKET_STATS: '/api/admin/integrations/websocket-stats',
  ADMIN_API_KEYS: '/api/admin/integrations/api-keys',
  
  // Other endpoints
  MATCHING_OPPORTUNITIES: '/api/matching/opportunities',
  GLOBALGIVING_PROJECTS: '/api/globalgiving/projects/recommended',

  // Public profile endpoints (prefer canonical, keep legacy for fallback)
  PUBLIC_PROFILE_USER: '/api/public/profile',
  PUBLIC_PROFILE_USER_LEGACY: '/api/publicProfiles/user',
  PUBLIC_PROFILE_BUSINESS: '/api/public/profile/business',
  PUBLIC_PROFILE_BUSINESS_LEGACY: '/api/publicProfiles/business',
  PUBLIC_PROFILE_CHARITY: '/api/public/profile/charity',
  PUBLIC_PROFILE_CHARITY_LEGACY: '/api/publicProfiles/charity',
  PUBLIC_PROFILE_SEARCH: '/api/public/profile/search',
  PUBLIC_PROFILE_SEARCH_LEGACY: '/api/publicProfiles/search',
  PUBLIC_PROFILE_ACTIVITY_ROOT: '/api/public/profile',
  PUBLIC_PROFILE_ACTIVITY_LEGACY_ROOT: '/api/publicProfiles',
  
  // Email forwarding endpoints
  EMAIL_FORWARD_STATUS: '/api/email/forward-status',
  EMAIL_FORWARD_SETUP: '/api/email/forward-setup',
  EMAIL_FORWARD_VERIFY: '/api/email/forward-verify',
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
