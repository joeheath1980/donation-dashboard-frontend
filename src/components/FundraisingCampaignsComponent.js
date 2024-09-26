import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ImpactContext } from '../contexts/ImpactContext';
import cleanStyles from './CleanDesign.module.css';
import { FaPlus, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';

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
        fetchImpactData();
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
        fetchImpactData();
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
          fetchImpactData();
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

  if (!isAuthenticated) {
    return <div className={cleanStyles.container}>Please log in to view and manage fundraising campaigns.</div>;
  }

  return (
    <div className={cleanStyles.container}>
      <h2 className={cleanStyles.header}>Fundraising Campaigns</h2>

      {error && <p className={cleanStyles.error}>{error}</p>}

      {fundraisingCampaigns.length > 0 ? (
        <div className={cleanStyles.grid}>
          {fundraisingCampaigns.map((campaign) => (
            <div key={campaign._id} className={cleanStyles.card}>
              <div className={cleanStyles.cardHeader}>
                <h3 className={cleanStyles.cardTitle}>{campaign.title}</h3>
                <button
                  onClick={() => handleRemoveCampaign(campaign._id)}
                  className={cleanStyles.iconButton}
                  aria-label="Remove Campaign"
                >
                  <FaTrash />
                </button>
              </div>
              <div className={cleanStyles.cardContent}>
                <p>{campaign.description}</p>
                <p><strong>Goal:</strong> ${campaign.goalAmount}</p>
                <p>
                  <strong>Raised:</strong>
                  {updatingCampaign === campaign._id ? (
                    <input
                      type="number"
                      value={tempRaisedAmounts[campaign._id] ?? campaign.raisedAmount?.toString() ?? '0'}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTempRaisedAmounts({
                          ...tempRaisedAmounts,
                          [campaign._id]: value,
                        });
                      }}
                      className={cleanStyles.input}
                      style={{width: '100px', marginLeft: '10px', marginRight: '10px'}}
                    />
                  ) : (
                    <span>${campaign.raisedAmount || 0}</span>
                  )}
                  <button
                    onClick={() => handleUpdateAmount(campaign)}
                    className={cleanStyles.iconButton}
                    aria-label={updatingCampaign === campaign._id ? "Save Amount" : "Update Amount"}
                  >
                    {updatingCampaign === campaign._id ? <FaCheck /> : <FaEdit />}
                  </button>
                </p>
                <div className={cleanStyles.progressBar}>
                  <div 
                    className={cleanStyles.progressFill} 
                    style={{width: `${(campaign.raisedAmount / campaign.goalAmount) * 100}%`}}
                  ></div>
                </div>
                <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {campaign.status}</p>
                <button onClick={() => handleCompleteCampaign(campaign)} className={cleanStyles.button}>
                  Mark as Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={cleanStyles.textCenter}>No fundraising campaigns found.</p>
      )}

      <button onClick={() => setIsCreateModalOpen(true)} className={`${cleanStyles.button} ${cleanStyles.mt-10}`}>
        <FaPlus /> Create Campaign
      </button>

      {isCreateModalOpen && (
        <div className={cleanStyles.modal}>
          <div className={cleanStyles.modalContent}>
            <h3 className={cleanStyles.modalHeader}>Create New Campaign</h3>
            <form onSubmit={handleSubmit} className={cleanStyles.form}>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Campaign Title:</label>
                <input
                  type="text"
                  name="title"
                  value={newCampaign.title}
                  onChange={handleChange}
                  required
                  className={cleanStyles.input}
                />
              </div>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Campaign Description:</label>
                <textarea
                  name="description"
                  value={newCampaign.description}
                  onChange={handleChange}
                  required
                  className={cleanStyles.textarea}
                ></textarea>
              </div>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Goal Amount:</label>
                <input
                  type="number"
                  name="goalAmount"
                  value={newCampaign.goalAmount}
                  onChange={handleChange}
                  required
                  className={cleanStyles.input}
                />
              </div>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={newCampaign.startDate}
                  onChange={handleChange}
                  required
                  className={cleanStyles.input}
                />
              </div>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>End Date:</label>
                <input
                  type="date"
                  name="endDate"
                  value={newCampaign.endDate}
                  onChange={handleChange}
                  required
                  className={cleanStyles.input}
                />
              </div>
              <div className={cleanStyles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={cleanStyles.buttonSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={cleanStyles.button}>
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FundraisingCampaignsComponent;
