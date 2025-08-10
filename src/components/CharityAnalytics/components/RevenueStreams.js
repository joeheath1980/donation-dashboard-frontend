import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import styles from './RevenueStreams.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function RevenueStreams({ data }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const chartData = {
    labels: ['Revenue Streams'],
    datasets: [
      {
        label: 'Direct Donations',
        data: [data.direct.amount],
        backgroundColor: '#2d8f7b',
        stack: 'Stack 0',
      },
      {
        label: 'Micro Matched',
        data: [data.microMatched.amount],
        backgroundColor: '#5ecfb6',
        stack: 'Stack 0',
      }
    ]
  };

  const chartData2 = {
    labels: ['Donation Types'],
    datasets: [
      {
        label: 'Recurring',
        data: [data.recurring.amount],
        backgroundColor: '#00D4AA',
        stack: 'Stack 1',
      },
      {
        label: 'One-Time',
        data: [data.oneTime.amount],
        backgroundColor: '#88E0D1',
        stack: 'Stack 1',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Direct Donations</span>
          <span className={styles.metricValue}>{formatCurrency(data.direct.amount)}</span>
          <span className={styles.metricPercentage}>{data.direct.percentage}%</span>
          <span className={styles.metricCount}>{data.direct.count} donations</span>
        </div>
        
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Micro Matched</span>
          <span className={styles.metricValue}>{formatCurrency(data.microMatched.amount)}</span>
          <span className={styles.metricPercentage}>{data.microMatched.percentage}%</span>
          <span className={styles.metricCount}>{data.microMatched.count} donations</span>
        </div>
        
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Recurring</span>
          <span className={styles.metricValue}>{formatCurrency(data.recurring.amount)}</span>
          <span className={styles.metricPercentage}>{data.recurring.percentage}%</span>
          <span className={styles.metricCount}>{data.recurring.count} donors</span>
        </div>
        
        <div className={styles.metric}>
          <span className={styles.metricLabel}>One-Time</span>
          <span className={styles.metricValue}>{formatCurrency(data.oneTime.amount)}</span>
          <span className={styles.metricPercentage}>{data.oneTime.percentage}%</span>
          <span className={styles.metricCount}>{data.oneTime.count} donations</span>
        </div>
      </div>
      
      <div className={styles.chartsWrapper}>
        <div className={styles.chart}>
          <Bar data={chartData} options={options} />
        </div>
        <div className={styles.chart}>
          <Bar data={chartData2} options={options} />
        </div>
      </div>
      
      <div className={styles.highlight}>
        <p>
          <strong>Key Insight:</strong> Micro matched donations represent {data.microMatched.percentage}% 
          of total revenue, demonstrating the power of business partnerships.
        </p>
      </div>
    </div>
  );
}

export default RevenueStreams;