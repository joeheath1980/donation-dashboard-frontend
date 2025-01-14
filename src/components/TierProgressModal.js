import React from 'react';
import styles from './TierProgressModal.module.css';
import cleanStyles from './CleanDesign.module.css';
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
  { name: 'Visionary', minScore: 90, icon: FaCrown, color: '#FFD700' },
  { name: 'Champion', minScore: 70, icon: FaMedal, color: '#C0C0C0' },
  { name: 'Philanthropist', minScore: 50, icon: FaTrophy, color: '#CD7F32' },
  { name: 'Altruist', minScore: 30, icon: FaHandsHelping, color: '#2ECC71' },
  { name: 'Giver', minScore: 0, icon: FaHeart, color: '#E74C3C' }
];

const TierProgressModal = ({ currentTier, impactScore, hideTitle = false, tiers = defaultTiers }) => {
  const currentTierIndex = tiers.findIndex(tier => tier.name === currentTier);
  const nextTier = tiers[currentTierIndex - 1]; // Note: tiers are in descending order
  const pointsToNextTier = nextTier ? nextTier.minScore - impactScore : 0;

  return (
    <div className={`${styles.modalContent} ${cleanStyles.card}`}>
      {!hideTitle && (
        <h2 className={cleanStyles.title}>
          <FaChartLine className={styles.titleIcon} />
          Your Current Tier: {currentTier}
        </h2>
      )}
      <div className={styles.tierProgress}>
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          const isAchieved = index >= currentTierIndex;
          const progressWidth = isAchieved ? '100%' : 
            (index === currentTierIndex - 1 ? `${((impactScore - tiers[index+1].minScore) / (tier.minScore - tiers[index+1].minScore)) * 100}%` : '0%');
          
          return (
            <div key={tier.name} className={styles.tierBarContainer}>
              <div
                className={`${styles.tierBar} ${isAchieved ? styles.achieved : ''}`}
                style={{ 
                  width: progressWidth
                }}
                data-tier={tier.name}
              >
                <div className={styles.tierIcon}>
                  <Icon />
                </div>
                <span className={styles.tierName}>{tier.name}</span>
                <span className={styles.tierScore}>{tier.minScore}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`${styles.currentScore} ${cleanStyles.description}`}>
        <FaChartLine className={styles.scoreIcon} />
        <span>Your Impact Score: {impactScore}</span>
      </div>
      {nextTier && (
        <div className={`${styles.nextTier} ${cleanStyles.highlight}`}>
          <FaArrowUp className={styles.scoreIcon} />
          <span>Points needed for {nextTier.name}: {pointsToNextTier}</span>
        </div>
      )}
    </div>
  );
};

export default TierProgressModal;