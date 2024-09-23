// src/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Set a default API URL if the environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Can represent either regular user or business user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (token) {
        try {
          let response;
          if (userType === 'business') {
            response = await axios.get(`${API_URL}/api/business/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser({ ...response.data, isBusiness: true });
          } else {
            response = await axios.get(`${API_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser({ ...response.data, isBusiness: false });
          }
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('businessId');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Regular user login
  const login = async (email, password) => {
    console.log('Login function called with:', email, password);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      console.log('Login response:', response);
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'user');
      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User response:', userResponse);
      setUser({ ...userResponse.data, isBusiness: false });
      return userResponse.data;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  };

  // Business user login
  const businessLogin = async (contactEmail, password) => {
    console.log('Business login function called with:', contactEmail, password);
    try {
      const response = await axios.post(`${API_URL}/api/business/auth/login`, { contactEmail, password });
      console.log('Business login response:', response);
      const { token, businessId } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'business');
      localStorage.setItem('businessId', businessId);
      const businessResponse = await axios.get(`${API_URL}/api/business/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Business response:', businessResponse);
      setUser({ ...businessResponse.data, isBusiness: true });
      return businessResponse.data;
    } catch (error) {
      console.error('Business login error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  };

  // Business user signup
  const businessSignup = async (signupData) => {
    console.log('Business signup function called with:', signupData);
    try {
      const response = await axios.post(`${API_URL}/api/business/auth/signup`, signupData);
      console.log('Business signup response:', response);
      if (response.status === 201) {
        const { token, businessId } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', 'business');
        localStorage.setItem('businessId', businessId);
        const businessResponse = await axios.get(`${API_URL}/api/business/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Business response after signup:', businessResponse);
        setUser({ ...businessResponse.data, isBusiness: true });
        return businessResponse.data;
      }
    } catch (error) {
      console.error('Business signup error:', error);
      throw error;
    }
  };

  // Social login (if applicable)
  const socialLogin = async (token) => {
    console.log('socialLogin called with token:', token);
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'user');
      console.log('Token and userType set in localStorage');
      
      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User response from /api/users/me:', userResponse.data);
      
      setUser({ ...userResponse.data, isBusiness: false });
      console.log('User state updated:', userResponse.data);
      
      return userResponse.data;
    } catch (error) {
      console.error('Social login error:', error);
      console.error('Error response:', error.response);
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
    setUser(null);
  };

  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    setUser,
    login,
    businessLogin,
    businessSignup, // Add businessSignup to the context
    socialLogin,
    logout,
    loading,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

