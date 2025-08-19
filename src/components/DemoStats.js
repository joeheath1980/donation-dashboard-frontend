import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaBriefcase, FaHeart, FaBullhorn } from 'react-icons/fa';
import styles from './DemoStats.module.css';
import { API_CONFIG } from '../config/api.config';

const DemoStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/demo/quick-stats`
        );
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching demo stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) return null;

  const statItems = [
    {
      icon: FaUsers,
      count: stats.counts.users,
      label: 'Demo Users',
      color: '#3b82f6'
    },
    {
      icon: FaBriefcase,
      count: stats.counts.businesses,
      label: 'Businesses',
      color: '#8b5cf6'
    },
    {
      icon: FaBullhorn,
      count: stats.counts.activeCampaigns,
      label: 'Active Campaigns',
      color: '#10b981'
    },
    {
      icon: FaHeart,
      count: stats.counts.charities,
      label: 'Charities',
      color: '#ef4444'
    }
  ];

  return (
    <div className={styles.demoStatsWidget}>
      <h3 className={styles.title}>Demo Data Available</h3>
      <p className={styles.subtitle}>
        Explore the platform with pre-populated sample data
      </p>
      
      <div className={styles.statsGrid}>
        {statItems.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <div 
              className={styles.iconContainer}
              style={{ backgroundColor: `${item.color}20` }}
            >
              <item.icon 
                className={styles.statIcon}
                data-item-color={item.color} className="dynamic-color"
              />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statCount}>{item.count}</span>
              <p className={styles.statLabel}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>All demo data is reset periodically to maintain optimal performance</p>
      </div>
    </div>
  );
};

export default DemoStats;