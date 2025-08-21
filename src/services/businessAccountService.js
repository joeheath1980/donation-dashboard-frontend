import { apiClient } from './api.service';

// All requests go through apiClient (adds Authorization + CSRF)

// Use centralized, CASA-compliant auth header builder

export const businessAccountService = {
  // Get all account settings
  getAccountSettings: async () => {
    const response = await apiClient.get('/api/business/account-settings');
    return response.data;
  },
  
  // Update company profile
  updateCompanyProfile: async (data) => {
    const response = await apiClient.put('/api/business/company-profile', data);
    return response.data;
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/api/business/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  // Change email
  changeEmail: async (newEmail, password) => {
    const response = await apiClient.post('/api/business/change-email', { newEmail, password });
    return response.data;
  },
  
  // Team management
  getTeamMembers: async () => {
    const response = await apiClient.get('/api/business/team-members');
    return response.data;
  },
  
  inviteTeamMember: async (data) => {
    const response = await apiClient.post('/api/business/team-members/invite', data);
    return response.data;
  },
  
  updateTeamMember: async (id, data) => {
    const response = await apiClient.put(`/api/business/team-members/${id}`, data);
    return response.data;
  },
  
  removeTeamMember: async (id) => {
    const response = await apiClient.delete(`/api/business/team-members/${id}`);
    return response.data;
  },
  
  // Notification preferences
  updateNotificationPreferences: async (preferences) => {
    const response = await apiClient.put('/api/business/notification-preferences', preferences);
    return response.data;
  },
  
  // Billing management
  getPaymentMethods: async () => {
    const response = await apiClient.get('/api/business/billing/payment-methods');
    return response.data;
  },
  
  addPaymentMethod: async (paymentMethodId, setAsDefault = false) => {
    const response = await apiClient.post('/api/business/billing/payment-methods', { paymentMethodId, setAsDefault });
    return response.data;
  },
  
  removePaymentMethod: async (id) => {
    const response = await apiClient.delete(`/api/business/billing/payment-methods/${id}`);
    return response.data;
  },
  
  setDefaultPaymentMethod: async (paymentMethodId) => {
    const response = await apiClient.put('/api/business/billing/default-payment-method', { paymentMethodId });
    return response.data;
  }
};
