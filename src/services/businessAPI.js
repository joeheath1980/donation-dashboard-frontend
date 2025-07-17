import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

// Helper to construct API URL with proper /api prefix
const apiUrl = (endpoint) => {
  // If API_BASE_URL already ends with /api, don't add it again
  const baseUrl = API_BASE_URL.endsWith('/api') 
    ? API_BASE_URL 
    : `${API_BASE_URL}/api`;
  return `${baseUrl}${endpoint}`;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  // For business endpoints, we might need a business-specific token
  const authToken = userType === 'business' ? token : token;
  
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
};

export const businessAPI = {
  // Onboarding endpoints
  onboarding: {
    updateProfile: (data) => 
      axios.post(apiUrl('/business/onboarding/profile'), data, { 
        headers: getAuthHeaders() 
      }),
    
    uploadCSRReport: async (file) => {
      const formData = new FormData();
      formData.append('report', file);  // Fixed: Changed from 'csrReport' to 'report'
      
      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Remove Content-Type to let browser set it for multipart/form-data
      
      try {
        const uploadUrl = apiUrl('/business/onboarding/upload-csr-report');
        
        const response = await axios.post(uploadUrl, formData, {
          headers
        });
        return response;
      } catch (error) {
        // Enhanced error logging for debugging
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          token: headers.Authorization ? 'Token present' : 'No token'
        };
        
        console.error('CSR Upload Error Details:', errorDetails);
        throw error;
      }
    },
    
    selectPrimaryCharities: (charities) => 
      axios.post(apiUrl('/business/onboarding/primary-charities'), { primaryCharities: charities }, { 
        headers: getAuthHeaders() 
      }),
    
    // Note: suggestCharities is no longer needed - suggestions come from primary-charities response
    suggestCharities: (primaryCharities) => 
      axios.post(apiUrl('/business/onboarding/primary-charities'), { primaryCharities }, { 
        headers: getAuthHeaders() 
      }),
    
    setCharityPortfolio: (portfolio) => 
      axios.post(apiUrl('/business/onboarding/charity-portfolio'), { portfolio }, { 
        headers: getAuthHeaders() 
      }),
    
    setTargetingConfig: (config) => 
      axios.post(apiUrl('/business/onboarding/targeting'), config, { 
        headers: getAuthHeaders() 
      }),
    
    // The complete endpoint is now called 'targeting'
    complete: (allData) => 
      axios.post(apiUrl('/business/onboarding/targeting'), allData, { 
        headers: getAuthHeaders() 
      })
  },

  // Campaign endpoints
  campaigns: {
    create: (data) => 
      axios.post(apiUrl('/business/campaigns/create'), data, { 
        headers: getAuthHeaders() 
      }),
    
    list: (params = {}) => 
      axios.get(apiUrl('/business/campaigns'), { 
        headers: getAuthHeaders(),
        params 
      }),
    
    get: (id) => 
      axios.get(apiUrl(`/business/campaigns/${id}`), { 
        headers: getAuthHeaders() 
      }),
    
    update: (id, data) => 
      axios.put(apiUrl(`/business/campaigns/${id}`), data, { 
        headers: getAuthHeaders() 
      }),
    
    pause: (id) => 
      axios.post(apiUrl(`/business/campaigns/${id}/pause`), {}, { 
        headers: getAuthHeaders() 
      }),
    
    resume: (id) => 
      axios.post(apiUrl(`/business/campaigns/${id}/resume`), {}, { 
        headers: getAuthHeaders() 
      }),
    
    end: (id) => 
      axios.post(apiUrl(`/business/campaigns/${id}/end`), {}, { 
        headers: getAuthHeaders() 
      }),
    
    delete: (id) => 
      axios.delete(apiUrl(`/business/campaigns/${id}`), { 
        headers: getAuthHeaders() 
      })
  },

  // Analytics endpoints
  analytics: {
    overview: (params = {}) => 
      axios.get(apiUrl('/business/analytics/overview'), { 
        headers: getAuthHeaders(),
        params 
      }),
    
    getCampaignAnalytics: (campaignId, params = {}) => 
      axios.get(apiUrl(`/business/analytics/campaigns/${campaignId}`), { 
        headers: getAuthHeaders(),
        params 
      }),
    
    demographics: (params = {}) => 
      axios.get(apiUrl('/business/analytics/demographics'), { 
        headers: getAuthHeaders(),
        params 
      }),
    
    charities: (params = {}) => 
      axios.get(apiUrl('/business/analytics/charities'), { 
        headers: getAuthHeaders(),
        params 
      }),
    
    export: (format, params = {}) => 
      axios.get(apiUrl(`/business/analytics/export/${format}`), { 
        headers: getAuthHeaders(),
        params,
        responseType: format === 'csv' ? 'blob' : 'json'
      }),
    
    exportCampaignData: (campaignId, format) => 
      axios.get(apiUrl(`/business/campaigns/${campaignId}/export`), { 
        headers: getAuthHeaders(),
        params: { format },
        responseType: 'blob'
      }),
    
    scheduleReport: (campaignId, schedule) => 
      axios.post(apiUrl(`/business/campaigns/${campaignId}/reports`), schedule, { 
        headers: getAuthHeaders()
      })
  },

  // Matching endpoints
  matching: {
    previewMatches: (donationData) => 
      axios.post(apiUrl('/donations/preview-matches'), donationData, { 
        headers: getAuthHeaders() 
      }),
    
    getRecentMatches: (limit = 10) => 
      axios.get(apiUrl('/business/matches/recent'), { 
        headers: getAuthHeaders(),
        params: { limit } 
      }),
    
    getMatchDetails: (matchId) => 
      axios.get(apiUrl(`/business/matches/${matchId}`), { 
        headers: getAuthHeaders() 
      })
  },

  // Portfolio management
  portfolio: {
    get: () => 
      axios.get(apiUrl('/business/portfolio'), { 
        headers: getAuthHeaders() 
      }),
    
    addCharity: (charityId, config) => 
      axios.post(apiUrl('/business/portfolio/add'), { charityId, config }, { 
        headers: getAuthHeaders() 
      }),
    
    removeCharity: (charityId) => 
      axios.delete(apiUrl(`/business/portfolio/remove/${charityId}`), { 
        headers: getAuthHeaders() 
      }),
    
    updateCharity: (charityId, config) => 
      axios.put(apiUrl(`/business/portfolio/update/${charityId}`), config, { 
        headers: getAuthHeaders() 
      })
  },

  // Business profile
  profile: {
    get: () => 
      axios.get(apiUrl('/business/me'), { 
        headers: getAuthHeaders() 
      }),
    
    update: (data) => 
      axios.put(apiUrl('/business/profile'), data, { 
        headers: getAuthHeaders() 
      }),
    
    updateBilling: (data) => 
      axios.put(apiUrl('/business/billing'), data, { 
        headers: getAuthHeaders() 
      })
  },

  // Stats and dashboard data
  stats: {
    get: () => 
      axios.get(apiUrl('/business/stats'), { 
        headers: getAuthHeaders() 
      }),
    
    getBudgetUtilization: () => 
      axios.get(apiUrl('/business/stats/budget'), { 
        headers: getAuthHeaders() 
      }),
    
    getCategoryBreakdown: () => 
      axios.get(apiUrl('/business/stats/categories'), { 
        headers: getAuthHeaders() 
      })
  },

  // Charity discovery
  charities: {
    search: (params) => 
      axios.get(apiUrl('/charities/search'), { 
        headers: getAuthHeaders(),
        params 
      }),
    
    getSimilar: (charityId) => 
      axios.get(apiUrl(`/charities/${charityId}/similar`), { 
        headers: getAuthHeaders() 
      }),
    
    getByCategory: (category) => 
      axios.get(apiUrl(`/charities/category/${category}`), { 
        headers: getAuthHeaders() 
      }),
    
    getTrending: () => 
      axios.get(apiUrl('/charities/trending'), { 
        headers: getAuthHeaders() 
      })
  }
};

export default businessAPI;