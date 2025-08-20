import React, { useState, useEffect } from 'react';
import { FaTrophy, FaLock, FaStar, FaFire, FaCoffee, FaBus, FaHeart } from 'react-icons/fa';
import axios from 'axios';
import { SecureTokenStorage } from '../utils/auth.utils';
import styles from './AchievementShowcase.module.css';

const AchievementShowcase = ({ userId, compact = false }) => {
  const [achievements, setAchievements] = useState({
    earned: [],
    inProgress: [],
    locked: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(null);

  // Icon mapping for achievements
  const iconMap = {
    trophy: FaTrophy,
    star: FaStar,
    fire: FaFire,
    coffee: FaCoffee,
    bus: FaBus,
    heart: FaHeart,
    // Add more icons as needed
  };

  const categories = [
    { id: 'all', label: 'All', color: '#6b7280' },
    { id: 'micro-giving', label: 'Micro Giving', color: '#3b82f6' },
    { id: 'consistency', label: 'Consistency', color: '#10b981' },
    { id: 'impact', label: 'Impact', color: '#f59e0b' },
    { id: 'social', label: 'Social', color: '#8b5cf6' },
    { id: 'special', label: 'Special', color: '#ef4444' }
  ];

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      const token = SecureTokenStorage.getToken();
      const endpoint = userId 
        ? `/api/achievements/showcase/${userId}`
        : '/api/achievements/progress';
        
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}${endpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (userId) {
        // Showcase mode - only earned achievements
        setAchievements({ earned: response.data, inProgress: [], locked: [] });
      } else {
        // Full progress mode
        setAchievements(response.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E5E5',
      diamond: '#B9F2FF'
    };
    return colors[tier] || '#6b7280';
  };

  const filteredAchievements = () => {
    if (selectedCategory === 'all') {
      return achievements;
    }
    
    return {
      earned: achievements.earned.filter(a => 
        a.achievement?.category === selectedCategory || a.category === selectedCategory
      ),
      inProgress: achievements.inProgress.filter(a => 
        a.achievement?.category === selectedCategory
      ),
      locked: achievements.locked.filter(a => 
        a.category === selectedCategory
      )
    };
  };

  const renderAchievement = (achievement, status = 'earned') => {
    const isEarned = status === 'earned';
    const achievementData = achievement.achievement || achievement;
    const Icon = iconMap[achievementData.icon] || FaTrophy;
    
    return (
      <div
        key={achievementData._id}
        className={`${styles.achievementCard} ${styles[status]} ${styles[`tier-${achievementData.tier}`]} ${status === 'locked' ? styles.locked : ''}`}
        onClick={() => setShowDetails(achievement)}
      >
        <div className={styles.iconWrapper}>
          <Icon className={styles.icon} />
          {status === 'locked' && (
            <FaLock className={styles.lockIcon} />
          )}
        </div>
        
        <h3 className={styles.achievementName}>{achievementData.name}</h3>
        <p className={styles.achievementDescription}>{achievementData.description}</p>
        
        {status === 'inProgress' && achievement.progress && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${achievement.progress.percentage}%` }}
            />
            <span className={styles.progressText}>
              {achievement.progress.current}/{achievement.progress.target}
            </span>
          </div>
        )}
        
        {isEarned && (
          <div className={styles.earnedDate}>
            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
          </div>
        )}
        
        <div className={`${styles.tierBadge} ${styles[achievementData.tier]}`}>
          {achievementData.tier}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading achievements...</div>;
  }

  if (compact) {
    // Compact showcase for profiles
    const topAchievements = achievements.earned.slice(0, 6);
    
    return (
      <div className={styles.compactShowcase}>
        <h3 className={styles.showcaseTitle}>Achievements</h3>
        <div className={styles.compactGrid}>
          {topAchievements.map(achievement => {
            const achievementData = achievement.achievement || achievement;
            const Icon = iconMap[achievementData.icon] || FaTrophy;
            
            return (
              <div
                key={achievement._id}
                className={styles.compactAchievement}
                title={achievementData.name}
                data-tier-color={getTierColor(achievementData.tier)}
              >
                <Icon />
              </div>
            );
          })}
        </div>
        {achievements.earned.length > 6 && (
          <p className={styles.moreText}>+{achievements.earned.length - 6} more</p>
        )}
      </div>
    );
  }

  const filtered = filteredAchievements();

  return (
    <div className={styles.achievementsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Achievements</h2>
        <div className={styles.stats}>
          <span>{achievements.earned.length} earned</span>
          <span>{achievements.inProgress.length} in progress</span>
          <span>{achievements.locked.length} locked</span>
        </div>
      </div>

      <div className={styles.categoryFilter}>
        {categories.map(category => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${styles[`category-${category.id}`]} ${selectedCategory === category.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.achievementsGrid}>
        {filtered.earned.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Earned</h3>
            <div className={styles.grid}>
              {filtered.earned.map(achievement => renderAchievement(achievement, 'earned'))}
            </div>
          </div>
        )}

        {filtered.inProgress.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>In Progress</h3>
            <div className={styles.grid}>
              {filtered.inProgress.map(item => renderAchievement(item, 'inProgress'))}
            </div>
          </div>
        )}

        {filtered.locked.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Locked</h3>
            <div className={styles.grid}>
              {filtered.locked.map(achievement => renderAchievement(achievement, 'locked'))}
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className={styles.detailsModal} onClick={() => setShowDetails(null)}>
          <div className={styles.detailsContent} onClick={e => e.stopPropagation()}>
            {/* Achievement details modal content */}
            <button className={styles.closeButton} onClick={() => setShowDetails(null)}>×</button>
            <h2>{showDetails.achievement?.name || showDetails.name}</h2>
            <p>{showDetails.achievement?.description || showDetails.description}</p>
            {showDetails.earnedAt && (
              <p>Earned on {new Date(showDetails.earnedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementShowcase;
