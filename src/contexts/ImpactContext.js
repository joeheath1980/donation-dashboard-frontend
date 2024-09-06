import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const ImpactContext = createContext();

export const calculateComplexImpactScore = (userData, benchmarks) => {
  console.log("Input userData:", userData);
  console.log("Input benchmarks:", benchmarks);

  const {
    regularDonations = [],
    oneOffDonations = [],
    volunteeringActivities = [],
    previousPeriodScore = 0
  } = userData;

  const {
    monthlyDonationBenchmark = 100,
    oneOffDonationBenchmark = 500
  } = benchmarks;

  // 1. Regular Donations (35%)
  const regularDonationScore = (() => {
    const monthlyAverage = regularDonations.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0) / 12;
    const amountScore = Math.min((monthlyAverage / monthlyDonationBenchmark) * 20, 20);
    const streakScore = Math.min(((regularDonations.streak || 0) / 12) * 10, 10);
    const uniqueCharitiesCount = new Set(regularDonations.map(d => d.charity)).size;
    const uniqueCharitiesScore = Math.min((uniqueCharitiesCount / 5) * 5, 5);
    return amountScore + streakScore + uniqueCharitiesScore;
  })();

  // 2. One-off Donations (25%)
  const oneOffDonationScore = (() => {
    const totalAmount = oneOffDonations.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0);
    const amountScore = Math.min((totalAmount / oneOffDonationBenchmark) * 15, 15);
    const numberScore = Math.min((oneOffDonations.length / 10) * 10, 10);
    return amountScore + numberScore;
  })();

  // 3. Volunteering (30%)
  const volunteeringScore = (() => {
    const totalHours = volunteeringActivities.reduce((sum, activity) => sum + (Number(activity.hours) || 0), 0);
    const hoursScore = Math.min((totalHours / 50) * 20, 20);
    const uniqueActivitiesCount = new Set(volunteeringActivities.map(a => a.activity)).size;
    const uniqueActivitiesScore = Math.min((uniqueActivitiesCount / 5) * 10, 10);
    return hoursScore + uniqueActivitiesScore;
  })();

  // 4. Engagement Bonus (10%)
  const engagementBonus = (() => {
    const hasAllThreeCategories = regularDonations.length > 0 && oneOffDonations.length > 0 && volunteeringActivities.length > 0;
    const consistencyScore = hasAllThreeCategories ? 5 : 0;
    const growthScore = Math.min(Math.max((previousPeriodScore - (regularDonationScore + oneOffDonationScore + volunteeringScore)) / 10, 0), 5);
    return consistencyScore + growthScore;
  })();

  // Calculate final total score
  const totalScore = regularDonationScore + oneOffDonationScore + volunteeringScore + engagementBonus;

  console.log("Calculation results:", {
    regularDonationScore,
    oneOffDonationScore,
    volunteeringScore,
    engagementBonus,
    totalScore
  });

  return {
    totalScore: Math.min(Math.round(totalScore), 100),
    regularDonationScore: Math.round(regularDonationScore),
    oneOffDonationScore: Math.round(oneOffDonationScore),
    volunteeringScore: Math.round(volunteeringScore),
    engagementBonus: Math.round(engagementBonus)
  };
};

export const ImpactProvider = ({ children }) => {
  const [impactScore, setImpactScore] = useState(0);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [lastYearImpactScore, setLastYearImpactScore] = useState(0);
  const [tier, setTier] = useState("Giver");
  const [pointsToNextTier, setPointsToNextTier] = useState(0);
  const [donations, setDonations] = useState([]);
  const [oneOffContributions, setOneOffContributions] = useState([]);
  const [volunteerActivities, setVolunteerActivities] = useState([]);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  const fetchImpactData = useCallback(async () => {
    setError(null);
    const headers = getAuthHeaders();

    try {
      const [donationsRes, oneOffRes, volunteerRes] = await Promise.all([
        axios.get('http://localhost:3002/api/donations', { headers }),
        axios.get('http://localhost:3002/api/contributions/one-off', { headers }),
        axios.get('http://localhost:3002/api/volunteerActivities', { headers })
      ]);

      setDonations(donationsRes.data);
      setOneOffContributions(oneOffRes.data);
      setVolunteerActivities(volunteerRes.data);

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const userData = {
        regularDonations: donationsRes.data,
        oneOffDonations: oneOffRes.data,
        volunteeringActivities: volunteerRes.data,
        previousPeriodScore: lastYearImpactScore
      };

      const benchmarks = {
        monthlyDonationBenchmark: 100,
        oneOffDonationBenchmark: 500
      };

      const scoreResult = calculateComplexImpactScore(userData, benchmarks);
      setImpactScore(scoreResult.totalScore);
      setScoreDetails({
        regularDonationScore: scoreResult.regularDonationScore,
        oneOffDonationScore: scoreResult.oneOffDonationScore,
        volunteeringScore: scoreResult.volunteeringScore,
        engagementBonus: scoreResult.engagementBonus
      });

      // Calculate the impact score from one year ago
      const lastYearUserData = {
        regularDonations: donationsRes.data.filter(d => new Date(d.date) <= oneYearAgo),
        oneOffDonations: oneOffRes.data.filter(d => new Date(d.date) <= oneYearAgo),
        volunteeringActivities: volunteerRes.data.filter(a => new Date(a.date) <= oneYearAgo),
        previousPeriodScore: 0 // Assume no previous score for last year's calculation
      };
      const lastYearScoreResult = calculateComplexImpactScore(lastYearUserData, benchmarks);
      setLastYearImpactScore(lastYearScoreResult.totalScore);

      // Calculate the current tier and points to next tier
      const currentTier = getTier(scoreResult.totalScore);
      setTier(currentTier.tier);
      setPointsToNextTier(currentTier.pointsToNextTier);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch impact data. Please try again later.');
    }
  }, [getAuthHeaders, lastYearImpactScore]);

  const getTier = (score) => {
    if (score >= 90) return { tier: "Visionary", nextTier: null, pointsToNextTier: 0 };
    if (score >= 70) return { tier: "Champion", nextTier: "Visionary", pointsToNextTier: 90 - score };
    if (score >= 50) return { tier: "Philanthropist", nextTier: "Champion", pointsToNextTier: 70 - score };
    if (score >= 30) return { tier: "Altruist", nextTier: "Philanthropist", pointsToNextTier: 50 - score };
    return { tier: "Giver", nextTier: "Altruist", pointsToNextTier: 30 - score };
  };

  const parseAmount = (amountString) => {
    const amount = parseFloat(amountString.replace(/[^\d.-]/g, ''));
    return amount;
  };

  const addDonation = async (donation) => {
    try {
      const headers = getAuthHeaders();
      const parsedDonation = {
        ...donation,
        amount: parseAmount(donation.amount),
        charity: donation.charity.toLowerCase(),
        date: donation.date
      };
  
      console.log('Sending donation to backend:', parsedDonation);
  
      const response = await axios.post('http://localhost:3002/api/donations', parsedDonation, { headers });
  
      if (response.status === 201) {
        console.log('Donation added, response:', response.data);
        setDonations(prevDonations => [...prevDonations, response.data]);
        fetchImpactData(); // Recalculate impact score
      } else {
        console.error('Failed to add donation:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding donation:', error);
      setError('Failed to add donation. Please try again.');
    }
  };

  const addOneOffContribution = async (contribution) => {
    try {
      const headers = getAuthHeaders();
      const parsedContribution = {
        ...contribution,
        amount: parseAmount(contribution.amount),
        charity: contribution.charity.toLowerCase(),
        date: contribution.date
      };

      console.log('Sending one-off contribution to backend:', parsedContribution);

      const response = await axios.post('http://localhost:3002/api/contributions/one-off', parsedContribution, { headers });

      if (response.status === 201) {
        console.log('One-off contribution added, response:', response.data);
        setOneOffContributions(prevContributions => [...prevContributions, response.data]);
        fetchImpactData(); // Recalculate impact score
      } else {
        console.error('Failed to add contribution:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
      setError('Failed to add contribution. Please try again.');
    }
  };

  // Add the new onDeleteContribution function
  const onDeleteContribution = useCallback(async (contributionId) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`http://localhost:3002/api/contributions/one-off/${contributionId}`, { headers });
      
      if (response.status === 200) {
        setOneOffContributions(prevContributions => prevContributions.filter(contribution => contribution._id !== contributionId));
        fetchImpactData(); // Recalculate impact score
        console.log('Contribution deleted successfully');
      } else {
        console.error('Failed to delete contribution:', response.statusText);
        throw new Error('Failed to delete contribution');
      }
    } catch (error) {
      console.error('Error deleting contribution:', error);
      throw error;
    }
  }, [getAuthHeaders, fetchImpactData]);

  return (
    <ImpactContext.Provider value={{
      impactScore,
      scoreDetails,
      lastYearImpactScore,
      tier,
      pointsToNextTier,
      donations,
      oneOffContributions,
      volunteerActivities,
      fetchImpactData,
      error,
      addDonation,
      addOneOffContribution,
      calculateComplexImpactScore,
      onDeleteContribution // Add this line to include the new function in the context value
    }}>
      {children}
    </ImpactContext.Provider>
  );
};
