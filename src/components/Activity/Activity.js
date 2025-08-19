import React, { useState, useContext, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { ImpactContext } from '../../contexts/ImpactContext';
import { useUser } from '../../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Activity.module.css';
import '../SharedStyles.css';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import debounce from 'lodash/debounce';
import { createLogger } from '../../utils/logger';
import { EmailForwardingModal } from '../EmailForwarding';
import { UserDataStorage } from '../../utils/auth.utils';
import { FaGoogle, FaMicrosoft, FaEnvelope, FaSync, FaLock, FaCheck, FaInfoCircle, FaChevronRight, FaCopy, FaUpload } from 'react-icons/fa';

// Create a logger instance for this component
const logger = createLogger('Activity');

// Analytics helper
const trackEvent = (eventName, properties = {}) => {
  try {
    // Replace with your analytics implementation
    logger.debug(`Analytics Event: ${eventName}`, properties);
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  } catch (error) {
    logger.error('Analytics tracking error:', error);
  }
};

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
  const [hasOutlookAuth, setHasOutlookAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [loadingForwarded, setLoadingForwarded] = useState(false);
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);
  const [connectedMethods, setConnectedMethods] = useState([]);
  const [hasForwardedEmails, setHasForwardedEmails] = useState(false);
  
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
      const token = localStorage.getItem('token');
      if (!token) {
        setHasGmailAuth(false);
        return false;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/gmail-auth-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasGmailAuth(data.hasGmailAuth);
        if (data.hasGmailAuth) {
          setConnectedMethods(prev => [...new Set([...prev, 'gmail'])]);
        }
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

  const fetchForwardingEmail = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/email/forward-address`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setForwardingEmail(data.forwardToEmail || data.email || '');
      }
    } catch (error) {
      console.error('Error fetching forwarding email:', error);
    }
  }, []);

  const fetchForwardedEmails = useCallback(async () => {
    setLoadingForwarded(true);
    setLastCheckedTime(new Date());
    trackEvent('refresh_forwarded_clicked');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token for forwarded emails');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/email/forward-status`,
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
        
        if (transformedEmails.length > 0) {
          setHasForwardedEmails(true);
          setConnectedMethods(prev => [...new Set([...prev, 'forwarding'])]);
        }
        
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
    fetchForwardingEmail();
  }, [checkGmailAuth, fetchForwardingEmail]);

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      trackEvent('forwarding_copied');
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };
  
  const handleSearchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    trackEvent('connect_gmail_clicked');
    
    try {
      const token = localStorage.getItem('token');
      logger.debug('Token retrieved for handleSearchEmails', { hasToken: !!token });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/gmail-email-search`,
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
          window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/auth/google`;
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
                `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/email-search-status/${data.jobId}`,
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
                trackEvent('import_completed', { source: 'gmail', count: statusData.result.length });
                
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
                
                if (resultsWithIds.length === 0) {
                  trackEvent('import_zero_results', { source: 'gmail' });
                }
                
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
    trackEvent('connect_outlook_clicked');
    
    try {
      const token = localStorage.getItem('token');
      logger.debug('Token retrieved for handleSearchOutlookEmails', { hasToken: !!token });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/outlook/outlook-email-search`,
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
          window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/auth/microsoft`;
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
          setHasOutlookAuth(true);
          setConnectedMethods(prev => [...new Set([...prev, 'outlook'])]);
          
          // Set up SSE connection to get real-time updates
          const sseUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/outlook/status-stream/${data.jobId}?token=${encodeURIComponent(token)}`;
          console.log('[Activity] Connecting to SSE at:', sseUrl);
          
          const eventSource = new EventSource(sseUrl);
          
          eventSource.onmessage = (event) => {
            try {
              const statusData = JSON.parse(event.data);
              console.log('[Outlook SSE] Event received:', statusData);
              
              // Update progress if available
              if (statusData.progress !== undefined) {
                setProgress(statusData.progress);
              }
              
              // Handle completed job
              if (statusData.state === 'completed' && statusData.result) {
                console.log('[Outlook SSE] Job completed with results:', statusData.result);
                trackEvent('import_completed', { source: 'outlook', count: statusData.result.length });
                
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
                
                if (resultsWithIds.length === 0) {
                  trackEvent('import_zero_results', { source: 'outlook' });
                }
                
                eventSource.close();
                setLoading(false);
                
              } else if (statusData.state === 'failed' || statusData.error) {
                console.error('[Outlook SSE] Job failed:', statusData.error);
                setError(`Outlook search failed: ${statusData.error || 'Unknown error'}`);
                eventSource.close();
                setLoading(false);
              }
            } catch (parseError) {
              console.error('[Outlook SSE] Error parsing event data:', parseError, event.data);
              setError('Error processing server response');
              eventSource.close();
              setLoading(false);
            }
          };
          
          eventSource.onerror = (err) => {
            console.error('[Outlook SSE] Error:', err);
            setError('Error in real-time connection. Please try again.');
            eventSource.close();
            setLoading(false);
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
      const token = localStorage.getItem('token');
      logger.debug('Token retrieved for handleCommit', { hasToken: !!token });
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const endpoint = selectedType === 'regular'
        ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/donations`
        : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/contributions/one-off`;

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

  const handleStartImport = () => {
    trackEvent('import_started');
    if (connectedMethods.length > 0 || hasForwardedEmails) {
      navigate('/profile');
    }
  };

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

  const formatTimeSince = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`${styles.container} container`}>
      <h1 className={`${styles.activityHeader} heading`}>
        Discover your donations and start tracking your impact
      </h1>

      <div className={`${styles.emailSection} card`}>
        {/* Progress Steps */}
        <div className={styles.progressSteps}>
          <div className={styles.sectionTitle}>
            <h2>Import your donations — Step 1 of 3</h2>
            <div className={styles.stepIndicators}>
              <span className={styles.stepActive}>Connect</span>
              <FaChevronRight className={styles.stepArrow} />
              <span className={styles.step}>Review matches</span>
              <FaChevronRight className={styles.stepArrow} />
              <span className={styles.step}>Done</span>
            </div>
          </div>
        </div>

        {/* Non-regular user message */}
        {!isRegularUser && userType === 'charity' && (
          <div className={styles.infoMessage}>
            <FaInfoCircle className={styles.infoIcon} />
            <p>
              As a charity account, you can view donations made to your organization in the dashboard. 
              Email search is available for individual donors to import their personal donation receipts.
            </p>
          </div>
        )}
        {!isRegularUser && userType === 'business' && (
          <div className={styles.infoMessage}>
            <FaInfoCircle className={styles.infoIcon} />
            <p>
              As a business account, you can manage corporate donations through the business dashboard. 
              Email search is available for individual donors to import their personal donation receipts.
            </p>
          </div>
        )}

        {/* Primary Actions - Gmail & Outlook */}
        <div className={styles.primaryActions}>
          <div className={styles.actionGrid}>
            {isRegularUser && (
              <button
                onClick={async () => {
                  if (!hasGmailAuth) {
                    const hasAuth = await checkGmailAuth();
                    if (!hasAuth) {
                      window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/auth/google`;
                      return;
                    }
                  }
                  handleSearchEmails();
                }}
                disabled={loading || isClearing || checkingAuth}
                className={`${styles.actionTile} ${hasGmailAuth ? styles.connected : ''}`}
                aria-label="Connect Gmail"
              >
                <div className={styles.tileContent}>
                  <FaGoogle className={styles.tileIcon} />
                  <h3 className={styles.tileTitle}>
                    {checkingAuth ? 'Checking...' : loading ? 'Searching...' : hasGmailAuth ? 'Search Gmail' : 'Connect Gmail'}
                  </h3>
                  <div className={styles.tileSubtext}>
                    <span><FaLock /> Secure sign-in</span>
                    <span className={styles.dot}>·</span>
                    <span>Read-only access</span>
                  </div>
                  <p className={styles.tileDescription}>
                    We only scan for donation receipts
                  </p>
                  {hasGmailAuth && <FaCheck className={styles.connectedIcon} />}
                </div>
              </button>
            )}
            
            <button
              onClick={handleSearchOutlookEmails}
              disabled={loading || isClearing}
              className={`${styles.actionTile} ${hasOutlookAuth ? styles.connected : ''}`}
              aria-label="Connect Outlook"
            >
              <div className={styles.tileContent}>
                <FaMicrosoft className={styles.tileIcon} />
                <h3 className={styles.tileTitle}>
                  {loading ? 'Searching...' : hasOutlookAuth ? 'Search Outlook' : 'Connect Outlook'}
                </h3>
                <div className={styles.tileSubtext}>
                  <span><FaLock /> Secure sign-in</span>
                  <span className={styles.dot}>·</span>
                  <span>Read-only access</span>
                </div>
                <p className={styles.tileDescription}>
                  We only scan for donation receipts
                </p>
                {hasOutlookAuth && <FaCheck className={styles.connectedIcon} />}
              </div>
            </button>
          </div>
        </div>

        {/* Secondary Actions - Email Forwarding & Check Forwarded */}
        <div className={styles.secondaryActions}>
          <div className={styles.actionGrid}>
            <div className={styles.actionTile}>
              <div className={styles.tileContent}>
                <FaEnvelope className={styles.tileIcon} />
                <h3 className={styles.tileTitle}>Email Forwarding</h3>
                <p className={styles.tileDescription}>
                  Forward donation receipts to your unique address below. We'll import them automatically.
                </p>
                {forwardingEmail && (
                  <div className={styles.forwardingAddress}>
                    <code className={styles.emailCode}>{forwardingEmail}</code>
                    <button
                      onClick={() => copyToClipboard(forwardingEmail)}
                      className={styles.copyButton}
                      aria-label="Copy forwarding address"
                    >
                      {copyFeedback ? 'Copied!' : <><FaCopy /> Copy</>}
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowEmailForwarding(true)}
                  className={styles.setupButton}
                >
                  Set up forwarding
                </button>
              </div>
            </div>
            
            <button
              onClick={fetchForwardedEmails}
              disabled={loadingForwarded}
              className={`${styles.actionTile} ${hasForwardedEmails ? styles.connected : ''}`}
              aria-label="Refresh Forwarded Inbox"
            >
              <div className={styles.tileContent}>
                <FaSync className={`${styles.tileIcon} ${loadingForwarded ? styles.spinning : ''}`} />
                <h3 className={styles.tileTitle}>Refresh Forwarded Inbox</h3>
                <p className={styles.tileDescription}>
                  Check for new forwards now.
                  {lastCheckedTime && (
                    <span className={styles.lastChecked}>
                      Last checked {formatTimeSince(lastCheckedTime)}
                    </span>
                  )}
                </p>
                {hasForwardedEmails && <FaCheck className={styles.connectedIcon} />}
              </div>
            </button>
          </div>
        </div>

        {/* Trust Strip */}
        <div className={styles.trustStrip}>
          <span><FaLock /> Bank-level encryption</span>
          <span className={styles.dot}>·</span>
          <span>Read-only permissions</span>
          <span className={styles.dot}>·</span>
          <span>Disconnect anytime</span>
          <button className={styles.learnMoreLink}>What we access</button>
        </div>

        {/* Help Section */}
        <div className={styles.helpSection}>
          <p className={styles.helpText}>
            <strong>Using a work email?</strong> Admin approval may be required.
          </p>
          <p className={styles.helpText}>
            <strong>Can't connect?</strong> <a href="#" onClick={(e) => { e.preventDefault(); setShowEmailForwarding(true); }}>Forward receipts instead</a> or <button className={styles.uploadLink}><FaUpload /> Upload PDFs/EMLs</button>
          </p>
        </div>

        {/* Primary CTA */}
        <div className={styles.primaryCTA}>
          <button
            onClick={handleStartImport}
            disabled={connectedMethods.length === 0 && !hasForwardedEmails}
            className={styles.startImportButton}
          >
            {searchHistory.length > 0 ? 'View Your Impact Dashboard' : 'Start Import'}
          </button>
        </div>

        {/* Progress Indicator */}
        {loading && (
          <div className={styles.progressContainer}>
            <p>Scanning your emails... {progress}%</p>
            <div className={styles.progressBarBackground}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.errorMessage}>
            <p>{error.includes('No receipts detected') ? error : `Something went wrong: ${error}`}</p>
            <button onClick={() => setError(null)} className={styles.retryButton}>
              Try again
            </button>
          </div>
        )}

        {/* Search Results */}
        {searchHistory.length > 0 && (
          <>
            <div className={styles.resultsHeader}>
              <h3>Found Donations</h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className={styles.clearButton}
                  aria-label="Clear all search results"
                >
                  {isClearing ? 'Clearing...' : 'Clear All'}
                </button>
              )}
            </div>
            {renderSearchResults()}
            {searchHistory.some(entry => entry.results?.length === 0) && (
              <div className={styles.emptyState}>
                <p>No receipts detected yet—try widening your date range or forward a recent receipt to test.</p>
              </div>
            )}
          </>
        )}
      </div>

      <EmailForwardingModal 
        isOpen={showEmailForwarding} 
        onClose={() => setShowEmailForwarding(false)} 
      />
    </div>
  );
}

export default Activity;