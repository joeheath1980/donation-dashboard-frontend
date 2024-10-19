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
    const pointsEarned = scoreResult.totalScore - cumulativeScore;
    cumulativeScore = scoreResult.totalScore;

    return {
      x: activity.date,
      y: cumulativeScore,
      activity: {
        type: activity.type,
        details: activity.type === 'volunteer' ? `${activity.hours} hours` : `$${activity.amount}`,
        recipient: activity.organization || activity.charity,
        pointsEarned: pointsEarned
      }
    };
  });
}

function ImpactVisualization({ hideTitle = false }) {
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
              enabled: false,
              external: function(context) {
                // Tooltip Element
                let tooltipEl = document.getElementById('chartjs-tooltip');

                // Create element on first render
                if (!tooltipEl) {
                    tooltipEl = document.createElement('div');
                    tooltipEl.id = 'chartjs-tooltip';
                    document.body.appendChild(tooltipEl);
                }

                // Hide if no tooltip
                const tooltipModel = context.tooltip;
                if (tooltipModel.opacity === 0) {
                    tooltipEl.style.opacity = 0;
                    return;
                }

                // Set Text
                if (tooltipModel.body) {
                    const titleLines = tooltipModel.title || [];

                    const dataPoint = dataPoints[context.tooltip.dataPoints[0].dataIndex];
                    const activity = dataPoint.activity;

                    tooltipEl.innerHTML = `
                      <div class="tooltip-content">
                        <div class="tooltip-header">
                          <span class="tooltip-date"><i class="fa fa-calendar-alt"></i> ${titleLines[0]}</span>
                        </div>
                        <div class="tooltip-body">
                          <div class="tooltip-row">
                            <span class="tooltip-label"><i class="fa fa-hand-holding-heart"></i> Type:</span>
                            <span class="tooltip-value">${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span>
                          </div>
                          <div class="tooltip-row">
                            <span class="tooltip-label"><i class="fa fa-gift"></i> Contribution:</span>
                            <span class="tooltip-value">${activity.details}</span>
                          </div>
                          <div class="tooltip-row">
                            <span class="tooltip-label"><i class="fa fa-user-friends"></i> Recipient:</span>
                            <span class="tooltip-value">${activity.recipient}</span>
                          </div>
                          <div class="tooltip-row">
                            <span class="tooltip-label"><i class="fa fa-star"></i> Points Earned:</span>
                            <span class="tooltip-value">${activity.pointsEarned.toFixed(2)}</span>
                          </div>
                          <div class="tooltip-row total-score">
                            <span class="tooltip-label"><i class="fa fa-trophy"></i> Total Impact Score:</span>
                            <span class="tooltip-value">${dataPoint.y.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    `;
                }

                const position = context.chart.canvas.getBoundingClientRect();

                // Display, position, and set styles for font
                tooltipEl.style.opacity = 1;
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                tooltipEl.style.pointerEvents = 'none';
                
                // Apply modern styles
                tooltipEl.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                tooltipEl.style.backdropFilter = 'blur(5px)';
                tooltipEl.style.color = '#333';
                tooltipEl.style.borderRadius = '8px';
                tooltipEl.style.fontSize = '14px';
                tooltipEl.style.fontFamily = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
                tooltipEl.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
                tooltipEl.style.padding = '12px 16px';
                tooltipEl.style.border = '1px solid rgba(0, 0, 0, 0.1)';
                tooltipEl.style.transition = 'all 0.3s ease';
                tooltipEl.style.zIndex = 1000;
              },
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
      {!hideTitle && (
        <h2 className={cleanStyles.header}>
          <FaChartBar style={{ marginRight: '10px', color: '#4CAF50' }} /> Impact Journey
        </h2>
      )}
      <div style={{ height: '400px', width: '100%', marginBottom: '20px', position: 'relative' }}>
        <canvas ref={chartRef} />
      </div>
      <div>
        <button onClick={handleDownload} className={cleanStyles.button}>
          <FaDownload style={{ marginRight: '5px' }} /> Export Data
        </button>
      </div>
      <style jsx>{`
        .tooltip-content {
          display: flex;
          flex-direction: column;
        }
        .tooltip-header {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #4CAF50;
        }
        .tooltip-body {
          display: flex;
          flex-direction: column;
        }
        .tooltip-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .tooltip-label {
          font-weight: 500;
          margin-right: 8px;
        }
        .tooltip-value {
          font-weight: 600;
        }
        .total-score {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          font-size: 16px;
          color: #4CAF50;
        }
        i {
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
}

export default ImpactVisualization;
