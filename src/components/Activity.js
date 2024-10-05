import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import { Link, useLocation } from 'react-router-dom';
import styles from '../Impact.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function Activity() {
  const { addDonation, addOneOffContribution } = useContext(ImpactContext);
  const location = useLocation();

  const [emailResults, setEmailResults] = useState([]);
  const [outlookResults, setOutlookResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [authStatus, setAuthStatus] = useState('');

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.authenticated) {
        setAuthStatus('Authenticated');
      } else {
        setAuthStatus('Not authenticated');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus('Error checking authentication status');
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const justAuthenticated = urlParams.get('justAuthenticated');
    if (justAuthenticated === 'true') {
      handleSearchOutlookEmails();
    }
  }, [location]);

  const handleSearchEmails = async () => {
    console.log('handleSearchEmails called');
    setLoading(true);
    setError(null);
    try {
      console.log('Sending request to search emails');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const response = await fetch(`${API_URL}/api/scrape-gmail`, { 
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response.status, response.statusText);
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Authentication required') {
          console.log('Authentication required');
          window.location.href = `${API_URL}/api/auth/google`;
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

  const handleSearchOutlookEmails = async () => {
    console.log('handleSearchOutlookEmails called');
    setLoading(true);
    setError(null);
    try {
      console.log('Sending request to search Outlook emails');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const response = await fetch(`${API_URL}/api/scrape-outlook`, { 
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response.status, response.statusText);
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Microsoft authentication required' && errorData.action === 'microsoft_auth') {
          console.log('Microsoft authentication required');
          window.location.href = `${API_URL}/api/auth/microsoft`;
        } else {
          throw new Error(errorData.error || `An error occurred while searching Outlook emails. Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        console.log('Outlook search results:', data);
        setOutlookResults(data);
      }
    } catch (error) {
      console.error('Error during Outlook email search:', error);
      setError(`Error: ${error.message}. Please check the console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (index, event) => {
    console.log('Type changed for index:', index, 'to:', event.target.value);
    setSelectedTypes({ ...selectedTypes, [index]: event.target.value });
  };

  const handleCommit = async (index, isOutlook = false) => {
    const donation = isOutlook ? outlookResults[index] : emailResults[index];
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

    handleDeleteEmailResult(index, isOutlook);
  };

  const handleDeleteEmailResult = (index, isOutlook = false) => {
    console.log(`Deleting ${isOutlook ? 'Outlook' : 'Gmail'} email result at index:`, index);
    if (isOutlook) {
      const updatedResults = outlookResults.filter((_, i) => i !== index);
      setOutlookResults(updatedResults);
    } else {
      const updatedResults = emailResults.filter((_, i) => i !== index);
      setEmailResults(updatedResults);
    }
    const updatedTypes = { ...selectedTypes };
    delete updatedTypes[index];
    setSelectedTypes(updatedTypes);
  };

  const renderEmailResults = (results, isOutlook = false) => (
    <div className={styles.resultsContainer}>
      <h5>{isOutlook ? 'Outlook' : 'Gmail'} Search Results:</h5>
      <p className={styles.sortMessage}>Sort your donations into regular or one-off contributions:</p>
      <ul className={styles.emailResultsList}>
        {results.map((result, index) => (
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
            <button onClick={() => handleCommit(index, isOutlook)} className={styles.saveButton}>
              Commit
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteEmailResult(index, isOutlook)}
              aria-label="Delete Email Result"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.activityHeader}>Discover your donations and start tracking your impact</h1>

      <div className={styles.emailSection}>
        <div className={styles.buttonContainer}>
          <button onClick={handleSearchEmails} disabled={loading} className={styles.scrapeButton}>
            {loading ? 'Searching...' : 'Search Gmail for Donations'}
          </button>
          <button onClick={handleSearchOutlookEmails} disabled={loading} className={styles.scrapeButton}>
            {loading ? 'Searching...' : 'Search Outlook for Donations'}
          </button>
          <Link to="/profile" className={styles.toggleButton}>Check Out Your Impact</Link>
        </div>

        {loading && <p className={styles.loading}>Searching emails... Please wait.</p>}
        {error && <p className={styles.error}>{error}</p>}
        {authStatus && <p className={styles.authStatus}>{authStatus}</p>}
        {emailResults.length > 0 && renderEmailResults(emailResults)}
        {outlookResults.length > 0 && renderEmailResults(outlookResults, true)}
      </div>
    </div>
  );
}

export default Activity;