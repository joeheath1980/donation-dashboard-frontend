import axios from 'axios';
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
      const response = await axios.get(`${this.baseURL}/api/charity-search/simple`, {
        params: { q: query, limit },
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error searching charities', { error: error.message });
      throw error;
    }
  }

  async getCharityDetails(abn) {
    try {
      const response = await axios.get(`${this.baseURL}/api/charity-search/details/${abn}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting charity details', { error: error.message });
      throw error;
    }
  }
}

export const charitySearchService = new CharitySearchService();
