import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const ImpactContext = createContext();

// Max points for each component
const MAX_DONATION_SCORE = 40;
const MAX_VOLUNTEER_SCORE = 30;
const MAX_FUNDRAISING_SCORE = 20;

// Donation Score Calculation (Max 40 points)
const calculateDonationScore = (regularDonations, oneOffDonations) => {
  const totalDonations = [...regularDonations, ...oneOffDonations];
  const totalDonationAmount = totalDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Tiered Points with Diminishing Returns
  let donationScore = 0;
  let remainingAmount = totalDonationAmount;

  // First $1,000: 1 point per $100 donated => 10 points
  const firstTierAmount = Math.min(remainingAmount, 1000);
  donationScore += firstTierAmount / 100;
  remainingAmount -= firstTierAmount;

  // Next $4,000: 1 point per $200 donated => 20 points
  if (remainingAmount > 0) {
    const secondTierAmount = Math.min(remainingAmount, 4000);
    donationScore += secondTierAmount / 200;
    remainingAmount -= secondTierAmount;
  }

  // Above $5,000: 1 point per $500 donated => 10 points
  if (remainingAmount > 0) {
    donationScore += remainingAmount / 500;
  }

  // Regular Giving Multiplier
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

  // Cap at MAX_DONATION_SCORE
  donationScore = Math.min(donationScore, MAX_DONATION_SCORE);

  return Math.round(donationScore);
};

// Volunteer Score Calculation (Max 30 points)
const calculateVolunteerScore = (volunteeringActivities) => {
  const totalVolunteerHours = volunteeringActivities.reduce((sum, v) => sum + (v.hours || 0), 0);

  let volunteerScore = 0;
  let remainingHours = totalVolunteerHours;

  // First 50 Hours: 0.6 points per hour
  const firstTierHours = Math.min(remainingHours, 50);
  volunteerScore += firstTierHours * 0.6;
  remainingHours -= firstTierHours;

  // Next 150 Hours: 0.4 points per hour
  if (remainingHours > 0) {
    const secondTierHours = Math.min(remainingHours, 150);
    volunteerScore += secondTierHours * 0.4;
    remainingHours -= secondTierHours;
  }

  // Above 200 Hours: 0.2 points per hour
  if (remainingHours > 0) {
    volunteerScore += remainingHours * 0.2;
  }

  // Long-Term Commitment Bonus
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
    longTermBonus = 5;
  } else if (durationInMonths >= 6) {
    longTermBonus = 2.5;
  }

  volunteerScore += longTermBonus;

  // Cap at MAX_VOLUNTEER_SCORE
  volunteerScore = Math.min(volunteerScore, MAX_VOLUNTEER_SCORE);

  return Math.round(volunteerScore);
};

// Fundraising Score Calculation (Max 20 points)
const calculateFundraisingScore = (fundraisingCampaigns) => {
  const totalFundsRaised = fundraisingCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);

  let fundraisingScore = 0;
  let remainingAmount = totalFundsRaised;

  // First $2,000: 1 point per $100 raised => 20 points
  const firstTierAmount = Math.min(remainingAmount, 2000);
  fundraisingScore += firstTierAmount / 100;
  remainingAmount -= firstTierAmount;

  // Next $8,000: 1 point per $200 raised => 40 points
  if (remainingAmount > 0) {
    const secondTierAmount = Math.min(remainingAmount, 8000);
    fundraisingScore += secondTierAmount / 200;
    remainingAmount -= secondTierAmount;
  }

  // Above $10,000: 1 point per $500 raised => 10 points
  if (remainingAmount > 0) {
    fundraisingScore += remainingAmount / 500;
  }

  // Fundraising Activity Bonus
  const totalEventsOrganized = fundraisingCampaigns.reduce((sum, c) => sum + (c.eventsOrganized || 0), 0);
  const totalOnlineCampaignsInitiated = fundraisingCampaigns.reduce((sum, c) => sum + (c.onlineCampaignsInitiated || 0), 0);

  fundraisingScore += totalEventsOrganized * 2; // 2 points per event
  fundraisingScore += totalOnlineCampaignsInitiated * 1; // 1 point per online campaign

  // Cap at MAX_FUNDRAISING_SCORE
  fundraisingScore = Math.min(fundraisingScore, MAX_FUNDRAISING_SCORE);

  return Math.round(fundraisingScore);
};

// Main Impact Score Calculation
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

  const donationScore = calculateDonationScore(regularDonations, oneOffDonations);
  const volunteerScore = calculateVolunteerScore(volunteeringActivities);
  const fundraisingScore = calculateFundraisingScore(fundraisingCampaigns);

  const totalScore = donationScore + volunteerScore + fundraisingScore;

  // Ensure total score does not exceed 100
  const finalTotalScore = Math.min(Math.round(totalScore), 100);

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
  // Removed badges and milestones
  const [error, setError] = useState(null);
  const [followedCharities, setFollowedCharities] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { user } = useAuth();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  const fetchImpactData = useCallback(async () => {
    setError(null);
    const headers = getAuthHeaders();

    try {
      console.log('Fetching impact data...');
      const [
        donationsRes,
        oneOffRes,
        volunteerRes,
        fundraisingRes
      ] = await Promise.all([
        axios.get('http://localhost:3002/api/donations', { headers }),
        axios.get('http://localhost:3002/api/contributions/one-off', { headers }),
        axios.get('http://localhost:3002/api/volunteerActivities', { headers }),
        axios.get('http://localhost:3002/api/fundraisingCampaigns', { headers })
      ]);

      setDonations(donationsRes.data);
      setOneOffContributions(oneOffRes.data);
      setVolunteerActivities(volunteerRes.data);
      setFundraisingCampaigns(fundraisingRes.data);

      const userData = {
        regularDonations: donationsRes.data,
        oneOffDonations: oneOffRes.data,
        volunteeringActivities: volunteerRes.data,
        fundraisingCampaigns: fundraisingRes.data
      };

      const scoreResult = calculateComplexImpactScore(userData);
      setImpactScore(scoreResult.totalScore);
      setScoreDetails(scoreResult);

      const currentTier = getTier(scoreResult.totalScore);
      setTier(currentTier.tier);
      setPointsToNextTier(currentTier.pointsToNextTier);

      // Calculate last year's impact score
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
      if (error.response) {
        setError(`Failed to fetch impact data. Server responded with ${error.response.status}: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        setError('Failed to fetch impact data. No response received from the server.');
      } else {
        setError(`Failed to fetch impact data. ${error.message}`);
      }
      setScoreDetails(defaultScoreDetails);
    }
  }, [getAuthHeaders]);

  const getTier = (score) => {
    if (score >= 90) return { tier: "Visionary", nextTier: null, pointsToNextTier: 0 };
    if (score >= 70) return { tier: "Champion", nextTier: "Visionary", pointsToNextTier: 90 - score };
    if (score >= 50) return { tier: "Philanthropist", nextTier: "Champion", pointsToNextTier: 70 - score };
    if (score >= 30) return { tier: "Altruist", nextTier: "Philanthropist", pointsToNextTier: 50 - score };
    return { tier: "Giver", nextTier: "Altruist", pointsToNextTier: 30 - score };
  };

  const addDonation = async (donation) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post('http://localhost:3002/api/donations', donation, { headers });
      if (response.status === 201) {
        setDonations(prevDonations => [...prevDonations, response.data]);
        fetchImpactData();
      }
    } catch (error) {
      console.error('Error adding donation:', error);
      setError('Failed to add donation. Please try again.');
    }
  };

  const addOneOffContribution = async (contribution) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post('http://localhost:3002/api/contributions/one-off', contribution, { headers });
      if (response.status === 201) {
        setOneOffContributions(prevContributions => [...prevContributions, response.data]);
        fetchImpactData();
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
      setError('Failed to add contribution. Please try again.');
    }
  };

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
        axios.post('http://localhost:3002/api/followed-charities', charity, { headers })
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
      const response = await axios.delete(`http://localhost:3002/api/followed-charities/${charityABN}`, { headers });

      if (response.status === 200) {
        setFollowedCharities(prevCharities => {
          const newCharities = prevCharities.filter(c => c.ABN !== charityABN);
          localStorage.setItem('followed-charities', JSON.stringify(newCharities));
          return newCharities;
        });
      }
    } catch (error) {
      console.error('Error deleting followed charity:', error.response ? error.response.data : error.message);
    }
  }, [getAuthHeaders]);

  const clearFollowedCharities = useCallback(() => {
    localStorage.removeItem('followed-charities');
    setFollowedCharities([]);
  }, []);

  useEffect(() => {
    const storedCharities = localStorage.getItem('followed-charities');
    if (storedCharities) {
      setFollowedCharities(JSON.parse(storedCharities));
    }

    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      clearFollowedCharities();
    }
  }, [user, clearFollowedCharities]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, fetching impact data...');
      fetchImpactData();

      const syncFollowedCharities = async () => {
        try {
          const headers = getAuthHeaders();
          const response = await axios.get('http://localhost:3002/api/followed-charities', { headers });
          const dbCharities = response.data;

          setFollowedCharities(dbCharities);
          localStorage.setItem('followed-charities', JSON.stringify(dbCharities));
        } catch (error) {
          console.error('Error syncing followed charities:', error);
        }
      };

      syncFollowedCharities();
    } else {
      console.log('User is not authenticated');
    }
  }, [isAuthenticated, fetchImpactData, getAuthHeaders]);

  return (
    <ImpactContext.Provider value={{
      impactScore,
      scoreDetails: scoreDetails || defaultScoreDetails,
      lastYearImpactScore,
      tier,
      pointsToNextTier,
      donations,
      oneOffContributions,
      volunteerActivities,
      fundraisingCampaigns,
      // Removed badges and milestones
      fetchImpactData,
      error,
      addDonation,
      addOneOffContribution,
      calculateComplexImpactScore,
      followedCharities,
      addFollowedCharity,
      removeFollowedCharity,
      getAuthHeaders,
      clearFollowedCharities,
      isAuthenticated
    }}>
      {children}
    </ImpactContext.Provider>
  );
};



