import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Login.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const OnboardingMailScraper = () => {
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [gmailResults, setGmailResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user was redirected back from Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode) {
      console.log('Auth code found in URL');
      setAuthStatus('Authentication successful. You can now scrape Gmail.');
      // Remove the code from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Exchange the auth code for tokens
      exchangeAuthCode(authCode);
    }
  }, []);

  const exchangeAuthCode = async (code) => {
    try {
      const response = await fetch(`${API_URL}/api/oauth2callback?code=${code}`, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('Failed to exchange auth code for tokens');
      }
      const data = await response.json();
      console.log('Token exchange successful:', data);
      setAuthStatus('Authentication completed. You can now scrape Gmail.');
      // After successful authentication, automatically trigger Gmail scraping
      handleScrapeGmail();
    } catch (error) {
      console.error('Error exchanging auth code:', error);
      setAuthStatus('Authentication failed. Please try again.');
      setError(error.message);
    }
  };

  const handleAuthorize = async () => {
    try {
      console.log('Initiating Gmail authorization');
      const authResponse = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        mode: 'cors',
      });
      const authData = await authResponse.json();
      if (authResponse.ok && authData.authUrl) {
        console.log('Redirecting to auth URL:', authData.authUrl);
        window.location.href = authData.authUrl;
      } else {
        throw new Error('Failed to initiate Google authentication');
      }
    } catch (error) {
      console.error('Gmail authorization error:', error);
      setError(error.message || 'An error occurred during Gmail authorization');
    }
  };

  const handleScrapeGmail = async () => {
    console.log('handleScrapeGmail called');
    setLoading(true);
    setError(null);
    setAuthStatus('');
    try {
      console.log('Sending request to scrape Gmail');
      const response = await fetch(`${API_URL}/api/scrape-gmail`, { mode: 'cors' });

      console.log('Response received:', response.status, response.statusText);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Scrape Gmail failed. Status:', response.status, 'Body:', errorBody);
        const errorData = errorBody ? JSON.parse(errorBody) : {};
        if (errorData.error === 'Authentication required' || errorData.error === 'Token expired') {
          console.log('Authentication required');
          setAuthStatus('Authentication required. Redirecting to Google for authentication...');
          await handleAuthorize();
        } else {
          throw new Error(errorData.error || `An error occurred while scraping Gmail. Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        console.log('Scrape results:', data);
        setGmailResults(data);
      }
    } catch (error) {
      console.error('Error during Gmail scraping:', error);
      setError(`Error: ${error.message}. Please check the console for more details.`);
    } finally {
      setLoading(false);
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
        {authStatus && <p className={styles.authStatus}>{authStatus}</p>}
        <p>
          To help you track your donations, we can scan your Gmail for donation receipts.
          This process is secure and we only look for donation-related information.
        </p>
        <button onClick={handleAuthorize} disabled={loading}>
          {loading ? 'Authorizing...' : 'Authorize Gmail Scraper'}
        </button>
        {loading && <p className={styles.loading}>Scraping Gmail... Please wait.</p>}
        {gmailResults.length > 0 && (
          <div className={styles.resultsContainer}>
            <h5>Gmail Scrape Results:</h5>
            <ul className={styles.gmailResultsList}>
              {gmailResults.map((result, index) => (
                <li key={index} className={styles.gmailResultItem}>
                  <strong>Charity:</strong> {result.charity}<br />
                  <strong>Date:</strong> {result.date}<br />
                  <strong>Amount:</strong> {result.amount}<br />
                  <strong>Subject:</strong> {result.subject}<br />
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className={styles.toggleText}>
          You can skip this step and authorize later from your account settings.
        </p>
        <button onClick={handleSkip}>Skip for now</button>
      </div>
    </div>
  );
};

export default OnboardingMailScraper;