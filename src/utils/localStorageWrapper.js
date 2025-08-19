/**
 * localStorage Compatibility Wrapper for Token Migration
 * 
 * TEMPORARY BRIDGE - Remove after full migration to HttpOnly cookies
 * 
 * This wrapper intercepts localStorage calls to:
 * 1. Track remaining direct token access
 * 2. Redirect token operations to SecureTokenStorage
 * 3. Log usage for migration prioritization
 * 4. Warn developers about deprecated patterns
 * 
 * @deprecated Will be removed in Q2 2025 after cookie migration
 */

import { SecureTokenStorage } from './auth.utils';
import { createLogger } from './logger';

const logger = createLogger('LocalStorageWrapper');

// Track usage statistics for migration monitoring
const usageStats = {
  tokenReads: 0,
  tokenWrites: 0,
  tokenDeletes: 0,
  callerComponents: new Set(),
  startTime: Date.now()
};

// Original localStorage methods (stored before patching)
const originalMethods = {
  getItem: null,
  setItem: null,
  removeItem: null,
  clear: null
};

/**
 * Get caller information for tracking
 */
function getCallerInfo() {
  try {
    const stack = new Error().stack;
    const callerLine = stack.split('\n')[3]; // Skip Error, getCallerInfo, and wrapper function
    const match = callerLine.match(/at\s+(.+?)\s+\(/);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Log usage for migration tracking
 */
function logUsage(operation, key, caller) {
  const isTokenOperation = key === 'token' || key === 'refreshToken';
  
  if (isTokenOperation) {
    // Track statistics
    if (operation === 'get') usageStats.tokenReads++;
    if (operation === 'set') usageStats.tokenWrites++;
    if (operation === 'remove') usageStats.tokenDeletes++;
    usageStats.callerComponents.add(caller);
    
    // Log warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `⚠️ Direct localStorage.${operation}Item('${key}') called by ${caller}`,
        '\nPlease migrate to SecureTokenStorage methods.',
        '\nThis direct access will be removed in future versions.'
      );
    }
    
    // Send telemetry in production (if configured)
    logger.debug('Token operation intercepted', {
      operation,
      key,
      caller,
      stats: {
        reads: usageStats.tokenReads,
        writes: usageStats.tokenWrites,
        deletes: usageStats.tokenDeletes,
        uniqueCallers: usageStats.callerComponents.size
      }
    });
  }
}

/**
 * Wrapped getItem - redirects token access to SecureTokenStorage
 */
function wrappedGetItem(key) {
  const caller = getCallerInfo();
  
  // Special handling for token keys
  if (key === 'token') {
    logUsage('get', key, caller);
    
    // Redirect to secure storage
    const secureToken = SecureTokenStorage.getToken();
    
    // Graceful fallback if secure storage fails
    if (!secureToken) {
      logger.warn('SecureTokenStorage returned null, checking original localStorage', { caller });
      return originalMethods.getItem.call(this, key);
    }
    
    return secureToken;
  }
  
  if (key === 'refreshToken') {
    logUsage('get', key, caller);
    return SecureTokenStorage.getRefreshToken();
  }
  
  // Non-token keys use original localStorage
  return originalMethods.getItem.call(this, key);
}

/**
 * Wrapped setItem - redirects token storage to SecureTokenStorage
 */
function wrappedSetItem(key, value) {
  const caller = getCallerInfo();
  
  // Special handling for token keys
  if (key === 'token') {
    logUsage('set', key, caller);
    
    // Redirect to secure storage
    SecureTokenStorage.setToken(value);
    
    // Also store in localStorage for backward compatibility (temporary)
    // This ensures components that check localStorage directly still work
    return originalMethods.setItem.call(this, key, value);
  }
  
  if (key === 'refreshToken') {
    logUsage('set', key, caller);
    SecureTokenStorage.setToken(SecureTokenStorage.getToken(), value);
    return originalMethods.setItem.call(this, key, value);
  }
  
  // Non-token keys use original localStorage
  return originalMethods.setItem.call(this, key, value);
}

/**
 * Wrapped removeItem - redirects token removal to SecureTokenStorage
 */
function wrappedRemoveItem(key) {
  const caller = getCallerInfo();
  
  // Special handling for token keys
  if (key === 'token' || key === 'refreshToken') {
    logUsage('remove', key, caller);
    
    // Clear from secure storage
    if (key === 'token') {
      SecureTokenStorage.clearToken();
    }
    
    // Also clear from localStorage for consistency
    return originalMethods.removeItem.call(this, key);
  }
  
  // Non-token keys use original localStorage
  return originalMethods.removeItem.call(this, key);
}

/**
 * Wrapped clear - ensures tokens are cleared from SecureTokenStorage
 */
function wrappedClear() {
  const caller = getCallerInfo();
  logger.info('localStorage.clear() called', { caller });
  
  // Clear secure storage
  SecureTokenStorage.clearToken();
  
  // Clear original localStorage
  return originalMethods.clear.call(this);
}

/**
 * Initialize the localStorage wrapper
 * Call this early in application startup
 */
export function initializeLocalStorageWrapper() {
  // Only wrap if localStorage exists and we haven't already wrapped
  if (typeof window === 'undefined' || !window.localStorage || originalMethods.getItem) {
    return;
  }
  
  logger.info('Initializing localStorage wrapper for token migration');
  
  // Store original methods
  originalMethods.getItem = window.localStorage.getItem;
  originalMethods.setItem = window.localStorage.setItem;
  originalMethods.removeItem = window.localStorage.removeItem;
  originalMethods.clear = window.localStorage.clear;
  
  // Apply wrapped methods
  window.localStorage.getItem = wrappedGetItem;
  window.localStorage.setItem = wrappedSetItem;
  window.localStorage.removeItem = wrappedRemoveItem;
  window.localStorage.clear = wrappedClear;
  
  // Add migration status checker
  window.__checkTokenMigrationStatus = () => {
    const runtime = Date.now() - usageStats.startTime;
    const hours = Math.floor(runtime / 3600000);
    const minutes = Math.floor((runtime % 3600000) / 60000);
    
    console.group('📊 Token Migration Status');
    console.log(`Runtime: ${hours}h ${minutes}m`);
    console.log(`Token reads: ${usageStats.tokenReads}`);
    console.log(`Token writes: ${usageStats.tokenWrites}`);
    console.log(`Token deletes: ${usageStats.tokenDeletes}`);
    console.log(`Unique components: ${usageStats.callerComponents.size}`);
    console.log('Components still using direct access:');
    usageStats.callerComponents.forEach(comp => console.log(`  - ${comp}`));
    console.groupEnd();
    
    return usageStats;
  };
  
  logger.info('localStorage wrapper initialized successfully');
}

/**
 * Remove the localStorage wrapper (for testing or final migration)
 */
export function removeLocalStorageWrapper() {
  if (!originalMethods.getItem) {
    logger.warn('Cannot remove wrapper - not initialized');
    return;
  }
  
  logger.info('Removing localStorage wrapper');
  
  // Restore original methods
  window.localStorage.getItem = originalMethods.getItem;
  window.localStorage.setItem = originalMethods.setItem;
  window.localStorage.removeItem = originalMethods.removeItem;
  window.localStorage.clear = originalMethods.clear;
  
  // Clear stored references
  originalMethods.getItem = null;
  originalMethods.setItem = null;
  originalMethods.removeItem = null;
  originalMethods.clear = null;
  
  // Remove status checker
  delete window.__checkTokenMigrationStatus;
  
  logger.info('localStorage wrapper removed');
}

/**
 * Get migration statistics
 */
export function getMigrationStats() {
  return {
    ...usageStats,
    callerComponents: Array.from(usageStats.callerComponents),
    runtime: Date.now() - usageStats.startTime
  };
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  // Initialize on next tick to ensure app setup is complete
  setTimeout(() => {
    initializeLocalStorageWrapper();
  }, 0);
}