import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './BusinessDashboard.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function BusinessDashboard() {
  const { getAuthHeaders } = useAuth();
  const [businessData, setBusinessData] = useState(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/me`, { headers: getAuthHeaders() });
        setBusinessData(response.data);
      } catch (error) {
        console.error('Error fetching business data:', error);
      }
    };

    fetchBusinessData();
  }, [getAuthHeaders]);

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
    </div>
  );
}

export default BusinessDashboard;