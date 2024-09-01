import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const ImpactContext = createContext();

export const ImpactProvider = ({ children }) => {
  const [impactScore, setImpactScore] = useState(0);
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

      const score = calculateImpactScore(donationsRes.data, oneOffRes.data, volunteerRes.data);
      setImpactScore(score);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch impact data. Please try again later.');
    }
  }, [getAuthHeaders]);

  const calculateImpactScore = (donations, oneOffContributions, volunteerHours) => {
    const donationPoints = donations.reduce((acc, donation) => 
      acc + (Number(donation.amount) || 0) / 100, 0);

    const oneOffPoints = oneOffContributions.reduce((acc, contribution) => 
      acc + (Number(contribution.amount) || 0) / 100, 0);

    const volunteerPoints = volunteerHours.reduce((acc, activity) => 
      acc + (Number(activity.hours) || 0), 0);

    return donationPoints + oneOffPoints + volunteerPoints;
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
  
      console.log('Sending donation to backend:', parsedDonation); // Add this log
  
      const response = await axios.post('http://localhost:3002/api/donations', parsedDonation, { headers });
  
      if (response.status === 201) {
        console.log('Donation added, response:', response.data); // Add this log
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

      console.log('Sending one-off contribution to backend:', parsedContribution); // Add this log

      const response = await axios.post('http://localhost:3002/api/contributions/one-off', parsedContribution, { headers });

      if (response.status === 201) {
        console.log('One-off contribution added, response:', response.data); // Add this log
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












