import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './BusinessDashboard.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function BusinessDashboard() {
  const { getAuthHeaders } = useAuth();
  const [businessData, setBusinessData] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [userTypeData, setUserTypeData] = useState(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/me`, { headers: getAuthHeaders() });
        setBusinessData(response.data);
      } catch (error) {
        console.error('Error fetching business data:', error);
      }
    };

    const fetchCampaignData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/campaigns`, { headers: getAuthHeaders() });
        setCampaignData(response.data[0]); // Assuming we're displaying the latest campaign
      } catch (error) {
        console.error('Error fetching campaign data:', error);
      }
    };

    const fetchPerformanceData = async () => {
      // Placeholder: Replace with actual API call when implemented
      setPerformanceData({
        matchesMade: 15,
        totalMatchDonated: 4500,
        totalDonated: 9000,
      });
    };

    const fetchUserTypeData = async () => {
      // Placeholder: Replace with actual API call when implemented
      setUserTypeData({
        types: [
          { name: 'Young Professionals', percentage: 40 },
          { name: 'Families', percentage: 30 },
          { name: 'Retirees', percentage: 20 },
          { name: 'Students', percentage: 10 },
        ]
      });
    };

    fetchBusinessData();
    fetchCampaignData();
    fetchPerformanceData();
    fetchUserTypeData();
  }, [getAuthHeaders]);

  if (!businessData) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1>Welcome, {businessData.companyName}</h1>
        {!campaignData && (
          <Link to="/create-business-campaign" className={styles.createCampaignButton}>
            Create New Campaign
          </Link>
        )}
      </div>
      
      {campaignData ? (
        <section className={styles.currentCampaign}>
          <h2>Current Campaign</h2>
          <p>Total committed: ${campaignData.totalCommit}</p>
          <p>Type: {campaignData.campaignType}</p>
          <p>Campaign period: {new Date(campaignData.startDate).toLocaleDateString()} to {new Date(campaignData.endDate).toLocaleDateString()}</p>
          <p>User Types: {campaignData.userTypes.join(', ')}</p>
          <p>Net Worth: {campaignData.netWorth}</p>
          <p>Impact Score: {campaignData.impactScore}</p>
        </section>
      ) : (
        <p>No active campaigns. Click "Create New Campaign" to start one.</p>
      )}

      {performanceData && (
        <section className={styles.performance}>
          <h2>Performance</h2>
          <p>Matches made: {performanceData.matchesMade}</p>
          <p>Total match donated: ${performanceData.totalMatchDonated}</p>
          <p>Total donated: ${performanceData.totalDonated} (includes user contributions)</p>
        </section>
      )}

      {userTypeData && (
        <section className={styles.userTypes}>
          <h2>Match User Details</h2>
          <ul>
            {userTypeData.types.map((type, index) => (
              <li key={index}>{type.name}: {type.percentage}%</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default BusinessDashboard;