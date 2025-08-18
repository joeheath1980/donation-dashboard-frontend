import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMatchSelection } from '../../contexts/MatchSelectionContext';
import { matchingAPI } from '../../services/api/matchingAPI';
import CharitySearch from '../CharitySearch/CharitySearch';
import axios from 'axios';
import styles from './MatchOpportunityFeed.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const requestCache = new Map();
const REQUEST_CACHE_TTL = 60000; // 1 minute

function MatchOpportunityFeed({ opportunities: rawOpportunities, onSelectOpportunity }) {
  const { 
    selections, 
    errors, 
    updateSelection, 
    setError, 
    clearError,
    hydrateSelections,
    setCachedCharities,
    charityCache 
  } = useMatchSelection();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [loadingCharities, setLoadingCharities] = useState(false);
  const [showCharitySearch, setShowCharitySearch] = useState(false);
  const [loading, setLoading] = useState(!rawOpportunities);
  const [fetchedOpportunities, setFetchedOpportunities] = useState(null);
  const abortControllerRef = useRef(null);

  // Fetch opportunities if not provided as props
  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!rawOpportunities) {
        try {
          setLoading(true);
          console.log('Fetching matching opportunities...');
          const data = await matchingAPI.getActiveOpportunities();
          console.log('Raw API response:', JSON.stringify(data, null, 2));
          console.log('Raw API response type:', typeof data);
          console.log('Is array?', Array.isArray(data));
          if (data && typeof data === 'object') {
            console.log('Response keys:', Object.keys(data));
          }
          
          // Handle both array response and object with opportunities property
          const opportunities = Array.isArray(data) ? data : (data.opportunities || []);
          
          // Log detailed info about each opportunity
          console.log('Parsed opportunities count:', opportunities.length);
          console.log('First opportunity full object:', opportunities[0]);
          opportunities.forEach((opp, idx) => {
            console.log(`  Opportunity [${idx}]:`, {
              matchType: opp.matchType,
              charityId: opp.charityId,
              cause: opp.cause,
              businessName: opp.businessName,
              id: opp.id || opp._id,
              priority: opp.priority,
              hasMatchType: 'matchType' in opp,
              matchTypeValue: opp.matchType,
              matchTypeType: typeof opp.matchType
            });
          });
          
          setFetchedOpportunities(opportunities);
        } catch (error) {
          console.error('Failed to fetch opportunities:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
          });
          
          // If it's an auth error or API issue, use demo data as fallback
          if (error.response?.status === 401 || error.response?.status === 404 || error.response?.status === 500) {
            console.log('Using demo data due to API error - ensure backend is running at http://localhost:3002');
            const demoData = [
              { 
                matchType: 'direct', 
                businessName: 'Demo Business 1', 
                priority: 100,
                charityId: 'demo-charity-1',
                charityName: 'Demo Charity Direct',
                multiplier: 2,
                minAmount: 5,
                maxAmount: 15
              },
              { 
                matchType: 'category', 
                businessName: 'Demo Business 2', 
                priority: 50,
                cause: 'Health',
                charityOptions: ['demo-health-1', 'demo-health-2', 'demo-health-3'],
                multiplier: 2,
                minAmount: 5,
                maxAmount: 15
              },
              { 
                matchType: 'open', 
                businessName: 'Demo Business 3', 
                priority: 25,
                multiplier: 2,
                minAmount: 5,
                maxAmount: 15
              },
            ];
            setFetchedOpportunities(demoData);
          } else {
            setFetchedOpportunities([]);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOpportunities();
  }, [rawOpportunities]);

  const opportunities = useMemo(() => {
    const oppsToUse = rawOpportunities || fetchedOpportunities || [];
    if (!oppsToUse || oppsToUse.length === 0) return [];
    
    // Generate demo data with variety if needed
    return oppsToUse.map((opp, index) => {
      // Determine match type - use API data if available, otherwise use demo pattern
      let matchType = opp.matchType;
      
      // Only apply demo distribution if API didn't provide a matchType
      if (!matchType) {
        // Use simple rotating pattern for demo
        const types = ['direct', 'category', 'open'];
        matchType = types[index % 3];
        console.log(`[MatchOpportunityFeed] No matchType from API for opportunity ${index}, using demo pattern: ${matchType}`);
      } else {
        console.log(`[MatchOpportunityFeed] Using API matchType for opportunity ${index}: ${matchType}`);
      }
      
      // Map old P2/P3 to unified 'category' 
      if (matchType === 'category_auto' || matchType === 'category_choice') {
        console.log(`[MatchOpportunityFeed] Mapping ${matchType} to 'category'`);
        matchType = 'category';
      }
      
      console.log(`[MatchOpportunityFeed] Final matchType for opportunity ${index}: ${matchType}`);

      // Generate demo charity data based on match type
      let charityId = opp.charityId;
      let charityName = opp.charityName;
      let charityOptions = opp.charityOptions || [];
      
      // For direct matches, ensure we have a pre-selected charity
      if (matchType === 'direct' && !charityId) {
        const demoCharities = [
          { id: 'demo-1', name: 'Save the Children Australia' },
          { id: 'demo-2', name: 'Red Cross Australia' },
          { id: 'demo-3', name: 'Cancer Council' },
          { id: 'demo-4', name: 'Beyond Blue' }
        ];
        const selected = demoCharities[index % demoCharities.length];
        charityId = selected.id;
        charityName = selected.name;
      }
      
      // For category matches, ensure we have charity options
      if (matchType === 'category' && charityOptions.length === 0) {
        // Generate demo charity options based on cause
        const causeCharities = {
          'Health': ['demo-health-1', 'demo-health-2', 'demo-health-3'],
          'Education': ['demo-edu-1', 'demo-edu-2', 'demo-edu-3'],
          'Environment': ['demo-env-1', 'demo-env-2', 'demo-env-3'],
          'Animals': ['demo-animal-1', 'demo-animal-2', 'demo-animal-3']
        };
        const causes = ['Health', 'Education', 'Environment', 'Animals'];
        const cause = opp.cause || causes[index % 4];
        charityOptions = causeCharities[cause] || ['demo-opt-1', 'demo-opt-2', 'demo-opt-3'];
      }

      // Map the opportunity to ensure it has the right structure
      const mappedOpp = {
        id: opp._id || opp.id || opp.campaignId || `demo-${index}`,
        businessName: opp.businessName || opp.business?.name || `Demo Business ${index + 1}`,
        businessLogo: opp.businessLogo || opp.business?.logo,
        charityName: charityName || opp.charity?.name || null,
        charityId: charityId || opp.charity?.id || null,
        multiplier: opp.multiplier || 2,
        minAmount: opp.minAmount || opp.minDonation || 5,
        maxAmount: opp.maxAmount || opp.maxDonation || 15,
        matchType: matchType,
        charityOptions: charityOptions,
        cause: opp.cause || opp.category || null,
        priority: opp.priority || (matchType === 'direct' ? 100 : matchType === 'category' ? 50 : 25),
        ...opp
      };

      const validTypes = ['direct', 'category', 'category_auto', 'category_choice', 'open'];
      if (!validTypes.includes(mappedOpp.matchType)) {
        console.warn(`Invalid matchType: ${mappedOpp.matchType} for opportunity ${mappedOpp.id}, defaulting to 'open'`);
        mappedOpp.matchType = 'open';
      }
      
      return {
        ...mappedOpp,
        needsCharitySelection: ['category', 'category_auto', 'category_choice', 'open'].includes(mappedOpp.matchType)
      };
    });
  }, [rawOpportunities, fetchedOpportunities]);

  useEffect(() => {
    hydrateSelections(opportunities);
  }, [opportunities, hydrateSelections]);

  const fetchCharityNames = useCallback(async (charityIds) => {
    if (!charityIds || charityIds.length === 0) return {};

    const uniqueIds = [...new Set(charityIds)];
    
    // Generate demo charity names for demo IDs
    const demoCharityMap = {
      'demo-1': 'Save the Children Australia',
      'demo-2': 'Red Cross Australia',
      'demo-3': 'Cancer Council',
      'demo-4': 'Beyond Blue',
      'demo-health-1': 'Heart Foundation',
      'demo-health-2': 'Cancer Research Institute',
      'demo-health-3': 'Mental Health Foundation',
      'demo-edu-1': 'Smith Family',
      'demo-edu-2': 'Indigenous Literacy Foundation',
      'demo-edu-3': 'Room to Read Australia',
      'demo-env-1': 'WWF Australia',
      'demo-env-2': 'Clean Ocean Foundation',
      'demo-env-3': 'Greenpeace Australia',
      'demo-animal-1': 'RSPCA',
      'demo-animal-2': 'Animals Australia',
      'demo-animal-3': 'Wildlife Victoria',
      'demo-opt-1': 'Oxfam Australia',
      'demo-opt-2': 'Salvation Army',
      'demo-opt-3': 'Barnardos Australia'
    };
    
    // Separate demo IDs from real IDs
    const demoIds = uniqueIds.filter(id => id && id.toString().startsWith('demo-'));
    const realIds = uniqueIds.filter(id => id && !id.toString().startsWith('demo-') && !charityCache[id]);
    
    // Add demo charities to cache
    const demoMap = {};
    demoIds.forEach(id => {
      demoMap[id] = demoCharityMap[id] || `Demo Charity ${id}`;
    });
    
    if (demoIds.length > 0) {
      setCachedCharities(demoMap);
    }

    // If no real IDs to fetch, return cached data
    if (realIds.length === 0) {
      console.log('[Batch] All charities cached or demo');
      return { ...charityCache, ...demoMap };
    }

    const cacheKey = realIds.sort().join(',');
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < REQUEST_CACHE_TTL) {
      console.log('[Batch] Using cached request');
      return { ...cached.data, ...demoMap };
    }

    console.log(`[Batch] Fetching ${realIds.length} real charities`);
    setLoadingCharities(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/batch`,
        { ids: realIds },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current.signal
        }
      );

      const fetchedMap = response.data;
      console.log(`[Batch] Received ${Object.keys(fetchedMap).length} charities`);

      setCachedCharities(fetchedMap);

      const allData = { ...charityCache, ...fetchedMap, ...demoMap };
      requestCache.set(cacheKey, {
        data: allData,
        timestamp: Date.now()
      });

      return allData;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('[Batch] Request aborted');
        return { ...charityCache, ...demoMap };
      }

      console.error('[Batch] Failed to fetch charities:', error);

      const failedMap = {};
      realIds.forEach(id => {
        failedMap[id] = `Charity ${id} (unavailable)`;
      });

      setCachedCharities(failedMap);
      return { ...charityCache, ...failedMap, ...demoMap };
    } finally {
      setLoadingCharities(false);
      abortControllerRef.current = null;
    }
  }, [charityCache, setCachedCharities]);

  useEffect(() => {
    if (!opportunities || opportunities.length === 0) return;

    const allCharityIds = new Set();

    opportunities.forEach(opp => {
      if (opp.charityId) allCharityIds.add(opp.charityId);
      if (opp.charityOptions?.length) {
        opp.charityOptions.forEach(id => allCharityIds.add(id));
      }
    });

    if (allCharityIds.size > 0) {
      fetchCharityNames([...allCharityIds]);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [opportunities, fetchCharityNames]);

  const handleMatchThis = useCallback(() => {
    const currentOpp = opportunities[currentIndex];
    if (!currentOpp) return;

    const charityId = selections[currentOpp.id];

    if (currentOpp.needsCharitySelection && !charityId) {
      setError(currentOpp.id, 'Please select a charity to continue');
      
      if (window.analytics) {
        window.analytics.track('charity_selection_missing', {
          opportunityId: currentOpp.id,
          matchType: currentOpp.matchType,
          cardIndex: currentIndex
        });
      }
      
      return;
    }

    const amount = showCustomAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < (currentOpp.minAmount || 5) || amount > (currentOpp.maxAmount || 15)) {
      setError(currentOpp.id, 'Please select a valid donation amount');
      return;
    }

    // Get charity name from cache or opportunity data
    let charityName = null;
    if (charityId) {
      charityName = charityCache[charityId] || `Charity ${charityId}`;
    } else if (currentOpp.charityId) {
      charityName = currentOpp.charityName || charityCache[currentOpp.charityId] || `Charity ${currentOpp.charityId}`;
    }

    console.log('[MatchOpportunityFeed] Passing to modal:', {
      charityId: charityId || currentOpp.charityId,
      charityName: charityName,
      matchType: currentOpp.matchType
    });

    onSelectOpportunity({
      ...currentOpp,
      suggestedAmount: amount,
      selectedCharityId: charityId || currentOpp.charityId,
      selectedCharityName: charityName
    });

    if (window.analytics) {
      window.analytics.track('opportunity_matched', {
        opportunityId: currentOpp.id,
        matchType: currentOpp.matchType,
        amount,
        charityId: charityId || currentOpp.charityId
      });
    }
  }, [
    opportunities, 
    currentIndex, 
    selections, 
    selectedAmount, 
    customAmount, 
    showCustomAmount, 
    setError, 
    onSelectOpportunity
  ]);

  const handleCharitySelect = useCallback((charityId, charityName = null) => {
    const currentOpp = opportunities[currentIndex];
    if (!currentOpp) return;

    updateSelection(currentOpp.id, charityId);
    
    // If we have a charity name, store it in the cache
    if (charityName && charityId) {
      setCachedCharities({ [charityId]: charityName });
    }

    if (window.analytics) {
      window.analytics.track('charity_selected', {
        opportunityId: currentOpp.id,
        matchType: currentOpp.matchType,
        charityId,
        cardIndex: currentIndex
      });
    }
  }, [opportunities, currentIndex, updateSelection, setCachedCharities]);

  const handleSkip = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < opportunities.length) {
      setCurrentIndex(nextIndex);
      setSelectedAmount(null);
      setShowCustomAmount(false);
      setCustomAmount('');
    }
  }, [currentIndex, opportunities.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const getSmartPresets = useCallback((min = 5, max = 15) => {
    const mid = Math.round((min + max) / 2);
    return [min, mid, max];
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading matching opportunities...</p>
      </div>
    );
  }

  const currentOpp = opportunities[currentIndex];
  if (!currentOpp || opportunities.length === 0) {
    return (
      <div className={styles.noOpportunities}>
        <h3>No Matching Opportunities</h3>
        <p>There are no active matching opportunities at the moment.</p>
        <p>Check back soon for new matches!</p>
      </div>
    );
  }

  // Get priority badge info - 3-tier system
  const getPriorityBadge = (matchType) => {
    switch (matchType) {
      case 'direct':
        return { text: 'Perfect Match', className: styles.priorityGold };
      case 'category':
      case 'category_auto':
      case 'category_choice':
        return { text: 'Category Match', className: styles.prioritySilver };
      case 'open':
        return { text: 'Open Match', className: styles.priorityBronze };
      default:
        return { text: 'Match', className: styles.priorityStandard };
    }
  };

  const priorityBadge = getPriorityBadge(currentOpp.matchType);

  return (
    <div className={styles.feedContainer} data-testid="match-selection-context">
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${((currentIndex + 1) / opportunities.length) * 100}%` }}
        />
        <span className={styles.progressText}>
          {currentIndex + 1} of {opportunities.length}
        </span>
      </div>

      <div className={styles.carouselContainer}>
        {/* Elegant left skip button */}
        <button 
          className={styles.carouselNavLeft}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Previous opportunity"
        >
          <FaChevronLeft />
        </button>
        
        <div className={styles.cardStack}>
          <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.priorityBadge} ${priorityBadge.className}`}>
              <span>{priorityBadge.text}</span>
            </div>
            <h3>{currentOpp.businessName}</h3>
            <p className={styles.matchInfo}>
              {currentOpp.multiplier}x match up to ${currentOpp.maxAmount}
            </p>
          </div>

          <div className={styles.cardBody}>
            {currentOpp.matchType === 'direct' && (
              <div className={styles.directMatch}>
                <p>Matching donations to:</p>
                <h4>{charityCache[currentOpp.charityId] || 'Loading...'}</h4>
              </div>
            )}

            {['category', 'category_auto', 'category_choice'].includes(currentOpp.matchType) && (
              <div className={styles.charitySelection}>
                <p>Choose from {currentOpp.businessName}'s approved charities:</p>
                <select 
                  value={selections[currentOpp.id] || ''}
                  onChange={(e) => handleCharitySelect(e.target.value)}
                  className={styles.charityDropdown}
                  disabled={loadingCharities}
                >
                  <option value="">
                    {loadingCharities ? 'Loading charities...' : 'Select a charity...'}
                  </option>
                  {!loadingCharities && currentOpp.charityOptions?.map((charityId) => (
                    <option key={charityId} value={charityId}>
                      {charityCache[charityId] || `Charity ${charityId}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentOpp.matchType === 'open' && (
              <div className={styles.openMatchSection}>
                <p>{currentOpp.businessName} will match to any registered charity</p>
                
                {selections[currentOpp.id] ? (
                  <div className={styles.selectedCharityNotice}>
                    <p>✓ Selected: {charityCache[selections[currentOpp.id]] || selections[currentOpp.id]}</p>
                    <button 
                      className={styles.changeButton}
                      onClick={() => {
                        updateSelection(currentOpp.id, null);
                        setShowCharitySearch(true);
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button 
                    className={styles.selectCharityButton}
                    onClick={() => setShowCharitySearch(true)}
                  >
                    Select a Charity
                  </button>
                )}
                
                {showCharitySearch && (
                  <div className={styles.charitySearchWrapper}>
                    <CharitySearch 
                      onCharitySelect={(charity) => {
                        const charityId = charity._id || charity.id || charity.ABN;
                        const charityName = charity.name || charity.charityName || charity.Charity_Legal_Name;
                        handleCharitySelect(charityId, charityName);
                        setShowCharitySearch(false);
                      }}
                      placeholder="Search for any registered charity..."
                    />
                  </div>
                )}
              </div>
            )}

            {errors[currentOpp.id] && (
              <div className={styles.errorMessage} role="alert">
                <span>⚠️ {errors[currentOpp.id]}</span>
              </div>
            )}

            <div className={styles.amountSection}>
              <h4>Select your donation amount:</h4>
              <div className={styles.amountButtons}>
                {getSmartPresets(currentOpp.minAmount, currentOpp.maxAmount).map(amount => (
                  <button
                    key={amount}
                    className={`${styles.amountButton} ${selectedAmount === amount ? styles.selected : ''}`}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setShowCustomAmount(false);
                      clearError(currentOpp.id);
                    }}
                  >
                    <span className={styles.donationAmount}>${amount}</span>
                    <span className={styles.totalImpact}>
                      = ${amount * currentOpp.multiplier}
                    </span>
                  </button>
                ))}
                
                <button
                  className={`${styles.amountButton} ${showCustomAmount ? styles.selected : ''}`}
                  onClick={() => {
                    setShowCustomAmount(true);
                    setSelectedAmount(null);
                  }}
                >
                  Other
                </button>
              </div>

              {showCustomAmount && (
                <input
                  type="number"
                  className={styles.customAmountInput}
                  placeholder={`${currentOpp.minAmount} - ${currentOpp.maxAmount}`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min={currentOpp.minAmount}
                  max={currentOpp.maxAmount}
                />
              )}
            </div>
          </div>

          <div className={styles.cardFooter}>
            <div className={styles.actionButtons}>
              <button 
                className={styles.matchButton}
                onClick={handleMatchThis}
              >
                Match This! 🎯
              </button>
            </div>
          </div>
          </div>
        </div>
        
        {/* Elegant right skip button */}
        <button 
          className={styles.carouselNavRight}
          onClick={handleSkip}
          disabled={currentIndex >= opportunities.length - 1}
          aria-label="Next opportunity"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

export default MatchOpportunityFeed;