import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS, USER_TYPES, getApiUrl } from '../config/api.config';
import { createLogger } from '../utils/logger';
import apiServices, { csrfServiceAPI } from '../services/api.service';
import { SecureTokenStorage, UserDataStorage, normalizeToken } from '../utils/auth.utils';

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

// Track if we're already handling a 401 to prevent loops
let isHandling401 = false;
let failedRequests = [];

// Add axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log what we're getting
    if (error.response?.status === 401) {
      logger.debug('401 Response received', {
        url: originalRequest.url,
        hasAuth: !!originalRequest.headers.Authorization,
        authPreview: originalRequest.headers.Authorization?.substring(0, 50),
        retry: originalRequest._retry
      });
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Prevent multiple simultaneous 401 handlers
      if (isHandling401) {
        // Queue this request to retry after current handler completes
        return new Promise((resolve, reject) => {
          failedRequests.push({ resolve, reject, originalRequest });
        });
      }
      
      isHandling401 = true;
      
      try {
        const refreshToken = SecureTokenStorage.getRefreshToken();
        if (refreshToken) {
          logger.debug('Attempting token refresh');
          const response = await axios.post(getApiUrl('/auth/refresh-token'), {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          // CASA Compliance: Store both tokens - backend implements token rotation
          SecureTokenStorage.setToken(accessToken, newRefreshToken || refreshToken);
          setupAxiosDefaults(accessToken);
          
          // Retry all queued requests with new token
          const requests = [...failedRequests];
          failedRequests = [];
          
          requests.forEach(({ resolve, originalRequest }) => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            resolve(axios(originalRequest));
          });
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError);
        
        // Clear queued requests
        failedRequests.forEach(({ reject }) => reject(refreshError));
        failedRequests = [];
        
        // Only redirect if not already redirecting
        if (window.location.pathname !== '/login') {
          // Clear auth and redirect to login
          SecureTokenStorage.clearAll();
          UserDataStorage.clearAll();
          window.location.href = '/login';
        }
      } finally {
        isHandling401 = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTimeout, setRefreshTimeout] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = SecureTokenStorage.getToken();
      const userType = UserDataStorage.getUserType();
      
      logger.info('CheckAuth on mount', { hasToken: !!token, userType });
      
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
            logger.info('User profile loaded on mount', { userId: response.data._id || response.data.id });
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
        logger.info('No token or userType found on mount');
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
      logger.info('Starting login process', { email });
      const api = apiServices.client;
      const response = await api.post(API_ENDPOINTS.USER_LOGIN, { email, password });
      
      // Handle new token format with TTL
      const { 
        accessToken, 
        refreshToken, 
        user: userData, 
        token,
        accessTokenExpiresIn,
        refreshTokenExpiresIn 
      } = response.data;
      
      // Use accessToken if available, fallback to token for backward compatibility
      const authToken = accessToken || token;
      
      logger.info('Login response received', { 
        hasToken: !!authToken, 
        hasUserData: !!userData,
        userDataId: userData?._id || userData?.id,
        accessTokenExpiresIn,
        refreshTokenExpiresIn
      });
      
      SecureTokenStorage.setToken(authToken, refreshToken);
      
      // Schedule proactive refresh if TTL provided
      if (accessTokenExpiresIn) {
        scheduleTokenRefresh(accessTokenExpiresIn);
      }
      
      // Check if user is admin
      if (userData && (userData.isAdmin || userData.role === USER_TYPES.ADMIN)) {
        UserDataStorage.setUserType(USER_TYPES.ADMIN);
        setUser({ ...userData, isAdmin: true });
        setupAxiosDefaults(authToken);
        logger.info('Admin user logged in successfully');
        return userData;
      }
      
      // Regular user flow
      UserDataStorage.setUserType(USER_TYPES.USER);
      setupAxiosDefaults(authToken);
      
      // If user data is in response, use it; otherwise fetch profile
      if (userData) {
        UserDataStorage.setUserId(userData._id || userData.id);
        setUser({ ...userData, isBusiness: false, isCharity: false });
        logger.info('User state set from login response', { userId: userData._id || userData.id });
        return userData;
      } else {
        logger.info('Fetching user profile after login');
        const api2 = apiServices.client;
        const userResponse = await api2.get(API_ENDPOINTS.USER_PROFILE);
        UserDataStorage.setUserId(userResponse.data._id || userResponse.data.id);
        setUser({ ...userResponse.data, isBusiness: false, isCharity: false });
        logger.info('User state set from profile fetch', { userId: userResponse.data._id || userResponse.data.id });
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
      const api = apiServices.client;

      // Ensure CSRF token is initialized prior to registration (CASA requirement)
      try {
        await csrfServiceAPI.initializeToken();
      } catch (e) {
        logger.warn('CSRF init failed before signup, proceeding with interceptor assist', { error: e.message });
      }

      const response = await api.post(API_ENDPOINTS.USER_REGISTER, { name, email, password });
      logger.debug('Registration successful');

      // Prefer accessToken (new API), fallback to token (legacy). Capture refreshToken if provided
      const { accessToken, token, refreshToken } = response.data || {};
      const authToken = accessToken || token;

      if (!authToken) {
        throw new Error('Registration successful, but no token received.');
      }

      // Store tokens (memory + session) and set global axios Authorization default
      SecureTokenStorage.setToken(authToken, refreshToken || null);
      UserDataStorage.setUserType(USER_TYPES.USER);
      setupAxiosDefaults(authToken);

      // Temporary: also persist for routing checks and legacy paths
      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
        localStorage.setItem(STORAGE_KEYS.USER_TYPE, USER_TYPES.USER);
      } catch {}

      // Fetch and set user profile
      const validatedUser = await api.get(API_ENDPOINTS.USER_PROFILE);
      UserDataStorage.setUserId(validatedUser.data._id || validatedUser.data.id);
      setUser({ ...validatedUser.data, isBusiness: false, isCharity: false });
      return validatedUser.data;
    } catch (error) {
      logger.error('User signup error', { 
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
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
      const api = apiServices.client;
      const response = await api.post(API_ENDPOINTS.BUSINESS_LOGIN, {
        email: emailOrContactEmail,
        contactEmail: emailOrContactEmail,
        password,
      });
      const { token, businessId } = response.data;
      SecureTokenStorage.setToken(token);
      UserDataStorage.setUserType(USER_TYPES.BUSINESS);
      UserDataStorage.setBusinessId(businessId);
      setupAxiosDefaults(token);
      const businessResponse = await api.get(API_ENDPOINTS.BUSINESS_PROFILE);
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
      const api = apiServices.client;
      let response;
      try {
        response = await api.post(API_ENDPOINTS.BUSINESS_SIGNUP, signupData);
      } catch (err) {
        // Optional fallback: try alternate path if endpoint not found
        if (err.response?.status === 404) {
          logger.warn('Primary business signup path not found, trying /api/businesses/signup');
          response = await api.post('/api/businesses/signup', signupData);
        } else {
          throw err;
        }
      }
      if (response.status === 201 || response.status === 200) {
        const { token, businessId } = response.data;
        SecureTokenStorage.setToken(token);
        UserDataStorage.setUserType(USER_TYPES.BUSINESS);
        UserDataStorage.setBusinessId(businessId);
        setupAxiosDefaults(token);
        const businessResponse = await api.get(API_ENDPOINTS.BUSINESS_PROFILE);
        setUser({ ...businessResponse.data, isBusiness: true, isCharity: false });
        return businessResponse.data;
      }
    } catch (error) {
      logger.error('Business signup error', { 
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  };

  // Charity user login
  const charityLogin = async (emailOrContactEmail, password) => {
    try {
      const api = apiServices.client;
      const response = await api.post(API_ENDPOINTS.CHARITY_LOGIN, {
        email: emailOrContactEmail,  // Backend accepts 'email' field
        contactEmail: emailOrContactEmail,  // Also send contactEmail for compatibility
        password,
      });
      const { token, charity } = response.data;
      SecureTokenStorage.setToken(token);
      UserDataStorage.setUserType(USER_TYPES.CHARITY);
      if (charity) {
        UserDataStorage.setCharityId(charity._id || charity.id || charity.charityId);
      }
      setupAxiosDefaults(token);
      const charityResponse = await api.get(API_ENDPOINTS.CHARITY_PROFILE);
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
      const api = apiServices.client;
      const response = await api.post(API_ENDPOINTS.CHARITY_SIGNUP, signupData);
      if (response.status === 201 || response.status === 200) {
        const { token } = response.data;
        SecureTokenStorage.setToken(token);
        UserDataStorage.setUserType(USER_TYPES.CHARITY);
        setupAxiosDefaults(token);
        const charityResponse = await api.get(API_ENDPOINTS.CHARITY_PROFILE);
        setUser({ ...charityResponse.data, isBusiness: false, isCharity: true });
        return charityResponse.data;
      }
    } catch (error) {
      logger.error('Charity signup error', { 
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  };

  // Social login
  const socialLogin = async (token) => {
    try {
      logger.debug('Social login: Starting with raw token (length only)', { length: token?.length });
      const clean = normalizeToken(token);
      logger.debug('Social login: normalized token (length only)', { length: clean?.length });
      
      SecureTokenStorage.setToken(clean);
      UserDataStorage.setUserType(USER_TYPES.USER);
      logger.debug('Social login: Token and userType stored securely');
      setupAxiosDefaults(clean);
      
      // Authorization header set (value not logged)
      logger.debug('Social login: Authorization header set');

      logger.debug('Social login: Fetching user data from API');
      const api = apiServices.client;
      const userResponse = await api.get(API_ENDPOINTS.USER_PROFILE);
      logger.debug('Social login: User data received');

      // Store user ID securely
      const userId = userResponse.data._id || userResponse.data.id;
      if (userId) {
        UserDataStorage.setUserId(userId);
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

  // Schedule proactive token refresh before expiry
  const scheduleTokenRefresh = (expiresIn) => {
    // Clear any existing timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    // Schedule refresh 60 seconds before expiry
    const refreshBuffer = 60; // seconds
    const refreshIn = Math.max((expiresIn - refreshBuffer) * 1000, 0); // milliseconds
    
    if (refreshIn > 0) {
      logger.info('Scheduling token refresh', { 
        expiresIn, 
        refreshIn: refreshIn / 1000,
        refreshAt: new Date(Date.now() + refreshIn).toISOString()
      });
      
      const timeout = setTimeout(async () => {
        try {
          const refreshToken = SecureTokenStorage.getRefreshToken();
          if (refreshToken) {
            logger.info('Proactive token refresh triggered');
            const api = apiServices.client;
            const response = await api.post('/api/auth/refresh-token', { refreshToken });
            
            const { accessToken, refreshToken: newRefreshToken, accessTokenExpiresIn } = response.data;
            SecureTokenStorage.setToken(accessToken, newRefreshToken || refreshToken);
            setupAxiosDefaults(accessToken);
            
            // Schedule next refresh if TTL provided
            if (accessTokenExpiresIn) {
              scheduleTokenRefresh(accessTokenExpiresIn);
            }
            
            logger.info('Proactive token refresh successful');
          }
        } catch (error) {
          logger.error('Proactive token refresh failed', { error: error.message });
          // The 401 interceptor will handle this
        }
      }, refreshIn);
      
      setRefreshTimeout(timeout);
    }
  };

  // Enhanced clearUserData function
  const clearUserData = () => {
    logger.debug('Clearing all user data from localStorage');
    
    // Clear any scheduled refresh
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
    
    // Get current user ID for targeted cleaning
    const currentUserId = UserDataStorage.getUserId();
    
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
    SecureTokenStorage.clearAll();
    UserDataStorage.clearAll();
    
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
  const logout = async () => {
    try {
      // Call backend logout endpoint to revoke OAuth tokens and invalidate refresh tokens
      const token = SecureTokenStorage.getToken();
      if (token) {
        try {
          const api = apiServices.client;
          await api.post(API_ENDPOINTS.USER_LOGOUT);
          logger.info('Backend logout successful - OAuth tokens revoked');
        } catch (backendError) {
          // Log but continue with local cleanup even if backend fails
          logger.warn('Backend logout failed, continuing with local cleanup', {
            error: backendError.message
          });
        }
      }
    } catch (error) {
      logger.error('Error during logout', { error: error.message });
    } finally {
      // Always clear all user data regardless of backend success
      clearUserData();

      // Clear CSRF token
      csrfServiceAPI.clearToken();

      // Reset user state
      setUser(null);

      logger.info('User logged out successfully - local data cleared');
    }
  };

  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = SecureTokenStorage.getToken();
    logger.debug('Retrieved auth headers');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Make scheduleTokenRefresh available globally for OAuth callbacks
  useEffect(() => {
    window.scheduleTokenRefresh = scheduleTokenRefresh;
    return () => {
      delete window.scheduleTokenRefresh;
    };
  }, [refreshTimeout]);

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
    scheduleTokenRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
