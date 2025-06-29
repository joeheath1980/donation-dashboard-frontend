import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { createLogger } from '../utils/logger';

const logger = createLogger('GoogleAuthCallback');

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socialLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      logger.debug('Handling Google auth callback');
      try {
        // Extract parameters from the URL
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const token = params.get('token');
        const message = params.get('message');

        logger.debug('Parameters extracted from URL', { status, hasToken: !!token });

        if (status === 'error') {
          logger.error('OAuth error from backend', { message });
          navigate(`/login?error=${encodeURIComponent(message || 'Authentication failed')}`);
          return;
        }

        if (status === 'success' && token) {
          // Decode the token to get user info
          const decodedToken = jwtDecode(token);
          logger.debug('Token decoded', { 
            userId: decodedToken.userId,
            email: decodedToken.email,
            isNewUser: decodedToken.isNewUser 
          });

          logger.debug('Calling socialLogin');
          // Call the socialLogin function with the token
          await socialLogin(token);
          logger.debug('socialLogin successful');

          // Redirect based on isNewUser flag (default to dashboard if not present)
          const isNewUser = decodedToken.isNewUser || false;
          if (isNewUser) {
            logger.debug('Navigating to Activity page for new user');
            navigate('/activity');
          } else {
            logger.debug('Navigating to dashboard for existing user');
            navigate('/dashboard');
          }
        } else {
          logger.error('No token found in the URL');
          navigate('/login?error=No%20authentication%20token%20received');
        }
      } catch (error) {
        logger.error('Error handling Google authentication callback', { message: error.message });
        navigate(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
      }
    };

    handleCallback();
  }, [navigate, location, socialLogin]);

  return <div>Processing Google authentication...</div>;
};

export default GoogleAuthCallback;