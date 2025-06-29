import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.doubleBounce1}></div>
        <div className={styles.doubleBounce2}></div>
      </div>
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;