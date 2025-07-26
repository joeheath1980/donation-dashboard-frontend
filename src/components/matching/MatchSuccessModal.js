import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  FaTwitter, 
  FaFacebook, 
  FaLinkedin, 
  FaEnvelope,
  FaTimes,
  FaShare
} from 'react-icons/fa';
import styles from './MatchSuccessModal.module.css';

const MatchSuccessModal = ({ donation, matches, onClose, onFindNext }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const totalImpact = donation.amount + matches.reduce((sum, m) => sum + m.matchAmount, 0);

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#10B981', '#F59E0B']
    });

    // Show breakdown after initial animation
    const timer = setTimeout(() => setShowBreakdown(true), 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async (platform) => {
    const message = `I just donated $${donation.amount} to ${donation.charityName} and it was matched ${matches[0].multiplier}x by ${matches[0].businessName}! Total impact: $${totalImpact}. Join me in making a difference!`;
    const url = window.location.origin;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}&hashtags=DoNation,CharityMatch,MakeADifference`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(message)}`,
          '_blank'
        );
        break;
      case 'email':
        window.location.href = `mailto:?subject=I just made a matched donation!&body=${encodeURIComponent(message + '\n\n' + url)}`;
        break;
    }
    
    setShowShareMenu(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.modalOverlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>

          {/* Success Header */}
          <div className={styles.header}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={styles.successIcon}
            >
              🎉
            </motion.div>
            <h2 className={styles.title}>
              Your Donation Was Matched!
            </h2>
          </div>

          {/* Animated Multiplication Effect */}
          <div className={styles.impactSection}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={styles.calculation}
            >
              <div className={styles.calculationRow}>
                <span className={styles.amount}>${donation.amount}</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className={styles.operator}
                >
                  ×
                </motion.span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className={styles.multiplier}
                >
                  {matches[0].multiplier}
                </motion.span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1 }}
                  className={styles.operator}
                >
                  =
                </motion.span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.2 }}
                  transition={{ delay: 1.3, type: "spring" }}
                  className={styles.totalAmount}
                >
                  ${totalImpact}
                </motion.span>
              </div>
              <p className={styles.impactLabel}>Total Impact</p>
            </motion.div>

            {/* Breakdown */}
            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={styles.breakdown}
                >
                  <div className={styles.breakdownItem}>
                    <span>Your donation:</span>
                    <span className={styles.breakdownAmount}>${donation.amount}</span>
                  </div>
                  {matches.map((match, index) => (
                    <div key={index} className={styles.breakdownItem}>
                      <span>{match.businessName} matched:</span>
                      <span className={styles.matchedAmount}>+${match.matchAmount}</span>
                    </div>
                  ))}
                  <div className={styles.breakdownTotal}>
                    <span>Total to {donation.charityName}:</span>
                    <span className={styles.totalBreakdownAmount}>${totalImpact}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Business Thank You */}
          {matches[0].thankYouMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className={styles.thankYouMessage}
            >
              <p>"{matches[0].thankYouMessage}"</p>
              <p className={styles.businessName}>- {matches[0].businessName}</p>
            </motion.div>
          )}

          {/* Share Section */}
          <div className={styles.shareSection}>
            <button 
              className={styles.shareButton}
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <FaShare /> Share Your Impact
            </button>
            
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.shareMenu}
                >
                  <ShareButton 
                    platform="twitter" 
                    onClick={() => handleShare('twitter')}
                    icon={<FaTwitter />}
                    label="Twitter"
                  />
                  <ShareButton 
                    platform="facebook" 
                    onClick={() => handleShare('facebook')}
                    icon={<FaFacebook />}
                    label="Facebook"
                  />
                  <ShareButton 
                    platform="linkedin" 
                    onClick={() => handleShare('linkedin')}
                    icon={<FaLinkedin />}
                    label="LinkedIn"
                  />
                  <ShareButton 
                    platform="email" 
                    onClick={() => handleShare('email')}
                    icon={<FaEnvelope />}
                    label="Email"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              onClick={onClose}
              className={styles.secondaryButton}
            >
              View Dashboard
            </button>
            <button
              onClick={onFindNext}
              className={styles.primaryButton}
            >
              Find Next Match
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ShareButton = ({ platform, onClick, icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={styles.shareOption}
    aria-label={`Share on ${label}`}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

export default MatchSuccessModal;