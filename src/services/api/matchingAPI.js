import apiServices from '../api.service';

const api = apiServices.client;

export const matchingAPI = {
  // Get active matching opportunities
  getActiveOpportunities: async (filters = {}) => {
    try {
      // Try the common endpoint path first
      const response = await api.get('/api/matching/opportunities', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching matching opportunities:', error);
      throw error;
    }
  },

  // Get match recommendations based on user's giving history
  getRecommendations: async () => {
    try {
      const response = await api.get('/api/matching/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Create donation with matching
  createDonationWithMatching: async (donationData) => {
    try {
      const response = await api.post('/api/donations/create-with-matching', donationData);
      return response.data;
    } catch (error) {
      console.error('Error creating donation with matching:', error);
      throw error;
    }
  },

  // Get campaign details
  getCampaignDetails: async (campaignId) => {
    try {
      const response = await api.get(`/api/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      throw error;
    }
  },

  // Subscribe to campaign updates
  subscribeToCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/subscribe`);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to campaign:', error);
      throw error;
    }
  },

  // Unsubscribe from campaign updates
  unsubscribeFromCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/unsubscribe`);
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from campaign:', error);
      throw error;
    }
  },

  // Get user's matching history
  getMatchingHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/api/matching/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching matching history:', error);
      throw error;
    }
  },

  // Get matching statistics
  getMatchingStats: async () => {
    try {
      const response = await api.get('/api/matching/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching matching stats:', error);
      throw error;
    }
  },

  // Check if a donation qualifies for matching
  checkMatchEligibility: async (charityId, amount, campaignId = null) => {
    try {
      const response = await api.post('/api/matching/check-eligibility', {
        charityId,
        amount,
        campaignId
      });
      return response.data;
    } catch (error) {
      console.error('Error checking match eligibility:', error);
      throw error;
    }
  },

  // Get active campaigns for a specific charity
  getCampaignsForCharity: async (charityId) => {
    try {
      const response = await api.get(`/api/charities/${charityId}/campaigns`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns for charity:', error);
      throw error;
    }
  },

  // Accept a matching opportunity
  acceptMatchingOpportunity: async (opportunityId, selectedCharityId = null) => {
    try {
      const body = {};
      
      // Include selectedCharityId for P3 and P4 matches
      if (selectedCharityId) {
        body.selectedCharityId = selectedCharityId;
      }
      
      const response = await api.post(`/api/matching/opportunities/${opportunityId}/accept`, body);
      return response.data;
    } catch (error) {
      console.error('Error accepting matching opportunity:', error);
      throw error;
    }
  }
};