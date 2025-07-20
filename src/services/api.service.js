import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, SECURITY_HEADERS } from '../config/api.config';
import { SecureTokenStorage } from '../utils/auth.utils';
import { createLogger } from '../utils/logger';

const logger = createLogger('APIService');

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: SECURITY_HEADERS
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = SecureTokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    logger.debug('API Request', {
      method: config.method,
      url: config.url,
      hasAuth: !!token
    });
    
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    logger.debug('API Response', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      logger.error('API Error Response', {
        status: response.status,
        url: response.config.url,
        message: response.data?.message
      });
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        logger.info('Unauthorized - clearing auth data');
        SecureTokenStorage.removeToken();
        // Don't redirect here - let components handle it
      }
    } else {
      logger.error('Network Error', { message: error.message });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API Service
 */
export const authService = {
  // User authentication
  async login(email, password) {
    const response = await apiClient.post(API_ENDPOINTS.USER_LOGIN, { email, password });
    return response.data;
  },
  
  async register(name, email, password) {
    const response = await apiClient.post(API_ENDPOINTS.USER_REGISTER, { name, email, password });
    return response.data;
  },
  
  async getCurrentUser() {
    const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE);
    return response.data;
  },
  
  // Business authentication
  async businessLogin(contactEmail, password) {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_LOGIN, { contactEmail, password });
    return response.data;
  },
  
  async businessSignup(signupData) {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_SIGNUP, signupData);
    return response.data;
  },
  
  async getCurrentBusiness() {
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS_PROFILE);
    return response.data;
  },
  
  // Charity authentication
  async charityLogin(contactEmail, password) {
    const response = await apiClient.post(API_ENDPOINTS.CHARITY_LOGIN, { contactEmail, password });
    return response.data;
  },
  
  async charitySignup(signupData) {
    const response = await apiClient.post(API_ENDPOINTS.CHARITY_SIGNUP, signupData);
    return response.data;
  },
  
  async getCurrentCharity() {
    const response = await apiClient.get(API_ENDPOINTS.CHARITY_PROFILE);
    return response.data;
  }
};

/**
 * Donation API Service
 */
export const donationService = {
  async getDonations() {
    const response = await apiClient.get(API_ENDPOINTS.DONATIONS);
    return response.data;
  },
  
  async createDonation(formData) {
    const response = await apiClient.post(API_ENDPOINTS.DONATIONS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  async updateDonation(id, formData) {
    const response = await apiClient.put(`${API_ENDPOINTS.DONATIONS}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  async deleteDonation(id) {
    const response = await apiClient.delete(`${API_ENDPOINTS.DONATIONS}/${id}`);
    return response.data;
  },
  
  async downloadReceipt(donationId) {
    const response = await apiClient.get(`${API_ENDPOINTS.DONATIONS}/${donationId}/receipt`, {
      responseType: 'blob'
    });
    return response;
  },
  
  async downloadBulkReceipts(params) {
    const response = await apiClient.post(`${API_ENDPOINTS.DONATIONS}/bulk-receipts`, params, {
      responseType: 'blob'
    });
    return response;
  }
};

/**
 * Charity API Service
 */
export const charityService = {
  async searchCharities(query) {
    const response = await apiClient.get(API_ENDPOINTS.CHARITY_SEARCH, {
      params: { q: query }
    });
    return response.data;
  },
  
  async getAllCharities() {
    const response = await apiClient.get(API_ENDPOINTS.CHARITIES_LIST);
    return response.data;
  },
  
  async getCharityLinkRequests() {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_CHARITY_REQUESTS);
    return response.data;
  },
  
  async approveCharityLink(id) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN_CHARITY_REQUESTS}/${id}/approve`);
    return response.data;
  },
  
  async rejectCharityLink(id) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN_CHARITY_REQUESTS}/${id}/reject`);
    return response.data;
  }
};

/**
 * Payment API Service
 */
export const paymentService = {
  // ARCHIVED: PayPal and Braintree methods - replaced with Stripe
  // async getBraintreeToken() {
  //   const response = await apiClient.get(API_ENDPOINTS.BRAINTREE_TOKEN);
  //   return response.data;
  // },
  // 
  // async processBraintreePayment(paymentMethodNonce, amount, charityId) {
  //   const response = await apiClient.post(API_ENDPOINTS.BRAINTREE_CHECKOUT, {
  //     paymentMethodNonce,
  //     amount,
  //     charityId
  //   });
  //   return response.data;
  // },
  // 
  // async capturePayPalOrder(orderId, charityId) {
  //   const response = await apiClient.post(API_ENDPOINTS.PAYPAL_CAPTURE, {
  //     orderId,
  //     charityId
  //   });
  //   return response.data;
  // }
};

/**
 * Business API Service
 */
export const businessService = {
  async getCampaigns() {
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS_CAMPAIGNS);
    return response.data;
  },
  
  async createCampaign(campaignData) {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_CAMPAIGNS, campaignData);
    return response.data;
  }
};

/**
 * Admin API Service
 */
export const adminService = {
  async getAllUsers() {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_USERS);
    return response.data;
  },
  
  async updateUserRole(userId, role) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN_USERS}/${userId}/role`, { role });
    return response.data;
  },
  
  async updateUserStatus(userId, status) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN_USERS}/${userId}/status`, { status });
    return response.data;
  }
};

/**
 * Other API Services
 */
export const matchingService = {
  async getMatchingOpportunities() {
    const response = await apiClient.get(API_ENDPOINTS.MATCHING_OPPORTUNITIES);
    return response.data;
  }
};

export const globalGivingService = {
  async getRecommendedProjects(searchQuery) {
    const response = await apiClient.get(API_ENDPOINTS.GLOBALGIVING_PROJECTS, {
      params: searchQuery ? { searchQuery } : {}
    });
    return response.data;
  }
};

/**
 * Email Forwarding API Service
 */
export const emailForwardingService = {
  async getForwardStatus(limit = 10, skip = 0) {
    const response = await apiClient.get(API_ENDPOINTS.EMAIL_FORWARD_STATUS, {
      params: { limit, skip }
    });
    return response.data;
  },
  
  async setupForwarding() {
    const response = await apiClient.post(API_ENDPOINTS.EMAIL_FORWARD_SETUP);
    return response.data;
  },
  
  async verifyForwarding() {
    const response = await apiClient.get(API_ENDPOINTS.EMAIL_FORWARD_VERIFY);
    return response.data;
  }
};

// Export the axios instance for custom requests
export { apiClient };

// Default export with all services
const apiServices = {
  auth: authService,
  donations: donationService,
  charities: charityService,
  payments: paymentService,
  business: businessService,
  admin: adminService,
  matching: matchingService,
  globalGiving: globalGivingService,
  emailForwarding: emailForwardingService,
  client: apiClient
};

export default apiServices;