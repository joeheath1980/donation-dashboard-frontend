import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { matchingAPI } from '../../services/api/matchingAPI';
import axios from 'axios';
import { FaClock, FaHeart, FaTimes, FaArrowRight, FaChevronRight, FaChevronLeft, FaTrophy, FaMedal, FaAward, FaStar, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import CharitySearch from '../CharitySearch/CharitySearch';
import styles from './MatchOpportunityFeed.module.css';

// Persistence layer for charity selections
const persistSelection = (oppId, charityId) => {
  try {
    sessionStorage.setItem(`match_${oppId}`, JSON.stringify({
      charityId,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Failed to persist charity selection:', error);
  }
};

const recoverSelection = (oppId) => {
  try {
    const stored = sessionStorage.getItem(`match_${oppId}`);
    if (stored) {
      const { charityId, timestamp } = JSON.parse(stored);
      // Check if selection is still valid (< 30 min old)
      if (Date.now() - timestamp < 1800000) {
        return charityId;
      }
      // Clean up expired selection
      sessionStorage.removeItem(`match_${oppId}`);
    }
  } catch (error) {
    console.error('Failed to recover charity selection:', error);
  }
  return null;
};

const clearExpiredSelections = () => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('match_')) {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          const { timestamp } = JSON.parse(stored);
          if (Date.now() - timestamp > 1800000) {
            sessionStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to clear expired selections:', error);
  }
};

// Analytics tracking for debugging charity selection issues
const trackCharitySelection = (eventType, data) => {
  try {
    // Log to console for debugging
    console.log('Charity Selection Event:', eventType, data);
    
    // If analytics is available, track the event
    if (window.analytics && window.analytics.track) {
      window.analytics.track('matching_charity_selection', {
        event: eventType,
        opportunityId: data.opportunityId,
        matchType: data.matchType,
        hasSelection: !!data.charityId,
        charityId: data.charityId,
        timestamp: Date.now(),
        sessionId: sessionStorage.getItem('session_id') || 'no-session',
        cardIndex: data.cardIndex,
        userAgent: navigator.userAgent
      });
    }
  } catch (error) {
    console.error('Failed to track charity selection:', error);
  }
};

const MatchOpportunityFeed = ({ onSelectOpportunity }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedCharityId, setSelectedCharityId] = useState({});
  const [charityOptions, setCharityOptions] = useState({});
  const [showCharitySearch, setShowCharitySearch] = useState(false);
  const [loadingCharities, setLoadingCharities] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const websocket = useWebSocket();

  useEffect(() => {
    // Clear expired selections on mount
    clearExpiredSelections();
    
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
          const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${id}`;
          
          const response = await axios.get(url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const charityData = response.data?.normalizedCharity || response.data?.charity || response.data;
          return { id, charity: charityData };
        } catch (error) {
          console.error(`Failed to fetch charity ${id}:`, error.response?.status, error.response?.data || error.message);
          return { id, charity: null };
        }
      });
      
      const results = await Promise.all(promises);
      
      // Build the charity map
      results.forEach(({ id, charity }) => {
        if (charity) {
          const name = charity.name || charity.Charity_Legal_Name || charity.charityName || `Charity ${id}`;
          charityMap[id] = name;
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
        let matchType = opp.matchType || 'open';
        
        // Map 'random' to appropriate type based on whether it has a charityId
        if (matchType === 'random') {
          // Create variety based on the data available and some randomization
          const hasCharity = !!opp.charityId;
          const hasCause = !!opp.cause;
          
          // Temporarily create more variety since charity IDs don't exist
          // Use index-based distribution for demo purposes
          const oppIndex = rawOpportunities.indexOf(opp);
          
          if (oppIndex % 4 === 0 && hasCharity && hasCause) {
            // 25% - P1 Direct match (but will show unknown charity)
            matchType = 'direct';
          } else if (oppIndex % 4 === 1 && hasCause) {
            // 25% - P2 Category auto
            matchType = 'category_auto';
          } else if (oppIndex % 4 === 2 && hasCause) {
            // 25% - P3 Category choice
            matchType = 'category_choice';
          } else {
            // 25% - P4 Open match
            matchType = 'open';
          }
        }
        
        const priority = opp.priority || 25;
        
        
        
        const mappedOpp = {
          id: opp._id || opp.id || opp.campaignId,
          businessName: opp.businessName || opp.business?.name,
          businessLogo: opp.businessLogo || opp.business?.logo,
          // Handle various formats for charity name
          charityName: opp.charityName || opp.charity || opp.matchDetails?.matchedCharityName || null,
          charityId: opp.charityId || opp.matchDetails?.matchedCharity || null,
          multiplier: Math.max(opp.multiplier || 2, 2), // Ensure minimum 2x
          multiplierText: opp.multiplier > 1 ? `${opp.multiplier}x` : '2x',
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
          needsCharitySelection: matchType === 'category_auto' || matchType === 'category_choice' || matchType === 'open',
          charityOptions: opp.matchDetails?.charityOptions || []
        };
        
        return mappedOpp;
      });
      
      // Recover any persisted charity selections
      const recoveredSelections = {};
      mappedOpportunities.forEach(opp => {
        const recoveredId = recoverSelection(opp.id);
        if (recoveredId) {
          recoveredSelections[opp.id] = recoveredId;
          console.log(`Recovered charity selection for opportunity ${opp.id}:`, recoveredId);
        }
      });
      
      setOpportunities(mappedOpportunities);
      setSelectedCharityId(prev => ({ ...prev, ...recoveredSelections }));
      setError(null);
      
      // Fetch charity names for all opportunities with charity IDs
      const allCharityIds = new Set();
      
      mappedOpportunities.forEach(opp => {
        // Add charityId for P1/P2 matches
        if (opp.charityId) {
          allCharityIds.add(opp.charityId);
        }
        // Add charity options for P3 matches
        if (opp.charityOptions && opp.charityOptions.length > 0) {
          opp.charityOptions.forEach(id => allCharityIds.add(id));
        }
      });
      
      if (allCharityIds.size > 0) {
        const charityNamesMap = await fetchCharityNames(Array.from(allCharityIds));
        
        // Update opportunities with fetched charity names
        setOpportunities(prev => prev.map(opp => {
          if (opp.charityId && charityNamesMap[opp.charityId]) {
            return {
              ...opp,
              charityName: charityNamesMap[opp.charityId]
            };
          }
          // For demo: Generate mock charity names based on cause
          if (opp.charityId && !charityNamesMap[opp.charityId] && (opp.matchType === 'direct' || opp.matchType === 'category_auto')) {
            const mockCharityNames = {
              'Child Welfare': ['Save the Children Australia', 'Barnardos Australia', 'Children First Foundation'],
              'Health Services': ['Royal Flying Doctor Service', 'Cancer Council', 'Heart Foundation'],
              'Education': ['Smith Family', 'Indigenous Literacy Foundation', 'Room to Read Australia'],
              'Environment': ['WWF Australia', 'Clean Ocean Foundation', 'Greenpeace Australia'],
              'Animal Welfare': ['RSPCA', 'Animals Australia', 'Wildlife Victoria']
            };
            
            const causeCharities = mockCharityNames[opp.cause] || ['Australian Red Cross', 'Salvation Army', 'Oxfam Australia'];
            const randomIndex = Math.floor(Math.random() * causeCharities.length);
            
            return {
              ...opp,
              charityName: causeCharities[randomIndex]
            };
          }
          return opp;
        }));
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
      
      // Check if charity selection is required with recovery
      if (currentOpp.needsCharitySelection) {
        const selectedId = selectedCharityId[currentOpp.id] || recoverSelection(currentOpp.id);
        
        if (!selectedId) {
          trackCharitySelection('selection_missing', {
            opportunityId: currentOpp.id,
            matchType: currentOpp.matchType,
            cardIndex: currentIndex
          });
          
          alert('Please select a charity for this match');
          return;
        }
        
        // If we recovered a selection, update state
        if (!selectedCharityId[currentOpp.id] && selectedId) {
          setSelectedCharityId(prev => ({...prev, [currentOpp.id]: selectedId}));
        }
      }
      
      const finalCharityId = currentOpp.needsCharitySelection 
        ? (selectedCharityId[currentOpp.id] || recoverSelection(currentOpp.id))
        : currentOpp.charityId;
      
      if (onSelectOpportunity) {
        trackCharitySelection('match_initiated', {
          opportunityId: currentOpp.id,
          matchType: currentOpp.matchType,
          charityId: finalCharityId,
          cardIndex: currentIndex
        });
        
        onSelectOpportunity({ 
          ...currentOpp, 
          suggestedAmount: selectedAmount,
          selectedCharityId: finalCharityId
        });
      }
    }
    
    // Reset selected amount for next card
    setSelectedAmount(null);
    setShowCharitySearch(false);
    setShowCustomAmount(false);
    setCustomAmount('');
    
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
        return { icon: <FaTrophy />, text: 'P1 - Perfect Match', className: styles.priorityGold };
      case 'category_auto':
        return { icon: <FaMedal />, text: 'P2 - Category Match', className: styles.prioritySilver };
      case 'category_choice':
        return { icon: <FaAward />, text: 'P3 - Choose Your Charity', className: styles.priorityBronze };
      case 'open':
        return { icon: <FaStar />, text: 'P4 - Open Match', className: styles.priorityStandard };
      default:
        return { icon: <FaStar />, text: 'P4 - Match', className: styles.priorityStandard };
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
                  <p className={styles.matchText}>
                    will match your donation 
                    <span className={styles.multiplierHighlight}>
                      {currentOpp.multiplier || 2}x
                    </span>
                  </p>
                </div>
              </div>

              {/* Match Details */}
              <div className={styles.matchDetails}>
                {/* P1: Direct match with pre-selected charity */}
                {currentOpp.matchType === 'direct' && (
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

                {/* P2 & P3: Category matches - need charity selection */}
                {(currentOpp.matchType === 'category_auto' || currentOpp.matchType === 'category_choice') && (
                  <>
                    <div className={styles.detailRow}>
                      <span>Category:</span>
                      <strong>{currentOpp.cause || currentOpp.matchDetails?.matchedCategory}</strong>
                    </div>
                    <div className={styles.charitySelection}>
                      <p>Choose a charity from {currentOpp.businessName}'s approved list:</p>
                      <select 
                        value={selectedCharityId[currentOpp.id] || ''}
                        onChange={(e) => {
                          const charityId = e.target.value;
                          
                          // Update state
                          setSelectedCharityId(prev => ({...prev, [currentOpp.id]: charityId}));
                          
                          // Persist selection if not empty
                          if (charityId) {
                            persistSelection(currentOpp.id, charityId);
                            
                            trackCharitySelection('charity_selected_dropdown', {
                              opportunityId: currentOpp.id,
                              matchType: currentOpp.matchType,
                              charityId,
                              cardIndex: currentIndex
                            });
                          } else {
                            sessionStorage.removeItem(`match_${currentOpp.id}`);
                          }
                        }}
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
                    {selectedCharityId[currentOpp.id] ? (
                      <div className={styles.selectedCharityNotice}>
                        <p style={{color: '#10b981', fontWeight: '600'}}>
                          ✓ Charity selected
                          {recoverSelection(currentOpp.id) && !opportunities[currentIndex]?.hasShownRecovery && (
                            <span style={{fontSize: '0.875rem', marginLeft: '8px', opacity: 0.8}}>
                              (recovered)
                            </span>
                          )}
                        </p>
                        <button 
                          className={styles.selectCharityButton}
                          onClick={() => {
                            setSelectedCharityId(prev => ({...prev, [currentOpp.id]: null}));
                            sessionStorage.removeItem(`match_${currentOpp.id}`);
                            
                            trackCharitySelection('charity_deselected', {
                              opportunityId: currentOpp.id,
                              matchType: currentOpp.matchType,
                              cardIndex: currentIndex
                            });
                            
                            setShowCharitySearch(true);
                          }}
                        >
                          Change charity
                        </button>
                      </div>
                    ) : !showCharitySearch ? (
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
                            const charityId = charity._id || charity.id || charity.ABN;
                            
                            // Update state
                            setSelectedCharityId(prev => ({...prev, [currentOpp.id]: charityId}));
                            
                            // Persist to sessionStorage
                            persistSelection(currentOpp.id, charityId);
                            
                            // Track selection
                            trackCharitySelection('charity_selected', {
                              opportunityId: currentOpp.id,
                              matchType: currentOpp.matchType,
                              charityId,
                              cardIndex: currentIndex
                            });
                            
                            setShowCharitySearch(false);
                          }}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.detailRow}>
                  <span>Match Range:</span>
                  <strong className={styles.contribution}>
                    ${currentOpp.minAmount || 5} - ${currentOpp.maxAmount || 15}
                  </strong>
                </div>
              </div>

              {/* Time Remaining */}
              <TimeRemaining endDate={currentOpp.endDate} />

              {/* Quick Donation Amounts */}
              <div className={styles.quickAmounts}>
                <p className={styles.quickAmountsLabel}>Select amount to donate:</p>
                <div className={styles.amountButtons}>
                  {(() => {
                    // Calculate 3 evenly distributed amounts within the range
                    const min = currentOpp.minAmount || 5;
                    const max = currentOpp.maxAmount || 15;
                    const step = (max - min) / 2;
                    const amounts = [
                      Math.round(min),
                      Math.round(min + step),
                      Math.round(max)
                    ];
                    
                    return amounts.map(amount => {
                      // Fix: 2x means business matches your amount 1:1
                      const businessMatch = amount * (currentOpp.multiplier - 1 || 1);
                      const totalImpact = amount + businessMatch;
                      return (
                        <button
                          key={amount}
                          className={`${styles.amountButton} ${selectedAmount === amount ? styles.selected : ''}`}
                          onClick={() => handleQuickDonation(amount)}
                        >
                          <span className={styles.donationAmount}>${amount}</span>
                          <span className={styles.matchAmount}>
                            = ${totalImpact}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
                
                {/* Custom Amount Option */}
                <div className={styles.customAmountWrapper}>
                  {!showCustomAmount ? (
                    <button 
                      className={styles.customAmountButton}
                      onClick={() => setShowCustomAmount(true)}
                    >
                      Custom Amount
                    </button>
                  ) : (
                    <div className={styles.customAmountInput}>
                      <input
                        type="number"
                        min={currentOpp.minAmount || 5}
                        max={currentOpp.maxAmount || 15}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder={`$${currentOpp.minAmount || 5} - $${currentOpp.maxAmount || 15}`}
                        className={styles.customInput}
                      />
                      <button
                        className={styles.customAmountConfirm}
                        onClick={() => {
                          const amount = parseFloat(customAmount);
                          const min = currentOpp.minAmount || 5;
                          const max = currentOpp.maxAmount || 15;
                          if (amount >= min && amount <= max) {
                            handleQuickDonation(amount);
                            setShowCustomAmount(false);
                          } else {
                            alert(`Please enter an amount between $${min} and $${max}`);
                          }
                        }}
                      >
                        Select
                      </button>
                    </div>
                  )}
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