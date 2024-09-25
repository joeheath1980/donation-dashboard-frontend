// src/components/MicrosoftAuthCallback.js

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MicrosoftAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socialLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('MicrosoftAuthCallback: Handling callback');
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      console.log('MicrosoftAuthCallback: Received token:', token);

      if (token) {
        try {
          console.log('MicrosoftAuthCallback: Attempting social login');
          await socialLogin(token);
          console.log('MicrosoftAuthCallback: Social login successful');
          navigate('/profile');
        } catch (error) {
          console.error('MicrosoftAuthCallback: Error during Microsoft authentication:', error);
          navigate('/login', { state: { error: 'Failed to authenticate with Microsoft. Please try again.' } });
        }
      } else {
        console.error('MicrosoftAuthCallback: No authentication token received from Microsoft');
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