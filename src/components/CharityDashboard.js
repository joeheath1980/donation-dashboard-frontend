import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function CharityDashboard() {
  const [charityData, setCharityData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharityData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCharityData(response.data);
      } catch (err) {
        console.error('Error fetching charity data:', err);
        setError('Failed to load charity data. Please try again later.');
      }
    };

    fetchCharityData();
  }, []);

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