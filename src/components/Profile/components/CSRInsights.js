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
import { 
  fetchWithFallback, 
  hasValidESGScores, 
  hasValidMetrics,
  getDataQualityBadge,
  formatNumber
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

// ESG Scores Component
const ESGScoresDisplay = ({ esgScores }) => {
  if (!hasValidESGScores(esgScores)) {
    return null; // Don't display section
  }

  const getESGColor = (score) => {
    if (score >= 80) return '#00D4AA';
    if (score >= 60) return '#5ecfb6';
    if (score >= 40) return '#FFA500';
    return '#FF6B6B';
  };
  
  return (
    <div className={styles.esgSection}>
      <h4>ESG Performance</h4>
      <div className={styles.esgScores}>
        {esgScores.environmental > 0 && (
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
                    width: `${esgScores.environmental}%`,
                    background: getESGColor(esgScores.environmental)
                  }}
                />
              </div>
              <span className={styles.esgValue}>{esgScores.environmental}/100</span>
            </div>
          </div>
        )}

        {esgScores.social > 0 && (
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
                    width: `${esgScores.social}%`,
                    background: getESGColor(esgScores.social)
                  }}
                />
              </div>
              <span className={styles.esgValue}>{esgScores.social}/100</span>
            </div>
          </div>
        )}

        {esgScores.governance > 0 && (
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
                    width: `${esgScores.governance}%`,
                    background: getESGColor(esgScores.governance)
                  }}
                />
              </div>
              <span className={styles.esgValue}>{esgScores.governance}/100</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sustainability Metrics Component
const SustainabilityMetrics = ({ metrics }) => {
  // Filter out zero values
  const activeMetrics = Object.entries(metrics || {})
    .filter(([key, value]) => value > 0)
    .map(([key, value]) => ({ key, value }));
  
  if (activeMetrics.length === 0) {
    return null; // Don't display if no metrics
  }

  // Use shared formatNumber function

  const getIconForMetric = (key) => {
    const icons = {
      co2Offset: <FaLeaf style={{ color: '#3F7E44' }} />,
      treesPlanted: <FaTree style={{ color: '#56C02B' }} />,
      volunteersHours: <FaClock style={{ color: '#FD6925' }} />,
      communitiesImpacted: <FaGlobeAfrica style={{ color: '#00689D' }} />
    };
    return icons[key] || <FaBullseye style={{ color: '#2d8f7b' }} />;
  };

  const getLabelForMetric = (key) => {
    const labels = {
      co2Offset: 'Tons CO₂ Offset',
      treesPlanted: 'Trees Planted',
      volunteersHours: 'Volunteer Hours',
      communitiesImpacted: 'Communities Impacted'
    };
    return labels[key] || key;
  };

  const formatMetricValue = (key, value) => {
    const formats = {
      co2Offset: formatNumber(value),
      treesPlanted: formatNumber(value),
      volunteersHours: formatNumber(value),
      communitiesImpacted: value
    };
    return formats[key] || formatNumber(value);
  };

  return (
    <div className={styles.metricsSection}>
      <h4>Sustainability Impact</h4>
      <div className={styles.metricsGrid}>
        {activeMetrics.map(({ key, value }) => (
          <div key={key} className={styles.metricCard}>
            {getIconForMetric(key)}
            <div className={styles.metricValue}>{formatMetricValue(key, value)}</div>
            <div className={styles.metricLabel}>{getLabelForMetric(key)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function CSRInsights({ businessSlug }) {
  const [csrData, setCsrData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      const data = await fetchWithFallback(
        `/api/public/business/${businessSlug}/csr-metrics`,
        {
          esgScores: {
            environmental: 0,
            social: 0,
            governance: 0
          },
          sustainabilityMetrics: {},
          sdgAlignment: [],
          impactMultiplier: 0,
          dataQuality: 'none'
        }
      );
      
      setCsrData(data);
    } catch (error) {
      console.error('Error fetching CSR data:', error);
      setCsrData(null);
    } finally {
      setLoading(false);
    }
  };

  // Don't display if no valid data exists
  if (!loading && (!csrData || (
    !hasValidESGScores(csrData.esgScores) && 
    !hasValidMetrics(csrData.sustainabilityMetrics) &&
    (!csrData.sdgAlignment || csrData.sdgAlignment.length === 0) &&
    (!csrData.impactMultiplier || csrData.impactMultiplier <= 1)
  ))) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader}></div>
          <div className={styles.skeletonBars}></div>
          <div className={styles.skeletonCards}></div>
        </div>
      </div>
    );
  }

  const { esgScores, sustainabilityMetrics, sdgAlignment, impactMultiplier, dataQuality } = csrData;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>CSR & Sustainability Insights</h3>
        <DataQualityBadge quality={dataQuality} />
      </div>

      {/* ESG Scores - only show if available */}
      <ESGScoresDisplay esgScores={esgScores} />

      {/* Sustainability Metrics - only show if available */}
      <SustainabilityMetrics metrics={sustainabilityMetrics} />

      {/* SDG Alignment - only show if available */}
      {sdgAlignment && sdgAlignment.length > 0 && (
        <div className={styles.sdgSection}>
          <h4>UN Sustainable Development Goals</h4>
          <div className={styles.sdgGrid}>
            {sdgAlignment.map(goal => (
              <div 
                key={goal} 
                className={styles.sdgBadge}
                style={{ backgroundColor: sdgGoals[goal]?.color || '#666' }}
                title={sdgGoals[goal]?.name || `Goal ${goal}`}
              >
                <span className={styles.sdgNumber}>{goal}</span>
                <span className={styles.sdgName}>{sdgGoals[goal]?.name || `Goal ${goal}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact Multiplier - only show if > 1 */}
      {impactMultiplier && impactMultiplier > 1 && (
        <div className={styles.multiplierSection}>
          <div className={styles.multiplierCard}>
            <FaHandsHelping className={styles.multiplierIcon} />
            <div className={styles.multiplierContent}>
              <div className={styles.multiplierValue}>{impactMultiplier}x</div>
              <div className={styles.multiplierLabel}>Average Impact Multiplier</div>
              <div className={styles.multiplierDescription}>
                Every dollar donated is matched with ${(impactMultiplier - 1).toFixed(1)} from this business
              </div>
            </div>
            <div className={styles.multiplierVisual}>
              <div className={styles.multiplierBar}>
                <div className={styles.donorPortion}>$1</div>
                <div className={styles.businessPortion} style={{ flex: impactMultiplier - 1 }}>
                  ${(impactMultiplier - 1).toFixed(1)}
                </div>
              </div>
              <div className={styles.multiplierTotal}>
                Total Impact: ${impactMultiplier}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CSRInsights;