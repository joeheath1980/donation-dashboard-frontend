import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../CharityDashboard.module.css';
import logo from '../assets/logo.png'; // Make sure to add your logo file

function CharityDashboard() {
  const [charityData, setCharityData] = useState(null);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders, API_URL, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!charityData) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1>Charity Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Log Out</button>
      </header>
      
      <div className={styles.charityInfo}>
        <h2>Welcome, {charityData.charityName}</h2>
        <p><strong>Email:</strong> {charityData.contactEmail}</p>
        <p><strong>Category:</strong> {charityData.category}</p>
      </div>
      
      <div className={styles.missionStatement}>
        <h3>Mission Statement</h3>
        <p>{charityData.missionStatement}</p>
      </div>
      
      <div className={styles.description}>
        <h3>About Us</h3>
        <p>{charityData.description}</p>
      </div>
      
      <div className={styles.donationStats}>
        <h3>Donation Statistics</h3>
        {/* Add donation statistics here */}
        <p>Total Donations: $X,XXX</p>
        <p>Number of Donors: XXX</p>
      </div>
      
      <div className={styles.campaigns}>
        <h3>Current Campaigns</h3>
        {/* Add list of current campaigns here */}
        <ul>
          <li>Campaign 1</li>
          <li>Campaign 2</li>
        </ul>
      </div>
      
      <button className={styles.createCampaign}>Create New Campaign</button>
    </div>
  );
}

export default CharityDashboard;