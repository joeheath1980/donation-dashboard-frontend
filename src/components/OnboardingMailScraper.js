import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../Login.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const OnboardingMailScraper = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuthorize = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gmail/auth-url`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Redirect the user to the Gmail authorization URL
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Gmail authorization error:', error.response?.data);
      setError(error.response?.data?.error || 'An error occurred during Gmail authorization');
    }
  };

  const handleSkip = () => {
    // Navigate to the profile page of the newly created user
    navigate('/profile');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <h2>Authorize Gmail Scraper</h2>
        {error && <p className={styles.error}>{error}</p>}
        <p>
          To help you track your donations, we can scan your Gmail for donation receipts.
          This process is secure and we only look for donation-related information.
        </p>
        <button onClick={handleAuthorize}>Authorize Gmail Scraper</button>
        <p className={styles.toggleText}>
          You can skip this step and authorize later from your account settings.
        </p>
        <button onClick={handleSkip}>Skip for now</button>
      </div>
    </div>
  );
};

export default OnboardingMailScraper;