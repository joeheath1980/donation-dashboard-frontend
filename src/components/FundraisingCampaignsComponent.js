import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FundraisingCampaignsComponent({ userId }) {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');

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
    } catch (error) {
      console.error('Error creating fundraising campaign:', error);
      setError('Failed to create campaign. Please try again.');
    }
  };

  return (
    <div className="container">
      <h4>Fundraising Campaigns</h4>

      {error && <p className="error">{error}</p>}

      {campaigns.length > 0 ? (
        <ul>
          {campaigns.map(campaign => (
            <li key={campaign._id}>
              <p><strong>Campaign Title:</strong> {campaign.title}</p>
              <p>{campaign.description}</p>
              <p><strong>Goal:</strong> ${campaign.goalAmount}</p>
              <p><strong>Raised:</strong> ${campaign.raisedAmount || 0}</p>
              <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {campaign.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No fundraising campaigns found.</p>
      )}

      <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="title" 
            placeholder="Campaign Title" 
            value={newCampaign.title} 
            onChange={handleChange} 
            required 
        />
        <textarea 
          name="description" 
          placeholder="Campaign Description" 
          value={newCampaign.description} 
          onChange={handleChange} 
          required
        ></textarea>
          <input 
            type="number" 
            name="goalAmount" 
            placeholder="Goal Amount" 
            value={newCampaign.goalAmount} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="date" 
            name="startDate" 
            placeholder="Start Date" 
            value={newCampaign.startDate} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="date" 
            name="endDate" 
            placeholder="End Date" 
            value={newCampaign.endDate} 
            onChange={handleChange} 
            required 
          />
        <button type="submit">Create Campaign</button>
      </form>
    </div>
  );
}

export default FundraisingCampaignsComponent;
