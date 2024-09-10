import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Impact.module.css';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      setIsCreateModalOpen(false);
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

  const containerStyle = {
    backgroundColor: '#e6f7e6',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    marginBottom: '40px',
  };

  const headerStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  };

  const campaignCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '20px',
    marginBottom: '20px',
    position: 'relative',
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px',
  };

  const valueStyle = {
    color: '#333',
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  };

  const removeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ff4d4d',
    color: 'white',
    position: 'absolute',
    top: '10px',
    right: '10px',
  };

  const completeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white',
    marginTop: '10px',
  };

  const createButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white',
    marginTop: '20px',
  };

  const progressBarStyle = {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginTop: '10px',
    marginBottom: '10px',
  };

  const progressFillStyle = (percentage) => ({
    width: `${percentage}%`,
    backgroundColor: '#4CAF50',
    height: '10px',
  });

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    maxWidth: '500px',
    width: '90%',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Fundraising Campaigns</h2>

      {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

      {campaigns.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {campaigns.map(campaign => (
            <li key={campaign._id} style={campaignCardStyle}>
              <button
                onClick={() => handleRemoveCampaign(campaign._id)}
                style={removeButtonStyle}
              >
                Remove
              </button>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>{campaign.title}</h3>
              <p style={{ marginBottom: '10px' }}>{campaign.description}</p>
              <p><span style={labelStyle}>Goal:</span> <span style={valueStyle}>${campaign.goalAmount}</span></p>
              <p><span style={labelStyle}>Raised:</span> <span style={valueStyle}>${campaign.raisedAmount || 0}</span></p>
              <div style={progressBarStyle}>
                <div 
                  style={progressFillStyle((campaign.raisedAmount / campaign.goalAmount) * 100)}
                ></div>
              </div>
              <p><span style={labelStyle}>Start Date:</span> <span style={valueStyle}>{new Date(campaign.startDate).toLocaleDateString()}</span></p>
              <p><span style={labelStyle}>End Date:</span> <span style={valueStyle}>{new Date(campaign.endDate).toLocaleDateString()}</span></p>
              <p><span style={labelStyle}>Status:</span> <span style={valueStyle}>{campaign.status}</span></p>
              <button
                onClick={() => handleCompleteCampaign(campaign)}
                style={completeButtonStyle}
              >
                Mark as Completed
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No fundraising campaigns found.</p>
      )}

      <button 
        onClick={() => setIsCreateModalOpen(true)} 
        style={createButtonStyle}
      >
        Create Campaign
      </button>

      {isCreateModalOpen && (
        <>
          <div style={overlayStyle} onClick={() => setIsCreateModalOpen(false)} />
          <div style={modalStyle}>
            <h3 style={{...headerStyle, fontSize: '24px'}}>Create New Campaign</h3>
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                name="title" 
                placeholder="Campaign Title" 
                value={newCampaign.title} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
              <textarea 
                name="description" 
                placeholder="Campaign Description" 
                value={newCampaign.description} 
                onChange={handleChange} 
                required
                style={{...inputStyle, minHeight: '100px'}}
              ></textarea>
              <input 
                type="number" 
                name="goalAmount" 
                placeholder="Goal Amount" 
                value={newCampaign.goalAmount} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
              <input 
                type="date" 
                name="startDate" 
                placeholder="Start Date" 
                value={newCampaign.startDate} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
              <input 
                type="date" 
                name="endDate" 
                placeholder="End Date" 
                value={newCampaign.endDate} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{...buttonStyle, backgroundColor: '#ccc'}}>Cancel</button>
                <button type="submit" style={{...buttonStyle, backgroundColor: '#4CAF50', color: 'white'}}>Create Campaign</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default FundraisingCampaignsComponent;
