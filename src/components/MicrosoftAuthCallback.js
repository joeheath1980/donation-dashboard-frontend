// src/components/MicrosoftAuthCallback.js

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('MicrosoftAuthCallback');

function MicrosoftAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socialLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      logger.debug('Handling Microsoft auth callback');
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      logger.debug('Token extracted from URL');

      if (token) {
        try {
          logger.debug('Attempting social login');
          await socialLogin(token);
          logger.debug('Social login successful');
          navigate('/profile');
        } catch (error) {
          logger.error('Error during Microsoft authentication', { message: error.message });
          navigate('/login', { state: { error: 'Failed to authenticate with Microsoft. Please try again.' } });
        }
      } else {
        logger.error('No authentication token received from Microsoft');
        navigate('/login', { state: { error: 'No authentication token received from Microsoft.' } });
      }
    };

    handleCallback();
  }, [location, socialLogin, navigate]);

  return (
    <div>
      <p>Processing Microsoft authentication...</p>
    </div>
  );
}

export default MicrosoftAuthCallback;