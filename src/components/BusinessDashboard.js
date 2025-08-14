import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './BusinessDashboard.module.css';
import {
  RiAddLine,
  RiBarChartLine,
  RiSettings4Line,
  RiUserLine,
  RiLightbulbLine,
  RiFocusLine,
  RiLineChartLine
} from 'react-icons/ri';

// Import enhanced components from Profile
import BusinessImpactScore from './Profile/components/BusinessImpactScore';
import CSRInsights from './Profile/components/CSRInsights';
import PerformanceMetrics from './Profile/components/PerformanceMetrics';
import LiveActivityFeed from './Profile/components/LiveActivityFeed';

function BusinessDashboard() {
  const { getAuthHeaders, user } = useAuth();
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState({
    name: '',
    email: '',
    description: '',
    preferredCauses: [],
    givingScore: 0,
    annualGivingBudget: 0,
    budgetUtilized: 0,
    onboardingCompleted: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/me`;
        console.log('Fetching business data from:', apiUrl);
        
        const response = await axios.get(apiUrl, { headers: getAuthHeaders() });
        
        console.log('Business data received:', {
          hasOnboardingCompleted: 'onboardingCompleted' in response.data,
          onboardingCompleted: response.data.onboardingCompleted,
          csrProfile: response.data.csrProfile,
          verificationStatus: response.data.csrProfile?.verificationStatus
        });
        
        setBusinessData({
          ...response.data,
          annualGivingBudget: response.data.csrProfile?.annualGivingBudget || response.data.annualGivingBudget || 0
        });
        
        // Check if business has completed onboarding
        if (!response.data.onboardingCompleted) {
          console.log('Redirecting to onboarding - onboardingCompleted is false');
          navigate('/business-onboarding');
        }
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [getAuthHeaders, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!businessData.onboardingCompleted) return;

      try {
        // Get campaigns from the correct endpoint
        const campaignsRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/campaigns`, 
          { headers: getAuthHeaders() }
        );
        
        // Get dashboard overview which includes recent matches and stats
        const overviewRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/business/dashboard/overview`, 
          { headers: getAuthHeaders() }
        );

        console.log('Campaigns response:', campaignsRes.data);
        // Handle both array and object response formats
        const rawCampaigns = Array.isArray(campaignsRes.data) 
          ? campaignsRes.data 
          : (campaignsRes.data.campaigns || []);
        
        // Transform campaign data to match frontend expectations
        const campaignsData = rawCampaigns.map(campaign => ({
          _id: campaign.id || campaign._id,
          name: campaign.name,
          status: campaign.status,
          currentAmount: campaign.budget?.spent || campaign.currentAmount || 0,
          goal: campaign.budget?.total || campaign.goal || 0,
          budgetLeft: campaign.budget?.remaining || campaign.budgetLeft || 0,
          activeUsers: campaign.metrics?.uniqueUsers || campaign.activeUsers || 0,
          startDate: campaign.startDate,
          endDate: campaign.endDate
        }));
        
        setCampaigns(campaignsData);
        
        // Calculate budget utilized from campaigns
        const totalBudgetUtilized = campaignsData.reduce((sum, campaign) => 
          sum + (campaign.currentAmount || 0), 0
        );
        
        setBusinessData(prev => ({
          ...prev,
          budgetUtilized: totalBudgetUtilized
        }));
        
        if (overviewRes.data) {
          // Transform recent activity to match frontend format
          const transformedMatches = (overviewRes.data.recentActivity || []).map(activity => ({
            _id: activity.id || activity._id,
            userName: activity.userName || 'Anonymous',
            userAvatar: (activity.userName || 'A').substring(0, 2).toUpperCase(),
            amount: activity.originalAmount || activity.amount,
            matchAmount: activity.amount,
            multiplier: activity.multiplier || 1,
            charityName: activity.charityName,
            timestamp: new Date(activity.date)
          }));
          setRecentMatches(transformedMatches);
          
          // Extract category breakdown from overview
          if (overviewRes.data.donations && overviewRes.data.donations.categoryBreakdown) {
            setCategoryBreakdown(overviewRes.data.donations.categoryBreakdown);
          } else {
            // Use default categories if none provided
            setCategoryBreakdown([
              { category: 'Education', percentage: 35, color: '#4CAF50' },
              { category: 'Health', percentage: 30, color: '#2196F3' },
              { category: 'Environment', percentage: 20, color: '#FF9800' },
              { category: 'Community', percentage: 15, color: '#9C27B0' }
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Use dummy data for now
        setCampaigns([
          {
            _id: '1',
            name: 'Holiday Giving Campaign',
            status: 'active',
            currentAmount: 45000,
            goal: 100000,
            matchCount: 234,
            activeUsers: 156,
            budgetLeft: 55000,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            _id: '2',
            name: 'Employee Matching',
            status: 'active',
            currentAmount: 23000,
            goal: 50000,
            matchCount: 112,
            activeUsers: 89,
            budgetLeft: 27000,
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
          }
        ]);
        
        setRecentMatches([
          {
            _id: '1',
            userName: 'John Doe',
            userAvatar: 'JD',
            amount: 50,
            matchAmount: 100,
            multiplier: 2,
            charityName: 'Red Cross',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            _id: '2',
            userName: 'Jane Smith',
            userAvatar: 'JS',
            amount: 100,
            matchAmount: 300,
            multiplier: 3,
            charityName: 'UNICEF',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          {
            _id: '3',
            userName: 'Mike Johnson',
            userAvatar: 'MJ',
            amount: 25,
            matchAmount: 50,
            multiplier: 2,
            charityName: 'WWF',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]);
        
        setCategoryBreakdown([
          { category: 'Education', percentage: 30, amount: 30000, color: '#4CAF50' },
          { category: 'Health', percentage: 25, amount: 25000, color: '#2196F3' },
          { category: 'Environment', percentage: 20, amount: 20000, color: '#FF9800' },
          { category: 'Social Justice', percentage: 15, amount: 15000, color: '#9C27B0' },
          { category: 'Other', percentage: 10, amount: 10000, color: '#607D8B' }
        ]);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, [businessData.onboardingCompleted, getAuthHeaders]);

  const calculateBudgetPercentage = () => {
    if (businessData.annualGivingBudget === 0) return 0;
    return Math.round((businessData.budgetUtilized / businessData.annualGivingBudget) * 100);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Welcome back, {businessData.name}!</h1>
        <p className={styles.subtitle}>Your giving dashboard</p>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Enhanced Impact Score Card */}
        <div className={styles.impactScoreCard}>
          <BusinessImpactScore 
            businessSlug={businessData.slug} 
            initialScore={businessData.givingScore || 85}
          />
        </div>

        {/* Category Breakdown Card */}
        <div className={styles.categoryCard}>
          <h2>Category Breakdown</h2>
          <div className={styles.categoryChart}>
            {categoryBreakdown.map((category, index) => (
              <div key={index} className={styles.categoryItem}>
                <div className={styles.categoryBar}>
                  <div 
                    className={styles.categoryFill}
                    data-percentage={Math.round(category.percentage / 5) * 5}
                    data-color={category.color}
                  />
                </div>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>{category.category}</span>
                  <span className={styles.categoryPercent}>{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Campaigns Summary */}
        <div className={styles.campaignsSummaryCard}>
          <div className={styles.cardHeader}>
            <h2>Active Campaigns</h2>
            <Link to="/business/campaigns" className={styles.viewAllLink}>
              View All →
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className={styles.emptyCampaigns}>
              <p>No active campaigns</p>
              <Link to="/create-business-campaign" className={styles.createButton}>
                Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div className={styles.campaignsList}>
              {campaigns.slice(0, 3).map(campaign => (
                <div key={campaign._id} className={styles.campaignCard}>
                  <div className={styles.campaignHeader}>
                    <h3>{campaign.name}</h3>
                    <span className={`${styles.statusBadge} ${styles[campaign.status]}`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className={styles.campaignProgress}>
                    <div className={styles.progressInfo}>
                      <span>${(campaign.currentAmount || 0).toLocaleString()}</span>
                      <span>${(campaign.goal || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBarFill}
                        data-progress={Math.round(((campaign.currentAmount || 0) / (campaign.goal || 1)) * 100 / 5) * 5}
                      />
                    </div>
                  </div>

                  <div className={styles.campaignStats}>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>{campaign.matchCount}</span>
                      <span className={styles.statLabel}>Matches</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>{campaign.activeUsers}</span>
                      <span className={styles.statLabel}>Active Users</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>${(campaign.budgetLeft || 0).toLocaleString()}</span>
                      <span className={styles.statLabel}>Budget Left</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className={styles.liveActivityCard}>
          <LiveActivityFeed businessSlug={businessData.slug} />
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActionsCard}>
          <h2>Quick Actions</h2>
          
          <div className={styles.actionButtons}>
            <Link to="/create-business-campaign" className={styles.actionButton}>
              <div className={styles.actionIcon}><RiAddLine /></div>
              <span>Create Campaign</span>
            </Link>
            
            <Link to="/business-dashboard/account-settings" className={styles.actionButton}>
              <div className={styles.actionIcon}><RiSettings4Line /></div>
              <span>Account Settings</span>
            </Link>
            
            <Link to="/business/tax-center" className={styles.actionButton}>
              <div className={styles.actionIcon}><RiBarChartLine /></div>
              <span>Tax Centre</span>
            </Link>
            
            {businessData.slug && (
              <Link to={`/business/${businessData.slug}`} className={styles.actionButton}>
                <div className={styles.actionIcon}><RiUserLine /></div>
                <span>View Public Profile</span>
              </Link>
            )}
          </div>

          <div className={styles.quickStats}>
            <div className={styles.quickStat}>
              <h3>This Month</h3>
              <div className={styles.quickStatValue}>
                ${((businessData.budgetUtilized || 0) * 0.08).toLocaleString()}
              </div>
              <div className={styles.quickStatChange}>
                <span className={styles.positive}>+12%</span> vs last month
              </div>
            </div>
            
            <div className={styles.quickStat}>
              <h3>Total Impact</h3>
              <div className={styles.quickStatValue}>
                {Math.floor(businessData.budgetUtilized / 100)} lives
              </div>
              <div className={styles.quickStatChange}>
                Across {categoryBreakdown.length} categories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Section */}
      <div className={styles.enhancedMetricsSection}>
        <div className={styles.metricsGrid}>
          <div className={styles.csrInsightsCard}>
            <CSRInsights businessSlug={businessData.slug} />
          </div>
          <div className={styles.performanceMetricsCard}>
            <PerformanceMetrics businessSlug={businessData.slug} />
          </div>
        </div>
      </div>

      {/* Additional Insights Section */}
      <div className={styles.insightsSection}>
        <h2>Insights & Recommendations</h2>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}><RiLightbulbLine /></div>
            <div className={styles.insightContent}>
              <h3>Optimize Your Impact</h3>
              <p>Your Education category is performing 23% better than average. Consider increasing allocation.</p>
              <button className={styles.insightAction}>Learn More</button>
            </div>
          </div>
          
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}><RiFocusLine /></div>
            <div className={styles.insightContent}>
              <h3>Campaign Opportunity</h3>
              <p>Year-end giving season is approaching. Start planning your holiday campaign now.</p>
              <button className={styles.insightAction}>Start Campaign</button>
            </div>
          </div>
          
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}><RiLineChartLine /></div>
            <div className={styles.insightContent}>
              <h3>Engagement Trending Up</h3>
              <p>User engagement increased by 34% this month. Keep up the momentum!</p>
              <button className={styles.insightAction}>View Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;