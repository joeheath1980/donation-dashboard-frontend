import { STORAGE_KEYS } from '../config/api.config';
import { createLogger } from './logger';

const logger = createLogger('AuthUtils');

/**
 * Secure token storage utility
 * Future: Implement httpOnly cookie support
 */
export class SecureTokenStorage {
  /**
   * Store authentication token
   * @param {string} token - JWT token
   */
  static setToken(token) {
    if (!token) {
      logger.warn('Attempted to store empty token');
      return;
    }
    
    // TODO: In production, this should use httpOnly cookies
    // For now, we use localStorage but log the security concern
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Using localStorage for token storage in production - migrate to httpOnly cookies');
    }
    
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      logger.debug('Token stored successfully');
    } catch (error) {
      logger.error('Failed to store token', { error: error.message });
    }
  }
  
  /**
   * Retrieve authentication token
   * @returns {string|null} JWT token or null
   */
  static getToken() {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      return token;
    } catch (error) {
      logger.error('Failed to retrieve token', { error: error.message });
      return null;
    }
  }
  
  /**
   * Remove authentication token
   */
  static removeToken() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      logger.debug('Token removed successfully');
    } catch (error) {
      logger.error('Failed to remove token', { error: error.message });
    }
  }
  
  /**
   * Check if token exists
   * @returns {boolean}
   */
  static hasToken() {
    return !!this.getToken();
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