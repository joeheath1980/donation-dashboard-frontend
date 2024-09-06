import React, { useContext } from 'react';
import styles from '../Profile.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

const ImpactScoreExplanation = () => {
  const { impactScore, scoreDetails } = useContext(ImpactContext);

  if (!scoreDetails) {
    return null; // or return a loading state
  }

  const { regularDonationScore, oneOffDonationScore, volunteeringScore, engagementBonus } = scoreDetails;

  return (
    <div className={styles.breakdownContainer}>
      <h2 className={styles.breakdownTitle}>Impact Score Breakdown</h2>
      <ScoreComponent 
        title="Regular Donations" 
        score={regularDonationScore} 
        maxScore={35} 
        description="Based on monthly average, streak, and variety of charities."
      />
      
      <ScoreComponent 
        title="One-off Donations" 
        score={oneOffDonationScore} 
        maxScore={25} 
        description="Based on total amount and number of donations."
      />
      
      <ScoreComponent 
        title="Volunteering" 
        score={volunteeringScore} 
        maxScore={30} 
        description="Based on total hours and variety of activities."
      />
      
      <ScoreComponent 
        title="Engagement Bonus" 
        score={engagementBonus} 
        maxScore={10} 
        description="Extra points for consistent involvement and improvement."
      />
      
      <div className={styles.breakdownItem}>
        <div className={styles.breakdownLabel}>
          <span>Total Impact Score</span>
          <span>{impactScore} / 100</span>
        </div>
        <div className={styles.breakdownProgressBar}>
          <div 
            className={styles.breakdownProgress} 
            style={{width: `${impactScore}%`}}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ScoreComponent = ({ title, score, maxScore, description }) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className={styles.breakdownItem}>
      <div className={styles.breakdownLabel}>
        <span>{title}</span>
        <span>{score}/{maxScore}</span>
      </div>
      <div className={styles.breakdownProgressBar}>
        <div 
          className={styles.breakdownProgress} 
          style={{width: `${percentage}%`}}
        ></div>
      </div>
      <p>{description}</p>
    </div>
  );
};

export default ImpactScoreExplanation;