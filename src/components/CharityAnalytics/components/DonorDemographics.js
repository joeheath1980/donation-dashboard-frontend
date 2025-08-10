import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './DonorDemographics.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function DonorDemographics({ data }) {
  // Add null checks and default values
  if (!data || !data.geographic || !data.frequency) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading donor demographics...</div>
      </div>
    );
  }

  const geographicData = {
    labels: Object.keys(data.geographic || {}),
    datasets: [{
      data: Object.values(data.geographic || {}),
      backgroundColor: [
        '#2d8f7b',
        '#5ecfb6',
        '#00D4AA',
        '#88E0D1',
        '#B8F1E8',
        '#D8F9F4'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const frequencyData = {
    labels: Object.keys(data.frequency || {}),
    datasets: [{
      data: Object.values(data.frequency || {}),
      backgroundColor: [
        '#2d8f7b',
        '#5ecfb6',
        '#00D4AA',
        '#88E0D1'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
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
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartGrid}>
        <div className={styles.chartSection}>
          <h3>Geographic Distribution</h3>
          <div className={styles.chartWrapper}>
            <Pie data={geographicData} options={options} />
          </div>
        </div>
        
        <div className={styles.chartSection}>
          <h3>Donation Frequency</h3>
          <div className={styles.chartWrapper}>
            <Doughnut data={frequencyData} options={options} />
          </div>
        </div>
      </div>
      
      <div className={styles.insights}>
        <h4>Key Insights</h4>
        <ul>
          <li>Majority of donors are from {Object.keys(data.geographic)[0]}</li>
          <li>Most common donation frequency: {Object.keys(data.frequency)[0]}</li>
          <li>Geographic diversity across {Object.keys(data.geographic).length} states</li>
        </ul>
      </div>
    </div>
  );
}

export default DonorDemographics;