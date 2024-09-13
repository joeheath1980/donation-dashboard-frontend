import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const ImpactContext = createContext();

// Calculation logic remains the same
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

      const currentTier = getTier(scoreResult.totalScore);
      setTier(currentTier.tier);
      setPointsToNextTier(currentTier.pointsToNextTier);

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
  const saveFollowedCharitiesToDb = useCallback(async (charities) => {
    try {
      const headers = getAuthHeaders();
      const validCharities = charities.filter(charity => charity.name && charity.ABN);
      
      if (validCharities.length === 0) {
        console.log('No valid charities to save');
        return;
      }
  
      console.log('Sending payload:', validCharities);
  
      const response = await axios.post('http://localhost:3002/api/followed-charities', validCharities[0], { headers });
      console.log('Charity saved successfully:', response.data);
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
        saveFollowedCharitiesToDb([charity]);
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

  // Load followed charities from localStorage on component mount
  useEffect(() => {
    const storedCharities = localStorage.getItem('followed-charities');
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
        const response = await axios.get('http://localhost:3002/api/followed-charities', { headers });
        const dbCharities = response.data;
        
        setFollowedCharities(prevCharities => {
          const mergedCharities = [...new Set([...prevCharities, ...dbCharities])];
          
          if (JSON.stringify(mergedCharities) !== JSON.stringify(prevCharities)) {
            localStorage.setItem('followed-charities', JSON.stringify(mergedCharities));
            try {
              saveFollowedCharitiesToDb(mergedCharities);
            } catch (saveError) {
              console.error('Error saving merged charities to database:', saveError);
            }
            return mergedCharities;
          }
          return prevCharities;
        });
      } catch (error) {
        console.error('Error syncing followed charities:', error);
      }
    };

    syncFollowedCharities();
  }, [getAuthHeaders, saveFollowedCharitiesToDb]);

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
      followedCharities,
      addFollowedCharity,
      removeFollowedCharity,
      getAuthHeaders
    }}>
      {children}
    </ImpactContext.Provider>
  );
};

