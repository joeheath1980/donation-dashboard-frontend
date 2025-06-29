import React, { Component } from 'react';
import { createLogger } from '../utils/logger';
import styles from './ErrorBoundary.module.css';

const logger = createLogger('ErrorBoundary');

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    logger.error('React Error Boundary caught an error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown'
    });

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Report to error monitoring service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Check if we've had too many errors
      if (this.state.errorCount > 3) {
        return (
          <div className={styles.errorContainer}>
            <div className={styles.errorContent}>
              <h1 className={styles.errorTitle}>Too Many Errors</h1>
              <p className={styles.errorMessage}>
                We're experiencing multiple issues. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className={styles.errorButton}
              >
                Refresh Page
              </button>
            </div>
          </div>
        );
      }

      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            <p className={styles.errorMessage}>
              We're sorry for the inconvenience. Please try again.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development Only)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className={styles.errorActions}>
              <button
                onClick={this.handleReset}
                className={styles.errorButton}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className={styles.errorButtonSecondary}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;