import React, { useContext } from 'react';
import styles from './ImpactScoreExplain.module.css';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaTimes } from 'react-icons/fa';

const ImpactScoreExplain = ({ onClose }) => {
  const { impactScore, scoreDetails } = useContext(ImpactContext);

  if (!scoreDetails) {
    return null; // or return a loading state
  }

  const { donationScore, volunteerScore, fundraisingScore } = scoreDetails;

  return (
    <div className={styles.breakdownContainer}>
      <button onClick={onClose} className={styles.closeButton}>
        <FaTimes />
      </button>
      <h2 className={styles.breakdownTitle}>Impact Score Breakdown</h2>
      <ScoreComponent 
        title="Donations" 
        score={donationScore} 
        maxScore={40} 
        description="Points are awarded based on your total donations, with higher donations earning more points. Regular giving can boost your score."
      />
      
      <ScoreComponent 
        title="Volunteering" 
        score={volunteerScore} 
        maxScore={30} 
        description="Points are awarded for your volunteering hours, with additional bonuses for long-term commitments."
      />
      
      <ScoreComponent 
        title="Fundraising" 
        score={fundraisingScore} 
        maxScore={20} 
        description="Points are awarded based on the amount you've raised, with additional bonuses for organizing events and online campaigns."
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

export default ImpactScoreExplain;
