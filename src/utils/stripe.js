import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '../services/api.service';

// Initialize Stripe
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Helper function for API calls
export const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const methodLower = method.toLowerCase();
  const config = {};
  if (data && methodLower !== 'get') {
    config.data = data;
  }
  config.method = methodLower;
  config.url = url;
  // Let apiClient handle headers (Authorization/CSRF) and baseURL
  const response = await apiClient.request(config);
  return response.data;
};
