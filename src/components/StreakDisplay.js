import React, { useState, useEffect } from 'react';
import { FaFire, FaShieldAlt, FaTrophy, FaCalendarAlt, FaSnowflake } from 'react-icons/fa';
import axios from 'axios';
import styles from './StreakDisplay.module.css';

const StreakDisplay = ({ compact = false }) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/daily-actions/streak`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStreakData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching streak data:', error);
      setLoading(false);
    }
  };

  const toggleWeekendMode = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/daily-actions/streak/toggle-weekend-mode`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh streak data
      fetchStreakData();
    } catch (error) {
      console.error('Error toggling weekend mode:', error);
    }
  };

  if (loading || !streakData) {
    return <div className={styles.loading}>Loading streak...</div>;
  }

  const { current, longest, protection, milestones, nextMilestone } = streakData;
  const streakIntensity = getStreakIntensity(current.days);

  if (compact) {
    return (
      <div className={styles.compactStreak} onClick={() => setShowDetails(!showDetails)}>
        <div className={styles.streakFlame} data-intensity={streakIntensity}>
          <FaFire />
          <span className={styles.streakNumber}>{current.days}</span>
        </div>
        <span className={styles.streakLabel}>day streak</span>
      </div>
    );
  }

  return (
    <div className={styles.streakContainer}>
      <div className={styles.mainStreak}>
        <div className={styles.currentStreakSection}>
          <div className={styles.streakFlame} data-intensity={streakIntensity}>
            <FaFire />
          </div>
          <div className={styles.streakInfo}>
            <h2 className={styles.streakDays}>{current.days}</h2>
            <p className={styles.streakText}>Day Streak</p>
            {current.startDate && (
              <p className={styles.streakDate}>
                Started {new Date(current.startDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className={styles.streakStats}>
          <div className={styles.statItem}>
            <FaTrophy className={styles.statIcon} />
            <div>
              <p className={styles.statValue}>{longest.days}</p>
              <p className={styles.statLabel}>Best Streak</p>
            </div>
          </div>
          <div className={styles.statItem}>
            <FaShieldAlt className={styles.statIcon} />
            <div>
              <p className={styles.statValue}>{protection.skipDaysAvailable}</p>
              <p className={styles.statLabel}>Skip Days</p>
            </div>
          </div>
        </div>
      </div>

      {nextMilestone && (
        <div className={styles.nextMilestone}>
          <div className={styles.milestoneProgress}>
            <div className={styles.milestoneHeader}>
              <FaCalendarAlt />
              <span>Next Milestone: {nextMilestone.days} days</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(current.days / nextMilestone.days) * 100}%` }}
              />
            </div>
            <p className={styles.milestoneReward}>
              {nextMilestone.daysRemaining} days to earn {nextMilestone.reward.points} points 
              and "{nextMilestone.reward.badge}" badge
            </p>
          </div>
        </div>
      )}

      <div className={styles.protectionSettings}>
        <button 
          className={`${styles.weekendModeToggle} ${protection.weekendModeEnabled ? styles.active : ''}`}
          onClick={toggleWeekendMode}
        >
          <FaSnowflake />
          <span>Weekend Mode</span>
          <span className={styles.toggleStatus}>
            {protection.weekendModeEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
        {protection.weekendModeEnabled && (
          <p className={styles.weekendModeInfo}>
            Reduced requirements on weekends to maintain your streak
          </p>
        )}
      </div>

      {milestones.length > 0 && (
        <div className={styles.achievedMilestones}>
          <h3>Achieved Milestones</h3>
          <div className={styles.milestonesList}>
            {milestones.map(milestone => (
              <div key={milestone.days} className={styles.milestoneItem}>
                <span className={styles.milestoneBadge}>{milestone.badge}</span>
                <span className={styles.milestoneDays}>{milestone.days} days</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {protection.canSkipToday && (
        <div className={styles.skipDayInfo}>
          <FaShieldAlt />
          <p>You can skip today and maintain your streak!</p>
        </div>
      )}
    </div>
  );
};

// Helper function to determine flame intensity based on streak length
function getStreakIntensity(days) {
  if (days >= 100) return 'blazing';
  if (days >= 30) return 'hot';
  if (days >= 7) return 'warm';
  return 'spark';
}

export default StreakDisplay;