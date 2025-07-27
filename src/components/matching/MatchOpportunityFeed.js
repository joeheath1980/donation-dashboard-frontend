import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { matchingAPI } from '../../services/api/matchingAPI';
import axios from 'axios';
import { FaClock, FaHeart, FaTimes, FaArrowRight, FaChevronRight, FaChevronLeft, FaTrophy, FaMedal, FaAward, FaStar, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import CharitySearch from '../CharitySearch/CharitySearch';
import styles from './MatchOpportunityFeed.module.css';

const MatchOpportunityFeed = ({ onSelectOpportunity }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedCharityId, setSelectedCharityId] = useState(null);
  const [charityOptions, setCharityOptions] = useState({});
  const [showCharitySearch, setShowCharitySearch] = useState(false);
  const [loadingCharities, setLoadingCharities] = useState(false);
  const websocket = useWebSocket();

  useEffect(() => {
    fetchOpportunities();

    // Listen for real-time updates
    const unsubscribe = websocket.on('campaignUpdate', handleCampaignUpdate);

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch charity details for P3 charity options
  const fetchCharityNames = async (charityIds) => {
    if (!charityIds || charityIds.length === 0) return {};
    
    setLoadingCharities(true);
    const charityMap = {};
    
    try {
      // Fetch charity details for each ID
      const promises = charityIds.map(async (id) => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return { id, charity: response.data?.normalizedCharity || response.data?.charity || response.data };
        } catch (error) {
          console.error(`Failed to fetch charity ${id}:`, error);
          return { id, charity: null };
        }
      });
      
      const results = await Promise.all(promises);
      
      // Build the charity map
      results.forEach(({ id, charity }) => {
        if (charity) {
          charityMap[id] = charity.name || charity.Charity_Legal_Name || `Charity ${id}`;
        }
      });
      
      setCharityOptions(prev => ({ ...prev, ...charityMap }));
    } catch (error) {
      console.error('Error fetching charity names:', error);
    } finally {
      setLoadingCharities(false);
    }
    
    return charityMap;
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await matchingAPI.getActiveOpportunities();
      // Handle both array response and object with opportunities property
      const rawOpportunities = Array.isArray(data) ? data : (data.opportunities || []);
      
      // Map the API response to the expected format
      const mappedOpportunities = rawOpportunities.map(opp => {
        // Map based on the new priority system
        const matchType = opp.matchType || 'open';
        const priority = opp.priority || 25;
        
        
        return {
          id: opp._id || opp.id || opp.campaignId,
          businessName: opp.businessName || opp.business?.name,
          businessLogo: opp.businessLogo || opp.business?.logo,
          // Handle various formats for charity name
          charityName: opp.charityName || opp.charity || opp.matchDetails?.matchedCharityName || null,
          charityId: opp.charityId || opp.matchDetails?.matchedCharity || null,
          multiplier: opp.multiplier || 2,
          multiplierText: opp.multiplierText || '2x',
          contribution: opp.contribution || 50,
          endDate: opp.validUntil || opp.endDate || opp.campaignEndDate,
          remainingBudget: opp.remainingBudget || opp.budget?.remaining || opp.budget || 0,
          totalBudget: opp.totalBudget || opp.budget?.total || opp.budget || 0,
          message: opp.description || opp.message || opp.campaign?.description,
          campaignId: opp.campaign || opp.campaignId || opp._id || opp.id,
          businessId: opp.business || opp.businessId,
          minDonation: opp.minDonation || opp.matchingDetails?.minDonation,
          maxDonation: opp.maxDonation || opp.matchingDetails?.maxDonation,
          // New 4-tier priority system fields
          matchType: matchType,
          priority: priority,
          cause: opp.cause || null,
          matchDetails: opp.matchDetails || {},
          // Determine if charity selection is needed
          needsCharitySelection: matchType === 'category_choice' || matchType === 'open',
          charityOptions: opp.matchDetails?.charityOptions || []
        };
      });
      
      setOpportunities(mappedOpportunities);
      setError(null);
      
      // Fetch charity names for all P3 opportunities
      const p3Opportunities = mappedOpportunities.filter(opp => opp.matchType === 'category_choice');
      const allCharityIds = new Set();
      p3Opportunities.forEach(opp => {
        if (opp.charityOptions && opp.charityOptions.length > 0) {
          opp.charityOptions.forEach(id => allCharityIds.add(id));
        }
      });
      
      if (allCharityIds.size > 0) {
        fetchCharityNames(Array.from(allCharityIds));
      }
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
      
      // Check if charity selection is required
      if (currentOpp.needsCharitySelection && !selectedCharityId) {
        alert('Please select a charity for this match');
        return;
      }
      
      if (onSelectOpportunity) {
        onSelectOpportunity({ 
          ...currentOpp, 
          suggestedAmount: selectedAmount,
          selectedCharityId: selectedCharityId || currentOpp.charityId
        });
      }
    }
    
    // Reset selected amount and charity for next card
    setSelectedAmount(null);
    setSelectedCharityId(null);
    setShowCharitySearch(false);
    
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

  // Get priority badge info
  const getPriorityBadge = (matchType, priority) => {
    switch (matchType) {
      case 'direct':
        return { icon: <FaTrophy />, text: 'Perfect Match', className: styles.priorityGold };
      case 'category_auto':
        return { icon: <FaMedal />, text: 'Category Match', className: styles.prioritySilver };
      case 'category_choice':
        return { icon: <FaAward />, text: 'Choose Your Charity', className: styles.priorityBronze };
      case 'open':
        return { icon: <FaStar />, text: 'Open Match', className: styles.priorityStandard };
      default:
        return { icon: <FaStar />, text: 'Match', className: styles.priorityStandard };
    }
  };

  const priorityBadge = getPriorityBadge(currentOpp.matchType, currentOpp.priority);

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
              {/* Priority Badge */}
              <div className={`${styles.priorityBadge} ${priorityBadge.className}`}>
                {priorityBadge.icon}
                <span>{priorityBadge.text}</span>
              </div>

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
                  <p>will match your donation {currentOpp.multiplierText || '2x'}</p>
                </div>
              </div>

              {/* Match Details */}
              <div className={styles.matchDetails}>
                {/* P1/P2: Direct or Auto-selected charity */}
                {(currentOpp.matchType === 'direct' || currentOpp.matchType === 'category_auto') && (
                  <>
                    <div className={styles.detailRow}>
                      <span>Charity:</span>
                      <strong>{currentOpp.charityName || 'Unknown Charity'}</strong>
                    </div>
                    <p className={styles.matchDescription}>
                      {currentOpp.businessName} will match your donation to {currentOpp.charityName || 'this charity'}
                    </p>
                    {currentOpp.matchDetails?.matchReason && (
                      <p className={styles.matchReason}>{currentOpp.matchDetails.matchReason}</p>
                    )}
                  </>
                )}

                {/* P3: Category choice */}
                {currentOpp.matchType === 'category_choice' && (
                  <>
                    <div className={styles.detailRow}>
                      <span>Category:</span>
                      <strong>{currentOpp.cause || currentOpp.matchDetails?.matchedCategory}</strong>
                    </div>
                    <div className={styles.charitySelection}>
                      <p>Choose a charity from {currentOpp.businessName}'s approved list:</p>
                      <select 
                        value={selectedCharityId || ''}
                        onChange={(e) => setSelectedCharityId(e.target.value)}
                        className={styles.charityDropdown}
                      >
                        <option value="">Select a charity...</option>
                        {currentOpp.charityOptions.map((charityId) => (
                          <option key={charityId} value={charityId}>
                            {charityOptions[charityId] || `Loading...`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* P4: Open match */}
                {currentOpp.matchType === 'open' && (
                  <div className={styles.openMatchSection}>
                    <p>{currentOpp.businessName} will match ${currentOpp.contribution} to any registered charity</p>
                    {!showCharitySearch ? (
                      <button 
                        className={styles.selectCharityButton}
                        onClick={() => setShowCharitySearch(true)}
                      >
                        <FaSearch /> Select a Charity
                      </button>
                    ) : (
                      <div className={styles.charitySearchWrapper}>
                        <CharitySearch 
                          onSelect={(charity) => {
                            setSelectedCharityId(charity._id || charity.ABN);
                            setShowCharitySearch(false);
                          }}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.detailRow}>
                  <span>Match Amount:</span>
                  <strong className={styles.contribution}>${currentOpp.contribution}</strong>
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