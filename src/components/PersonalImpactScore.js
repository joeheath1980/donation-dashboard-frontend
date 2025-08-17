import React, { useState, useEffect, useContext } from 'react';
import { DynamicWidth, ProgressBar, DynamicGradient } from './DynamicStyleManager';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaPlus, FaChartPie, FaChartLine, FaUserCircle, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './PersonalImpactScore.module.css';
import '../styles/dynamic-styles.css';

const tierColors = {
  Visionary: { start: '#F6E3BE', end: '#D4AF37', gap: '#FFF8E7' },
  Champion: { start: '#E0E0E0', end: '#A9A9A9', gap: '#F5F5F5' },
  Philanthropist: { start: '#E5C9A7', end: '#CD7F32', gap: '#F2E6D9' },
  Altruist: { start: '#A7E5C9', end: '#2ECC71', gap: '#D9F2E6' },
  Giver: { start: '#E5A7A7', end: '#E74C3C', gap: '#F2D9D9' }
};

const ConcentricRingsVisualization = ({ scoreDetails, totalScore, tier, tierColor, pointsToNextTier }) => {
  const [animateRings, setAnimateRings] = useState(false);
  const [hoveredRing, setHoveredRing] = useState(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateRings(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!scoreDetails || !scoreDetails.breakdown) return null;

  // Get the tier multiplier from scoreDetails
  const multiplier = scoreDetails.multiplier || 1.0;

  // Use weighted scores from breakdown and apply multiplier to match total score
  const { 
    donations: baseWeightedDonationScore = 0,
    volunteering: baseWeightedVolunteerScore = 0,
    fundraising: baseWeightedFundraisingScore = 0,
    consistency: baseWeightedConsistencyScore = 0,
    engagement: baseWeightedEngagementScore = 0
  } = scoreDetails.breakdown;

  // Apply multiplier to get actual contribution to total score
  const weightedDonationScore = baseWeightedDonationScore * multiplier;
  const weightedVolunteerScore = baseWeightedVolunteerScore * multiplier;
  const weightedFundraisingScore = baseWeightedFundraisingScore * multiplier;
  const weightedConsistencyScore = baseWeightedConsistencyScore * multiplier;
  const weightedEngagementScore = baseWeightedEngagementScore * multiplier;

  // Also get raw scores for tooltip display
  const { 
    donationScore = 0, 
    volunteerScore = 0, 
    fundraisingScore = 0,
    consistencyScore = 0,
    engagementScore = 0
  } = scoreDetails;
  
  // Ring configuration with 5 categories using weighted scores
  // Calculate dynamic max scores based on tier progression
  const tierMultiplier = {
    'Giver': 1.0,
    'Altruist': 1.5,
    'Philanthropist': 2.0,
    'Champion': 3.0,
    'Visionary': 4.0
  }[tier] || 1.0;
  
  // Adjusted ring configuration with much tighter spacing for more center room
  const rings = [
    { 
      name: 'Donations',
      score: Math.round(weightedDonationScore),
      rawScore: donationScore,
      maxScore: 600 * tierMultiplier,
      radius: 140, // Outer ring stays at edge
      strokeWidth: 8, // Thinner stroke
      color: { start: '#4DD0E1', end: '#00ACC1' },
      bgColor: '#E0F7FA',
      weight: '30%'
    },
    { 
      name: 'Volunteering',
      score: Math.round(weightedVolunteerScore),
      rawScore: volunteerScore,
      maxScore: 400 * tierMultiplier,
      radius: 118, // Much tighter spacing
      strokeWidth: 8,
      color: { start: '#66BB6A', end: '#43A047' },
      bgColor: '#E8F5E9',
      weight: '25%'
    },
    { 
      name: 'Fundraising',
      score: Math.round(weightedFundraisingScore),
      rawScore: fundraisingScore,
      maxScore: 300 * tierMultiplier,
      radius: 96, // Tighter spacing
      strokeWidth: 8,
      color: { start: '#AB47BC', end: '#8E24AA' },
      bgColor: '#F3E5F5',
      weight: '20%'
    },
    { 
      name: 'Consistency',
      score: Math.round(weightedConsistencyScore),
      rawScore: consistencyScore,
      maxScore: 200 * tierMultiplier,
      radius: 74, // Tighter spacing
      strokeWidth: 8,
      color: { start: '#FF7043', end: '#F4511E' },
      bgColor: '#FBE9E7',
      weight: '15%'
    },
    { 
      name: 'Engagement',
      score: Math.round(weightedEngagementScore),
      rawScore: engagementScore,
      maxScore: 150 * tierMultiplier,
      radius: 52, // Much more room in center now
      strokeWidth: 8,
      color: { start: '#FFD54F', end: '#FFB300' },
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
              {/* Enhanced glow filter for active portions */}
              <filter id={`glow-${index}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </React.Fragment>
          ))}
        </defs>
        
        {rings.map((ring, index) => {
          const percentage = Math.min((ring.score / ring.maxScore) * 100, 100);
          const circumference = 2 * Math.PI * ring.radius;
          const strokeDashoffset = circumference - (percentage / 100) * circumference;
          
          return (
            <g key={index}>
              {/* Background ring with lower opacity when not hovered */}
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={ring.bgColor}
                strokeWidth={ring.strokeWidth}
                opacity={hoveredRing !== null && hoveredRing !== index ? "0.2" : "0.4"}
                className={`${styles.bgRing} ${styles.opacityTransition}`}
              />
              {/* Progress ring with enhanced hover effects */}
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
                  opacity: hoveredRing !== null && hoveredRing !== index ? 0.5 : 1,
                  filter: hoveredRing === index ? 'brightness(1.15)' : 'none',
                  strokeDasharray: animateRings ? `${(percentage / 100) * circumference} ${circumference}` : `0 ${circumference}`
                }}
              />
              {/* Invisible hover area for better UX */}
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke="transparent"
                strokeWidth={ring.strokeWidth + 10}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredRing(index)}
                onMouseLeave={() => setHoveredRing(null)}
              />
            </g>
          );
        })}
        
        {/* Center content - only the score number */}
        <g>
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            className={styles.centerScoreSimple}
            fill="#1e293b"
          >
            {totalScore}
          </text>
        </g>
      </svg>
      
      {/* Enhanced white card-style tooltip */}
      {hoveredRing !== null && (
        <div 
          className={styles.ringTooltipWhite}
          style={{
            '--ring-color': rings[hoveredRing].color.end,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)`
          }}
        >
          <div className={styles.tooltipHeaderWhite}>{rings[hoveredRing].name}</div>
          {rings[hoveredRing].score > 0 ? (
            <>
              <div className={styles.tooltipMainScore}>
                <span className={styles.weightedPoints}>{rings[hoveredRing].score}</span>
                <span className={styles.pointsLabel}>weighted points</span>
              </div>
              <div className={styles.tooltipProgress}>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill}
                    style={{
                      width: `${Math.min((rings[hoveredRing].score / rings[hoveredRing].maxScore) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${rings[hoveredRing].color.start}, ${rings[hoveredRing].color.end})`
                    }}
                  />
                </div>
                <span className={styles.progressText}>
                  {Math.round((rings[hoveredRing].score / rings[hoveredRing].maxScore) * 100)}% Progress
                </span>
              </div>
              <div className={styles.tooltipCalculation}>
                {rings[hoveredRing].rawScore} × {rings[hoveredRing].weight}
              </div>
              {rings[hoveredRing].score < rings[hoveredRing].maxScore && (
                <div className={styles.tooltipRemaining}>
                  {Math.round(rings[hoveredRing].maxScore - rings[hoveredRing].score)} points to fill
                </div>
              )}
            </>
          ) : (
            <div className={styles.tooltipEmptyState}>
              <div className={styles.emptyStateIcon}>🎯</div>
              <div className={styles.emptyStateText}>No activity yet</div>
              <div className={styles.emptyStateHint}>
                {rings[hoveredRing].name === 'Donations' && 'Start with a micro-donation of any amount!'}
                {rings[hoveredRing].name === 'Volunteering' && 'Log your volunteer hours to earn points'}
                {rings[hoveredRing].name === 'Fundraising' && 'Create a campaign or organise an event'}
                {rings[hoveredRing].name === 'Consistency' && 'Build daily giving habits to earn streaks'}
                {rings[hoveredRing].name === 'Engagement' && 'Complete your profile and follow charities'}
              </div>
              <div className={styles.tooltipWeight}>Worth {rings[hoveredRing].weight} of total</div>
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
  
  // Calculate percentage based on tier progression
  // pointsToNextTier is the absolute number of points needed to reach next tier
  const tierRanges = {
    'Giver': { min: 0, max: 300 },
    'Altruist': { min: 300, max: 1000 },
    'Philanthropist': { min: 1000, max: 2500 },
    'Champion': { min: 2500, max: 5000 },
    'Visionary': { min: 5000, max: 10000 } // Visionary has no upper limit, but we'll use 10000 for display
  };
  
  const currentTierRange = tierRanges[tier] || { min: 0, max: 1000 };
  const nextTierThreshold = currentTierRange.max;
  const currentTierThreshold = currentTierRange.min;
  const tierSpan = nextTierThreshold - currentTierThreshold;
  
  // Calculate how far through the current tier we are
  const pointsInCurrentTier = score - currentTierThreshold;
  const percentage = tier === 'Visionary' ? 100 : Math.min(100, Math.max(0, (pointsInCurrentTier / tierSpan) * 100));
  
  const radius = 150;
  const strokeWidth = 22; // Reduced from 30
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gradientId = `gradient-${tier}`;
  const isPositiveChange = scoreChange > 0;

  // Progress to next tier visualization
  const progressPercentage = Math.round(percentage);

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
          {/* Shadow filter for depth */}
          <filter id="progressShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
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
        {/* Progress circle with enhanced animation */}
        <circle
          className={styles.progressCircle}
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
          strokeDashoffset="0"
          filter="url(#progressShadow)"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            strokeDasharray: animateCircle ? `${(percentage / 100) * circumference} ${circumference}` : `0 ${circumference}`,
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
        {/* Overlay arc for progress to next tier when hovering */}
        {showCircleTooltip && (
          <circle
            className={styles.progressOverlay}
            stroke={color.end}
            fill="transparent"
            strokeWidth={2}
            strokeDasharray={`${((100 - percentage) / 100) * circumference} ${circumference}`}
            strokeDashoffset={`-${(percentage / 100) * circumference}`}
            opacity="0.3"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'opacity 0.3s ease',
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className={styles.scoreContent}>
        <div 
          className={styles.scoreValueWrapper}
          onMouseEnter={() => setShowScoreTooltip(true)}
          onMouseLeave={() => setShowScoreTooltip(false)}
        >
          <div className={styles.heroScore}>
            {score}
          </div>
          <div className={styles.scoreChangeIndicator}>
            <span className={isPositiveChange ? styles.positiveChange : styles.negativeChange}>
              {isPositiveChange ? <FaArrowUp /> : <FaArrowDown />}
            </span>
          </div>
        </div>
        <div className={styles.scoreLabel}>Impact Score</div>
        <div className={styles.tierBadge} style={{ background: `linear-gradient(135deg, ${color.start}, ${color.end})` }}>
          {tier}
        </div>
      </div>
      {/* Enhanced white tooltip for tier progress */}
      {showCircleTooltip && !showScoreTooltip && (
        <div className={styles.tierProgressTooltip}>
          <div className={styles.progressTooltipHeader}>
            You're {pointsToNextTier} points away from the next tier
          </div>
          <div className={styles.progressTooltipBar}>
            <div 
              className={styles.progressTooltipFill}
              style={{ 
                width: `${progressPercentage}%`,
                background: `linear-gradient(90deg, ${color.start}, ${color.end})`
              }}
            />
          </div>
          <div className={styles.progressTooltipText}>
            Progress: {progressPercentage}%
          </div>
        </div>
      )}
      {/* Score change tooltip */}
      {showScoreTooltip && (
        <div className={styles.scoreChangeTooltip}>
          <span className={isPositiveChange ? styles.positiveText : styles.negativeText}>
            {isPositiveChange ? '+' : ''}{scoreChange}
          </span>
          <span className={styles.changeLabel}>since last year</span>
        </div>
      )}
    </div>
  );
};

const PersonalImpactScore = ({ impactScore, scoreChange, tier, pointsToNextTier, isPublicProfile = false, onBackToDashboard, onAddContributions, username, userId, userEmail }) => {
  const { user } = useAuth();
  const { scoreDetails } = useContext(ImpactContext);
  const tierColor = tierColors[tier] || { start: '#E5C9A7', end: '#CD7F32', gap: '#F2E6D9' };
  const [animate, setAnimate] = useState(false);
  const [viewMode, setViewMode] = useState('total'); // 'total' or 'breakdown'
  const [isToggleAnimating, setIsToggleAnimating] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle toggle animation
  const handleViewModeChange = (mode) => {
    if (mode !== viewMode) {
      setIsToggleAnimating(true);
      setTimeout(() => {
        setViewMode(mode);
        setTimeout(() => setIsToggleAnimating(false), 300);
      }, 150);
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* Enhanced toggle with sliding animation */}
      <div className={styles.viewToggle}>
        <div 
          className={styles.toggleSlider}
          style={{ 
            transform: viewMode === 'breakdown' ? 'translateX(100%)' : 'translateX(0)',
          }}
        />
        <button
          className={`${styles.toggleButton} ${viewMode === 'total' ? styles.active : ''}`}
          onClick={() => handleViewModeChange('total')}
          title="Total Score View"
        >
          <FaChartLine />
          <span>Total</span>
        </button>
        <button
          className={`${styles.toggleButton} ${styles.toggleButtonRight} ${viewMode === 'breakdown' ? styles.active : ''}`}
          onClick={() => handleViewModeChange('breakdown')}
          title="Breakdown View"
        >
          <FaChartPie />
          <span>Breakdown</span>
        </button>
      </div>

      <div className={styles.contentContainer}>
        <div className={`${styles.visualizationColumn} ${animate ? styles.animate : ''} ${isToggleAnimating ? styles.switching : ''}`}>
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
              pointsToNextTier={pointsToNextTier}
            />
          )}
        </div>
      </div>
      
      {/* Enhanced button hierarchy with icons */}
      {!isPublicProfile ? (
        <div className={`${styles.buttonRow} ${animate ? styles.animate : ''}`}>
          <button 
            onClick={onAddContributions} 
            className={styles.primaryButton}
          >
            <FaPlus className={styles.buttonIcon} />
            Add Your Contributions
          </button>
          <Link 
            to="/activity" 
            className={styles.secondaryButton}
          >
            <FaSearch className={styles.buttonIcon} />
            Discover Your Contributions
          </Link>
          {(username || userId || userEmail) && (
            <Link 
              to={`/profile/${username || userId || userEmail?.split('@')[0]}`} 
              className={styles.tertiaryButton}
            >
              <FaUserCircle className={styles.buttonIcon} />
              View Public Profile
            </Link>
          )}
        </div>
      ) : onBackToDashboard ? (
        <div className={`${styles.buttonRow} ${animate ? styles.animate : ''}`}>
          <button onClick={onBackToDashboard} className={styles.primaryButton}>
            Back to Dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PersonalImpactScore;