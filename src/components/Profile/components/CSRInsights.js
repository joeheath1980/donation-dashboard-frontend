import React, { useState, useEffect } from 'react';
import styles from './CSRInsights.module.css';
import { 
  FaFileAlt,
  FaTrophy,
  FaDollarSign,
  FaCalendarAlt,
  FaChartPie,
  FaStar,
  FaHandHoldingHeart
} from 'react-icons/fa';
import { API_CONFIG } from '../../../config/api.config';
import { 
  fetchWithFallback, 
  getDataQualityBadge,
  formatNumber
} from '../../../utils/dataValidation';

// CSR Insights Component with AI-generated summary

function CSRInsights({ businessSlug }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCSRInsights();
  }, [businessSlug]);

  const fetchCSRInsights = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = API_CONFIG.BASE_URL;
      const data = await fetchWithFallback(
        `${API_BASE_URL}/api/public/business/${businessSlug}/csr-insights`,
        {
          hasReport: false,
          year: null,
          totalContributions: 0,
          givingScore: 0,
          insights: '',
          keyHighlights: [],
          categories: []
        }
      );
      
      setInsights(data);
    } catch (error) {
      console.error('Error fetching CSR insights:', error);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  // Don't display if no CSR report exists
  if (!loading && (!insights || !insights.hasReport)) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader}></div>
          <div className={styles.skeletonContent}></div>
          <div className={styles.skeletonHighlights}></div>
        </div>
      </div>
    );
  }

  const { hasReport, year, totalContributions, givingScore, insights: summary, keyHighlights, categories } = insights;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <FaFileAlt className={styles.headerIcon} />
          <h3>CSR Impact Summary</h3>
          {year && (
            <span className={styles.yearBadge}>
              <FaCalendarAlt /> {year}
            </span>
          )}
        </div>
        {givingScore > 0 && (
          <div className={styles.scoreBadge}>
            <FaTrophy className={styles.scoreIcon} />
            <span>Score: {givingScore}/100</span>
          </div>
        )}
      </div>

      {/* Contribution Stats */}
      {totalContributions > 0 && (
        <div className={styles.contributionStats}>
          <div className={styles.statCard}>
            <FaDollarSign className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statAmount}>
                ${(totalContributions / 1000000).toFixed(1)}M
              </span>
              <span className={styles.statLabel}>Total Contributions{year ? ` in ${year}` : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* AI-Generated Insights */}
      {summary && (
        <div className={styles.insightsSection}>
          <div className={styles.insightsText}>
            {summary.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {/* Key Highlights */}
      {keyHighlights && keyHighlights.length > 0 && (
        <div className={styles.highlightsSection}>
          <h4>
            <FaStar className={styles.sectionIcon} />
            Key Highlights
          </h4>
          <ul className={styles.highlightsList}>
            {keyHighlights.map((highlight, idx) => (
              <li key={idx} className={styles.highlightItem}>
                <FaHandHoldingHeart className={styles.bulletIcon} />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Breakdown */}
      {categories && categories.length > 0 && (
        <div className={styles.categoriesSection}>
          <h4>
            <FaChartPie className={styles.sectionIcon} />
            Giving Categories
          </h4>
          <div className={styles.categoryList}>
            {categories.map((category, idx) => (
              <div key={idx} className={styles.categoryItem}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryPercentage}>{category.percentage}%</span>
                </div>
                <div className={styles.categoryBar}>
                  <div 
                    className={styles.categoryFill}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <span className={styles.categoryAmount}>
                  ${formatNumber(category.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CSRInsights;