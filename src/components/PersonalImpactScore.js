import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaTrophy, FaHeartbeat, FaGraduationCap, FaTree, FaHandHoldingHeart, FaGlobeAmericas, FaInfoCircle } from 'react-icons/fa';

const badges = [
  { icon: FaHeartbeat, title: 'Healthcare Hero', color: '#FF6B6B', description: 'Impact in the health sector' },
  { icon: FaGraduationCap, title: 'Education Champion', color: '#4ECDC4', description: 'Supporting educational initiatives' },
  { icon: FaTree, title: 'Environmental Guardian', color: '#45B649', description: 'Protecting the environment' },
  { icon: FaHandHoldingHeart, title: 'Humanitarian Helper', color: '#FF8C00', description: 'Aiding humanitarian causes' },
  { icon: FaGlobeAmericas, title: 'Global Impact', color: '#3498DB', description: 'Making a worldwide difference' },
];

const PersonalImpactScore = ({ impactScore, scoreChange, arrow, tier, pointsToNextTier }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showTooltip, setShowTooltip] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(impactScore);
    }, 500);
    return () => clearTimeout(timer);
  }, [impactScore]);

  const containerStyle = {
    background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    position: 'relative',
  };

  const columnStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 10px',
  };

  const badgesContainerStyle = {
    ...columnStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    padding: '15px',
    maxWidth: '30%',
  };

  const scoreContainerStyle = {
    ...columnStyle,
    alignItems: 'center',
  };

  const tierContainerStyle = {
    ...columnStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    padding: '15px',
    maxWidth: '30%',
  };

  const scoreNumberStyle = {
    fontSize: '5rem',
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: '10px',
  };

  const scoreChangeStyle = {
    color: '#2E7D32',
    fontSize: '1rem',
  };

  const progressBarContainerStyle = {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    height: '10px',
    marginTop: '10px',
    overflow: 'hidden',
  };

  const progressBarStyle = {
    width: `${(100 - pointsToNextTier) / 100 * 100}%`,
    background: 'linear-gradient(90deg, #4CAF50, #81C784)',
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease-in-out',
  };

  const badgeStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '5px',
    cursor: 'pointer',
    position: 'relative',
  };

  const tooltipStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    zIndex: 1000,
  };

  const ctaStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    fontSize: '0.9rem',
    transition: 'background-color 0.3s',
  };

  return (
    <div style={containerStyle}>
      <div style={badgesContainerStyle}>
        <h3 style={{ marginBottom: '10px', color: '#2E7D32' }}>Impact Badges</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {badges.map((badge, index) => (
            <div
              key={index}
              style={badgeStyle}
              onMouseEnter={() => setShowTooltip(index)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <badge.icon size={30} color={badge.color} />
              {showTooltip === index && (
                <div style={tooltipStyle}>{badge.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={scoreContainerStyle}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#2E7D32' }}>Personal Impact Score</h2>
        <div style={scoreNumberStyle}>{animatedScore}</div>
        <div style={scoreChangeStyle}>
          <FaArrowUp style={{ marginRight: '5px' }} /> +{Math.abs(scoreChange)} since last year
        </div>
        <button style={ctaStyle}>
          See Your Full Impact Report <FaInfoCircle style={{ marginLeft: '5px' }} />
        </button>
      </div>
      <div style={tierContainerStyle}>
        <h3 style={{ marginBottom: '10px', color: '#2E7D32' }}>Current Tier</h3>
        <p style={{ color: '#2E7D32', margin: '5px 0', fontSize: '1.2rem' }}>
          <FaTrophy style={{ marginRight: '5px' }} />
          <span style={{ fontWeight: 'bold', color: '#1B5E20' }}>{tier}</span>
        </p>
        <p style={{ color: '#2E7D32', margin: '10px 0', fontSize: '1rem' }}>
          Points to next tier: <span>{pointsToNextTier}</span>
        </p>
        <div style={progressBarContainerStyle}>
          <div style={progressBarStyle}></div>
        </div>
      </div>
    </div>
  );
};

export default PersonalImpactScore;