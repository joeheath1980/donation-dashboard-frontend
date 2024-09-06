import React from 'react';
import styles from '../Profile.module.css';

const PersonalImpactScore = ({ impactScore, scoreChange, arrow, tier, pointsToNextTier }) => {
  const containerStyle = {
    backgroundColor: '#e8f5e9',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const scoreNumberStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #4CAF50, #81C784, #4CAF50)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  };

  const tierContainerStyle = {
    backgroundColor: '#c8e6c9',
    borderRadius: '8px',
    padding: '10px',
    marginTop: '10px',
  };

  return (
    <div className={styles.impactScoreContainer} style={containerStyle}>
      <div className={styles.profile_scoreLayout}>
        <div className={styles.profile_titleColumn}>
          <h3 className={styles.profile_impactScoreTitle} style={{ color: '#2E7D32' }}>
            <span>Personal</span>
            <span>Impact</span>
            <span>Score</span>
          </h3>
        </div>
        <div className={styles.profile_scoreColumn}>
          <p className={styles.profile_scoreNumber} style={scoreNumberStyle}>
            {impactScore || 'Loading...'}
          </p>
          {scoreChange !== undefined && (
            <p className={styles.profile_scoreChange} style={{ color: '#2E7D32' }}>
              {arrow} {Math.abs(scoreChange)} since last year
            </p>
          )}
        </div>
        <div className={styles.profile_tierColumn}>
          <div className={styles.profile_tierInfoContainer} style={tierContainerStyle}>
            <p style={{ color: '#2E7D32', margin: '5px 0' }}>
              Current Tier: <span className={styles.profile_tierValue}>{tier}</span>
            </p>
            <p style={{ color: '#2E7D32', margin: '5px 0' }}>
              Points to next tier: <span className={styles.profile_tierValue}>{pointsToNextTier}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalImpactScore;