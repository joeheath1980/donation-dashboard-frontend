import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { createLogger } from '../utils/logger';

const logger = createLogger('CSRFService');

class CSRFTokenService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.fetchPromise = null;
  }

  /**
   * Get the current CSRF token, fetching a new one if needed
   * @returns {Promise<string>} The CSRF token
   */
  async getToken() {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      logger.debug('Using cached CSRF token');
      return this.token;
    }

    // If a fetch is already in progress, wait for it
    if (this.fetchPromise) {
      logger.debug('Waiting for in-progress CSRF token fetch');
      return this.fetchPromise;
    }

    // Fetch a new token
    this.fetchPromise = this.fetchToken();
    
    try {
      const token = await this.fetchPromise;
      return token;
    } finally {
      this.fetchPromise = null;
    }
  }

  /**
   * Fetch a new CSRF token from the server
   * @returns {Promise<string>} The CSRF token
   */
  async fetchToken() {
    try {
      logger.info('Fetching new CSRF token');
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/csrf-token`, {
        withCredentials: true, // Include cookies for XSRF-TOKEN
        timeout: 10000
      });

      if (response.data && response.data.csrfToken) {
        this.token = response.data.csrfToken;
        // Token expires in 1 hour, refresh after 50 minutes
        this.tokenExpiry = new Date(Date.now() + 50 * 60 * 1000);
        
        logger.info('CSRF token fetched successfully');
        return this.token;
      } else {
        throw new Error('Invalid CSRF token response');
      }
    } catch (error) {
      logger.error('Failed to fetch CSRF token', { 
        error: error.message,
        status: error.response?.status 
      });
      
      // For security, throw error to prevent state-changing requests without CSRF token
      // Only allow proceeding without token for safe methods (GET, HEAD, OPTIONS)
      throw new Error(`CSRF token fetch failed: ${error.message}`);
    }
  }

  /**
   * Clear the cached token (e.g., on logout)
   */
  clearToken() {
    logger.debug('Clearing CSRF token');
    this.token = null;
    this.tokenExpiry = null;
    this.fetchPromise = null;
  }

  /**
   * Force refresh the token
   * @returns {Promise<string>} The new CSRF token
   */
  async refreshToken() {
    logger.info('Force refreshing CSRF token');
    this.clearToken();
    return this.getToken();
  }

  /**
   * Check if token needs refresh (less than 10 minutes remaining)
   * @returns {boolean}
   */
  needsRefresh() {
    if (!this.tokenExpiry) return true;
    
    const minutesRemaining = (this.tokenExpiry - new Date()) / (1000 * 60);
    return minutesRemaining < 10;
  }

  /**
   * Get token from cookie (fallback method)
   * @returns {string|null}
   */
  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        logger.debug('Found CSRF token in cookie');
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Add CSRF token to request config
   * @param {Object} config - Axios request config
   * @returns {Object} Modified config with CSRF token
   */
  async addTokenToRequest(config) {
    logger.debug('CSRF: addTokenToRequest called for', config.url, 'method:', config.method);
    
    // Skip CSRF for GET, HEAD, OPTIONS requests
    const safeMethods = ['get', 'head', 'options'];
    if (safeMethods.includes(config.method?.toLowerCase())) {
      logger.debug('CSRF: Skipping safe method');
      return config;
    }

    // Skip if Authorization header with Bearer token exists (JWT auth)
    if (config.headers?.Authorization?.startsWith('Bearer ')) {
      logger.debug('Skipping CSRF for JWT authenticated request');
      logger.debug('CSRF: Skipping - has Bearer token');
      return config;
    }

    // Get CSRF token
    let token;
    try {
      token = await this.getToken();
      logger.debug('CSRF: Token from getToken:', token ? 'found' : 'not found');
    } catch (error) {
      // If token fetch fails, try cookie as fallback
      logger.warn('Primary CSRF token fetch failed, trying cookie fallback');
      token = this.getTokenFromCookie();
      
      if (!token) {
        // For state-changing requests, we MUST have a CSRF token
        logger.error('CSRF: CRITICAL - No token available for state-changing request!');
        throw new Error('CSRF token required for state-changing requests');
      }
    }

    if (token) {
      // Add token to headers (primary method)
      config.headers = config.headers || {};
      config.headers['X-CSRF-Token'] = token;
      
      // Also add to body for form submissions
      if (config.data && typeof config.data === 'object' && 
          !(config.data instanceof FormData) && 
          config.headers['Content-Type'] !== 'multipart/form-data') {
        config.data._csrf = token;
      }
      
      logger.debug('CSRF: Added token to request', {
        header: config.headers['X-CSRF-Token'] ? 'yes' : 'no',
        body: config.data?._csrf ? 'yes' : 'no'
      });
      
      logger.debug('Added CSRF token to request', { 
        method: config.method,
        url: config.url 
      });
    } else {
      // This should never happen now due to the throw above
      logger.error('CSRF: CRITICAL - Token validation failed');
      throw new Error('CSRF token validation failed');
    }

    return config;
  }

  /**
   * Handle CSRF token error in response
   * @param {Error} error - Axios error object
   * @returns {Promise}
   */
  async handleCSRFError(error) {
    if (error.response?.status === 403 && 
        error.response?.data?.error?.includes('CSRF')) {
      logger.warn('CSRF token error, refreshing token');
      
      // Refresh the token
      await this.refreshToken();
      
      // Retry the original request with new token
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Add new token to request
        const newConfig = await this.addTokenToRequest(originalRequest);
        
        // Retry with axios directly to avoid interceptor loop
        return axios.request(newConfig);
      }
    }
    
    return Promise.reject(error);
  }
}

// Create singleton instance
const csrfService = new CSRFTokenService();

// Auto-refresh token periodically
setInterval(() => {
  if (csrfService.needsRefresh()) {
    logger.info('Auto-refreshing CSRF token');
    csrfService.refreshToken().catch(err => {
      logger.error('Auto-refresh failed', { error: err.message });
    });
  }
}, 5 * 60 * 1000); // Check every 5 minutes

export default csrfService;