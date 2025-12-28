import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { ImpactContext } from '../contexts/ImpactContext';
import { apiClient } from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import styles from './GivingProfileSpider.module.css';

const AXIS_LABELS = [
  'Regular giving',
  'One-off giving',
  'Fundraising',
  'Volunteering',
  'Consistency',
  'Cause diversity'
];

const CAUSE_CLUSTER_MAP = {
  'Health Services': 'Health & Wellbeing',
  'Mental Health': 'Health & Wellbeing',
  'Disability Support': 'Health & Wellbeing',
  'Education': 'Education & Youth',
  'Child Welfare': 'Education & Youth',
  'Environmental Conservation': 'Environment & Animals',
  'Animal Welfare': 'Environment & Animals',
  'Social Welfare': 'Community & Housing',
  'Housing': 'Community & Housing',
  'Community Building': 'Community & Housing',
  'Rural Support': 'Community & Housing',
  'Indigenous Support': 'Community & Housing',
  'Emergency Relief': 'Crisis & Relief',
  'Food Security': 'Crisis & Relief',
  'Refugee Support': 'Crisis & Relief',
  'Arts & Culture': 'Culture & Faith',
  'Religious': 'Culture & Faith'
};

const DIMENSION_LABELS = {
  regular: 'recurring support',
  oneOff: 'one-off giving',
  fundraising: 'fundraising',
  volunteering: 'volunteering'
};

const GIVING_STYLES = {
  balanced: { title: 'Balanced Builder' },
  steady: { title: 'Steady Sustainer' },
  responsive: { title: 'Responsive Giver' },
  handsOn: { title: 'Hands-on Helper' },
  catalyst: { title: 'Campaign Catalyst' },
  purposeful: { title: 'Purposeful Giver' },
  emerging: { title: 'Getting Started' }
};

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

const getDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const sumValues = (items, accessor) =>
  items.reduce((sum, item) => sum + (Number(accessor(item)) || 0), 0);

const isRecurringDonation = (donation) =>
  donation?.isMonthly === true ||
  donation?.donationType === 'recurring' ||
  donation?.recurringFrequency === 'monthly' ||
  donation?.recurringFrequency === 'quarterly' ||
  donation?.recurringFrequency === 'yearly' ||
  donation?.frequency === 'monthly';

const extractCharityTypes = (item) => {
  const types = new Set();
  if (item?.charityType) types.add(item.charityType);
  if (item?.category) types.add(item.category);
  if (item?.charityCategory) types.add(item.charityCategory);
  if (Array.isArray(item?.categories)) {
    item.categories.forEach((value) => {
      if (value) types.add(value);
    });
  }
  return Array.from(types);
};

const buildGivingProfile = ({
  donations,
  oneOffContributions,
  volunteerActivities,
  fundraisingCampaigns
}) => {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);

  const filterRecent = (items, dateSelector) =>
    items.filter((item) => {
      const date = getDateValue(dateSelector(item));
      return date && date >= cutoff;
    });

  const recentDonations = filterRecent(
    donations,
    (donation) => donation.date || donation.createdAt
  );
  const recentOneOff = filterRecent(
    oneOffContributions,
    (contribution) => contribution.date || contribution.createdAt
  );
  const recentVolunteering = filterRecent(
    volunteerActivities,
    (activity) => activity.date || activity.startDate
  );
  const recentFundraising = filterRecent(
    fundraisingCampaigns,
    (campaign) => campaign.updatedAt || campaign.startDate || campaign.createdAt
  );

  const hasActivity =
    recentDonations.length +
      recentOneOff.length +
      recentVolunteering.length +
      recentFundraising.length >
    0;

  const recurringDonations = recentDonations.filter(isRecurringDonation);
  const regularCandidates = recurringDonations.length > 0 ? recurringDonations : recentDonations;

  const regularMonths = new Set(
    regularCandidates
      .map((donation) => getDateValue(donation.date || donation.createdAt))
      .filter(Boolean)
      .map(getMonthKey)
  );
  const regularMonthsScore = (regularMonths.size / 12) * 100;
  const regularAmountScore = (sumValues(regularCandidates, (d) => d.amount) / 1000) * 100;
  const regularScore = clamp(regularMonthsScore * 0.6 + regularAmountScore * 0.4);

  const oneOffCountScore = (recentOneOff.length / 8) * 100;
  const oneOffAmountScore = (sumValues(recentOneOff, (d) => d.amount) / 500) * 100;
  const oneOffScore = clamp(oneOffCountScore * 0.5 + oneOffAmountScore * 0.5);

  const fundraisingAmount = sumValues(
    recentFundraising,
    (campaign) => campaign.raisedAmount || campaign.amountRaised || 0
  );
  const fundraisingAmountScore = (fundraisingAmount / 2000) * 100;
  const fundraisingCountScore = (recentFundraising.length / 3) * 100;
  const fundraisingScore = clamp(fundraisingAmountScore * 0.7 + fundraisingCountScore * 0.3);

  const volunteerHours = sumValues(recentVolunteering, (activity) => activity.hours || 0);
  const volunteerHoursScore = (volunteerHours / 48) * 100;
  const volunteerSessionScore = (recentVolunteering.length / 12) * 100;
  const volunteeringScore = clamp(volunteerHoursScore * 0.7 + volunteerSessionScore * 0.3);

  const activityMonths = new Set();
  [
    ...regularCandidates,
    ...recentOneOff,
    ...recentVolunteering,
    ...recentFundraising
  ].forEach((item) => {
    const date = getDateValue(
      item.date || item.startDate || item.createdAt || item.updatedAt
    );
    if (date) activityMonths.add(getMonthKey(date));
  });
  const consistencyScore = clamp((activityMonths.size / 12) * 100);

  const charityTypes = new Set();
  const clusterCounts = {};
  [
    ...recentDonations,
    ...recentOneOff,
    ...recentVolunteering,
    ...recentFundraising
  ].forEach((item) => {
    extractCharityTypes(item).forEach((type) => {
      charityTypes.add(type);
      const cluster = CAUSE_CLUSTER_MAP[type] || 'Community & Housing';
      clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
    });
  });

  const diversityScore = clamp((charityTypes.size / 6) * 100);
  const topCluster =
    Object.entries(clusterCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    'Broad Causes';

  const dimensionScores = {
    regular: regularScore,
    oneOff: oneOffScore,
    fundraising: fundraisingScore,
    volunteering: volunteeringScore
  };
  const sortedDimensions = Object.entries(dimensionScores).sort(([, a], [, b]) => b - a);
  const [topDimension, topScore] = sortedDimensions[0];
  const [, secondScore] = sortedDimensions[1];
  const strongDimensions = Object.values(dimensionScores).filter((score) => score >= 60).length;
  const isBalanced = strongDimensions >= 3 || (topScore >= 50 && topScore - secondScore <= 10);

  let styleKey = 'purposeful';
  if (!hasActivity) {
    styleKey = 'emerging';
  } else if (isBalanced) {
    styleKey = 'balanced';
  } else if (topDimension === 'regular' && consistencyScore >= 60) {
    styleKey = 'steady';
  } else if (topDimension === 'oneOff') {
    styleKey = 'responsive';
  } else if (topDimension === 'volunteering') {
    styleKey = 'handsOn';
  } else if (topDimension === 'fundraising') {
    styleKey = 'catalyst';
  }

  const focusDescriptor =
    diversityScore >= 70 ? 'a wide-ranging mix across' :
    diversityScore <= 35 ? 'a focused emphasis on' :
    'a selective mix of';

  const consistencyDescriptor =
    consistencyScore >= 70 ? 'with strong consistency' :
    consistencyScore >= 40 ? 'with a growing rhythm' :
    'with a lighter rhythm right now';

  let summary = '';
  if (!hasActivity) {
    summary = 'Add a donation, volunteer activity, or fundraiser to reveal your giving profile.';
  } else {
    const baseSentence = `You're a ${GIVING_STYLES[styleKey].title} with ${focusDescriptor} ${topCluster} causes.`;
    const dimensionSentence = `You lead with ${DIMENSION_LABELS[topDimension]}, ${consistencyDescriptor}.`;
    const secondary = sortedDimensions.find(
      ([key, score]) => key !== topDimension && score >= 50
    );
    const secondarySentence = secondary
      ? `You also show strength in ${DIMENSION_LABELS[secondary[0]]}.`
      : '';
    summary = [baseSentence, dimensionSentence, secondarySentence].filter(Boolean).join(' ');
  }

  return {
    axes: [
      regularScore,
      oneOffScore,
      fundraisingScore,
      volunteeringScore,
      consistencyScore,
      diversityScore
    ],
    givingType: GIVING_STYLES[styleKey].title,
    summary,
    hasActivity
  };
};

const GivingProfileSpider = () => {
  const {
    donations,
    oneOffContributions,
    volunteerActivities,
    fundraisingCampaigns
  } = useContext(ImpactContext);
  const [apiProfile, setApiProfile] = useState(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const localProfile = useMemo(
    () =>
      buildGivingProfile({
        donations: donations || [],
        oneOffContributions: oneOffContributions || [],
        volunteerActivities: volunteerActivities || [],
        fundraisingCampaigns: fundraisingCampaigns || []
      }),
    [donations, oneOffContributions, volunteerActivities, fundraisingCampaigns]
  );

  const profile = useMemo(() => {
    if (!apiProfile) return localProfile;
    const nextProfile = { ...localProfile };

    if (Array.isArray(apiProfile.axes) && apiProfile.axes.length === 6) {
      nextProfile.axes = apiProfile.axes;
    }
    if (typeof apiProfile.givingType === 'string' && apiProfile.givingType.trim()) {
      nextProfile.givingType = apiProfile.givingType;
    }
    if (typeof apiProfile.summary === 'string' && apiProfile.summary.trim()) {
      nextProfile.summary = apiProfile.summary;
    }
    if (typeof apiProfile.hasActivity === 'boolean') {
      nextProfile.hasActivity = apiProfile.hasActivity;
    }

    return nextProfile;
  }, [apiProfile, localProfile]);

  const dataSignature = useMemo(
    () =>
      [
        donations?.length || 0,
        oneOffContributions?.length || 0,
        volunteerActivities?.length || 0,
        fundraisingCampaigns?.length || 0
      ].join(':'),
    [donations, oneOffContributions, volunteerActivities, fundraisingCampaigns]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.USER_GIVING_PROFILE);
        if (isMounted) {
          setApiProfile(response.data || null);
        }
      } catch (error) {
        if (isMounted) {
          setApiProfile(null);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [dataSignature]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(context, {
      type: 'radar',
      data: {
        labels: AXIS_LABELS,
        datasets: [
          {
            label: 'Giving profile',
            data: profile.axes,
            backgroundColor: 'rgba(45, 143, 123, 0.18)',
            borderColor: '#2d8f7b',
            borderWidth: 2,
            pointBackgroundColor: '#2d8f7b',
            pointBorderColor: '#2d8f7b',
            pointHoverRadius: 5,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              display: false,
              stepSize: 20
            },
            grid: {
              color: 'rgba(45, 143, 123, 0.12)'
            },
            angleLines: {
              color: 'rgba(45, 143, 123, 0.18)'
            },
            pointLabels: {
              color: '#6D6D78',
              font: {
                size: 12,
                weight: '600'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.label}: ${Math.round(context.parsed.r)} / 100`
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [profile.axes]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Giving profile</p>
          <h3 className={styles.title}>Your Giving Snapshot</h3>
        </div>
        <span className={styles.typePill}>{profile.givingType}</span>
      </div>
      <div className={styles.chartArea}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Giving profile radar chart: ${profile.givingType}`}
        />
      </div>
      <p className={styles.summary}>{profile.summary}</p>
    </div>
  );
};

export default GivingProfileSpider;
