import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ImpactContext } from '../contexts/ImpactContext';
import axios from 'axios';
import styles from './BusinessDashboard.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function BusinessDashboard() {
  const { user, getAuthHeaders } = useAuth();
  const { calculateComplexImpactScore } = useContext(ImpactContext);
  const [businessData, setBusinessData] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/me`, { headers: getAuthHeaders() });
        setBusinessData(response.data);
      } catch (error) {
        console.error('Error fetching business data:', error);
      }
    };

    const fetchFinancialSummary = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/financial-summary`, { headers: getAuthHeaders() });
        setFinancialSummary(response.data);
      } catch (error) {
        console.error('Error fetching financial summary:', error);
      }
    };

    const fetchDonationHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/donations`, { headers: getAuthHeaders() });
        setDonationHistory(response.data);
      } catch (error) {
        console.error('Error fetching donation history:', error);
      }
    };

    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/pending-requests`, { headers: getAuthHeaders() });
        setPendingRequests(response.data);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    const fetchImpactMetrics = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/impact-metrics`, { headers: getAuthHeaders() });
        setImpactMetrics(response.data);
      } catch (error) {
        console.error('Error fetching impact metrics:', error);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/campaigns`, { headers: getAuthHeaders() });
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchBusinessData();
    fetchFinancialSummary();
    fetchDonationHistory();
    fetchPendingRequests();
    fetchImpactMetrics();
    fetchCampaigns();
  }, [getAuthHeaders]);

  const calculateCampaignImpact = (campaign) => {
    const userData = {
      regularDonations: campaign.regularDonations || [],
      oneOffDonations: campaign.oneOffDonations || [],
      volunteeringActivities: campaign.volunteeringActivities || [],
      previousPeriodScore: 0
    };

    const benchmarks = {
      monthlyDonationBenchmark: 1000,
      oneOffDonationBenchmark: 5000
    };

    return calculateComplexImpactScore(userData, benchmarks);
  };

  if (!businessData) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1>Welcome, {businessData.companyName}</h1>
      
      <section className={styles.overview}>
        <h2>Business Overview</h2>
        <p>Email: {businessData.contactEmail}</p>
        <p>Description: {businessData.description}</p>
        <p>Preferred Causes: {businessData.preferredCauses.join(', ')}</p>
      </section>

      <section className={styles.financialSummary}>
        <h2>Financial Summary</h2>
        {financialSummary && (
          <>
            <p>Total Donations: ${financialSummary.totalDonations}</p>
            <p>Monthly Average: ${financialSummary.monthlyAverage}</p>
            <p>Year-to-Date: ${financialSummary.yearToDateTotal}</p>
          </>
        )}
      </section>

      <section className={styles.donationHistory}>
        <h2>Recent Donations</h2>
        <ul>
          {donationHistory.map(donation => (
            <li key={donation._id}>
              ${donation.amount} to {donation.recipient} on {new Date(donation.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.pendingRequests}>
        <h2>Pending Requests</h2>
        <ul>
          {pendingRequests.map(request => (
            <li key={request._id}>
              {request.organization} - ${request.amount} for {request.purpose}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.impactMetrics}>
        <h2>Your Overall Impact</h2>
        {impactMetrics && (
          <>
            <p>Lives Touched: {impactMetrics.livesTouched}</p>
            <p>Trees Planted: {impactMetrics.treesPlanted}</p>
            <p>Meals Provided: {impactMetrics.mealsProvided}</p>
          </>
        )}
      </section>

      <section className={styles.campaigns}>
        <h2>Your Campaigns</h2>
        {campaigns.length > 0 ? (
          <ul>
            {campaigns.map(campaign => {
              const impactScore = calculateCampaignImpact(campaign);
              return (
                <li key={campaign._id}>
                  <h3>{campaign.campaignType}</h3>
                  <p>Total Commit: ${campaign.totalCommit}</p>
                  <p>Start Date: {new Date(campaign.startDate).toLocaleDateString()}</p>
                  <p>End Date: {new Date(campaign.endDate).toLocaleDateString()}</p>
                  <p>Impact Score: {impactScore.totalScore}</p>
                  <p>Lives Touched: {campaign.livesTouched}</p>
                  <p>Trees Planted: {campaign.treesPlanted}</p>
                  <p>Meals Provided: {campaign.mealsProvided}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No campaigns found. Start a new campaign to see it here!</p>
        )}
      </section>
    </div>
  );
}

export default BusinessDashboard;