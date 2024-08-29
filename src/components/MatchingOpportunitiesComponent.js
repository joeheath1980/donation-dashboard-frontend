import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MatchingOpportunitiesComponent({ userId }) {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3002/api/matchingOpportunities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedOpportunities = response.data || []; // Ensure that we get an array
        setOpportunities(fetchedOpportunities);
      } catch (error) {
        console.error('Error fetching matching opportunities:', error.message);
        setOpportunities([]); // Set an empty array if there's an error
      }
    };

    fetchOpportunities();
  }, [userId]);

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
              <button>Participate</button> {/* Add interaction logic here */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching opportunities available at the moment.</p>
      )}
    </div>
  );
}

export default MatchingOpportunitiesComponent;




