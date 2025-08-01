import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaUserCircle, FaChartPie, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './PersonalImpactScore.module.css';

const tierColors = {
  Visionary: { start: '#F6E3BE', end: '#D4AF37', gap: '#FFF8E7' },
  Champion: { start: '#E0E0E0', end: '#A9A9A9', gap: '#F5F5F5' },
  Philanthropist: { start: '#E5C9A7', end: '#CD7F32', gap: '#F2E6D9' },
  Altruist: { start: '#A7E5C9', end: '#2ECC71', gap: '#D9F2E6' },
  Giver: { start: '#E5A7A7', end: '#E74C3C', gap: '#F2D9D9' }
};

const ConcentricRingsVisualization = ({ scoreDetails, totalScore, tier, tierColor }) => {
  const [animateRings, setAnimateRings] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateRings(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!scoreDetails) return null;

  const { donationScore = 0, volunteerScore = 0, fundraisingScore = 0 } = scoreDetails;
  
  // Ring configuration
  const rings = [
    { 
      name: 'Donations',
      score: donationScore,
      maxScore: 40,
      radius: 140,
      strokeWidth: 25,
      color: { start: '#5ecfb6', end: '#2d8f7b' }
    },
    { 
      name: 'Volunteering',
      score: volunteerScore,
      maxScore: 30,
      radius: 105,
      strokeWidth: 25,
      color: { start: '#4ebfa6', end: '#1d7f6b' }
    },
    { 
      name: 'Fundraising',
      score: fundraisingScore,
      maxScore: 20,
      radius: 70,
      strokeWidth: 25,
      color: { start: '#3eaf96', end: '#0d6f5b' }
    }
  ];

  const svgSize = 300;
  const center = svgSize / 2;

  return (
    <div className={`${styles.concentricRingsContainer} ${animateRings ? styles.animate : ''}`}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className={styles.ringsSvg}
      >
        <defs>
          {rings.map((ring, index) => (
            <linearGradient key={`gradient-${index}`} id={`ring-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ring.color.start} />
              <stop offset="100%" stopColor={ring.color.end} />
            </linearGradient>
          ))}
        </defs>
        
        {rings.map((ring, index) => {
          const percentage = (ring.score / ring.maxScore) * 100;
          const circumference = 2 * Math.PI * ring.radius;
          const strokeDashoffset = circumference - (percentage / 100) * circumference;
          
          return (
            <g key={index}>
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke="#f0f0f0"
                strokeWidth={ring.strokeWidth}
                opacity="0.3"
              />
              {/* Progress ring */}
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={`url(#ring-gradient-${index})`}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={animateRings ? strokeDashoffset : circumference}
                transform={`rotate(-90 ${center} ${center})`}
                className={styles.progressRing}
                style={{
                  transition: 'stroke-dashoffset 1.2s ease-out',
                  transitionDelay: `${index * 0.2}s`
                }}
              />
            </g>
          );
        })}
        
        {/* Center total score */}
        <g>
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            className={styles.centerScore}
            fill="#2d3748"
          >
            {totalScore}
          </text>
          <text
            x={center}
            y={center + 15}
            textAnchor="middle"
            className={styles.centerTier}
            fill={tierColor.end}
          >
            {tier}
          </text>
        </g>
      </svg>
      
      {/* Legend */}
      <div className={styles.ringsLegend}>
        {rings.map((ring, index) => (
          <div key={index} className={styles.legendItem}>
            <div 
              className={styles.legendDot} 
              style={{ background: `linear-gradient(135deg, ${ring.color.start}, ${ring.color.end})` }}
            />
            <span className={styles.legendText}>
              {ring.name}: {ring.score}/{ring.maxScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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

const PersonalImpactScore = ({ impactScore, scoreChange, tier, pointsToNextTier, isPublicProfile = false, onBackToDashboard }) => {
  const { user } = useAuth();
  const { scoreDetails } = useContext(ImpactContext);
  const tierColor = tierColors[tier] || { start: '#E5C9A7', end: '#CD7F32', gap: '#F2E6D9' };
  const [animate, setAnimate] = useState(false);
  const [viewMode, setViewMode] = useState('total'); // 'total' or 'breakdown'

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.mainContainer}>
      {/* Toggle button */}
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleButton} ${viewMode === 'total' ? styles.active : ''}`}
          onClick={() => setViewMode('total')}
          title="Total Score View"
        >
          <FaChartLine />
          <span>Total</span>
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'breakdown' ? styles.active : ''}`}
          onClick={() => setViewMode('breakdown')}
          title="Breakdown View"
        >
          <FaChartPie />
          <span>Breakdown</span>
        </button>
      </div>

      <div className={styles.contentRow}>
        <div className={`${styles.circleColumn} ${animate ? styles.animate : ''}`}>
          {viewMode === 'total' ? (
            <CircularProgressBar 
              score={impactScore} 
              pointsToNextTier={pointsToNextTier} 
              tier={tier} 
              scoreChange={scoreChange}
              color={tierColor}
            />
          ) : (
            <ConcentricRingsVisualization
              scoreDetails={scoreDetails}
              totalScore={impactScore}
              tier={tier}
              tierColor={tierColor}
            />
          )}
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
      
      {!isPublicProfile ? (
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
      ) : onBackToDashboard ? (
        <div className={`${styles.buttonRow} ${animate ? styles.animate : ''}`}>
          <button onClick={onBackToDashboard} className={styles.discoverButton}>
            Back to Dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PersonalImpactScore;