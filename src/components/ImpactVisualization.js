import React, { useContext, useEffect, useRef, useMemo, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { ImpactContext, calculateComplexImpactScore } from '../contexts/ImpactContext';
import AuthContext from '../contexts/AuthContext';
import { FaChartBar } from 'react-icons/fa';
import { sanitizeHTML, sanitizeTooltipData } from '../utils/sanitizer';
import styles from './ImpactVisualization.module.css';
import './SharedStyles.css';
import './ImpactVisualization.css';
import apiServices from '../services/api.service';

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

function processData(donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, actualTotalScore, hideAmounts = false) {
  if (!donations || !oneOffContributions) {
    return [];
  }

  // Use the actual total score from context (backend-calculated) if provided
  // Otherwise fall back to local calculation
  const totalScore = actualTotalScore !== undefined ? actualTotalScore : calculateComplexImpactScore({
    regularDonations: donations,
    oneOffDonations: oneOffContributions,
    volunteeringActivities: volunteerActivities,
    fundraisingCampaigns: fundraisingCampaigns
  }).totalScore;

  // Combine all activities into a single array with dates
  // Include volunteer activities - check for 'approved' status but fall back to including all if none are approved
  const approvedVols = (volunteerActivities || []).filter(v => (v.status || '').toLowerCase() === 'approved');
  const volunteerData = approvedVols.length > 0 ? approvedVols : (volunteerActivities || []);
  console.log('Volunteer activities:', { total: volunteerActivities?.length || 0, approved: approvedVols.length, using: volunteerData.length });

  const allActivities = [
    ...donations.map(d => ({
      ...d,
      type: 'donation',
      date: new Date(d.date),
      amount: Number(d.amount) || 0,
      displayAmount: hideAmounts ? 'Contribution' : `$${Number(d.amount) || 0}`,
      frequency: d.frequency
    })),
    ...oneOffContributions.map(d => ({
      ...d,
      type: 'oneOff',
      date: new Date(d.date),
      amount: Number(d.amount) || 0,
      displayAmount: hideAmounts ? 'Contribution' : `$${Number(d.amount) || 0}`
    })),
    ...volunteerData.map(v => ({
      ...v,
      type: 'volunteer',
      date: new Date(v.date || v.startDate),
      hours: Number(v.hours) || 0,
      displayAmount: hideAmounts ? 'Volunteer Activity' : `${Number(v.hours) || 0} hours`
    })),
    ...(fundraisingCampaigns || [])
      .filter(campaign => {
        // Include campaigns that have raised money or are completed/archived
        const hasRaisedMoney = (campaign.amountRaised && campaign.amountRaised > 0) || 
                               (campaign.raisedAmount && campaign.raisedAmount > 0);
        return hasRaisedMoney || campaign.status === 'archived' || campaign.status === 'completed';
      })
      .map(campaign => ({
        ...campaign,
        type: 'fundraisingCampaign',
        date: new Date(campaign.completedDate || campaign.endDate || campaign.createdAt || campaign.date),
        amount: Number(campaign.amountRaised) || Number(campaign.raisedAmount) || Number(campaign.goalAmount) || 0,
        displayAmount: hideAmounts ? 'Campaign' : `$${Number(campaign.amountRaised) || Number(campaign.raisedAmount) || Number(campaign.goalAmount) || 0} raised`,
        charity: campaign.title || campaign.name || 'Fundraising Campaign'
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
  
  // Helper to sum weighted pre-multiplier total from breakdown
  const sumPreFromBreakdown = (scoreResult) => {
    if (!scoreResult || !scoreResult.breakdown) return 0;
    return Object.values(scoreResult.breakdown).reduce((s, v) => s + (Number(v) || 0), 0);
  };

  // Helper to get tier multiplier from pre-multiplier total
  const getTierMultiplier = (pre) => {
    if (pre >= 5000) return 1.5;      // Visionary
    if (pre >= 2500) return 1.3;      // Champion
    if (pre >= 1000) return 1.2;      // Philanthropist
    if (pre >= 300) return 1.1;       // Altruist
    return 1.0;                       // Giver
  };

  // For each date, calculate deltas and build a cumulative timeline that matches per-activity deltas
  let cumulativeY = 0;
  sortedDates.forEach((dateKey, index) => {
    const currentDate = new Date(dateKey);
    const activities = groupedActivities[dateKey];
    
    // Get all activities up to and including this date
    const activitiesUpToDate = allActivities.filter(a => a.date <= currentDate);
    const activitiesBeforeDate = allActivities.filter(a => a.date < currentDate);
    
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
    
    // Compute pre-multiplier running total up to the previous date (for post-multiplier delta attribution)
    const prevScoreResult = calculateComplexImpactScore({
      regularDonations: activitiesBeforeDate.filter(a => a.type === 'donation'),
      oneOffDonations: activitiesBeforeDate.filter(a => a.type === 'oneOff'),
      volunteeringActivities: activitiesBeforeDate.filter(a => a.type === 'volunteer'),
      fundraisingCampaigns: activitiesBeforeDate.filter(a => a.type === 'fundraisingCampaign')
    });
    let runningPre = Math.round(sumPreFromBreakdown(prevScoreResult));
    let runningPost = Math.round(runningPre * getTierMultiplier(runningPre));
    
    // Calculate points for each individual activity
    const activitiesWithDetails = activities.map(activity => {
      // Calculate score with just this single activity
      let singleActivityScore = 0;
      let rawScore = 0;
      let decayFactor = 1;
      let singlePreWeighted = 0;
      
      if (activity.type === 'donation' || activity.type === 'oneOff') {
        const tempScore = calculateComplexImpactScore({
          regularDonations: activity.type === 'donation' ? [activity] : [],
          oneOffDonations: activity.type === 'oneOff' ? [activity] : [],
          volunteeringActivities: [],
          fundraisingCampaigns: []
        });
        singleActivityScore = tempScore.donationScore;
        singlePreWeighted = sumPreFromBreakdown(tempScore);
        
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
        singlePreWeighted = sumPreFromBreakdown(tempScore);
        
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
        singlePreWeighted = sumPreFromBreakdown(tempScore);
        
        // Calculate raw score for display
        const raisedAmount = activity.amountRaised || activity.raisedAmount || activity.amount || 0;
        rawScore = 0;
        let remaining = raisedAmount;
        
        // Progressive scoring based on amount raised
        if (remaining > 0) rawScore += Math.min(remaining, 100) * 0.5;
        remaining -= 100;
        if (remaining > 0) rawScore += Math.min(remaining, 400) * 0.3;
        remaining -= 400;
        if (remaining > 0) rawScore += Math.min(remaining, 1500) * 0.2;
        remaining -= 1500;
        if (remaining > 0) rawScore += Math.min(remaining, 3000) * 0.1;
        remaining -= 3000;
        if (remaining > 0) rawScore += remaining * 0.05;
        
        decayFactor = rawScore > 0 ? singleActivityScore / rawScore : 1;
      }
      
      // Compute points added to stored score (post-multiplier) attributable to this single activity
      const preAfter = runningPre + Math.round(singlePreWeighted);
      const mBefore = getTierMultiplier(runningPre);
      const mAfter = getTierMultiplier(preAfter);
      const postBefore = Math.round(runningPre * mBefore);
      const postAfter = Math.round(preAfter * mAfter);
      const pointsAddedPost = postAfter - postBefore;

      // advance running pre/post for subsequent activities on same date
      runningPre = preAfter;
      runningPost = postAfter;

      // Debug log
      if (activity.amount >= 100 || activity.hours >= 10 || activity.type === 'fundraisingCampaign') {
        console.log('Activity scoring:', {
          type: activity.type,
          amount: activity.amount || activity.amountRaised || activity.raisedAmount,
          hours: activity.hours,
          date: activity.date,
          rawScore: Math.round(rawScore),
          decayFactor: decayFactor.toFixed(2),
          finalScore: singleActivityScore,
          singlePreWeighted: Math.round(singlePreWeighted),
          pointsAddedPost,
          campaign: activity.type === 'fundraisingCampaign' ? activity.title || activity.name : undefined
        });
      }
      
      return {
        type: activity.type,
        details: activity.displayAmount,
        recipient: activity.organization || activity.charity || activity.charityName || 'Unknown',
        // Display the actual post-multiplier delta so it matches the "Points Added" and the total change
        pointsEarned: pointsAddedPost,
        rawPoints: Math.round(rawScore),
        isDecayed: decayFactor < 0.95
      };
    });
    
    // Compute actual day delta from full model (captures consistency/engagement bonuses)
    const previousPostTotal = prevScoreResult.totalScore || 0;
    const dayPostDelta = (scoreUpToDate || 0) - previousPostTotal;

    // Sum of post-multiplier deltas we attributed to activities
    const sumActivitiesPost = activitiesWithDetails.reduce((s, a) => s + (Number(a.pointsEarned) || 0), 0);

    // If there is a residual (e.g., consistency bonuses), add a synthetic bonus item
    const residual = dayPostDelta - sumActivitiesPost;
    if (Math.round(residual) !== 0) {
      activitiesWithDetails.push({
        type: 'bonus',
        details: 'Consistency/engagement adjustments',
        recipient: 'System',
        pointsEarned: Math.round(residual),
        rawPoints: Math.abs(Math.round(residual)),
        isDecayed: false
      });
    }

    cumulativeY = cumulativeY + dayPostDelta;
    processedData.push({
      x: currentDate,
      y: cumulativeY,
      activities: activitiesWithDetails,
      // Points added equals the actual day delta (post-multiplier)
      pointsEarned: dayPostDelta,
      isDense: activities.length > 1
    });
  });

  // If no processed data but there is a score, add a single point for today
  if (processedData.length === 0 && totalScore > 0) {
    // If there's a score but no activities, add a single point for today
    processedData.push({
      x: new Date(),
      y: Math.round(totalScore),
      activities: [],
      pointsEarned: Math.round(totalScore),
      isDense: false
    });
  }

  return processedData;
}

function ImpactVisualization({ hideTitle = false, hideAmounts = false }) {
  const { donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, impactScore } = useContext(ImpactContext);
  const { token } = useContext(AuthContext);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.ALL);
  const [isVisible, setIsVisible] = useState(false);
  const [impactHistory, setImpactHistory] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const containerRef = useRef(null);
  const isMountedRef = useRef(true);
  const chartIdRef = useRef(null);
  
  // Fetch impact history from the backend (authoritative)
  useEffect(() => {
    const fetchImpactHistory = async () => {
      try {
        const api = apiServices.client;
        console.log('Fetching impact history from backend...');
        const { data } = await api.get(`/api/users/impact-score/history`);
        console.log('Impact history response:', data);
        
        if (data && Array.isArray(data.timeline)) {
          console.log(`Impact history fetched: ${data.timeline.length} entries`);
          // Check if timeline has actual data or just zeros
          const hasNonZeroData = data.timeline.some(entry => entry.totalScore > 0);
          if (!hasNonZeroData && data.timeline.length > 0) {
            console.warn('Timeline has only zero values, will use fallback');
            setImpactHistory(null);
          } else {
            setImpactHistory(data.timeline);
          }
        } else {
          console.warn('Impact history response missing timeline array, using fallback');
          setImpactHistory(null);
        }
      } catch (error) {
        console.error('Error fetching impact history, will use fallback:', error.message || error);
        setImpactHistory(null);
      }
    };
    
    fetchImpactHistory();
  }, [donations, oneOffContributions, volunteerActivities, fundraisingCampaigns]);

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
    
    // If we have impact history from the API, use that instead
    if (impactHistory && Array.isArray(impactHistory) && impactHistory.length > 0) {
      console.log('Using impact history from API:', impactHistory);
      
      // Transform the API timeline data into our chart format
      const points = impactHistory.map((entry, index) => {
        const activities = [];
        
        // Calculate the actual points added to total score
        // This is the difference between current total and previous total
        const previousTotal = index > 0 ? (impactHistory[index - 1].totalScore || 0) : 0;
        const actualPointsEarned = (entry.totalScore || 0) - previousTotal;
        
        // Build activities array from the entry
        if (entry.type === 'donation') {
          activities.push({
            type: 'donation',
            details: `$${entry.amount || 0}`,
            recipient: entry.charity || 'Unknown',
            pointsEarned: actualPointsEarned,
            rawPoints: entry.score || 0,
            isDecayed: false
          });
        } else if (entry.type === 'oneOff') {
          activities.push({
            type: 'oneOff',
            details: `$${entry.amount || 0}`,
            recipient: entry.charity || 'Unknown',
            pointsEarned: actualPointsEarned,
            rawPoints: entry.score || 0,
            isDecayed: false
          });
        } else if (entry.type === 'volunteer') {
          activities.push({
            type: 'volunteer',
            details: `${entry.hours || 0} hours`,
            recipient: entry.organization || 'Unknown',
            pointsEarned: actualPointsEarned,
            rawPoints: entry.score || 0,
            isDecayed: false
          });
        } else if (entry.type === 'fundraising') {
          activities.push({
            type: 'fundraisingCampaign',
            details: `$${entry.amount || 0} raised`,
            recipient: entry.title || entry.charity || 'Fundraising Campaign',
            pointsEarned: actualPointsEarned,
            rawPoints: entry.score || 0,
            isDecayed: false
          });
        }
        
        return {
          x: new Date(entry.date),
          y: entry.totalScore || 0,
          activities: activities,
          pointsEarned: actualPointsEarned,
          isDense: false,
          // Include the cumulative fundraising total for debugging
          fundraisingTotal: entry.fundraisingTotal || 0
        };
      });
      
      console.log('Processed impact history points:', points);
      console.log('Chart Y values (total scores):', points.map(p => p.y));
      console.log('Fundraising totals:', points.map(p => p.fundraisingTotal));
      return points;
    }
    
    // Fall back to the old processing if no history available
    console.log('Raw data:', {
      donations,
      oneOffContributions,
      volunteerActivities,
      fundraisingCampaigns,
      impactScore
    });
    const points = processData(donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, impactScore, hideAmounts);
    console.log('Processed data points:', points);
    console.log('Chart Y values:', points.map(p => p.y));
    return points;
  }, [impactHistory, donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, timePeriod, impactScore, hideAmounts]);

  // Set up intersection observer to detect visibility with a safe fallback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    let fallbackTimer = null;

    if (containerRef.current) {
      observer.observe(containerRef.current);
      // Fallback: if observer never fires (e.g., layout/overflow quirks), ensure we still render
      fallbackTimer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      if (fallbackTimer) clearTimeout(fallbackTimer);
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

    // Proactively destroy any Chart.js instance tied to this canvas
    try {
      const existing = Chart.getChart(chartRef.current);
      if (existing) {
        console.log('Chart.getChart found existing chart, destroying');
        existing.destroy();
      }
    } catch (e) {}

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
            const activity = (point.activities && point.activities[0]) || { type: 'donation' };
            switch (activity.type) {
              case 'donation': return COLORS.REGULAR_DONATION_SIMPLE;
              case 'oneOff': return COLORS.ONE_OFF_DONATION_SIMPLE;
              case 'fundraisingCampaign': return COLORS.FUNDRAISING_CAMPAIGN_SIMPLE;
              case 'volunteer': return COLORS.VOLUNTEER_SIMPLE;
              case 'bonus': return '#64748b'; // slate
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
            const activity = (point.activities && point.activities[0]);
            if (!activity) return 4;
            if (activity.type === 'fundraisingCampaign' || activity.type === 'volunteer') {
              return 8;
            }
            return 6;
          },
          pointHoverRadius: function(context) {
            const point = dataPoints[context.dataIndex];
            if (point.isDense) return 12;
            const activity = (point.activities && point.activities[0]);
            if (!activity) return 6;
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
            const activity = (point.activities && point.activities[0]) || { type: 'donation' };
            switch (activity.type) {
              case 'donation': return '#4ebfa6';
              case 'oneOff': return '#1d7f6b';
              case 'fundraisingCampaign': return '#8360cb';
              case 'volunteer': return '#ef6f40';
              case 'bonus': return '#64748b';
              default: return '#4ebfa6';
            }
          },
          pointStyle: function(context) {
            const point = dataPoints[context.dataIndex];
            if (point.isDense) return 'rectRot';
            const activity = (point.activities && point.activities[0]) || { type: 'donation' };
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
                const activities = (dataPoint && Array.isArray(dataPoint.activities)) ? dataPoint.activities : [];

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
                    <span class="${styles.tooltipValue}">${sanitizeTooltipData(activity.details)}</span>
                  </div>
                  <div class="${styles.tooltipRow}">
                    <span class="${styles.tooltipLabel}">Recipient:</span>
                    <span class="${styles.tooltipValue}">${sanitizeTooltipData(activity.recipient)}</span>
                  </div>
                  <div class="${styles.tooltipRow}">
                    <span class="${styles.tooltipLabel}">Points Earned:</span>
                    <span class="${styles.tooltipValue}">
                      +${activity.pointsEarned.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      ${activity.isDecayed ? `<span style="font-size: 0.85em; opacity: 0.7">(was ${activity.rawPoints})</span>` : ''}
                    </span>
                  </div>
                `).join(`<hr class="${styles.tooltipDivider}">`);
                if (activities.length === 0) {
                  activitiesHtml = `
                    <div class="${styles.tooltipRow}">
                      <span class="${styles.tooltipLabel}">Note:</span>
                      <span class="${styles.tooltipValue}">Reconciled to current total</span>
                    </div>
                  `;
                }

                // Calculate previous total for clarity
                const currentIndex = context.tooltip.dataPoints[0].dataIndex;
                const previousTotal = currentIndex > 0 ? dataPoints[currentIndex - 1].y : 0;
                const pointsEarnedTotal = dataPoint.pointsEarned;
                
                const tooltipHTML = `
                  <div class="${styles.tooltipContent}">
                    <div class="${styles.tooltipHeader}">
                      <span class="${styles.tooltipDate}"><i class="fa fa-calendar-alt"></i> ${sanitizeTooltipData(titleLines[0])}</span>
                      ${activities.length > 1 ? `<span class="${styles.tooltipBadge}">${activities.length} activities</span>` : ''}
                    </div>
                    <div class="${styles.tooltipBody}">
                      ${activitiesHtml}
                      <hr class="${styles.tooltipDivider}">
                      <div class="${styles.tooltipRow}">
                        <span class="${styles.tooltipLabel}">Previous Total:</span>
                        <span class="${styles.tooltipValue}">${previousTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div class="${styles.tooltipRow}">
                        <span class="${styles.tooltipLabel}">Points Added:</span>
                        <span class="${styles.tooltipValue}" style="color: #4CAF50;">+${pointsEarnedTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div class="${styles.tooltipRow} ${styles.totalScore}">
                        <span class="${styles.tooltipLabel}">New Total Score:</span>
                        <span class="${styles.tooltipValue}" style="font-weight: bold;">${dataPoint.y.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                `;
                
                // Use sanitizeHTML to clean the entire tooltip HTML
                tooltipEl.innerHTML = sanitizeHTML(tooltipHTML);
              }

              const position = context.chart.canvas.getBoundingClientRect();
              const chartContainer = chartRef.current.parentElement.getBoundingClientRect();
              
              // Get activities from the data point
              const dataPoint = tooltipModel.dataPoints ? dataPoints[tooltipModel.dataPoints[0].dataIndex] : null;
              const activities = dataPoint && Array.isArray(dataPoint.activities) ? dataPoint.activities : [];
              
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
            <FaChartBar className="mr-10 text-primary" /> Impact Journey
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
          <span className={`${styles.legendDot} bg-regular-donation`}></span>
          <span>Regular Donations</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} bg-one-off-donation`}></span>
          <span>One-off Donations</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} bg-fundraising-campaign`}></span>
          <span>Fundraising Campaigns</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} bg-volunteer`}></span>
          <span>Volunteer Hours</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} bg-dense-pattern`}></span>
          <span>Multiple Activities</span>
        </div>
      </div>
    </div>
  );
}

export default ImpactVisualization;
