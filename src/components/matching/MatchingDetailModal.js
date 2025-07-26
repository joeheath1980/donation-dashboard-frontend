import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaBuilding, FaHandHoldingHeart, FaClock, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import CharitySearch from '../CharitySearch/CharitySearch';
import styles from './MatchingDetailModal.module.css';

const MatchingDetailModal = ({ opportunity, onClose, onConfirm }) => {
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('MatchingDetailModal - opportunity:', opportunity);
    if (opportunity?.charityId) {
      console.log('Fetching charity details for ID:', opportunity.charityId);
      fetchCharityDetails();
    } else {
      console.log('No charityId, showing charity search');
      setLoading(false);
    }
  }, [opportunity]);

  const fetchCharityDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${opportunity.charityId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCharity(response.data);
    } catch (error) {
      console.error('Failed to fetch charity details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCharitySelect = (charityData) => {
    setSelectedCharity(charityData);
  };

  const handleConfirm = () => {
    const charityIdToUse = opportunity.charityId || selectedCharity?._id || selectedCharity?.id;
    
    if (!charityIdToUse) {
      alert('Please select a charity to continue');
      return;
    }
    
    // Navigate to donation form with selected charity
    navigate(`/donate/${charityIdToUse}`, {
      state: {
        matchingOpportunity: opportunity,
        campaignId: opportunity.campaignId,
        suggestedAmount: opportunity.suggestedAmount,
        charityData: selectedCharity // Pass the full charity data
      }
    });
    
    onClose();
  };

  const calculateEndDate = () => {
    const end = new Date(opportunity.endDate);
    const now = new Date();
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} remaining` : 'Ending soon!';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modalContent}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>

          {loading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={styles.header}>
                <h2>Matching Opportunity Details</h2>
                <div className={styles.timeRemaining}>
                  <FaClock />
                  <span>{calculateEndDate()}</span>
                </div>
              </div>

              {/* Business Info */}
              <div className={styles.section}>
                <div className={styles.sectionIcon}>
                  <FaBuilding />
                </div>
                <div className={styles.sectionContent}>
                  <h3>{opportunity.businessName}</h3>
                  <p>Will match your donation at <strong className={styles.multiplier}>{opportunity.multiplier || 2}x</strong></p>
                </div>
              </div>

              {/* Charity Info */}
              <div className={styles.section}>
                <div className={styles.sectionIcon}>
                  <FaHandHoldingHeart />
                </div>
                <div className={styles.sectionContent}>
                  {charity ? (
                    <>
                      <h3>{charity.name}</h3>
                      <p className={styles.charityDescription}>{charity.description}</p>
                      {charity.programs && charity.programs.length > 0 && (
                        <div className={styles.programs}>
                          <h4>Programs:</h4>
                          <ul>
                            {charity.programs.slice(0, 3).map((program, index) => (
                              <li key={index}>{program.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3>Choose Your Charity</h3>
                      <p className={styles.charityDescription}>
                        Search for a registered charity to support:
                      </p>
                      <div className={styles.charitySelector}>
                        <CharitySearch 
                          onSelect={handleCharitySelect}
                          selectedCharity={selectedCharity}
                          placeholder="Type to search Australian charities..."
                        />
                        {selectedCharity && (
                          <div className={styles.selectedCharityInfo}>
                            <h4>{selectedCharity.name}</h4>
                            {selectedCharity.description && (
                              <p>{selectedCharity.description}</p>
                            )}
                            {selectedCharity.category && (
                              <div className={styles.charityMeta}>
                                <span className={styles.categoryBadge}>
                                  {selectedCharity.category}
                                </span>
                                {selectedCharity.state && (
                                  <span className={styles.stateBadge}>
                                    {selectedCharity.state}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Donation Impact */}
              <div className={styles.impactSection}>
                <div className={styles.impactHeader}>
                  <FaInfoCircle />
                  <h3>Your Impact</h3>
                </div>
                <div className={styles.impactDetails}>
                  <div className={styles.impactRow}>
                    <span>Your donation:</span>
                    <strong>${opportunity.suggestedAmount}</strong>
                  </div>
                  <div className={styles.impactRow}>
                    <span>{opportunity.businessName} matches:</span>
                    <strong className={styles.matchAmount}>
                      ${opportunity.suggestedAmount * (opportunity.multiplier || 2)}
                    </strong>
                  </div>
                  <div className={styles.impactRow + ' ' + styles.totalRow}>
                    <span>Total impact:</span>
                    <strong className={styles.totalAmount}>
                      ${opportunity.suggestedAmount + (opportunity.suggestedAmount * (opportunity.multiplier || 2))}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Campaign Message */}
              {opportunity.message && (
                <div className={styles.campaignMessage}>
                  <p>"{opportunity.message}"</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={onClose}>
                  Cancel
                </button>
                <button className={styles.confirmButton} onClick={handleConfirm}>
                  <FaHeart />
                  {charity ? 'Continue to Donation' : 'Choose a Charity'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchingDetailModal;