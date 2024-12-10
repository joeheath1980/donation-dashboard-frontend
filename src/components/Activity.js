import React, { useState, useContext, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Activity.module.css';
import cleanStyles from './CleanDesign.module.css';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const STORAGE_KEY = 'donation-activity-state';

// Valid charity types from the backend model
const CHARITY_TYPES = [
  'Health Services',
  'Mental Health',
  'Education',
  'Environmental Conservation',
  'Social Welfare',
  'Emergency Relief',
  'Food Security',
  'Child Welfare',
  'Indigenous Support',
  'Housing',
  'Community Building',
  'Rural Support'
];

function Activity() {
  const { addDonation, addOneOffContribution } = useContext(ImpactContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [selectedCharityTypes, setSelectedCharityTypes] = useState({});
  const [authStatus, setAuthStatus] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [donationStatuses, setDonationStatuses] = useState({});

  // Refs for state management
  const isInitialized = useRef(false);
  const hasSavedData = useRef(false);
  const mountCount = useRef(0);
  const lastSavedState = useRef(null);

  // Load saved state on mount using useLayoutEffect to avoid flicker
  useLayoutEffect(() => {
    // Skip if already initialized
    if (isInitialized.current) {
      return;
    }

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        lastSavedState.current = parsed; // Store the parsed state

        let validSearchHistory = [];
        let validDonationStatuses = {};

        // Try to parse search history
        if (parsed?.searchHistory) {
          try {
            if (Array.isArray(parsed.searchHistory)) {
              validSearchHistory = parsed.searchHistory.map(entry => {
                try {
                  return {
                    ...entry,
                    timestamp: new Date(entry.timestamp || Date.now()),
                    results: Array.isArray(entry.results) ? entry.results.map(result => ({
                      ...result,
                      id: result.id || `recovered-${Date.now()}-${Math.random()}`,
                      searchTimestamp: new Date(result.searchTimestamp || Date.now())
                    })) : []
                  };
                } catch (entryError) {
                  console.warn('Error parsing search history entry:', entryError);
                  return null;
                }
              }).filter(Boolean);
            }
          } catch (searchHistoryError) {
            console.warn('Error parsing search history:', searchHistoryError);
          }
        }

        // Try to parse donation statuses
        if (parsed?.donationStatuses && typeof parsed.donationStatuses === 'object') {
          try {
            Object.entries(parsed.donationStatuses).forEach(([key, value]) => {
              if (value && typeof value === 'object' && value.type) {
                validDonationStatuses[key] = {
                  ...value,
                  timestamp: value.timestamp || new Date().toISOString()
                };
              }
            });
          } catch (statusError) {
            console.warn('Error parsing donation statuses:', statusError);
          }
        }

        // Only update state if we have valid data
        if (validSearchHistory.length > 0 || Object.keys(validDonationStatuses).length > 0) {
          setSearchHistory(validSearchHistory);
          setDonationStatuses(validDonationStatuses);
          hasSavedData.current = true;
        }
      } catch (e) {
        console.error('Error parsing saved state:', e);
      }
    }

    isInitialized.current = true;
  }, []); // Empty dependency array since this should only run once

  // Save state changes to localStorage with guards against empty data
  useEffect(() => {
    // Skip the first mount in StrictMode
    if (mountCount.current === 0) {
      mountCount.current++;
      return;
    }

    // Skip if we haven't initialized yet
    if (!isInitialized.current) {
      return;
    }

    // Only save if we have actual data to save
    if (searchHistory.length === 0 && Object.keys(donationStatuses).length === 0) {
      // If we previously had data but now it's empty, don't overwrite localStorage
      if (hasSavedData.current) {
        return;
      }
    }

    try {
      // Prepare search history for storage
      const safeSearchHistory = searchHistory.map(entry => ({
        ...entry,
        timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : new Date().toISOString(),
        results: Array.isArray(entry.results) ? entry.results.map(result => ({
          ...result,
          searchTimestamp: result.searchTimestamp instanceof Date 
            ? result.searchTimestamp.toISOString() 
            : new Date().toISOString()
        })) : []
      }));

      // Prepare donation statuses for storage
      const safeDonationStatuses = Object.entries(donationStatuses).reduce((acc, [key, value]) => {
        if (value && typeof value === 'object' && value.type) {
          acc[key] = {
            ...value,
            timestamp: value.timestamp || new Date().toISOString()
          };
        }
        return acc;
      }, {});

      // Compare with last saved state to prevent unnecessary saves
      const newState = {
        searchHistory: safeSearchHistory,
        donationStatuses: safeDonationStatuses
      };

      const lastState = lastSavedState.current;
      if (JSON.stringify(newState) !== JSON.stringify(lastState)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        lastSavedState.current = newState;
        hasSavedData.current = true;
      }
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [searchHistory, donationStatuses]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.authenticated) {
        setAuthStatus('Authenticated');
      } else {
        setAuthStatus('');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus('');
    }
  }, []);

  const handleSearchOutlookEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Microsoft authentication required' && errorData.action === 'microsoft_auth') {
          window.location.href = `${API_URL}/api/auth/microsoft`;
        } else {
          throw new Error(errorData.error || `An error occurred while searching Outlook emails. Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        const timestamp = new Date();
        const resultsWithIds = data.map(result => ({
          ...result,
          id: `outlook-${timestamp.getTime()}-${Math.random()}`,
          searchTimestamp: timestamp
        }));
        setSearchHistory(prev => [{ timestamp, source: 'outlook', results: resultsWithIds }, ...prev]);
      }
    } catch (error) {
      console.error('Error during Outlook email search:', error);
      setError(`Error: ${error.message}. Please check the console for more details.`);
    } finally {
      setLoading(false);
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
  }, [location, handleSearchOutlookEmails]);

  const handleSearchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Authentication required') {
          window.location.href = `${API_URL}/api/auth/google`;
        } else {
          throw new Error(errorData.error || `An error occurred while searching emails. Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        const timestamp = new Date();
        const resultsWithIds = data.map(result => ({
          ...result,
          id: `gmail-${timestamp.getTime()}-${Math.random()}`,
          searchTimestamp: timestamp
        }));
        setSearchHistory(prev => [{ timestamp, source: 'gmail', results: resultsWithIds }, ...prev]);
      }
    } catch (error) {
      console.error('Error during email search:', error);
      setError(`Error: ${error.message}. Please check the console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (index, event) => {
    setSelectedTypes({ ...selectedTypes, [index]: event.target.value });
  };

  const handleCharityTypeChange = (index, event) => {
    setSelectedCharityTypes({ ...selectedCharityTypes, [index]: event.target.value });
  };

  const formatDonationData = (donation) => {
    // Parse amount to remove currency symbols and convert to number
    const amount = parseFloat(donation.amount.replace(/[^0-9.-]+/g, ''));
    const date = new Date(donation.date);
    
    return {
      amount,
      charity: donation.charity,
      date: date.toISOString().split('T')[0],
      charityType: selectedCharityTypes[donation.id] || 'Social Welfare', // Use selected charity type or default to a valid type
      needsValidation: true,
      subject: donation.subject
    };
  };

  const handleCommit = async (donation, isOutlook = false) => {
    const selectedType = selectedTypes[donation.id];
    const formattedDonation = formatDonationData(donation);

    if (!selectedCharityTypes[donation.id]) {
      setError('Please select a charity type before committing the donation.');
      return;
    }

    try {
      let result;
      if (selectedType === 'regular') {
        formattedDonation.isMonthly = true;
        result = await fetch(`${API_URL}/api/donations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formattedDonation)
        }).then(response => {
          if (!response.ok) throw new Error('Failed to add donation');
          return response.json();
        });

        if (result?._id) {
          setDonationStatuses(prev => ({ 
            ...prev, 
            [donation.id]: { 
              type: 'committed-regular',
              resultId: result._id,
              timestamp: new Date().toISOString()
            }
          }));
          // Call addDonation from context after successful commit
          addDonation(result);
        }
      } else if (selectedType === 'one-off') {
        // Updated endpoint to match backend
        result = await fetch(`${API_URL}/api/contributions/one-off`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formattedDonation)
        }).then(response => {
          if (!response.ok) throw new Error('Failed to add one-off contribution');
          return response.json();
        });

        if (result?._id) {
          setDonationStatuses(prev => ({ 
            ...prev, 
            [donation.id]: { 
              type: 'committed-oneoff',
              resultId: result._id,
              timestamp: new Date().toISOString()
            }
          }));
          // Call addOneOffContribution from context after successful commit
          addOneOffContribution(result);
        }
      }
    } catch (error) {
      console.error('Error committing donation:', error);
      setError(`Failed to commit donation: ${error.message}`);
      // Reset status if commit fails
      setDonationStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[donation.id];
        return newStatuses;
      });
    }
  };

  const handleDelete = (donationId) => {
    setDonationStatuses(prev => ({ 
      ...prev, 
      [donationId]: { 
        type: 'deleted',
        timestamp: new Date().toISOString()
      }
    }));
  };

  const handleRestore = (donationId) => {
    setDonationStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[donationId];
      return newStatuses;
    });
  };

  const navigateToDonation = (donation, type) => {
    const status = donationStatuses[donation.id];
    if (!status?.resultId) {
      console.error('No result ID found for donation');
      return;
    }

    const path = type === 'regular' ? '/donations' : '/one-off';
    navigate(`${path}?highlight=${status.resultId}`);
  };

  const renderDonationCard = (donation, source) => {
    const status = donationStatuses[donation.id];
    const isCommitted = status?.type?.startsWith('committed');
    const isDeleted = status?.type === 'deleted';

    const cardClassName = `${styles.emailResultItem} ${cleanStyles.card} ${
      isCommitted ? styles.committedDonation : ''
    } ${isDeleted ? styles.deletedDonation : ''}`;

    return (
      <li key={donation.id} className={cardClassName}>
        <div className={styles.donationHeader}>
          <div>
            <strong>Charity:</strong> {donation.charity}
            {status?.type && (
              <span className={styles.statusBadge}>
                {status.type.replace('-', ' ').toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className={styles.donationContent}>
          <strong>Date:</strong> {donation.date}<br />
          <strong>Amount:</strong> {donation.amount}<br />
          <strong>Subject:</strong> {donation.subject}<br />
        </div>
        
        {!isCommitted && !isDeleted && (
          <>
            <select
              value={selectedTypes[donation.id] || ''}
              onChange={(event) => handleTypeChange(donation.id, event)}
              className={styles.categorySelect}
            >
              <option value="">Select Type</option>
              <option value="regular">Regular Contribution</option>
              <option value="one-off">One-Off Contribution</option>
            </select>

            <select
              value={selectedCharityTypes[donation.id] || ''}
              onChange={(event) => handleCharityTypeChange(donation.id, event)}
              className={styles.categorySelect}
            >
              <option value="">Select Charity Type</option>
              {CHARITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button 
              onClick={() => handleCommit(donation, source === 'outlook')} 
              className={`${styles.saveButton} ${cleanStyles.button}`}
              disabled={!selectedTypes[donation.id] || !selectedCharityTypes[donation.id]}
            >
              Commit
            </button>
            <button
              onClick={() => handleDelete(donation.id)}
              className={styles.deleteButton}
              aria-label="Delete Email Result"
            >
              &times;
            </button>
          </>
        )}

        {(isCommitted || isDeleted) && (
          <div className={styles.actionButtons}>
            {isCommitted && status?.resultId && (
              <button
                onClick={() => navigateToDonation(donation, status.type === 'committed-regular' ? 'regular' : 'one-off')}
                className={`${styles.linkButton} ${cleanStyles.button}`}
              >
                View Details
              </button>
            )}
            <button
              onClick={() => handleRestore(donation.id)}
              className={`${styles.restoreButton} ${cleanStyles.button}`}
            >
              Restore
            </button>
          </div>
        )}
      </li>
    );
  };

  const renderSearchResults = () => (
    <div className={styles.searchHistory}>
      {searchHistory.map((entry, index) => (
        <div key={index} className={styles.searchEntry}>
          <h5 className={cleanStyles.heading}>
            Search Results from {entry.source.toUpperCase()} - 
            {format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm:ss')}
          </h5>
          <ul className={styles.emailResultsList}>
            {entry.results.map(result => renderDonationCard(result, entry.source))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${styles.container} ${cleanStyles.container}`}>
      <h1 className={`${styles.activityHeader} ${cleanStyles.heading}`}>
        Discover your donations and start tracking your impact
      </h1>

      <div className={`${styles.emailSection} ${cleanStyles.card}`}>
        <div className={styles.buttonContainer}>
          <button 
            onClick={handleSearchEmails} 
            disabled={loading} 
            className={`${styles.scrapeButton} ${cleanStyles.button}`}
          >
            {loading ? 'Searching...' : 'Search Gmail for Donations'}
          </button>
          <button 
            onClick={handleSearchOutlookEmails} 
            disabled={loading} 
            className={`${styles.scrapeButton} ${cleanStyles.button}`}
          >
            {loading ? 'Searching...' : 'Search Outlook for Donations'}
          </button>
          <Link to="/your-impact" className={`${styles.toggleButton} ${cleanStyles.button}`}>
            Check Out Your Impact
          </Link>
        </div>

        {loading && <p className={styles.loading}>Searching emails... Please wait.</p>}
        {error && <p className={styles.error}>{error}</p>}
        {authStatus === 'Authenticated' && <p className={styles.authStatus}>{authStatus}</p>}
        
        {searchHistory.length > 0 && renderSearchResults()}
      </div>
    </div>
  );
}

export default Activity;