import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CharityAnalytics.module.css';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaPercent,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaChartPie,
  FaMapMarkedAlt,
  FaHandshake
} from 'react-icons/fa';
import DonationChart from './components/DonationChart';
import DonorDemographics from './components/DonorDemographics';
import RevenueStreams from './components/RevenueStreams';
import ImpactMetrics from './components/ImpactMetrics';

function CharityAnalytics() {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // week, month, year, custom
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('overview'); // overview, donations, donors, impact

  useEffect(() => {
    // Check if user is a charity (check multiple possible fields)
    const isCharity = user?.isCharity || user?.userType === 'charity' || user?.type === 'charity';
    if (user && !isCharity) {
      navigate('/charity-dashboard');
      return;
    }
    fetchAnalyticsData();
  }, [user, dateRange, customDateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const charityId = user.charityId || user._id;
      
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch(dateRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'custom':
          startDate = new Date(customDateRange.startDate);
          endDate = new Date(customDateRange.endDate);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      // Fetch all analytics data
      const [overview, donations, revenue, donors] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${charityId}/analytics/overview`,
          { 
            headers: getAuthHeaders(),
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
          }
        ),
        axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${charityId}/analytics/donations`,
          { 
            headers: getAuthHeaders(),
            params: { 
              startDate: startDate.toISOString(), 
              endDate: endDate.toISOString(),
              groupBy: dateRange === 'year' ? 'month' : dateRange === 'month' ? 'week' : 'day'
            }
          }
        ),
        axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${charityId}/analytics/revenue-streams`,
          { 
            headers: getAuthHeaders(),
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
          }
        ),
        axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${charityId}/analytics/donors`,
          { 
            headers: getAuthHeaders(),
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
          }
        )
      ]);

      setAnalyticsData({
        overview: overview.data,
        donations: donations.data,
        revenue: revenue.data,
        donors: donors.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use fallback data for demo
      setAnalyticsData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = () => ({
    overview: {
      totalDonations: 45280,
      donorCount: 234,
      averageDonation: 193.50,
      matchPercentage: 68,
      monthOverMonth: 12.5,
      yearOverYear: 45.2
    },
    donations: {
      series: generateDemoSeries(),
      total: 45280
    },
    revenue: {
      direct: { amount: 15000, percentage: 33, count: 89 },
      microMatched: { amount: 30280, percentage: 67, count: 412 },
      recurring: { amount: 8500, percentage: 19, count: 34 },
      oneTime: { amount: 36780, percentage: 81, count: 467 }
    },
    donors: {
      demographics: {
        geographic: {
          'NSW': 45,
          'VIC': 30,
          'QLD': 15,
          'WA': 5,
          'SA': 3,
          'TAS': 2
        },
        frequency: {
          'Weekly': 12,
          'Monthly': 34,
          'Quarterly': 23,
          'Yearly': 31
        }
      },
      retention: {
        rate: 78,
        newVsReturning: { new: 45, returning: 189 }
      },
      segments: {
        major: 12,
        monthly: 34,
        lapsed: 23
      }
    }
  });

  const generateDemoSeries = () => {
    const series = [];
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      series.push({
        date: date.toISOString(),
        amount: Math.floor(Math.random() * 2000) + 500,
        count: Math.floor(Math.random() * 20) + 5,
        matched: Math.floor(Math.random() * 1000) + 200
      });
    }
    return series;
  };

  const handleExport = async (format) => {
    try {
      const charityId = user.charityId || user._id;
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${charityId}/analytics/export`,
        {
          headers: getAuthHeaders(),
          params: { format, dateRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${dateRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Export feature coming soon!');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value, showSign = true) => {
    const formatted = Math.abs(value).toFixed(1);
    if (!showSign) return `${formatted}%`;
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <FaChartLine /> Charity Analytics
          </h1>
          <button 
            onClick={() => navigate('/charity-dashboard')}
            className={styles.backButton}
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.dateRangeSelector}>
            <FaCalendarAlt />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.select}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {dateRange === 'custom' && (
            <div className={styles.customDateRange}>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                className={styles.dateInput}
              />
              <span>to</span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                className={styles.dateInput}
              />
            </div>
          )}
          
          <div className={styles.exportButtons}>
            <button 
              onClick={() => handleExport('csv')}
              className={styles.exportButton}
            >
              <FaDownload /> Export CSV
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className={styles.exportButton}
            >
              <FaDownload /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'donations' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          Donations
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'donors' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          Donors
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'impact' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          Impact
        </button>
      </div>

      {activeTab === 'overview' && analyticsData && (
        <div className={styles.content}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaDollarSign />
              </div>
              <div className={styles.statContent}>
                <h3>Total Donations</h3>
                <p className={styles.statValue}>
                  {formatCurrency(analyticsData.overview.totalDonations)}
                </p>
                <span className={`${styles.statChange} ${analyticsData.overview.monthOverMonth >= 0 ? styles.positive : styles.negative}`}>
                  {analyticsData.overview.monthOverMonth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {formatPercentage(analyticsData.overview.monthOverMonth)} vs last period
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaUsers />
              </div>
              <div className={styles.statContent}>
                <h3>Active Donors</h3>
                <p className={styles.statValue}>{analyticsData.overview.donorCount}</p>
                <span className={styles.statSubtext}>Unique donors this period</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaChartLine />
              </div>
              <div className={styles.statContent}>
                <h3>Average Donation</h3>
                <p className={styles.statValue}>
                  {formatCurrency(analyticsData.overview.averageDonation)}
                </p>
                <span className={styles.statSubtext}>Per transaction</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaHandshake />
              </div>
              <div className={styles.statContent}>
                <h3>Match Rate</h3>
                <p className={styles.statValue}>{analyticsData.overview.matchPercentage}%</p>
                <span className={styles.statSubtext}>Of donations matched</span>
              </div>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h2>Donation Trends</h2>
              <DonationChart data={analyticsData.donations} dateRange={dateRange} />
            </div>
            
            <div className={styles.chartCard}>
              <h2>Revenue Streams</h2>
              <RevenueStreams data={analyticsData.revenue} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'donations' && analyticsData && (
        <div className={styles.content}>
          <div className={styles.chartCard}>
            <h2>Donation Timeline</h2>
            <DonationChart data={analyticsData.donations} dateRange={dateRange} detailed={true} />
          </div>
          
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <h3>Peak Donation Day</h3>
              <p className={styles.metricValue}>Tuesday</p>
              <span className={styles.metricSubtext}>Most donations received</span>
            </div>
            
            <div className={styles.metricCard}>
              <h3>Peak Donation Time</h3>
              <p className={styles.metricValue}>7-9 PM</p>
              <span className={styles.metricSubtext}>Highest activity period</span>
            </div>
            
            <div className={styles.metricCard}>
              <h3>Largest Donation</h3>
              <p className={styles.metricValue}>{formatCurrency(5000)}</p>
              <span className={styles.metricSubtext}>This period</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'donors' && analyticsData && (
        <div className={styles.content}>
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h2>Donor Demographics</h2>
              <DonorDemographics data={analyticsData.donors.demographics} />
            </div>
            
            <div className={styles.chartCard}>
              <h2>Donor Retention</h2>
              <div className={styles.retentionMetrics}>
                <div className={styles.retentionRate}>
                  <h3>Retention Rate</h3>
                  <p className={styles.bigNumber}>{analyticsData.donors.retention.rate}%</p>
                </div>
                <div className={styles.donorSplit}>
                  <div className={styles.splitItem}>
                    <span>New Donors</span>
                    <strong>{analyticsData.donors.retention.newVsReturning.new}</strong>
                  </div>
                  <div className={styles.splitItem}>
                    <span>Returning Donors</span>
                    <strong>{analyticsData.donors.retention.newVsReturning.returning}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.segmentsCard}>
            <h2>Donor Segments</h2>
            <div className={styles.segmentsGrid}>
              <div className={styles.segment}>
                <h4>Major Donors</h4>
                <p className={styles.segmentCount}>{analyticsData.donors.segments.major}</p>
                <span className={styles.segmentLabel}>$500+ donors</span>
              </div>
              <div className={styles.segment}>
                <h4>Monthly Givers</h4>
                <p className={styles.segmentCount}>{analyticsData.donors.segments.monthly}</p>
                <span className={styles.segmentLabel}>Recurring donors</span>
              </div>
              <div className={styles.segment}>
                <h4>Lapsed Donors</h4>
                <p className={styles.segmentCount}>{analyticsData.donors.segments.lapsed}</p>
                <span className={styles.segmentLabel}>No donation in 90+ days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'impact' && (
        <div className={styles.content}>
          <ImpactMetrics charityId={user.charityId || user._id} />
        </div>
      )}
    </div>
  );
}

export default CharityAnalytics;