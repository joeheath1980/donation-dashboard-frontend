// src/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Set a default API URL if the environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Configure axios defaults for cookie support
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user from the server using httpOnly cookie
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
        });
        
        const { user, userType } = response.data;
        
        if (userType === 'business') {
          setUser({ ...user, isBusiness: true, isCharity: false });
        } else if (userType === 'charity') {
          setUser({ ...user, isBusiness: false, isCharity: true });
        } else {
          setUser({ ...user, isBusiness: false, isCharity: false });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Regular user login
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      const { user } = response.data;
      setUser({ ...user, isBusiness: false, isCharity: false });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // User signup
  const userSignup = async (name, email, password) => {
    try {
      console.log('Attempting to register user:', { name, email });
      const response = await axios.post(
        `${API_URL}/api/users/register`,
        { name, email, password },
        { withCredentials: true }
      );
      console.log('Registration response:', response.data);

      if (response.data.user) {
        setUser({ ...response.data.user, isBusiness: false, isCharity: false });
        return response.data.user;
      } else {
        throw new Error('Registration successful, but no user data received.');
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
      const response = await axios.post(
        `${API_URL}/api/business/auth/login`,
        { contactEmail, password },
        { withCredentials: true }
      );
      const { business } = response.data;
      setUser({ ...business, isBusiness: true, isCharity: false });
      return business;
    } catch (error) {
      console.error('Business login error:', error);
      throw error;
    }
  };

  // Business user signup
  const businessSignup = async (signupData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/business/auth/signup`,
        signupData,
        { withCredentials: true }
      );
      if (response.status === 201 || response.status === 200) {
        const { business } = response.data;
        setUser({ ...business, isBusiness: true, isCharity: false });
        return business;
      }
    } catch (error) {
      console.error('Business signup error:', error);
      throw error;
    }
  };

  // Charity user login
  const charityLogin = async (contactEmail, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/charity/login`,
        { contactEmail, password },
        { withCredentials: true }
      );
      const { charity } = response.data;
      setUser({ ...charity, isBusiness: false, isCharity: true });
      return charity;
    } catch (error) {
      console.error('Charity login error:', error);
      throw error;
    }
  };

  // Charity user signup
  const charitySignup = async (signupData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/charity/signup`,
        signupData,
        { withCredentials: true }
      );
      if (response.status === 201 || response.status === 200) {
        const { charity } = response.data;
        setUser({ ...charity, isBusiness: false, isCharity: true });
        return charity;
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
      
      // Send token to backend to set as httpOnly cookie
      const response = await axios.post(
        `${API_URL}/api/auth/social-login`,
        { token },
        { withCredentials: true }
      );
      
      console.log('Social login: User data received', response.data);
      const { user } = response.data;
      
      setUser({ ...user, isBusiness: false, isCharity: false });
      console.log('Social login: User state updated');
      return user;
    } catch (error) {
      console.error('Social login error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  // Function to get auth headers (cookies are sent automatically)
  const getAuthHeaders = () => {
    // With httpOnly cookies, we don't need to manually set Authorization headers
    // Cookies are automatically included with withCredentials: true
    return {};
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
