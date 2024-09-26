import React, { useState, useContext, useMemo } from 'react';
import { FaArrowUp, FaTimes, FaHeartbeat, FaGraduationCap, FaTree, FaHandHoldingHeart, FaGlobeAmericas, FaWater, FaBook, FaPaw, FaLeaf, FaBriefcaseMedical, FaUtensils, FaHome, FaSeedling, FaStar } from 'react-icons/fa';
import styles from './PersonalImpactScore.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

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
  { icon: FaHandHoldingHeart, title: 'Disaster Relief Ally', color: '#D35400', description: 'Supporting disaster relief efforts' },
  { icon: FaHeartbeat, title: 'Child Welfare Protector', color: '#C0392B', description: 'Safeguarding children\'s rights' },
  { icon: FaStar, title: 'Arts and Culture Patron', color: '#1ABC9C', description: 'Supporting arts and cultural initiatives' },
  { icon: FaGlobeAmericas, title: 'Climate Action Advocate', color: '#16A085', description: 'Fighting climate change' },
  { icon: FaBook, title: 'STEM Education Booster', color: '#2980B9', description: 'Advancing STEM education' },
  { icon: FaHandHoldingHeart, title: 'Elder Care Supporter', color: '#7F8C8D', description: 'Supporting elderly care' },
  { icon: FaLeaf, title: 'Conservation Champion', color: '#27AE60', description: 'Preserving biodiversity' },
];

const PersonalImpactScore = ({ impactScore, scoreChange, tier, pointsToNextTier, onFullReportClick, onSeeProgressClick }) => {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const { donations, oneOffContributions } = useContext(ImpactContext);

  const collectedBadges = useMemo(() => {
    const allContributions = [...donations, ...oneOffContributions];
    const charityTypeCounts = {};

    allContributions.forEach(contribution => {
      const charityType = contribution.charityType?.toLowerCase();
      if (charityType) {
        charityTypeCounts[charityType] = (charityTypeCounts[charityType] || 0) + 1;
      }
    });

    return Object.entries(charityTypeCounts).reduce((acc, [charityType, count]) => {
      if (count >= 3) {
        const badge = allBadges.find(b => b.title.toLowerCase().includes(charityType));
        if (badge) acc.push(badge);
      }
      return acc;
    }, []);
  }, [donations, oneOffContributions]);

  const BadgeIcon = collectedBadges.length > 0 ? collectedBadges[0].icon : null;

  return (
    <div className={styles.container}>
      <div className={styles.badgesSection}>
        <h2 className={styles.sectionTitle}>Your Badges</h2>
        <div className={styles.badgeCircle}>
          {BadgeIcon ? (
            <BadgeIcon size={30} color="white" />
          ) : (
            <span role="img" aria-label="No badges">🏅</span>
          )}
        </div>
        <button className={styles.seeMoreButton} onClick={() => setShowAllBadges(true)}>
          All Badges
        </button>
      </div>

      <div className={styles.scoreSection}>
        <h2 className={styles.sectionTitle}>Personal Impact Score</h2>
        <div className={styles.scoreValue}>{impactScore}</div>
        <div className={styles.scoreChange}>
          <FaArrowUp /> +{scoreChange} since last year
        </div>
        <button className={styles.seeMoreButton} onClick={onFullReportClick}>
          Impact Score Breakdown
        </button>
      </div>

      <div className={styles.tierSection}>
        <h2 className={styles.sectionTitle}>Current Tier</h2>
        <div className={styles.tierIcon}>
          <FaHandHoldingHeart size={40} color="#4CAF50" />
        </div>
        <div className={styles.tierName}>{tier}</div>
        <div className={styles.pointsToNext}>
          Points to next tier: {pointsToNextTier}
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(100 - pointsToNextTier) / 100 * 100}%` }}
          ></div>
        </div>
        <button className={styles.seeMoreButton} onClick={onSeeProgressClick}>
          Check Progress
        </button>
      </div>

      {showAllBadges && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>All Badges</h2>
              <button className={styles.closeButton} onClick={() => setShowAllBadges(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.badgesGrid}>
              {allBadges.map((badge, index) => (
                <div
                  key={index}
                  className={`${styles.badgeItem} ${collectedBadges.some(b => b.title === badge.title) ? styles.collected : ''}`}
                >
                  <badge.icon size={40} color={collectedBadges.some(b => b.title === badge.title) ? badge.color : '#ccc'} />
                  <div className={styles.badgeTitle}>{badge.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalImpactScore;