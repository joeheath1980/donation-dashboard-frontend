import React, { useContext } from 'react';
import PersonalImpactScore from './PersonalImpactScore';
import styles from './YourImpact.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

const YourImpact = () => {
  const { impactScore, scoreChange, tier, pointsToNextTier } = useContext(ImpactContext);

  return (
    <div className={styles.yourImpactContainer}>
      <PersonalImpactScore
        impactScore={impactScore}
        scoreChange={scoreChange}
        tier={tier}
        pointsToNextTier={pointsToNextTier}
      />
      <div className={styles.scoreCalculationInfo}>
        <h2>How Your Score is Calculated</h2>
        <div className={styles.categoryInfo}>
          <h3>Donations (Up to 40 points)</h3>
          <ul>
            <li>First $1,000: 1 point per $100 donated</li>
            <li>Next $4,000: 1 point per $200 donated</li>
            <li>Above $5,000: 1 point per $500 donated</li>
            <li>Regular giving boosts: 10% for monthly donations, 20% for weekly donations</li>
          </ul>
        </div>
        <div className={styles.categoryInfo}>
          <h3>Volunteering (Up to 30 points)</h3>
          <ul>
            <li>First 50 hours: 0.6 points per hour</li>
            <li>Next 150 hours: 0.4 points per hour</li>
            <li>Above 200 hours: 0.2 points per hour</li>
            <li>Long-term commitment bonus: 5 points for over a year, 2.5 points for over 6 months</li>
          </ul>
        </div>
        <div className={styles.categoryInfo}>
          <h3>Fundraising (Up to 20 points)</h3>
          <ul>
            <li>First $2,000 raised: 1 point per $100</li>
            <li>Next $8,000 raised: 1 point per $200</li>
            <li>Above $10,000 raised: 1 point per $500</li>
            <li>Activity bonuses: 2 points per event organized, 1 point per online campaign initiated</li>
          </ul>
        </div>
        <p className={styles.totalScoreInfo}>
          Your total Impact Score is the sum of these three components, capped at 100 points.
        </p>
      </div>
    </div>
  );
};

export default YourImpact;