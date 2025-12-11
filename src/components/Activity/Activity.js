import React, { useState, useContext, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { ImpactContext } from '../../contexts/ImpactContext';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import styles from './Activity.module.css';
import '../SharedStyles.css';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import debounce from 'lodash/debounce';
import { createLogger } from '../../utils/logger';
import { EmailForwardingModal } from '../EmailForwarding';
import { UserDataStorage, SecureTokenStorage } from '../../utils/auth.utils';
import { FaGoogle, FaMicrosoft, FaEnvelope, FaSync, FaLock, FaCheck, FaInfoCircle, FaChevronRight, FaCopy, FaUpload, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { API_CONFIG } from '../../config/api.config';
import apiServices, { csrfServiceAPI } from '../../services/api.service';

// Create a logger instance for this component
const logger = createLogger('Activity');

const progressFromPhases = (phases = {}) => {
  const phaseOrder = ['discovery', 'extraction', 'parsing'];
  const perPhase = 100 / phaseOrder.length;
  let progress = 0;

  phaseOrder.forEach(phase => {
    const phaseStatus = phases[phase];
    if (phaseStatus === 'completed') {
      progress += perPhase;
    } else if (phaseStatus === 'running') {
      progress += perPhase * 0.5;
    }
  });

  return Math.round(Math.min(progress, 100));
};

const deriveJobProgress = (status) => {
  if (!status) return 0;
  if (typeof status.progress === 'number') return status.progress;
  if (status.status === 'completed') return 100;
  if (status.status === 'failed') return 0;
  return progressFromPhases(status.phases);
};

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
  const [currentPhase, setCurrentPhase] = useState('');
  const [scanStartTime, setScanStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEmailForwarding, setShowEmailForwarding] = useState(false);
  const [hasGmailAuth, setHasGmailAuth] = useState(false);
  const [hasOutlookAuth, setHasOutlookAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [loadingForwarded, setLoadingForwarded] = useState(false);
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);
  const [connectedMethods, setConnectedMethods] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [editedDonations, setEditedDonations] = useState({});
  const [jobStatusMap, setJobStatusMap] = useState({});
  const [committingJobId, setCommittingJobId] = useState(null);
  const [missingReports, setMissingReports] = useState([]);
  const [showMissingForm, setShowMissingForm] = useState(false);
  const [missingForm, setMissingForm] = useState({
    jobId: '',
    charity: '',
    amount: '',
    currency: 'AUD',
    date: '',
    description: '',
    hasReceipt: false,
    forwarded: false
  });
  const [submittingMissing, setSubmittingMissing] = useState(false);
  const [missingFeedback, setMissingFeedback] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const gmailJobs = useMemo(
    () => searchHistory.filter(entry => entry.source === 'gmail'),
    [searchHistory]
  );
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
  const pollingHandles = useRef({});

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
      const token = SecureTokenStorage.getToken();
      if (!token) return;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/email/forward-address`,
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
        // New: Use candidates array from queue jobs (matches Gmail scraper format)
        const candidates = data.candidates || [];

        if (candidates.length > 0) {
          setHasForwardedEmails(true);
          setConnectedMethods(prev => [...new Set([...prev, 'forwarding'])]);

          // Add to search history - candidates already have correct format
          setSearchHistory(prev => {
            // Check if we already have a forwarded emails entry
            const existingIndex = prev.findIndex(entry => entry.source === 'forwarded');
            const newEntry = {
              timestamp: new Date(),
              source: 'gmail', // Changed to 'gmail' so it uses full template with checkboxes
              results: candidates,
              rejected: [],
              jobId: 'forwarded-' + Date.now() // Generate pseudo jobId
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

  const fetchUploadedReceipts = useCallback(async () => {
    try {
      const token = SecureTokenStorage.getToken();
      if (!token) {
        console.warn('No token for uploaded receipts');
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/receipts/uploaded`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidates = data.candidates || [];

        if (candidates.length > 0) {
          setConnectedMethods(prev => [...new Set([...prev, 'uploaded'])]);

          // Add to search history with 'uploaded' source but will render with full template
          setSearchHistory(prev => {
            const existingIndex = prev.findIndex(entry => entry.jobId?.startsWith('uploaded-'));
            const newEntry = {
              timestamp: new Date(),
              source: 'uploaded', // Keep as 'uploaded' to identify it
              results: candidates,
              rejected: [],
              jobId: 'uploaded-' + Date.now(),
              displayTitle: 'Uploaded Receipts' // Custom title
            };

            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = newEntry;
              return updated;
            } else {
              return [newEntry, ...prev];
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching uploaded receipts:', error);
    }
  }, []);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.eml', '.txt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      setUploadError(`Invalid file type. Please upload ${allowedTypes.join(', ')} files only.`);
      return;
    }

    // Validate file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size must be less than 25MB');
      return;
    }

    setUploadingReceipt(true);
    setUploadError(null);
    trackEvent('receipt_upload_started');

    try {
      const token = SecureTokenStorage.getToken();
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/receipts/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        logger.info('Receipt uploaded successfully:', data);
        trackEvent('receipt_upload_success');

        // Refresh uploaded receipts after a short delay to allow processing
        setTimeout(() => {
          fetchUploadedReceipts();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      logError('Error uploading receipt', error);
      setUploadError(error.message || 'Failed to upload receipt');
      trackEvent('receipt_upload_failed');
    } finally {
      setUploadingReceipt(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [fetchUploadedReceipts, logError]);

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const fetchMissingReports = useCallback(async () => {
    try {
      const api = apiServices.client;
      const { data } = await api.get('/api/gmail/missing-donation');
      setMissingReports(data.reports || []);
    } catch (error) {
      logError('Error fetching missing donation reports', error);
    }
  }, [logError]);

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

  useEffect(() => {
    fetchUploadedReceipts();
  }, [fetchUploadedReceipts]);

  useEffect(() => {
    fetchMissingReports();
  }, [fetchMissingReports]);

  useEffect(() => {
    const latestGmailEntry = searchHistory.find(entry => entry.source === 'gmail');
    if (latestGmailEntry && !missingForm.jobId) {
      setMissingForm(prev => ({ ...prev, jobId: latestGmailEntry.jobId }));
    }
  }, [searchHistory, missingForm.jobId]);

  useEffect(() => () => {
    Object.values(pollingHandles.current).forEach(handle => {
      if (handle) {
        clearTimeout(handle);
      }
    });
  }, []);

  // Elapsed time counter during scanning
  useEffect(() => {
    let intervalId;
    if (loading && scanStartTime) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - scanStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [loading, scanStartTime]);

  const handleClearAll = useCallback(async () => {
    console.log('[Activity] Starting clear operation');
    setIsClearing(true);
    wasCleared.current = true;

    console.log('[Activity] Removing data from localStorage');
    clearState();

    // Delete uploaded receipts from database
    try {
      const token = SecureTokenStorage.getToken();
      if (token) {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/api/receipts/uploaded`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('[Activity] Deleted uploaded receipts:', data.deletedCount);
        }
      }
    } catch (error) {
      console.error('[Activity] Error deleting uploaded receipts:', error);
    }

    console.log('[Activity] Resetting all states');
    setSearchHistory([]);
    setDonationStatuses({});
    setSelectedTypes({});
    setSelectedCharityTypes({});
    setSelectedCandidates({});
    setEditedDonations({});
    setJobStatusMap({});

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

  const refreshResults = useCallback(async (jobId, statusPayload, sourceOverride = null) => {
    try {
      const api = apiServices.client;
      const { data } = await api.get(`/api/email-search-results/${jobId}`);
      const timestamp = new Date();

      const existingEntry = searchHistory.find(entry => entry.jobId === jobId);
      const source = sourceOverride || statusPayload?.source || existingEntry?.source || 'gmail';

      const transformCandidate = (candidate, isRejected = false) => ({
        ...candidate,
        id: candidate.candidateId || candidate.dedupeHash || candidate.emailMessageId || `${jobId}:${isRejected ? 'rejected' : 'candidate'}:${Math.random().toString(36).slice(2)}`,
        jobId,
        searchTimestamp: timestamp,
        source
      });

      const transformedCandidates = (data.candidates || []).map(candidate => transformCandidate(candidate, false));
      const transformedRejected = (data.rejected || []).map(rejected => transformCandidate(rejected, true));

      setSearchHistory(prev => {
        const existingIndex = prev.findIndex(entry => entry.jobId === jobId);
        const matchedEntry = existingIndex >= 0 ? prev[existingIndex] : null;
        const updatedEntry = {
          jobId,
          source,
          timestamp: matchedEntry?.timestamp || timestamp,
          results: transformedCandidates,
          rejected: transformedRejected,
          stats: data.stats || matchedEntry?.stats || {},
          summary: statusPayload?.summary || matchedEntry?.summary || {},
          counts: statusPayload?.counts || matchedEntry?.counts || {},
          status: statusPayload?.status || matchedEntry?.status || 'processing'
        };

        if (existingIndex >= 0) {
          const mergedHistory = [...prev];
          mergedHistory[existingIndex] = updatedEntry;
          return mergedHistory;
        }

        return [updatedEntry, ...prev];
      });

      if (statusPayload) {
        setJobStatusMap(prev => ({ ...prev, [jobId]: statusPayload }));
      }

      setSelectedTypes(prev => {
        const next = { ...prev };
        transformedCandidates.forEach(candidate => {
          if (!next[candidate.id]) {
            next[candidate.id] = 'regular';
          }
        });
        return next;
      });

      setSelectedCharityTypes(prev => {
        const next = { ...prev };
        transformedCandidates.forEach(candidate => {
          if (candidate.charitySector && !next[candidate.id]) {
            next[candidate.id] = candidate.charitySector;
          }
        });
        return next;
      });
    } catch (error) {
      logError('Error refreshing Gmail results', error);
    }
  }, [setSearchHistory, searchHistory, logError]);

  const resetMissingForm = useCallback((jobIdValue = '') => {
    setMissingForm({
      jobId: jobIdValue,
      charity: '',
      amount: '',
      currency: 'AUD',
      date: '',
      description: '',
      hasReceipt: false,
      forwarded: false
    });
    setMissingFeedback('');
  }, []);

  const handleMissingFormChange = useCallback((field, value) => {
    setMissingForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const api = apiServices.client;
      const { data: statusData } = await api.get(`/api/email-search-status/${jobId}`);

      setJobStatusMap(prev => ({ ...prev, [jobId]: statusData }));

      const progressValue = deriveJobProgress(statusData);
      if (!Number.isNaN(progressValue)) {
        setProgress(progressValue);
      }

      // Update current phase for display
      if (statusData.currentPhase) {
        setCurrentPhase(statusData.currentPhase);
      } else if (statusData.phases) {
        // Derive current phase from phases object
        const phaseOrder = ['discovery', 'extraction', 'parsing'];
        for (const phase of phaseOrder) {
          if (statusData.phases[phase] === 'running') {
            setCurrentPhase(phase);
            break;
          }
        }
      }

      if (statusData.status === 'completed') {
        if (statusData.summary?.candidateCount > 0) {
          trackEvent('import_completed', { source: 'gmail', count: statusData.summary.candidateCount });
        } else {
          trackEvent('import_zero_results', { source: 'gmail' });
        }
        await refreshResults(jobId, statusData);
        setLoading(false);
        if (pollingHandles.current[jobId]) {
          clearTimeout(pollingHandles.current[jobId]);
          delete pollingHandles.current[jobId];
        }
      } else if (statusData.status === 'failed') {
        setError(statusData.errors?.[0]?.message || 'Gmail search failed. Please try again.');
        setLoading(false);
        if (pollingHandles.current[jobId]) {
          clearTimeout(pollingHandles.current[jobId]);
          delete pollingHandles.current[jobId];
        }
      } else {
        if (pollingHandles.current[jobId]) {
          clearTimeout(pollingHandles.current[jobId]);
        }
        pollingHandles.current[jobId] = setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (error) {
      logError('Error checking Gmail job status', error);
      setError('Unable to check Gmail import status. Please try again.');
      setLoading(false);
      if (pollingHandles.current[jobId]) {
        clearTimeout(pollingHandles.current[jobId]);
        delete pollingHandles.current[jobId];
      }
    }
  }, [refreshResults, logError]);

  const handleSearchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setScanStartTime(Date.now());
    setCurrentPhase('discovery');
    setElapsedTime(0);
    trackEvent('connect_gmail_clicked');

    try {
      const token = SecureTokenStorage.getToken();
      logger.debug('Token retrieved for handleSearchEmails', { hasToken: !!token });

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const api = apiServices.client;
      let response;

      try {
        response = await api.post('/api/gmail/start-search', {});
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.post('/api/gmail-email-search', {});
        } else {
          throw err;
        }
      }

      const job = response.data || {};
      const jobId = job.jobId;

      if (!jobId) {
        throw new Error('Gmail search did not return a job ID');
      }

      const timestamp = new Date();

      setSearchHistory(prev => [{
        jobId,
        source: 'gmail',
        timestamp,
        results: [],
        rejected: [],
        status: job.status || 'queued',
        summary: job.summary || {},
        counts: job.summary ? {
          candidates: job.summary.candidateCount || 0,
          rejected: job.summary.rejectedCount || 0,
          committed: job.summary.committedCount || 0
        } : {}
      }, ...prev]);
      wasCleared.current = false;

      setJobStatusMap(prev => ({ ...prev, [jobId]: job }));
      const initialProgress = deriveJobProgress(job);
      if (!Number.isNaN(initialProgress)) {
        setProgress(initialProgress);
      }

      resetMissingForm(jobId);
      pollJobStatus(jobId);
    } catch (error) {
      logError('Error during Gmail email search', error);
      setError(error.response?.data?.error || error.message || 'Failed to start Gmail email search');
      setLoading(false);
    }
  }, [logError, pollJobStatus, setSearchHistory, resetMissingForm]);
  
  const handleSearchOutlookEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setScanStartTime(Date.now());
    setCurrentPhase('discovery');
    setElapsedTime(0);
    trackEvent('connect_outlook_clicked');
    
    try {
      const token = SecureTokenStorage.getToken();
      logger.debug('Token retrieved for handleSearchOutlookEmails', { hasToken: !!token });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      try {
        const api = apiServices.client;
        const { data } = await api.post('/api/outlook/outlook-email-search', {});
        console.log('[Activity] Outlook search response:', data);
        
        if (data.jobId) {
          console.log('[Activity] Outlook job started with jobId:', data.jobId);
          const timestamp = new Date();
          
          // Add the job to search history
          setSearchHistory(prev => [{ timestamp, source: 'outlook', jobId: data.jobId }, ...prev]);
          wasCleared.current = false;
          setHasOutlookAuth(true);
          setConnectedMethods(prev => [...new Set([...prev, 'outlook'])]);
          
          // Use Gmail job manager for Outlook (unified tracking)
          logger.debug('[Activity] Starting polling for Outlook job:', data.jobId);

          const pollInterval = setInterval(async () => {
            try {
              // Use same endpoint as Gmail
              const statusUrl = `/api/email-search-status/${data.jobId}`;
              logger.debug('[Outlook Polling] Requesting status:', {
                path: statusUrl,
                jobId: data.jobId
              });

              const statusResponse = await api.get(statusUrl);
              const statusData = statusResponse?.data || statusResponse;

              logger.debug('[Outlook Polling] Status received:', {
                status: statusData.status,
                progress: statusData.progress
              });

              // Update progress if available
              if (statusData.progress !== undefined) {
                setProgress(statusData.progress);
              }

              // Handle completed job
              if (statusData.status === 'completed') {
                logger.info('[Outlook Polling] Job completed, refreshing results');

                await refreshResults(data.jobId, { ...statusData, source: 'outlook' }, 'outlook');

                const updatedEntry = searchHistory.find(entry => entry.jobId === data.jobId);
                const candidateCount = updatedEntry?.results?.length || 0;

                trackEvent('import_completed', { source: 'outlook', count: candidateCount });

                if (candidateCount === 0) {
                  trackEvent('import_zero_results', { source: 'outlook' });
                }

                clearInterval(pollInterval);
                setProgress(100);
                setLoading(false);

              } else if (statusData.status === 'failed') {
                logger.error('[Outlook Polling] Job failed:', statusData.error);
                setError(`Outlook search failed: ${statusData.error || 'Unknown error'}`);
                clearInterval(pollInterval);
                setLoading(false);
              }
            } catch (error) {
              logger.error('[Outlook Polling] Error:', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
              });
              setError(`Error checking Outlook status: ${error.response?.status || error.message}`);
              clearInterval(pollInterval);
              setLoading(false);
            }
          }, 2000); // Poll every 2 seconds

          // No timeout - allow search to run as long as needed
          // Searching entire inbox history can take 5-15 minutes for large mailboxes

          // Cleanup function
          return () => {
            clearInterval(pollInterval);
          };
          
        } else {
          console.log('[Activity] No jobId found in response');
          setLoading(false);
        }
      } catch (err) {
        const status = err.response?.status;
        const errorData = err.response?.data;
        if (errorData?.error === 'Microsoft authentication required' && errorData?.action === 'microsoft_auth') {
          window.location.href = `${API_CONFIG.BASE_URL}/api/auth/microsoft`;
        } else {
          throw new Error(errorData?.error || `An error occurred while searching Outlook emails. Status: ${status || 'unknown'}`);
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
    const overrides = editedDonations[donation.id] || {};

    const rawAmount = overrides.amount !== undefined
      ? overrides.amount
      : donation.amount;
    const amount = typeof rawAmount === 'number'
      ? rawAmount
      : parseFloat(String(rawAmount ?? '').replace(/[^0-9.-]+/g, ''));

    let dateObj = parseISO(overrides.date || donation.date);
    if (!isValid(dateObj)) {
      dateObj = new Date();
    }
    const formattedDate = format(dateObj, 'yyyy-MM-dd');

    return {
      amount,
      charity: (overrides.charity || donation.charity || '').trim(),
      date: formattedDate,
      currency: (overrides.currency || donation.currency || 'AUD').toUpperCase(),
      charityType: overrides.charityType || selectedCharityTypes[donation.id] || '',
      donationType: overrides.donationType || selectedTypes[donation.id] || 'regular',
      metadata: overrides.metadata || {}
    };
  }, [editedDonations, selectedCharityTypes, selectedTypes]);

  const isPositiveNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0;
  };

  const toggleCandidateSelection = useCallback((jobId, candidateId) => {
    setSelectedCandidates(prev => {
      const jobSelections = { ...(prev[jobId] || {}) };
      if (jobSelections[candidateId]) {
        delete jobSelections[candidateId];
      } else {
        jobSelections[candidateId] = true;
      }
      return {
        ...prev,
        [jobId]: jobSelections
      };
    });
  }, []);

  const isCandidateSelected = useCallback((jobId, candidateId) => !!selectedCandidates[jobId]?.[candidateId], [selectedCandidates]);

  const handleEditChange = useCallback((candidateId, field, value) => {
    setEditedDonations(prev => ({
      ...prev,
      [candidateId]: {
        ...(prev[candidateId] || {}),
        [field]: value
      }
    }));
  }, []);

  const clearSelectionsForJob = useCallback((jobId) => {
    setSelectedCandidates(prev => {
      if (!prev[jobId]) return prev;
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  }, []);

  const handleCommitSelected = useCallback(async (jobId) => {
    const selections = Object.keys(selectedCandidates[jobId] || {});
    if (!selections.length) {
      setError('Select at least one donation to commit.');
      return;
    }

    const entry = searchHistory.find(item => item.jobId === jobId && (item.source === 'gmail' || item.source === 'uploaded' || item.source === 'outlook'));
    if (!entry) {
      setError('Unable to locate results for this search.');
      return;
    }

    const payload = [];
    const validationIssues = [];

    selections.forEach(candidateId => {
      const donation = entry.results.find(item => item.id === candidateId);
      if (!donation) {
        validationIssues.push({ candidateId, message: 'Candidate not found in current results' });
        return;
      }

      const formatted = formatDonationData(donation);

      if (!formatted.charity) {
        validationIssues.push({ candidateId, message: 'Charity name is required' });
        return;
      }

      if (!formatted.charityType) {
        validationIssues.push({ candidateId, message: 'Select a charity type before committing' });
        return;
      }

      if (!isPositiveNumber(formatted.amount)) {
        validationIssues.push({ candidateId, message: 'Amount must be a positive number' });
        return;
      }

      payload.push({
        candidateId,
        charity: formatted.charity,
        amount: Number(formatted.amount),
        currency: formatted.currency,
        date: formatted.date,
        charityType: formatted.charityType,
        donationType: formatted.donationType,
        metadata: {
          ...(donation.metadata || {}),
          ...formatted.metadata,
          donationType: formatted.donationType
        }
      });
    });

    if (!payload.length) {
      setError(validationIssues[0]?.message || 'No valid donations selected to commit.');
      return;
    }

    setCommittingJobId(jobId);

    try {
      try {
        await csrfServiceAPI.initializeToken();
      } catch (csrfError) {
        logger.debug('CSRF token initialization failed, continuing without it', csrfError);
      }

      const api = apiServices.client;
      const { data } = await api.post('/api/donations/commit', { jobId, items: payload });

      trackEvent('import_commit', { source: entry.source, count: payload.length });

      const now = new Date().toISOString();

      setDonationStatuses(prev => {
        const next = { ...prev };
        data.committed?.forEach(item => {
          next[item.candidateId] = {
            type: 'committed-regular',
            resultId: item.donationId,
            timestamp: now
          };
        });
        data.skippedDuplicates?.forEach(item => {
          next[item.candidateId] = {
            type: 'duplicate',
            resultId: item.donationId,
            timestamp: now
          };
        });
        return next;
      });

      if (data.validationErrors?.length) {
        setError('Some donations could not be committed. Please review and try again.');
      } else if (validationIssues.length) {
        setError(validationIssues[0].message);
      } else {
        setError(null);
      }

      clearSelectionsForJob(jobId);
      setEditedDonations(prev => {
        const next = { ...prev };
        selections.forEach(id => { delete next[id]; });
        return next;
      });

      const statusResponse = await api.get(`/api/email-search-status/${jobId}`);
      await refreshResults(jobId, statusResponse.data);
    } catch (error) {
      logError('Error committing Gmail donations', error);
      setError(error.response?.data?.error || error.message || 'Failed to commit selected donations');
    } finally {
      setCommittingJobId(null);
    }
  }, [selectedCandidates, searchHistory, formatDonationData, isPositiveNumber, clearSelectionsForJob, refreshResults, logError]);

  // New individual commit function for per-card actions
  const handleCommitSingle = useCallback(async (donation) => {
    const formatted = formatDonationData(donation);

    // Validation
    if (!formatted.charity) {
      setError('Charity name is required');
      return;
    }

    if (!formatted.charityType) {
      setError('Please select a charity category before committing');
      return;
    }

    if (!formatted.donationType) {
      setError('Please select a contribution type before committing');
      return;
    }

    if (!isPositiveNumber(formatted.amount)) {
      setError('Amount must be a positive number');
      return;
    }

    setCommittingJobId(donation.id);

    try {
      try {
        await csrfServiceAPI.initializeToken();
      } catch (csrfError) {
        logger.debug('CSRF token initialization failed, continuing without it', csrfError);
      }

      const api = apiServices.client;
      const entry = searchHistory.find(item => item.jobId === donation.jobId);
      const isUploaded = entry?.source === 'uploaded' || donation.jobId?.startsWith('uploaded-');

      let data;

      if (isUploaded) {
        // For uploaded receipts, use direct donation creation endpoint
        const donationPayload = {
          charity: formatted.charity,
          amount: Number(formatted.amount),
          currency: formatted.currency,
          date: formatted.date,
          charityType: formatted.charityType,
          donationType: formatted.donationType,
          source: 'uploaded',
          metadata: {
            ...(donation.metadata || {}),
            ...formatted.metadata,
            donationType: formatted.donationType,
            uploadedReceiptId: donation.metadata?.uploadedReceiptId
          }
        };

        const response = await api.post('/api/donations', donationPayload);
        data = {
          committed: [{
            candidateId: donation.id,
            donationId: response.data._id
          }],
          skippedDuplicates: []
        };
      } else {
        // For Gmail/Outlook receipts, use commit endpoint with job manager
        const payload = {
          jobId: donation.jobId,
          items: [{
            candidateId: donation.id,
            charity: formatted.charity,
            amount: Number(formatted.amount),
            currency: formatted.currency,
            date: formatted.date,
            charityType: formatted.charityType,
            donationType: formatted.donationType,
            metadata: {
              ...(donation.metadata || {}),
              ...formatted.metadata,
              donationType: formatted.donationType
            }
          }]
        };
        const response = await api.post('/api/donations/commit', payload);
        data = response.data;
      }

      trackEvent('import_commit', { source: entry?.source || 'unknown', count: 1 });

      const now = new Date().toISOString();

      setDonationStatuses(prev => {
        const next = { ...prev };
        if (data.committed && data.committed.length > 0) {
          next[donation.id] = {
            type: 'committed-regular',
            resultId: data.committed[0].donationId,
            timestamp: now
          };
        }
        if (data.skippedDuplicates && data.skippedDuplicates.length > 0) {
          next[donation.id] = {
            type: 'duplicate',
            resultId: data.skippedDuplicates[0].donationId,
            timestamp: now
          };
        }
        return next;
      });

      // Clear edited data for this donation
      setEditedDonations(prev => {
        const next = { ...prev };
        delete next[donation.id];
        return next;
      });

      // Refresh results only for non-uploaded (since uploaded doesn't use job manager)
      if (!isUploaded) {
        try {
          const statusResponse = await api.get(`/api/email-search-status/${donation.jobId}`);
          await refreshResults(donation.jobId, statusResponse.data);
        } catch (refreshError) {
          logger.warn('Could not refresh results after commit', refreshError);
        }
      }

    } catch (error) {
      logError('Error committing donation', error);
      setError(error.response?.data?.error || error.message || 'Failed to commit donation');
    } finally {
      setCommittingJobId(null);
    }
  }, [formatDonationData, isPositiveNumber, searchHistory, refreshResults, logError]);

  const handleSubmitMissingDonation = useCallback(async () => {
    if (submittingMissing) {
      return;
    }

    const { jobId, charity, amount, currency, date, description, hasReceipt, forwarded } = missingForm;

    if (!charity || !charity.trim()) {
      setError('Please provide the charity name for the missing donation.');
      return;
    }

    if (!isPositiveNumber(amount)) {
      setError('Please provide a positive amount for the missing donation.');
      return;
    }

    setSubmittingMissing(true);
    setMissingFeedback('');

    try {
      try {
        await csrfServiceAPI.initializeToken();
      } catch (csrfError) {
        logger.debug('CSRF token initialization failed, continuing without it', csrfError);
      }

      const api = apiServices.client;
      const payload = {
        jobId: jobId || undefined,
        charity: charity.trim(),
        amount: Number(amount),
        currency,
        date: date || undefined,
        description,
        hasReceipt,
        forwarded,
        provider: 'gmail'
      };

      const { data } = await api.post('/api/gmail/missing-donation', payload);
      trackEvent('missing_report_submitted', { source: 'gmail', hasReceipt, forwarded });

      setMissingReports(prev => [data.report, ...prev]);
      setMissingFeedback('Thanks! We have recorded your missing donation so we can improve future scrapes.');
      if (!jobId && data.report?.jobId) {
        resetMissingForm(data.report.jobId);
      } else {
        resetMissingForm(jobId);
      }
      setShowMissingForm(false);
    } catch (error) {
      logError('Error submitting missing donation report', error);
      setError(error.response?.data?.error || error.message || 'Failed to submit missing donation report');
    } finally {
      setSubmittingMissing(false);
    }
  }, [submittingMissing, missingForm, isPositiveNumber, resetMissingForm, logError]);

  const handleLegacyCommit = useCallback(async (donation) => {
    const selectedType = selectedTypes[donation.id];
    if (!selectedType) {
      setError('Please select a contribution type before committing the donation.');
      return;
    }
    const formatted = formatDonationData(donation);

    if (!formatted.charityType) {
      setError('Please select a charity type before committing the donation.');
      return;
    }

    try {
      const token = SecureTokenStorage.getToken();
      logger.debug('Token retrieved for legacy commit', { hasToken: !!token });
      if (!token) {
        throw new Error('No authentication token found');
      }

      let csrf = null;
      try { csrf = await csrfServiceAPI.initializeToken(); } catch (csrfError) {
        logger.debug('CSRF token initialization failed, continuing without it', csrfError);
      }

      const api = apiServices.client;
      const endpoint = selectedType === 'regular'
        ? '/api/donations'
        : '/api/contributions/one-off';

      const payload = {
        amount: formatted.amount,
        charity: formatted.charity,
        date: formatted.date,
        charityType: formatted.charityType,
        needsValidation: true
      };

      const { data: result } = await api.post(endpoint, payload, {
        headers: csrf ? { 'X-CSRF-Token': csrf } : undefined
      });

      if (result?._id) {
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
        setError(null);
      }
    } catch (error) {
      logError('Error committing donation', error);
      setDonationStatuses(prev => {
        const next = { ...prev };
        delete next[donation.id];
        return next;
      });
    }
  }, [selectedTypes, formatDonationData, addDonation, addOneOffContribution, logError]);

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
    const isDuplicate = status?.type === 'duplicate';
    const isDeleted = status?.type === 'deleted';
    const isFinalized = isCommitted || isDuplicate;
    const isGmailSource = source === 'gmail' || source === 'uploaded' || source === 'outlook'; // Include uploaded receipts

    const cardClassName = `${styles.emailResultItem} card ${
      isCommitted ? styles.committedDonation : ''
    } ${isDeleted ? styles.deletedDonation : ''} ${isClearing ? styles.clearing : ''}`;

    const editState = editedDonations[donation.id] || {};
    const selectionChecked = isGmailSource && isCandidateSelected(donation.jobId, donation.id);

    const verified = donation.verified === true;
    const charitySector = selectedCharityTypes[donation.id] || donation.charitySector || '';

    let dateValue = editState.date || '';
    if (!dateValue && donation.date) {
      const parsed = parseISO(donation.date);
      if (isValid(parsed)) {
        dateValue = format(parsed, 'yyyy-MM-dd');
      } else {
        const fallback = new Date(donation.date);
        if (isValid(fallback)) {
          dateValue = format(fallback, 'yyyy-MM-dd');
        }
      }
    }
    const amountValue = editState.amount !== undefined ? editState.amount : donation.amount;
    const currencyValue = editState.currency || donation.currency || 'AUD';
    const charityValue = editState.charity !== undefined ? editState.charity : donation.charity || '';

    const confidence = typeof donation.confidence === 'number'
      ? Math.round(donation.confidence * 100)
      : null;

    const failingGates = Object.entries(donation.gates || {})
      .filter(([, flagged]) => flagged)
      .map(([gate]) => gate);

    return (
      <li key={donation.id} className={cardClassName}>
        {isGmailSource ? (
          <>
            <div className={styles.selectionRow}>
              <span className={styles.jobBadge}>Job: {donation.jobId?.split(':').pop()}</span>
              {status?.type && (
                <span className={styles.statusBadge}>
                  {status.type.replace('-', ' ').toUpperCase()}
                </span>
              )}
              {verified ? (
                <span className={styles.verifiedBadge}>
                  <FaShieldAlt /> Verified charity
                </span>
              ) : (
                <span className={styles.unverifiedBadge}>
                  <FaExclamationTriangle /> Needs review
                </span>
              )}
            </div>

            <div className={styles.editGrid}>
              <label className={styles.inputLabel}>
                Charity
                <input
                  type="text"
                  className={styles.inputControl}
                  value={charityValue}
                  onChange={(event) => handleEditChange(donation.id, 'charity', event.target.value)}
                  disabled={isFinalized}
                />
              </label>
              <label className={styles.inputLabel}>
                Amount
                <input
                  type="number"
                  step="0.01"
                  className={styles.inputControl}
                  value={amountValue}
                  onChange={(event) => handleEditChange(donation.id, 'amount', event.target.value)}
                  disabled={isFinalized}
                />
              </label>
              <label className={styles.inputLabel}>
                Currency
                <input
                  type="text"
                  className={styles.inputControl}
                  value={currencyValue}
                  onChange={(event) => handleEditChange(donation.id, 'currency', event.target.value)}
                  disabled={isFinalized}
                />
              </label>
              <label className={styles.inputLabel}>
                Date
                <input
                  type="date"
                  className={styles.inputControl}
                  value={dateValue}
                  onChange={(event) => handleEditChange(donation.id, 'date', event.target.value)}
                  disabled={isFinalized}
                />
              </label>
            </div>

            <div className={styles.editGrid}>
              <label className={styles.inputLabel}>
                Contribution Type
                <select
                  value={selectedTypes[donation.id] || ''}
                  onChange={(event) => handleTypeChange(donation.id, event)}
                  className={styles.inputControl}
                  disabled={isFinalized}
                >
                  <option value="">Select Type</option>
                  <option value="regular">Regular Contribution</option>
                  <option value="one-off">One-Off Contribution</option>
                </select>
              </label>
              <label className={styles.inputLabel}>
                Charity Category
                <select
                  value={selectedCharityTypes[donation.id] || ''}
                  onChange={(event) => handleCharityTypeChange(donation.id, event)}
                  className={styles.inputControl}
                  disabled={isFinalized}
                >
                  <option value="">Select Charity Type</option>
                  {CHARITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {charitySector && (
                  <span className={styles.sectorTag}>Suggested: {charitySector}</span>
                )}
              </label>
            </div>

            <div className={styles.metaRow}>
              {confidence !== null && (
                <span>Confidence: {confidence}%</span>
              )}
              {failingGates.length > 0 && (
                <span className={styles.gateWarning}>
                  Filtered by: {failingGates.join(', ')}
                </span>
              )}
            </div>

            <div className={styles.actionButtons}>
              {!isFinalized && !isDeleted && (
                <>
                  <button
                    onClick={() => handleCommitSingle(donation)}
                    className={styles.commitButton}
                    disabled={committingJobId === donation.id}
                    aria-label="Commit donation"
                  >
                    {committingJobId === donation.id ? 'Committing...' : 'Commit'}
                  </button>
                  <button
                    onClick={() => handleDelete(donation.id)}
                    className={styles.deleteButton}
                    aria-label="Delete donation"
                  >
                    Delete
                  </button>
                </>
              )}
              {(isFinalized || isDeleted) && (
                <button
                  onClick={() => handleRestore(donation.id)}
                  className={styles.restoreButton}
                >
                  Restore
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.donationHeader}>
              <div>
                <strong>Charity:</strong> {donation.charity}
                {status?.type && (
                  <span className={styles.statusBadge}>
                    {status.type.replace('-', ' ').toUpperCase()}
                  </span>
                )}
              </div>
              {verified && (
                <span className={styles.verifiedBadge}>
                  <FaShieldAlt /> Verified
                </span>
              )}
            </div>
            <div className={styles.donationContent}>
              <strong>Date:</strong> {safeFormatDate(donation.date, 'dd/MM/yyyy')}<br/>
              <strong>Amount:</strong> {typeof donation.amount === 'number'
                ? donation.amount.toFixed(2)
                : parseFloat(String(donation.amount).replace(/[^0-9.-]+/g, '')).toFixed(2)}<br/>
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
                  onClick={() => handleLegacyCommit(donation)}
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
          </>
        )}
      </li>
    );
  }, [donationStatuses, selectedCandidates, editedDonations, selectedTypes, selectedCharityTypes, isClearing, handleTypeChange, handleCharityTypeChange, handleDelete, handleRestore, navigateToDonation, toggleCandidateSelection, isCandidateSelected, handleEditChange, handleLegacyCommit]);

  const renderSearchResults = useCallback(() => (
    <div className={`${styles.searchHistory} ${isClearing ? styles.clearing : ''}`}>
      {(searchHistory || []).map((entry, index) => {
        const isGmailSource = entry.source === 'gmail' || entry.source === 'uploaded' || entry.source === 'outlook';
        const counts = entry.counts || jobStatusMap[entry.jobId]?.counts || {};
        const stats = entry.stats || {};
        const selectedCount = isGmailSource ? Object.keys(selectedCandidates[entry.jobId] || {}).length : 0;

        return (
          <div key={index} className={`${styles.searchEntry} ${isClearing ? styles.clearing : ''}`}>
            <h5 className="heading">
              {entry.displayTitle
                ? `${entry.displayTitle} - ${safeFormatDate(entry.timestamp, 'dd/MM/yyyy HH:mm:ss')}`
                : entry.source === 'forwarded'
                ? `Forwarded Email Donations - Last Updated: ${safeFormatDate(entry.timestamp, 'dd/MM/yyyy HH:mm:ss')}`
                : `Search Results from ${entry.source.toUpperCase()} - ${safeFormatDate(entry.timestamp, 'dd/MM/yyyy HH:mm:ss')}`
              }
            </h5>

            {(isGmailSource || entry.source === 'uploaded') && (
              <div className={styles.commitSummary}>
                <span>{counts.candidates || 0} candidates • {counts.rejected || 0} filtered • {counts.committed || 0} committed</span>
                {stats.total !== undefined && (
                  <span>Entry gates &mdash; Total: {stats.total || 0}, Passed: {stats.passed || 0}, Rejected: {stats.rejected || 0}</span>
                )}
              </div>
            )}

            <ul className={styles.emailResultsList}>
              {(entry.results || []).map(result => renderDonationCard(result, entry.source))}
            </ul>

            {isGmailSource && (entry.rejected || []).length > 0 && (
              <details className={styles.rejectedSection}>
                <summary>Filtered out ({entry.rejected.length})</summary>
                <ul>
                  {entry.rejected.map(rejected => (
                    <li key={rejected.id} className={styles.rejectedItem}>
                      <div>
                        <strong>{rejected.charity || 'Unknown'}</strong>
                        <span className={styles.rejectionReason}>
                          Reason: {rejected.rejectionReason || 'Entry gate'}{rejected.rejectionDetail ? ` (${rejected.rejectionDetail})` : ''}
                        </span>
                      </div>
                      <div>
                        <span>{safeFormatDate(rejected.date, 'dd/MM/yyyy')}</span>
                        <span>
                          {rejected.currency ? `${rejected.currency} ` : ''}
                          {typeof rejected.amount === 'number' ? rejected.amount.toFixed(2) : rejected.amount}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        );
      })}
    </div>
  ), [searchHistory, isClearing, renderDonationCard, selectedCandidates, jobStatusMap, handleCommitSelected, committingJobId]);

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

        {/* Three Equal Import Methods */}
        <div className={styles.primaryActions}>
          <div className={styles.actionGrid}>
            {/* Option 1: Email Search (Gmail/Outlook) */}
            <div className={styles.actionTile}>
              <div className={styles.tileContent}>
                <FaEnvelope className={styles.tileIcon} />
                <h3 className={styles.tileTitle}>Email Search</h3>
                <p className={styles.tileDescription}>
                  Connect your email and we'll scan for donation receipts
                </p>
                <div className={styles.emailButtons}>
                  {isRegularUser && (
                    <button
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
                      className={`${styles.emailButton} ${hasGmailAuth ? styles.connected : ''}`}
                    >
                      <FaGoogle />
                      {checkingAuth ? 'Checking...' : loading ? 'Searching...' : hasGmailAuth ? 'Search Gmail' : 'Gmail'}
                      {hasGmailAuth && <FaCheck className={styles.checkIcon} />}
                    </button>
                  )}
                  <button
                    onClick={handleSearchOutlookEmails}
                    disabled={loading || isClearing}
                    className={`${styles.emailButton} ${hasOutlookAuth ? styles.connected : ''}`}
                  >
                    <FaMicrosoft />
                    {loading ? 'Searching...' : hasOutlookAuth ? 'Search Outlook' : 'Outlook'}
                    {hasOutlookAuth && <FaCheck className={styles.checkIcon} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Option 2: Email Forwarding */}
            <div className={styles.actionTile}>
              <div className={styles.tileContent}>
                <FaEnvelope className={styles.tileIcon} />
                <h3 className={styles.tileTitle}>Email Forwarding</h3>
                <p className={styles.tileDescription}>
                  Forward receipts to your unique address
                </p>
                {forwardingEmail ? (
                  <div className={styles.forwardingCompact}>
                    <code className={styles.emailCode}>{forwardingEmail}</code>
                    <div className={styles.forwardingButtons}>
                      <button
                        onClick={() => copyToClipboard(forwardingEmail)}
                        className={styles.iconButton}
                        title="Copy address"
                      >
                        {copyFeedback ? <FaCheck /> : <FaCopy />}
                      </button>
                      <button
                        onClick={fetchForwardedEmails}
                        disabled={loadingForwarded}
                        className={styles.iconButton}
                        title="Refresh"
                      >
                        <FaSync className={loadingForwarded ? styles.spinning : ''} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEmailForwarding(true)}
                    className={styles.setupButton}
                  >
                    Set up forwarding
                  </button>
                )}
                {hasForwardedEmails && <FaCheck className={styles.connectedIcon} />}
              </div>
            </div>

            {/* Option 3: Upload Receipts */}
            <div className={styles.actionTile}>
              <div className={styles.tileContent}>
                <FaUpload className={styles.tileIcon} />
                <h3 className={styles.tileTitle}>Upload Receipts</h3>
                <p className={styles.tileDescription}>
                  Upload PDF or email files directly
                </p>
                <div className={styles.uploadButtons}>
                  <button
                    onClick={handleUploadClick}
                    disabled={uploadingReceipt}
                    className={styles.uploadButton}
                  >
                    {uploadingReceipt ? 'Uploading...' : 'Choose File'}
                  </button>
                  <button
                    onClick={fetchUploadedReceipts}
                    disabled={uploadingReceipt}
                    className={styles.iconButton}
                    title="Refresh uploaded receipts"
                  >
                    <FaSync />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.eml,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                {uploadError && (
                  <p className={styles.errorText}>{uploadError}</p>
                )}
              </div>
            </div>
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
        </div>

        {/* Progress Indicator */}
        {loading && (
          <div className={styles.progressContainer}>
            <div className={styles.progressHeader}>
              <p className={styles.progressPhase}>
                {currentPhase === 'discovery' && 'Searching for receipts...'}
                {currentPhase === 'extraction' && 'Extracting receipt data...'}
                {currentPhase === 'parsing' && 'Processing donations...'}
                {!currentPhase && 'Starting scan...'}
              </p>
              <span className={styles.progressPercent}>{progress}%</span>
            </div>
            <div className={styles.progressBarBackground}>
              {(() => {
                const rounded = Math.max(0, Math.min(100, Math.round((progress || 0) / 5) * 5));
                const pctClass = styles['p' + String(rounded)];
                return (
                  <div className={`${styles.progressBarFill} ${styles.progressPulse} ${pctClass}`} />
                );
              })()}
            </div>
            <div className={styles.progressMeta}>
              <span className={styles.elapsedTime}>
                Elapsed: {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
              </span>
            </div>
            <p className={styles.progressNote}>
              This may take 5-10 minutes for large inboxes. We're scanning your emails for donation receipts.
            </p>
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
