import React, { useContext, useEffect } from 'react';
import ImpactVisualization from './ImpactVisualization';
import NewsFeedComponent from './NewsFeedComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from '../ImpactSpace.module.css';  // Update this import if you've renamed the CSS module

function ImpactSpace() {  // Renamed from Dashboard to ImpactSpace
  const {
    donations,
    volunteerActivities,
    fundraisingCampaigns,
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

  if (!donations.length && !volunteerActivities.length && !fundraisingCampaigns.length) {
    return <div className={styles.loading}>Loading your impact data...</div>;
  }

  // Combine the data into a single array
  const combinedData = [
    ...donations.map(donation => ({
      date: donation.date,
      amount: donation.amount,
      type: 'donation'
    })),
    ...fundraisingCampaigns.map(campaign => ({
      date: campaign.startDate,
      amount: campaign.raised,
      type: 'fundraising'
    })),
    ...volunteerActivities.map(activity => ({
      date: activity.date,
      amount: activity.hours,  // Assuming volunteer hours can be treated as an 'amount'
      type: 'volunteer'
    }))
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Your DonateSpace</h2>
      <div className={styles.impactScoreContainer}>
        <h3 className={styles.impactScoreTitle}>Your Impact Score</h3>
        <div className={styles.impactScoreBox}>
          <p>{impactScore}</p>
        </div>
        <ImpactVisualization donationsData={combinedData} />
      </div>
      <NewsFeedComponent />
    </div>
  );
}

export default ImpactSpace;
