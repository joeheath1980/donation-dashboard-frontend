import React, { useState, useEffect } from 'react';
import styles from './RateLimitHandler.module.css';

/**
 * RateLimitHandler - Handles rate limit errors with user feedback
 * CASA Compliance: Provides clear user feedback for rate limiting
 */
const RateLimitHandler = ({ error, onRetry, className }) => {
  const [countdown, setCountdown] = useState(null);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (error?.isRateLimit && error.retryAfter) {
      setCountdown(error.retryAfter);
      setCanRetry(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanRetry(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [error]);

  if (!error?.isRateLimit) {
    return null;
  }

  return (
    <div className={`${styles.rateLimitContainer} ${className || ''}`}>
      <div className={styles.rateLimitIcon}>⚠️</div>
      <div className={styles.rateLimitMessage}>
        <h4>Too Many Attempts</h4>
        <p>{error.message || 'You have made too many requests. Please wait before trying again.'}</p>
        {countdown > 0 && (
          <div className={styles.countdown}>
            Please wait <strong>{countdown}</strong> seconds before trying again
          </div>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={!canRetry && countdown > 0}
          className={styles.retryButton}
        >
          {canRetry ? 'Try Again' : `Wait ${countdown}s`}
        </button>
      )}
    </div>
  );
};

/**
 * Hook to handle rate limit errors in forms
 */
export const useRateLimitHandler = () => {
  const [rateLimitError, setRateLimitError] = useState(null);

  const handleError = (error) => {
    if (error?.isRateLimit || error?.response?.status === 429) {
      const retryAfter = error.retryAfter || error.response?.headers?.['retry-after'];
      setRateLimitError({
        ...error,
        isRateLimit: true,
        retryAfter: retryAfter ? parseInt(retryAfter) : null,
        message: error.message || error.response?.data?.message || 'Too many requests'
      });
      return true; // Handled
    }
    return false; // Not a rate limit error
  };

  const clearError = () => {
    setRateLimitError(null);
  };

  return {
    rateLimitError,
    handleError,
    clearError,
    isRateLimited: !!rateLimitError
  };
};

export default RateLimitHandler;