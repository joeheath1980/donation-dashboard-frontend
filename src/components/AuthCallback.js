import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallback() {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const token = urlParams.get('token');
      const error = urlParams.get('message');

      if (status === 'success' && token) {
        try {
          await socialLogin(token);
          navigate('/dashboard');
        } catch (err) {
          console.error('Error during social login:', err);
          navigate('/login', { state: { error: 'Failed to complete social login. Please try again.' } });
        }
      } else if (status === 'error') {
        console.error('Authentication error:', error);
        navigate('/login', { state: { error: 'Authentication failed. Please try again.' } });
      } else {
        navigate('/login', { state: { error: 'An unexpected error occurred.' } });
      }
    };

    handleAuthCallback();
  }, [navigate, socialLogin]);

  return (
    <div>
      <p>Processing authentication...</p>
    </div>
  );
}

export default AuthCallback;