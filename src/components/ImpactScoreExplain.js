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

      <div className={styles.explanationText}>
        <h3>How Your Score is Calculated</h3>
        
        <h4>Donations (Up to 40 points)</h4>
        <p>
          • First $1,000: 1 point per $100 donated<br />
          • Next $4,000: 1 point per $200 donated<br />
          • Above $5,000: 1 point per $500 donated<br />
          • Regular giving boosts: 10% for monthly donations, 20% for weekly donations
        </p>
        
        <h4>Volunteering (Up to 30 points)</h4>
        <p>
          • First 50 hours: 0.6 points per hour<br />
          • Next 150 hours: 0.4 points per hour<br />
          • Above 200 hours: 0.2 points per hour<br />
          • Long-term commitment bonus: 5 points for over a year, 2.5 points for over 6 months
        </p>
        
        <h4>Fundraising (Up to 20 points)</h4>
        <p>
          • First $2,000 raised: 1 point per $100<br />
          • Next $8,000 raised: 1 point per $200<br />
          • Above $10,000 raised: 1 point per $500<br />
          • Activity bonuses: 2 points per event organized, 1 point per online campaign initiated
        </p>

        <p>Your total Impact Score is the sum of these three components, capped at 100 points.</p>
        
        <h4>Tiers</h4>
        <ul>
          <li>Visionary: 90-100 points</li>
          <li>Champion: 70-89 points</li>
          <li>Philanthropist: 50-69 points</li>
          <li>Altruist: 30-49 points</li>
          <li>Giver: 0-29 points</li>
        </ul>
        
        <p>Keep contributing to increase your score and reach higher tiers!</p>
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
