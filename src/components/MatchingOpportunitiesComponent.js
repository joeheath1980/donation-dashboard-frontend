import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ImpactContext } from '../contexts/ImpactContext';

function MatchingOpportunitiesComponent({ userId }) {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(ImpactContext);

  useEffect(() => {
    const fetchOpportunities = async () => {
      const token = localStorage.getItem('token');
      try {
        console.log('Fetching matching opportunities...');
        console.log('User ID:', userId);
        const response = await axios.get('http://localhost:3002/api/matchingOpportunities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched opportunities:', response.data);
        setOpportunities(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching matching opportunities:', error);
        setOpportunities([]);
        setError('Failed to fetch matching opportunities. Please try again later.');
      }
    };

    if (isAuthenticated && userId) {
      fetchOpportunities();
    } else {
      console.log('User is not authenticated or no user ID provided');
    }
  }, [isAuthenticated, userId]);

  if (!isAuthenticated) {
    return <div>Please log in to view matching opportunities.</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Matching Opportunities</h3>
      {opportunities && opportunities.length > 0 ? (
        <ul>
          {opportunities.map(opportunity => (
            <li key={opportunity._id || opportunity.id}>
              <h4>{opportunity.brand}</h4>
              <p>{opportunity.description}</p>
              <p><strong>Your Donation:</strong> ${opportunity.donationAmount}</p>
              <p><strong>Matching Amount:</strong> ${opportunity.matchingAmount}</p>
              <p><strong>Total Impact:</strong> ${opportunity.totalAmount}</p>
              <p><strong>Valid Until:</strong> {new Date(opportunity.endDate).toLocaleDateString()}</p>
              <p><strong>Cause:</strong> {opportunity.cause}</p>
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
