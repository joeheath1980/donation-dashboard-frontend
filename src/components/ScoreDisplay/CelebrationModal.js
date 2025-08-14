import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  FaTrophy, 
  FaStar, 
  FaMedal,
  FaCrown,
  FaGem,
  FaFireAlt
} from 'react-icons/fa';
import styles from './CelebrationModal.module.css';

const CelebrationModal = ({ isOpen, onClose, celebrationData }) => {
  useEffect(() => {
    if (isOpen && celebrationData) {
      triggerConfetti();
    }
  }, [isOpen, celebrationData]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Shoot confetti from both sides
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  };

  if (!isOpen || !celebrationData) return null;

  const getMilestoneIcon = () => {
    const { type, tier } = celebrationData;
    
    if (type === 'tier_upgrade') {
      switch (tier) {
        case 'Silver': return <FaStar className={styles.milestoneIcon} />;
        case 'Gold': return <FaCrown className={styles.milestoneIcon} />;
        case 'Platinum': return <FaGem className={styles.milestoneIcon} />;
        default: return <FaMedal className={styles.milestoneIcon} />;
      }
    }
    
    if (type === 'score_milestone') {
      return <FaTrophy className={styles.milestoneIcon} />;
    }
    
    if (type === 'streak') {
      return <FaFireAlt className={styles.milestoneIcon} />;
    }
    
    return <FaStar className={styles.milestoneIcon} />;
  };

  const getTierColor = (tier) => {
    const colors = {
      Bronze: '#CD7F32',
      Silver: '#C0C0C0',
      Gold: '#FFD700',
      Platinum: '#E5E4E2'
    };
    return colors[tier] || '#4CAF50';
  };

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalContent}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.celebrationHeader}>
          {getMilestoneIcon()}
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {celebrationData.title || 'Congratulations!'}
          </motion.h2>
        </div>

        <motion.p
          className={styles.celebrationMessage}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {celebrationData.message || 'You\'ve reached a new milestone!'}
        </motion.p>

        {celebrationData.type === 'tier_upgrade' && (
          <motion.div
            className={styles.tierUpgrade}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <div 
              className={styles.newTierBadge}
              data-tier-color={getTierColor(celebrationData.tier)} className="bg-tier"
            >
              <span className={styles.tierEmoji}>
                {celebrationData.tier === 'Silver' && '🥈'}
                {celebrationData.tier === 'Gold' && '🥇'}
                {celebrationData.tier === 'Platinum' && '💎'}
              </span>
              <span className={styles.tierText}>{celebrationData.tier} Tier</span>
            </div>
          </motion.div>
        )}

        {celebrationData.rewards && celebrationData.rewards.length > 0 && (
          <motion.div
            className={styles.rewards}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3>🎁 Rewards Unlocked:</h3>
            <ul>
              {celebrationData.rewards.map((reward, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  {reward}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.button
          className={styles.celebrationButton}
          onClick={onClose}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Awesome! 🎉
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CelebrationModal;