import React, { useEffect, useState } from 'react';
import styles from './BusinessImpactScore.module.css';
import { FaTrophy, FaChartLine, FaBalanceScale, FaUsers } from 'react-icons/fa';

function BusinessImpactScore({ businessSlug, initialScore = 0 }) {
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [breakdown, setBreakdown] = useState({
    consistency: 90,
    volume: 80,
    diversity: 85,
    engagement: 88
  });
  const [industryAverage, setIndustryAverage] = useState(65);
  const [percentile, setPercentile] = useState(92);

  useEffect(() => {
    // Fetch impact score data
    fetchImpactScore();
  }, [businessSlug]);

  useEffect(() => {
    // Animate score
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= score) {
            clearInterval(interval);
            return score;
          }
          return prev + 1;
        });
      }, 20);
    }, 500);

    return () => clearTimeout(timer);
  }, [score]);

  const fetchImpactScore = async () => {
    try {
      // API call would go here
      // const response = await fetch(`/api/public/business/${businessSlug}/impact-score`);
      // const data = await response.json();
      
      // For demo, use mock data
      setScore(initialScore || 85);
      setBreakdown({
        consistency: 90,
        volume: 80,
        diversity: 85,
        engagement: 88
      });
      setIndustryAverage(65);
      setPercentile(92);
    } catch (error) {
      console.error('Error fetching impact score:', error);
    }
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Impact Score</h3>
        <span className={styles.percentile}>Top {100 - percentile}% of businesses</span>
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
            {/* Industry average marker */}
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

        <div className={styles.comparison}>
          <div className={styles.comparisonItem}>
            <span className={styles.comparisonLabel}>Your Score</span>
            <span className={styles.comparisonValue} style={{ color: getScoreColor(score) }}>
              {score}
            </span>
          </div>
          <div className={styles.comparisonDivider}></div>
          <div className={styles.comparisonItem}>
            <span className={styles.comparisonLabel}>Industry Avg</span>
            <span className={styles.comparisonValue}>{industryAverage}</span>
          </div>
        </div>
      </div>

      <div className={styles.breakdown}>
        <h4>Score Breakdown</h4>
        <div className={styles.breakdownItems}>
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
        </div>
      </div>

      <div className={styles.insights}>
        <div className={styles.insight}>
          <FaTrophy className={styles.insightIcon} style={{ color: '#FFD700' }} />
          <p>This business ranks in the <strong>top {100 - percentile}%</strong> for corporate giving</p>
        </div>
      </div>
    </div>
  );
}

export default BusinessImpactScore;