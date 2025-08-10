import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import styles from './PerformanceMetrics.module.css';
import { FaChartLine, FaUsers, FaPercent, FaArrowUp } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { 
  fetchWithFallback, 
  hasValidPerformanceMetrics,
  getDataQualityBadge
} from '../../../utils/dataValidation';

// Data Quality Badge Component
const DataQualityBadge = ({ quality }) => {
  if (!quality) return null;
  
  // Override badges for performance metrics context
  const badges = {
    high: { color: 'green', label: 'Verified Metrics' },
    medium: { color: 'yellow', label: 'Partial Metrics' },
    low: { color: 'orange', label: 'Sample Metrics' },
    none: { color: 'gray', label: 'Estimated' }
  };
  
  const badge = badges[quality] || badges.none;
  
  return (
    <span className={`${styles.qualityBadge} ${styles[badge.color]}`}>
      {badge.label}
    </span>
  );
};

function PerformanceMetrics({ businessSlug }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataQuality, setDataQuality] = useState('none');

  useEffect(() => {
    fetchMetrics();
  }, [businessSlug]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await fetchWithFallback(
        `/api/public/business/${businessSlug}/performance-metrics`,
        {
          monthlyTrend: [],
          employeeEngagement: 0,
          budgetUtilization: 0,
          averageMultiplier: 0,
          donorRetention: 0,
          yearOverYear: { amount: 0, donors: 0 },
          dataQuality: 'none'
        }
      );
      
      setMetrics(data);
      setDataQuality(data.dataQuality || 'none');
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  // Don't display if loading or no meaningful data
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader}></div>
          <div className={styles.skeletonChart}></div>
          <div className={styles.skeletonGrid}></div>
        </div>
      </div>
    );
  }

  // Don't render if no valid metrics
  if (!hasValidPerformanceMetrics(metrics)) {
    return null;
  }

  const chartData = {
    labels: metrics.monthlyTrend?.map(m => m.month) || [],
    datasets: [
      ...(metrics.monthlyTrend && metrics.monthlyTrend.length > 0 ? [
        {
          label: 'Amount Matched ($)',
          data: metrics.monthlyTrend.map(m => m.amount),
          borderColor: '#2d8f7b',
          backgroundColor: 'rgba(45, 143, 123, 0.1)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Number of Matches',
          data: metrics.monthlyTrend.map(m => m.matches),
          borderColor: '#5ecfb6',
          backgroundColor: 'rgba(94, 207, 182, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ] : [])
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { display: false }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Performance Metrics</h3>
        <DataQualityBadge quality={dataQuality} />
      </div>
      
      {/* Only show chart if monthly trend data exists */}
      {metrics.monthlyTrend && metrics.monthlyTrend.length > 0 && (
        <div className={styles.chartSection}>
          <h4>Monthly Trends</h4>
          <div className={styles.chart}>
            <Line data={chartData} options={options} />
          </div>
        </div>
      )}

      <div className={styles.metricsGrid}>
        {metrics.employeeEngagement > 0 && (
          <div className={styles.metric}>
            <FaUsers className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{(metrics.employeeEngagement * 100).toFixed(0)}%</div>
              <div className={styles.metricLabel}>Employee Engagement</div>
            </div>
          </div>
        )}

        {metrics.budgetUtilization > 0 && (
          <div className={styles.metric}>
            <FaPercent className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{(metrics.budgetUtilization * 100).toFixed(0)}%</div>
              <div className={styles.metricLabel}>Budget Utilization</div>
            </div>
          </div>
        )}

        {metrics.averageMultiplier > 1 && (
          <div className={styles.metric}>
            <FaChartLine className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{metrics.averageMultiplier}x</div>
              <div className={styles.metricLabel}>Avg Multiplier</div>
            </div>
          </div>
        )}

        {metrics.yearOverYear && (metrics.yearOverYear.amount > 0 || metrics.yearOverYear.donors > 0) && (
          <div className={styles.metric}>
            <FaArrowUp className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {metrics.yearOverYear.amount > 0 
                  ? `+${(metrics.yearOverYear.amount * 100).toFixed(0)}%`
                  : `+${(metrics.yearOverYear.donors * 100).toFixed(0)}% donors`}
              </div>
              <div className={styles.metricLabel}>YoY Growth</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceMetrics;