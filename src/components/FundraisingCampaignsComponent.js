import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ImpactContext } from '../contexts/ImpactContext';

function FundraisingCampaignsComponent({ userId, onCompleteCampaign }) {
  const {
    fundraisingCampaigns,
    fetchImpactData,
    getAuthHeaders,
    isAuthenticated
  } = useContext(ImpactContext);

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updatingCampaign, setUpdatingCampaign] = useState(null);
  const [tempRaisedAmounts, setTempRaisedAmounts] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchImpactData();
    }
  }, [isAuthenticated, fetchImpactData]);

  const handleChange = (e) => {
    setNewCampaign({ ...newCampaign, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to create a campaign.');
      return;
    }
    const headers = getAuthHeaders();
    try {
      await axios.post(
        'http://localhost:3002/api/fundraisingCampaigns',
        newCampaign,
        {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        }
      );
      setNewCampaign({
        title: '',
        description: '',
        goalAmount: '',
        startDate: '',
        endDate: '',
      });
      setError('');
      setIsCreateModalOpen(false);
      if (isAuthenticated) {
        fetchImpactData(); // Refresh impact data after creating a new campaign
      }
    } catch (error) {
      console.error('Error creating fundraising campaign:', error);
      setError('Failed to create campaign. Please try again.');
    }
  };

  const handleRemoveCampaign = async (campaignId) => {
    if (!isAuthenticated) {
      setError('Please log in to remove a campaign.');
      return;
    }
    const headers = getAuthHeaders();
    try {
      await axios.delete(`http://localhost:3002/api/fundraisingCampaigns/${campaignId}`, { headers });
      if (isAuthenticated) {
        fetchImpactData(); // Refresh impact data after removing a campaign
      }
    } catch (error) {
      console.error('Error removing fundraising campaign:', error);
      setError('Failed to remove campaign. Please try again.');
    }
  };

  const handleCompleteCampaign = (campaign) => {
    if (!isAuthenticated) {
      setError('Please log in to complete a campaign.');
      return;
    }
    console.log('Completing campaign:', campaign);
    try {
      const completedCampaign = {
        charity: campaign.title,
        date: new Date().toISOString(),
        amount: campaign.raisedAmount || campaign.goalAmount,
        subject: `Completed fundraising campaign: ${campaign.description}`,
      };
      console.log('Converted campaign to one-off contribution:', completedCampaign);
      onCompleteCampaign(completedCampaign);
      handleRemoveCampaign(campaign._id);
    } catch (error) {
      console.error('Error completing campaign:', error);
      setError('Failed to complete campaign. Please try again.');
    }
  };

  const handleUpdateAmount = async (campaign) => {
    if (!isAuthenticated) {
      setError('Please log in to update the campaign amount.');
      return;
    }
    if (updatingCampaign === campaign._id) {
      const tempRaisedAmount = tempRaisedAmounts[campaign._id];
      const updatedRaisedAmount = parseFloat(tempRaisedAmount);
      if (isNaN(updatedRaisedAmount)) {
        setError('Please enter a valid number for the raised amount.');
        return;
      }

      const headers = getAuthHeaders();
      try {
        const updatedCampaign = { raisedAmount: updatedRaisedAmount };

        await axios.patch(
          `http://localhost:3002/api/fundraisingCampaigns/${campaign._id}`,
          updatedCampaign,
          {
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
          }
        );
        setUpdatingCampaign(null);
        setTempRaisedAmounts((prev) => {
          const updated = { ...prev };
          delete updated[campaign._id];
          return updated;
        });
        setError('');
        if (isAuthenticated) {
          fetchImpactData(); // Refresh impact data after updating campaign amount
        }
      } catch (error) {
        console.error('Error updating campaign amount:', error);
        setError('Failed to update campaign amount. Please try again.');
      }
    } else {
      setUpdatingCampaign(campaign._id);
      setTempRaisedAmounts((prev) => ({
        ...prev,
        [campaign._id]: campaign.raisedAmount?.toString() ?? '0',
      }));
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

  if (!isAuthenticated) {
    return <div style={containerStyle}>Please log in to view and manage fundraising campaigns.</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Fundraising Campaigns</h2>

      {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

      {fundraisingCampaigns.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {fundraisingCampaigns.map((campaign) => (
            <li key={campaign._id} style={campaignCardStyle}>
              <button
                onClick={() => handleRemoveCampaign(campaign._id)}
                style={removeButtonStyle}
              >
                Remove
              </button>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>{campaign.title}</h3>
              <p style={{ marginBottom: '10px' }}>{campaign.description}</p>
              <p>
                <span style={labelStyle}>Goal:</span> <span style={valueStyle}>${campaign.goalAmount}</span>
              </p>
              <p>
                <span style={labelStyle}>Raised:</span>
                {updatingCampaign === campaign._id ? (
                  <input
                    type="number"
                    value={tempRaisedAmounts[campaign._id] ?? campaign.raisedAmount?.toString() ?? '0'}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Input Change:', value); // Debugging line
                      setTempRaisedAmounts({
                        ...tempRaisedAmounts,
                        [campaign._id]: value,
                      });
                    }}
                    style={{ ...inputStyle, width: '100px', marginLeft: '10px', marginRight: '10px' }}
                  />
                ) : (
                  <span style={valueStyle}>${campaign.raisedAmount || 0}</span>
                )}
                <button
                  onClick={() => handleUpdateAmount(campaign)}
                  style={{ ...buttonStyle, backgroundColor: '#4CAF50', color: 'white', marginLeft: '10px' }}
                >
                  {updatingCampaign === campaign._id ? 'Save' : 'Update Amount'}
                </button>
              </p>
              <div style={progressBarStyle}>
                <div style={progressFillStyle((campaign.raisedAmount / campaign.goalAmount) * 100)}></div>
              </div>
              <p>
                <span style={labelStyle}>Start Date:</span>{' '}
                <span style={valueStyle}>{new Date(campaign.startDate).toLocaleDateString()}</span>
              </p>
              <p>
                <span style={labelStyle}>End Date:</span>{' '}
                <span style={valueStyle}>{new Date(campaign.endDate).toLocaleDateString()}</span>
              </p>
              <p>
                <span style={labelStyle}>Status:</span> <span style={valueStyle}>{campaign.status}</span>
              </p>
              <button onClick={() => handleCompleteCampaign(campaign)} style={completeButtonStyle}>
                Mark as Completed
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No fundraising campaigns found.</p>
      )}

      <button onClick={() => setIsCreateModalOpen(true)} style={createButtonStyle}>
        Create Campaign
      </button>

      {isCreateModalOpen && (
        <>
          <div style={overlayStyle} onClick={() => setIsCreateModalOpen(false)} />
          <div style={modalStyle}>
            <h3 style={{ ...headerStyle, fontSize: '24px' }}>Create New Campaign</h3>
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
                style={{ ...inputStyle, minHeight: '100px' }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ ...buttonStyle, backgroundColor: '#ccc' }}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...buttonStyle, backgroundColor: '#4CAF50', color: 'white' }}>
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default FundraisingCampaignsComponent;
