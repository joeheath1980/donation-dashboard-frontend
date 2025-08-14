import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function MatchingOpportunitiesComponent({ userId }) {
  const { getAuthHeaders } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        console.log('Fetching matching opportunities...');
        console.log('User ID:', userId);
        const response = await axios.get('http://localhost:3002/api/matchingOpportunities', {
          headers: getAuthHeaders(),
        });

        console.log('Response:', response);
        console.log('Response data:', response.data);
        const fetchedOpportunities = response.data || [];
        console.log('Fetched opportunities:', fetchedOpportunities);
        setOpportunities(fetchedOpportunities);
        setError(null);
      } catch (error) {
        console.error('Error fetching matching opportunities:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
        setOpportunities([]);
        setError('Failed to fetch matching opportunities. Please try again later.');
      }
    };

    if (userId) {
      fetchOpportunities();
    } else {
      console.log('No user ID provided');
    }
  }, [userId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Matching Opportunities</h3>
      {opportunities && opportunities.length > 0 ? (
        <ul>
          {opportunities.map(opportunity => (
            <li key={opportunity._id}>
              <p><strong>Brand:</strong> {opportunity.brand}</p>
              <p><strong>Conditions:</strong> {opportunity.conditions}</p>
              <p><strong>Match Amount:</strong> ${opportunity.amount}</p>
              <p><strong>Start Date:</strong> {new Date(opportunity.startDate).toLocaleDateString()}</p>
              <p><strong>Valid Until:</strong> {new Date(opportunity.endDate).toLocaleDateString()}</p>
              <button>Participate</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching opportunities available at the moment. (Total: {opportunities.length})</p>
      )}
    </div>
  );
}

export default MatchingOpportunitiesComponent;
