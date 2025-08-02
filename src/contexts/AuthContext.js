import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS, USER_TYPES, getApiUrl } from '../config/api.config';
import { createLogger } from '../utils/logger';

const AuthContext = createContext();
const logger = createLogger('AuthContext');

export const useAuth = () => useContext(AuthContext);

// Set up axios defaults
const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Add axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(getApiUrl('/auth/refresh-token'), {
            refreshToken
          });
          
          const { accessToken } = response.data;
          localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
          setupAxiosDefaults(accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError);
        // Clear auth and redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userType = localStorage.getItem(STORAGE_KEYS.USER_TYPE);
      if (token && userType) {
        setupAxiosDefaults(token);
        try {
          let response;
          if (userType === USER_TYPES.BUSINESS) {
            response = await axios.get(getApiUrl(API_ENDPOINTS.BUSINESS_PROFILE));
            setUser({ ...response.data, isBusiness: true, isCharity: false });
          } else if (userType === USER_TYPES.CHARITY) {
            response = await axios.get(getApiUrl(API_ENDPOINTS.CHARITY_PROFILE));
            setUser({ ...response.data, isBusiness: false, isCharity: true });
          } else if (userType === USER_TYPES.ADMIN) {
            // For admin, try to get user profile from /api/users/me
            response = await axios.get(getApiUrl('/users/me'));
            localStorage.setItem(STORAGE_KEYS.USER_ID, response.data._id || response.data.id);
            setUser({ ...response.data, isAdmin: true, isBusiness: false, isCharity: false });
          } else {
            response = await axios.get(getApiUrl(API_ENDPOINTS.USER_PROFILE));
            localStorage.setItem(STORAGE_KEYS.USER_ID, response.data._id || response.data.id);
            setUser({ ...response.data, isBusiness: false, isCharity: false });
          }
        } catch (error) {
          logger.error('Authentication error', { 
            status: error.response?.status,
            message: error.message 
          });
          if (error.response && error.response.status === 401) {
            logger.info('Token expired or invalid. Clearing local storage.');
            clearUserData();
          }
          setUser(null);
        }
      } else {
        setUser(null);
        setupAxiosDefaults(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Regular user login (also handles admin)
  const login = async (email, password) => {
    try {
      const response = await axios.post(getApiUrl(API_ENDPOINTS.USER_LOGIN), { email, password });
      
      // Handle new token format
      const { accessToken, refreshToken, user: userData, token } = response.data;
      
      // Use accessToken if available, fallback to token for backward compatibility
      const authToken = accessToken || token;
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Check if user is admin
      if (userData && (userData.isAdmin || userData.role === USER_TYPES.ADMIN)) {
        localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.ADMIN);
        setUser({ ...userData, isAdmin: true });
        setupAxiosDefaults(authToken);
        return userData;
      }
      
      // Regular user flow
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.USER);
      setupAxiosDefaults(authToken);
      
      // If user data is in response, use it; otherwise fetch profile
      if (userData) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, userData._id || userData.id);
        setUser({ ...userData, isBusiness: false, isCharity: false });
        return userData;
      } else {
        const userResponse = await axios.get(getApiUrl(API_ENDPOINTS.USER_PROFILE));
        localStorage.setItem(STORAGE_KEYS.USER_ID, userResponse.data._id || userResponse.data.id);
        setUser({ ...userResponse.data, isBusiness: false, isCharity: false });
        return userResponse.data;
      }
    } catch (error) {
      logger.error('Login error', { message: error.message });
      throw error;
    }
  };

  // User signup
  const userSignup = async (name, email, password) => {
    try {
      logger.debug('Attempting to register user', { name, email });
      const response = await axios.post(getApiUrl(API_ENDPOINTS.USER_REGISTER), { name, email, password });
      logger.debug('Registration successful');

      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.USER);
        logger.debug('Token stored in localStorage');
        setupAxiosDefaults(response.data.token);

        const validatedUser = await axios.get(getApiUrl(API_ENDPOINTS.USER_PROFILE));
        localStorage.setItem(STORAGE_KEYS.USER_ID, validatedUser.data._id || validatedUser.data.id);
        setUser({ ...validatedUser.data, isBusiness: false, isCharity: false });
        return validatedUser.data;
      } else {
        throw new Error('Registration successful, but no token received.');
      }
    } catch (error) {
      logger.error('User signup error', { 
        status: error.response?.status,
        message: error.message 
      });
      if (error.response) {
        if (error.response.status === 400 && error.response.data.error === 'User already exists') {
          throw new Error('A user with this email already exists. Please try logging in or use a different email.');
        } else {
          throw new Error(error.response.data.message || 'An error occurred during registration.');
        }
      } else if (error.request) {
        throw new Error('No response received from the server. Please try again later.');
      } else {
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Business user login
  const businessLogin = async (emailOrContactEmail, password) => {
    try {
      // Support both email and contactEmail fields for compatibility
      const response = await axios.post(getApiUrl(API_ENDPOINTS.BUSINESS_LOGIN), {
        email: emailOrContactEmail,
        contactEmail: emailOrContactEmail,
        password,
      });
      const { token, businessId } = response.data;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.BUSINESS);
      localStorage.setItem(STORAGE_KEYS.BUSINESS_ID, businessId);
      setupAxiosDefaults(token);
      const businessResponse = await axios.get(getApiUrl(API_ENDPOINTS.BUSINESS_PROFILE));
      setUser({ ...businessResponse.data, isBusiness: true, isCharity: false });
      return businessResponse.data;
    } catch (error) {
      logger.error('Business login error', { message: error.message });
      throw error;
    }
  };

  // Business user signup
  const businessSignup = async (signupData) => {
    try {
      const response = await axios.post(getApiUrl(API_ENDPOINTS.BUSINESS_SIGNUP), signupData);
      if (response.status === 201 || response.status === 200) {
        const { token, businessId } = response.data;
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.BUSINESS);
        localStorage.setItem(STORAGE_KEYS.BUSINESS_ID, businessId);
        setupAxiosDefaults(token);
        const businessResponse = await axios.get(getApiUrl(API_ENDPOINTS.BUSINESS_PROFILE));
        setUser({ ...businessResponse.data, isBusiness: true, isCharity: false });
        return businessResponse.data;
      }
    } catch (error) {
      logger.error('Business signup error', { message: error.message });
      throw error;
    }
  };

  // Charity user login
  const charityLogin = async (contactEmail, password) => {
    try {
      const response = await axios.post(getApiUrl(API_ENDPOINTS.CHARITY_LOGIN), {
        contactEmail,
        password,
      });
      const { token, charity } = response.data;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.CHARITY);
      localStorage.setItem(STORAGE_KEYS.CHARITY_ID, charity.id);
      setupAxiosDefaults(token);
      const charityResponse = await axios.get(getApiUrl(API_ENDPOINTS.CHARITY_PROFILE));
      setUser({ ...charityResponse.data, isBusiness: false, isCharity: true });
      return charityResponse.data;
    } catch (error) {
      logger.error('Charity login error', { message: error.message });
      throw error;
    }
  };

  // Charity user signup
  const charitySignup = async (signupData) => {
    try {
      const response = await axios.post(getApiUrl(API_ENDPOINTS.CHARITY_SIGNUP), signupData);
      if (response.status === 201 || response.status === 200) {
        const { token } = response.data;
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.CHARITY);
        setupAxiosDefaults(token);
        const charityResponse = await axios.get(getApiUrl(API_ENDPOINTS.CHARITY_PROFILE));
        setUser({ ...charityResponse.data, isBusiness: false, isCharity: true });
        return charityResponse.data;
      }
    } catch (error) {
      logger.error('Charity signup error', { message: error.message });
      throw error;
    }
  };

  // Social login
  const socialLogin = async (token) => {
    try {
      logger.debug('Social login: Starting');
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.USER);
      logger.debug('Social login: Token and userType set in localStorage');
      setupAxiosDefaults(token);

      logger.debug('Social login: Fetching user data from API');
      const userResponse = await axios.get(getApiUrl(API_ENDPOINTS.USER_PROFILE));
      logger.debug('Social login: User data received');

      // Store user ID in localStorage
      const userId = userResponse.data._id || userResponse.data.id;
      if (userId) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        logger.debug('Social login: User ID stored', { userId });
      }

      setUser({ ...userResponse.data, isBusiness: false, isCharity: false });
      logger.debug('Social login: User state updated');
      return userResponse.data;
    } catch (error) {
      logger.error('Social login error', {
        status: error.response?.status,
        message: error.message
      });
      clearUserData();
      throw error;
    }
  };

  // Enhanced clearUserData function
  const clearUserData = () => {
    logger.debug('Clearing all user data from localStorage');
    
    // Get current user ID for targeted cleaning
    const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    
    // Activity-specific data for the current user
    if (currentUserId) {
      localStorage.removeItem(`user-${currentUserId}-donation-activity-state`);
    }
    
    // Clear all Activity-related state
    localStorage.removeItem('donation-activity-state');
    localStorage.removeItem('donation-activity-state-guest');
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('donationStatuses');
    localStorage.removeItem('selectedTypes');
    localStorage.removeItem('selectedCharityTypes');
    
    // Clear auth-related data
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Comprehensive cleanup of any other Activity-specific or user data
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('user-') || 
        key.startsWith('donation-activity-state') || 
        key.includes('search') ||
        key.includes('donation') ||
        key.includes('charity') ||
        key.includes('activity')
      ) {
        logger.debug(`Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Reset axios headers
    setupAxiosDefaults(null);
    
    logger.debug('All user data cleared from localStorage');
  };

  // Enhanced logout function
  const logout = () => {
    // Clear all user data
    clearUserData();
    
    // Reset user state
    setUser(null);
    
    logger.info('User logged out successfully');
  };

  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    logger.debug('Retrieved auth headers');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    setUser,
    login,
    userSignup,
    businessLogin,
    businessSignup,
    charityLogin,
    charitySignup,
    socialLogin,
    logout,
    clearUserData,
    loading,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;