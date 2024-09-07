import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './CreateBusinessCampaign.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function CreateBusinessCampaign() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [totalCommit, setTotalCommit] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userTypes, setUserTypes] = useState({
    youngProfessionals: false,
    families: false,
    retirees: false,
    students: false,
  });
  const [netWorth, setNetWorth] = useState('all');
  const [impactScore, setImpactScore] = useState('all');

  const handleUserTypeChange = (event) => {
    setUserTypes({
      ...userTypes,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const campaignData = {
        totalCommit,
        campaignType,
        startDate,
        endDate,
        userTypes: Object.keys(userTypes).filter(key => userTypes[key]),
        netWorth,
        impactScore,
      };

      const response = await axios.post(`${API_URL}/api/business/campaigns`, campaignData, {
        headers: getAuthHeaders(),
      });

      console.log('Campaign created:', response.data);
      navigate('/business-dashboard');
    } catch (error) {
      console.error('Error creating campaign:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create Business Campaign</h1>
        <Link to="/business-dashboard" className={styles.dashboardButton}>Dashboard</Link>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="totalCommit">Total to Commit:</label>
          <input
            type="number"
            id="totalCommit"
            value={totalCommit}
            onChange={(e) => setTotalCommit(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="campaignType">Type:</label>
          <select
            id="campaignType"
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            required
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
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>User Preferences:</label>
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                name="youngProfessionals"
                checked={userTypes.youngProfessionals}
                onChange={handleUserTypeChange}
              />
              Young Professionals
            </label>
            <label>
              <input
                type="checkbox"
                name="families"
                checked={userTypes.families}
                onChange={handleUserTypeChange}
              />
              Families
            </label>
            <label>
              <input
                type="checkbox"
                name="retirees"
                checked={userTypes.retirees}
                onChange={handleUserTypeChange}
              />
              Retirees
            </label>
            <label>
              <input
                type="checkbox"
                name="students"
                checked={userTypes.students}
                onChange={handleUserTypeChange}
              />
              Students
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Net Worth:</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="netWorth"
                value="highNetWorth"
                checked={netWorth === 'highNetWorth'}
                onChange={(e) => setNetWorth(e.target.value)}
              />
              High Net Worth
            </label>
            <label>
              <input
                type="radio"
                name="netWorth"
                value="all"
                checked={netWorth === 'all'}
                onChange={(e) => setNetWorth(e.target.value)}
              />
              All
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Impact Score:</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="impactScore"
                value="highImpact"
                checked={impactScore === 'highImpact'}
                onChange={(e) => setImpactScore(e.target.value)}
              />
              High Impact Score
            </label>
            <label>
              <input
                type="radio"
                name="impactScore"
                value="all"
                checked={impactScore === 'all'}
                onChange={(e) => setImpactScore(e.target.value)}
              />
              All
            </label>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Create Campaign</button>
      </form>
    </div>
  );
}

export default CreateBusinessCampaign;