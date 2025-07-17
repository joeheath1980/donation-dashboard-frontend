import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaChartLine, 
  FaUsers, 
  FaDollarSign, 
  FaBullhorn,
  FaHandshake,
  FaCalendarAlt,
  FaDownload,
  FaSpinner,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaClock
} from 'react-icons/fa';
import styles from './AdminSharedStyles.module.css';

const AdminAnalyticsReporting = () => {
  const { getAuthHeaders } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/analytics`,
        { 
          headers: getAuthHeaders(),
          params: { dateRange }
        }
      );
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/analytics/export`,
        { 
          headers: getAuthHeaders(),
          params: { format, dateRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${dateRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage({ type: 'success', text: `Report exported as ${format.toUpperCase()}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error exporting report:', err);
      setMessage({ type: 'error', text: 'Failed to export report' });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChangeIndicator = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change >= 0;
    
    return (
      <span style={{ 
        color: isPositive ? '#10b981' : '#ef4444',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Analytics & Reporting</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => exportReport('csv')}
          >
            <FaDownload /> Export CSV
          </button>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => exportReport('pdf')}
          >
            <FaDownload /> Export PDF
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
          {message.text}
        </div>
      )}

      <div className={styles.card} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <FaCalendarAlt />
          <div className={styles.filters}>
            <button
              onClick={() => setDateRange('week')}
              className={`${styles.filterButton} ${dateRange === 'week' ? styles.active : ''}`}
            >
              Last Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`${styles.filterButton} ${dateRange === 'month' ? styles.active : ''}`}
            >
              Last Month
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`${styles.filterButton} ${dateRange === 'quarter' ? styles.active : ''}`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`${styles.filterButton} ${dateRange === 'year' ? styles.active : ''}`}
            >
              Last Year
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <FaSpinner className={styles.spinner} />
          <p>Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
        </div>
      ) : analytics ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3><FaUsers /> Total Users</h3>
              <p>{analytics.totalUsers || 0}</p>
              {analytics.previousPeriod && getChangeIndicator(analytics.totalUsers, analytics.previousPeriod.totalUsers)}
            </div>
            <div className={styles.statCard}>
              <h3><FaDollarSign /> Total Donations</h3>
              <p>{formatCurrency(analytics.totalDonations || 0)}</p>
              {analytics.previousPeriod && getChangeIndicator(analytics.totalDonations, analytics.previousPeriod.totalDonations)}
            </div>
            <div className={styles.statCard}>
              <h3><FaBullhorn /> Active Campaigns</h3>
              <p>{analytics.activeCampaigns || 0}</p>
              {analytics.previousPeriod && getChangeIndicator(analytics.activeCampaigns, analytics.previousPeriod.activeCampaigns)}
            </div>
            <div className={styles.statCard}>
              <h3><FaHandshake /> Business Partners</h3>
              <p>{analytics.businessPartners || 0}</p>
              {analytics.previousPeriod && getChangeIndicator(analytics.businessPartners, analytics.previousPeriod.businessPartners)}
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaTrophy style={{ color: '#f59e0b' }} /> Top Performing Charities
              </h2>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Charity Name</th>
                        <th>Total Raised</th>
                        <th>Donors</th>
                        <th>Avg Donation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topCharities?.map((charity, index) => (
                        <tr key={index}>
                          <td>
                            <strong style={{ 
                              color: index === 0 ? '#f59e0b' : index === 1 ? '#6b7280' : index === 2 ? '#a87532' : '#343a40' 
                            }}>
                              #{index + 1}
                            </strong>
                          </td>
                          <td>{charity.name}</td>
                          <td><strong>{formatCurrency(charity.totalDonations)}</strong></td>
                          <td>{charity.donorCount || 0}</td>
                          <td>{formatCurrency(charity.totalDonations / (charity.donorCount || 1))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaClock /> Recent Activity
              </h2>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {analytics.recentActivity?.map((activity, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    borderBottom: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaChartLine style={{ color: '#2d8f7b', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#343a40' }}>{activity}</span>
                  </div>
                ))}
                {(!analytics.recentActivity || analytics.recentActivity.length === 0) && (
                  <p style={{ textAlign: 'center', color: '#6c757d' }}>No recent activity</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 style={{ marginBottom: '20px' }}>Donation Trends</h2>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '40px', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <FaChartLine size={48} style={{ marginBottom: '10px' }} />
              <p>Chart visualization would go here</p>
              <p style={{ fontSize: '14px' }}>Integrate with Chart.js or Recharts for data visualization</p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminAnalyticsReporting;