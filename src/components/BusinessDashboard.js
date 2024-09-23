// src/components/BusinessDashboard.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './BusinessDashboard.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function BusinessDashboard() {
  const { getAuthHeaders } = useAuth();
  
  // Initialize businessData with default values to prevent undefined properties
  const [businessData, setBusinessData] = useState({
    companyName: '',
    contactEmail: '',
    description: '',
    preferredCauses: []
  });
  
  // State for loading and error handling for business data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for fetched campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/me`, { headers: getAuthHeaders() });
        console.log('Fetched Business Data:', response.data); // Logging fetched data for debugging
        setBusinessData(response.data);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business data. Please try again later.');
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchBusinessData();
  }, [getAuthHeaders]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/campaigns`, { headers: getAuthHeaders() });
        console.log('Fetched Campaigns:', response.data); // Logging fetched campaigns for debugging
        setCampaigns(response.data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setCampaignsError('Failed to load campaigns. Please try again later.');
      } finally {
        setCampaignsLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchCampaigns();
  }, [getAuthHeaders]);

  // Dummy data can be removed if not needed. If it's placeholder data, consider fetching real data.
  const dummyData = {
    financialSummary: {
      totalMicroMatches: 1500,
      monthlyAverage: 125,
      yearToDate: 750
    },
    employee: {
      financialSummary: { totalMicroMatches: 500, monthlyAverage: 41, yearToDate: 250 },
      microMatches: [
        { id: 1, charity: "Red Cross", amount: 5, date: "2023-05-15" },
        { id: 2, charity: "Save the Children", amount: 7.5, date: "2023-05-20" },
        { id: 3, charity: "WWF", amount: 6, date: "2023-05-25" }
      ],
      requests: [
        { id: 1, charity: "Doctors Without Borders", amount: 10, date: "2023-06-01" },
        { id: 2, charity: "UNICEF", amount: 12, date: "2023-06-05" },
        { id: 3, charity: "Habitat for Humanity", amount: 8, date: "2023-06-10" }
      ],
      campaigns: [
        { id: 1, name: "Employee Summer Giving", amount: 50, startDate: "2023-07-01", endDate: "2023-08-31" },
        { id: 2, name: "Employee Back to School", amount: 30, startDate: "2023-08-15", endDate: "2023-09-15" },
        { id: 3, name: "Employee Holiday Cheer", amount: 70, startDate: "2023-12-01", endDate: "2023-12-31" }
      ]
    },
    customer: {
      financialSummary: { totalMicroMatches: 700, monthlyAverage: 58, yearToDate: 350 },
      microMatches: [
        { id: 1, charity: "Greenpeace", amount: 6, date: "2023-05-18" },
        { id: 2, charity: "Amnesty International", amount: 8, date: "2023-05-22" },
        { id: 3, charity: "Ocean Conservancy", amount: 7, date: "2023-05-27" }
      ],
      requests: [
        { id: 1, charity: "World Food Programme", amount: 11, date: "2023-06-03" },
        { id: 2, charity: "Oxfam", amount: 13, date: "2023-06-07" },
        { id: 3, charity: "The Nature Conservancy", amount: 9, date: "2023-06-12" }
      ],
      campaigns: [
        { id: 1, name: "Customer Earth Day", amount: 60, startDate: "2023-04-15", endDate: "2023-04-30" },
        { id: 2, name: "Customer School Supplies", amount: 40, startDate: "2023-08-01", endDate: "2023-08-31" },
        { id: 3, name: "Customer Winter Warmth", amount: 80, startDate: "2023-11-15", endDate: "2023-12-15" }
      ]
    },
    all: {
      financialSummary: { totalMicroMatches: 1500, monthlyAverage: 125, yearToDate: 750 },
      microMatches: [
        { id: 1, charity: "Red Cross", amount: 11, date: "2023-05-15" },
        { id: 2, charity: "Save the Children", amount: 15.5, date: "2023-05-20" },
        { id: 3, charity: "WWF", amount: 13, date: "2023-05-25" }
      ],
      requests: [
        { id: 1, charity: "Doctors Without Borders", amount: 21, date: "2023-06-01" },
        { id: 2, charity: "UNICEF", amount: 25, date: "2023-06-05" },
        { id: 3, charity: "Habitat for Humanity", amount: 17, date: "2023-06-10" }
      ],
      campaigns: [
        { id: 1, name: "Combined Summer Impact", amount: 110, startDate: "2023-07-01", endDate: "2023-08-31" },
        { id: 2, name: "Education for All", amount: 70, startDate: "2023-08-15", endDate: "2023-09-15" },
        { id: 3, name: "Year-End Giving", amount: 150, startDate: "2023-12-01", endDate: "2023-12-31" }
      ]
    }
  };

  if (loading || campaignsLoading) {
    return <div>Loading...</div>;
  }

  if (error || campaignsError) {
    return (
      <div className={styles.error}>
        {error && <p>{error}</p>}
        {campaignsError && <p>{campaignsError}</p>}
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1>Welcome, {businessData.companyName}</h1>
      
      <section className={styles.overview}>
        <h2>Business Overview</h2>
        <p>Email: {businessData.contactEmail}</p>
        <p>Description: {businessData.description}</p>
        <p>
          Preferred Causes: {Array.isArray(businessData.preferredCauses) ? businessData.preferredCauses.join(', ') : 'No preferred causes specified'}
        </p>
      </section>

      <section className={styles.overallFinancialSummary}>
        <h2>Overall Financial Summary</h2>
        <p>Total Micro-Matches: ${dummyData.financialSummary.totalMicroMatches}</p>
        <p>Monthly Average: ${dummyData.financialSummary.monthlyAverage}</p>
        <p>Year-to-Date: ${dummyData.financialSummary.yearToDate}</p>
      </section>

      <Link to="/create-business-campaign" className={styles.createCampaignLink}>Create New Campaign</Link>

      <div className={styles.columnsContainer}>
        {['employee', 'customer', 'all'].map(category => (
          <div key={category} className={styles.column}>
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            
            <section className={styles.financialSummary}>
              <h3>Financial Summary</h3>
              <p>Total Micro-Matches: ${dummyData[category].financialSummary.totalMicroMatches}</p>
              <p>Monthly Average: ${dummyData[category].financialSummary.monthlyAverage}</p>
              <p>Year-to-Date: ${dummyData[category].financialSummary.yearToDate}</p>
            </section>

            <section className={styles.microMatches}>
              <h3>Recent Micro-Matches</h3>
              <ul>
                {dummyData[category].microMatches.map(match => (
                  <li key={match.id}>
                    ${match.amount} to {match.charity} on {match.date}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.pendingRequests}>
              <h3>Pending Requests</h3>
              <ul>
                {dummyData[category].requests.map(request => (
                  <li key={request.id}>
                    {request.charity} - ${request.amount} on {request.date}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.campaigns}>
              <h3>Your Campaigns</h3>
              <ul>
                {dummyData[category].campaigns.map(campaign => (
                  <li key={campaign.id}>
                    <h4>{campaign.name}</h4>
                    <p>Amount: ${campaign.amount}</p>
                    <p>Start Date: {campaign.startDate}</p>
                    <p>End Date: {campaign.endDate}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ))}
      </div>

      {/* New Container for Real Campaigns */}
      <section className={styles.realCampaigns}>
        <h2>Your Created Campaigns</h2>
        {campaigns.length === 0 ? (
          <p>No campaigns found. <Link to="/create-business-campaign">Create your first campaign</Link>.</p>
        ) : (
          <ul className={styles.campaignList}>
            {campaigns.map(campaign => (
              <li key={campaign._id} className={styles.campaignItem}>
                <h3>{campaign.name}</h3>
                <p><strong>Description:</strong> {campaign.description}</p>
                <p><strong>Goal:</strong> ${campaign.goal.toFixed(2)}</p>
                <p><strong>Current Amount:</strong> ${campaign.currentAmount.toFixed(2)}</p>
                <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
                {/* Add more fields if necessary */}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default BusinessDashboard;

