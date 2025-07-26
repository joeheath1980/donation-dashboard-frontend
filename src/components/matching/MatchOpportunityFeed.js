import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { matchingAPI } from '../../services/api/matchingAPI';
import { FaClock, FaHeart, FaTimes, FaArrowRight, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import styles from './MatchOpportunityFeed.module.css';

const MatchOpportunityFeed = ({ onSelectOpportunity }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const websocket = useWebSocket();

  useEffect(() => {
    fetchOpportunities();

    // Listen for real-time updates
    const unsubscribe = websocket.on('campaignUpdate', handleCampaignUpdate);

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await matchingAPI.getActiveOpportunities();
      // Handle both array response and object with opportunities property
      const rawOpportunities = Array.isArray(data) ? data : (data.opportunities || []);
      console.log('Fetched opportunities:', rawOpportunities); // Debug log
      
      // Map the API response to the expected format
      const mappedOpportunities = rawOpportunities.map(opp => {
        // Check if this opportunity allows charity selection
        const hasSpecificCharity = opp.charityId || opp.charity?._id || (opp.targetCharities && opp.targetCharities.length > 0 && opp.targetCharities[0]?._id);
        
        console.log('Mapping opportunity:', {
          id: opp._id,
          hasSpecificCharity,
          charityId: opp.charityId,
          charity: opp.charity,
          targetCharities: opp.targetCharities
        });
        
        return {
          id: opp._id || opp.id || opp.campaignId,
          businessName: opp.businessName || opp.business?.name,
          businessLogo: opp.businessLogo || opp.business?.logo,
          charityName: hasSpecificCharity ? (opp.charityName || opp.charity?.name || (opp.targetCharities && opp.targetCharities[0]?.name)) : null,
          charityId: hasSpecificCharity ? (opp.charityId || opp.charity?._id || (opp.targetCharities && opp.targetCharities[0]?._id)) : null,
          multiplier: opp.multiplier || opp.matchingDetails?.multiplier || 1,
          endDate: opp.endDate || opp.campaignEndDate,
          remainingBudget: opp.remainingBudget || opp.budget?.remaining || opp.budget || 0,
          totalBudget: opp.totalBudget || opp.budget?.total || opp.budget || 0,
          message: opp.message || opp.description || opp.campaign?.description,
          campaignId: opp.campaignId || opp._id || opp.id,
          minDonation: opp.minDonation || opp.matchingDetails?.minDonation,
          maxDonation: opp.maxDonation || opp.matchingDetails?.maxDonation,
          allowsCharitySelection: !hasSpecificCharity || opp.allowsCharitySelection
        };
      });
      
      setOpportunities(mappedOpportunities);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
      setError('Failed to load matching opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignUpdate = (update) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.campaignId === update.campaignId 
          ? { ...opp, remainingBudget: update.remainingBudget }
          : opp
      )
    );
  };

  const handleSwipe = (direction) => {
    const currentOpp = opportunities[currentIndex];
    
    if (direction === 'right') {
      if (!selectedAmount) {
        alert('Please select a donation amount first');
        return;
      }
      if (onSelectOpportunity) {
        onSelectOpportunity({ ...currentOpp, suggestedAmount: selectedAmount });
      }
    }
    
    // Reset selected amount for next card
    setSelectedAmount(null);
    
    if (currentIndex < opportunities.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Refresh opportunities when we reach the end
      fetchOpportunities();
      setCurrentIndex(0);
    }
  };

  const handleQuickDonation = (amount) => {
    setSelectedAmount(amount);
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchOpportunities} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  const currentOpp = opportunities[currentIndex];

  if (!currentOpp) {
    return (
      <div className={styles.noOpportunities}>
        <FaHeart className={styles.emptyIcon} />
        <h3>No Active Matches Available</h3>
        <p>Check back soon for new matching opportunities!</p>
        <button onClick={fetchOpportunities} className={styles.refreshButton}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={styles.feedContainer}>
      <h2 className={styles.title}>Active Matching Opportunities</h2>
      
      <div className={styles.cardStack}>
        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button 
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            aria-label="Previous opportunity"
          >
            <FaChevronLeft />
          </button>
        )}
        
        {currentIndex < opportunities.length - 1 && (
          <button 
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={() => handleSwipe('left')}
            aria-label="Next opportunity"
          >
            <FaChevronRight />
            <span className={styles.skipText}>Skip</span>
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentOpp.id}
            className={styles.card}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (Math.abs(offset.x) > 100) {
                handleSwipe(offset.x > 0 ? 'right' : 'left');
              }
            }}
          >
            <div className={styles.cardContent}>
              {/* Business Info */}
              <div className={styles.businessInfo}>
                {currentOpp.businessLogo && (
                  <img 
                    src={currentOpp.businessLogo} 
                    alt={currentOpp.businessName}
                    className={styles.businessLogo}
                  />
                )}
                <div className={styles.businessDetails}>
                  <h3>{currentOpp.businessName}</h3>
                  <p>will match your donation</p>
                </div>
              </div>

              {/* Match Details */}
              <div className={styles.matchDetails}>
                <div className={styles.detailRow}>
                  <span>Benefiting:</span>
                  <strong>{currentOpp.charityName || 'Choose any registered charity'}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Match Rate:</span>
                  <strong className={styles.multiplier}>{currentOpp.multiplier || 2}x</strong>
                </div>
              </div>

              {/* Time Remaining */}
              <TimeRemaining endDate={currentOpp.endDate} />

              {/* Quick Donation Amounts */}
              <div className={styles.quickAmounts}>
                <p className={styles.quickAmountsLabel}>Select amount to donate:</p>
                <div className={styles.amountButtons}>
                  {[10, 25, 50, 100].map(amount => {
                    const matchAmount = amount * (currentOpp.multiplier || 2);
                    return (
                      <button
                        key={amount}
                        className={`${styles.amountButton} ${selectedAmount === amount ? styles.selected : ''}`}
                        onClick={() => handleQuickDonation(amount)}
                      >
                        <span className={styles.donationAmount}>${amount}</span>
                        <span className={styles.matchAmount}>
                          → ${matchAmount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campaign Message */}
              {currentOpp.message && (
                <p className={styles.campaignMessage}>
                  "{currentOpp.message}"
                </p>
              )}

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button 
                  className={styles.matchButton}
                  onClick={() => handleSwipe('right')}
                >
                  <FaHeart /> Match This
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className={styles.navigationDots}>
        {opportunities.map((_, index) => (
          <div
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

// Time Remaining Component
const TimeRemaining = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days} day${days > 1 ? 's' : ''} remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} hour${hours > 1 ? 's' : ''} remaining`);
      } else {
        setTimeLeft('Ending soon!');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className={styles.timeRemaining}>
      <FaClock className={styles.clockIcon} />
      <span>{timeLeft}</span>
    </div>
  );
};

// Budget Indicator Component
const BudgetIndicator = ({ remaining = 0, total = 0 }) => {
  // Ensure we have valid numbers
  const remainingAmount = Number(remaining) || 0;
  const totalAmount = Number(total) || 1; // Avoid division by zero
  const percentage = totalAmount > 0 ? (remainingAmount / totalAmount) * 100 : 0;
  const isLow = percentage < 20;

  return (
    <div className={styles.budgetIndicator}>
      <div className={styles.budgetHeader}>
        <span>Budget remaining</span>
        <span className={isLow ? styles.budgetLow : styles.budgetNormal}>
          ${remainingAmount.toLocaleString()}
        </span>
      </div>
      <div className={styles.budgetBar}>
        <motion.div
          className={`${styles.budgetProgress} ${isLow ? styles.budgetProgressLow : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default MatchOpportunityFeed;