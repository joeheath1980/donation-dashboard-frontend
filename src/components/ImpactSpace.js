import React, { useContext, useEffect, useMemo } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import ImpactVisualization from './ImpactVisualization';
import CarouselComponent from './CarouselComponent';
import PersonalImpactScore from './PersonalImpactScore';
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
    error: impactError
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

  if (impactError) {
    return <div className={styles.error}>{impactError}</div>;
  }

  if (!donations.length && !oneOffContributions.length && !volunteerActivities.length) {
    return <div className={styles.loading}>Loading your impact data...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Your Impact Space</h2>
      <PersonalImpactScore
        impactScore={impactScore}
        scoreChange={scoreChange}
        arrow={arrow}
        tier={tier}
        pointsToNextTier={pointsToNextTier}
      />
      <div className={styles.visualizationContainer}>
        <h3>Impact Score Over Time</h3>
        <ImpactVisualization />
      </div>
      <CarouselComponent title="Projects to Support" items={projectsToSupport} />
    </div>
  );
}

export default ImpactSpace;
