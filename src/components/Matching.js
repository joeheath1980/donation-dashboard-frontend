import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from './CleanDesign.module.css';
import GlobalGivingProjects from './GlobalGivingProjects';
import { FaApple, FaAmazon, FaMicrosoft, FaGoogle, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { SiTesla, SiNike, SiAdidas, SiCocacola, SiMcdonalds, SiBurgerking, SiNetflix, SiSpotify } from 'react-icons/si';

const iconMap = {
  'Apple': FaApple,
  'Amazon': FaAmazon,
  'Microsoft': FaMicrosoft,
  'Google': FaGoogle,
  'Facebook': FaFacebook,
  'Twitter': FaTwitter,
  'LinkedIn': FaLinkedin,
  'Tesla': SiTesla,
  'Nike': SiNike,
  'Adidas': SiAdidas,
  'Coca-Cola': SiCocacola,
  'McDonald\'s': SiMcdonalds,
  'Burger King': SiBurgerking,
  'Netflix': SiNetflix,
  'Spotify': SiSpotify
};

const cardStyle = {
  height: '220px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const cardContentStyle = {
  flexGrow: 1,
  overflow: 'auto',
  padding: '0 12px',
};

const compactTextStyle = {
  margin: '0',
  lineHeight: '1.1',
};

const logoStyle = {
  width: '24px',
  height: '24px',
  marginRight: '8px',
};

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
    return filteredOpportunities.map(opportunity => {
      const IconComponent = iconMap[opportunity.brand] || null;

      return (
        <div key={opportunity._id} className={styles.card} style={cardStyle}>
          <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
            {IconComponent && <IconComponent style={logoStyle} />}
            <h3 className={styles.cardTitle} style={{ fontSize: '16px' }}>{opportunity.brand}</h3>
          </div>
          <div className={styles.cardContent} style={cardContentStyle}>
            <p className={styles.text} style={{...compactTextStyle, fontWeight: 'bold', marginBottom: '4px'}}>{opportunity.description.split('!')[0] + '!'}</p>
            <p className={`${styles.text} ${styles.highlight}`} style={{...compactTextStyle, marginBottom: '4px'}}><strong>Cause:</strong> {opportunity.cause}</p>
            <div className={`${styles.flexColumn}`}>
              <p className={styles.text} style={compactTextStyle}><strong>Your Contribution:</strong> ${opportunity.donationAmount}</p>
              <p className={styles.text} style={compactTextStyle}><strong>Multiplier:</strong> x2</p>
              <p className={styles.text} style={compactTextStyle}><strong>Total Impact:</strong> ${opportunity.totalAmount}</p>
            </div>
            <p className={`${styles.text}`} style={{ ...compactTextStyle, marginTop: '4px' }}><strong>Valid Until:</strong> {new Date(opportunity.endDate).toLocaleDateString()}</p>
          </div>
          <div className={styles.cardActions} style={{ padding: '8px 12px' }}>
            <button
              onClick={() => handleMatch(opportunity._id)}
              className={styles.button}
              disabled={opportunity.accepted}
            >
              {opportunity.accepted ? 'Matched' : 'Match'}
            </button>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return <div className={styles.container}>Loading matching opportunities...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.subHeader}>Error</h2>
        <p className={styles.text}>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.button}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Matching Opportunities</h1>
        <p className={styles.text}>
          Explore curated donation matches tailored to your interests. Find matches for your favorite charities, discover new causes, or leverage partner offers. Use filters to navigate easily. Make your giving go further with the perfect match!
        </p>
      </div>
      
      <div className={`${styles.flexBetween} ${styles.mb10}`}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.button}
        >
          <option value="all">All Opportunities</option>
          <option value="yourCharities">Your Charities</option>
          <option value="relevantCauses">Relevant Causes</option>
          <option value="partners">Our Partners</option>
        </select>
      </div>

      <div className={styles.grid}>
        {renderOpportunityCards()}
      </div>

      <div className={`${styles.container} ${styles.mt10}`}>
        <h2 className={styles.subHeader}>Global Giving Projects</h2>
        <p className={styles.text}>
          Discover and support international projects through GlobalGiving. These projects offer unique opportunities to make a global impact aligned with your interests and values.
        </p>
        <GlobalGivingProjects />
      </div>
    </div>
  );
}

export default Matching;
