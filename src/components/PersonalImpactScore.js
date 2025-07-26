import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import styles from './PersonalImpactScore.module.css';

const tierColors = {
  Visionary: { start: '#F6E3BE', end: '#D4AF37', gap: '#FFF8E7' },
  Champion: { start: '#E0E0E0', end: '#A9A9A9', gap: '#F5F5F5' },
  Philanthropist: { start: '#E5C9A7', end: '#CD7F32', gap: '#F2E6D9' },
  Altruist: { start: '#A7E5C9', end: '#2ECC71', gap: '#D9F2E6' },
  Giver: { start: '#E5A7A7', end: '#E74C3C', gap: '#F2D9D9' }
};

const CircularProgressBar = ({ score, pointsToNextTier, tier, scoreChange, color }) => {
  const [showCircleTooltip, setShowCircleTooltip] = useState(false);
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);
  const [animateCircle, setAnimateCircle] = useState(false);
  const percentage = ((100 - pointsToNextTier) / 100) * 100;
  const radius = 150;
  const strokeWidth = 30;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gradientId = `gradient-${tier}`;
  const isPositiveChange = scoreChange > 0;

  // Add animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCircle(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`${styles.circularProgressBar} ${showScoreTooltip ? styles.scoreHovered : ''} ${animateCircle ? styles.animate : ''}`}
      onMouseEnter={() => setShowCircleTooltip(true)}
      onMouseLeave={() => setShowCircleTooltip(false)}
    >
      <svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.start} />
            <stop offset="100%" stopColor={color.end} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          className={styles.backgroundCircle}
          stroke={color.gap}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
        {/* Progress circle */}
        <circle
          className={styles.progressCircle}
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset: animateCircle ? strokeDashoffset : circumference,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 1.2s ease-out',
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.scoreContent}>
        <div 
          className={`${styles.scoreValueWrapper} ${showScoreTooltip ? styles.hovered : ''}`}
          onMouseEnter={() => setShowScoreTooltip(true)}
          onMouseLeave={() => setShowScoreTooltip(false)}
        >
          <div className={styles.scoreValue}>
            {score}
          </div>
          <div className={styles.scoreChange}>
            <span className={styles.scoreChangeIcon}>
              {isPositiveChange ? <FaArrowUp /> : <FaArrowDown />}
            </span>
          </div>
        </div>
        <div className={styles.tierName} style={{ color: color.end }}>
          {tier}
        </div>
      </div>
      {showCircleTooltip && !showScoreTooltip && (
        <div className={`${styles.tooltip} ${styles.circleTooltip}`}>
          {pointsToNextTier} points to next tier
        </div>
      )}
      {showScoreTooltip && (
        <div className={`${styles.tooltip} ${styles.scoreTooltip}`}>
          {isPositiveChange ? '+' : ''}{scoreChange} since last year
        </div>
      )}
    </div>
  );
};

const PersonalImpactScore = ({ impactScore, scoreChange, tier, pointsToNextTier }) => {
  const { user } = useAuth();
  const tierColor = tierColors[tier] || { start: '#E5C9A7', end: '#CD7F32', gap: '#F2E6D9' };
  const [animate, setAnimate] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentRow}>
        <div className={`${styles.circleColumn} ${animate ? styles.animate : ''}`}>
          <CircularProgressBar 
            score={impactScore} 
            pointsToNextTier={pointsToNextTier} 
            tier={tier} 
            scoreChange={scoreChange}
            color={tierColor}
          />
        </div>
        
        <div className={`${styles.headerColumn} ${animate ? styles.animate : ''}`}>
          <div className={styles.headerWrap}>
            <h1 className={styles.impactScoreHeader}>
              <span className={styles.impactWord}>IMPACT</span>
              <span className={styles.scoreWord}>SCORE</span>
            </h1>
            <div className={styles.headerUnderline}></div>
          </div>
        </div>
      </div>
      
      <div className={`${styles.buttonRow} ${animate ? styles.animate : ''}`}>
        <Link to="/activity" className={styles.discoverButton}>
          Discover Your Contributions
        </Link>
        {user && user._id && (
          <Link to={`/profile/${user._id}`} className={styles.profileButton}>
            <FaUserCircle /> View Public Profile
          </Link>
        )}
      </div>
    </div>
  );
};

export default PersonalImpactScore;