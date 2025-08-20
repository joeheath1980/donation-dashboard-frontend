import React, { useState, useContext, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Activity.module.css';
import './SharedStyles.css';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import debounce from 'lodash/debounce';
import { createLogger } from '../utils/logger';
import { EmailForwardingModal } from './EmailForwarding';
import { UserDataStorage, SecureTokenStorage } from '../utils/auth.utils';

// Create a logger instance for this component
const logger = createLogger('Activity');

// Helper function for safe date formatting
function safeFormatDate(dateValue, dateFormat) {
  if (!dateValue) return "N/A";
  const dateObj = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
  if (!isValid(dateObj)) return "N/A";
  return format(dateObj, dateFormat);
}

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

// Custom hook for user storage
const useUserStorage = (userId) => {
  const STORAGE_KEY = userId ? `user-${userId}-donation-activity-state` : 'donation-activity-state-guest';
  const EXPIRATION_DAYS = 30;

  const loadState = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastUpdated = new Date(parsed.lastUpdated || Date.now());
        const now = new Date();
        if (differenceInDays(now, lastUpdated) > EXPIRATION_DAYS) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        if (parsed.userId === userId) return parsed;
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return null;
  }, [STORAGE_KEY, userId, EXPIRATION_DAYS]);

  const saveState = useCallback((state) => {
    try {
      const newState = {
        userId,
        ...state,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Clearing all data.');
        localStorage.clear();
      } else {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [STORAGE_KEY, userId]);

  const clearState = useCallback(() => localStorage.removeItem(STORAGE_KEY), [STORAGE_KEY]);

  return { loadState, saveState, clearState };
};

function Activity() {
  const { addDonation, addOneOffContribution } = useContext(ImpactContext);
  const { currentUserId } = useUser();
  const navigate = useNavigate();
  const { loadState, saveState, clearState } = useUserStorage(currentUserId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [selectedCharityTypes, setSelectedCharityTypes] = useState({});
  const [authStatus] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [donationStatuses, setDonationStatuses] = useState({});
  const [isClearing, setIsClearing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showEmailForwarding, setShowEmailForwarding] = useState(false);
  const [hasGmailAuth, setHasGmailAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [loadingForwarded, setLoadingForwarded] = useState(false);
  
  // Check user type - Gmail search is only for regular users
  const userType = UserDataStorage.getUserType();
  const isRegularUser = userType === 'user' || !userType; // Default to user if not set

  const isInitialized = useRef(false);
  const hasSavedData = useRef(false);
  const mountCount = useRef(0);
  const lastSavedState = useRef(null);
  const wasCleared = useRef(false);
  const clearingTimeout = useRef(null);

  const clearOldStorageKeys = useCallback(() => {
    localStorage.removeItem('donation-activity-state');
    // Add other legacy keys if applicable
  }, []);

  useLayoutEffect(() => {
    if (isInitialized.current) return;
  
    clearOldStorageKeys();
  
    const savedState = loadState(); // Updated to call loadState directly
    if (savedState && savedState.userId === currentUserId) {
      let validSearchHistory = [];
      let validDonationStatuses = {};
  
      if (savedState?.searchHistory && Array.isArray(savedState?.searchHistory)) {
        validSearchHistory = savedState.searchHistory
          .map(entry => {
            try {
              return {
                ...entry,
                timestamp: new Date(entry.timestamp || Date.now()),
                results: Array.isArray(entry.results)
                  ? entry.results.map(result => ({
                      ...result,
                      id: result.id || `recovered-${Date.now()}-${Math.random()}`,
                      searchTimestamp: new Date(result.searchTimestamp || Date.now())
                    }))
                  : []
              };
            } catch (entryError) {
              console.warn('Error parsing search history entry:', entryError);
              return null;
            }
          })
          .filter(Boolean);
      }
  
      if (savedState?.donationStatuses && typeof savedState.donationStatuses === 'object') {
        Object.entries(savedState.donationStatuses).forEach(([key, value]) => {
          if (value && typeof value === 'object' && value.type) {
            validDonationStatuses[key] = {
              ...value,
              timestamp: value.timestamp || new Date().toISOString()
            };
          }
        });
      }
  
      if (validSearchHistory.length > 0 || Object.keys(validDonationStatuses).length > 0) {
        console.log('[Activity] Initializing with saved state:', { validSearchHistory, validDonationStatuses });
        setSearchHistory(validSearchHistory);
        setDonationStatuses(validDonationStatuses);
        hasSavedData.current = true;
      }
    } else {
      console.warn('Loaded state does not match current user. Ignoring.');
      setSearchHistory([]);
      setDonationStatuses({});
    }
  
    isInitialized.current = true;
  }, [loadState, clearOldStorageKeys, currentUserId]);

// Memoize the inner function with useCallback
const saveFunction = useCallback((newState) => {
  saveState(newState);
  lastSavedState.current = newState;
}, [saveState]);

// Memoize the debounced function with useMemo
const saveToLocalStorage = useMemo(() => debounce(saveFunction, 500), [saveFunction]);

  useEffect(() => {
    if (mountCount.current === 0) {
      mountCount.current++;
      return;
    }

    if (!isInitialized.current) return;

    const isEmpty = searchHistory.length === 0 && Object.keys(donationStatuses).length === 0;
    console.log('[Activity] State change detected:', {
      isEmpty,
      wasCleared: wasCleared.current,
      searchHistoryLength: searchHistory.length,
      donationStatusesLength: Object.keys(donationStatuses).length
    });

    if (wasCleared.current && isEmpty) {
      console.log('[Activity] Skipping save due to cleared state');
      return;
    }

    const newState = {
      searchHistory,
      donationStatuses
    };

    if (JSON.stringify(newState) !== JSON.stringify(lastSavedState.current)) {
      saveToLocalStorage(newState);
    }
  }, [searchHistory, donationStatuses, saveToLocalStorage]);

  useEffect(() => {
    return () => {
      if (clearingTimeout.current) {
        clearTimeout(clearingTimeout.current);
      }
    };
  }, []);

  const clearOtherUsersData = useCallback(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user-') && !key.includes(currentUserId)) {
        localStorage.removeItem(key);
      }
      // Remove any old format keys
      if (key.startsWith('donation-activity-state-') && !key.includes(currentUserId)) {
        localStorage.removeItem(key);
      }
    });
  }, [currentUserId]);

  const auditLocalStorage = useCallback(() => {
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(key => key.startsWith('user-'));
    userKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.userId !== currentUserId) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
        localStorage.removeItem(key);
      }
    });
  }, [currentUserId]);

  const logError = useCallback((message, error) => {
    console.error(message, error);
    setError(`${message}: ${error.message}`);
  }, []);

  const checkGmailAuth = useCallback(async () => {
    setCheckingAuth(true);
    try {
      const token = SecureTokenStorage.getToken();
      if (!token) {
        setHasGmailAuth(false);
        return false;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/gmail-auth-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasGmailAuth(data.hasGmailAuth);
        return data.hasGmailAuth;
      }
      
      setHasGmailAuth(false);
      return false;
    } catch (error) {
      console.error('Error checking Gmail auth status:', error);
      setHasGmailAuth(false);
      return false;
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const fetchForwardedEmails = useCallback(async () => {
    setLoadingForwarded(true);
    try {
      const token = SecureTokenStorage.getToken();
      if (!token) {
        console.warn('No token for forwarded emails');
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/email/forward-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform forwarded emails to match Gmail scraping format
        const transformedEmails = (data.emails || [])
          .filter(email => email.status === 'processed' && email.parsed)
          .map(email => ({
            id: `forwarded-${email._id}`,
            charity: email.parsed.charity,
            amount: `${email.parsed.currency || '$'}${email.parsed.amount}`,
            date: email.parsed.date || email.createdAt,
            source: 'forwarded',
            originalEmail: email
          }));
        
        // Add to search history with a special entry
        if (transformedEmails.length > 0) {
          setSearchHistory(prev => {
            // Check if we already have a forwarded emails entry
            const existingIndex = prev.findIndex(entry => entry.source === 'forwarded');
            const newEntry = {
              timestamp: new Date(),
              source: 'forwarded',
              results: transformedEmails
            };
            
            if (existingIndex >= 0) {
              // Update existing entry
              const updated = [...prev];
              updated[existingIndex] = newEntry;
              return updated;
            } else {
              // Add new entry at the beginning
              return [newEntry, ...prev];
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching forwarded emails:', error);
    } finally {
      setLoadingForwarded(false);
    }
  }, []);

  useEffect(() => {
    clearOtherUsersData();
    auditLocalStorage();
  }, [clearOtherUsersData, auditLocalStorage]);

  useEffect(() => {
    checkGmailAuth();
  }, [checkGmailAuth]);

  useEffect(() => {
    fetchForwardedEmails();
  }, [fetchForwardedEmails]);

  const handleClearAll = useCallback(() => {
    console.log('[Activity] Starting clear operation');
    setIsClearing(true);
    wasCleared.current = true;

    console.log('[Activity] Removing data from localStorage');
    clearState();

    console.log('[Activity] Resetting all states');
    setSearchHistory([]);
    setDonationStatuses({});
    setSelectedTypes({});
    setSelectedCharityTypes({});

    console.log('[Activity] Resetting refs');
    lastSavedState.current = null;
    hasSavedData.current = false;

    clearingTimeout.current = setTimeout(() => {
      console.log('[Activity] Finishing clear operation');
      setIsClearing(false);
    }, 300);
  }, [clearState]);
  
  const handleSearchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = SecureTokenStorage.getToken();
      logger.debug('Token retrieved for handleSearchEmails', { hasToken: !!token });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/gmail-email-search`,
        {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 && errorData.action === 'google_auth') {
          window.location.href = `${API_CONFIG.BASE_URL}/api/auth/google`;
        } else {
          throw new Error(errorData.error || `An error occurred while searching Gmail emails. Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        console.log('[Activity] Gmail search response:', data);
        
        if (data.jobId) {
          console.log('[Activity] Gmail job started with jobId:', data.jobId);
          const timestamp = new Date();
          
          // Add the job to search history
          setSearchHistory(prev => [{ timestamp, source: 'gmail', jobId: data.jobId }, ...prev]);
          wasCleared.current = false;
          
          // Poll for status updates instead of using SSE (temporary fix for 401 error)
          const pollInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(
                `${API_CONFIG.BASE_URL}/api/email-search-status/${data.jobId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (!statusResponse.ok) {
                throw new Error('Failed to get job status');
              }
              
              const statusData = await statusResponse.json();
              console.log('[Gmail Polling] Status update:', statusData);
              
              // Update progress if available
              if (statusData.progress !== undefined) {
                setProgress(statusData.progress);
              }
              
              // Handle completed job
              if (statusData.state === 'completed' && statusData.result) {
                console.log('[Gmail Polling] Job completed with results:', statusData.result);
                
                // Add IDs and timestamp to each result
                const resultsWithIds = Array.isArray(statusData.result)
                  ? statusData.result.map(result => ({
                      ...result,
                      id: `gmail-${timestamp.getTime()}-${Math.random()}`,
                      searchTimestamp: timestamp
                    }))
                  : [];
                
                // Update search history with results
                setSearchHistory(prev => {
                  const updatedHistory = [...prev];
                  // Find the entry with this job ID
                  const index = updatedHistory.findIndex(entry => entry.jobId === data.jobId);
                  if (index !== -1) {
                    // Replace the entry with one that includes results
                    updatedHistory[index] = {
                      ...updatedHistory[index],
                      results: resultsWithIds
                    };
                  }
                  return updatedHistory;
                });
                
                clearInterval(pollInterval);
                setLoading(false);
                
              } else if (statusData.state === 'failed') {
                console.error('[Gmail Polling] Job failed');
                setError(`Gmail search failed: ${statusData.error || 'Unknown error'}`);
                clearInterval(pollInterval);
                setLoading(false);
              }
            } catch (error) {
              console.error('[Gmail Polling] Error checking status:', error);
              setError('Error checking job status');
              clearInterval(pollInterval);
              setLoading(false);
            }
          }, 2000); // Poll every 2 seconds
          
        } else {
          console.log('[Activity] No jobId found in response');
          setLoading(false);
        }
      }
    } catch (error) {
      logError('Error during Gmail email search', error);
      setLoading(false);
    }
  }, [logError]);
  
  const handleSearchOutlookEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = SecureTokenStorage.getToken();
      logger.debug('Token retrieved for handleSearchOutlookEmails', { hasToken: !!token });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/outlook/outlook-email-search`,
        {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Microsoft authentication required' && errorData.action === 'microsoft_auth') {
          window.location.href = `${API_CONFIG.BASE_URL}/api/auth/microsoft`;
        } else {
          throw new Error(errorData.error || `An error occurred while searching Outlook emails. Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        console.log('[Activity] Outlook search response:', data);
        
        if (data.jobId) {
          console.log('[Activity] Outlook job started with jobId:', data.jobId);
          const timestamp = new Date();
          
          // Add the job to search history
          setSearchHistory(prev => [{ timestamp, source: 'outlook', jobId: data.jobId }, ...prev]);
          wasCleared.current = false;
          
          // Use polling instead of SSE to avoid token in URL (security fix)
          logger.debug('[Activity] Starting secure polling for job:', data.jobId);
          
          const pollInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(
                `${API_CONFIG.BASE_URL}/api/outlook/status/${data.jobId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (!statusResponse.ok) {
                throw new Error(`Status check failed: ${statusResponse.status}`);
              }
              
              const statusData = await statusResponse.json();
              logger.debug('[Outlook Polling] Status received:', { 
                state: statusData.state, 
                progress: statusData.progress 
              });
              
              // Update progress if available
              if (statusData.progress !== undefined) {
                setProgress(statusData.progress);
              }
              
              // Handle completed job
              if (statusData.state === 'completed' && statusData.result) {
                logger.info('[Outlook Polling] Job completed with results count:', statusData.result?.length || 0);
                
                // Add IDs and timestamp to each result
                const resultsWithIds = Array.isArray(statusData.result)
                  ? statusData.result.map(result => ({
                      ...result,
                      id: `outlook-${timestamp.getTime()}-${Math.random()}`,
                      searchTimestamp: timestamp
                    }))
                  : [];
                
                // Update search history with results
                setSearchHistory(prev => {
                  const updatedHistory = [...prev];
                  // Find the entry with this job ID
                  const index = updatedHistory.findIndex(entry => entry.jobId === data.jobId);
                  if (index !== -1) {
                    // Replace the entry with one that includes results
                    updatedHistory[index] = {
                      ...updatedHistory[index],
                      results: resultsWithIds
                    };
                  }
                  return updatedHistory;
                });
                
                clearInterval(pollInterval);
                setLoading(false);
                
              } else if (statusData.state === 'failed' || statusData.error) {
                logger.error('[Outlook Polling] Job failed:', statusData.error);
                setError(`Outlook search failed: ${statusData.error || 'Unknown error'}`);
                clearInterval(pollInterval);
                setLoading(false);
              }
            } catch (error) {
              logger.error('[Outlook Polling] Error:', error);
              setError('Error checking status. Please try again.');
              clearInterval(pollInterval);
              setLoading(false);
            }
          }, 2000); // Poll every 2 seconds
          
          // Store interval ID for cleanup
          const timeoutId = setTimeout(() => {
            clearInterval(pollInterval);
            setError('Outlook search timed out. Please try again.');
            setLoading(false);
          }, 60000); // 60 second timeout
          
          // Cleanup function
          return () => {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
          };
          
        } else {
          console.log('[Activity] No jobId found in response');
          setLoading(false);
        }
      }
    } catch (error) {
      logError('Error during Outlook email search', error);
      setLoading(false);
    }
  }, [logError]);
  
  const handleTypeChange = useCallback((index, event) => {
    setSelectedTypes(prev => ({ ...prev, [index]: event.target.value }));
  }, []);

  const handleCharityTypeChange = useCallback((index, event) => {
    setSelectedCharityTypes(prev => ({ ...prev, [index]: event.target.value }));
  }, []);

  const formatDonationData = useCallback((donation) => {
    const amount = parseFloat(donation.amount.replace(/[^0-9.-]+/g, ''));
    let dateObj = new Date(donation.date);
    if (!isValid(dateObj)) {
      dateObj = new Date();
    }
    const formattedDate = format(dateObj, 'yyyy-MM-dd');
    return {
      amount,
      charity: donation.charity,
      date: formattedDate,
      charityType: selectedCharityTypes[donation.id] || 'Social Welfare',
      needsValidation: true
      // Remove subject field as it doesn't exist in backend
    };
  }, [selectedCharityTypes]);

  const handleCommit = useCallback(async (donation, isOutlook = false) => {
    const selectedType = selectedTypes[donation.id];
    const formattedDonation = formatDonationData(donation);

    if (!selectedCharityTypes[donation.id]) {
      setError('Please select a charity type before committing the donation.');
      return;
    }

    if (!formattedDonation.date) {
      setError('Invalid date for the donation. Please check the date format.');
      return;
    }

    try {
      const token = SecureTokenStorage.getToken();
      logger.debug('Token retrieved for handleCommit', { hasToken: !!token });
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const endpoint = selectedType === 'regular'
        ? `${API_CONFIG.BASE_URL}/api/donations`
        : `${API_CONFIG.BASE_URL}/api/contributions/one-off`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(formattedDonation)
      });

      if (!response.ok) {
        throw new Error('Failed to add donation');
      }

      const result = await response.json();

      if (result?._id) {
        console.log(`[Activity] Committed ${selectedType} donation:`, result._id);
        setDonationStatuses(prev => ({
          ...prev,
          [donation.id]: {
            type: `committed-${selectedType === 'regular' ? 'regular' : 'oneoff'}`,
            resultId: result._id,
            timestamp: new Date().toISOString()
          }
        }));

        if (selectedType === 'regular') {
          addDonation(result, true);
        } else {
          addOneOffContribution(result, true);
        }

        wasCleared.current = false;
        console.log('[Activity] Reset wasCleared due to new data');
      }
    } catch (error) {
      logError('Error committing donation', error);
      setDonationStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[donation.id];
        return newStatuses;
      });
    }
  }, [selectedTypes, selectedCharityTypes, formatDonationData, addDonation, addOneOffContribution, logError]);

  const handleDelete = useCallback((donationId) => {
    console.log('[Activity] Deleting donation:', donationId);
    setDonationStatuses(prev => ({
      ...prev,
      [donationId]: {
        type: 'deleted',
        timestamp: new Date().toISOString()
      }
    }));
    wasCleared.current = false;
    console.log('[Activity] Reset wasCleared due to new data');
  }, []);

  const handleRestore = useCallback((donationId) => {
    console.log('[Activity] Restoring donation:', donationId);
    setDonationStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[donationId];
      return newStatuses;
    });
    wasCleared.current = false;
    console.log('[Activity] Reset wasCleared due to new data');
  }, []);

  const navigateToDonation = useCallback((donation, type) => {
    const status = donationStatuses[donation.id];
    if (!status?.resultId) {
      console.error('No result ID found for donation');
      return;
    }

    const path = type === 'regular' ? '/donations' : '/one-off';
    navigate(`${path}?highlight=${status.resultId}`);
  }, [donationStatuses, navigate]);

  const renderDonationCard = useCallback((donation, source) => {
    const status = donationStatuses[donation.id];
    const isCommitted = status?.type?.startsWith('committed');
    const isDeleted = status?.type === 'deleted';

    const cardClassName = `${styles.emailResultItem} card ${
      isCommitted ? styles.committedDonation : ''
    } ${isDeleted ? styles.deletedDonation : ''} ${isClearing ? styles.clearing : ''}`;

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
          <strong>Date:</strong> {safeFormatDate(donation.date, 'dd/MM/yyyy')}<br/>
          <strong>Amount:</strong> {parseFloat(donation.amount.replace(/[^0-9.-]+/g, '')).toFixed(2)}<br/>
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
              className={`${styles.saveButton} button`}
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
                className={`${styles.linkButton} button`}
              >
                View Details
              </button>
            )}
            <button
              onClick={() => handleRestore(donation.id)}
              className={`${styles.restoreButton} button`}
            >
              Restore
            </button>
          </div>
        )}
      </li>
    );
  }, [donationStatuses, selectedTypes, selectedCharityTypes, isClearing, handleTypeChange, handleCharityTypeChange, handleCommit, handleDelete, navigateToDonation, handleRestore]);

  const renderSearchResults = useCallback(() => (
    <div className={`${styles.searchHistory} ${isClearing ? styles.clearing : ''}`}>
      {(searchHistory || []).map((entry, index) => (
        <div key={index} className={`${styles.searchEntry} ${isClearing ? styles.clearing : ''}`}>
          <h5 className="heading">
            {entry.source === 'forwarded' 
              ? `Forwarded Email Donations - Last Updated: ${safeFormatDate(entry.timestamp, 'dd/MM/yyyy HH:mm:ss')}`
              : `Search Results from ${entry.source.toUpperCase()} - ${safeFormatDate(entry.timestamp, 'dd/MM/yyyy HH:mm:ss')}`
            }
          </h5>
          <ul className={styles.emailResultsList}>
            {(entry.results || []).map(result => renderDonationCard(result, entry.source))}
          </ul>
        </div>
      ))}
    </div>
  ), [searchHistory, isClearing, renderDonationCard]);

  return (
    <div className={`${styles.container} container`}>
      <h1 className={`${styles.activityHeader} heading`}>
        Discover your donations and start tracking your impact
      </h1>

      <div className={`${styles.emailSection} card`}>
        {!isRegularUser && userType === 'charity' && (
          <div className={styles.infoMessage} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#2c5282' }}>
              As a charity account, you can view donations made to your organization in the dashboard. 
              Email search is available for individual donors to import their personal donation receipts.
            </p>
          </div>
        )}
        {!isRegularUser && userType === 'business' && (
          <div className={styles.infoMessage} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#2c5282' }}>
              As a business account, you can manage corporate donations through the business dashboard. 
              Email search is available for individual donors to import their personal donation receipts.
            </p>
          </div>
        )}
        <div className={styles.buttonContainer}>
          <div className={styles.emailSearchSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Import Your Donations</h3>
              <p className={styles.sectionSubtitle}>Connect your email to automatically find and import donation receipts</p>
import { API_CONFIG } from '../config/api.config';
            </div>
            
            <div className={styles.buttonGrid}>
              {isRegularUser && (
                <button
                  id="start-search-btn"
                  onClick={async () => {
                    if (!hasGmailAuth) {
                      const hasAuth = await checkGmailAuth();
                      if (!hasAuth) {
                        window.location.href = `${API_CONFIG.BASE_URL}/api/auth/google`;
                        return;
                      }
                    }
                    handleSearchEmails();
                  }}
                  disabled={loading || isClearing || checkingAuth}
                  className={`${styles.emailButton} ${styles.gmail}`}
                >
                  <div className={styles.buttonContent}>
                    <svg className={styles.emailIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                    </svg>
                    <span className={styles.buttonLabel}>
                      {checkingAuth ? 'Checking...' : loading ? 'Searching...' : hasGmailAuth ? 'Search Gmail' : 'Connect Gmail'}
                    </span>
                  </div>
                </button>
              )}
              
              <button
                onClick={handleSearchOutlookEmails}
                disabled={loading || isClearing}
                className={`${styles.emailButton} ${styles.outlook}`}
              >
                <div className={styles.buttonContent}>
                  <svg className={styles.emailIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                  </svg>
                  <span className={styles.buttonLabel}>
                    {loading ? 'Searching...' : 'Search Outlook'}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setShowEmailForwarding(true)}
                className={styles.emailButton}
              >
                <div className={styles.buttonContent}>
                  <svg className={styles.emailIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2L4 5V11.5C4 12.12 4.15 12.7 4.4 13.24L10.5 9.5L14 2ZM20 11L10.5 9.5L4.4 13.24C5.14 14.53 6.41 15.5 8 15.84V18L12 20L16 18V15.84C18.66 15.23 20 13.13 20 11Z" fill="currentColor"/>
                  </svg>
                  <span className={styles.buttonLabel}>Email Forwarding</span>
                </div>
              </button>
              
              <button
                onClick={fetchForwardedEmails}
                disabled={loadingForwarded}
                className={styles.emailButton}
              >
                <div className={styles.buttonContent}>
                  <svg className={styles.emailIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
                  </svg>
                  <span className={styles.buttonLabel}>
                    {loadingForwarded ? 'Checking...' : 'Check Forwarded'}
                  </span>
                </div>
              </button>
            </div>
          </div>
          
          <div className={styles.impactLinkSection}>
            <Link to="/profile" className={styles.viewImpactButton}>
              View Your Impact Dashboard
              <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          {searchHistory.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className={`${styles.clearButton} button`}
              aria-label="Clear all search results"
            >
              {isClearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {loading && (
          <div className={styles.progressContainer}>
            <p>Progress: {progress}%</p>
            <div className={styles.progressBarBackground}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {loading && <p className={styles.loading}>Searching emails... Please wait.</p>}
        {error && <p className={styles.error}>{error}</p>}
        {authStatus === 'Authenticated' && <p className={styles.authStatus}>{authStatus}</p>}

        {searchHistory.length > 0 && renderSearchResults()}
      </div>

      <EmailForwardingModal 
        isOpen={showEmailForwarding} 
        onClose={() => setShowEmailForwarding(false)} 
      />
    </div>
  );
}

export default Activity;
