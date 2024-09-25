// src/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Set a default API URL if the environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (token && userType) {
        try {
          let response;
          if (userType === 'business') {
            response = await axios.get(`${API_URL}/api/business/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({ ...response.data, isBusiness: true, isCharity: false });
          } else if (userType === 'charity') {
            response = await axios.get(`${API_URL}/api/charity/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({ ...response.data, isBusiness: false, isCharity: true });
          } else {
            response = await axios.get(`${API_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({ ...response.data, isBusiness: false, isCharity: false });
          }
        } catch (error) {
          console.error('Authentication error:', error);
          if (error.response && error.response.status === 401) {
            console.log('Token expired or invalid. Clearing local storage.');
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            localStorage.removeItem('businessId');
            localStorage.removeItem('charityId');
          }
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Regular user login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'user');
      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const response = await axios.post(`${API_URL}/api/users/register`, { name, email, password });
      console.log('Registration response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'user');
        console.log('Token stored in localStorage');

        const validatedUser = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${response.data.token}` },
        });
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
      const response = await axios.post(`${API_URL}/api/business/auth/login`, {
        contactEmail,
        password,
      });
      const { token, businessId } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'business');
      localStorage.setItem('businessId', businessId);
      const businessResponse = await axios.get(`${API_URL}/api/business/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const response = await axios.post(`${API_URL}/api/business/auth/signup`, signupData);
      if (response.status === 201 || response.status === 200) {
        const { token, businessId } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', 'business');
        localStorage.setItem('businessId', businessId);
        const businessResponse = await axios.get(`${API_URL}/api/business/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const response = await axios.post(`${API_URL}/api/charity/login`, {
        contactEmail,
        password,
      });
      const { token, charity } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'charity');
      localStorage.setItem('charityId', charity.id);
      const charityResponse = await axios.get(`${API_URL}/api/charity/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const response = await axios.post(`${API_URL}/api/charity/signup`, signupData);
      if (response.status === 201 || response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', 'charity');
        const charityResponse = await axios.get(`${API_URL}/api/charity/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

      console.log('Social login: Fetching user data from API');
      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('businessId');
    localStorage.removeItem('charityId');
    setUser(null);
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
    loading,
    getAuthHeaders,
    API_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
