import React, { useEffect, useState, useContext, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import apiServices from '../services/api.service';
import { ImpactContext } from '../contexts/ImpactContext';
import { CHARITY_CATEGORIES, formatABN, validateABN, ABN_HELPER_TEXT } from '../constants/charityCategories';
import CharitySearch from './CharitySearch/CharitySearch';
import './SharedStyles.css';
import styles from './FundraisingCampaigns.module.css';
import modalStyles from './ModalStyles.module.css';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaLink, FaCalendar, FaDollarSign, FaBullhorn } from 'react-icons/fa';
import { API_CONFIG } from '../config/api.config';
import VerificationGate from './VerificationGate';

const FundraisingCampaignsComponent = forwardRef(({ userId, onCompleteCampaign }, ref) => {
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
    campaignUrl: '',
    charityType: '',
    beneficiaryCharity: '',
    beneficiaryCharityABN: ''
  });
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [abnStatus, setAbnStatus] = useState('');
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updatingCampaign, setUpdatingCampaign] = useState(null);
  const [tempRaisedAmounts, setTempRaisedAmounts] = useState({});
  
  // Expose openModal method to parent component
  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsCreateModalOpen(true);
    }
  }));

  useEffect(() => {
    if (isAuthenticated) {
      fetchImpactData();
    }
  }, [isAuthenticated, fetchImpactData]);

  const formatUrl = (url) => {
    if (!url) return '';
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  };

  const validateUrl = (url) => {
    if (!url) return false;
    try {
      // Allow URLs that start with www.
      const formattedUrl = formatUrl(url);
      new URL(formattedUrl);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleCharitySelect = (charity) => {
    setSelectedCharity(charity);
    setNewCampaign({
      ...newCampaign,
      beneficiaryCharity: charity.name,
      beneficiaryCharityABN: formatABN(charity.abn || charity.ABN || ''),
      charityType: charity.category || ''
    });
    // Clear ABN status as we now have a valid charity
    setAbnStatus('✓ Valid charity selected');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle ABN formatting
    if (name === 'beneficiaryCharityABN') {
      const formattedABN = formatABN(value);
      setNewCampaign({ ...newCampaign, beneficiaryCharityABN: formattedABN });
      
      // Validate ABN
      if (value.length > 0) {
        if (validateABN(value)) {
          setAbnStatus('✓ Valid ABN format');
        } else {
          setAbnStatus('ABN should be 11 digits');
        }
      } else {
        setAbnStatus('');
      }
    } else {
      setNewCampaign({ ...newCampaign, [name]: value });
    }
    
    // Clear general error when user types
    setError('');
    
    // Validate URL as user types
    if (name === 'campaignUrl') {
      if (!value) {
        setUrlError('Campaign URL is required');
      } else if (!validateUrl(value)) {
        setUrlError('Please enter a valid URL (e.g., www.example.com)');
      } else {
        setUrlError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to create a campaign.');
      return;
    }

    // Format and validate the URL
    const formattedUrl = formatUrl(newCampaign.campaignUrl);
    if (!validateUrl(newCampaign.campaignUrl)) {
      setUrlError('Please provide a valid URL (e.g., www.example.com)');
      return;
    }

    const campaignData = {
      ...newCampaign,
      campaignUrl: formattedUrl
    };

    const headers = getAuthHeaders();
    try {
      const api = apiServices.client;
      await api.post('/api/fundraisingCampaigns', campaignData);
      setNewCampaign({
        title: '',
        description: '',
        goalAmount: '',
        startDate: '',
        endDate: '',
        campaignUrl: '',
        charityType: '',
        beneficiaryCharity: '',
        beneficiaryCharityABN: ''
      });
      setSelectedCharity(null);
      setError('');
      setUrlError('');
      setAbnStatus('');
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
      const api = apiServices.client;
      await api.delete(`/api/fundraisingCampaigns/${campaignId}`);
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

      const api = apiServices.client;
      await api.patch(`/api/fundraisingCampaigns/${campaign._id}`, updatedCampaign);

      // Add to impact score but don't delete the campaign
      const completedCampaign = {
        charity: campaign.title,
        date: new Date().toISOString(),
        amount: campaign.raisedAmount || campaign.goalAmount,
        subject: `Completed fundraising campaign: ${campaign.description}`,
        charityType: campaign.charityType
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

        const api = apiServices.client;
        await api.patch(`/api/fundraisingCampaigns/${campaign._id}`, updatedCampaign);
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
  const pastCampaigns = fundraisingCampaigns.filter(campaign => campaign.status === 'archived');

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
            <label>Search Beneficiary Charity</label>
            <CharitySearch
              onCharitySelect={handleCharitySelect}
              placeholder="Search for a registered charity..."
              required
            />
            {selectedCharity && (
              <div className={modalStyles.selectedCharityInfo}>
                <h4>{selectedCharity.name}</h4>
                <p>ABN: {formatABN(selectedCharity.abn || selectedCharity.ABN || '')}</p>
                {selectedCharity.category && <p>Category: {selectedCharity.category}</p>}
              </div>
            )}
          </div>
          
          {/* Show manual input only if they want to enter a non-registered charity */}
          <details className={modalStyles.manualEntrySection}>
            <summary>Charity not found? Enter manually</summary>
            <div className={modalStyles.formGroup}>
              <label>Charity Type</label>
              <select
                name="charityType"
                value={newCampaign.charityType}
                onChange={handleChange}
                className="select"
              >
                <option value="">Select a charity type</option>
                {CHARITY_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className={modalStyles.formGroup}>
              <label>Beneficiary Charity</label>
              <input
                type="text"
                name="beneficiaryCharity"
                value={newCampaign.beneficiaryCharity}
                onChange={handleChange}
                placeholder="Name of charity that will receive funds"
              />
            </div>
            <div className={modalStyles.formGroup}>
              <label>Beneficiary Charity ABN (optional)</label>
              <input
                type="text"
                name="beneficiaryCharityABN"
                placeholder="XX XXX XXX XXX"
                value={newCampaign.beneficiaryCharityABN}
                onChange={handleChange}
                maxLength="14"
              />
              <small className={modalStyles.helperText}>
                {abnStatus || ABN_HELPER_TEXT}
              </small>
            </div>
          </details>
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
            <label>Campaign URL (Required)</label>
            <input
              type="text"
              name="campaignUrl"
              value={newCampaign.campaignUrl}
              onChange={handleChange}
              placeholder="www.example.com"
              required
            />
            {urlError && <div className={modalStyles.fieldError}>{urlError}</div>}
          </div>
          <div className={modalStyles.buttonGroup}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className={`${modalStyles.button} ${modalStyles.cancelButton}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${modalStyles.button} ${modalStyles.confirmButton}`}
              disabled={!!urlError}
            >
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
        <div className={styles.headerContainer}>
          <h2 className={styles.header}>
            <FaBullhorn className={styles.icon} /> Fundraising Campaigns
          </h2>
          <VerificationGate>
            <button onClick={() => setIsCreateModalOpen(true)} className={`${styles.createButton} btn btn-primary`}>
              <FaPlus /> Create Campaign
            </button>
          </VerificationGate>
        </div>

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
                  <p><strong>Charity Type:</strong> {campaign.charityType || 'Not specified'}</p>
                  {campaign.beneficiaryCharity && (
                    <p><strong>Benefiting:</strong> {campaign.beneficiaryCharity}</p>
                  )}
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
                      type="button"
                      onClick={() => handleUpdateAmount(campaign)}
                      className={`${styles.editButton} iconButton`}
                      aria-label={updatingCampaign === campaign._id ? "Save Amount" : "Update Amount"}
                    >
                      {updatingCampaign === campaign._id ? <FaCheck /> : <FaEdit />}
                    </button>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%`}}
                    ></div>
                  </div>
                  <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
                  {campaign.campaignUrl && (
                    <a 
                      href={campaign.campaignUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link tealUnderlineGlow"
                    >
                      <FaLink /> View Campaign Page
                    </a>
                  )}
                  <button onClick={() => handleCompleteCampaign(campaign)} className={`${styles.tealButton} btn btn-primary`}>
                    Mark as Completed
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.textCenter}>No active fundraising campaigns found.</p>
          )}
        </div>

        {pastCampaigns.length > 0 && (
          <>
            <h3 className={styles.sectionHeader}>Past Campaigns</h3>
            <div className={styles.campaignsGrid}>
              {pastCampaigns.map((campaign) => (
                <div key={campaign._id} className={styles.archivedCard}>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{campaign.title}</h3>
                    <div className={styles.archivedInfo}>
                      <span><FaDollarSign /> Raised: ${campaign.raisedAmount || 0}</span>
                      <span><FaCalendar /> Completed: {new Date(campaign.completedDate).toLocaleDateString()}</span>
                      <span>Type: {campaign.charityType || 'Not specified'}</span>
                      {campaign.campaignUrl && (
                        <a 
                          href={campaign.campaignUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link tealUnderlineGlow"
                        >
                          <FaLink /> View Campaign Page
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className={`iconButton`}
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
      </div>
      {createPortal(modalContent, document.body)}
    </>
  );
});

export default FundraisingCampaignsComponent;
