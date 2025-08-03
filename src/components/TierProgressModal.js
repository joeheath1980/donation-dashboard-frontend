import React from 'react';
import styles from './TierProgressModal.module.css';
import './SharedStyles.css';
import { 
  FaChartLine, 
  FaArrowUp,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaHandsHelping,
  FaHeart
} from 'react-icons/fa';

const defaultTiers = [
  { name: 'Visionary', minScore: 5000, icon: FaCrown, color: '#FFD700' },
  { name: 'Champion', minScore: 2500, icon: FaMedal, color: '#C0C0C0' },
  { name: 'Philanthropist', minScore: 1000, icon: FaTrophy, color: '#CD7F32' },
  { name: 'Altruist', minScore: 300, icon: FaHandsHelping, color: '#2ECC71' },
  { name: 'Giver', minScore: 0, icon: FaHeart, color: '#E74C3C' }
];

const TierProgressModal = ({ currentTier, impactScore, hideTitle = false, tiers = defaultTiers }) => {
  const currentTierIndex = tiers.findIndex(tier => tier.name === currentTier);
  const nextTier = tiers[currentTierIndex - 1]; // Note: tiers are in descending order
  const pointsToNextTier = nextTier ? nextTier.minScore - impactScore : 0;

  return (
    <div className={`${styles.modalContent} card`}>
      {!hideTitle && (
        <h2 className="title">
          <FaChartLine className={styles.titleIcon} />
          Your Current Tier: {currentTier}
        </h2>
      )}
      <div className={styles.tierProgress}>
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          const isAchieved = index >= currentTierIndex;
          const isNext = index === currentTierIndex - 1;
          
          // Calculate progress for the next tier
          let progressPercentage = 0;
          if (isAchieved) {
            progressPercentage = 100;
          } else if (isNext) {
            const prevTier = tiers[index + 1];
            progressPercentage = ((impactScore - prevTier.minScore) / (tier.minScore - prevTier.minScore)) * 100;
          }
          
          return (
            <div key={tier.name} className={styles.tierItem}>
              {/* Left side - Icon and Name */}
              <div className={styles.tierLeft}>
                <div 
                  className={`${styles.tierIcon} ${isAchieved ? styles.achieved : ''} ${isNext ? styles.next : ''}`}
                  style={{ color: tier.color }}
                >
                  <Icon />
                </div>
                <span className={`${styles.tierName} ${isAchieved ? styles.achieved : ''}`}>
                  {tier.name}
                </span>
              </div>
              
              {/* Center - Progress Bar */}
              <div className={styles.tierBarContainer}>
                <div className={styles.tierBarBackground}>
                  {/* Filled progress */}
                  <div
                    className={`${styles.tierBar} ${isAchieved ? styles.achieved : ''} ${isNext ? styles.inProgress : ''}`}
                    style={{ 
                      width: `${progressPercentage}%`,
                      background: isAchieved ? 
                        `linear-gradient(90deg, ${tier.color}dd, ${tier.color})` :
                        isNext ? 
                          `linear-gradient(90deg, ${tier.color}99, ${tier.color}dd)` :
                          'transparent'
                    }}
                  />
                  {/* Remaining progress (washed out) */}
                  {isNext && progressPercentage < 100 && (
                    <div
                      className={styles.tierBarRemaining}
                      style={{ 
                        left: `${progressPercentage}%`,
                        width: `${100 - progressPercentage}%`,
                        background: `linear-gradient(90deg, ${tier.color}33, ${tier.color}22)`
                      }}
                    />
                  )}
                  {/* Current score badge */}
                  {isNext && (
                    <div 
                      className={styles.currentScoreBadge} 
                      style={{ left: `${progressPercentage}%` }}
                    >
                      <span>{impactScore}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Tier threshold */}
              <div className={styles.tierRight}>
                <span className={`${styles.tierScore} ${isAchieved ? styles.achieved : ''}`}>
                  {tier.minScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {nextTier && (
        <div className={styles.summarySection}>
          <div className={`${styles.nextTier} highlight`}>
            <FaArrowUp className={styles.scoreIcon} />
            <span>{pointsToNextTier} points to {nextTier.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierProgressModal;