import React, { useContext, useEffect } from 'react';
import ImpactVisualization from './ImpactVisualization';
import NewsFeedComponent from './NewsFeedComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from '../ImpactSpace.module.css';

function ImpactSpace() {
  const {
    donations,
    impactScore,
    fetchImpactData,
    error
  } = useContext(ImpactContext);

  useEffect(() => {
    fetchImpactData();
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

  if (!donations.length) {
    return <div className={styles.loading}>Loading your donation data...</div>;
  }

  const donationData = donations.map(donation => ({
    date: donation.date,
    amount: donation.amount
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Your Impact Space</h2>
      <div className={styles.impactScoreContainer}>
        <h3 className={styles.impactScoreTitle}>Your Impact Score</h3>
        <div className={styles.impactScoreBox}>
          <p>{impactScore}</p>
        </div>
        <ImpactVisualization donationsData={donationData} />
      </div>
      <NewsFeedComponent />
    </div>
  );
}

export default ImpactSpace;
