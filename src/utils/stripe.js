import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Helper function for API calls
export const apiCall = async (endpoint, method = 'GET', data = null) => {
  // Use SecureTokenStorage for CASA compliance
  const { SecureTokenStorage } = await import('./auth.utils');
  const token = SecureTokenStorage.getToken();
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
  
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
};