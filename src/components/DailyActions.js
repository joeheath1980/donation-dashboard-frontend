import React, { useState, useEffect } from 'react';
import { FaSun, FaSearch, FaShareAlt, FaVoteYea, FaBookOpen, FaCheck, FaLock, FaFire } from 'react-icons/fa';
import axios from 'axios';
import styles from './DailyActions.module.css';

const DailyActions = ({ onPointsEarned }) => {
  const [todayActions, setTodayActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [animatingAction, setAnimatingAction] = useState(null);

  const actionConfig = [
    {
      id: 'morningCheckIn',
      title: 'Morning Check-In',
      description: 'Start your day with intention',
      icon: FaSun,
      color: '#FFB74D',
      endpoint: '/api/daily-actions/morning-check-in'
    },
    {
      id: 'microMatchBrowse',
      title: 'Browse Matches',
      description: 'Discover today\'s giving opportunities',
      icon: FaSearch,
      color: '#4FC3F7',
      endpoint: '/api/daily-actions/browse-matches'
    },
    {
      id: 'shareProgress',
      title: 'Share Progress',
      description: 'Inspire others with your impact',
      icon: FaShareAlt,
      color: '#81C784',
      endpoint: '/api/daily-actions/share-progress'
    },
    {
      id: 'communityVote',
      title: 'Community Vote',
      description: 'Help choose featured charities',
      icon: FaVoteYea,
      color: '#BA68C8',
      endpoint: '/api/daily-actions/community-vote'
    },
    {
      id: 'impactStory',
      title: 'Read Impact Story',
      description: 'See how donations make a difference',
      icon: FaBookOpen,
      color: '#FF8A65',
      endpoint: '/api/daily-actions/impact-story'
    }
  ];

  useEffect(() => {
    fetchTodayActions();
  }, []);

  const fetchTodayActions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/daily-actions/today`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTodayActions(response.data.actions);
      setStreak(response.data.streak.current);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching daily actions:', error);
      setLoading(false);
    }
  };

  const completeAction = async (action) => {
    if (todayActions[action.id]?.completed) return;

    setAnimatingAction(action.id);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}${action.endpoint}`,
        action.id === 'shareProgress' ? { platform: 'twitter' } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setTodayActions(prev => ({
        ...prev,
        [action.id]: {
          ...prev[action.id],
          completed: true,
          completedAt: new Date()
        }
      }));

      // Update streak if changed
      if (response.data.streak) {
        setStreak(response.data.streak);
      }

      // Notify parent of points earned
      if (onPointsEarned && response.data.points) {
        onPointsEarned(response.data.points);
      }

      // Show success animation
      setTimeout(() => {
        setAnimatingAction(null);
      }, 1000);

    } catch (error) {
      console.error(`Error completing ${action.id}:`, error);
      setAnimatingAction(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  const completedCount = todayActions ? 
    Object.values(todayActions).filter(a => a.completed).length : 0;
  const totalPossiblePoints = 12; // Sum of all action points

  return (
    <div className={styles.dailyActionsContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Daily Actions</h2>
          <div className={styles.streakBadge}>
            <FaFire className={styles.streakIcon} />
            <span>{streak} day streak</span>
          </div>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(completedCount / actionConfig.length) * 100}%` }}
          />
        </div>
        <p className={styles.subtitle}>
          {completedCount}/{actionConfig.length} completed • {totalPossiblePoints} points possible today
        </p>
      </div>

      <div className={styles.actionsGrid}>
        {actionConfig.map(action => {
          const actionData = todayActions?.[action.id];
          const isCompleted = actionData?.completed;
          const isAnimating = animatingAction === action.id;

          return (
            <button
              key={action.id}
              className={`${styles.actionCard} ${isCompleted ? styles.completed : ''} ${isAnimating ? styles.animating : ''}`}
              onClick={() => completeAction(action)}
              disabled={isCompleted}
              style={{ '--action-color': action.color }}
            >
              <div className={styles.actionIcon}>
                {isCompleted ? (
                  <FaCheck className={styles.checkIcon} />
                ) : (
                  <action.icon />
                )}
              </div>
              <h3 className={styles.actionTitle}>{action.title}</h3>
              <p className={styles.actionDescription}>{action.description}</p>
              <div className={styles.actionPoints}>
                {actionData?.points || 0} points
              </div>
              {isCompleted && (
                <div className={styles.completedOverlay}>
                  <FaCheck className={styles.bigCheck} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {completedCount === actionConfig.length && (
        <div className={styles.allCompleteMessage}>
          🎉 All daily actions completed! Come back tomorrow for more.
        </div>
      )}
    </div>
  );
};

export default DailyActions;