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
  FaClock,
  FaReceipt,
  FaExchangeAlt
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import styles from './AdminSharedStyles.module.css';
import analyticsStyles from './AdminAnalyticsReporting.module.css';
import { API_CONFIG } from '../config/api.config';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalyticsReporting = () => {
  const { getAuthHeaders } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [receiptStats, setReceiptStats] = useState(null);
  const [matchingStats, setMatchingStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, receiptRes, matchingRes] = await Promise.all([
        axios.get(
          `${API_CONFIG.BASE_URL}/api/admin/analytics`,
          { 
            headers: getAuthHeaders(),
            params: { dateRange }
          }
        ),
        axios.get(
          `${API_CONFIG.BASE_URL}/api/admin/receipt-approval/stats`,
          { headers: getAuthHeaders() }
        ),
        axios.get(
          `${API_CONFIG.BASE_URL}/api/admin/matching/stats`,
          { headers: getAuthHeaders() }
        )
      ]);
      
      setAnalytics(analyticsRes.data);
      setReceiptStats(receiptRes.data);
      setMatchingStats(matchingRes.data);
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
        `${API_CONFIG.BASE_URL}/api/admin/analytics/export`,
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
        <div className="display-flex gap-10">
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

      <div className={styles.card} className="mb-20">
        <div className="flex-align-center gap-20">
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
            {receiptStats && (
              <>
                <div className={styles.statCard}>
                  <h3><FaReceipt /> Pending Receipts</h3>
                  <p>{receiptStats.pending || 0}</p>
                  <span className="font-size-12 text-muted">
                    Approval Rate: {receiptStats.approvalRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className={styles.statCard}>
                  <h3><FaExchangeAlt /> Active Matches</h3>
                  <p>{matchingStats?.activeMatches || 0}</p>
                  <span className="font-size-12 text-muted">
                    Total: {formatCurrency(matchingStats?.totalMatched || 0)}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h2 className="mb-20 display-flex align-center gap-10">
                <FaTrophy className="color-hex-f59e0b" /> Top Performing Charities
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
              <h2 className="mb-20 display-flex align-center gap-10">
                <FaClock /> Recent Activity
              </h2>
              <div className="max-height-400 overflow-y-auto">
                {analytics.recentActivity?.map((activity, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    borderBottom: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaChartLine className="color-hex-2d8f7b flex-shrink-0" />
                    <span style={{ fontSize: '14px', color: '#343a40' }}>{activity}</span>
                  </div>
                ))}
                {(!analytics.recentActivity || analytics.recentActivity.length === 0) && (
                  <p style={{ textAlign: 'center', color: '#6c757d' }}>No recent activity</p>
                )}
              </div>
            </div>
          </div>

          <div className={analyticsStyles.chartsContainer}>
            <div className={styles.card}>
              <h2 className="mb-20">Donation Trends</h2>
              <div className={analyticsStyles.chartWrapper}>
                <Line
                  data={{
                    labels: analytics.donationTrends?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                      {
                        label: 'Total Donations',
                        data: analytics.donationTrends?.data || [0, 0, 0, 0],
                        borderColor: '#2d8f7b',
                        backgroundColor: 'rgba(45, 143, 123, 0.1)',
                        tension: 0.4,
                        fill: true
                      },
                      {
                        label: 'Micro-Matched',
                        data: analytics.microMatchTrends?.data || [0, 0, 0, 0],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h2 className="mb-20">Donation Distribution</h2>
              <div className={analyticsStyles.chartWrapper}>
                <Doughnut
                  data={{
                    labels: ['Direct Donations', 'Micro-Matched', 'Campaign', 'Other'],
                    datasets: [{
                      data: analytics.donationDistribution || [40, 35, 20, 5],
                      backgroundColor: [
                        '#2d8f7b',
                        '#f59e0b',
                        '#3b82f6',
                        '#e5e7eb'
                      ],
                      borderWidth: 0
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h2 className="mb-20">User Growth</h2>
              <div className={analyticsStyles.chartWrapper}>
                <Bar
                  data={{
                    labels: analytics.userGrowth?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'New Users',
                      data: analytics.userGrowth?.data || [0, 0, 0, 0, 0, 0],
                      backgroundColor: '#2d8f7b',
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h2 className="mb-20">Receipt Processing Analytics</h2>
              <div className={analyticsStyles.chartWrapper}>
                <Bar
                  data={{
                    labels: ['Approved', 'Rejected', 'Pending', 'Processing'],
                    datasets: [{
                      label: 'Receipt Status',
                      data: [
                        receiptStats?.completed || 0,
                        receiptStats?.failed || 0,
                        receiptStats?.pending || 0,
                        receiptStats?.processing || 0
                      ],
                      backgroundColor: [
                        '#10b981',
                        '#ef4444',
                        '#f59e0b',
                        '#3b82f6'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminAnalyticsReporting;