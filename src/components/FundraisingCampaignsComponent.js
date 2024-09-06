import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Impact.module.css'; // Make sure the path is correct

function FundraisingCampaignsComponent({ userId, onCompleteCampaign }) {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [isCreateFormMinimized, setIsCreateFormMinimized] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, [userId]);

  const fetchCampaigns = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3002/api/fundraisingCampaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching fundraising campaigns:', error);
      setError('Failed to fetch campaigns. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setNewCampaign({ ...newCampaign, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:3002/api/fundraisingCampaigns', newCampaign, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setCampaigns([...campaigns, response.data]);
      setNewCampaign({ title: '', description: '', goalAmount: '', startDate: '', endDate: '' });
      setError('');
      setIsCreateFormMinimized(true);
    } catch (error) {
      console.error('Error creating fundraising campaign:', error);
      setError('Failed to create campaign. Please try again.');
    }
  };

  const handleRemoveCampaign = async (campaignId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3002/api/fundraisingCampaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCampaigns(campaigns.filter(campaign => campaign._id !== campaignId));
    } catch (error) {
      console.error('Error removing fundraising campaign:', error);
      setError('Failed to remove campaign. Please try again.');
    }
  };

  const handleCompleteCampaign = (campaign) => {
    console.log('Completing campaign:', campaign);
    try {
      const completedCampaign = {
        charity: campaign.title,
        date: new Date().toISOString(),
        amount: campaign.raisedAmount || campaign.goalAmount,
        subject: `Completed fundraising campaign: ${campaign.description}`
      };
      console.log('Converted campaign to one-off contribution:', completedCampaign);
      onCompleteCampaign(completedCampaign);
      handleRemoveCampaign(campaign._id);
    } catch (error) {
      console.error('Error completing campaign:', error);
      setError('Failed to complete campaign. Please try again.');
    }
  };

  const toggleCreateForm = () => {
    setIsCreateFormMinimized(!isCreateFormMinimized);
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.sectionHeader}>Fundraising Campaigns</h4>

      {error && <p className={styles.error}>{error}</p>}

      {campaigns.length > 0 ? (
        <ul className={styles.campaignList}>
          {campaigns.map(campaign => (
            <li key={campaign._id} className={styles.campaignItem} style={{ position: 'relative' }}>
              <button
                className={styles.removeButton}
                onClick={() => handleRemoveCampaign(campaign._id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 1
                }}
              >
                Remove
              </button>
              <p className={styles.campaignTitle}><strong>Campaign Title:</strong> {campaign.title}</p>
              <p className={styles.campaignDescription}>{campaign.description}</p>
              <p className={styles.contributionDetail}><strong>Goal:</strong> ${campaign.goalAmount}</p>
              <p className={styles.contributionDetail}><strong>Raised:</strong> ${campaign.raisedAmount || 0}</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{width: `${(campaign.raisedAmount / campaign.goalAmount) * 100}%`}}
                ></div>
              </div>
              <p className={styles.contributionDetail}><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
              <p className={styles.contributionDetail}><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
              <p className={styles.contributionDetail}><strong>Status:</strong> {campaign.status}</p>
              <div style={{ textAlign: 'left' }}>
                <button
                  className={styles.completeButton}
                  onClick={() => handleCompleteCampaign(campaign)}
                >
                  Completed
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No fundraising campaigns found.</p>
      )}

      <button onClick={toggleCreateForm} className={styles.toggleButton}>
        {isCreateFormMinimized ? 'Create Campaign' : 'Hide Create Campaign'}
      </button>

      {!isCreateFormMinimized && (
        <form onSubmit={handleSubmit} className={styles.campaignForm}>
          <input 
            type="text" 
            name="title" 
            placeholder="Campaign Title" 
            value={newCampaign.title} 
            onChange={handleChange} 
            required 
            className={styles.formInput}
          />
          <textarea 
            name="description" 
            placeholder="Campaign Description" 
            value={newCampaign.description} 
            onChange={handleChange} 
            required
            className={styles.formTextarea}
          ></textarea>
          <input 
            type="number" 
            name="goalAmount" 
            placeholder="Goal Amount" 
            value={newCampaign.goalAmount} 
            onChange={handleChange} 
            required 
            className={styles.formInput}
          />
          <input 
            type="date" 
            name="startDate" 
            placeholder="Start Date" 
            value={newCampaign.startDate} 
            onChange={handleChange} 
            required 
            className={styles.formInput}
          />
          <input 
            type="date" 
            name="endDate" 
            placeholder="End Date" 
            value={newCampaign.endDate} 
            onChange={handleChange} 
            required 
            className={styles.formInput}
          />
          <button type="submit" className={styles.addButton}>Create Campaign</button>
        </form>
      )}
    </div>
  );
}

export default FundraisingCampaignsComponent;
