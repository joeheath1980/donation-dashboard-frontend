import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Set up axios defaults
const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (token && userType) {
        setupAxiosDefaults(token);
        try {
          let response;
          if (userType === 'business') {
            response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/me`);
            setUser({ ...response.data, isBusiness: true, isCharity: false });
          } else if (userType === 'charity') {
            response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/me`);
            setUser({ ...response.data, isBusiness: false, isCharity: true });
          } else {
            response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/me`);
            setUser({ ...response.data, isBusiness: false, isCharity: false });
          }
        } catch (error) {
          console.error('Authentication error:', error);
          if (error.response && error.response.status === 401) {
            console.log('Token expired or invalid. Clearing local storage.');
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

  // Regular user login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/auth/login`, { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'user');
      setupAxiosDefaults(token);
      const userResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/me`);
      setUser({ ...userResponse.data, isBusiness: false, isCharity: false });
      return userResponse.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // User signup
  const userSignup = async (name, email, password) => {
    try {
      console.log('Attempting to register user:', { name, email });
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/register`, { name, email, password });
      console.log('Registration response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'user');
        console.log('Token stored in localStorage');
        setupAxiosDefaults(response.data.token);

        const validatedUser = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/me`);
        setUser({ ...validatedUser.data, isBusiness: false, isCharity: false });
        return validatedUser.data;
      } else {
        throw new Error('Registration successful, but no token received.');
      }
    } catch (error) {
      console.error('User signup error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        if (error.response.status === 400 && error.response.data.error === 'User already exists') {
          throw new Error('A user with this email already exists. Please try logging in or use a different email.');
        } else {
          throw new Error(error.response.data.message || 'An error occurred during registration.');
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        throw new Error('No response received from the server. Please try again later.');
      } else {
        console.error('Error message:', error.message);
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Business user login
  const businessLogin = async (contactEmail, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/auth/login`, {
        contactEmail,
        password,
      });
      const { token, businessId } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'business');
      localStorage.setItem('businessId', businessId);
      setupAxiosDefaults(token);
      const businessResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/me`);
      setUser({ ...businessResponse.data, isBusiness: true, isCharity: false });
      return businessResponse.data;
    } catch (error) {
      console.error('Business login error:', error);
      throw error;
    }
  };

  // Business user signup
  const businessSignup = async (signupData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/auth/signup`, signupData);
      if (response.status === 201 || response.status === 200) {
        const { token, businessId } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', 'business');
        localStorage.setItem('businessId', businessId);
        setupAxiosDefaults(token);
        const businessResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/me`);
        setUser({ ...businessResponse.data, isBusiness: true, isCharity: false });
        return businessResponse.data;
      }
    } catch (error) {
      console.error('Business signup error:', error);
      throw error;
    }
  };

  // Charity user login
  const charityLogin = async (contactEmail, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/login`, {
        contactEmail,
        password,
      });
      const { token, charity } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'charity');
      localStorage.setItem('charityId', charity.id);
      setupAxiosDefaults(token);
      const charityResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/me`);
      setUser({ ...charityResponse.data, isBusiness: false, isCharity: true });
      return charityResponse.data;
    } catch (error) {
      console.error('Charity login error:', error);
      throw error;
    }
  };

  // Charity user signup
  const charitySignup = async (signupData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/signup`, signupData);
      if (response.status === 201 || response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', 'charity');
        setupAxiosDefaults(token);
        const charityResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/me`);
        setUser({ ...charityResponse.data, isBusiness: false, isCharity: true });
        return charityResponse.data;
      }
    } catch (error) {
      console.error('Charity signup error:', error);
      throw error;
    }
  };

  // Social login
  const socialLogin = async (token) => {
    try {
      console.log('Social login: Starting with token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'user');
      console.log('Social login: Token and userType set in localStorage');
      setupAxiosDefaults(token);

      console.log('Social login: Fetching user data from API');
      const userResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/me`);
      console.log('Social login: User data received', userResponse.data);

      setUser({ ...userResponse.data, isBusiness: false, isCharity: false });
      console.log('Social login: User state updated');
      return userResponse.data;
    } catch (error) {
      console.error('Social login error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      clearUserData();
      throw error;
    }
  };

  // Enhanced clearUserData function
  const clearUserData = () => {
    console.log('Clearing all user data from localStorage');
    
    // Get current user ID for targeted cleaning
    const currentUserId = localStorage.getItem('currentUserId');
    
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
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('businessId');
    localStorage.removeItem('charityId');
    localStorage.removeItem('currentUserId');
    
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
        console.log(`Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Reset axios headers
    setupAxiosDefaults(null);
    
    console.log('All user data cleared from localStorage');
  };

  // Enhanced logout function
  const logout = () => {
    // Clear all user data
    clearUserData();
    
    // Reset user state
    setUser(null);
    
    console.log('User logged out successfully');
  };

  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log('Retrieved token from localStorage:', token);
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