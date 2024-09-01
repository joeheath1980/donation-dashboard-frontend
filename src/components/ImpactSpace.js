import React, { useContext, useEffect, useMemo } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import ImpactVisualization from './ImpactVisualization';
import CarouselComponent from './CarouselComponent';
import styles from '../ImpactSpace.module.css';

function ImpactSpace() {
  const {
    donations,
    oneOffContributions,
    volunteerActivities,
    impactScore,
    lastYearImpactScore,
    tier,
    pointsToNextTier,
    fetchImpactData,
    error
  } = useContext(ImpactContext);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  const scoreChange = useMemo(() => {
    return impactScore - lastYearImpactScore;
  }, [impactScore, lastYearImpactScore]);

  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  const projectsToSupport = [
    { title: "Support Healthcare", description: "Provide essential medical supplies...", link: "#" },
    { title: "Education Initiative", description: "Help underprivileged children access education...", link: "#" },
    { title: "Clean Water Project", description: "Bring clean water to remote villages...", link: "#" },
    { title: "Hunger Relief", description: "Support food banks and meal programs...", link: "#" },
  ];

  const impactUpdates = [
    { title: "Healthcare Impact", description: "Your donation provided medical supplies to 100 families...", link: "#" },
    { title: "Education Success", description: "20 students graduated thanks to your support...", link: "#" },
    { title: "Clean Water Achievement", description: "A new well now serves 500 people in a remote village...", link: "#" },
    { title: "Hunger Relief Results", description: "1000 meals served to those in need...", link: "#" },
  ];

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!donations.length && !oneOffContributions.length && !volunteerActivities.length) {
    return <div className={styles.loading}>Loading your impact data...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Your Impact Space</h2>
      <div className={styles.impactScoreContainer}>
  <h3 className={styles.impactScoreTitle}>Your Impact Score</h3>
  <div className={styles.impactScoreBox}>
    <div className={styles.impactScoreValue}>{impactScore.toFixed(2)}</div>
    <div className={styles.arrow}>{arrow}</div>
    <div className={styles.scoreChange}>
      {Math.abs(scoreChange).toFixed(2)} {scoreChange > 0 ? 'increase' : 'decrease'} from last year
    </div>
    <div className={styles.tierContainer}>
      <p className={styles.tierInfo}>Current Tier: {tier}</p>
      {pointsToNextTier > 0 && (
        <p className={styles.nextTierInfo}>{pointsToNextTier.toFixed(0)} points to reach the next tier</p>
      )}
    </div>
  </div>
        <ImpactVisualization />
      </div>
      <CarouselComponent title="Projects to Support" items={projectsToSupport} />
      <CarouselComponent title="Your Impact Updates" items={impactUpdates} />
    </div>
  );
}

export default ImpactSpace;


