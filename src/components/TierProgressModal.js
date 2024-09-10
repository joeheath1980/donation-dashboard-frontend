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

const TierProgressModal = ({ currentTier, impactScore, onClose }) => {
  const currentTierIndex = tiers.findIndex(tier => tier.name === currentTier);
  const nextTier = tiers[currentTierIndex - 1]; // Note: tiers are in descending order
  const pointsToNextTier = nextTier ? nextTier.minScore - impactScore : 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Your Current Tier: {currentTier}</h2>
        <div className={styles.tierProgress}>
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`${styles.tierBar} ${index >= currentTierIndex ? styles.achieved : ''}`}
                style={{ backgroundColor: index >= currentTierIndex ? tier.color : '#f0f0f0' }}
              >
                <Icon className={styles.tierIcon} />
                <span className={styles.tierName}>{tier.name}</span>
                <span className={styles.tierScore}>{tier.minScore}</span>
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
    </div>
  );
};

export default TierProgressModal;