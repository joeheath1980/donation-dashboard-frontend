import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { getAuthHeaders } from '../utils/auth.utils';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Use centralized, CASA-compliant auth header builder

export const businessAccountService = {
  // Get all account settings
  getAccountSettings: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/business/account-settings`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  // Update company profile
  updateCompanyProfile: async (data) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/business/company-profile`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/business/change-password`,
      { currentPassword, newPassword },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  // Change email
  changeEmail: async (newEmail, password) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/business/change-email`,
      { newEmail, password },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  // Team management
  getTeamMembers: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/business/team-members`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  inviteTeamMember: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/business/team-members/invite`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  updateTeamMember: async (id, data) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/business/team-members/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  removeTeamMember: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/business/team-members/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  // Notification preferences
  updateNotificationPreferences: async (preferences) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/business/notification-preferences`,
      preferences,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  // Billing management
  getPaymentMethods: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/business/billing/payment-methods`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  addPaymentMethod: async (paymentMethodId, setAsDefault = false) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/business/billing/payment-methods`,
      { paymentMethodId, setAsDefault },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  removePaymentMethod: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/business/billing/payment-methods/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
  
  setDefaultPaymentMethod: async (paymentMethodId) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/business/billing/default-payment-method`,
      { paymentMethodId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};
