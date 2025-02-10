// src/components/BusinessCreateCampaign.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from './BusinessCreateCampaign.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function BusinessCreateCampaign() {
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    goal: '',
    matchRate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData({ ...campaignData, [name]: value });
    setError(''); // Clear any previous errors when the user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_URL}/api/business/campaigns`, campaignData, { headers });

      if (response.status === 201) {
        navigate('/business-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign. Please try again.');
      console.error('Error creating campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Create New Business Campaign</h1>
        
        {error && (
          <div className={styles.error} role="alert">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Campaign Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={campaignData.name}
              onChange={handleInputChange}
              required
              className={styles.input}
              placeholder="Enter campaign name"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={campaignData.description}
              onChange={handleInputChange}
              required
              className={styles.textarea}
              placeholder="Describe your campaign"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={campaignData.startDate}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={campaignData.endDate}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="goal">Campaign Goal ($)</label>
            <input
              type="number"
              id="goal"
              name="goal"
              value={campaignData.goal}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className={styles.input}
              placeholder="Enter campaign goal"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="matchRate">Match Rate (%)</label>
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
              className={styles.input}
              placeholder="Enter match rate"
            />
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/business-dashboard" className={styles.link}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BusinessCreateCampaign;