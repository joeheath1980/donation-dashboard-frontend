import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const ImpactContext = createContext();

export const ImpactProvider = ({ children }) => {
  const [impactScore, setImpactScore] = useState(0);
  const [donations, setDonations] = useState([]);
  const [volunteerActivities, setVolunteerActivities] = useState([]);
  const [fundraisingCampaigns, setFundraisingCampaigns] = useState([]);
  const [matchingOpportunities, setMatchingOpportunities] = useState([]); // Add state for matching opportunities
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  const fetchImpactData = useCallback(async () => {
    setError(null);
    const headers = getAuthHeaders();
    
    try {
      // Fetch donations
      const donationsResponse = await axios.get('http://localhost:3002/api/donations', { headers });
      const fetchedDonations = donationsResponse.data;
      setDonations(fetchedDonations);
      console.log('Fetched Donations:', fetchedDonations);

      // Fetch volunteer activities
      let fetchedVolunteerActivities = [];
      try {
        const volunteerResponse = await axios.get('http://localhost:3002/api/volunteerActivities', { headers });
        fetchedVolunteerActivities = volunteerResponse.data;
        setVolunteerActivities(fetchedVolunteerActivities);
        console.log('Fetched Volunteer Activities:', fetchedVolunteerActivities);
      } catch (volunteerError) {
        if (volunteerError.response && volunteerError.response.status === 404) {
          console.warn('Volunteer activities endpoint not found. Setting activities to an empty array.');
          setVolunteerActivities([]);
        } else {
          console.error('Error fetching volunteer activities:', volunteerError);
          setError('Failed to fetch volunteer activities. Please try again later.');
        }
      }

      // Fetch fundraising campaigns
      let fetchedFundraisingCampaigns = [];
      try {
        const fundraisingResponse = await axios.get('http://localhost:3002/api/fundraisingCampaigns', { headers });
        fetchedFundraisingCampaigns = fundraisingResponse.data;
        setFundraisingCampaigns(fetchedFundraisingCampaigns);
        console.log('Fetched Fundraising Campaigns:', fetchedFundraisingCampaigns);
      } catch (fundraisingError) {
        if (fundraisingError.response && fundraisingError.response.status === 404) {
          console.warn('Fundraising campaigns endpoint not found. Setting campaigns to an empty array.');
          setFundraisingCampaigns([]);
        } else {
          console.error('Error fetching fundraising campaigns:', fundraisingError);
          setError('Failed to fetch fundraising campaigns. Please try again later.');
        }
      }

      // Fetch matching opportunities
      let fetchedMatchingOpportunities = [];
      try {
        const matchingResponse = await axios.get('http://localhost:3002/api/matchingOpportunities', { headers });
        fetchedMatchingOpportunities = matchingResponse.data;
        setMatchingOpportunities(fetchedMatchingOpportunities);
        console.log('Fetched Matching Opportunities:', fetchedMatchingOpportunities);
      } catch (matchingError) {
        if (matchingError.response && matchingError.response.status === 404) {
          console.warn('Matching opportunities endpoint not found. Setting opportunities to an empty array.');
          setMatchingOpportunities([]);
        } else {
          console.error('Error fetching matching opportunities:', matchingError);
          setError('Failed to fetch matching opportunities. Please try again later.');
        }
      }

      // Calculate the impact score using the fetched data
      const score = calculateImpactScore(fetchedDonations, fetchedVolunteerActivities, fetchedFundraisingCampaigns);
      setImpactScore(score);
      console.log('Calculated Impact Score:', score);

    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to fetch impact data. Please try again later.');
      }
    }
  }, [getAuthHeaders]);

  const addDonation = async (newContribution, category) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      if (category === 'regular') {
        await axios.post('http://localhost:3002/api/donations', newContribution, { headers });
      } else if (category === 'oneoff') {
        await axios.post('http://localhost:3002/api/contributions/one-off', newContribution, { headers });
      }

      // Refetch the data after adding the donation
      fetchImpactData();
    } catch (error) {
      console.error('Error adding donation:', error);
      setError('Failed to add donation. Please try again later.');
    }
  };

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  const calculateImpactScore = (donations, volunteerHours, fundraising) => {
    const donationPoints = donations.reduce((acc, donation) => acc + donation.amount / 100, 0);
    const volunteerPoints = volunteerHours.reduce((acc, activity) => acc + activity.hours, 0);
    const fundraisingPoints = fundraising.reduce((acc, campaign) => acc + campaign.raised / 100, 0);
    return donationPoints + volunteerPoints + fundraisingPoints;
  };

  return (
    <ImpactContext.Provider value={{ 
      impactScore, 
      donations, 
      volunteerActivities, 
      fundraisingCampaigns, 
      matchingOpportunities, // Pass the matching opportunities state
      fetchImpactData,
      addDonation, // Pass the addDonation function
      error 
    }}>
      {children}
    </ImpactContext.Provider>
  );
};








