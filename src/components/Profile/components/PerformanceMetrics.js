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

function PerformanceMetrics({ businessSlug }) {
  const [metrics, setMetrics] = useState({
    monthlyTrend: [],
    employeeEngagement: 0.68,
    budgetUtilization: 0.75,
    averageMultiplier: 2.3,
    donorRetention: 0.82,
    yearOverYear: { amount: 0.35, donors: 0.28 }
  });

  useEffect(() => {
    fetchMetrics();
  }, [businessSlug]);

  const fetchMetrics = async () => {
    // Mock data for demo
    setMetrics({
      monthlyTrend: [
        { month: 'Jan', amount: 15000, matches: 234 },
        { month: 'Feb', amount: 18000, matches: 267 },
        { month: 'Mar', amount: 22000, matches: 312 },
        { month: 'Apr', amount: 19000, matches: 289 },
        { month: 'May', amount: 25000, matches: 356 },
        { month: 'Jun', amount: 28000, matches: 401 }
      ],
      employeeEngagement: 0.68,
      budgetUtilization: 0.75,
      averageMultiplier: 2.3,
      donorRetention: 0.82,
      yearOverYear: { amount: 0.35, donors: 0.28 }
    });
  };

  const chartData = {
    labels: metrics.monthlyTrend.map(m => m.month),
    datasets: [
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
      <h3>Performance Metrics</h3>
      
      <div className={styles.chartSection}>
        <h4>Monthly Trends</h4>
        <div className={styles.chart}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <FaUsers className={styles.metricIcon} />
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{(metrics.employeeEngagement * 100).toFixed(0)}%</div>
            <div className={styles.metricLabel}>Employee Engagement</div>
          </div>
        </div>

        <div className={styles.metric}>
          <FaPercent className={styles.metricIcon} />
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{(metrics.budgetUtilization * 100).toFixed(0)}%</div>
            <div className={styles.metricLabel}>Budget Utilization</div>
          </div>
        </div>

        <div className={styles.metric}>
          <FaChartLine className={styles.metricIcon} />
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{metrics.averageMultiplier}x</div>
            <div className={styles.metricLabel}>Avg Multiplier</div>
          </div>
        </div>

        <div className={styles.metric}>
          <FaArrowUp className={styles.metricIcon} />
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>+{(metrics.yearOverYear.amount * 100).toFixed(0)}%</div>
            <div className={styles.metricLabel}>YoY Growth</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceMetrics;