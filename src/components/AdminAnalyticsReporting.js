import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAnalyticsReporting = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/admin/analytics');
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Analytics and Reporting</h2>
      {analytics && (
        <div>
          <h3>Overview</h3>
          <ul>
            <li>Total Users: {analytics.totalUsers}</li>
            <li>Total Donations: ${analytics.totalDonations.toFixed(2)}</li>
            <li>Active Campaigns: {analytics.activeCampaigns}</li>
            <li>Business Partners: {analytics.businessPartners}</li>
          </ul>

          <h3>Recent Activity</h3>
          <ul>
            {analytics.recentActivity.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>

          <h3>Top Charities</h3>
          <ol>
            {analytics.topCharities.map((charity, index) => (
              <li key={index}>{charity.name} - ${charity.totalDonations.toFixed(2)}</li>
            ))}
          </ol>

          {/* Add more sections for detailed analytics and reporting */}
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsReporting;