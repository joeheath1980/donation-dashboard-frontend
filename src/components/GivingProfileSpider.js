import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { ImpactContext } from '../contexts/ImpactContext';
import { apiClient } from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import styles from './GivingProfileSpider.module.css';

const DEFAULT_VECTOR_LABELS = [
  'Ritualist',
  'Amplifier',
  'Deep Diver',
  'Laborer',
  'Learner',
  'Responder'
];

const DEFAULT_PROFILE = {
  axes: [0, 0, 0, 0, 0, 0],
  vectorLabels: DEFAULT_VECTOR_LABELS,
  summary: 'Log a donation, volunteering hour, or impact action to reveal your Giver DNA.'
};

const GivingProfileSpider = ({ profileData = null, useApi = true }) => {
  const impactContext = useContext(ImpactContext) || {};
  const {
    donations = [],
    oneOffContributions = [],
    volunteerActivities = [],
    fundraisingCampaigns = []
  } = impactContext;
  const [apiProfile, setApiProfile] = useState(profileData);
  const [isLoading, setIsLoading] = useState(useApi);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

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

  const profile = useMemo(() => {
    const sourceProfile = useApi ? apiProfile : profileData;
    if (!sourceProfile) return DEFAULT_PROFILE;

    const axes =
      Array.isArray(sourceProfile.axes) && sourceProfile.axes.length === 6
        ? sourceProfile.axes
        : DEFAULT_PROFILE.axes;
    const vectorLabels =
      Array.isArray(sourceProfile.vectorLabels) && sourceProfile.vectorLabels.length === 6
        ? sourceProfile.vectorLabels
        : DEFAULT_PROFILE.vectorLabels;
    const summary = typeof sourceProfile.summary === 'string' && sourceProfile.summary.trim()
      ? sourceProfile.summary
      : DEFAULT_PROFILE.summary;

    return {
      axes,
      vectorLabels,
      summary
    };
  }, [apiProfile, profileData, useApi]);

  useEffect(() => {
    if (!useApi) {
      setApiProfile(profileData || null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(API_ENDPOINTS.USER_GIVING_PROFILE);
        if (isMounted) {
          setApiProfile(response.data || null);
        }
      } catch (error) {
        if (isMounted) {
          setApiProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [useApi, dataSignature]);

  useEffect(() => {
    if (!useApi) {
      setApiProfile(profileData || null);
    }
  }, [profileData, useApi]);

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
        labels: profile.vectorLabels,
        datasets: [
          {
            label: 'Giver DNA',
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
  }, [profile.axes, profile.vectorLabels]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Giver DNA</p>
          <h3 className={styles.title}>Orientation Map</h3>
        </div>
        {isLoading && <span className={styles.loadingPill}>Updating...</span>}
      </div>
      <div className={styles.chartArea}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Giver DNA radar chart"
        />
      </div>
      <p className={styles.summary}>{profile.summary}</p>
    </div>
  );
};

export default GivingProfileSpider;
