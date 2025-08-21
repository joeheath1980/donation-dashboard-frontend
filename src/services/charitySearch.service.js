import { apiClient } from './api.service';
import { SecureTokenStorage } from '../utils/auth.utils';
import { createLogger } from '../utils/logger';

const logger = createLogger('CharitySearchService');

class CharitySearchService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || '';
    this.token = SecureTokenStorage.getToken();
  }

  setAuthToken(token) {
    this.token = token;
  }

  async searchCharities(query, limit = 10) {
    try {
      const response = await apiClient.get(`/api/charity-search/simple`, { params: { q: query, limit } });
      return response.data;
    } catch (error) {
      logger.error('Error searching charities', { error: error.message });
      throw error;
    }
  }

  async getCharityDetails(abn) {
    try {
      const response = await apiClient.get(`/api/charity-search/details/${abn}`);
      return response.data;
    } catch (error) {
      logger.error('Error getting charity details', { error: error.message });
      throw error;
    }
  }
}

export const charitySearchService = new CharitySearchService();
