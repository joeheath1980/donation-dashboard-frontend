// src/components/Matching.js
import React, { useContext, useEffect, useState } from 'react';
import MatchingOpportunitiesComponent from './MatchingOpportunitiesComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from '../Matching.module.css';

function Matching() {
  const { matchingOpportunities, fetchImpactData, error } = useContext(ImpactContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchImpactData();
      setIsLoading(false);
    };
    loadData();
  }, [fetchImpactData]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchImpactData} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading matching opportunities...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Matching Opportunities</h2>
      {matchingOpportunities && matchingOpportunities.length > 0 ? (
        <MatchingOpportunitiesComponent opportunities={matchingOpportunities} />
      ) : (
        <p className={styles.noOpportunities}>No matching opportunities found at the moment.</p>
      )}
    </div>
  );
}

export default Matching;
