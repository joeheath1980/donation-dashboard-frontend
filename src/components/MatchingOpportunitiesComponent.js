import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './CleanDesign.module.css';

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
        const response = await axios.get('http://localhost:3002/api/matchingOpportunities', {
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
      await axios.post(`http://localhost:3002/api/matchingOpportunities/${opportunityId}/accept`, {}, {
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

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>Matching Opportunities</h3>
      {opportunities && opportunities.length > 0 ? (
        <div className={styles.grid}>
          {opportunities.map(opportunity => (
            <div key={opportunity._id || opportunity.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>
                  {opportunity.message}
                </h4>
              </div>
              <div className={styles.cardContent}>
                <p><span className={styles.highlight}>Charity:</span> {opportunity.charity}</p>
                <p><span className={styles.highlight}>Your Contribution:</span> ${opportunity.donationAmount}</p>
                <p><span className={styles.highlight}>Multiplier:</span> 2x</p>
                <p><span className={styles.highlight}>Total Impact:</span> ${opportunity.totalAmount}</p>
                <p><span className={styles.highlight}>Valid Until:</span> {new Date(opportunity.endDate).toLocaleDateString()}</p>
              </div>
              <div className={styles.cardActions}>
                <button 
                  className={styles.button}
                  onClick={() => handleMatch(opportunity._id)}
                  disabled={opportunity.accepted}
                >
                  {opportunity.accepted ? 'Matched' : 'Match'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.text}>No matching opportunities available at the moment.</p>
      )}
    </div>
  );
}

export default MatchingOpportunitiesComponent;
