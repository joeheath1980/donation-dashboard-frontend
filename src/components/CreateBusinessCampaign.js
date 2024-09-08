import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './CreateBusinessCampaign.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function CreateBusinessCampaign() {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    totalCommit: '',
    campaignType: '',
    startDate: '',
    endDate: '',
    userTypes: '',
    netWorth: '',
    impactScore: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/campaigns`, {
        ...formData,
        userTypes: formData.userTypes.split(',').map(type => type.trim()),
        totalCommit: parseFloat(formData.totalCommit),
        impactScore: parseFloat(formData.impactScore)
      }, { headers: getAuthHeaders() });
      
      if (response.status === 201) {
        navigate('/business-dashboard');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <div className={styles.createCampaign}>
      <div className={styles.header}>
        <h2>Create New Campaign</h2>
        <Link to="/business-dashboard" className={styles.backButton}>Back to Dashboard</Link>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="totalCommit">Total Commitment ($):</label>
          <input
            type="number"
            id="totalCommit"
            name="totalCommit"
            value={formData.totalCommit}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="campaignType">Campaign Type:</label>
          <select
            id="campaignType"
            name="campaignType"
            value={formData.campaignType}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">Select a type</option>
            <option value="yourCharities">Your Charities</option>
            <option value="similarCharities">Similar Charities</option>
            <option value="userLedCharities">User Led Charities</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="userTypes">User Types:</label>
          <div className={styles.checkboxGroup}>
            {['Young Professionals', 'Families', 'Retirees', 'Students'].map((type) => (
              <label key={type} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="userTypes"
                  value={type}
                  checked={formData.userTypes.includes(type)}
                  onChange={(e) => {
                    const updatedTypes = e.target.checked
                      ? [...formData.userTypes.split(','), e.target.value].filter(Boolean).join(',')
                      : formData.userTypes.split(',').filter(t => t !== e.target.value).join(',');
                    setFormData({ ...formData, userTypes: updatedTypes });
                  }}
                  className={styles.checkbox}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="netWorth">Net Worth:</label>
          <select
            id="netWorth"
            name="netWorth"
            value={formData.netWorth}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">Select net worth</option>
            <option value="highNetWorth">High Net Worth</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="impactScore">Impact Score:</label>
          <select
            id="impactScore"
            name="impactScore"
            value={formData.impactScore}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">Select impact score</option>
            <option value="highImpact">High Impact Score</option>
            <option value="all">All</option>
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>Create Campaign</button>
      </form>
    </div>
  );
}

export default CreateBusinessCampaign;