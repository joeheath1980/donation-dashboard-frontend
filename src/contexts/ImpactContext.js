import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const ImpactContext = createContext();

// Max points for each component
const MAX_DONATION_SCORE = 40;
const MAX_VOLUNTEER_SCORE = 25;
const MAX_FUNDRAISING_SCORE = 25;

// Score calculation functions remain unchanged
const calculateDonationScore = (regularDonations, oneOffDonations, archivedCampaigns = []) => {
  const archivedDonations = archivedCampaigns.map(campaign => ({
    amount: campaign.raisedAmount || campaign.goalAmount,
    date: campaign.completedDate
  }));

  const totalDonations = [...regularDonations, ...oneOffDonations, ...archivedDonations];
  const totalDonationAmount = totalDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

  let donationScore = 0;
  let remainingAmount = totalDonationAmount;

  const firstTierAmount = Math.min(remainingAmount, 1000);
  donationScore += firstTierAmount / 100;
  remainingAmount -= firstTierAmount;

  if (remainingAmount > 0) {
    const secondTierAmount = Math.min(remainingAmount, 4000);
    donationScore += secondTierAmount / 200;
    remainingAmount -= secondTierAmount;
  }

  if (remainingAmount > 0) {
    donationScore += remainingAmount / 500;
  }

  let regularGivingMultiplier = 1;
  if (regularDonations && regularDonations.length > 0) {
    const frequencies = regularDonations.map(d => d.frequency);
    if (frequencies.includes('weekly')) {
      regularGivingMultiplier = 1.2;
    } else if (frequencies.includes('monthly')) {
      regularGivingMultiplier = 1.1;
    }
  }
  donationScore *= regularGivingMultiplier;

  return Math.min(Math.round(donationScore), MAX_DONATION_SCORE);
};

const calculateVolunteerScore = (volunteeringActivities) => {
  const totalVolunteerHours = volunteeringActivities.reduce((sum, v) => sum + (v.hours || 0), 0);

  let volunteerScore = 0;
  let remainingHours = totalVolunteerHours;

  const firstTierHours = Math.min(remainingHours, 40);
  volunteerScore += firstTierHours * 0.5;
  remainingHours -= firstTierHours;

  if (remainingHours > 0) {
    const secondTierHours = Math.min(remainingHours, 80);
    volunteerScore += secondTierHours * 0.3;
    remainingHours -= secondTierHours;
  }

  if (remainingHours > 0) {
    volunteerScore += remainingHours * 0.1;
  }

  let longTermBonus = 0;
  let earliestStartDate = new Date();
  let latestEndDate = new Date(0);

  volunteeringActivities.forEach(activity => {
    const startDate = new Date(activity.startDate);
    const endDate = activity.endDate ? new Date(activity.endDate) : new Date();
    if (startDate < earliestStartDate) earliestStartDate = startDate;
    if (endDate > latestEndDate) latestEndDate = endDate;
  });

  const durationInMonths = (latestEndDate.getFullYear() - earliestStartDate.getFullYear()) * 12 + (latestEndDate.getMonth() - earliestStartDate.getMonth());

  if (durationInMonths >= 12) {
    longTermBonus = 3;
  } else if (durationInMonths >= 6) {
    longTermBonus = 1.5;
  }

  volunteerScore += longTermBonus;

  return Math.min(Math.round(volunteerScore), MAX_VOLUNTEER_SCORE);
};

const calculateFundraisingScore = (fundraisingCampaigns) => {
  const totalFundsRaised = fundraisingCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);

  let fundraisingScore = 0;
  let remainingAmount = totalFundsRaised;

  const firstTierAmount = Math.min(remainingAmount, 2000);
  fundraisingScore += firstTierAmount / 100;
  remainingAmount -= firstTierAmount;

  if (remainingAmount > 0) {
    const secondTierAmount = Math.min(remainingAmount, 6000);
    fundraisingScore += secondTierAmount / 300;
    remainingAmount -= secondTierAmount;
  }

  if (remainingAmount > 0) {
    fundraisingScore += remainingAmount / 600;
  }

  const totalEventsOrganized = fundraisingCampaigns.reduce((sum, c) => sum + (c.eventsOrganized || 0), 0);
  const totalOnlineCampaignsInitiated = fundraisingCampaigns.reduce((sum, c) => sum + (c.onlineCampaignsInitiated || 0), 0);

  fundraisingScore += totalEventsOrganized * 1.5;
  fundraisingScore += totalOnlineCampaignsInitiated * 0.75;

  return Math.min(Math.round(fundraisingScore), MAX_FUNDRAISING_SCORE);
};

export const calculateComplexImpactScore = (userData) => {
  if (!userData) {
    console.error('Invalid input for calculateComplexImpactScore');
    return { totalScore: 0, donationScore: 0, volunteerScore: 0, fundraisingScore: 0 };
  }

  const {
    regularDonations = [],
    oneOffDonations = [],
    volunteeringActivities = [],
    fundraisingCampaigns = []
  } = userData;

  const archivedCampaigns = fundraisingCampaigns.filter(campaign => campaign.status === 'archived');

  const donationScore = calculateDonationScore(regularDonations, oneOffDonations, archivedCampaigns);
  const volunteerScore = calculateVolunteerScore(volunteeringActivities);
  const fundraisingScore = calculateFundraisingScore(fundraisingCampaigns);

  const totalScore = donationScore + volunteerScore + fundraisingScore;
  const finalTotalScore = Math.min(Math.round(totalScore), 90);

  return {
    totalScore: finalTotalScore,
    donationScore,
    volunteerScore,
    fundraisingScore
  };
};

const defaultScoreDetails = {
  totalScore: 0,
  donationScore: 0,
  volunteerScore: 0,
  fundraisingScore: 0
};

const extractKeywords = (text) => {
  if (!text) return [];
  const stopwords = new Set([
    'the', 'and', 'or', 'but', 'if', 'while', 'with', 'a', 'an', 'of', 'to', 'in', 'for', 'on', 'at',
    'by', 'from', 'up', 'about', 'into', 'over', 'after', 'under', 'above', 'below', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
    'should', 'can', 'could', 'may', 'might', 'must', 'this', 'that', 'these', 'those'
  ]);

  const words = text.replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 2 && !stopwords.has(word));
};

export const ImpactProvider = ({ children }) => {
  const [impactScore, setImpactScore] = useState(0);
  const [scoreDetails, setScoreDetails] = useState(defaultScoreDetails);
  const [lastYearImpactScore, setLastYearImpactScore] = useState(0);
  const [tier, setTier] = useState("Giver");
  const [pointsToNextTier, setPointsToNextTier] = useState(0);
  const [donations, setDonations] = useState([]);
  const [oneOffContributions, setOneOffContributions] = useState([]);
  const [volunteerActivities, setVolunteerActivities] = useState([]);
  const [fundraisingCampaigns, setFundraisingCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [followedCharities, setFollowedCharities] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const searchQueryRef = useRef('');
  const dataRef = useRef({
    donations: [],
    oneOffContributions: [],
    volunteerActivities: [],
    fundraisingCampaigns: [],
    followedCharities: []
  });

  const { user } = useAuth();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  const updateImpactScore = useCallback(() => {
    const userData = {
      regularDonations: donations,
      oneOffDonations: oneOffContributions,
      volunteeringActivities: volunteerActivities,
      fundraisingCampaigns: fundraisingCampaigns
    };

    const scoreResult = calculateComplexImpactScore(userData);
    setImpactScore(scoreResult.totalScore);
    setScoreDetails(scoreResult);

    const currentTier = getTier(scoreResult.totalScore);
    setTier(currentTier.tier);
    setPointsToNextTier(currentTier.pointsToNextTier);
  }, [donations, oneOffContributions, volunteerActivities, fundraisingCampaigns]);

  const fetchImpactData = useCallback(async () => {
    setError(null);
    const headers = getAuthHeaders();

    try {
      
      const [
        donationsRes,
        oneOffRes,
        volunteerRes,
        fundraisingRes
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/donations`, { headers }),
        axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/contributions/one-off`, { headers }),
        axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/volunteerActivities`, { headers }),
        axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/fundraisingCampaigns`, { headers })
      ]);


      // Ensure arrays even if API returns null/undefined
      setDonations(Array.isArray(donationsRes.data) ? donationsRes.data : []);
      setOneOffContributions(Array.isArray(oneOffRes.data) ? oneOffRes.data : []);
      setVolunteerActivities(Array.isArray(volunteerRes.data) ? volunteerRes.data : []);
      setFundraisingCampaigns(Array.isArray(fundraisingRes.data) ? fundraisingRes.data : []);

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const lastYearUserData = {
        regularDonations: donationsRes.data.filter(d => new Date(d.date) <= oneYearAgo),
        oneOffDonations: oneOffRes.data.filter(d => new Date(d.date) <= oneYearAgo),
        volunteeringActivities: volunteerRes.data.filter(v => new Date(v.date) <= oneYearAgo),
        fundraisingCampaigns: fundraisingRes.data.filter(c => new Date(c.startDate) <= oneYearAgo)
      };
      const lastYearScoreResult = calculateComplexImpactScore(lastYearUserData);
      setLastYearImpactScore(lastYearScoreResult.totalScore);
    } catch (error) {
      console.error('Error fetching impact data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to fetch impact data.');
      setScoreDetails(defaultScoreDetails);
      // Set empty arrays to avoid visualization breaking
      setDonations([]);
      setOneOffContributions([]);
      setVolunteerActivities([]);
      setFundraisingCampaigns([]);
    }
  }, [getAuthHeaders]);

  const getTier = (score) => {
    if (score >= 90) return { tier: "Visionary", nextTier: null, pointsToNextTier: 0 };
    if (score >= 70) return { tier: "Champion", nextTier: "Visionary", pointsToNextTier: 90 - score };
    if (score >= 50) return { tier: "Philanthropist", nextTier: "Champion", pointsToNextTier: 70 - score };
    if (score >= 30) return { tier: "Altruist", nextTier: "Philanthropist", pointsToNextTier: 50 - score };
    return { tier: "Giver", nextTier: "Altruist", pointsToNextTier: 30 - score };
  };

  const addDonation = useCallback(async (donation, alreadySaved = false) => {
    try {
      let savedDonation = donation;
      if (!alreadySaved) {
        const headers = getAuthHeaders();
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/donations`, donation, { headers });
        if (response.status !== 201) {
          throw new Error('Failed to add donation');
        }
        savedDonation = response.data;
      }
      
      setDonations(prevDonations => [...prevDonations, savedDonation]);
    } catch (error) {
      console.error('Error adding donation:', error);
      setError('Failed to add donation. Please try again.');
    }
  }, [getAuthHeaders]);

  const addOneOffContribution = useCallback(async (contribution, alreadySaved = false) => {
    try {
      let savedContribution = contribution;
      if (!alreadySaved) {
        const headers = getAuthHeaders();
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/contributions/one-off`, contribution, { headers });
        if (response.status !== 201) {
          throw new Error('Failed to add contribution');
        }
        savedContribution = response.data;
      }
      
      setOneOffContributions(prevContributions => [...prevContributions, savedContribution]);
    } catch (error) {
      console.error('Error adding contribution:', error);
      setError('Failed to add contribution. Please try again.');
    }
  }, [getAuthHeaders]);

  const onDeleteContribution = useCallback(async (contributionId) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/contributions/one-off/${contributionId}`, { headers });
      setOneOffContributions(prevContributions => prevContributions.filter(c => c._id !== contributionId));
    } catch (error) {
      console.error('Error deleting contribution:', error);
      throw new Error('Failed to delete contribution. Please try again.');
    }
  }, [getAuthHeaders]);

  const saveFollowedCharitiesToDb = useCallback(async (charities) => {
    try {
      const headers = getAuthHeaders();
      const validCharities = Array.isArray(charities) ? charities.filter(charity => charity.name && charity.ABN) : [charities].filter(charity => charity.name && charity.ABN);

      if (validCharities.length === 0) {
        console.log('No valid charities to save');
        return;
      }

      console.log('Sending payload:', validCharities);

      const promises = validCharities.map(charity =>
        axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/followed-charities`, charity, { headers })
      );

      const responses = await Promise.all(promises);
      console.log('Charities saved successfully:', responses.map(res => res.data));
    } catch (error) {
      console.error('Error saving followed charities to database:', error.response ? error.response.data : error.message);
    }
  }, [getAuthHeaders]);

  const addFollowedCharity = useCallback((charity) => {
    if (!charity.name || !charity.ABN) {
      console.error('Cannot add charity: name and ABN are required');
      return;
    }

    setFollowedCharities(prevCharities => {
      if (!prevCharities.some(c => c.ABN === charity.ABN)) {
        const newCharities = [...prevCharities, charity];
        localStorage.setItem('followed-charities', JSON.stringify(newCharities));
        saveFollowedCharitiesToDb(charity);
        return newCharities;
      }
      return prevCharities;
    });
  }, [saveFollowedCharitiesToDb]);

  const removeFollowedCharity = useCallback(async (charityABN) => {
    try {
      if (!charityABN) {
        console.log('Removing charity with undefined ABN');
        setFollowedCharities(prevCharities => prevCharities.filter(c => c.ABN));
        return;
      }

      const headers = getAuthHeaders();
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/followed-charities/${charityABN}`, { headers });

      setFollowedCharities(prevCharities => {
        const newCharities = prevCharities.filter(c => c.ABN !== charityABN);
        localStorage.setItem('followed-charities', JSON.stringify(newCharities));
        return newCharities;
      });
    } catch (error) {
      console.error('Error deleting followed charity:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 404) {
        setFollowedCharities(prevCharities => {
          const newCharities = prevCharities.filter(c => c.ABN !== charityABN);
          localStorage.setItem('followed-charities', JSON.stringify(newCharities));
          return newCharities;
        });
      } else {
        setError('Failed to remove the charity. Please try again.');
      }
    }
  }, [getAuthHeaders]);

  const clearFollowedCharities = useCallback(() => {
    localStorage.removeItem('followed-charities');
    setFollowedCharities([]);
  }, []);

  const updateSearchQuery = useCallback(() => {
    const charityTypes = new Set();
    const charityNames = new Set();
    const keywords = new Set();

    [...dataRef.current.donations, ...dataRef.current.oneOffContributions].forEach(item => {
      if (item.charityType) charityTypes.add(item.charityType);
      if (item.charity) charityNames.add(item.charity);
    });

    dataRef.current.volunteerActivities.forEach(activity => {
      if (activity.organization) charityNames.add(activity.organization);
      if (activity.charityType) charityTypes.add(activity.charityType);
      const activityKeywords = extractKeywords(activity.description);
      activityKeywords.forEach(keyword => keywords.add(keyword));
    });

    dataRef.current.fundraisingCampaigns.forEach(campaign => {
      const campaignKeywords = extractKeywords(campaign.title);
      campaignKeywords.forEach(keyword => keywords.add(keyword));
    });

    dataRef.current.followedCharities.forEach(charity => {
      if (charity.name) charityNames.add(charity.name);
    });

    const queryParts = [
      ...Array.from(charityTypes),
      ...Array.from(charityNames),
      ...Array.from(keywords)
    ];

    const limitedQueryParts = queryParts.slice(0, 10);
    const query = limitedQueryParts.join(' OR ');
    searchQueryRef.current = query;
  }, []);

  const formPersonalizedSearchQuery = useCallback(() => {
    return searchQueryRef.current;
  }, []);

  useEffect(() => {
    const storedCharities = localStorage.getItem('followed-charities');
    if (storedCharities) {
      setFollowedCharities(JSON.parse(storedCharities));
    }

    
    if (user) {
      setIsAuthenticated(!user.isBusiness);
    } else {
      setIsAuthenticated(false);
      clearFollowedCharities();
    }
  }, [user, clearFollowedCharities]);

  useEffect(() => {
    console.log('Auth check effect:', { isAuthenticated, isInitialLoad, user });
    if (isAuthenticated && isInitialLoad) {
      console.log('Initial load, fetching impact data...');
      fetchImpactData();
      setIsInitialLoad(false);

      const syncFollowedCharities = async () => {
        try {
          const headers = getAuthHeaders();
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/followed-charities`, { headers });
          const dbCharities = response.data;

          setFollowedCharities(dbCharities);
          localStorage.setItem('followed-charities', JSON.stringify(dbCharities));
        } catch (error) {
          console.error('Error syncing followed charities:', error);
        }
      };

      syncFollowedCharities();
    }
  }, [isAuthenticated, isInitialLoad, fetchImpactData, getAuthHeaders]);

  useEffect(() => {
    updateImpactScore();
  }, [updateImpactScore]);

  useEffect(() => {
    dataRef.current = {
      donations,
      oneOffContributions,
      volunteerActivities,
      fundraisingCampaigns,
      followedCharities
    };
    updateSearchQuery();
  }, [donations, oneOffContributions, volunteerActivities, fundraisingCampaigns, followedCharities, updateSearchQuery]);

  return (
    <ImpactContext.Provider
      value={{
        impactScore,
        scoreDetails: scoreDetails || defaultScoreDetails,
        lastYearImpactScore,
        tier,
        pointsToNextTier,
        donations,
        oneOffContributions,
        volunteerActivities,
        fundraisingCampaigns,
        error,
        addDonation,
        addOneOffContribution,
        calculateComplexImpactScore,
        followedCharities,
        addFollowedCharity,
        removeFollowedCharity,
        clearFollowedCharities,
        fetchImpactData,
        getAuthHeaders,
        isAuthenticated,
        setDonations,
        setOneOffContributions,
        setVolunteerActivities,
        setFundraisingCampaigns,
        setImpactScore,
        setIsAuthenticated,
        formPersonalizedSearchQuery,
        onDeleteContribution
      }}
    >
      {children}
    </ImpactContext.Provider>
  );
};

export default ImpactProvider;