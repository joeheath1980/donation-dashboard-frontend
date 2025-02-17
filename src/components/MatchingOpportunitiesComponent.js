import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './MatchingOpportunitiesComponent.module.css';
import CarouselComponent from './CarouselComponent';

function MatchingOpportunitiesComponent({ userId }) {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(ImpactContext);

  useEffect(() => {
    const fetchOpportunities = async () => {
      const token = localStorage.getItem('token');
      try {
        console.log('Fetching matching opportunities...');
        console.log('User ID:', userId);
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/matchingOpportunities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched opportunities:', response.data);
        setOpportunities(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching matching opportunities:', error);
        setOpportunities([]);
        setError('Failed to fetch matching opportunities. Please try again later.');
      }
    };

    if (isAuthenticated && userId) {
      fetchOpportunities();
    } else {
      console.log('User is not authenticated or no user ID provided');
    }
  }, [isAuthenticated, userId]);

  const handleMatch = async (opportunityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/matchingOpportunities/${opportunityId}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOpportunities(prevOpportunities =>
        prevOpportunities.map(opp =>
          opp._id === opportunityId ? { ...opp, accepted: true } : opp
        )
      );
    } catch (err) {
      console.error('Error accepting matching opportunity:', err);
      setError('Failed to accept the matching opportunity. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return <div className={styles.container}>Please log in to view matching opportunities.</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  const carouselItems = opportunities.map(opportunity => ({
    title: opportunity.message,
    charity: opportunity.charity,
    contribution: `$${opportunity.donationAmount}`,
    multiplier: '2x',
    validUntil: new Date(opportunity.endDate).toLocaleDateString(),
    id: opportunity._id,
    accepted: opportunity.accepted,
    onMatch: () => handleMatch(opportunity._id)
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Matching Opportunities</h2>
      {opportunities && opportunities.length > 0 ? (
        <CarouselComponent items={carouselItems} />
      ) : (
        <p className={styles.text}>No matching opportunities available at the moment.</p>
      )}
    </div>
  );
}

export default MatchingOpportunitiesComponent;