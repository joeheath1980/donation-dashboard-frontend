// src/components/CreateBusinessCampaign.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from './CreateBusinessCampaign.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function CreateBusinessCampaign() {
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    goal: '',
    matchRate: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData({ ...campaignData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_URL}/api/business/campaigns`, campaignData, { headers });

      if (response.status === 201) {
        navigate('/business-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign. Please try again.');
      console.error('Error creating campaign:', err);
    }
  };

  return (
    <div className={styles.createCampaign}>
      <div className={styles.header}>
        <h2>Create New Business Campaign</h2>
        <Link to="/business-dashboard" className={styles.backButton}>Back to Dashboard</Link>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Campaign Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={campaignData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={campaignData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={campaignData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={campaignData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="goal">Campaign Goal ($):</label>
          <input
            type="number"
            id="goal"
            name="goal"
            value={campaignData.goal}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="matchRate">Match Rate (%):</label>
          <input
            type="number"
            id="matchRate"
            name="matchRate"
            value={campaignData.matchRate}
            onChange={handleInputChange}
            required
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        <button type="submit" className={styles.submitButton}>Create Campaign</button>
      </form>
    </div>
  );
}

export default CreateBusinessCampaign;

