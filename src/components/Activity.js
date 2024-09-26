import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../Impact.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function Activity() {
  const { addDonation, addOneOffContribution } = useContext(ImpactContext);
  const navigate = useNavigate();

  const [emailResults, setEmailResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [authStatus, setAuthStatus] = useState('');

  const exchangeAuthCode = useCallback(async (code) => {
    try {
      const response = await fetch(`${API_URL}/api/oauth2callback?code=${code}`, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('Failed to exchange auth code for tokens');
      }
      const data = await response.json();
      console.log('Token exchange successful:', data);
      setAuthStatus('Authentication completed. You can now search your emails.');
    } catch (error) {
      console.error('Error exchanging auth code:', error);
      setAuthStatus('Authentication failed. Please try again.');
    }
  }, []);

  useEffect(() => {
    console.log('Activity component mounted');
    // Check if the user was redirected back from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode) {
      console.log('Auth code found in URL');
      setAuthStatus('Authentication successful. You can now search your emails.');
      // Remove the code from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Exchange the auth code for tokens
      exchangeAuthCode(authCode);
    }
  }, [exchangeAuthCode]);

  const handleSearchEmails = async () => {
    console.log('handleSearchEmails called');
    setLoading(true);
    setError(null);
    setAuthStatus('');
    try {
      console.log('Sending request to search emails');
      console.log('API_URL:', API_URL);
      const response = await fetch(`${API_URL}/api/scrape-gmail`, { 
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('Search emails fetch error:', error);
        throw new Error(`Failed to connect to the server. Error: ${error.message}`);
      });

      console.log('Response received:', response.status, response.statusText);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Search emails failed. Status:', response.status, 'Body:', errorBody);
        const errorData = errorBody ? JSON.parse(errorBody) : {};
        if (errorData.error === 'Authentication required' || errorData.error === 'Token expired') {
          console.log('Authentication required');
          setAuthStatus('Authentication required. Redirecting to Google for authentication...');
          // Make a POST request to initiate OAuth flow
          const authResponse = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const authData = await authResponse.json();
          if (authResponse.ok && authData.authUrl) {
            console.log('Redirecting to auth URL:', authData.authUrl);
            window.location.href = authData.authUrl;
          } else {
            throw new Error('Failed to initiate Google authentication');
          }
        } else {
          throw new Error(errorData.error || `An error occurred while searching emails. Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        console.log('Search results:', data);
        setEmailResults(data);
      }
    } catch (error) {
      console.error('Error during email search:', error);
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
    const donation = emailResults[index];
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

    handleDeleteEmailResult(index);
  };

  const handleDeleteEmailResult = (index) => {
    console.log('Deleting email result at index:', index);
    const updatedResults = emailResults.filter((_, i) => i !== index);
    setEmailResults(updatedResults);
    const updatedTypes = { ...selectedTypes };
    delete updatedTypes[index];
    setSelectedTypes(updatedTypes);
  };

  const handleManagePayments = () => {
    console.log('Manage Payments button clicked');
    navigate('/manage-payments');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.activityHeader}>Discover your donations and start tracking your impact</h1>

      <div className={styles.emailSection}>
        <div className={styles.buttonContainer}>
          <button onClick={handleSearchEmails} disabled={loading} className={styles.scrapeButton}>
            {loading ? 'Searching...' : 'Search Gmail for Donations'}
          </button>
          <Link to="/profile" className={styles.toggleButton}>Check Out Your Impact</Link>
          <button onClick={handleManagePayments} className={styles.toggleButton}>Manage Payments</button>
        </div>

        {loading && <p className={styles.loading}>Searching emails... Please wait.</p>}
        {error && <p className={styles.error}>{error}</p>}
        {authStatus && <p className={styles.authStatus}>{authStatus}</p>}
        {emailResults.length > 0 && (
          <div className={styles.resultsContainer}>
            <h5>Email Search Results:</h5>
            <p className={styles.sortMessage}>Sort your donations into regular or one-off contributions:</p>
            <ul className={styles.emailResultsList}>
              {emailResults.map((result, index) => (
                <li key={index} className={styles.emailResultItem}>
                  <strong>Charity:</strong> {result.charity}<br />
                  <strong>Date:</strong> {result.date}<br />
                  <strong>Amount:</strong> {result.amount}<br />
                  <strong>Subject:</strong> {result.subject}<br />
                  <select
                    value={selectedTypes[index] || ''}
                    onChange={(event) => handleTypeChange(index, event)}
                    className={styles.categorySelect}
                  >
                    <option value="">Select Type</option>
                    <option value="regular">Regular Contribution</option>
                    <option value="one-off">One-Off Contribution</option>
                  </select>
                  <button onClick={() => handleCommit(index)} className={styles.saveButton}>
                    Commit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteEmailResult(index)}
                    aria-label="Delete Email Result"
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