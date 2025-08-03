import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const ImpactContext = createContext();

// Category weights for the new system
const CATEGORY_WEIGHTS = {
  donations: 0.30,         // 30% - All monetary contributions
  volunteering: 0.25,      // 25% - Time contributions
  fundraising: 0.20,       // 20% - Network effects
  consistency: 0.15,       // 15% - Regular engagement (any pattern)
  engagement: 0.10         // 10% - Platform participation
};

// Temporal decay factors
const TIME_DECAY_FACTORS = {
  fresh: 1.0,         // Last 30 days: 100% value
  recent: 0.85,       // 1-3 months: 85% value
  quarter: 0.65,      // 3-6 months: 65% value
  halfYear: 0.45,     // 6-12 months: 45% value
  annual: 0.25,       // 1-2 years: 25% value
  legacy: 0.10        // 2+ years: 10% value
};

// Micro donation configuration
const MICRO_DONATION_CONFIG = {
  threshold: 15,              // Donations under $15 are "micro"
  basePoints: 8,              // Base for any micro donation
  frequencyBonus: 5,          // Bonus for each micro donation in a day
  maxDailyBonus: 20          // Cap at 4 micro donations/day
};

// Traditional donation brackets
const TRADITIONAL_BRACKETS = [
  { max: 25, rate: 1.0 },      // $1-25: 1 point per dollar
  { max: 50, rate: 0.8 },      // $25-50: 0.8 points per dollar  
  { max: 100, rate: 0.6 },     // $50-100: 0.6 points per dollar
  { max: 250, rate: 0.4 },     // $100-250: 0.4 points per dollar
  { max: 500, rate: 0.2 },     // $250-500: 0.2 points per dollar
  { max: Infinity, rate: 0.1 } // $500+: 0.1 points per dollar
];

// Volunteering scoring configuration
const VOLUNTEERING_CONFIG = {
  hourlyRate: 12,                    // Base points per hour
  sessionBonuses: {
    2: 10,    // 2+ hour session: +10 points
    4: 25,    // Half day: +25 points  
    8: 60     // Full day: +60 points
  },
  skillMultipliers: {
    general: 1.0,      // General volunteering
    skilled: 1.3,      // Professional skills
    leadership: 1.5,   // Leading/organizing
    emergency: 2.0     // Crisis response
  }
};

// Helper function to calculate temporal decay
const getTemporalDecayFactor = (date) => {
  const now = new Date();
  const activityDate = new Date(date);
  const monthsAgo = (now - activityDate) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsAgo <= 1) return TIME_DECAY_FACTORS.fresh;
  if (monthsAgo <= 3) return TIME_DECAY_FACTORS.recent;
  if (monthsAgo <= 6) return TIME_DECAY_FACTORS.quarter;
  if (monthsAgo <= 12) return TIME_DECAY_FACTORS.halfYear;
  if (monthsAgo <= 24) return TIME_DECAY_FACTORS.annual;
  return TIME_DECAY_FACTORS.legacy;
};

// Group donations by day for micro-donation frequency bonuses
const groupDonationsByDay = (donations) => {
  const grouped = {};
  donations.forEach(donation => {
    const dateKey = new Date(donation.date).toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(donation);
  });
  return grouped;
};

// New donation scoring with micro and traditional paths
const calculateDonationScore = (regularDonations, oneOffDonations, archivedCampaigns = []) => {
  const archivedDonations = archivedCampaigns.map(campaign => ({
    amount: campaign.raisedAmount || campaign.goalAmount,
    date: campaign.completedDate
  }));

  const allDonations = [...regularDonations, ...oneOffDonations, ...archivedDonations];
  const donationsByDay = groupDonationsByDay(allDonations);
  
  let totalScore = 0;
  let monthlyBonusApplied = false;

  // Process donations by day
  Object.entries(donationsByDay).forEach(([dateKey, dayDonations]) => {
    let dayScore = 0;
    let microDonationCount = 0;
    
    dayDonations.forEach(donation => {
      const amount = donation.amount || 0;
      const decayFactor = getTemporalDecayFactor(donation.date);
      
      if (amount < MICRO_DONATION_CONFIG.threshold) {
        // Micro donation path
        let score = MICRO_DONATION_CONFIG.basePoints;
        if (microDonationCount < 4) { // Max 4 frequency bonuses per day
          score += MICRO_DONATION_CONFIG.frequencyBonus;
        }
        dayScore += score * decayFactor;
        microDonationCount++;
      } else {
        // Traditional donation path
        let score = 0;
        let remainingAmount = amount;
        
        for (const bracket of TRADITIONAL_BRACKETS) {
          if (remainingAmount <= 0) break;
          const bracketAmount = Math.min(remainingAmount, bracket.max - (score > 0 ? TRADITIONAL_BRACKETS[TRADITIONAL_BRACKETS.indexOf(bracket) - 1].max : 0));
          score += bracketAmount * bracket.rate;
          remainingAmount -= bracketAmount;
        }
        
        dayScore += score * decayFactor;
      }
    });
    
    totalScore += dayScore;
  });

  // Monthly consistency bonus for regular donors
  const hasMonthlyDonations = regularDonations.some(d => d.frequency === 'monthly');
  const recentMonthlyDonations = regularDonations.filter(d => {
    const decayFactor = getTemporalDecayFactor(d.date);
    return d.frequency === 'monthly' && decayFactor >= TIME_DECAY_FACTORS.quarter;
  });
  
  if (hasMonthlyDonations && recentMonthlyDonations.length >= 3) {
    totalScore += 20; // Monthly consistency bonus
  }

  return Math.round(totalScore);
};

const calculateVolunteerScore = (volunteeringActivities) => {
  let totalScore = 0;

  volunteeringActivities.forEach(activity => {
    const hours = activity.hours || 0;
    const decayFactor = getTemporalDecayFactor(activity.date || activity.startDate);
    const skillType = activity.skillType || 'general';
    const skillMultiplier = VOLUNTEERING_CONFIG.skillMultipliers[skillType] || 1.0;
    
    // Base score
    let activityScore = hours * VOLUNTEERING_CONFIG.hourlyRate * skillMultiplier;
    
    // Session bonuses for longer commitments
    if (hours >= 8) {
      activityScore += VOLUNTEERING_CONFIG.sessionBonuses[8];
    } else if (hours >= 4) {
      activityScore += VOLUNTEERING_CONFIG.sessionBonuses[4];
    } else if (hours >= 2) {
      activityScore += VOLUNTEERING_CONFIG.sessionBonuses[2];
    }
    
    // Apply temporal decay
    totalScore += activityScore * decayFactor;
  });

  return Math.round(totalScore);
};

const calculateFundraisingScore = (fundraisingCampaigns) => {
  let totalScore = 0;

  fundraisingCampaigns.forEach(campaign => {
    const raisedAmount = campaign.raisedAmount || 0;
    const decayFactor = getTemporalDecayFactor(campaign.startDate || campaign.createdAt);
    
    // Progressive scoring based on amount raised
    let score = 0;
    let remainingAmount = raisedAmount;
    
    const brackets = [
      { max: 100, rate: 0.5 },      // First $100: 0.5 points per dollar
      { max: 500, rate: 0.3 },      // $100-500: 0.3 points per dollar
      { max: 2000, rate: 0.2 },     // $500-2000: 0.2 points per dollar
      { max: 5000, rate: 0.1 },     // $2000-5000: 0.1 points per dollar
      { max: Infinity, rate: 0.05 } // $5000+: 0.05 points per dollar
    ];
    
    let previousMax = 0;
    for (const bracket of brackets) {
      if (remainingAmount <= 0) break;
      const bracketAmount = Math.min(remainingAmount, bracket.max - previousMax);
      score += bracketAmount * bracket.rate;
      remainingAmount -= bracketAmount;
      previousMax = bracket.max;
    }
    
    // Bonus for campaign creation and management
    if (campaign.eventsOrganized) {
      score += campaign.eventsOrganized * 20;
    }
    if (campaign.onlineCampaignsInitiated) {
      score += campaign.onlineCampaignsInitiated * 15;
    }
    
    totalScore += score * decayFactor;
  });

  return Math.round(totalScore);
};

// Calculate consistency score based on activity patterns
const calculateConsistencyScore = (userData) => {
  const { regularDonations = [], oneOffDonations = [], volunteeringActivities = [] } = userData;
  let score = 0;
  
  // Check for daily micro-donation streaks
  const allDonations = [...regularDonations, ...oneOffDonations];
  const donationDates = allDonations.map(d => new Date(d.date).toDateString());
  const uniqueDonationDays = new Set(donationDates).size;
  
  // Calculate current streak
  const sortedDates = [...new Set(donationDates)].sort((a, b) => new Date(b) - new Date(a));
  let currentStreak = 0;
  const today = new Date();
  let checkDate = new Date(today);
  
  for (let i = 0; i < sortedDates.length && i < 365; i++) {
    const dateStr = checkDate.toDateString();
    if (sortedDates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Allow 1 skip day per week
      const skipDays = Math.floor(currentStreak / 7);
      if (skipDays > 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        i--; // Don't count this as an iteration
      } else {
        break;
      }
    }
  }
  
  // Streak bonuses
  if (currentStreak >= 365) score += 200;  // Year streak
  else if (currentStreak >= 180) score += 100;  // 6 month streak
  else if (currentStreak >= 90) score += 50;   // Quarter streak
  else if (currentStreak >= 30) score += 25;   // Month streak
  else if (currentStreak >= 7) score += 10;    // Week streak
  
  // Monthly consistency bonus for traditional givers
  const monthlyDonors = regularDonations.filter(d => d.frequency === 'monthly');
  const monthsActive = new Set(monthlyDonors.map(d => {
    const date = new Date(d.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  })).size;
  
  if (monthsActive >= 12) score += 100;
  else if (monthsActive >= 6) score += 50;
  else if (monthsActive >= 3) score += 25;
  
  // Volunteer consistency
  const volunteerMonths = new Set(volunteeringActivities.map(v => {
    const date = new Date(v.date || v.startDate);
    return `${date.getFullYear()}-${date.getMonth()}`;
  })).size;
  
  if (volunteerMonths >= 6) score += 30;
  else if (volunteerMonths >= 3) score += 15;
  
  return score;
};

// Calculate engagement score (platform participation)
const calculateEngagementScore = (userData) => {
  let score = 0;
  
  // Profile completeness (worth up to 50 points)
  if (userData.profileComplete) score += 20;
  if (userData.bio && userData.bio.length > 50) score += 10;
  if (userData.profilePictureUrl) score += 10;
  if (userData.impactStatement) score += 10;
  
  // Followed charities (worth up to 30 points)
  const followedCount = userData.followedCharities?.length || 0;
  score += Math.min(30, followedCount * 5);
  
  // Daily actions (would need to be tracked - placeholder)
  // This would include: morning check-ins, voting, sharing, etc.
  const dailyActionsScore = userData.dailyActionsCount || 0;
  score += Math.min(50, dailyActionsScore);
  
  return score;
};

export const calculateComplexImpactScore = (userData) => {
  if (!userData) {
    console.error('Invalid input for calculateComplexImpactScore');
    return { 
      totalScore: 0, 
      donationScore: 0, 
      volunteerScore: 0, 
      fundraisingScore: 0,
      consistencyScore: 0,
      engagementScore: 0,
      breakdown: {}
    };
  }

  const {
    regularDonations = [],
    oneOffDonations = [],
    volunteeringActivities = [],
    fundraisingCampaigns = []
  } = userData;

  const archivedCampaigns = fundraisingCampaigns.filter(campaign => campaign.status === 'archived');

  // Calculate raw scores for each category
  const donationScore = calculateDonationScore(regularDonations, oneOffDonations, archivedCampaigns);
  const volunteerScore = calculateVolunteerScore(volunteeringActivities);
  const fundraisingScore = calculateFundraisingScore(fundraisingCampaigns);
  const consistencyScore = calculateConsistencyScore(userData);
  const engagementScore = calculateEngagementScore(userData);

  // Apply category weights
  const weightedScores = {
    donations: donationScore * CATEGORY_WEIGHTS.donations,
    volunteering: volunteerScore * CATEGORY_WEIGHTS.volunteering,
    fundraising: fundraisingScore * CATEGORY_WEIGHTS.fundraising,
    consistency: consistencyScore * CATEGORY_WEIGHTS.consistency,
    engagement: engagementScore * CATEGORY_WEIGHTS.engagement
  };

  // Calculate total score
  const totalScore = Object.values(weightedScores).reduce((sum, score) => sum + score, 0);

  // Apply tier multipliers if user has achieved certain milestones
  const tier = getTier(totalScore);
  let multiplier = 1.0;
  if (tier.name === 'Visionary') multiplier = 1.5;
  else if (tier.name === 'Champion') multiplier = 1.3;
  else if (tier.name === 'Philanthropist') multiplier = 1.2;
  else if (tier.name === 'Altruist') multiplier = 1.1;

  const finalScore = Math.round(totalScore * multiplier);

  return {
    totalScore: finalScore,
    donationScore: Math.round(donationScore),
    volunteerScore: Math.round(volunteerScore),
    fundraisingScore: Math.round(fundraisingScore),
    consistencyScore: Math.round(consistencyScore),
    engagementScore: Math.round(engagementScore),
    breakdown: weightedScores,
    multiplier
  };
};

const defaultScoreDetails = {
  totalScore: 0,
  donationScore: 0,
  volunteerScore: 0,
  fundraisingScore: 0,
  consistencyScore: 0,
  engagementScore: 0,
  breakdown: {},
  multiplier: 1.0
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
    setTier(currentTier.name);
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
      setImpactScore(0);
      setTier('Giver');
      setPointsToNextTier(300);
    }
  }, [getAuthHeaders]);

  const getTier = (score) => {
    if (score >= 5000) return { 
      tier: "Visionary", 
      name: "Visionary",
      nextTier: null, 
      pointsToNextTier: 0,
      description: "Visionaries shape the future of giving",
      minPoints: 5000,
      maintenance: 150
    };
    if (score >= 2500) return { 
      tier: "Champion", 
      name: "Champion",
      nextTier: "Visionary", 
      pointsToNextTier: 5000 - score,
      description: "Champions inspire others through their dedication",
      minPoints: 2500,
      maxPoints: 4999,
      maintenance: 120
    };
    if (score >= 1000) return { 
      tier: "Philanthropist", 
      name: "Philanthropist",
      nextTier: "Champion", 
      pointsToNextTier: 2500 - score,
      description: "Strategic giving multiplies impact across communities",
      minPoints: 1000,
      maxPoints: 2499,
      maintenance: 80
    };
    if (score >= 300) return { 
      tier: "Altruist", 
      name: "Altruist",
      nextTier: "Philanthropist", 
      pointsToNextTier: 1000 - score,
      description: "Whether daily drops or monthly waves, your kindness creates ripples",
      minPoints: 300,
      maxPoints: 999,
      maintenance: 40
    };
    return { 
      tier: "Giver", 
      name: "Giver",
      nextTier: "Altruist", 
      pointsToNextTier: 300 - score,
      description: "Every journey begins with a single act of kindness",
      minPoints: 0,
      maxPoints: 299,
      maintenance: 0
    };
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