import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from '../Matching.module.css';
import { applyGlobalStyles, globalClasses } from '../utils/styleUtils';
import GlobalGivingProjects from './GlobalGivingProjects';

const combinedStyles = applyGlobalStyles(styles, globalClasses);

function Matching() {
  const { user, getAuthHeaders } = useAuth();
  const [matchingOpportunities, setMatchingOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMatchingOpportunities = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const headers = getAuthHeaders();
        const response = await axios.get('http://localhost:3002/api/matchingOpportunities', { headers });
        setMatchingOpportunities(response.data);
        setFilteredOpportunities(response.data);
      } catch (err) {
        console.error('Error fetching matching opportunities:', err);
        setError('Failed to fetch matching opportunities. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchingOpportunities();
  }, [user, getAuthHeaders]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredOpportunities(matchingOpportunities);
    } else {
      setFilteredOpportunities(matchingOpportunities.filter(opp => opp.category === filter));
    }
  }, [filter, matchingOpportunities]);

  const handleMatch = async (opportunityId) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`http://localhost:3002/api/matchingOpportunities/${opportunityId}/accept`, {}, { headers });
      setMatchingOpportunities(prevOpportunities =>
        prevOpportunities.map(opp =>
          opp._id === opportunityId ? { ...opp, accepted: true } : opp
        )
      );
    } catch (err) {
      console.error('Error accepting matching opportunity:', err);
      setError('Failed to accept the matching opportunity. Please try again.');
    }
  };

  const renderOpportunityCards = () => {
    const cards = [];
    for (let i = 0; i < 15; i++) {
      const opportunity = filteredOpportunities[i] || { _id: `placeholder-${i}`, placeholder: true };
      cards.push(
        <div key={opportunity._id} className={`${combinedStyles.card} ${combinedStyles.opportunityCard} ${opportunity.placeholder ? combinedStyles.placeholderCard : ''}`}>
          {!opportunity.placeholder ? (
            <>
              <h3 className={combinedStyles.subheader}>{opportunity.brand}</h3>
              <p className={combinedStyles.paragraph}><strong>Conditions:</strong> {opportunity.conditions}</p>
              <p className={combinedStyles.paragraph}><strong>Amount:</strong> ${opportunity.amount}</p>
              <p className={combinedStyles.paragraph}><strong>Valid Until:</strong> {new Date(opportunity.endDate).toLocaleDateString()}</p>
              <button
                onClick={() => handleMatch(opportunity._id)}
                className={opportunity.accepted ? combinedStyles.secondaryButton : combinedStyles.primaryButton}
                disabled={opportunity.accepted}
              >
                {opportunity.accepted ? 'Matched' : 'Match'}
              </button>
            </>
          ) : (
            <p className={combinedStyles.paragraph}>Future matching opportunity</p>
          )}
        </div>
      );
    }
    return cards;
  };

  if (isLoading) {
    return <div className={combinedStyles.loadingContainer}>Loading matching opportunities...</div>;
  }

  if (error) {
    return (
      <div className={combinedStyles.errorContainer}>
        <h2 className={combinedStyles.subheader}>Error</h2>
        <p className={combinedStyles.error}>{error}</p>
        <button onClick={() => window.location.reload()} className={combinedStyles.primaryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={combinedStyles.profileContainer}>
      <div className={combinedStyles.matchingHeader}>
        <h1 className={combinedStyles.header}>Matching Opportunities</h1>
        <p className={combinedStyles.paragraph}>
          Explore curated donation matches tailored to your interests. Find matches for your favorite charities, discover new causes, or leverage partner offers. Use filters to navigate easily. Make your giving go further with the perfect match!
        </p>
      </div>
      
      <div className={combinedStyles.filterContainer}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={combinedStyles.select}
        >
          <option value="all">All Opportunities</option>
          <option value="yourCharities">Your Charities</option>
          <option value="relevantCauses">Relevant Causes</option>
          <option value="partners">Our Partners</option>
        </select>
      </div>

      <div className={combinedStyles.opportunitiesContainer}>
        {renderOpportunityCards()}
      </div>

      <div className={combinedStyles.globalGivingSection}>
        <h2 className={combinedStyles.subheader}>Global Giving Projects</h2>
        <p className={combinedStyles.paragraph}>
          Discover and support international projects through GlobalGiving. These projects offer unique opportunities to make a global impact aligned with your interests and values.
        </p>
        <GlobalGivingProjects />
      </div>
    </div>
  );
}

export default Matching;
