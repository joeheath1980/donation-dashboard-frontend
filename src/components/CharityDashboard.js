import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function CharityDashboard() {
  const [charityData, setCharityData] = useState(null);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders, API_URL } = useAuth();

  useEffect(() => {
    const fetchCharityData = async () => {
      if (!user || !user.isCharity) {
        setError('You must be logged in as a charity to view this dashboard.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/charity/me`, {
          headers: getAuthHeaders()
        });
        setCharityData(response.data);
      } catch (err) {
        console.error('Error fetching charity data:', err);
        setError('Failed to load charity data. Please try again later.');
      }
    };

    fetchCharityData();
  }, [user, getAuthHeaders, API_URL]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!charityData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Charity Dashboard</h1>
      <h2>Welcome, {charityData.charityName}</h2>
      <p>Email: {charityData.contactEmail}</p>
      <p>Description: {charityData.description}</p>
      <p>Mission Statement: {charityData.missionStatement}</p>
      <p>Category: {charityData.category}</p>
      {/* Add more charity-specific features here */}
    </div>
  );
}

export default CharityDashboard;