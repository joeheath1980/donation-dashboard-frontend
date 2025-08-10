import React, { useState, useEffect } from 'react';
import styles from './LiveActivityFeed.module.css';
import { 
  FaHeart, 
  FaHandHoldingHeart, 
  FaClock, 
  FaUser,
  FaChartLine,
  FaTrophy,
  FaBolt
} from 'react-icons/fa';

function LiveActivityFeed({ businessSlug }) {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    activeDonors: 45,
    todayTotal: 2500,
    currentStreak: 7
  });
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchRecentActivity();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      addNewActivity();
    }, 15000); // Add new activity every 15 seconds

    return () => clearInterval(interval);
  }, [businessSlug]);

  const fetchRecentActivity = async () => {
    try {
      // API call would go here
      // const response = await fetch(`/api/public/business/${businessSlug}/live-activity`);
      // const data = await response.json();
      
      // For demo, use mock data
      const mockActivities = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          type: 'match',
          amount: 50,
          multiplier: 2,
          category: 'Education',
          donorInitials: 'JD',
          anonymous: false
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: 'match',
          amount: 100,
          multiplier: 3,
          category: 'Health',
          donorInitials: 'SM',
          anonymous: false
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          type: 'milestone',
          milestone: '$10,000 reached for Clean Water Initiative',
          icon: 'trophy'
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'match',
          amount: 25,
          multiplier: 2,
          category: 'Environment',
          anonymous: true
        },
        {
          id: 5,
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          type: 'campaign',
          campaign: 'Holiday Giving Campaign launched',
          target: 50000
        }
      ];
      
      setActivities(mockActivities);
      setStats({
        activeDonors: 45,
        todayTotal: 2500,
        currentStreak: 7
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const addNewActivity = () => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date(),
      type: 'match',
      amount: Math.floor(Math.random() * 100) + 20,
      multiplier: Math.floor(Math.random() * 3) + 1,
      category: ['Education', 'Health', 'Environment', 'Community'][Math.floor(Math.random() * 4)],
      donorInitials: String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                      String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      anonymous: Math.random() > 0.7
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 10));
    setStats(prev => ({
      ...prev,
      todayTotal: prev.todayTotal + (newActivity.amount * newActivity.multiplier),
      activeDonors: prev.activeDonors + (Math.random() > 0.5 ? 1 : 0)
    }));
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Education: '#4CAF50',
      Health: '#2196F3',
      Environment: '#FF9800',
      Community: '#9C27B0',
      Animals: '#E91E63'
    };
    return colors[category] || '#607D8B';
  };

  const renderActivity = (activity) => {
    switch (activity.type) {
      case 'match':
        return (
          <div className={styles.activityItem} key={activity.id}>
            <div className={styles.activityIcon} style={{ background: getCategoryColor(activity.category) }}>
              <FaHandHoldingHeart />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityMain}>
                {activity.anonymous ? (
                  <span className={styles.anonymous}>Anonymous donor</span>
                ) : (
                  <span className={styles.donor}>
                    <span className={styles.donorAvatar}>{activity.donorInitials}</span>
                    {activity.donorInitials}
                  </span>
                )}
                <span className={styles.activityText}>
                  donated <strong>${activity.amount}</strong> to{' '}
                  <span className={styles.category} style={{ color: getCategoryColor(activity.category) }}>
                    {activity.category}
                  </span>
                </span>
              </div>
              <div className={styles.activityMeta}>
                <span className={styles.multiplier}>
                  {activity.multiplier}x match = ${activity.amount * activity.multiplier}
                </span>
                <span className={styles.timestamp}>
                  <FaClock /> {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        );
      
      case 'milestone':
        return (
          <div className={styles.activityItem} key={activity.id}>
            <div className={styles.activityIcon} style={{ background: '#FFD700' }}>
              <FaTrophy />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.milestoneText}>
                🎉 {activity.milestone}
              </div>
              <div className={styles.timestamp}>
                <FaClock /> {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          </div>
        );
      
      case 'campaign':
        return (
          <div className={styles.activityItem} key={activity.id}>
            <div className={styles.activityIcon} style={{ background: '#2d8f7b' }}>
              <FaBolt />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.campaignText}>
                📢 {activity.campaign}
              </div>
              {activity.target && (
                <div className={styles.campaignTarget}>
                  Target: ${activity.target.toLocaleString()}
                </div>
              )}
              <div className={styles.timestamp}>
                <FaClock /> {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>Live Activity</h3>
          {isLive && (
            <span className={styles.liveIndicator}>
              <span className={styles.liveDot}></span>
              LIVE
            </span>
          )}
        </div>
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <FaUser className={styles.statIcon} />
            <span className={styles.statValue}>{stats.activeDonors}</span>
            <span className={styles.statLabel}>Active Now</span>
          </div>
          <div className={styles.stat}>
            <FaHeart className={styles.statIcon} />
            <span className={styles.statValue}>${stats.todayTotal.toLocaleString()}</span>
            <span className={styles.statLabel}>Today</span>
          </div>
          <div className={styles.stat}>
            <FaChartLine className={styles.statIcon} />
            <span className={styles.statValue}>{stats.currentStreak}</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
        </div>
      </div>

      <div className={styles.feedContainer}>
        {activities.length === 0 ? (
          <div className={styles.emptyState}>
            <FaHeart className={styles.emptyIcon} />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className={styles.activityList}>
            {activities.map(activity => renderActivity(activity))}
          </div>
        )}
      </div>

      <div className={styles.poweredBy}>
        <span>Powered by</span>
        <strong>{stats.activeDonors} donors</strong>
        <span>making a difference</span>
      </div>
    </div>
  );
}

export default LiveActivityFeed;