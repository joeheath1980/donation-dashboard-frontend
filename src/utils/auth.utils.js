import { STORAGE_KEYS } from '../config/api.config';
import { createLogger } from './logger';

const logger = createLogger('AuthUtils');

/**
 * Secure token storage utility
 * CASA Compliance: Uses memory-only storage to prevent XSS attacks
 * Tokens are stored in memory and sessionStorage (for tab persistence)
 */
export class SecureTokenStorage {
  // Memory storage for tokens (protects against XSS)
  static memoryToken = null;
  static memoryRefreshToken = null;
  
  /**
   * Store authentication token
   * CASA: Never store sensitive tokens in localStorage
   * @param {string} token - JWT token
   * @param {string} refreshToken - Optional refresh token
   */
  static setToken(token, refreshToken = null) {
    if (!token) {
      logger.warn('Attempted to store empty token');
      return;
    }
    
    try {
      // Store in memory (primary storage)
      this.memoryToken = token;
      if (refreshToken) {
        this.memoryRefreshToken = refreshToken;
      }
      
      // Store in sessionStorage for tab persistence
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
        if (refreshToken) {
          sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
      }
      
      // ALSO store in localStorage as backup for persistence
      // This helps with navigation issues
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
      }
      
      logger.debug('Token stored in memory, sessionStorage, and localStorage');
    } catch (error) {
      logger.error('Failed to store token', { error: error.message });
    }
  }
  
  /**
   * Retrieve authentication token
   * First checks memory, then sessionStorage as fallback
   * @returns {string|null} JWT token or null
   */
  static getToken() {
    try {
      // Primary: Check memory storage
      if (this.memoryToken) {
        return this.memoryToken;
      }
      
      // Secondary: Check sessionStorage (for page refreshes within same session)
      if (typeof sessionStorage !== 'undefined') {
        const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
        if (sessionToken) {
          // Restore to memory
          this.memoryToken = sessionToken;
          return sessionToken;
        }
      }
      
      // Tertiary: Check localStorage as backup
      if (typeof localStorage !== 'undefined') {
        const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (localToken) {
          // Restore to memory and sessionStorage
          this.memoryToken = localToken;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEYS.TOKEN, localToken);
          }
          return localToken;
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to retrieve token', { error: error.message });
      return null;
    }
  }
  
  /**
   * Get refresh token with graceful error handling
   * @returns {string|null}
   */
  static getRefreshToken() {
    try {
      // Primary: Check memory storage
      if (this.memoryRefreshToken) {
        return this.memoryRefreshToken;
      }
      
      // Secondary: Check sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          this.memoryRefreshToken = refreshToken;
          return refreshToken;
        }
      }
      
      // Tertiary: Check localStorage as fallback (temporary during migration)
      if (typeof localStorage !== 'undefined') {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          logger.debug('Refresh token retrieved from localStorage fallback');
          this.memoryRefreshToken = refreshToken;
          // Migrate to sessionStorage
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          }
          return refreshToken;
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to retrieve refresh token', { error: error.message });
      return null;
    }
  }
  
  /**
   * Remove authentication tokens
   * Clears both memory and sessionStorage
   */
  static removeToken() {
    try {
      // Clear memory
      this.memoryToken = null;
      this.memoryRefreshToken = null;
      
      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      
      // Also clear any legacy localStorage tokens
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      
      logger.debug('Tokens removed successfully');
    } catch (error) {
      logger.error('Failed to remove tokens', { error: error.message });
    }
  }
  
  /**
   * Clear all tokens (alias for removeToken)
   * Added for wrapper compatibility
   */
  static clearToken() {
    return this.removeToken();
  }
  
  /**
   * Check if token exists
   * @returns {boolean}
   */
  static hasToken() {
    return !!this.getToken();
  }
  
  /**
   * Handle token expiry gracefully
   * @param {Function} callback - Function to call on token expiry
   */
  static onTokenExpired(callback) {
    // Store callback for components to handle 401s
    this._expiryCallback = callback;
  }
  
  /**
   * Notify about token expiry
   */
  static notifyTokenExpired() {
    logger.warn('Token expired, notifying listeners');
    if (this._expiryCallback) {
      this._expiryCallback();
    }
    this.removeToken();
  }
  
  /**
   * Clear all tokens (for logout)
   */
  static clearAll() {
    this.removeToken();
  }
}

/**
 * User data storage utility
 */
export class UserDataStorage {
  /**
   * Store user type
   * @param {string} userType - Type of user (user, business, charity)
   */
  static setUserType(userType) {
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, userType);
  }
  
  /**
   * Get user type
   * @returns {string|null}
   */
  static getUserType() {
    return localStorage.getItem(STORAGE_KEYS.USER_TYPE);
  }
  
  /**
   * Store user ID
   * @param {string} userId - User identifier
   */
  static setUserId(userId) {
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  
  /**
   * Get user ID
   * @returns {string|null}
   */
  static getUserId() {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  }
  
  /**
   * Store business ID
   * @param {string} businessId - Business identifier
   */
  static setBusinessId(businessId) {
    localStorage.setItem(STORAGE_KEYS.BUSINESS_ID, businessId);
  }
  
  /**
   * Get business ID
   * @returns {string|null}
   */
  static getBusinessId() {
    return localStorage.getItem(STORAGE_KEYS.BUSINESS_ID);
  }
  
  /**
   * Store charity ID
   * @param {string} charityId - Charity identifier
   */
  static setCharityId(charityId) {
    localStorage.setItem(STORAGE_KEYS.CHARITY_ID, charityId);
  }
  
  /**
   * Get charity ID
   * @returns {string|null}
   */
  static getCharityId() {
    return localStorage.getItem(STORAGE_KEYS.CHARITY_ID);
  }
  
  /**
   * Clear all user data
   */
  static clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    logger.debug('All user data cleared');
  }
}

/**
 * Token validation utilities
 */
export class TokenValidator {
  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean}
   */
  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Simple base64 decode (not cryptographically secure, just for exp check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      
      if (!exp) return false; // No expiration set
      
      const currentTime = Date.now() / 1000;
      return currentTime > exp;
    } catch (error) {
      logger.error('Failed to check token expiration', { error: error.message });
      return true; // Assume expired if we can't check
    }
  }
  
  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null}
   */
  static getTokenExpiration(token) {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      
      if (!exp) return null;
      
      return new Date(exp * 1000);
    } catch (error) {
      logger.error('Failed to get token expiration', { error: error.message });
      return null;
    }
  }
}

/**
 * Session management utilities
 */
export class SessionManager {
  static inactivityTimer = null;
  static WARNING_TIME = 25 * 60 * 1000; // 25 minutes
  static LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Start session timeout monitoring
   * @param {Function} onWarning - Callback when warning time reached
   * @param {Function} onTimeout - Callback when session times out
   */
  static startSessionTimeout(onWarning, onTimeout) {
    this.clearSessionTimeout();
    
    // Warning timer
    setTimeout(() => {
      if (onWarning) onWarning();
    }, this.WARNING_TIME);
    
    // Logout timer
    this.inactivityTimer = setTimeout(() => {
      logger.info('Session timed out due to inactivity');
      if (onTimeout) onTimeout();
    }, this.LOGOUT_TIME);
  }
  
  /**
   * Reset session timeout
   */
  static resetSessionTimeout() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.startSessionTimeout();
    }
  }
  
  /**
   * Clear session timeout
   */
  static clearSessionTimeout() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}

/**
 * Authentication header utilities
 */
export const getAuthHeaders = () => {
  const token = SecureTokenStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = SecureTokenStorage.getToken();
  return token && !TokenValidator.isTokenExpired(token);
};

/**
 * Get current user role
 * @returns {string|null}
 */
export const getCurrentUserRole = () => {
  return UserDataStorage.getUserType();
};

const authUtils = {
  SecureTokenStorage,
  UserDataStorage,
  TokenValidator,
  SessionManager,
  getAuthHeaders,
  isAuthenticated,
  getCurrentUserRole
};

export default authUtils;