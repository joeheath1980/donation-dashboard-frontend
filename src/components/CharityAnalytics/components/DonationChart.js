import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DonationChart({ data, dateRange, detailed = false }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (dateRange === 'year') {
      return date.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
    } else if (dateRange === 'month') {
      return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' });
    }
  };

  const chartData = {
    labels: data.series.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Total Donations',
        data: data.series.map(item => item.amount),
        borderColor: '#2d8f7b',
        backgroundColor: 'rgba(45, 143, 123, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: detailed ? 4 : 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Matched Amount',
        data: data.series.map(item => item.matched),
        borderColor: '#5ecfb6',
        backgroundColor: 'rgba(94, 207, 182, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: detailed ? 4 : 2,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('en-AU', {
              style: 'currency',
              currency: 'AUD',
              minimumFractionDigits: 0
            }).format(context.parsed.y);
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: detailed ? 45 : 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-AU', {
              style: 'currency',
              currency: 'AUD',
              minimumFractionDigits: 0,
              notation: 'compact'
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div style={{ height: detailed ? '400px' : '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default DonationChart;