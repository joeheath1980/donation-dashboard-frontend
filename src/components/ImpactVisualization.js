import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ImpactContext, calculateComplexImpactScore } from '../contexts/ImpactContext';
import { FaChartBar, FaDownload } from 'react-icons/fa';
import cleanStyles from './CleanDesign.module.css';

Chart.register(...registerables);

function processData(donations, oneOffContributions, volunteerActivities) {
  if (!donations || !oneOffContributions || !volunteerActivities) {
    return [];
  }

  const allActivities = [
    ...donations.map(d => ({ ...d, type: 'donation', date: new Date(d.date) })),
    ...oneOffContributions.map(d => ({ ...d, type: 'oneOff', date: new Date(d.date) })),
    ...volunteerActivities.map(v => ({ ...v, type: 'volunteer', date: new Date(v.date) }))
  ].sort((a, b) => a.date - b.date);

  const benchmarks = {
    monthlyDonationBenchmark: 100,
    oneOffDonationBenchmark: 500
  };

  let cumulativeScore = 0;
  return allActivities.map((activity, index) => {
    const currentData = {
      regularDonations: donations.filter(d => new Date(d.date) <= activity.date),
      oneOffDonations: oneOffContributions.filter(d => new Date(d.date) <= activity.date),
      volunteeringActivities: volunteerActivities.filter(v => new Date(v.date) <= activity.date),
      previousPeriodScore: index > 0 ? cumulativeScore : 0
    };

    const scoreResult = calculateComplexImpactScore(currentData, benchmarks);
    cumulativeScore = scoreResult.totalScore;

    return {
      x: activity.date,
      y: cumulativeScore
    };
  });
}

function ImpactVisualization() {
  const { donations, oneOffContributions, volunteerActivities, impactScore } = useContext(ImpactContext);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const dataPoints = useMemo(() => 
    processData(donations, oneOffContributions, volunteerActivities),
    [donations, oneOffContributions, volunteerActivities]
  );

  useEffect(() => {
    if (chartRef.current && dataPoints && dataPoints.length > 0) {
      const ctx = chartRef.current.getContext('2d');
  
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
  
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Personal Impact Score',
            data: dataPoints,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 3,
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: function(tooltipItems) {
                  return new Date(tooltipItems[0].parsed.x).toLocaleDateString();
                },
                label: function(context) {
                  return `Personal Impact Score: ${context.parsed.y}`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month',
                displayFormats: {
                  month: 'MMM yyyy'
                }
              },
              title: {
                display: false
              },
              grid: {
                display: false
              },
              ticks: {
                color: '#4CAF50',
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 6
              }
            },
            y: {
              title: {
                display: false
              },
              min: 0,
              max: Math.max(impactScore, ...dataPoints.map(point => point.y), 100),
              grid: {
                color: 'rgba(76, 175, 80, 0.1)',
              },
              ticks: {
                color: '#4CAF50',
                padding: 5,
                stepSize: 25,
                callback: function(value) {
                  return value;
                }
              }
            }
          },
          hover: {
            mode: 'nearest',
            intersect: true
          }
        }
      });
    }
  
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataPoints, impactScore]);

  const handleDownload = () => {
    if (dataPoints && dataPoints.length > 0) {
      const link = document.createElement('a');
      link.download = 'impact_data.json';
      link.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataPoints))}`;
      link.click();
    }
  };

  if (!dataPoints || dataPoints.length === 0) {
    return <div className={cleanStyles.textCenter}>No data available for visualization</div>;
  }

  return (
    <div className={cleanStyles.container}>
      <h2 className={cleanStyles.header}>
        <FaChartBar style={{ marginRight: '10px', color: '#4CAF50' }} /> Impact Journey
      </h2>
      <div style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
        <canvas ref={chartRef} />
      </div>
      <div>
        <button onClick={handleDownload} className={cleanStyles.button}>
          <FaDownload style={{ marginRight: '5px' }} /> Export Data
        </button>
      </div>
    </div>
  );
}

export default ImpactVisualization;
