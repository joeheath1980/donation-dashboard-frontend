import React, { useContext } from 'react';
import styles from '../YourPerks.module.css';
import PersonalImpactScore from './PersonalImpactScore';
import { ImpactContext } from '../contexts/ImpactContext';

function YourPerks() {
  const { 
    impactScore,
    lastYearImpactScore,
    tier,
    pointsToNextTier,
  } = useContext(ImpactContext);

  const scoreChange = impactScore - lastYearImpactScore;
  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  return (
    <div className={styles.perksContainer}>
      <h1 className={styles.header}>Your Perks</h1>
      <p className={styles.intro}>
        As a valued member of DonateSpace, you have access to exclusive perks. 
        Here's what you can enjoy:
      </p>

      <div className={styles.impactScoreContainer}>
        <PersonalImpactScore
          impactScore={impactScore}
          scoreChange={scoreChange}
          arrow={arrow}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
        />
      </div>

      <ul className={styles.perksList}>
        <li className={styles.perkItem}>
          <h2>Exclusive Events</h2>
          <p>Access to invitation-only charity events and galas.</p>
        </li>
        <li className={styles.perkItem}>
          <h2>Priority Matching</h2>
          <p>Get first access to new matching opportunities from our partners.</p>
        </li>
        <li className={styles.perkItem}>
          <h2>Partner Rewards and Savings</h2>
          <p>Enjoy special discounts and rewards from our partner organizations.</p>
        </li>
      </ul>
    </div>
  );
}

export default YourPerks;