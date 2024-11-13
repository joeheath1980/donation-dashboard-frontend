import React, { useEffect, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { ImpactContext } from '../contexts/ImpactContext';
import cleanStyles from './CleanDesign.module.css';
import styles from './FundraisingCampaigns.module.css';
import modalStyles from './ModalStyles.module.css';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaLink, FaCalendar, FaDollarSign } from 'react-icons/fa';

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
    justGivingLink: ''
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

  const validateJustGivingLink = (link) => {
    if (!link) return true;
    return link.startsWith('https://www.justgiving.com/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to create a campaign.');
      return;
    }

    if (newCampaign.justGivingLink && !validateJustGivingLink(newCampaign.justGivingLink)) {
      setError('JustGiving link must start with https://www.justgiving.com/');
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
        justGivingLink: ''
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

  const handleDeleteCampaign = async (campaignId) => {
    if (!isAuthenticated) {
      setError('Please log in to delete a campaign.');
      return;
    }
    const headers = getAuthHeaders();
    try {
      await axios.delete(`http://localhost:3002/api/fundraisingCampaigns/${campaignId}`, { headers });
      if (isAuthenticated) {
        fetchImpactData();
      }
    } catch (error) {
      console.error('Error deleting fundraising campaign:', error);
      setError('Failed to delete campaign. Please try again.');
    }
  };

  const handleCompleteCampaign = async (campaign) => {
    if (!isAuthenticated) {
      setError('Please log in to complete a campaign.');
      return;
    }
    try {
      const headers = getAuthHeaders();
      const updatedCampaign = {
        ...campaign,
        status: 'archived',
        completedDate: new Date().toISOString()
      };

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

      // Add to impact score but don't delete the campaign
      const completedCampaign = {
        charity: campaign.title,
        date: new Date().toISOString(),
        amount: campaign.raisedAmount || campaign.goalAmount,
        subject: `Completed fundraising campaign: ${campaign.description}`,
      };
      onCompleteCampaign(completedCampaign);

      if (isAuthenticated) {
        fetchImpactData();
      }
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

  const activeCampaigns = fundraisingCampaigns.filter(campaign => campaign.status === 'active');
  const archivedCampaigns = fundraisingCampaigns.filter(campaign => campaign.status === 'archived');

  if (!isAuthenticated) {
    return <div className={styles.container}>Please log in to view and manage fundraising campaigns.</div>;
  }

  const modalContent = isCreateModalOpen && (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <button
          onClick={() => setIsCreateModalOpen(false)}
          className={modalStyles.closeButton}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
        <h3 className={modalStyles.modalHeader}>Create New Campaign</h3>
        <form onSubmit={handleSubmit} className={modalStyles.form}>
          <div className={modalStyles.formGroup}>
            <label>Campaign Title</label>
            <input
              type="text"
              name="title"
              value={newCampaign.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Campaign Description</label>
            <textarea
              name="description"
              value={newCampaign.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className={modalStyles.formGroup}>
            <label>Goal Amount</label>
            <input
              type="number"
              name="goalAmount"
              value={newCampaign.goalAmount}
              onChange={handleChange}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={newCampaign.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={newCampaign.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>JustGiving Link (Optional)</label>
            <input
              type="url"
              name="justGivingLink"
              value={newCampaign.justGivingLink}
              onChange={handleChange}
              placeholder="https://www.justgiving.com/..."
            />
          </div>
          <div className={modalStyles.buttonGroup}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className={`${modalStyles.button} ${modalStyles.cancelButton}`}
            >
              Cancel
            </button>
            <button type="submit" className={`${modalStyles.button} ${modalStyles.confirmButton}`}>
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.container}>
        <h2 className={`${styles.header} ${cleanStyles.gradientTitle}`}>Fundraising Campaigns</h2>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.campaignsGrid}>
          {activeCampaigns.length > 0 ? (
            activeCampaigns.map((campaign) => (
              <div key={campaign._id} className={styles.campaignCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{campaign.title}</h3>
                </div>
                <div className={styles.cardContent}>
                  <p>{campaign.description}</p>
                  <p><strong>Goal:</strong> ${campaign.goalAmount}</p>
                  <div className={styles.raisedAmount}>
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
                        className={styles.input}
                      />
                    ) : (
                      <span>${campaign.raisedAmount || 0}</span>
                    )}
                    <button
                      onClick={() => handleUpdateAmount(campaign)}
                      className={styles.editButton}
                      aria-label={updatingCampaign === campaign._id ? "Save Amount" : "Update Amount"}
                    >
                      {updatingCampaign === campaign._id ? <FaCheck /> : <FaEdit />}
                    </button>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{width: `${(campaign.raisedAmount / campaign.goalAmount) * 100}%`}}
                    ></div>
                  </div>
                  <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {campaign.status}</p>
                  {campaign.justGivingLink && (
                    <a 
                      href={campaign.justGivingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.justGivingLink}
                    >
                      <FaLink /> View on JustGiving
                    </a>
                  )}
                  <button onClick={() => handleCompleteCampaign(campaign)} className={styles.tealButton}>
                    Mark as Completed
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.textCenter}>No active fundraising campaigns found.</p>
          )}
        </div>

        {archivedCampaigns.length > 0 && (
          <>
            <h3 className={styles.sectionHeader}>Archived Campaigns</h3>
            <div className={styles.campaignsGrid}>
              {archivedCampaigns.map((campaign) => (
                <div key={campaign._id} className={styles.archivedCard}>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{campaign.title}</h3>
                    <div className={styles.archivedInfo}>
                      <span><FaDollarSign /> Raised: ${campaign.raisedAmount || 0}</span>
                      <span><FaCalendar /> Completed: {new Date(campaign.completedDate).toLocaleDateString()}</span>
                      {campaign.justGivingLink && (
                        <a 
                          href={campaign.justGivingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.justGivingLink}
                        >
                          <FaLink /> View on JustGiving
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className={styles.iconButton}
                        aria-label="Delete Campaign"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={() => setIsCreateModalOpen(true)} className={styles.createButton}>
          <FaPlus /> Create Campaign
        </button>
      </div>
      {createPortal(modalContent, document.body)}
    </>
  );
}

export default FundraisingCampaignsComponent;