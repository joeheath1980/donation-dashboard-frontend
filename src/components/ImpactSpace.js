import React, { useContext, useEffect, useMemo } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import ImpactVisualization from './ImpactVisualization';
import CarouselComponent from './CarouselComponent';
import PersonalImpactScore from './PersonalImpactScore';
import styles from '../ImpactSpace.module.css';
import { applyGlobalStyles, globalClasses } from '../utils/styleUtils';

const combinedStyles = applyGlobalStyles(styles, globalClasses);

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
    return <div className={combinedStyles.error}>{impactError}</div>;
  }

  if (!donations.length && !oneOffContributions.length && !volunteerActivities.length) {
    return <div className={combinedStyles.card}>Loading your impact data...</div>;
  }

  return (
    <div className={combinedStyles.container}>
      <h2 className={combinedStyles.mainTitle}>Your Impact Space</h2>
      <PersonalImpactScore
        impactScore={impactScore}
        scoreChange={scoreChange}
        arrow={arrow}
        tier={tier}
        pointsToNextTier={pointsToNextTier}
      />
      <div className={`${combinedStyles.visualizationContainer} ${combinedStyles.card}`}>
        <h3 className={combinedStyles.visualizationTitle}>Your Impact Journey</h3>
        <ImpactVisualization />
      </div>
      <CarouselComponent title="Projects to Support" items={projectsToSupport} />
    </div>
  );
}

export default ImpactSpace;
