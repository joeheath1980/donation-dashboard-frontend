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
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    console.log('Login function called with:', email, password);
    console.log('API URL:', API_URL);
    try {
      const response = await axios.post(`${API_URL}/api/auth`, { email, password });
      console.log('Login response:', response);
      const { token } = response.data;
      localStorage.setItem('token', token);
      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User response:', userResponse);
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  };

  const socialLogin = async (token) => {
    try {
      localStorage.setItem('token', token);
      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    login,
    socialLogin,
    logout,
    loading,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};