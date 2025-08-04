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
    console.log('Multiplier:', opportunity?.multiplier, 'SuggestedAmount:', opportunity?.suggestedAmount);
    
    // For P1/P2 matches with a charity assigned
    if (opportunity?.charityId && (opportunity.matchType === 'direct' || opportunity.matchType === 'category_auto')) {
      // If we already have the charity name from the opportunity, use it
      if (opportunity.charityName) {
        setCharity({ name: opportunity.charityName, id: opportunity.charityId });
        setLoading(false);
      } else {
        console.log('Fetching charity details for ID:', opportunity.charityId);
        fetchCharityDetails();
      }
    } else {
      // For P3/P4 matches where user needs to choose
      console.log('Match type requires charity selection:', opportunity.matchType);
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
                  <p className={styles.multiplierText}>
                    {(opportunity.multiplier || 2) > 1 ? (
                      <>
                        Will match your donation at 
                        <strong className={styles.multiplierBig}>{opportunity.multiplier || 2}x</strong>
                      </>
                    ) : (
                      <>
                        Is facilitating donations to this charity
                        <span className={styles.noMatchNote}> (no matching)</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Charity Info */}
              <div className={styles.section}>
                <div className={styles.sectionIcon}>
                  <FaHandHoldingHeart />
                </div>
                <div className={styles.sectionContent}>
                  {/* Show different content based on match type */}
                  {(opportunity.matchType === 'direct' || opportunity.matchType === 'category_auto') && charity ? (
                    <>
                      <h3>{charity.name}</h3>
                      <p className={styles.charityDescription}>
                        {opportunity.matchType === 'direct' 
                          ? `${opportunity.businessName} has selected this charity for their perfect match.`
                          : `${opportunity.businessName} has chosen this charity based on your interests in ${opportunity.cause || 'this cause'}.`}
                      </p>
                      {charity.description && (
                        <p className={styles.charityDescription}>{charity.description}</p>
                      )}
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
                  ) : opportunity.matchType === 'category_choice' ? (
                    <>
                      <h3>Choose Your Charity</h3>
                      <p className={styles.charityDescription}>
                        Select a charity in the <strong>{opportunity.cause}</strong> category:
                      </p>
                      <div className={styles.charitySelector}>
                        <CharitySearch 
                          onSelect={handleCharitySelect}
                          selectedCharity={selectedCharity}
                          placeholder={`Search ${opportunity.cause} charities...`}
                          category={opportunity.cause}
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
                  ) : (
                    <>
                      <h3>Choose Any Charity</h3>
                      <p className={styles.charityDescription}>
                        {opportunity.businessName} will match your donation to any registered charity:
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
                  {(opportunity.multiplier || 2) > 1 ? (
                    <>
                      <div className={styles.impactRow}>
                        <span>Your donation:</span>
                        <strong>${opportunity.suggestedAmount || 50}</strong>
                      </div>
                      <div className={styles.impactRow}>
                        <span>{opportunity.businessName} matches:</span>
                        <strong className={styles.matchAmount}>
                          ${(opportunity.suggestedAmount || 50) * ((opportunity.multiplier || 2) - 1)}
                        </strong>
                      </div>
                      <div className={styles.impactRow + ' ' + styles.totalRow}>
                        <span>Total impact:</span>
                        <strong className={styles.totalAmount}>
                          ${(opportunity.suggestedAmount || 50) * (opportunity.multiplier || 2)}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.impactRow}>
                        <span>Your donation:</span>
                        <strong className={styles.totalAmount}>${opportunity.suggestedAmount || 50}</strong>
                      </div>
                      <div className={styles.impactRow}>
                        <span className={styles.noMatchNote}>
                          {opportunity.businessName} is facilitating this donation but not providing matching funds
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {!opportunity.suggestedAmount && (
                  <p className={styles.impactNote}>
                    * Example shown with $50 donation. Choose your amount on the next screen.
                  </p>
                )}
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
                  {(opportunity.matchType === 'direct' || opportunity.matchType === 'category_auto') && charity 
                    ? 'Continue to Donation' 
                    : selectedCharity 
                      ? 'Continue with Selected Charity'
                      : 'Select Charity to Continue'}
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