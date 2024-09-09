import React, { useState, useContext, useEffect } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from '../Impact.module.css';

function Activity() {
  const { addDonation, addOneOffContribution } = useContext(ImpactContext);

  const [gmailResults, setGmailResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [authStatus, setAuthStatus] = useState('');
  const [serverStatus, setServerStatus] = useState('');

  useEffect(() => {
    console.log('Activity component mounted');
    checkServerStatus();
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

  const checkServerStatus = async () => {
    try {
      console.log('Checking server status...');
      const healthResponse = await fetch('http://localhost:3002/api/health', { mode: 'cors' });
      if (!healthResponse.ok) {
        throw new Error('Health check failed');
      }
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);

      const testResponse = await fetch('http://localhost:3002/api/test', { mode: 'cors' });
      if (!testResponse.ok) {
        throw new Error('Test route failed');
      }
      const testData = await testResponse.json();
      console.log('Test route response:', testData);

      setServerStatus('Server is running and accessible');
    } catch (error) {
      console.error('Server status check failed:', error);
      setServerStatus(`Server is not accessible: ${error.message}`);
    }
  };

  const exchangeAuthCode = async (code) => {
    try {
      const response = await fetch('http://localhost:3002/api/oauth2callback?code=' + code, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('Failed to exchange auth code for tokens');
      }
      const data = await response.json();
      console.log('Token exchange successful:', data);
      setAuthStatus('Authentication completed. You can now scrape Gmail.');
    } catch (error) {
      console.error('Error exchanging auth code:', error);
      setAuthStatus('Authentication failed. Please try again.');
    }
  };

  const handleScrapeGmail = async () => {
    console.log('handleScrapeGmail called');
    setLoading(true);
    setError(null);
    setAuthStatus('');
    try {
      // First, check if the server is running
      console.log('Performing health check');
      const healthCheck = await fetch('http://localhost:3002/api/health', { mode: 'cors' })
        .catch(error => {
          console.error('Health check fetch error:', error);
          throw new Error(`Server is not responding (Health check). Error: ${error.message}`);
        });

      if (!healthCheck.ok) {
        const errorBody = await healthCheck.text();
        console.error('Health check failed. Status:', healthCheck.status, 'Body:', errorBody);
        throw new Error(`Server health check failed. Status: ${healthCheck.status}`);
      }
      console.log('Health check passed');

      console.log('Sending request to scrape Gmail');
      const response = await fetch('http://localhost:3002/api/scrape-gmail', { mode: 'cors' })
        .catch(error => {
          console.error('Scrape Gmail fetch error:', error);
          throw new Error(`Failed to connect to the server. Error: ${error.message}`);
        });

      console.log('Response received:', response.status, response.statusText);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Scrape Gmail failed. Status:', response.status, 'Body:', errorBody);
        const errorData = errorBody ? JSON.parse(errorBody) : {};
        if (errorData.error === 'Authentication required' || errorData.error === 'Token expired') {
          console.log('Authentication required');
          setAuthStatus('Authentication required. Redirecting to Google for authentication...');
          // Make a POST request to initiate OAuth flow
          const authResponse = await fetch('http://localhost:3002/api/auth/google', {
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

  const handleTypeChange = (index, event) => {
    console.log('Type changed for index:', index, 'to:', event.target.value);
    setSelectedTypes({ ...selectedTypes, [index]: event.target.value });
  };

  const handleCommit = async (index) => {
    const donation = gmailResults[index];
    const selectedType = selectedTypes[index];

    console.log('Committing donation:', donation);

    if (selectedType === 'regular') {
      console.log('Adding regular donation');
      try {
        await addDonation(donation);
        console.log('Regular donation added successfully');
      } catch (error) {
        console.error('Error adding regular donation:', error);
        setError(`Failed to add regular donation: ${error.message}`);
        return;
      }
    } else if (selectedType === 'one-off') {
      console.log('Adding one-off contribution');
      try {
        await addOneOffContribution(donation);
        console.log('One-off contribution added successfully');
      } catch (error) {
        console.error('Error adding one-off contribution:', error);
        setError(`Failed to add one-off contribution: ${error.message}`);
        return;
      }
    }

    handleDeleteGmailResult(index);
  };

  const handleDeleteGmailResult = (index) => {
    console.log('Deleting Gmail result at index:', index);
    const updatedResults = gmailResults.filter((_, i) => i !== index);
    setGmailResults(updatedResults);
    const updatedTypes = { ...selectedTypes };
    delete updatedTypes[index];
    setSelectedTypes(updatedTypes);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Activity</h2>

      <div className={styles.serverStatus}>
        <p>Server Status: {serverStatus}</p>
        <button onClick={checkServerStatus}>Check Server Status</button>
      </div>

      <div className={styles.gmailSection}>
        <h4>Donations from Gmail</h4>
        <button onClick={handleScrapeGmail} disabled={loading}>
          {loading ? 'Scraping...' : 'Scrape Gmail for Donations'}
        </button>
        {loading && <p className={styles.loading}>Scraping Gmail... Please wait.</p>}
        {error && <p className={styles.error}>{error}</p>}
        {authStatus && <p className={styles.authStatus}>{authStatus}</p>}
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
                  <select
                    value={selectedTypes[index] || ''}
                    onChange={(event) => handleTypeChange(index, event)}
                  >
                    <option value="">Select Type</option>
                    <option value="regular">Regular Contribution</option>
                    <option value="one-off">One-Off Contribution</option>
                  </select>
                  <button onClick={() => handleCommit(index)}>
                    Commit
                  </button>
                  <button
                    className={styles.deleteIcon}
                    onClick={() => handleDeleteGmailResult(index)}
                    aria-label="Delete Gmail Result"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Activity;