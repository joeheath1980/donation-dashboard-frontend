import { createLogger } from './logger';
import { apiClient } from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

const logger = createLogger('AuthUtils');

/**
 * Token management now relies on httpOnly cookies handled by the server.
 * Methods in this utility act as no-ops or proxy to server endpoints
 * and avoid any client-side storage like localStorage.
 */
export class SecureTokenStorage {
  /**
   * Tokens are set by the backend via httpOnly cookies. This method is kept
   * for backward compatibility but simply logs a warning.
   */
  static setToken() {
    logger.warn('setToken called but tokens are managed by httpOnly cookies');
  }

  /**
   * Retrieve token. With httpOnly cookies the token is not accessible
   * from JavaScript, so this always returns null.
   */
  static getToken() {
    return null;
  }

  /**
   * Remove authentication token by calling the logout endpoint which
   * clears the cookie on the server side.
   */
  static async removeToken() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
      logger.debug('Auth cookie cleared via logout endpoint');
    } catch (error) {
      logger.error('Failed to clear auth cookie', { error: error.message });
    }
  }

  /**
   * Since the token is inaccessible, this simply returns false and should
   * not be relied upon for auth checks.
   */
  static hasToken() {
    return false;
  }
}

/**
 * In-memory user data storage to replace previous localStorage usage.
 * This helps components that relied on these helpers while centralising
 * state in memory only.
 */
export class UserDataStorage {
  static user = {};

  static setUserType(userType) {
    this.user.userType = userType;
  }

  static getUserType() {
    return this.user.userType || null;
  }

  static setUserId(userId) {
    this.user.userId = userId;
  }

  static getUserId() {
    return this.user.userId || null;
  }

  static setBusinessId(businessId) {
    this.user.businessId = businessId;
  }

  static getBusinessId() {
    return this.user.businessId || null;
  }

  static setCharityId(charityId) {
    this.user.charityId = charityId;
  }

  static getCharityId() {
    return this.user.charityId || null;
  }

  static clearAll() {
    this.user = {};
    logger.debug('All user data cleared');
  }
}
