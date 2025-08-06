import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const MatchSelectionContext = createContext();

const STORAGE_PREFIX = 'match_';
const STORAGE_EXPIRY = 1800000; // 30 minutes
const CACHE_DURATION = 300000; // 5 minutes for API cache

const persistSelection = (oppId, charityId) => {
  try {
    const key = `${STORAGE_PREFIX}${oppId}`;
    if (charityId) {
      sessionStorage.setItem(key, JSON.stringify({
        charityId,
        timestamp: Date.now()
      }));
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error('[Context] Failed to persist selection:', error);
  }
};

const recoverSelection = (oppId) => {
  try {
    const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${oppId}`);
    if (stored) {
      const { charityId, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < STORAGE_EXPIRY) {
        return charityId;
      }
      sessionStorage.removeItem(`${STORAGE_PREFIX}${oppId}`);
    }
  } catch (error) {
    console.error('[Context] Failed to recover selection:', error);
  }
  return null;
};

export const MatchSelectionProvider = ({ children }) => {
  const [selections, setSelections] = useState({});
  const [errors, setErrors] = useState({});
  const [charityCache, setCharityCache] = useState({});
  const cacheTimestamps = useRef({});

  const hydrateSelections = useCallback((opportunities) => {
    if (!opportunities?.length) return;
    
    const recovered = {};
    let recoveredCount = 0;
    
    opportunities.forEach(opp => {
      const charityId = recoverSelection(opp.id);
      if (charityId) {
        recovered[opp.id] = charityId;
        recoveredCount++;
      }
    });
    
    if (recoveredCount > 0) {
      console.log(`[Context] Recovered ${recoveredCount} selections`);
      setSelections(prev => ({ ...prev, ...recovered }));
    }
  }, []);

  const updateSelection = useCallback((oppId, charityId) => {
    console.log(`[Context] Selection update: ${oppId} → ${charityId || 'none'}`);
    
    persistSelection(oppId, charityId);
    
    setSelections(prev => {
      if (charityId) {
        return { ...prev, [oppId]: charityId };
      } else {
        const { [oppId]: removed, ...rest } = prev;
        return rest;
      }
    });
    
    setErrors(prev => {
      const { [oppId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const setError = useCallback((oppId, message) => {
    console.warn(`[Context] Error for ${oppId}: ${message}`);
    setErrors(prev => ({ ...prev, [oppId]: message }));
  }, []);

  const clearError = useCallback((oppId) => {
    setErrors(prev => {
      const { [oppId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const setCachedCharities = useCallback((charities) => {
    const now = Date.now();
    setCharityCache(prev => ({ ...prev, ...charities }));
    Object.keys(charities).forEach(id => {
      cacheTimestamps.current[id] = now;
    });
  }, []);

  const getCachedCharity = useCallback((charityId) => {
    const timestamp = cacheTimestamps.current[charityId];
    if (timestamp && Date.now() - timestamp < CACHE_DURATION) {
      return charityCache[charityId];
    }
    return null;
  }, [charityCache]);

  const value = {
    selections,
    errors,
    updateSelection,
    setError,
    clearError,
    hydrateSelections,
    setCachedCharities,
    getCachedCharity,
    charityCache
  };

  return (
    <MatchSelectionContext.Provider value={value}>
      {children}
    </MatchSelectionContext.Provider>
  );
};

export const useMatchSelection = () => {
  const context = useContext(MatchSelectionContext);
  if (!context) {
    throw new Error('useMatchSelection must be used within MatchSelectionProvider');
  }
  return context;
};