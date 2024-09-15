import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/admin/campaigns');
        setCampaigns(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch campaigns');
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      await axios.put(`/api/admin/campaigns/${campaignId}/status`, { status: newStatus });
      setCampaigns(campaigns.map(campaign => 
        campaign._id === campaignId ? { ...campaign, status: newStatus } : campaign
      ));
    } catch (err) {
      setError('Failed to update campaign status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Campaign Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Organization</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Goal</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(campaign => (
            <tr key={campaign._id}>
              <td>{campaign.name}</td>
              <td>{campaign.organization.name}</td>
              <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
              <td>{new Date(campaign.endDate).toLocaleDateString()}</td>
              <td>${campaign.goal.toFixed(2)}</td>
              <td>
                <select 
                  value={campaign.status} 
                  onChange={(e) => handleStatusChange(campaign._id, e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td>
                {/* Add more actions here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCampaignManagement;