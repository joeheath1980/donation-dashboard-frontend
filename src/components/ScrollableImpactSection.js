import React, { useContext, useEffect, useRef } from 'react';
import { DynamicWidth, ProgressBar, DynamicGradient } from './DynamicStyleManager';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ImpactVisualization from './ImpactVisualization';
import TierProgressModal from './TierProgressModal';
import { ImpactContext } from '../contexts/ImpactContext';
import { 
  FaHeartbeat, 
  FaGraduationCap, 
  FaTree, 
  FaHandHoldingHeart, 
  FaGlobeAmericas, 
  FaWater, 
  FaBook, 
  FaPaw, 
  FaLeaf, 
  FaBriefcaseMedical, 
  FaUtensils, 
  FaHome, 
  FaSeedling,
  FaChevronLeft, 
  FaChevronRight,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaAward,
  FaHeart,
  FaTimes,
  FaShare
} from 'react-icons/fa';
import '../styles/dynamic-styles.css';
import styles from './ScrollableImpactSection.module.css';

const allBadges = [
  { icon: FaHeartbeat, title: 'Healthcare Hero', color: '#FF6B6B', colorName: 'red', description: 'Impact in the health sector' },
  { icon: FaGraduationCap, title: 'Education Champion', color: '#4ECDC4', colorName: 'blue', description: 'Supporting educational initiatives' },
  { icon: FaTree, title: 'Environmental Guardian', color: '#45B649', colorName: 'green', description: 'Protecting the environment' },
  { icon: FaHandHoldingHeart, title: 'Humanitarian Helper', color: '#FF8C00', colorName: 'orange', description: 'Aiding humanitarian causes' },
  { icon: FaGlobeAmericas, title: 'Global Impact', color: '#3498DB', colorName: 'blue', description: 'Making a worldwide difference' },
  { icon: FaWater, title: 'Clean Water Advocate', color: '#00CED1', colorName: 'blue', description: 'Providing access to clean water' },
  { icon: FaBook, title: 'Literacy Promoter', color: '#9B59B6', colorName: 'purple', description: 'Advancing literacy and education' },
  { icon: FaPaw, title: 'Animal Welfare Champion', color: '#E67E22', colorName: 'orange', description: 'Supporting animal rights and welfare' },
  { icon: FaLeaf, title: 'Sustainability Steward', color: '#27AE60', colorName: 'green', description: 'Promoting sustainable practices' },
  { icon: FaBriefcaseMedical, title: 'Medical Research Supporter', color: '#E74C3C', colorName: 'red', description: 'Funding crucial medical research' },
  { icon: FaUtensils, title: 'Hunger Fighter', color: '#F39C12', colorName: 'orange', description: 'Combating hunger and malnutrition' },
  { icon: FaHome, title: 'Housing Hero', color: '#8E44AD', colorName: 'purple', description: 'Providing shelter and housing support' },
  { icon: FaSeedling, title: 'Community Grower', color: '#2ECC71', colorName: 'green', description: 'Nurturing community development' },
  { icon: FaHandHoldingHeart, title: 'Disaster Relief Ally', color: '#D35400', colorName: 'orange', description: 'Supporting disaster relief efforts' },
  { icon: FaHeartbeat, title: 'Child Welfare Protector', color: '#C0392B', colorName: 'red', description: 'Safeguarding children\'s rights' },
  { icon: FaBook, title: 'Arts and Culture Patron', color: '#1ABC9C', colorName: 'green', description: 'Supporting arts and cultural initiatives' },
  { icon: FaGlobeAmericas, title: 'Climate Action Advocate', color: '#16A085', colorName: 'green', description: 'Fighting climate change' },
  { icon: FaBook, title: 'STEM Education Booster', color: '#2980B9', colorName: 'blue', description: 'Advancing STEM education' },
  { icon: FaHandHoldingHeart, title: 'Elder Care Supporter', color: '#7F8C8D', colorName: 'silver', description: 'Supporting elderly care' },
  { icon: FaLeaf, title: 'Conservation Champion', color: '#27AE60', colorName: 'green', description: 'Preserving biodiversity' },
];

const tiers = [
  { name: 'Visionary', minScore: 5000, icon: FaCrown, color: '#FFD700' },
  { name: 'Champion', minScore: 2500, icon: FaMedal, color: '#C0C0C0' },
  { name: 'Philanthropist', minScore: 1000, icon: FaTrophy, color: '#CD7F32' },
  { name: 'Altruist', minScore: 300, icon: FaAward, color: '#2ECC71' },
  { name: 'Giver', minScore: 0, icon: FaHeart, color: '#E74C3C' }
];

// Mapping between charity types and badge titles
const charityTypeToBadge = {
  'Health Services': 'Healthcare Hero',
  'Mental Health': 'Healthcare Hero',
  'Education': 'Education Champion',
  'Environmental Conservation': 'Environmental Guardian',
  'Social Welfare': 'Humanitarian Helper',
  'Emergency Relief': 'Disaster Relief Ally',
  'Food Security': 'Hunger Fighter',
  'Child Welfare': 'Child Welfare Protector',
  'Indigenous Support': 'Community Grower',
  'Housing': 'Housing Hero',
  'Community Building': 'Community Grower',
  'Rural Support': 'Community Grower'
};

// Badge Modal Component
const BadgeModal = ({ badge, isOpen, onClose, earnedDate, contributions }) => {
  if (!isOpen || !badge) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modalHeader} dynamic-gradient`} data-gradient-color={badge.colorName}>
          <div className={styles.modalBadge}>
            <badge.icon size={48} color="white" />
          </div>
          <h3>{badge.title}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {earnedDate ? (
            <>
              <div className={styles.earnedDate}>
                <FaTrophy color={badge.color} />
                <span>Earned on {earnedDate}</span>
              </div>
              
              <div className={styles.badgeDetails}>
                <h4>How you earned this badge:</h4>
                <ul>
                  {contributions.map((contrib, idx) => (
                    <li key={idx}>{contrib}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.badgeImpact}>
                <h4>Your Impact:</h4>
                <p>{badge.description}</p>
              </div>
              
              <div className={styles.modalActions}>
                <button className={styles.shareButton} style={{ background: badge.color }}>
                  <FaShare /> Share Badge
                </button>
              </div>
            </>
          ) : (
            <div className={styles.lockedBadgeInfo}>
              <h4>How to earn this badge:</h4>
              <p>Make at least 3 contributions to {badge.title.replace(' Hero', '').replace(' Champion', '').replace(' Guardian', '')} causes</p>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} progress-bar-fill`}
                  data-progress-width={(contributions.length / 3) * 100}
                  data-color={badge.color}
                  ref={el => el && el.style.setProperty('--progress', `${(contributions.length / 3) * 100}%`)}
                />
              </div>
              <p className={styles.progressText}>{contributions.length} / 3 contributions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BadgesDisplay = ({ isActive }) => {
  const { donations, oneOffContributions } = useContext(ImpactContext);
  const [selectedBadge, setSelectedBadge] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Force re-render when component becomes active
    if (isActive) {
      setMounted(true);
      // Force a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const { collectedBadges, badgeProgress } = React.useMemo(() => {
    const allContributions = [...donations, ...oneOffContributions];
    
    // Debug: Log sample contribution to see structure
    if (allContributions.length > 0) {
      console.log('Sample contribution structure:', allContributions[0]);
    }
    
    const charityTypeCounts = {};
    const charityTypeContributions = {};

    // Count contributions by charity type
    allContributions.forEach(contribution => {
      // Try multiple field names for charity type
      const charityType = contribution.charityType || contribution.category || contribution.charityCategory;
      // Try multiple field names for charity name
      const charityName = contribution.charityName || contribution.charity || contribution.recipientName || 'Unknown Charity';
      
      if (charityType) {
        charityTypeCounts[charityType] = (charityTypeCounts[charityType] || 0) + 1;
        
        if (!charityTypeContributions[charityType]) {
          charityTypeContributions[charityType] = [];
        }
        charityTypeContributions[charityType].push({
          amount: contribution.amount || contribution.donationAmount || 0,
          date: contribution.createdAt || contribution.date || contribution.donationDate,
          charityName: charityName
        });
      }
    });

    // Map charity types to badges
    const collected = [];
    const progress = {};
    
    Object.entries(charityTypeCounts).forEach(([charityType, count]) => {
      const badgeTitle = charityTypeToBadge[charityType];
      if (badgeTitle) {
        const badge = allBadges.find(b => b.title === badgeTitle);
        if (badge) {
          if (count >= 3 && !collected.some(b => b.title === badge.title)) {
            const contributions = charityTypeContributions[charityType] || [];
            const latestContribution = contributions[Math.min(2, contributions.length - 1)];
            collected.push({
              ...badge,
              earnedDate: latestContribution?.date ? new Date(latestContribution.date).toLocaleDateString() : 'Recently',
              contributions: contributions.slice(0, 3).map(c => 
                `Donated $${c.amount || 0} to ${c.charityName || 'a charity'}`
              )
            });
          }
          progress[badge.title] = {
            count,
            contributions: charityTypeContributions[charityType]
          };
        }
      }
    });

    return { collectedBadges: collected, badgeProgress: progress };
  }, [donations, oneOffContributions]);

  const handleBadgeClick = (badge) => {
    const collected = collectedBadges.find(b => b.title === badge.title);
    const progress = badgeProgress[badge.title] || { count: 0, contributions: [] };
    
    setSelectedBadge({
      ...badge,
      earnedDate: collected?.earnedDate,
      contributions: collected?.contributions || (progress.contributions || []).map(c => 
        `Donated $${c.amount || 0} to ${c.charityName || 'a charity'}`
      )
    });
    setModalOpen(true);
  };

  return (
    <>
      <div className={styles.badgesGrid}>
        {allBadges.map((badge, index) => {
          const isCollected = collectedBadges.some(b => b.title === badge.title);
          const progress = badgeProgress[badge.title];
          
          return (
            <div
              key={index}
              className={`${styles.badgeItem} ${isCollected ? styles.collected : styles.locked}`}
              onClick={() => handleBadgeClick(badge)}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              role="button"
              tabIndex={0}
            >
              <div 
                className={`${styles.badgeCircle} ${isCollected ? 'dynamic-gradient' : ''}`}
                data-gradient-color={isCollected ? badge.colorName : null}
              >
                <badge.icon size={36} color={isCollected ? 'white' : '#999'} />
                {isCollected && <div className={styles.badgeShine} />}
              </div>
              <div 
                className={styles.badgeTitle}
                style={isCollected ? { color: badge.color } : null}
              >
                {badge.title}
              </div>
              {!isCollected && progress && (
                <div className={styles.badgeProgress}>
                  <span>{progress.count}/3</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <BadgeModal
        badge={selectedBadge}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        earnedDate={selectedBadge?.earnedDate}
        contributions={selectedBadge?.contributions || []}
      />
    </>
  );
};

const ScrollableImpactSection = ({ impactScore, scoreDetails, tier, pointsToNextTier, activeSection, setActiveSection, totalSections, sectionTitles, hideAmounts = false, useDarkNav = false }) => {
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(activeSection);
    }
  }, [activeSection]);

  const handleSlideChange = (swiper) => {
    setActiveSection(swiper.activeIndex);
  };

  const navigateSection = (direction) => {
    const newIndex = direction === 'next' 
      ? (activeSection + 1) % totalSections 
      : (activeSection - 1 + totalSections) % totalSections;
    setActiveSection(newIndex);
  };

  return (
    <div className={styles.scrollableImpactSection}>
      <div className={`${styles.impactSectionNav} ${useDarkNav ? styles.darkNav : ''} tabs`}>
        {sectionTitles.map((title, index) => (
          <button
            key={index}
            className={`${styles.impactSectionNavButton} ${activeSection === index ? styles.active : ''} tab`}
            aria-selected={activeSection === index}
            onClick={() => setActiveSection(index)}
          >
            {title}
          </button>
        ))}
        <div className={styles.arrowNavigation}>
          <button onClick={() => navigateSection('prev')} className={styles.arrowButton}>
            <FaChevronLeft className={styles.chevronIcon} />
          </button>
          <button onClick={() => navigateSection('next')} className={styles.arrowButton}>
            <FaChevronRight className={styles.chevronIcon} />
          </button>
        </div>
      </div>
      <Swiper
        ref={swiperRef}
        spaceBetween={30}
        slidesPerView={1}
        onSlideChange={handleSlideChange}
        allowTouchMove={false}
        observer={true}
        observeParents={true}
        updateOnWindowResize={true}
        watchSlidesProgress={true}
      >
        <SwiperSlide>
          <ImpactVisualization hideTitle={true} hideAmounts={hideAmounts} />
        </SwiperSlide>
        <SwiperSlide>
          <TierProgressModal 
            currentTier={tier} 
            impactScore={impactScore}
            hideTitle={true}
            tiers={tiers}
          />
        </SwiperSlide>
        <SwiperSlide>
          <div className={styles.badgesContainer}>
            <BadgesDisplay isActive={activeSection === 2} />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default ScrollableImpactSection;
