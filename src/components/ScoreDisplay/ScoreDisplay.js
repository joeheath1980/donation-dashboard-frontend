import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaTrophy, 
  FaMedal, 
  FaFire,
  FaChartLine,
  FaStar,
  FaGift
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import io from 'socket.io-client';
import { SecureTokenStorage } from '../../utils/auth.utils';
import styles from './ScoreDisplay.module.css';
import { apiClient } from '../../services/api.service';
import CelebrationModal from './CelebrationModal';

const ScoreDisplay = () => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [tier, setTier] = useState('Bronze');
  const [nextTier, setNextTier] = useState('Silver');
  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const [recentUpdate, setRecentUpdate] = useState(null);
  const socketRef = useRef(null);
  const animationRef = useRef(null);

  // Tier thresholds
  const tierThresholds = {
    Bronze: { min: 0, max: 999, color: '#CD7F32', icon: '🥉' },
    Silver: { min: 1000, max: 4999, color: '#C0C0C0', icon: '🥈' },
    Gold: { min: 5000, max: 9999, color: '#FFD700', icon: '🥇' },
    Platinum: { min: 10000, max: Infinity, color: '#E5E4E2', icon: '💎' }
  };

  useEffect(() => {
    fetchCurrentScore();
    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [user]);

  const fetchCurrentScore = async () => {
    try {
      const response = await apiClient.get('/users/score');
      const { score, tier, badges } = response.data;
      setScore(score);
      setDisplayScore(score);
      setTier(tier);
      updateTierProgress(score);
    } catch (error) {
      console.error('Error fetching score:', error);
    }
  };

  const setupWebSocket = () => {
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || process.env.REACT_APP_API_URL || 'http://localhost:3002';
    socketRef.current = io(wsUrl, {
      auth: {
        token: SecureTokenStorage.getToken()
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socketRef.current.on('scoreUpdate', (data) => {
      handleScoreUpdate(data);
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  };

  const handleScoreUpdate = (data) => {
    const { newScore, oldScore, reason, milestone } = data;
    
    // Animate score change
    animateScore(oldScore || displayScore, newScore);
    
    // Show recent update notification
    setRecentUpdate({
      amount: newScore - (oldScore || displayScore),
      reason: reason || 'New donation processed'
    });
    
    setTimeout(() => setRecentUpdate(null), 5000);

    // Check for milestones
    if (milestone) {
      handleMilestone(milestone);
    }

    // Update tier progress
    updateTierProgress(newScore);
  };

  const animateScore = (from, to) => {
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentScore = Math.round(from + (to - from) * easeOutQuart);
      
      setDisplayScore(currentScore);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setScore(to);
      }
    };
    
    animate();
  };

  const updateTierProgress = (currentScore) => {
    const currentTierData = Object.entries(tierThresholds).find(
      ([tierName, data]) => currentScore >= data.min && currentScore <= data.max
    );

    if (currentTierData) {
      const [tierName, data] = currentTierData;
      setTier(tierName);

      // Calculate progress to next tier
      if (tierName !== 'Platinum') {
        const nextTierEntry = Object.entries(tierThresholds).find(
          ([_, nextData]) => nextData.min > data.max
        );
        
        if (nextTierEntry) {
          const [nextTierName, nextData] = nextTierEntry;
          setNextTier(nextTierName);
          const progressPercent = 
            ((currentScore - data.min) / (nextData.min - data.min)) * 100;
          setProgress(Math.min(progressPercent, 100));
        }
      } else {
        setNextTier(null);
        setProgress(100);
      }
    }
  };

  const handleMilestone = (milestone) => {
    setCelebrationData(milestone);
    setShowCelebration(true);
  };

  const formatScore = (score) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(score);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.scoreCard}>
          <div className={styles.header}>
            <h3>
              <FaTrophy className={styles.icon} />
              Your Giving Score
            </h3>
            {recentUpdate && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.recentUpdate}
              >
                <FaChartLine />
                +{recentUpdate.amount} points
                <span className={styles.updateReason}>{recentUpdate.reason}</span>
              </motion.div>
            )}
          </div>

          <div className={styles.scoreSection}>
            <motion.div 
              className={styles.scoreValue}
              key={displayScore}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {formatScore(displayScore)}
            </motion.div>
            <div className={styles.points}>points</div>
          </div>

          <div className={styles.tierSection}>
            <div className={styles.tierBadge} style={{ 
              backgroundColor: tierThresholds[tier].color,
              boxShadow: `0 0 20px ${tierThresholds[tier].color}40`
            }}>
              <span className={styles.tierIcon}>{tierThresholds[tier].icon}</span>
              <span className={styles.tierName}>{tier}</span>
            </div>
          </div>

          {nextTier && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Progress to {nextTier}</span>
                <span className={styles.progressPercent}>{Math.round(progress)}%</span>
              </div>
              <div className={styles.progressBar}>
                <motion.div 
                  className={styles.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    background: `linear-gradient(90deg, ${tierThresholds[tier].color}, ${tierThresholds[nextTier].color})`
                  }}
                />
              </div>
              <div className={styles.progressInfo}>
                {tierThresholds[nextTier].min - score} points to {nextTier}
              </div>
            </div>
          )}

          <div className={styles.achievements}>
            <h4>
              <FaMedal /> Recent Achievements
            </h4>
            <div className={styles.achievementList}>
              <div className={styles.achievement}>
                <FaStar className={styles.achievementIcon} />
                <span>First Donation</span>
              </div>
              <div className={styles.achievement}>
                <FaFire className={styles.achievementIcon} />
                <span>7-Day Streak</span>
              </div>
              <div className={styles.achievement}>
                <FaGift className={styles.achievementIcon} />
                <span>Matched $100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <CelebrationModal
            isOpen={showCelebration}
            onClose={() => setShowCelebration(false)}
            celebrationData={celebrationData}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ScoreDisplay;
