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
      error
    }}>
      {children}
    </ImpactContext.Provider>
  );
};








