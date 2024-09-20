import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socialLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('GoogleAuthCallback: Handling callback');
      try {
        // Extract the token from the URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        console.log('GoogleAuthCallback: Extracted token:', token);

        if (token) {
          // Decode the token to get isNewUser flag
          const decodedToken = jwtDecode(token);
          const isNewUser = decodedToken.isNewUser;
          console.log('Decoded token:', decodedToken);

          console.log('GoogleAuthCallback: Calling socialLogin');
          // Call the socialLogin function with the token
          await socialLogin(token);
          console.log('GoogleAuthCallback: socialLogin successful');

          // Redirect based on isNewUser flag
          if (isNewUser) {
            console.log('Navigating to OnboardingMailScraper');
            navigate('/onboarding/mail-scraper');
          } else {
            console.log('Navigating to dashboard');
            navigate('/dashboard');
          }
        } else {
          console.error('GoogleAuthCallback: No token found in the URL');
          navigate('/login');
        }
      } catch (error) {
        console.error('GoogleAuthCallback: Error handling Google authentication callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, location, socialLogin]);

  return <div>Processing Google authentication...</div>;
};

export default GoogleAuthCallback;