// src/components/MicrosoftAuthCallback.js

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../utils/logger';
import { SecureTokenStorage, UserDataStorage } from '../utils/auth.utils';
import apiServices from '../services/api.service';
import { API_ENDPOINTS, USER_TYPES } from '../config/api.config';

const logger = createLogger('MicrosoftAuthCallback');

function MicrosoftAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      logger.debug('Handling Microsoft auth callback');
      try {
        // Extract parameters from the URL
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const code = params.get('code');
        const message = params.get('message');
        const returnTo = params.get('returnTo');

        logger.debug('Parameters extracted from URL', { status, hasCode: !!code, returnTo });

        if (status === 'error') {
          logger.error('OAuth error from backend', { message });
          navigate(`/login?error=${encodeURIComponent(message || 'Authentication failed')}`);
          return;
        }

        const cookieMode = String(process.env.REACT_APP_AUTH_COOKIE_MODE).toLowerCase() === 'true';

        // New OAuth Code Exchange flow (CASA compliant)
        // Handle both status=success with code, or just code parameter for backwards compatibility
        if ((status === 'success' && code) || (!status && code)) {
          try {
            logger.debug('Exchanging code for tokens');
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

            // Store tokens securely in memory/sessionStorage (not localStorage)
            SecureTokenStorage.setToken(accessToken, refreshToken || null);

            // Schedule proactive refresh if TTL provided
            if (accessTokenExpiresIn && window.scheduleTokenRefresh) {
              window.scheduleTokenRefresh(accessTokenExpiresIn);
            }

            // Infer role and set user type
            const role = userData?.role || USER_TYPES.USER;
            if (role === USER_TYPES.BUSINESS) {
              UserDataStorage.setUserType(USER_TYPES.BUSINESS);
            } else if (role === USER_TYPES.CHARITY) {
              UserDataStorage.setUserType(USER_TYPES.CHARITY);
            } else if (role === USER_TYPES.ADMIN) {
              UserDataStorage.setUserType(USER_TYPES.ADMIN);
            } else {
              UserDataStorage.setUserType(USER_TYPES.USER);
            }

            if (userData?._id || userData?.id) {
              UserDataStorage.setUserId(userData._id || userData.id);
            }

            setUser({ ...userData, isBusiness: role === USER_TYPES.BUSINESS, isCharity: role === USER_TYPES.CHARITY });
            const isNewUser = !!userData?.isNewUser;

            // Handle returnTo parameter for OAuth flow
            if (returnTo === 'activity') {
              navigate('/activity?msAuth=true');
            } else {
              navigate(isNewUser ? '/activity' : '/dashboard');
            }
            return;
          } catch (e) {
            logger.error('Code exchange failed', { message: e.message, status: e.response?.status });
            navigate('/login?error=Authentication%20failed');
            return;
          }
        }

        // Cookie-based session mode (alternative CASA compliant approach)
        if (status === 'success' && cookieMode) {
          try {
            logger.debug('Using cookie-based authentication');
            const api = apiServices.client;
            const userResponse = await api.get(API_ENDPOINTS.USER_PROFILE);
            const userData = userResponse.data;

            // Default to regular user unless role indicates otherwise
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

            // Store user id for downstream components
            if (userData._id || userData.id) {
              UserDataStorage.setUserId(userData._id || userData.id);
            }

            // Set context user and navigate
            // Note: token remains unset in memory; API auth relies on HttpOnly cookies
            // CSRF headers are still applied by interceptors for state-changing requests
            setUser({ ...userData, isBusiness: role === USER_TYPES.BUSINESS, isCharity: role === USER_TYPES.CHARITY });

            // Handle returnTo parameter for OAuth flow
            if (returnTo === 'activity') {
              navigate('/activity?msAuth=true');
            } else {
              navigate('/dashboard');
            }
            return;
          } catch (e) {
            logger.error('Cookie-mode hydration failed', { message: e.message, status: e.response?.status });
            navigate('/login?error=Authentication%20failed');
            return;
          }
        }

        logger.error('OAuth callback missing code or status');
        navigate('/login?error=Authentication%20failed');
      } catch (error) {
        logger.error('Error handling Microsoft authentication callback', { message: error.message });
        navigate(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
      }
    };

    handleCallback();
  }, [navigate, location, setUser]);

  return (
    <div>
      <p>Processing Microsoft authentication...</p>
    </div>
  );
}

export default MicrosoftAuthCallback;