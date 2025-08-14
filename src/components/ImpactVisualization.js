import React, { useContext, useEffect, useRef, useMemo, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { ImpactContext, calculateComplexImpactScore } from '../contexts/ImpactContext';
import { FaChartBar } from 'react-icons/fa';
import styles from './ImpactVisualization.module.css';
import './SharedStyles.css';
import './ImpactVisualization.css';
import { sanitizeText } from '../utils/sanitize';

// Global chart instances tracking
if (!window.__chartInstances) {
  window.__chartInstances = new Map();
}

const TIME_PERIODS = {
  ALL: 'all',
  YEAR: 'year',
  MONTH: 'month',
  WEEK: 'week'
};

const COLORS = {
  REGULAR_DONATION: 'linear-gradient(135deg, #5ecfb6 0%, #4ebfa6 100%)',
  ONE_OFF_DONATION: 'linear-gradient(135deg, #2d8f7b 0%, #1d7f6b 100%)',
  FUNDRAISING_CAMPAIGN: 'linear-gradient(135deg, #9370db 0%, #8360cb 100%)',
  VOLUNTEER: 'linear-gradient(135deg, #ff7f50 0%, #ef6f40 100%)',
  DENSE: 'linear-gradient(135deg, #ff7f50 0%, #ef6f40 100%)',
  // Simple colors for Chart.js compatibility
  REGULAR_DONATION_SIMPLE: '#5ecfb6',
  ONE_OFF_DONATION_SIMPLE: '#2d8f7b',
  FUNDRAISING_CAMPAIGN_SIMPLE: '#9370db',
  VOLUNTEER_SIMPLE: '#ff7f50',
  DENSE_SIMPLE: '#ff7f50'
};

// Old incremental calculation functions removed - now using calculateComplexImpactScore

function processData(donations, oneOffContributions, volunteerActivities, fundraisingCampaigns) {
  if (!donations || !oneOffContributions) {
    return [];
  }

  // Get the current total score using the new scoring system
  const totalScore = calculateComplexImpactScore({
    regularDonations: donations,
    oneOffDonations: oneOffContributions,
    volunteeringActivities: volunteerActivities,
    fundraisingCampaigns: fundraisingCampaigns
  }).totalScore;

  // Combine all activities into a single array with dates
  const allActivities = [
    ...donations.map(d => ({
      ...d,
      type: 'donation',
      date: new Date(d.date),
      amount: Number(d.amount) || 0,
      displayAmount: `$${Number(d.amount) || 0}`,
      frequency: d.frequency
    })),
    ...oneOffContributions.map(d => ({
      ...d,
      type: 'oneOff',
      date: new Date(d.date),
      amount: Number(d.amount) || 0,
      displayAmount: `$${Number(d.amount) || 0}`
    })),
    ...(volunteerActivities || []).map(v => ({
      ...v,
      type: 'volunteer',
      date: new Date(v.date || v.startDate),
      hours: Number(v.hours) || 0,
      displayAmount: `${Number(v.hours) || 0} hours`
    })),
    ...(fundraisingCampaigns || [])
      .filter(campaign => campaign.status === 'archived')
      .map(campaign => ({
        ...campaign,
        type: 'fundraisingCampaign',
        date: new Date(campaign.completedDate || campaign.endDate || campaign.createdAt),
        amount: Number(campaign.raisedAmount) || Number(campaign.goalAmount) || 0,
        displayAmount: `$${Number(campaign.raisedAmount) || Number(campaign.goalAmount) || 0} raised`,
        charity: campaign.title
      }))
  ].filter(activity => activity.date && !isNaN(activity.date.getTime()));

  // Sort activities by date
  allActivities.sort((a, b) => a.date - b.date);

  if (allActivities.length === 0) {
    return [];
  }

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
  const sortedDates = Object.keys(groupedActivities).sort();
  
  // For each date, calculate the score up to that point
  sortedDates.forEach((dateKey, index) => {
    const currentDate = new Date(dateKey);
    const activities = groupedActivities[dateKey];
    
    // Get all activities up to and including this date
    const activitiesUpToDate = allActivities.filter(a => a.date <= currentDate);
    
    // Group them by type for the new scoring system
    const donationsUpToDate = activitiesUpToDate.filter(a => a.type === 'donation');
    const oneOffsUpToDate = activitiesUpToDate.filter(a => a.type === 'oneOff');
    const volunteeringUpToDate = activitiesUpToDate.filter(a => a.type === 'volunteer');
    const fundraisingUpToDate = activitiesUpToDate.filter(a => a.type === 'fundraisingCampaign');
    
    // Calculate score up to this point using the new scoring system
    const scoreUpToDate = calculateComplexImpactScore({
      regularDonations: donationsUpToDate,
      oneOffDonations: oneOffsUpToDate,
      volunteeringActivities: volunteeringUpToDate,
      fundraisingCampaigns: fundraisingUpToDate
    }).totalScore;
    
    // Calculate points for each individual activity
    const activitiesWithDetails = activities.map(activity => {
      // Calculate score with just this single activity
      let singleActivityScore = 0;
      let rawScore = 0;
      let decayFactor = 1;
      
      if (activity.type === 'donation' || activity.type === 'oneOff') {
        const tempScore = calculateComplexImpactScore({
          regularDonations: activity.type === 'donation' ? [activity] : [],
          oneOffDonations: activity.type === 'oneOff' ? [activity] : [],
          volunteeringActivities: [],
          fundraisingCampaigns: []
        });
        singleActivityScore = tempScore.donationScore;
        
        // Calculate raw score without decay for display
        const amount = activity.amount || 0;
        if (amount < 15) {
          rawScore = 8; // Micro donation base
        } else {
          // Traditional donation brackets
          let remaining = amount;
          if (remaining > 0) rawScore += Math.min(remaining, 25) * 1.0;
          remaining -= 25;
          if (remaining > 0) rawScore += Math.min(remaining, 25) * 0.8;
          remaining -= 25;
          if (remaining > 0) rawScore += Math.min(remaining, 50) * 0.6;
          remaining -= 50;
          if (remaining > 0) rawScore += Math.min(remaining, 150) * 0.4;
          remaining -= 150;
          if (remaining > 0) rawScore += Math.min(remaining, 250) * 0.2;
          remaining -= 250;
          if (remaining > 0) rawScore += remaining * 0.1;
        }
        decayFactor = singleActivityScore / rawScore;
      } else if (activity.type === 'volunteer') {
        const tempScore = calculateComplexImpactScore({
          regularDonations: [],
          oneOffDonations: [],
          volunteeringActivities: [activity],
          fundraisingCampaigns: []
        });
        singleActivityScore = tempScore.volunteerScore;
        
        // Calculate raw score
        const hours = activity.hours || 0;
        rawScore = hours * 2; // 2 points per hour
        if (hours >= 8) rawScore += 8;
        else if (hours >= 4) rawScore += 4;
        else if (hours >= 2) rawScore += 2;
        decayFactor = singleActivityScore / rawScore;
      } else if (activity.type === 'fundraisingCampaign') {
        const tempScore = calculateComplexImpactScore({
          regularDonations: [],
          oneOffDonations: [],
          volunteeringActivities: [],
          fundraisingCampaigns: [activity]
        });
        singleActivityScore = tempScore.fundraisingScore;
      }
      
      // Debug log
      if (activity.amount >= 100 || activity.hours >= 10) {
        console.log('Activity scoring:', {
          type: activity.type,
          amount: activity.amount,
          hours: activity.hours,
          date: activity.date,
          rawScore: Math.round(rawScore),
          decayFactor: decayFactor.toFixed(2),
          finalScore: singleActivityScore
        });
      }
      
      return {
        type: activity.type,
        details: activity.displayAmount,
        recipient: activity.organization || activity.charity || activity.charityName || 'Unknown',
        pointsEarned: singleActivityScore,
        rawPoints: Math.round(rawScore),
        isDecayed: decayFactor < 0.95
      };
    });
    
    processedData.push({
      x: currentDate,
      y: scoreUpToDate,
      activities: activitiesWithDetails,
      pointsEarned: index > 0 ? scoreUpToDate - processedData[index - 1].y : scoreUpToDate,
      isDense: activities.length > 1
    });
  });

  // Ensure the last point matches the current total score
  if (processedData.length > 0 && processedData[processedData.length - 1].y !== totalScore) {
    processedData[processedData.length - 1].y = totalScore;
  }


  return processedData;
}

function ImpactVisualization({ hideTitle = false }) {
  const { donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, impactScore } = useContext(ImpactContext);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.ALL);
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const containerRef = useRef(null);
  const isMountedRef = useRef(true);
  const chartIdRef = useRef(null);
  
  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup chart on unmount
      if (chartInstance.current) {
        console.log('Component unmounting, destroying chart');
        try {
          chartInstance.current.destroy();
          // Remove from global registry
          if (window.__chartInstances && chartIdRef.current) {
            window.__chartInstances.delete(chartIdRef.current);
            console.log(`Removed chart ${chartIdRef.current} from global registry`);
          }
          // Clear the canvas attribute
          if (chartRef.current) {
            chartRef.current.removeAttribute('data-chart-id');
          }
        } catch (error) {
          console.error('Error destroying chart on unmount:', error);
        }
        chartInstance.current = null;
        chartIdRef.current = null;
      }
    };
  }, []);

  const dataPoints = useMemo(() => {
    console.log('Recalculating data points for period:', timePeriod);
    console.log('Raw data:', {
      donations,
      oneOffContributions,
      volunteerActivities,
      fundraisingCampaigns,
      impactScore
    });
    const points = processData(donations, oneOffContributions, volunteerActivities, fundraisingCampaigns);
    console.log('Processed data points:', points);
    console.log('Chart Y values:', points.map(p => p.y));
    return points;
  }, [donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, timePeriod]);

  // Set up intersection observer to detect visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      console.log('Chart not visible, skipping creation');
      return;
    }

    if (!chartRef.current || !dataPoints || dataPoints.length === 0) {
      console.log('No data points or chart ref available');
      return;
    }

    // Delay chart creation to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping chart creation');
        return;
      }
      
      if (!chartRef.current) {
        console.warn('Chart ref lost during timeout');
        return;
      }

      // Ensure canvas element is in the DOM
      if (!chartRef.current.parentNode) {
        console.warn('Chart canvas is not attached to DOM');
        return;
      }

      console.log('Creating chart with', dataPoints.length, 'data points');
      
      try {
        if (!chartRef.current) {
          console.error('Chart ref is null');
          return;
        }
        
        // Extra safety check for Chart.js
        if (!Chart || !Chart.defaults) {
          console.error('Chart.js not properly loaded or initialized');
          return;
        }
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) {
          console.error('Could not get 2D context from canvas');
          return;
        }

    // Check for any existing chart on this canvas
    const existingChartId = chartRef.current.getAttribute('data-chart-id');
    if (existingChartId && window.__chartInstances.has(existingChartId)) {
      const existingChart = window.__chartInstances.get(existingChartId);
      console.log('Found existing chart on canvas, destroying it');
      try {
        existingChart.destroy();
        window.__chartInstances.delete(existingChartId);
      } catch (error) {
        console.error('Error destroying existing chart from global registry:', error);
      }
    }

    if (chartInstance.current) {
      console.log('Destroying existing chart before creating new one');
      try {
        chartInstance.current.destroy();
        chartInstance.current = null;
      } catch (error) {
        console.error('Error destroying existing chart:', error);
      }
    }

    const maxScore = Math.max(impactScore, ...dataPoints.map(point => point.y));
    let yAxisMax, stepSize;

    // Updated scaling for new scoring system
    if (maxScore <= 50) {
      yAxisMax = 50;
      stepSize = 10;
    } else if (maxScore <= 100) {
      yAxisMax = 100;
      stepSize = 20;
    } else if (maxScore <= 300) {
      yAxisMax = 300;
      stepSize = 50;
    } else if (maxScore <= 500) {
      yAxisMax = 500;
      stepSize = 100;
    } else if (maxScore <= 1000) {
      yAxisMax = 1000;
      stepSize = 200;
    } else if (maxScore <= 2500) {
      yAxisMax = 2500;
      stepSize = 500;
    } else if (maxScore <= 5000) {
      yAxisMax = 5000;
      stepSize = 1000;
    } else {
      yAxisMax = Math.ceil(maxScore / 1000) * 1000;
      stepSize = yAxisMax / 5;
    }

    // Create multiple gradients for enhanced visual effect
    const lineGradient = ctx.createLinearGradient(0, 0, chartRef.current.width, 0);
    lineGradient.addColorStop(0, 'rgba(94, 207, 182, 0.6)');
    lineGradient.addColorStop(0.5, '#5ecfb6');
    lineGradient.addColorStop(1, '#2d8f7b');
    
    const fillGradient = ctx.createLinearGradient(0, 0, 0, 400);
    fillGradient.addColorStop(0, 'rgba(94, 207, 182, 0.3)');
    fillGradient.addColorStop(0.5, 'rgba(94, 207, 182, 0.1)');
    fillGradient.addColorStop(1, 'rgba(94, 207, 182, 0.01)');

    // Double-check the canvas is still valid before creating chart
    if (!chartRef.current || !document.body.contains(chartRef.current)) {
      console.warn('Canvas element is no longer in document');
      return;
    }

    // Generate unique ID for this chart
    const chartId = `impact-viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure Chart.js is properly loaded
    if (!Chart || typeof Chart !== 'function') {
      console.error('Chart.js is not properly loaded');
      return;
    }
    
    let newChart;
    try {
      // Store chart instance with cleanup check
      newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dataPoints.map(point => {
          const date = new Date(point.x);
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          });
        }),
        datasets: [{
          label: 'Personal Impact Score',
          data: dataPoints.map(point => point.y),
          borderColor: lineGradient,
          backgroundColor: fillGradient,
          borderWidth: function(context) {
            const index = context.dataIndex;
            const total = context.dataset.data.length;
            // Progressive line thickness from 2px to 4px
            return 2 + (index / total) * 2;
          },
          tension: 0.4,
          fill: true,
          segment: {
            borderColor: function(context) {
              // Create gradient effect along the line
              const index = context.p1DataIndex;
              const total = dataPoints.length;
              const progress = index / total;
              const r = Math.round(45 + (progress * 49));  // 45-94
              const g = Math.round(143 + (progress * 64)); // 143-207
              const b = Math.round(123 + (progress * 59)); // 123-182
              return `rgb(${r}, ${g}, ${b})`;
            }
          },
          pointBackgroundColor: function(context) {
            const point = dataPoints[context.dataIndex];
            if (point.isDense) {
              return COLORS.DENSE_SIMPLE;
            }
            const activity = point.activities[0];
            switch (activity.type) {
              case 'donation': return COLORS.REGULAR_DONATION_SIMPLE;
              case 'oneOff': return COLORS.ONE_OFF_DONATION_SIMPLE;
              case 'fundraisingCampaign': return COLORS.FUNDRAISING_CAMPAIGN_SIMPLE;
              case 'volunteer': return COLORS.VOLUNTEER_SIMPLE;
              default: return COLORS.REGULAR_DONATION_SIMPLE;
            }
          },
          pointBorderColor: function(context) {
            return 'rgba(255, 255, 255, 0.8)';
          },
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointRadius: function(context) {
            const point = dataPoints[context.dataIndex];
            // Milestone points are larger
            if (point.isDense) return 10;
            // Special activities get medium size
            const activity = point.activities[0];
            if (activity.type === 'fundraisingCampaign' || activity.type === 'volunteer') {
              return 8;
            }
            return 6;
          },
          pointHoverRadius: function(context) {
            const point = dataPoints[context.dataIndex];
            if (point.isDense) return 12;
            const activity = point.activities[0];
            if (activity.type === 'fundraisingCampaign' || activity.type === 'volunteer') {
              return 10;
            }
            return 8;
          },
          pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
          pointHoverBackgroundColor: function(context) {
            const point = dataPoints[context.dataIndex];
            if (point.isDense) {
              return '#ff6b3d';
            }
            const activity = point.activities[0];
            switch (activity.type) {
              case 'donation': return '#4ebfa6';
              case 'oneOff': return '#1d7f6b';
              case 'fundraisingCampaign': return '#8360cb';
              case 'volunteer': return '#ef6f40';
              default: return '#4ebfa6';
            }
          },
          pointStyle: function(context) {
            const point = dataPoints[context.dataIndex];
            if (point.isDense) return 'rectRot';
            const activity = point.activities[0];
            // Different shapes for different milestone types
            if (activity.type === 'fundraisingCampaign') return 'triangle';
            if (activity.type === 'volunteer') return 'rect';
            return 'circle';
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        layout: {
          padding: {
            left: 30,
            right: 20,
            top: 10,
            bottom: 10
          }
        },
        plugins: {
          legend: {
            display: false
          },
          crosshair: {
            line: {
              color: 'rgba(94, 207, 182, 0.3)',
              width: 1,
              dashPattern: [5, 5]
            },
            sync: {
              enabled: false
            },
            zoom: {
              enabled: false
            }
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
                      ${sanitizeText(activity.type === 'fundraisingCampaign' ? 'Fundraising Campaign' :
                        activity.type.charAt(0).toUpperCase() + activity.type.slice(1))}
                    </span>
                  </div>
                  <div class="${styles.tooltipRow}">
                    <span class="${styles.tooltipLabel}">Contribution:</span>
                    <span class="${styles.tooltipValue}">${sanitizeText(activity.details)}</span>
                  </div>
                  <div class="${styles.tooltipRow}">
                    <span class="${styles.tooltipLabel}">Recipient:</span>
                    <span class="${styles.tooltipValue}">${sanitizeText(activity.recipient)}</span>
                  </div>
                  <div class="${styles.tooltipRow}">
                    <span class="${styles.tooltipLabel}">Points Earned:</span>
                    <span class="${styles.tooltipValue}">
                      +${activity.pointsEarned.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      ${activity.isDecayed ? `<span style="font-size: 0.85em; opacity: 0.7">(was ${sanitizeText(activity.rawPoints)})</span>` : ''}
                    </span>
                  </div>
                `).join(`<hr class="${styles.tooltipDivider}">`);

                tooltipEl.innerHTML = `
                  <div class="${styles.tooltipContent}">
                    <div class="${styles.tooltipHeader}">
                      <span class="${styles.tooltipDate}"><i class="fa fa-calendar-alt"></i> ${sanitizeText(titleLines[0])}</span>
                      ${activities.length > 1 ? `<span class="${styles.tooltipBadge}">${activities.length} activities</span>` : ''}
                    </div>
                    <div class="${styles.tooltipBody}">
                      ${activitiesHtml}
                      <div class="${styles.tooltipRow} ${styles.totalScore}">
                        <span class="${styles.tooltipLabel}">Total Impact Score:</span>
                        <span class="${styles.tooltipValue}">${dataPoint.y.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                `;
              }

              const position = context.chart.canvas.getBoundingClientRect();
              const chartContainer = chartRef.current.parentElement.getBoundingClientRect();
              
              // Get activities from the data point
              const dataPoint = tooltipModel.dataPoints ? dataPoints[tooltipModel.dataPoints[0].dataIndex] : null;
              const activities = dataPoint ? dataPoint.activities : [];
              
              // Calculate tooltip dimensions (estimate based on content)
              const tooltipWidth = 320; // max-width from CSS
              const tooltipHeight = Math.min(400, 100 + (activities.length * 80)); // dynamic height based on content
              
              // Calculate initial position
              let left = position.left + window.pageXOffset + tooltipModel.caretX;
              let top = position.top + window.pageYOffset + tooltipModel.caretY;
              
              // Add offset to prevent overlapping with cursor/point
              const cursorOffset = 15;
              
              // Check if we have enough space below the cursor
              const viewportHeight = window.innerHeight;
              const scrollTop = window.pageYOffset;
              const tooltipBottom = top + tooltipHeight + cursorOffset;
              const viewportBottom = scrollTop + viewportHeight;
              
              // Position tooltip above or below based on available space
              if (tooltipBottom > viewportBottom - 20) {
                // Not enough space below, position above
                top = top - tooltipHeight - cursorOffset;
              } else {
                // Enough space below, add offset
                top = top + cursorOffset;
              }
              
              // Adjust horizontal position to keep tooltip within viewport
              const viewportWidth = window.innerWidth;
              const rightEdge = left + tooltipWidth;
              
              if (rightEdge > viewportWidth - 20) {
                // Position tooltip to the left of the cursor
                left = left - tooltipWidth - cursorOffset;
              } else if (left < 20) {
                // Too close to left edge
                left = 20;
              }
              
              // Final bounds check to ensure tooltip stays within chart container
              const chartRightEdge = chartContainer.left + window.pageXOffset + chartContainer.width;
              const chartLeftEdge = chartContainer.left + window.pageXOffset;
              
              if (left + tooltipWidth > chartRightEdge) {
                left = chartRightEdge - tooltipWidth - 10;
              }
              if (left < chartLeftEdge) {
                left = chartLeftEdge + 10;
              }
              
              tooltipEl.style.opacity = 1;
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.left = left + 'px';
              tooltipEl.style.top = top + 'px';
              tooltipEl.style.pointerEvents = 'none';
              tooltipEl.style.zIndex = '9999';
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: dataPoints.map(point => {
              const date = new Date(point.x);
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              });
            }),
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
              autoSkip: true,
              maxTicksLimit: 10,
              padding: 10,
              font: {
                weight: '500',
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              callback: function(value, index) {
                const date = new Date(dataPoints[index].x);
                const label = value;
                // Add year markers for January or first point
                if (date.getMonth() === 0 || index === 0) {
                  return [label, `(${date.getFullYear()})`];
                }
                return label;
              }
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
              drawBorder: false
            },
            ticks: {
              color: '#2d8f7b',
              padding: 15,
              stepSize: stepSize,
              font: {
                weight: '600',
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              callback: function(value) {
                return value.toLocaleString('en-US');
              }
            },
            position: 'left',
            offset: true
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true,
          animationDuration: 200
        },
        onHover: function(event, activeElements) {
          chartRef.current.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
          
          // Add vertical guide line
          if (activeElements.length > 0) {
            const activePoint = activeElements[0];
            const ctx = newChart.ctx;
            const x = activePoint.element.x;
            const topY = newChart.scales.y.top;
            const bottomY = newChart.scales.y.bottom;
            
            // Clear previous drawings
            newChart.render();
            
            // Draw vertical line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(94, 207, 182, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    });
    } catch (chartError) {
      console.error('Error creating Chart.js instance:', chartError);
      console.error('Error stack:', chartError.stack);
      console.error('Chart.js version:', Chart.version);
      console.error('Chart.js registries:', Chart.registry);
      
      // Clean up any partial instance
      if (newChart) {
        try {
          newChart.destroy();
        } catch (destroyError) {
          console.error('Error destroying partial chart:', destroyError);
        }
      }
      return;
    }
    
    // Only store if still mounted
    if (isMountedRef.current) {
      chartInstance.current = newChart;
      chartIdRef.current = chartId;
      // Store chart ID on canvas element
      chartRef.current.setAttribute('data-chart-id', chartId);
      // Register in global registry
      if (window.__chartInstances) {
        window.__chartInstances.set(chartId, newChart);
        console.log(`Chart created successfully and registered with ID: ${chartId}`);
      } else {
        console.log('Chart created successfully (no global registry available)');
      }
    } else {
      console.log('Component unmounted during chart creation, destroying');
      newChart.destroy();
    }
      } catch (error) {
        console.error('Error in chart creation:', error);
        if (chartInstance.current) {
          try {
            chartInstance.current.destroy();
          } catch (destroyError) {
            console.error('Error destroying chart after error:', destroyError);
          }
        }
      }
    }, 100); // 100ms delay to ensure DOM is ready
  
    return () => {
      clearTimeout(timeoutId);
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          // Remove from global registry
          if (window.__chartInstances && chartIdRef.current) {
            window.__chartInstances.delete(chartIdRef.current);
            console.log(`Removed chart ${chartIdRef.current} from global registry on effect cleanup`);
          }
          // Clear the canvas attribute
          if (chartRef.current) {
            chartRef.current.removeAttribute('data-chart-id');
          }
        } catch (error) {
          console.error('Error destroying chart on cleanup:', error);
        }
        chartInstance.current = null;
        chartIdRef.current = null;
      }
    };
  }, [dataPoints, impactScore, timePeriod, isVisible]);

  if (!dataPoints || dataPoints.length === 0) {
    console.log('No data available for visualization', {
      dataPoints,
      donations,
      oneOffContributions,
      volunteerActivities,
      fundraisingCampaigns,
      impactScore
    });
    return <div className="textCenter">No data available for visualization</div>;
  }

  console.log('Rendering ImpactVisualization with data:', {
    dataPoints: dataPoints.length,
    isVisible,
    chartRef: chartRef.current ? 'exists' : 'null',
    containerRef: containerRef.current ? 'exists' : 'null'
  });

  return (
    <div ref={containerRef} className={styles.container}>
      {!hideTitle && (
        <div className={styles.header}>
          <h2 className={`${styles.title} gradientTitle`}>
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
        {/* Progress indicator */}
        {dataPoints.length > 0 && (
          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${Math.min((impactScore / 500) * 100, 100)}%`,
                  background: `linear-gradient(90deg, #5ecfb6 0%, #2d8f7b ${Math.min((impactScore / 500) * 100, 100)}%)`
                }}
              />
            </div>
            <div className={styles.progressText}>
              {impactScore < 25 ? 'Keep going! You\'re making an impact' :
               impactScore < 50 ? 'Great progress! Your impact is growing' :
               impactScore < 75 ? 'Amazing! You\'re making a significant difference' :
               impactScore < 300 ? 'Incredible! You\'re building great momentum' :
               impactScore < 1000 ? 'Outstanding! You\'re an Altruist making waves' :
               impactScore < 2500 ? 'Exceptional! You\'re a true Philanthropist' :
               impactScore < 5000 ? 'Legendary! You\'re a Champion for change' :
               'Visionary! You\'re transforming the world'}
            </div>
          </div>
        )}
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.REGULAR_DONATION }}></span>
          <span>Regular Donations</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.ONE_OFF_DONATION }}></span>
          <span>One-off Donations</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.FUNDRAISING_CAMPAIGN }}></span>
          <span>Fundraising Campaigns</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.VOLUNTEER }}></span>
          <span>Volunteer Hours</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.DENSE, transform: 'rotate(45deg)' }}></span>
          <span>Multiple Activities</span>
        </div>
      </div>
    </div>
  );
}

export default ImpactVisualization;