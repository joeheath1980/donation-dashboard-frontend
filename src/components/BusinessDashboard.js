import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import cleanStyles from './CleanDesign.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function BusinessDashboard() {
  const { getAuthHeaders } = useAuth();
  
  const [businessData, setBusinessData] = useState({
    name: '',
    email: '',
    description: '',
    preferredCauses: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/me`, { headers: getAuthHeaders() });
        setBusinessData(response.data);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [getAuthHeaders]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/business/campaigns`, { headers: getAuthHeaders() });
        setCampaigns(response.data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setCampaignsError('Failed to load campaigns. Please try again later.');
      } finally {
        setCampaignsLoading(false);
      }
    };

    fetchCampaigns();
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

  if (loading || campaignsLoading) {
    return <div className={`${cleanStyles.container} ${cleanStyles.textCenter}`}>Loading...</div>;
  }

  if (error || campaignsError) {
    return (
      <div className={cleanStyles.container}>
        <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
          {error && <p className={cleanStyles.description}>{error}</p>}
          {campaignsError && <p className={cleanStyles.description}>{campaignsError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cleanStyles.container}>
      <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
        <h1 className={cleanStyles.gradientTitle}>Welcome, {businessData.name}</h1>
        
        <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
          <h2 className={cleanStyles.title}>Business Overview</h2>
          <p className={cleanStyles.description}><strong>Email:</strong> {businessData.email}</p>
          <p className={cleanStyles.description}><strong>Description:</strong> {businessData.description}</p>
          <p className={cleanStyles.description}>
            <strong>Preferred Causes:</strong> {Array.isArray(businessData.preferredCauses) ? businessData.preferredCauses.join(', ') : 'No preferred causes specified'}
          </p>
        </div>

        <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
          <h2 className={cleanStyles.title}>Overall Financial Summary</h2>
          <p className={cleanStyles.description}><strong>Total Micro-Matches:</strong> ${dummyData.financialSummary.totalMicroMatches}</p>
          <p className={cleanStyles.description}><strong>Monthly Average:</strong> ${dummyData.financialSummary.monthlyAverage}</p>
          <p className={cleanStyles.description}><strong>Year-to-Date:</strong> ${dummyData.financialSummary.yearToDate}</p>
        </div>

        <div className={`${cleanStyles.flexBetween} ${cleanStyles.mt-10}`}>
          <Link 
            to="/create-business-campaign" 
            className={cleanStyles.button}
            style={{
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              textDecoration: 'none',
              fontSize: '18px'
            }}
          >
            Create New Campaign
          </Link>
        </div>

        <div className={`${cleanStyles.grid} ${cleanStyles.mt-10}`}>
          {['employee', 'customer', 'all'].map(category => (
            <div key={category} className={cleanStyles.card}>
              <h2 className={cleanStyles.title}>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
              
              <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
                <h3 className={cleanStyles.title}>Financial Summary</h3>
                <p className={cleanStyles.description}><strong>Total Micro-Matches:</strong> ${dummyData[category].financialSummary.totalMicroMatches}</p>
                <p className={cleanStyles.description}><strong>Monthly Average:</strong> ${dummyData[category].financialSummary.monthlyAverage}</p>
                <p className={cleanStyles.description}><strong>Year-to-Date:</strong> ${dummyData[category].financialSummary.yearToDate}</p>
              </div>

              <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
                <h3 className={cleanStyles.title}>Recent Micro-Matches</h3>
                <ul className={cleanStyles.description}>
                  {dummyData[category].microMatches.map(match => (
                    <li key={match.id} className={cleanStyles.mb-10}>
                      ${match.amount} to {match.charity} on {match.date}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
                <h3 className={cleanStyles.title}>Pending Requests</h3>
                <ul className={cleanStyles.description}>
                  {dummyData[category].requests.map(request => (
                    <li key={request.id} className={cleanStyles.mb-10}>
                      {request.charity} - ${request.amount} on {request.date}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
                <h3 className={cleanStyles.title}>Your Campaigns</h3>
                <ul className={cleanStyles.description}>
                  {dummyData[category].campaigns.map(campaign => (
                    <li key={campaign.id} className={cleanStyles.mb-10}>
                      <h4 className={cleanStyles.highlight}>{campaign.name}</h4>
                      <p><strong>Amount:</strong> ${campaign.amount}</p>
                      <p><strong>Start Date:</strong> {campaign.startDate}</p>
                      <p><strong>End Date:</strong> {campaign.endDate}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
          <h2 className={cleanStyles.title}>Your Created Campaigns</h2>
          {campaigns.length === 0 ? (
            <p className={cleanStyles.description}>
              No campaigns found. <Link to="/create-business-campaign" className={cleanStyles.link}>Create your first campaign</Link>.
            </p>
          ) : (
            <div className={cleanStyles.grid}>
              {campaigns.map(campaign => (
                <div key={campaign._id} className={cleanStyles.card}>
                  <h3 className={cleanStyles.title}>{campaign.name}</h3>
                  <p className={cleanStyles.description}><strong>Description:</strong> {campaign.description}</p>
                  <p className={cleanStyles.description}><strong>Goal:</strong> ${campaign.goal.toFixed(2)}</p>
                  <p className={cleanStyles.description}><strong>Current Amount:</strong> ${campaign.currentAmount.toFixed(2)}</p>
                  <p className={cleanStyles.description}><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
                  <p className={cleanStyles.description}><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;