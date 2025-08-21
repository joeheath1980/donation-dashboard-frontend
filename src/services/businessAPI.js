import { apiClient } from './api.service';

// Helper to normalize endpoint paths for apiClient
const apiUrl = (endpoint) => `/api${endpoint}`;

// Use centralized, CASA-compliant auth header builder

export const businessAPI = {
  // Onboarding endpoints
  onboarding: {
    updateProfile: (data) => 
      apiClient.post(apiUrl('/business/onboarding/profile'), data),
    
    uploadCSRReport: async (file) => {
      const formData = new FormData();
      formData.append('report', file);  // Fixed: Changed from 'csrReport' to 'report'
      
      try {
        const uploadUrl = apiUrl('/business/onboarding/upload-csr-report');
        const response = await apiClient.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
      } catch (error) {
        // Enhanced error logging for debugging
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        };
        
        console.error('CSR Upload Error Details:', errorDetails);
        throw error;
      }
    },
    
    selectPrimaryCharities: (charities) => 
      apiClient.post(apiUrl('/business/onboarding/primary-charities'), { primaryCharities: charities }),
    
    // Note: suggestCharities is no longer needed - suggestions come from primary-charities response
    suggestCharities: (primaryCharities) => 
      apiClient.post(apiUrl('/business/onboarding/primary-charities'), { primaryCharities }),
    
    setCharityPortfolio: (portfolio) => 
      apiClient.post(apiUrl('/business/onboarding/charity-portfolio'), { portfolio }),
    
    setTargetingConfig: (config) => 
      apiClient.post(apiUrl('/business/onboarding/targeting'), config),
    
    // The complete endpoint is now called 'targeting'
    complete: (allData) => 
      apiClient.post(apiUrl('/business/onboarding/targeting'), allData)
  },

  // Campaign endpoints
  campaigns: {
    create: (data) => 
      apiClient.post(apiUrl('/business/campaigns/create'), data),
    
    list: (params = {}) => 
      apiClient.get(apiUrl('/business/campaigns'), { params }),
    
    get: (id) => 
      apiClient.get(apiUrl(`/business/campaigns/${id}`)),
    
    update: (id, data) => 
      apiClient.put(apiUrl(`/business/campaigns/${id}`), data),
    
    pause: (id) => 
      apiClient.post(apiUrl(`/business/campaigns/${id}/pause`), {}),
    
    resume: (id) => 
      apiClient.post(apiUrl(`/business/campaigns/${id}/resume`), {}),
    
    end: (id) => 
      apiClient.post(apiUrl(`/business/campaigns/${id}/end`), {}),
    
    delete: (id) => 
      apiClient.delete(apiUrl(`/business/campaigns/${id}`))
  },

  // Analytics endpoints
  analytics: {
    overview: (params = {}) => 
      apiClient.get(apiUrl('/business/analytics/overview'), { params }),
    
    getCampaignAnalytics: (campaignId, params = {}) => 
      apiClient.get(apiUrl(`/business/analytics/campaigns/${campaignId}`), { params }),
    
    demographics: (params = {}) => 
      apiClient.get(apiUrl('/business/analytics/demographics'), { params }),
    
    charities: (params = {}) => 
      apiClient.get(apiUrl('/business/analytics/charities'), { params }),
    
    export: (format, params = {}) => 
      apiClient.get(apiUrl(`/business/analytics/export/${format}`), { params, responseType: format === 'csv' ? 'blob' : 'json' }),
    
    exportCampaignData: (campaignId, format) => 
      apiClient.get(apiUrl(`/business/campaigns/${campaignId}/export`), { params: { format }, responseType: 'blob' }),
    
    scheduleReport: (campaignId, schedule) => 
      apiClient.post(apiUrl(`/business/campaigns/${campaignId}/reports`), schedule)
  },

  // Matching endpoints
  matching: {
    previewMatches: (donationData) => 
      apiClient.post(apiUrl('/donations/preview-matches'), donationData),
    
    getRecentMatches: (limit = 10) => 
      apiClient.get(apiUrl('/business/matches/recent'), { params: { limit } }),
    
    getMatchDetails: (matchId) => 
      apiClient.get(apiUrl(`/business/matches/${matchId}`))
  },

  // Portfolio management
  portfolio: {
    get: () => 
      apiClient.get(apiUrl('/business/portfolio')),
    
    addCharity: (charityId, config) => 
      apiClient.post(apiUrl('/business/portfolio/add'), { charityId, config }),
    
    removeCharity: (charityId) => 
      apiClient.delete(apiUrl(`/business/portfolio/remove/${charityId}`)),
    
    updateCharity: (charityId, config) => 
      apiClient.put(apiUrl(`/business/portfolio/update/${charityId}`), config)
  },

  // Business profile
  profile: {
    get: () => 
      apiClient.get(apiUrl('/business/me')),
    
    update: (data) => 
      apiClient.put(apiUrl('/business/profile'), data),
    
    updateBilling: (data) => 
      apiClient.put(apiUrl('/business/billing'), data)
  },

  // Stats and dashboard data
  stats: {
    get: () => 
      apiClient.get(apiUrl('/business/stats')),
    
    getBudgetUtilization: () => 
      apiClient.get(apiUrl('/business/stats/budget')),
    
    getCategoryBreakdown: () => 
      apiClient.get(apiUrl('/business/stats/categories'))
  },

  // Charity discovery
  charities: {
    search: (params) => 
      apiClient.get(apiUrl('/charities/search'), { params }),
    
    getSimilar: (charityId) => 
      apiClient.get(apiUrl(`/charities/${charityId}/similar`)),
    
    getByCategory: (category) => 
      apiClient.get(apiUrl(`/charities/category/${category}`)),
    
    getTrending: () => 
      apiClient.get(apiUrl('/charities/trending'))
  }
};

export default businessAPI;
