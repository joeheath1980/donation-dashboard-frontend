import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ImpactContext, calculateComplexImpactScore } from '../contexts/ImpactContext';
import { FaChartBar } from 'react-icons/fa';
import styles from './ImpactVisualization.module.css';

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

  console.log('DataPoints:', dataPoints); // Debug log

  useEffect(() => {
    if (chartRef.current && dataPoints && dataPoints.length > 0) {
      const ctx = chartRef.current.getContext('2d');
  
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const maxScore = Math.max(impactScore, ...dataPoints.map(point => point.y));
      let yAxisMax, stepSize;

      if (maxScore <= 25) {
        yAxisMax = 25;
        stepSize = 5;
      } else if (maxScore <= 50) {
        yAxisMax = 50;
        stepSize = 10;
      } else if (maxScore <= 75) {
        yAxisMax = 75;
        stepSize = 15;
      } else {
        yAxisMax = Math.ceil(maxScore / 25) * 25;
        stepSize = yAxisMax / 5;
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#5ecfb6');
      gradient.addColorStop(1, '#2d8f7b');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Personal Impact Score',
            data: dataPoints,
            borderColor: gradient,
            backgroundColor: 'rgba(94, 207, 182, 0.1)',
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
                let tooltipEl = document.getElementById('chartjs-tooltip');

                if (!tooltipEl) {
                    tooltipEl = document.createElement('div');
                    tooltipEl.id = 'chartjs-tooltip';
                    document.body.appendChild(tooltipEl);
                }

                const tooltipModel = context.tooltip;
                if (tooltipModel.opacity === 0) {
                    tooltipEl.style.opacity = 0;
                    return;
                }

                if (tooltipModel.body) {
                    const titleLines = tooltipModel.title || [];
                    const dataPoint = dataPoints[context.tooltip.dataPoints[0].dataIndex];
                    const activity = dataPoint.activity;

                    tooltipEl.innerHTML = `
                      <div class="${styles.tooltipContent}">
                        <div class="${styles.tooltipHeader}">
                          <span class="${styles.tooltipDate}"><i class="fa fa-calendar-alt"></i> ${titleLines[0]}</span>
                        </div>
                        <div class="${styles.tooltipBody}">
                          <div class="${styles.tooltipRow}">
                            <span class="${styles.tooltipLabel}">Type:</span>
                            <span class="${styles.tooltipValue}">${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span>
                          </div>
                          <div class="${styles.tooltipRow}">
                            <span class="${styles.tooltipLabel}">Contribution:</span>
                            <span class="${styles.tooltipValue}">${activity.details}</span>
                          </div>
                          <div class="${styles.tooltipRow}">
                            <span class="${styles.tooltipLabel}">Recipient:</span>
                            <span class="${styles.tooltipValue}">${activity.recipient}</span>
                          </div>
                          <div class="${styles.tooltipRow}">
                            <span class="${styles.tooltipLabel}">Points Earned:</span>
                            <span class="${styles.tooltipValue}">${activity.pointsEarned.toFixed(2)}</span>
                          </div>
                          <div class="${styles.tooltipRow} ${styles.totalScore}">
                            <span class="${styles.tooltipLabel}">Total Impact Score:</span>
                            <span class="${styles.tooltipValue}">${dataPoint.y.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    `;
                }

                const position = context.chart.canvas.getBoundingClientRect();
                tooltipEl.style.opacity = 1;
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                tooltipEl.style.pointerEvents = 'none';
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
                color: '#2d8f7b',
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
              max: yAxisMax,
              grid: {
                color: 'rgba(94, 207, 182, 0.1)',
              },
              ticks: {
                color: '#2d8f7b',
                padding: 5,
                stepSize: stepSize,
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

      console.log('Chart instance created:', chartInstance.current); // Debug log
    }
  
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataPoints, impactScore]);

  console.log('Rendering ImpactVisualization'); // Debug log

  if (!dataPoints || dataPoints.length === 0) {
    console.log('No data available for visualization'); // Debug log
    return <div className={styles.textCenter}>No data available for visualization</div>;
  }

  return (
    <div className={styles.container}>
      {!hideTitle && (
        <h2 className={styles.header}>
          <FaChartBar style={{ marginRight: '10px', color: '#2d8f7b' }} /> Impact Journey
        </h2>
      )}
      <div style={{ height: '400px', width: '100%', marginBottom: '20px', position: 'relative' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}

export default ImpactVisualization;
