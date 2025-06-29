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
        // Extract the token from the URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        logger.debug('Token extracted from URL');

        if (token) {
          // Decode the token to get isNewUser flag
          const decodedToken = jwtDecode(token);
          const isNewUser = decodedToken.isNewUser;
          logger.debug('Token decoded', { isNewUser: decodedToken.isNewUser });

          logger.debug('Calling socialLogin');
          // Call the socialLogin function with the token
          await socialLogin(token);
          logger.debug('socialLogin successful');

          // Redirect based on isNewUser flag
          if (isNewUser) {
            logger.debug('Navigating to Activity page for new user');
            navigate('/activity');
          } else {
            logger.debug('Navigating to dashboard for existing user');
            navigate('/dashboard');
          }
        } else {
          logger.error('No token found in the URL');
          navigate('/login');
        }
      } catch (error) {
        logger.error('Error handling Google authentication callback', { message: error.message });
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, location, socialLogin]);

  return <div>Processing Google authentication...</div>;
};

export default GoogleAuthCallback;