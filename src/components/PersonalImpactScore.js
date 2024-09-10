import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaTrophy, FaHeartbeat, FaGraduationCap, FaTree, FaHandHoldingHeart, FaGlobeAmericas, FaInfoCircle, FaStar, FaAward, FaHandsHelping, FaHeart, FaWater, FaBook, FaPaw, FaLeaf, FaBriefcaseMedical, FaUtensils, FaHome, FaSeedling, FaTimes } from 'react-icons/fa';
import ImpactScoreExplain from './ImpactScoreExplain';

const allBadges = [
  { icon: FaHeartbeat, title: 'Healthcare Hero', color: '#FF6B6B', description: 'Impact in the health sector' },
  { icon: FaGraduationCap, title: 'Education Champion', color: '#4ECDC4', description: 'Supporting educational initiatives' },
  { icon: FaTree, title: 'Environmental Guardian', color: '#45B649', description: 'Protecting the environment' },
  { icon: FaHandHoldingHeart, title: 'Humanitarian Helper', color: '#FF8C00', description: 'Aiding humanitarian causes' },
  { icon: FaGlobeAmericas, title: 'Global Impact', color: '#3498DB', description: 'Making a worldwide difference' },
  { icon: FaWater, title: 'Clean Water Advocate', color: '#00CED1', description: 'Providing access to clean water' },
  { icon: FaBook, title: 'Literacy Promoter', color: '#9B59B6', description: 'Advancing literacy and education' },
  { icon: FaPaw, title: 'Animal Welfare Champion', color: '#E67E22', description: 'Supporting animal rights and welfare' },
  { icon: FaLeaf, title: 'Sustainability Steward', color: '#27AE60', description: 'Promoting sustainable practices' },
  { icon: FaBriefcaseMedical, title: 'Medical Research Supporter', color: '#E74C3C', description: 'Funding crucial medical research' },
  { icon: FaUtensils, title: 'Hunger Fighter', color: '#F39C12', description: 'Combating hunger and malnutrition' },
  { icon: FaHome, title: 'Housing Hero', color: '#8E44AD', description: 'Providing shelter and housing support' },
  { icon: FaSeedling, title: 'Community Grower', color: '#2ECC71', description: 'Nurturing community development' },
  { icon: FaHandsHelping, title: 'Disaster Relief Ally', color: '#D35400', description: 'Supporting disaster relief efforts' },
  { icon: FaHeart, title: 'Child Welfare Protector', color: '#C0392B', description: 'Safeguarding children\'s rights' },
  { icon: FaStar, title: 'Arts and Culture Patron', color: '#1ABC9C', description: 'Supporting arts and cultural initiatives' },
  { icon: FaGlobeAmericas, title: 'Climate Action Advocate', color: '#16A085', description: 'Fighting climate change' },
  { icon: FaBook, title: 'STEM Education Booster', color: '#2980B9', description: 'Advancing STEM education' },
  { icon: FaHandHoldingHeart, title: 'Elder Care Supporter', color: '#7F8C8D', description: 'Supporting elderly care' },
  { icon: FaLeaf, title: 'Conservation Champion', color: '#27AE60', description: 'Preserving biodiversity' },
];

const tierBadges = [
  { icon: FaStar, title: 'Visionary', color: '#FFD700', description: 'Achieved 90+ impact points' },
  { icon: FaAward, title: 'Champion', color: '#C0C0C0', description: 'Achieved 70-89 impact points' },
  { icon: FaTrophy, title: 'Philanthropist', color: '#CD7F32', description: 'Achieved 50-69 impact points' },
  { icon: FaHandsHelping, title: 'Altruist', color: '#2ECC71', description: 'Achieved 30-49 impact points' },
  { icon: FaHeart, title: 'Giver', color: '#E74C3C', description: 'Achieved 0-29 impact points' },
];

const PersonalImpactScore = ({ impactScore, scoreChange, arrow, tier, pointsToNextTier }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showTooltip, setShowTooltip] = useState(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  // Simulate collected badges (first 5 for this example)
  const collectedBadges = allBadges.slice(0, 5);

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
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    margin: '0 10px',
  };

  const badgesGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
  };

  const badgeStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  };

  const scoreNumberStyle = {
    fontSize: '4rem',
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

  const buttonStyle = {
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

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    width: '80%',
    maxWidth: '800px',
    maxHeight: '80%',
    overflow: 'auto',
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const modalGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '20px',
    justifyContent: 'center',
  };

  const modalBadgeStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
    borderRadius: '10px',
    backgroundColor: '#f0f0f0',
    transition: 'transform 0.2s',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };

  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#333',
  };

  const currentTierBadge = tierBadges.find(badge => badge.title === tier);

  return (
    <div style={containerStyle}>
      <div style={columnStyle}>
        <h3 style={{ marginBottom: '10px', color: '#2E7D32' }}>Your Badges</h3>
        <div style={badgesGridStyle}>
          {collectedBadges.map((badge, index) => (
            <div
              key={index}
              style={{
                ...badgeStyle,
                backgroundColor: badge.color,
              }}
              onMouseEnter={() => setShowTooltip(index)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <badge.icon size={25} color="white" />
              {showTooltip === index && (
                <div style={tooltipStyle}>{badge.title}</div>
              )}
            </div>
          ))}
        </div>
        <button
          style={{...buttonStyle, marginTop: '15px'}}
          onClick={() => setShowAllBadges(true)}
        >
          All Badges
        </button>
      </div>

      <div style={columnStyle}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#2E7D32' }}>Personal Impact Score</h2>
        <div style={scoreNumberStyle}>{animatedScore}</div>
        <div style={scoreChangeStyle}>
          <FaArrowUp style={{ marginRight: '5px' }} /> +{Math.abs(scoreChange)} since last year
        </div>
        <button style={buttonStyle} onClick={() => setShowFullReport(true)}>
          See Your Full Impact Report <FaInfoCircle style={{ marginLeft: '5px' }} />
        </button>
      </div>

      <div style={columnStyle}>
        <h3 style={{ marginBottom: '10px', color: '#2E7D32' }}>Current Tier</h3>
        {currentTierBadge && (
          <div style={{...badgeStyle, width: '80px', height: '80px'}}>
            <currentTierBadge.icon size={40} color={currentTierBadge.color} />
            <span style={{ fontWeight: 'bold', color: '#1B5E20', marginTop: '5px' }}>{currentTierBadge.title}</span>
          </div>
        )}
        <p style={{ color: '#2E7D32', margin: '10px 0', fontSize: '1rem' }}>
          Points to next tier: <span>{pointsToNextTier}</span>
        </p>
        <div style={progressBarContainerStyle}>
          <div style={progressBarStyle}></div>
        </div>
      </div>

      {showAllBadges && (
        <>
          <div style={overlayStyle} onClick={() => setShowAllBadges(false)} />
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h2>All Impact Badges</h2>
              <button style={closeButtonStyle} onClick={() => setShowAllBadges(false)}>
                <FaTimes />
              </button>
            </div>
            <div style={modalGridStyle}>
              {allBadges.map((badge, index) => (
                <div
                  key={index}
                  style={{
                    ...modalBadgeStyle,
                    backgroundColor: index < collectedBadges.length ? badge.color : '#f0f0f0',
                    opacity: index < collectedBadges.length ? 1 : 0.5,
                  }}
                >
                  <badge.icon size={40} color={index < collectedBadges.length ? 'white' : '#999'} />
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', textAlign: 'center', color: index < collectedBadges.length ? 'white' : '#666' }}>{badge.title}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showFullReport && (
        <>
          <div style={overlayStyle} onClick={() => setShowFullReport(false)} />
          <div style={modalStyle}>
            <ImpactScoreExplain onClose={() => setShowFullReport(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalImpactScore;