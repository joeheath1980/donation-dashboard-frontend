import React from 'react';
import styles from './TierProgressModal.module.css';
import { FaStar, FaAward, FaTrophy, FaHandsHelping, FaHeart } from 'react-icons/fa';

const tiers = [
  { name: 'Visionary', minScore: 90, icon: FaStar, color: '#FFD700' },
  { name: 'Champion', minScore: 70, icon: FaAward, color: '#C0C0C0' },
  { name: 'Philanthropist', minScore: 50, icon: FaTrophy, color: '#CD7F32' },
  { name: 'Altruist', minScore: 30, icon: FaHandsHelping, color: '#2ECC71' },
  { name: 'Giver', minScore: 0, icon: FaHeart, color: '#E74C3C' }
];

const TierProgressModal = ({ currentTier, impactScore }) => {
  const currentTierIndex = tiers.findIndex(tier => tier.name === currentTier);
  const nextTier = tiers[currentTierIndex - 1]; // Note: tiers are in descending order
  const pointsToNextTier = nextTier ? nextTier.minScore - impactScore : 0;

  return (
    <div className={styles.modalContent}>
      <h2>Your Current Tier: {currentTier}</h2>
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
                  backgroundColor: isAchieved ? tier.color : '#f0f0f0',
                  width: progressWidth
                }}
              >
                <Icon className={styles.tierIcon} />
                <span className={styles.tierName}>{tier.name}</span>
                <span className={styles.tierScore}>{tier.minScore}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.currentScore}>
        Your Impact Score: {impactScore}
      </div>
      {nextTier && (
        <div className={styles.nextTier}>
          Points needed for {nextTier.name}: {pointsToNextTier}
        </div>
      )}
    </div>
  );
};

export default TierProgressModal;