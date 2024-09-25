// src/components/MicrosoftCallback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MicrosoftCallback = () => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        try {
          await socialLogin(token);
          navigate('/dashboard');
        } catch (error) {
          console.error('Error during Microsoft authentication:', error);
          navigate('/login', { state: { error: 'Failed to authenticate with Microsoft. Please try again.' } });
        }
      } else {
        navigate('/login', { state: { error: 'No authentication token received from Microsoft.' } });
      }
    };

    handleCallback();
  }, [navigate, socialLogin]);

  return <div>Processing Microsoft authentication...</div>;
};

export default MicrosoftCallback;