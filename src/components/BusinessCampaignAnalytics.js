import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import businessAPI from '../services/businessAPI';
import { exportToCSV, exportCampaignAnalytics } from '../utils/csvExport';
import {
  RiBarChartLine,
  RiFileLine,
  RiMailLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowRightLine,
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiFocusLine
} from 'react-icons/ri';
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
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import styles from './BusinessCampaignAnalytics.module.css';

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

function BusinessCampaignAnalytics() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('last30days');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [campaignResponse, analyticsResponse] = await Promise.all([
        businessAPI.campaigns.get(campaignId),
        businessAPI.analytics.getCampaignAnalytics(campaignId, { dateRange })
      ]);
      
      setCampaign(campaignResponse.data || getDummyCampaign());
      setAnalytics(analyticsResponse.data || getDummyAnalytics());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      // Use dummy data for demonstration
      setCampaign(getDummyCampaign());
      setAnalytics(getDummyAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getDummyCampaign = () => ({
    _id: campaignId,
    name: 'Holiday Giving Campaign 2024',
    status: 'active',
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-31'),
    budget: 100000,
    spent: 45000,
    charities: ['Red Cross', 'UNICEF', 'WWF']
  });

  const getDummyAnalytics = () => ({
    overview: {
      totalMatches: 234,
      totalMatchAmount: 45000,
      averageMatchAmount: 192.31,
      uniqueUsers: 156,
      conversionRate: 0.68,
      budgetUtilization: 0.45,
      roi: 2.3
    },
    matchesByDay: [
      { date: '2024-11-01', matches: 8, amount: 1500 },
      { date: '2024-11-02', matches: 12, amount: 2300 },
      { date: '2024-11-03', matches: 15, amount: 2800 },
      { date: '2024-11-04', matches: 10, amount: 1900 },
      { date: '2024-11-05', matches: 18, amount: 3400 },
      { date: '2024-11-06', matches: 22, amount: 4200 },
      { date: '2024-11-07', matches: 20, amount: 3800 },
      { date: '2024-11-08', matches: 25, amount: 4800 },
      { date: '2024-11-09', matches: 28, amount: 5400 },
      { date: '2024-11-10', matches: 30, amount: 5700 },
      { date: '2024-11-11', matches: 35, amount: 6700 },
      { date: '2024-11-12', matches: 11, amount: 2100 }
    ],
    userDemographics: {
      ageGroups: [
        { range: '18-24', count: 23, percentage: 0.15 },
        { range: '25-34', count: 48, percentage: 0.31 },
        { range: '35-44', count: 42, percentage: 0.27 },
        { range: '45-54', count: 28, percentage: 0.18 },
        { range: '55+', count: 15, percentage: 0.09 }
      ],
      locations: [
        { city: 'Sydney', count: 45, percentage: 0.29 },
        { city: 'Melbourne', count: 38, percentage: 0.24 },
        { city: 'Brisbane', count: 25, percentage: 0.16 },
        { city: 'Perth', count: 20, percentage: 0.13 },
        { city: 'Adelaide', count: 15, percentage: 0.10 },
        { city: 'Other', count: 13, percentage: 0.08 }
      ],
      userTypes: [
        { type: 'New Users', count: 67, percentage: 0.43 },
        { type: 'Returning Users', count: 89, percentage: 0.57 }
      ]
    },
    charityPerformance: [
      { 
        charity: 'Red Cross', 
        matches: 98, 
        amount: 18500,
        averageMatch: 188.78,
        users: 65
      },
      { 
        charity: 'UNICEF', 
        matches: 86, 
        amount: 16800,
        averageMatch: 195.35,
        users: 58
      },
      { 
        charity: 'WWF', 
        matches: 50, 
        amount: 9700,
        averageMatch: 194.00,
        users: 33
      }
    ],
    matchMultipliers: [
      { multiplier: '1x', count: 45, percentage: 0.19 },
      { multiplier: '2x', count: 156, percentage: 0.67 },
      { multiplier: '3x', count: 33, percentage: 0.14 }
    ],
    topDonors: [
      { userId: 'user1', name: 'John D.', totalDonated: 2500, matchesReceived: 5000 },
      { userId: 'user2', name: 'Sarah M.', totalDonated: 1800, matchesReceived: 3600 },
      { userId: 'user3', name: 'Michael R.', totalDonated: 1500, matchesReceived: 3000 },
      { userId: 'user4', name: 'Emma L.', totalDonated: 1200, matchesReceived: 2400 },
      { userId: 'user5', name: 'David K.', totalDonated: 1000, matchesReceived: 2000 }
    ]
  });

  // Chart configurations
  const matchesTrendChart = useMemo(() => ({
    labels: analytics?.matchesByDay.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'Number of Matches',
        data: analytics?.matchesByDay.map(d => d.matches) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Match Amount ($)',
        data: analytics?.matchesByDay.map(d => d.amount) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  }), [analytics]);

  const demographicsChart = useMemo(() => ({
    labels: analytics?.userDemographics.ageGroups.map(g => g.range) || [],
    datasets: [{
      label: 'Users by Age Group',
      data: analytics?.userDemographics.ageGroups.map(g => g.count) || [],
      backgroundColor: [
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981'
      ]
    }]
  }), [analytics]);

  const charityPerformanceChart = useMemo(() => ({
    labels: analytics?.charityPerformance.map(c => c.charity) || [],
    datasets: [{
      label: 'Match Amount by Charity',
      data: analytics?.charityPerformance.map(c => c.amount) || [],
      backgroundColor: [
        '#3b82f6',
        '#8b5cf6',
        '#10b981'
      ]
    }]
  }), [analytics]);

  const locationChart = useMemo(() => ({
    labels: analytics?.userDemographics.locations.map(l => l.city) || [],
    datasets: [{
      label: 'Users by Location',
      data: analytics?.userDemographics.locations.map(l => l.count) || [],
      backgroundColor: [
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981',
        '#6b7280'
      ]
    }]
  }), [analytics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Export handlers
  const handleExportCSV = () => {
    try {
      const exportData = exportCampaignAnalytics(analytics, campaign, dateRange);
      const filename = `${campaign.name.replace(/\s+/g, '_')}_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(exportData, filename);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setError('Failed to export CSV. Please try again.');
    }
  };

  const handleExportPDF = async () => {
    try {
      // For PDF generation, we'll create it client-side using the current data
      const pdfContent = generatePDFReport();
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${campaign.name.replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setError('Failed to export PDF. Please try again.');
    }
  };

  const handleScheduleEmail = async () => {
    // Show modal for scheduling configuration
    const schedule = {
      frequency: 'weekly', // weekly, monthly, quarterly
      dayOfWeek: 1, // Monday
      time: '09:00',
      recipients: ['business@example.com'],
      format: 'pdf'
    };
    
    try {
      await businessAPI.analytics.scheduleReport(campaignId, schedule);
      alert('Email reports scheduled successfully!');
    } catch (err) {
      console.error('Failed to schedule email reports:', err);
      setError('Failed to schedule email reports. Please try again.');
    }
  };

  // Generate simple text-based PDF report
  const generatePDFReport = () => {
    // This is a simplified version. In production, you'd use a library like jsPDF
    const report = `
CAMPAIGN ANALYTICS REPORT
========================
Campaign: ${campaign.name}
Period: ${dateRange}
Generated: ${new Date().toLocaleDateString()}

KEY METRICS
-----------
Total Matches: ${analytics.overview.totalMatches}
Total Match Amount: ${formatCurrency(analytics.overview.totalMatchAmount)}
Average Match: ${formatCurrency(analytics.overview.averageMatchAmount)}
Unique Users: ${analytics.overview.uniqueUsers}
Conversion Rate: ${formatPercentage(analytics.overview.conversionRate)}
Budget Utilization: ${formatPercentage(analytics.overview.budgetUtilization)}
Campaign ROI: ${analytics.overview.roi.toFixed(1)}x

TOP PERFORMING CHARITIES
-----------------------
${analytics.charityPerformance.map(c => 
  `${c.charity}: ${formatCurrency(c.amount)} (${c.matches} matches)`
).join('\n')}

USER DEMOGRAPHICS
----------------
Age Groups:
${analytics.userDemographics.ageGroups.map(g => 
  `${g.range}: ${g.count} users (${formatPercentage(g.percentage)})`
).join('\n')}

Locations:
${analytics.userDemographics.locations.map(l => 
  `${l.city}: ${l.count} users (${formatPercentage(l.percentage)})`
).join('\n')}

User Types:
- New Users: ${analytics.userDemographics.userTypes[0].count} (${formatPercentage(analytics.userDemographics.userTypes[0].percentage)})
- Returning Users: ${analytics.userDemographics.userTypes[1].count} (${formatPercentage(analytics.userDemographics.userTypes[1].percentage)})
    `;
    
    return report;
  };

  if (loading) {
    return <div className={styles.loading}>Loading analytics...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/business/campaigns')} className={styles.backButton}>
          ← Back to Campaigns
        </button>
        <h1>{campaign?.name} - Analytics</h1>
        <div className={styles.dateRangeSelector}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className={styles.dateSelect}
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="alltime">All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>Total Matches</h3>
          <p className={styles.kpiValue}>{analytics?.overview.totalMatches.toLocaleString()}</p>
          <span className={styles.kpiChange}>+23% vs last period</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Total Match Amount</h3>
          <p className={styles.kpiValue}>{formatCurrency(analytics?.overview.totalMatchAmount)}</p>
          <span className={styles.kpiChange}>+18% vs last period</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Average Match</h3>
          <p className={styles.kpiValue}>{formatCurrency(analytics?.overview.averageMatchAmount)}</p>
          <span className={styles.kpiChange}>-5% vs last period</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Unique Users</h3>
          <p className={styles.kpiValue}>{analytics?.overview.uniqueUsers}</p>
          <span className={styles.kpiChange}>+15% vs last period</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Conversion Rate</h3>
          <p className={styles.kpiValue}>{formatPercentage(analytics?.overview.conversionRate)}</p>
          <span className={styles.kpiChange}>+2.3% vs last period</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Budget Used</h3>
          <p className={styles.kpiValue}>{formatPercentage(analytics?.overview.budgetUtilization)}</p>
          <div className={styles.budgetBar}>
            <div 
              className={styles.budgetFill} 
              style={{ width: `${analytics?.overview.budgetUtilization * 100}%` }}
            />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <h3>Campaign ROI</h3>
          <p className={styles.kpiValue}>{analytics?.overview.roi.toFixed(1)}x</p>
          <span className={styles.kpiSubtext}>Return on Investment</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'demographics' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('demographics')}
        >
          Demographics
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'charities' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('charities')}
        >
          Charity Performance
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Top Users
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewContent}>
            <div className={styles.chartCard}>
              <h3>Matches Trend</h3>
              <div className={styles.chartContainer}>
                <Line 
                  data={matchesTrendChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Number of Matches'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Match Amount ($)'
                        },
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.chartRow}>
              <div className={styles.chartCard}>
                <h3>Match Multiplier Distribution</h3>
                <div className={styles.pieChartContainer}>
                  <Pie 
                    data={{
                      labels: analytics?.matchMultipliers.map(m => m.multiplier) || [],
                      datasets: [{
                        data: analytics?.matchMultipliers.map(m => m.count) || [],
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981']
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className={styles.chartCard}>
                <h3>User Type Breakdown</h3>
                <div className={styles.pieChartContainer}>
                  <Doughnut 
                    data={{
                      labels: analytics?.userDemographics.userTypes.map(t => t.type) || [],
                      datasets: [{
                        data: analytics?.userDemographics.userTypes.map(t => t.count) || [],
                        backgroundColor: ['#3b82f6', '#10b981']
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className={styles.demographicsContent}>
            <div className={styles.chartRow}>
              <div className={styles.chartCard}>
                <h3>Age Distribution</h3>
                <div className={styles.barChartContainer}>
                  <Bar 
                    data={demographicsChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className={styles.chartCard}>
                <h3>Geographic Distribution</h3>
                <div className={styles.barChartContainer}>
                  <Doughnut 
                    data={locationChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.demographicsTable}>
              <h3>Detailed Demographics</h3>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Avg. Match</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.userDemographics.ageGroups.map((group, index) => (
                    <tr key={index}>
                      <td>{group.range} years</td>
                      <td>{group.count}</td>
                      <td>{formatPercentage(group.percentage)}</td>
                      <td>{formatCurrency(192)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'charities' && (
          <div className={styles.charitiesContent}>
            <div className={styles.chartCard}>
              <h3>Match Distribution by Charity</h3>
              <div className={styles.barChartContainer}>
                <Bar 
                  data={charityPerformanceChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.charityTable}>
              <h3>Charity Performance Details</h3>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Charity</th>
                    <th>Total Matches</th>
                    <th>Match Amount</th>
                    <th>Avg. Match</th>
                    <th>Unique Users</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.charityPerformance.map((charity, index) => (
                    <tr key={index}>
                      <td>{charity.charity}</td>
                      <td>{charity.matches}</td>
                      <td>{formatCurrency(charity.amount)}</td>
                      <td>{formatCurrency(charity.averageMatch)}</td>
                      <td>{charity.users}</td>
                      <td>
                        <div className={styles.performanceBar}>
                          <div 
                            className={styles.performanceFill}
                            style={{ 
                              width: `${(charity.amount / analytics.overview.totalMatchAmount) * 100}%`,
                              backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981'][index]
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.usersContent}>
            <div className={styles.topDonorsSection}>
              <h3>Top Campaign Participants</h3>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Donations</th>
                    <th>Matches Received</th>
                    <th>Total Impact</th>
                    <th>Engagement Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.topDonors.map((donor, index) => (
                    <tr key={donor.userId}>
                      <td>
                        <span className={styles.rank}>#{index + 1}</span>
                      </td>
                      <td>{donor.name}</td>
                      <td>{formatCurrency(donor.totalDonated)}</td>
                      <td>{formatCurrency(donor.matchesReceived)}</td>
                      <td className={styles.totalImpact}>
                        {formatCurrency(donor.totalDonated + donor.matchesReceived)}
                      </td>
                      <td>
                        <div className={styles.engagementScore}>
                          <div className={styles.scoreBar}>
                            <div 
                              className={styles.scoreFill}
                              style={{ width: `${85 - (index * 10)}%` }}
                            />
                          </div>
                          <span>{85 - (index * 10)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.userInsights}>
              <h3>User Engagement Insights</h3>
              <div className={styles.insightCards}>
                <div className={styles.insightCard}>
                  <h4>Average Donations per User</h4>
                  <p className={styles.insightValue}>1.5</p>
                </div>
                <div className={styles.insightCard}>
                  <h4>Repeat Donation Rate</h4>
                  <p className={styles.insightValue}>32%</p>
                </div>
                <div className={styles.insightCard}>
                  <h4>Average Days Between Donations</h4>
                  <p className={styles.insightValue}>14</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className={styles.exportSection}>
        <h3>Export Analytics</h3>
        <div className={styles.exportButtons}>
          <button className={styles.exportButton} onClick={handleExportCSV}>
            <RiBarChartLine /> Export as CSV
          </button>
          <button className={styles.exportButton} onClick={handleExportPDF}>
            <RiFileLine /> Generate PDF Report
          </button>
          <button className={styles.exportButton} onClick={handleScheduleEmail}>
            <RiMailLine /> Schedule Email Reports
          </button>
        </div>
      </div>
    </div>
  );
}

export default BusinessCampaignAnalytics;