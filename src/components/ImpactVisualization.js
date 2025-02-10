import React, { useContext, useEffect, useRef, useMemo, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ImpactContext, calculateComplexImpactScore } from '../contexts/ImpactContext';
import { FaChartBar } from 'react-icons/fa';
import styles from './ImpactVisualization.module.css';
import sharedStyles from './SharedStyles.css';

Chart.register(...registerables);

const TIME_PERIODS = {
  ALL: 'all',
  YEAR: 'year',
  MONTH: 'month',
  WEEK: 'week'
};

const COLORS = {
  REGULAR_DONATION: '#5ecfb6',
  ONE_OFF_DONATION: '#2d8f7b',
  FUNDRAISING_CAMPAIGN: '#9370db',
  VOLUNTEER: '#ff7f50',
  DENSE: '#ff7f50'
};

function calculateDonationPointsIncremental(amount, cumulativeTotalBefore, frequency) {
  let points = 0;
  let remainingAmount = amount;
  let totalSoFar = cumulativeTotalBefore;

  // Tier limits and rates
  const tiers = [
    { limit: 1000, rate: 1 / 100 },    // Up to $1,000
    { limit: 5000, rate: 1 / 200 },    // Up to $5,000
    { limit: Infinity, rate: 1 / 500 }  // Above $5,000
  ];

  for (const tier of tiers) {
    if (totalSoFar >= tier.limit) continue;

    const tierAvailable = tier.limit - totalSoFar;
    const amountInTier = Math.min(remainingAmount, tierAvailable);
    points += amountInTier * tier.rate;

    remainingAmount -= amountInTier;
    totalSoFar += amountInTier;

    if (remainingAmount <= 0) break;
  }

  // Regular Giving Multiplier
  let regularGivingMultiplier = 1;
  if (frequency === 'weekly') {
    regularGivingMultiplier = 1.2;
  } else if (frequency === 'monthly') {
    regularGivingMultiplier = 1.1;
  }

  points *= regularGivingMultiplier;

  return points;
}

function calculateVolunteerPointsIncremental(hours, cumulativeHoursBefore) {
  let points = 0;
  let remainingHours = hours;
  let totalHoursSoFar = cumulativeHoursBefore;

  const tiers = [
    { limit: 50, rate: 0.6 },      // Up to 50 hours
    { limit: 200, rate: 0.4 },     // Up to 200 hours
    { limit: Infinity, rate: 0.2 }  // Above 200 hours
  ];

  for (const tier of tiers) {
    if (totalHoursSoFar >= tier.limit) continue;

    const tierAvailable = tier.limit - totalHoursSoFar;
    const hoursInTier = Math.min(remainingHours, tierAvailable);
    points += hoursInTier * tier.rate;

    remainingHours -= hoursInTier;
    totalHoursSoFar += hoursInTier;

    if (remainingHours <= 0) break;
  }

  return points;
}

function calculateFundraisingPointsIncremental(amount, cumulativeTotalBefore) {
  let points = 0;
  let remainingAmount = amount;
  let totalSoFar = cumulativeTotalBefore;

  const tiers = [
    { limit: 2000, rate: 1 / 100 },    // Up to $2,000
    { limit: 10000, rate: 1 / 200 },   // Up to $10,000
    { limit: Infinity, rate: 1 / 500 }  // Above $10,000
  ];

  for (const tier of tiers) {
    if (totalSoFar >= tier.limit) continue;

    const tierAvailable = tier.limit - totalSoFar;
    const amountInTier = Math.min(remainingAmount, tierAvailable);
    points += amountInTier * tier.rate;

    remainingAmount -= amountInTier;
    totalSoFar += amountInTier;

    if (remainingAmount <= 0) break;
  }

  return points;
}

function processData(donations, oneOffContributions, volunteerActivities, fundraisingCampaigns) {
  if (!donations || !oneOffContributions) {
    return [];
  }

  // Split one-off contributions into regular and completed campaigns
  const completedCampaignsFromOneOffs = oneOffContributions.filter(contribution => 
    contribution.subject?.startsWith('Completed fundraising campaign:')
  );
  
  const regularOneOffs = oneOffContributions.filter(contribution => 
    !contribution.subject?.startsWith('Completed fundraising campaign:')
  );

  // Get archived campaigns from fundraisingCampaigns
  const archivedCampaigns = (fundraisingCampaigns || [])
    .filter(campaign => campaign.status === 'archived')
    .map(campaign => ({
      type: 'fundraisingCampaign',
      date: new Date(campaign.completedDate || campaign.endDate),
      amount: Number(campaign.raisedAmount) || Number(campaign.goalAmount) || 0,
      charity: campaign.title,
      subject: `Completed fundraising campaign: ${campaign.description}`
    }));

  // Combine all activities into a single array
  const allActivities = [
    ...donations.map(d => ({
      ...d,
      type: 'donation',
      date: new Date(d.date),
      amount: Number(d.amount) || 0,
      frequency: d.frequency
    })),
    ...regularOneOffs.map(d => ({
      ...d,
      type: 'oneOff',
      date: new Date(d.date),
      amount: Number(d.amount) || 0
    })),
    ...completedCampaignsFromOneOffs.map(d => ({
      ...d,
      type: 'fundraisingCampaign',
      date: new Date(d.date),
      amount: Number(d.amount) || 0,
      charity: d.charity || d.subject.replace('Completed fundraising campaign: ', '')
    })),
    ...archivedCampaigns,
    ...(volunteerActivities || []).map(v => ({
      ...v,
      type: 'volunteer',
      date: new Date(v.date),
      hours: Number(v.hours) || 0
    }))
  ].filter(activity => activity.date && !isNaN(activity.date.getTime()));

  // Sort activities by date
  allActivities.sort((a, b) => a.date - b.date);

  // Initialize cumulative totals
  let cumulativeDonationAmount = 0;
  let cumulativeVolunteerHours = 0;
  let cumulativeFundsRaised = 0;
  let cumulativeScore = 0;

  // Group activities by date
  const groupedActivities = allActivities.reduce((acc, activity) => {
    const dateKey = activity.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(activity);
    return acc;
  }, {});

  const processedData = [];

  Object.entries(groupedActivities).forEach(([date, activities]) => {
    const currentDate = new Date(date);
    const activitiesWithPoints = activities.map(activity => {
      let pointsEarned = 0;

      switch (activity.type) {
        case 'donation':
          pointsEarned = calculateDonationPointsIncremental(
            activity.amount,
            cumulativeDonationAmount,
            activity.frequency
          );
          cumulativeDonationAmount += activity.amount;
          break;

        case 'oneOff':
          pointsEarned = calculateDonationPointsIncremental(
            activity.amount,
            cumulativeDonationAmount,
            null
          );
          cumulativeDonationAmount += activity.amount;
          break;

        case 'volunteer':
          pointsEarned = calculateVolunteerPointsIncremental(
            activity.hours,
            cumulativeVolunteerHours
          );
          cumulativeVolunteerHours += activity.hours;
          break;

        case 'fundraisingCampaign':
          pointsEarned = calculateFundraisingPointsIncremental(
            activity.amount,
            cumulativeFundsRaised
          );
          cumulativeFundsRaised += activity.amount;
          break;

        default:
          console.warn(`Unknown activity type: ${activity.type}`);
          pointsEarned = 0;
          break;
      }

      return {
        type: activity.type,
        details: activity.type === 'volunteer' ? `${activity.hours} hours` : 
                `$${activity.amount}`,
        recipient: activity.organization || activity.charity,
        pointsEarned
      };
    });

    const totalPointsEarned = activitiesWithPoints.reduce((sum, activity) => sum + activity.pointsEarned, 0);
    cumulativeScore += totalPointsEarned;

    processedData.push({
      x: currentDate,
      y: cumulativeScore,
      activities: activitiesWithPoints,
      pointsEarned: totalPointsEarned,
      isDense: activities.length > 1
    });
  });

  // Verify total score matches
  const totalImpactScore = calculateComplexImpactScore({
    regularDonations: donations,
    oneOffDonations: oneOffContributions,
    volunteeringActivities: volunteerActivities,
    fundraisingCampaigns: fundraisingCampaigns
  }).totalScore;

  if (Math.abs(cumulativeScore - totalImpactScore) > 0.01) {
    console.warn('Cumulative score does not match total impact score', {
      cumulativeScore,
      totalImpactScore,
      difference: Math.abs(cumulativeScore - totalImpactScore)
    });
  }

  return processedData;
}

function ImpactVisualization({ hideTitle = false }) {
  const { donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, impactScore } = useContext(ImpactContext);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.ALL);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const dataPoints = useMemo(() => {
    console.log('Recalculating data points for period:', timePeriod);
    return processData(donations, oneOffContributions, volunteerActivities, fundraisingCampaigns);
  }, [donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, timePeriod]);

  useEffect(() => {
    if (!chartRef.current || !dataPoints || dataPoints.length === 0) {
      console.log('No data points or chart ref available');
      return;
    }

    console.log('Creating chart with', dataPoints.length, 'data points');
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
          fill: true,
          pointBackgroundColor: function(context) {
            const point = context.dataset.data[context.dataIndex];
            if (point.isDense) {
              return COLORS.DENSE;
            }
            const activity = point.activities[0];
            switch (activity.type) {
              case 'donation': return COLORS.REGULAR_DONATION;
              case 'oneOff': return COLORS.ONE_OFF_DONATION;
              case 'fundraisingCampaign': return COLORS.FUNDRAISING_CAMPAIGN;
              case 'volunteer': return COLORS.VOLUNTEER;
              default: return COLORS.REGULAR_DONATION;
            }
          },
          pointRadius: function(context) {
            const point = context.dataset.data[context.dataIndex];
            return point.isDense ? 8 : 6;
          },
          pointHoverRadius: function(context) {
            const point = context.dataset.data[context.dataIndex];
            return point.isDense ? 10 : 8;
          },
          pointStyle: function(context) {
            const point = context.dataset.data[context.dataIndex];
            return point.isDense ? 'rectRot' : 'circle';
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
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
                const activities = dataPoint.activities;

                let activitiesHtml = activities.map(activity => `
                  <div class="${styles.tooltipRow}">
                    <span class="${styles.tooltipLabel}">Type:</span>
                    <span class="${styles.tooltipValue}">
                      ${activity.type === 'fundraisingCampaign' ? 'Fundraising Campaign' : 
                        activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </span>
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
                `).join(`<hr class="${styles.tooltipDivider}">`);

                tooltipEl.innerHTML = `
                  <div class="${styles.tooltipContent}">
                    <div class="${styles.tooltipHeader}">
                      <span class="${styles.tooltipDate}"><i class="fa fa-calendar-alt"></i> ${titleLines[0]}</span>
                      ${activities.length > 1 ? `<span class="${styles.tooltipBadge}">${activities.length} activities</span>` : ''}
                    </div>
                    <div class="${styles.tooltipBody}">
                      ${activitiesHtml}
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
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: timePeriod === TIME_PERIODS.WEEK ? 'day' :
                    timePeriod === TIME_PERIODS.MONTH ? 'week' :
                    timePeriod === TIME_PERIODS.YEAR ? 'month' : 'month',
              displayFormats: {
                day: 'MMM d',
                week: 'MMM d',
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
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false,
              source: 'data'
            }
          },
          y: {
            title: {
              display: false
            },
            min: 0,
            max: yAxisMax,
            grid: {
              color: 'rgba(94, 207, 182, 0.1)'
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

    console.log('Chart created successfully');
  
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataPoints, impactScore, timePeriod]);

  if (!dataPoints || dataPoints.length === 0) {
    console.log('No data available for visualization');
    return <div className={sharedStyles.textCenter}>No data available for visualization</div>;
  }

  return (
    <div className={styles.container}>
      {!hideTitle && (
        <div className={styles.header}>
          <h2 className={`${styles.title} ${sharedStyles.gradientTitle}`}>
            <FaChartBar style={{ marginRight: '10px', color: '#2d8f7b' }} /> Impact Journey
          </h2>
          <div className={styles.controls}>
            <select 
              value={timePeriod} 
              onChange={(e) => setTimePeriod(e.target.value)}
              className={styles.periodSelect}
            >
              <option value={TIME_PERIODS.ALL}>All Time</option>
              <option value={TIME_PERIODS.YEAR}>Last Year</option>
              <option value={TIME_PERIODS.MONTH}>Last Month</option>
              <option value={TIME_PERIODS.WEEK}>Last Week</option>
            </select>
          </div>
        </div>
      )}
      <div className={styles.chartContainer}>
        <canvas ref={chartRef} />
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: COLORS.REGULAR_DONATION }}></span>
          <span>Regular Donations</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: COLORS.ONE_OFF_DONATION }}></span>
          <span>One-off Donations</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: COLORS.FUNDRAISING_CAMPAIGN }}></span>
          <span>Fundraising Campaigns</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: COLORS.VOLUNTEER }}></span>
          <span>Volunteer Hours</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: COLORS.DENSE, transform: 'rotate(45deg)' }}></span>
          <span>Multiple Activities</span>
        </div>
      </div>
    </div>
  );
}

export default ImpactVisualization;