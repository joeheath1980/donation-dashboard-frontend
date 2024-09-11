import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const ImpactContext = createContext();

export const calculateComplexImpactScore = (userData, benchmarks) => {
  // Ensure userData and benchmarks are valid objects
  if (!userData || !benchmarks) {
    console.error('Invalid input for calculateComplexImpactScore');
    return { totalScore: 0, regularDonationScore: 0, oneOffDonationScore: 0, volunteeringScore: 0, engagementBonus: 0 };
  }

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

  // Calculate scores using the benchmarks
  const regularDonationScore = Math.min((regularDonations.reduce((sum, d) => sum + d.amount, 0) / monthlyDonationBenchmark) * 35, 35);
  const oneOffDonationScore = Math.min((oneOffDonations.reduce((sum, d) => sum + d.amount, 0) / oneOffDonationBenchmark) * 25, 25);
  const volunteeringScore = Math.min((volunteeringActivities.length / 5) * 30, 30);
  const engagementBonus = previousPeriodScore > 0 ? 10 : 0;

  const totalScore = regularDonationScore + oneOffDonationScore + volunteeringScore + engagementBonus;

  return {
    totalScore: Math.min(Math.round(totalScore), 100),
    regularDonationScore: Math.round(regularDonationScore),
    oneOffDonationScore: Math.round(oneOffDonationScore),
    volunteeringScore: Math.round(volunteeringScore),
    engagementBonus: Math.round(engagementBonus)
  };
};

const defaultScoreDetails = {
  totalScore: 0,
  regularDonationScore: 0,
  oneOffDonationScore: 0,
  volunteeringScore: 0,
  engagementBonus: 0
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
  const [error, setError] = useState(null);
  const [followedCharities, setFollowedCharities] = useState([]);

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
      setScoreDetails(scoreResult);

      // Calculate the current tier and points to next tier
      const currentTier = getTier(scoreResult.totalScore);
      setTier(currentTier.tier);
      setPointsToNextTier(currentTier.pointsToNextTier);

      // Calculate and set last year's impact score
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const lastYearUserData = {
        regularDonations: donationsRes.data.filter(d => new Date(d.date) <= oneYearAgo),
        oneOffDonations: oneOffRes.data.filter(d => new Date(d.date) <= oneYearAgo),
        volunteeringActivities: volunteerRes.data.filter(v => new Date(v.date) <= oneYearAgo),
        previousPeriodScore: 0
      };
      const lastYearScoreResult = calculateComplexImpactScore(lastYearUserData, benchmarks);
      setLastYearImpactScore(lastYearScoreResult.totalScore);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch impact data. Please try again later.');
      setScoreDetails(defaultScoreDetails);
    }
  }, [getAuthHeaders, lastYearImpactScore]);

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

  const onDeleteContribution = useCallback(async (contributionId) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`http://localhost:3002/api/contributions/one-off/${contributionId}`, { headers });
      if (response.status === 200) {
        setOneOffContributions(prevContributions => prevContributions.filter(contribution => contribution._id !== contributionId));
        fetchImpactData();
      }
    } catch (error) {
      console.error('Error deleting contribution:', error);
      setError('Failed to delete contribution. Please try again.');
    }
  }, [getAuthHeaders, fetchImpactData]);

  const saveFollowedCharitiesToDB = useCallback(async (charities) => {
    try {
      const headers = getAuthHeaders();
      await axios.post('http://localhost:3002/api/followedCharities', { charities }, { headers });
    } catch (error) {
      console.error('Error saving followed charities to database:', error);
      // Don't set an error state here, as we're still using localStorage as a fallback
    }
  }, [getAuthHeaders]);

  const addFollowedCharity = useCallback((charity) => {
    setFollowedCharities(prevCharities => {
      if (!prevCharities.some(c => c.ABN === charity.ABN)) {
        const newCharities = [...prevCharities, charity];
        localStorage.setItem('followedCharities', JSON.stringify(newCharities));
        // Attempt to save to the database as well
        saveFollowedCharitiesToDB(newCharities);
        return newCharities;
      }
      return prevCharities;
    });
  }, [saveFollowedCharitiesToDB]);

  const removeFollowedCharity = useCallback((charityABN) => {
    setFollowedCharities(prevCharities => {
      const newCharities = prevCharities.filter(c => c.ABN !== charityABN);
      localStorage.setItem('followedCharities', JSON.stringify(newCharities));
      // Attempt to update the database as well
      saveFollowedCharitiesToDB(newCharities);
      return newCharities;
    });
  }, [saveFollowedCharitiesToDB]);

  // Load followed charities from localStorage on component mount
  useEffect(() => {
    const storedCharities = localStorage.getItem('followedCharities');
    if (storedCharities) {
      setFollowedCharities(JSON.parse(storedCharities));
    }
    fetchImpactData();
  }, [fetchImpactData]);

  // Attempt to sync localStorage charities with the database
  useEffect(() => {
    const syncFollowedCharities = async () => {
      try {
        const headers = getAuthHeaders();
        const response = await axios.get('http://localhost:3002/api/followedCharities', { headers });
        const dbCharities = response.data;
        
        // Merge localStorage charities with database charities
        const mergedCharities = [...new Set([...followedCharities, ...dbCharities])];
        setFollowedCharities(mergedCharities);
        localStorage.setItem('followedCharities', JSON.stringify(mergedCharities));
        
        // Update the database with the merged list
        await saveFollowedCharitiesToDB(mergedCharities);
      } catch (error) {
        console.error('Error syncing followed charities:', error);
        // Don't set an error state here, as we're still using localStorage as a fallback
      }
    };

    syncFollowedCharities();
  }, [followedCharities, getAuthHeaders, saveFollowedCharitiesToDB]);

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
      fetchImpactData,
      error,
      addDonation,
      addOneOffContribution,
      calculateComplexImpactScore,
      onDeleteContribution,
      followedCharities,
      addFollowedCharity,
      removeFollowedCharity,
      getAuthHeaders
    }}>
      {children}
    </ImpactContext.Provider>
  );
};
