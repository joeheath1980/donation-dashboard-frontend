import apiServices from './api.service';
import { createLogger } from '../utils/logger';

const logger = createLogger('OAuthService');

class OAuthService {
  /**
   * Disconnect Google OAuth integration
   * Revokes via Google API and clears tokens
   * @returns {Promise<Object>} Response data
   */
  async disconnectGoogle() {
    try {
      logger.info('Disconnecting Google OAuth');
      const api = apiServices.client;
      const response = await api.post('/api/auth/google/disconnect');
      
      // Clear any cached email data
      this.clearEmailCache('google');
      
      logger.info('Google OAuth disconnected successfully');
      return response.data;
    } catch (error) {
      logger.error('Failed to disconnect Google OAuth', { 
        error: error.message,
        status: error.response?.status 
      });
      throw error;
    }
  }

  /**
   * Disconnect Microsoft OAuth integration
   * Clears tokens locally
   * @returns {Promise<Object>} Response data
   */
  async disconnectMicrosoft() {
    try {
      logger.info('Disconnecting Microsoft OAuth');
      const api = apiServices.client;
      const response = await api.post('/api/auth/microsoft/disconnect');
      
      // Clear any cached email data
      this.clearEmailCache('microsoft');
      
      logger.info('Microsoft OAuth disconnected successfully');
      return response.data;
    } catch (error) {
      logger.error('Failed to disconnect Microsoft OAuth', { 
        error: error.message,
        status: error.response?.status 
      });
      throw error;
    }
  }

  /**
   * Check OAuth connection status
   * @returns {Promise<Object>} Connection status for each provider
   */
  async getConnectionStatus() {
    try {
      const api = apiServices.client;
      const response = await api.get('/api/auth/oauth/status');
      return response.data;
    } catch (error) {
      logger.error('Failed to get OAuth status', { error: error.message });
      return {
        google: { connected: false },
        microsoft: { connected: false }
      };
    }
  }

  /**
   * Clear cached email data for a provider
   * @param {string} provider - 'google' or 'microsoft'
   */
  clearEmailCache(provider) {
    try {
      // Clear provider-specific email cache from localStorage
      const keysToRemove = [
        `${provider}_email_cache`,
        `${provider}_email_sync_time`,
        `${provider}_email_folders`,
        `${provider}_email_attachments`,
        `email_forwarding_${provider}`,
        `last_${provider}_sync`
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      logger.debug(`Cleared email cache for ${provider}`);
    } catch (error) {
      logger.error(`Failed to clear email cache for ${provider}`, { error: error.message });
    }
  }

  /**
   * Clear all OAuth-related data
   */
  clearAllOAuthData() {
    this.clearEmailCache('google');
    this.clearEmailCache('microsoft');
    
    // Clear any general OAuth data
    localStorage.removeItem('oauth_connections');
    sessionStorage.removeItem('oauth_connections');
  }
}

// Create singleton instance
const oauthService = new OAuthService();

export default oauthService;