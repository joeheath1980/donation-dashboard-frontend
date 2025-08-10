import React, { useState, useEffect } from 'react';
import styles from './CSRInsights.module.css';
import { 
  FaLeaf, 
  FaUsers, 
  FaBalanceScale, 
  FaGlobeAfrica,
  FaTree,
  FaClock,
  FaHandsHelping,
  FaBullseye
} from 'react-icons/fa';

function CSRInsights({ businessSlug }) {
  const [csrData, setCsrData] = useState({
    esgScores: {
      environmental: 78,
      social: 92,
      governance: 85
    },
    sustainabilityMetrics: {
      co2Offset: 1250,
      treesPlanted: 500,
      volunteersHours: 2400,
      communitiesImpacted: 15
    },
    sdgAlignment: [1, 3, 4, 13],
    impactMultiplier: 2.5
  });

  const sdgGoals = {
    1: { name: 'No Poverty', color: '#E5243B' },
    2: { name: 'Zero Hunger', color: '#DDA63A' },
    3: { name: 'Good Health', color: '#4C9F38' },
    4: { name: 'Quality Education', color: '#C5192D' },
    5: { name: 'Gender Equality', color: '#FF3A21' },
    6: { name: 'Clean Water', color: '#26BDE2' },
    7: { name: 'Affordable Energy', color: '#FCC30B' },
    8: { name: 'Decent Work', color: '#A21942' },
    9: { name: 'Industry & Innovation', color: '#FD6925' },
    10: { name: 'Reduced Inequalities', color: '#DD1367' },
    11: { name: 'Sustainable Cities', color: '#FD9D24' },
    12: { name: 'Responsible Consumption', color: '#BF8B2E' },
    13: { name: 'Climate Action', color: '#3F7E44' },
    14: { name: 'Life Below Water', color: '#0A97D9' },
    15: { name: 'Life on Land', color: '#56C02B' },
    16: { name: 'Peace & Justice', color: '#00689D' },
    17: { name: 'Partnerships', color: '#19486A' }
  };

  useEffect(() => {
    fetchCSRData();
  }, [businessSlug]);

  const fetchCSRData = async () => {
    try {
      // API call would go here
      // const response = await fetch(`/api/public/business/${businessSlug}/csr-metrics`);
      // const data = await response.json();
      // setCsrData(data);
    } catch (error) {
      console.error('Error fetching CSR data:', error);
    }
  };

  const getESGColor = (score) => {
    if (score >= 80) return '#00D4AA';
    if (score >= 60) return '#5ecfb6';
    if (score >= 40) return '#FFA500';
    return '#FF6B6B';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>CSR & Sustainability Insights</h3>
      </div>

      {/* ESG Scores */}
      <div className={styles.esgSection}>
        <h4>ESG Performance</h4>
        <div className={styles.esgScores}>
          <div className={styles.esgScore}>
            <div className={styles.esgIconWrapper} style={{ background: 'linear-gradient(135deg, #56C02B, #3F7E44)' }}>
              <FaLeaf className={styles.esgIcon} />
            </div>
            <div className={styles.esgContent}>
              <span className={styles.esgLabel}>Environmental</span>
              <div className={styles.esgBar}>
                <div 
                  className={styles.esgFill}
                  style={{ 
                    width: `${csrData.esgScores.environmental}%`,
                    background: getESGColor(csrData.esgScores.environmental)
                  }}
                />
              </div>
              <span className={styles.esgValue}>{csrData.esgScores.environmental}/100</span>
            </div>
          </div>

          <div className={styles.esgScore}>
            <div className={styles.esgIconWrapper} style={{ background: 'linear-gradient(135deg, #FF3A21, #DD1367)' }}>
              <FaUsers className={styles.esgIcon} />
            </div>
            <div className={styles.esgContent}>
              <span className={styles.esgLabel}>Social</span>
              <div className={styles.esgBar}>
                <div 
                  className={styles.esgFill}
                  style={{ 
                    width: `${csrData.esgScores.social}%`,
                    background: getESGColor(csrData.esgScores.social)
                  }}
                />
              </div>
              <span className={styles.esgValue}>{csrData.esgScores.social}/100</span>
            </div>
          </div>

          <div className={styles.esgScore}>
            <div className={styles.esgIconWrapper} style={{ background: 'linear-gradient(135deg, #00689D, #19486A)' }}>
              <FaBalanceScale className={styles.esgIcon} />
            </div>
            <div className={styles.esgContent}>
              <span className={styles.esgLabel}>Governance</span>
              <div className={styles.esgBar}>
                <div 
                  className={styles.esgFill}
                  style={{ 
                    width: `${csrData.esgScores.governance}%`,
                    background: getESGColor(csrData.esgScores.governance)
                  }}
                />
              </div>
              <span className={styles.esgValue}>{csrData.esgScores.governance}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div className={styles.metricsSection}>
        <h4>Sustainability Impact</h4>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <FaTree className={styles.metricIcon} style={{ color: '#56C02B' }} />
            <div className={styles.metricValue}>{formatNumber(csrData.sustainabilityMetrics.treesPlanted)}</div>
            <div className={styles.metricLabel}>Trees Planted</div>
          </div>

          <div className={styles.metricCard}>
            <FaLeaf className={styles.metricIcon} style={{ color: '#3F7E44' }} />
            <div className={styles.metricValue}>{formatNumber(csrData.sustainabilityMetrics.co2Offset)}</div>
            <div className={styles.metricLabel}>Tons CO₂ Offset</div>
          </div>

          <div className={styles.metricCard}>
            <FaClock className={styles.metricIcon} style={{ color: '#FD6925' }} />
            <div className={styles.metricValue}>{formatNumber(csrData.sustainabilityMetrics.volunteersHours)}</div>
            <div className={styles.metricLabel}>Volunteer Hours</div>
          </div>

          <div className={styles.metricCard}>
            <FaGlobeAfrica className={styles.metricIcon} style={{ color: '#00689D' }} />
            <div className={styles.metricValue}>{csrData.sustainabilityMetrics.communitiesImpacted}</div>
            <div className={styles.metricLabel}>Communities Impacted</div>
          </div>
        </div>
      </div>

      {/* SDG Alignment */}
      <div className={styles.sdgSection}>
        <h4>UN Sustainable Development Goals</h4>
        <div className={styles.sdgGrid}>
          {csrData.sdgAlignment.map(goal => (
            <div 
              key={goal} 
              className={styles.sdgBadge}
              style={{ backgroundColor: sdgGoals[goal].color }}
              title={sdgGoals[goal].name}
            >
              <span className={styles.sdgNumber}>{goal}</span>
              <span className={styles.sdgName}>{sdgGoals[goal].name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Multiplier */}
      <div className={styles.multiplierSection}>
        <div className={styles.multiplierCard}>
          <FaHandsHelping className={styles.multiplierIcon} />
          <div className={styles.multiplierContent}>
            <div className={styles.multiplierValue}>{csrData.impactMultiplier}x</div>
            <div className={styles.multiplierLabel}>Average Impact Multiplier</div>
            <div className={styles.multiplierDescription}>
              Every dollar donated is matched with ${csrData.impactMultiplier - 1} from this business
            </div>
          </div>
          <div className={styles.multiplierVisual}>
            <div className={styles.multiplierBar}>
              <div className={styles.donorPortion}>$1</div>
              <div className={styles.businessPortion} style={{ flex: csrData.impactMultiplier - 1 }}>
                ${(csrData.impactMultiplier - 1).toFixed(1)}
              </div>
            </div>
            <div className={styles.multiplierTotal}>
              Total Impact: ${csrData.impactMultiplier}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CSRInsights;