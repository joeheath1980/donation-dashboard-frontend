import React, { useEffect, useState } from 'react';
import styles from './BusinessImpactScore.module.css';
import { FaTrophy, FaChartLine, FaBalanceScale, FaUsers } from 'react-icons/fa';
import { 
  fetchWithFallback, 
  hasValidImpactScore, 
  isProvisionalScore,
  getDataQualityBadge
} from '../../../utils/dataValidation';

// Data Quality Badge Component
const DataQualityBadge = ({ quality }) => {
  if (!quality) return null;
  
  const badge = getDataQualityBadge(quality);
  
  return (
    <span className={`${styles.qualityBadge} ${styles[badge.color]}`}>
      {badge.label}
    </span>
  );
};

function BusinessImpactScore({ businessSlug, initialScore = 0 }) {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    fetchImpactScore();
  }, [businessSlug]);

  useEffect(() => {
    // Animate score when data loads
    if (impactData?.score) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setAnimatedScore(prev => {
            if (prev >= impactData.score) {
              clearInterval(interval);
              return impactData.score;
            }
            return prev + 1;
          });
        }, 20);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [impactData?.score]);

  const fetchImpactScore = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';
      const data = await fetchWithFallback(
        `${API_BASE_URL}/api/public/business/${businessSlug}/impact-score`,
        {
          score: initialScore,
          breakdown: {},
          industryComparison: null,
          trend: 'stable',
          dataQuality: 'none'
        }
      );
      
      setImpactData(data);
    } catch (error) {
      console.error('Error fetching impact score:', error);
      setImpactData(null);
    } finally {
      setLoading(false);
    }
  };

  // Don't display if score is 0 or missing
  if (!loading && !hasValidImpactScore(impactData?.score)) {
    return null; // Component not rendered
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonCircle}></div>
          <div className={styles.skeletonText}></div>
        </div>
      </div>
    );
  }

  const { score, breakdown = {}, industryComparison, dataQuality } = impactData;

  // Display with confidence indicator if score is low
  if (isProvisionalScore(score)) {
    return (
      <div className={`${styles.container} ${styles.provisional}`}>
        <div className={styles.header}>
          <h3>Building Impact Score</h3>
          <DataQualityBadge quality={dataQuality} />
        </div>
        <div className={styles.provisionalScore}>
          <div className={styles.scoreValue}>{score}</div>
          <p className={styles.provisionalText}>
            We're building your impact score as you engage more with the platform
          </p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#00D4AA';
    if (score >= 60) return '#5ecfb6';
    if (score >= 40) return '#FFA500';
    return '#FF6B6B';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Building';
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Check if breakdown data exists and has valid values
  const hasValidBreakdown = breakdown && Object.values(breakdown).every(v => v > 0);
  const industryAverage = industryComparison?.average || 65;
  const percentile = industryComparison?.percentile || null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Impact Score</h3>
        <div className={styles.headerBadges}>
          <DataQualityBadge quality={dataQuality} />
          {percentile && (
            <span className={styles.percentile}>Top {100 - percentile}% of businesses</span>
          )}
        </div>
      </div>

      <div className={styles.scoreDisplay}>
        <div className={styles.scoreCircle}>
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="#F5F5FA"
              strokeWidth="20"
            />
            {/* Industry average marker (only show if available) */}
            {industryComparison && (
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="#E5E5EA"
                strokeWidth="20"
                strokeDasharray={`${(industryAverage / 100) * circumference} ${circumference}`}
                strokeDashoffset="0"
                transform="rotate(-90 140 140)"
                opacity="0.5"
              />
            )}
            {/* Animated score circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke={getScoreColor(animatedScore)}
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 140 140)"
              strokeLinecap="round"
              className={styles.scoreProgress}
            />
            {/* Center content */}
            <text x="140" y="120" className={styles.scoreNumber} textAnchor="middle">
              {animatedScore}
            </text>
            <text x="140" y="150" className={styles.scoreLabel} textAnchor="middle">
              {getScoreLabel(animatedScore)}
            </text>
            <text x="140" y="175" className={styles.scoreSubtext} textAnchor="middle">
              Impact Score
            </text>
          </svg>
        </div>

        {/* Only show comparison if industry data exists */}
        {industryComparison && (
          <div className={styles.comparison}>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Your Score</span>
              <span className={styles.comparisonValue} data-score-color={getScoreColor(score)} className="dynamic-color">
                {score}
              </span>
            </div>
            <div className={styles.comparisonDivider}></div>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Industry Avg</span>
              <span className={styles.comparisonValue}>{industryAverage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Show breakdown only if all values > 0 */}
      {hasValidBreakdown && (
        <div className={styles.breakdown}>
          <h4>Score Breakdown</h4>
          <div className={styles.breakdownItems}>
            {breakdown.consistency > 0 && (
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownHeader}>
                  <FaChartLine className={styles.breakdownIcon} />
                  <span className={styles.breakdownLabel}>Consistency</span>
                  <span className={styles.breakdownValue}>{breakdown.consistency}</span>
                </div>
                <div className={styles.breakdownBar}>
                  <div 
                    className={styles.breakdownFill}
                    style={{ 
                      width: `${breakdown.consistency}%`,
                      background: 'linear-gradient(90deg, #2d8f7b, #5ecfb6)'
                    }}
                  />
                </div>
              </div>
            )}

            {breakdown.volume > 0 && (
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownHeader}>
                  <FaTrophy className={styles.breakdownIcon} />
                  <span className={styles.breakdownLabel}>Volume</span>
                  <span className={styles.breakdownValue}>{breakdown.volume}</span>
                </div>
                <div className={styles.breakdownBar}>
                  <div 
                    className={styles.breakdownFill}
                    style={{ 
                      width: `${breakdown.volume}%`,
                      background: 'linear-gradient(90deg, #2d8f7b, #5ecfb6)'
                    }}
                  />
                </div>
              </div>
            )}

            {breakdown.diversity > 0 && (
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownHeader}>
                  <FaBalanceScale className={styles.breakdownIcon} />
                  <span className={styles.breakdownLabel}>Diversity</span>
                  <span className={styles.breakdownValue}>{breakdown.diversity}</span>
                </div>
                <div className={styles.breakdownBar}>
                  <div 
                    className={styles.breakdownFill}
                    style={{ 
                      width: `${breakdown.diversity}%`,
                      background: 'linear-gradient(90deg, #2d8f7b, #5ecfb6)'
                    }}
                  />
                </div>
              </div>
            )}

            {breakdown.engagement > 0 && (
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownHeader}>
                  <FaUsers className={styles.breakdownIcon} />
                  <span className={styles.breakdownLabel}>Engagement</span>
                  <span className={styles.breakdownValue}>{breakdown.engagement}</span>
                </div>
                <div className={styles.breakdownBar}>
                  <div 
                    className={styles.breakdownFill}
                    style={{ 
                      width: `${breakdown.engagement}%`,
                      background: 'linear-gradient(90deg, #2d8f7b, #5ecfb6)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show insights only if percentile data exists */}
      {percentile && (
        <div className={styles.insights}>
          <div className={styles.insight}>
            <FaTrophy className={styles.insightIcon} className="color-hex-ffd700" />
            <p>This business ranks in the <strong>top {100 - percentile}%</strong> for corporate giving</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessImpactScore;