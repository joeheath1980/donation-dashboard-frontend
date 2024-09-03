import React, { useState, useContext } from 'react';
import Progress from './Progress';
import styles from '../Profile.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

const ImpactScoreExplanation = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { impactScore, scoreDetails } = useContext(ImpactContext);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!scoreDetails) {
    return null; // or return a loading state
  }

  const { regularDonationScore, oneOffDonationScore, volunteeringScore, engagementBonus } = scoreDetails;

  return (
    <div className={`${styles.card} ${styles.impactScoreCard}`}>
      <div className={styles.cardHeader} onClick={toggleExpand}>
        <button className={styles.expandButton}>
          {isExpanded ? '▲' : '▼'}
        </button>
        <h2 className={styles.cardTitle}>Impact Score Breakdown</h2>
      </div>
      {isExpanded && (
        <div className={styles.cardContent}>
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
          
          <div className={styles.totalScore}>
            <h3>Total Impact Score</h3>
            <Progress value={impactScore} max={100} className={styles.progressBar} />
            <p className={styles.totalScoreValue}>{impactScore} / 100</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ScoreComponent = ({ title, score, maxScore, description }) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className={styles.scoreComponent}>
      <h3>{title}</h3>
      <p className={styles.scoreValue}>{score}/{maxScore}</p>
      <Progress value={percentage} max={100} className={styles.progressBar} />
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default ImpactScoreExplanation;