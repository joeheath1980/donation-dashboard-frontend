import React from 'react';
import styles from '../Profile.module.css';

const PersonalImpactScore = ({ impactScore, scoreChange, arrow, tier, pointsToNextTier }) => {
  return (
    <div className={styles.impactScoreContainer}>
      <div className={styles.impactScoreBox}>
        <h3>Personal Impact Score</h3>
        <p>{impactScore || 'Loading...'}</p>
        {scoreChange !== undefined && (
          <p className={styles.scoreChange}>
            {arrow} {Math.abs(scoreChange)} since last year
          </p>
        )}
        <p>Current Tier: {tier}</p>
        <p>Points to next tier: {pointsToNextTier}</p>
      </div>
    </div>
  );
};

export default PersonalImpactScore;