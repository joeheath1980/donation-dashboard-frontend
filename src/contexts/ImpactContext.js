import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const ImpactContext = createContext();

export const ImpactProvider = ({ children }) => {
  const [impactScore, setImpactScore] = useState(0);
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

  const calculateImpactScore = (donations, oneOffContributions, volunteerHours) => {
    const donationPoints = donations.reduce((acc, donation) => 
      acc + (Number(donation.amount) || 0) / 100, 0);

    const oneOffPoints = oneOffContributions.reduce((acc, contribution) => 
      acc + (Number(contribution.amount) || 0) / 100, 0);

    const volunteerPoints = volunteerHours.reduce((acc, activity) => 
      acc + (Number(activity.hours) || 0), 0);

    return donationPoints + oneOffPoints + volunteerPoints;
  };

  const fetchImpactData = useCallback(async () => {
    const calculateLastYearImpactScore = (donations, oneOffContributions, volunteerHours) => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
      const filteredDonations = donations.filter(donation => new Date(donation.date) <= oneYearAgo);
      const filteredOneOffContributions = oneOffContributions.filter(contribution => new Date(contribution.date) <= oneYearAgo);
      const filteredVolunteerHours = volunteerHours.filter(activity => new Date(activity.date) <= oneYearAgo);
  
      return calculateImpactScore(filteredDonations, filteredOneOffContributions, filteredVolunteerHours);
    };

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

      const currentScore = calculateImpactScore(donationsRes.data, oneOffRes.data, volunteerRes.data);
      setImpactScore(currentScore);

      // Calculate the impact score from one year ago
      const lastYearScore = calculateLastYearImpactScore(donationsRes.data, oneOffRes.data, volunteerRes.data);
      setLastYearImpactScore(lastYearScore);

      // Calculate the current tier and points to next tier
      const currentTier = getTier(currentScore);
      setTier(currentTier.tier);
      setPointsToNextTier(currentTier.pointsToNextTier);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch impact data. Please try again later.');
    }
  }, [getAuthHeaders]);

  const getTier = (score) => {
    if (score >= 2501) return { tier: "Visionary", nextTier: null, pointsToNextTier: 0 };
    if (score >= 1001) return { tier: "Champion", nextTier: "Visionary", pointsToNextTier: 2501 - score };
    if (score >= 501) return { tier: "Philanthropist", nextTier: "Champion", pointsToNextTier: 1001 - score };
    if (score >= 101) return { tier: "Altruist", nextTier: "Philanthropist", pointsToNextTier: 501 - score };
    return { tier: "Giver", nextTier: "Altruist", pointsToNextTier: 101 - score };
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
        date: donation.date // Ensure this is being sent
      };
  
      console.log('Sending donation to backend:', parsedDonation);
  
      const response = await axios.post('http://localhost:3002/api/donations', parsedDonation, { headers });
  
      if (response.status === 201) {
        console.log('Donation added, response:', response.data);
        setDonations(prevDonations => [...prevDonations, response.data]);
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
        date: contribution.date // Ensure we're sending the original date
      };

      console.log('Sending one-off contribution to backend:', parsedContribution);

      const response = await axios.post('http://localhost:3002/api/contributions/one-off', parsedContribution, { headers });

      if (response.status === 201) {
        console.log('One-off contribution added, response:', response.data);
        setOneOffContributions(prevContributions => [...prevContributions, response.data]);
      } else {
        console.error('Failed to add contribution:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
      setError('Failed to add contribution. Please try again.');
    }
  };

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  return (
    <ImpactContext.Provider value={{
      impactScore,
      lastYearImpactScore,
      tier,
      pointsToNextTier,
      donations,
      oneOffContributions,
      volunteerActivities,
      fetchImpactData,
      error,
      addDonation,
      addOneOffContribution
    }}>
      {children}
    </ImpactContext.Provider>
  );
};
