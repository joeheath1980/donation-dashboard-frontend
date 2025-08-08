import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaPlus, FaChartPie, FaChartLine } from 'react-icons/fa';
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
  const [hoveredRing, setHoveredRing] = useState(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateRings(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!scoreDetails || !scoreDetails.breakdown) return null;

  // Use weighted scores from breakdown for proper visualization
  const { 
    donations: weightedDonationScore = 0,
    volunteering: weightedVolunteerScore = 0,
    fundraising: weightedFundraisingScore = 0,
    consistency: weightedConsistencyScore = 0,
    engagement: weightedEngagementScore = 0
  } = scoreDetails.breakdown;

  // Also get raw scores for tooltip display
  const { 
    donationScore = 0, 
    volunteerScore = 0, 
    fundraisingScore = 0,
    consistencyScore = 0,
    engagementScore = 0
  } = scoreDetails;
  
  // Ring configuration with 5 categories using weighted scores
  // Max scores are based on expected ranges for weighted contributions
  // Calculate dynamic max scores based on tier progression
  // Higher tiers should have more runway for growth
  const tierMultiplier = {
    'Giver': 1.0,
    'Altruist': 1.5,
    'Philanthropist': 2.0,
    'Champion': 3.0,
    'Visionary': 4.0
  }[tier] || 1.0;
  
  const rings = [
    { 
      name: 'Donations',
      score: Math.round(weightedDonationScore),
      rawScore: donationScore,
      maxScore: 600 * tierMultiplier, // Much higher ceiling for donations as the primary activity
      radius: 140,
      strokeWidth: 16,
      color: { start: '#4DD0E1', end: '#00ACC1' }, // Cyan/Teal
      bgColor: '#E0F7FA',
      weight: '30%'
    },
    { 
      name: 'Volunteering',
      score: Math.round(weightedVolunteerScore),
      rawScore: volunteerScore,
      maxScore: 400 * tierMultiplier, // Higher ceiling for volunteer activities
      radius: 115,
      strokeWidth: 16,
      color: { start: '#66BB6A', end: '#43A047' }, // Green
      bgColor: '#E8F5E9',
      weight: '25%'
    },
    { 
      name: 'Fundraising',
      score: Math.round(weightedFundraisingScore),
      rawScore: fundraisingScore,
      maxScore: 300 * tierMultiplier, // Higher ceiling for fundraising
      radius: 90,
      strokeWidth: 16,
      color: { start: '#AB47BC', end: '#8E24AA' }, // Purple
      bgColor: '#F3E5F5',
      weight: '20%'
    },
    { 
      name: 'Consistency',
      score: Math.round(weightedConsistencyScore),
      rawScore: consistencyScore,
      maxScore: 200 * tierMultiplier, // Higher ceiling for consistency
      radius: 65,
      strokeWidth: 16,
      color: { start: '#FF7043', end: '#F4511E' }, // Orange
      bgColor: '#FBE9E7',
      weight: '15%'
    },
    { 
      name: 'Engagement',
      score: Math.round(weightedEngagementScore),
      rawScore: engagementScore,
      maxScore: 150 * tierMultiplier, // Higher ceiling for engagement
      radius: 40,
      strokeWidth: 16,
      color: { start: '#FFD54F', end: '#FFB300' }, // Amber
      bgColor: '#FFF8E1',
      weight: '10%'
    }
  ];

  const svgSize = 320;
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
            <React.Fragment key={`defs-${index}`}>
              <linearGradient id={`ring-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ring.color.start} />
                <stop offset="100%" stopColor={ring.color.end} />
              </linearGradient>
              {/* Add glow filter for active portions */}
              <filter id={`glow-${index}`}>
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </React.Fragment>
          ))}
        </defs>
        
        {rings.map((ring, index) => {
          // Cap percentage at 100% to prevent overflow
          const percentage = Math.min((ring.score / ring.maxScore) * 100, 100);
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
                stroke={ring.bgColor}
                strokeWidth={ring.strokeWidth}
                opacity={hoveredRing !== null && hoveredRing !== index ? "0.3" : "0.5"}
                className={styles.bgRing}
                style={{
                  transition: 'opacity 0.3s ease'
                }}
              />
              {/* Progress ring */}
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={`url(#ring-gradient-${index})`}
                strokeWidth={hoveredRing === index ? ring.strokeWidth + 2 : ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                strokeDashoffset="0"
                transform={`rotate(-90 ${center} ${center})`}
                filter={hoveredRing === index ? `url(#glow-${index})` : 'none'}
                className={styles.progressRing}
                data-ring-index={index}
                onMouseEnter={() => setHoveredRing(index)}
                onMouseLeave={() => setHoveredRing(null)}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: animateRings ? `${index * 0.15}s` : '0s',
                  opacity: hoveredRing !== null && hoveredRing !== index ? 0.7 : 1,
                  filter: hoveredRing === index ? 'brightness(1.1)' : 'none',
                  strokeDasharray: animateRings ? `${(percentage / 100) * circumference} ${circumference}` : `0 ${circumference}`
                }}
              />
              {/* Invisible hover area for empty rings */}
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke="transparent"
                strokeWidth={ring.strokeWidth + 10}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredRing(index)}
                onMouseLeave={() => setHoveredRing(null)}
              />
            </g>
          );
        })}
        
        {/* Center total score */}
        <g>
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            className={styles.centerScore}
            fill="#475569"
          >
            {totalScore}
          </text>
          <line
            x1={center - 25}
            x2={center + 25}
            y1={center + 4}
            y2={center + 4}
            stroke="#e2e8f0"
            strokeWidth="1"
            opacity="0.6"
          />
          <text
            x={center}
            y={center + 22}
            textAnchor="middle"
            className={styles.centerTier}
            fill={tierColor.end}
          >
            {tier}
          </text>
        </g>
      </svg>
      
      {/* Hover tooltip */}
      {hoveredRing !== null && (
        <div 
          className={styles.ringTooltip}
          style={{
            '--ring-color': rings[hoveredRing].color.end,
            left: '50%',
            bottom: '-80px', // Position below the rings
            transform: 'translateX(-50%)' // Center horizontally
          }}
        >
          <div className={styles.tooltipHeader}>{rings[hoveredRing].name}</div>
          {rings[hoveredRing].score > 0 ? (
            <>
              <div className={styles.tooltipScore}>
                Weighted: {rings[hoveredRing].score} points
              </div>
              <div className={styles.tooltipScore} style={{fontSize: '0.9em', opacity: 0.8}}>
                Raw: {rings[hoveredRing].rawScore} × {rings[hoveredRing].weight}
              </div>
              <div className={styles.tooltipPercentage}>
                {rings[hoveredRing].score >= rings[hoveredRing].maxScore ? (
                  <span style={{color: '#4CAF50', fontWeight: 'bold'}}>
                    Exceptional! ({Math.round((rings[hoveredRing].score / rings[hoveredRing].maxScore) * 100)}%)
                  </span>
                ) : (
                  <>
                    {Math.round((rings[hoveredRing].score / rings[hoveredRing].maxScore) * 100)}% progress
                    <div style={{fontSize: '0.85em', opacity: 0.7, marginTop: '2px'}}>
                      {Math.round(rings[hoveredRing].maxScore - rings[hoveredRing].score)} points to fill
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className={styles.tooltipEmpty}>
              <div className={styles.tooltipScore}>No activity yet</div>
              <div className={styles.tooltipHint}>
                {rings[hoveredRing].name === 'Donations' && 'Start with a micro-donation of any amount!'}
                {rings[hoveredRing].name === 'Volunteering' && 'Log your volunteer hours to earn points'}
                {rings[hoveredRing].name === 'Fundraising' && 'Create a campaign or organise an event'}
                {rings[hoveredRing].name === 'Consistency' && 'Build daily giving habits to earn streaks'}
                {rings[hoveredRing].name === 'Engagement' && 'Complete your profile and follow charities'}
              </div>
              <div className={styles.tooltipWeight}>Worth {rings[hoveredRing].weight} of total score</div>
            </div>
          )}
        </div>
      )}
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
          strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
          strokeDashoffset="0"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dasharray 1.2s ease-out',
            strokeDasharray: animateCircle ? `${(percentage / 100) * circumference} ${circumference}` : `0 ${circumference}`,
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

const PersonalImpactScore = ({ impactScore, scoreChange, tier, pointsToNextTier, isPublicProfile = false, onBackToDashboard, onAddContributions }) => {
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
          {onAddContributions && (
            <button onClick={onAddContributions} className={styles.discoverButton}>
              <FaPlus /> Add Your Contributions
            </button>
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