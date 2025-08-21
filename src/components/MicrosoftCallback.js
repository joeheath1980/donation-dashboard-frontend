// src/components/MicrosoftCallback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiServices from '../services/api.service';
import { API_ENDPOINTS, USER_TYPES } from '../config/api.config';
import { SecureTokenStorage, UserDataStorage } from '../utils/auth.utils';

const MicrosoftCallback = () => {
  const navigate = useNavigate();
  const { socialLogin, setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      const cookieMode = String(process.env.REACT_APP_AUTH_COOKIE_MODE).toLowerCase() === 'true';

      // New OAuth Code Exchange flow (Microsoft)
      if (code) {
        try {
          const api = apiServices.client;
          const { data } = await api.post('/api/auth/exchange-code', { code });
          const { 
            accessToken, 
            refreshToken, 
            user: userData,
            accessTokenExpiresIn,
            refreshTokenExpiresIn 
          } = data || {};
          if (!accessToken) throw new Error('No access token received from exchange');
          SecureTokenStorage.setToken(accessToken, refreshToken || null);
          
          // Schedule proactive refresh if TTL provided
          if (accessTokenExpiresIn && window.scheduleTokenRefresh) {
            window.scheduleTokenRefresh(accessTokenExpiresIn);
          }
          const role = userData?.role || USER_TYPES.USER;
          UserDataStorage.setUserType(role);
          if (userData?._id || userData?.id) {
            UserDataStorage.setUserId(userData._id || userData.id);
          }
          setUser({ ...userData, isBusiness: role === USER_TYPES.BUSINESS, isCharity: role === USER_TYPES.CHARITY });
          const isNewUser = !!userData?.isNewUser;
          navigate(isNewUser ? '/activity' : '/dashboard');
          return;
        } catch (e) {
          navigate('/login', { state: { error: 'Failed to authenticate with Microsoft. Please try again.' } });
          return;
        }
      }

      if (cookieMode) {
        try {
          const api = apiServices.client;
          const userResponse = await api.get(API_ENDPOINTS.USER_PROFILE);
          const userData = userResponse.data;
          const role = userData.role || 'user';
          if (role === USER_TYPES.BUSINESS) {
            UserDataStorage.setUserType(USER_TYPES.BUSINESS);
          } else if (role === USER_TYPES.CHARITY) {
            UserDataStorage.setUserType(USER_TYPES.CHARITY);
          } else if (role === USER_TYPES.ADMIN) {
            UserDataStorage.setUserType(USER_TYPES.ADMIN);
          } else {
            UserDataStorage.setUserType(USER_TYPES.USER);
          }
          if (userData._id || userData.id) {
            UserDataStorage.setUserId(userData._id || userData.id);
          }
          setUser({ ...userData, isBusiness: role === USER_TYPES.BUSINESS, isCharity: role === USER_TYPES.CHARITY });
          navigate('/dashboard');
          return;
        } catch (e) {
          navigate('/login', { state: { error: 'Failed to authenticate with Microsoft. Please try again.' } });
          return;
        }
      }

      navigate('/login', { state: { error: 'Authentication failed. Please try again.' } });
    };

    handleCallback();
  }, [navigate, socialLogin]);

  return <div>Processing Microsoft authentication...</div>;
};

export default MicrosoftCallback;
