import React, { useContext, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ImpactVisualization from './ImpactVisualization';
import ImpactScoreExplain from './ImpactScoreExplain';
import TierProgressModal from './TierProgressModal';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaHeartbeat, FaGraduationCap, FaTree, FaHandHoldingHeart, FaGlobeAmericas, FaWater, FaBook, FaPaw, FaLeaf, FaBriefcaseMedical, FaUtensils, FaHome, FaSeedling, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './ScrollableImpactSection.module.css';

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

const BadgesDisplay = () => {
  const { donations, oneOffContributions } = useContext(ImpactContext);

  const collectedBadges = React.useMemo(() => {
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

  return (
    <div className={styles.badgesGrid}>
      {allBadges.map((badge, index) => (
        <div
          key={index}
          className={`${styles.badgeItem} ${collectedBadges.some(b => b.title === badge.title) ? styles.collected : ''}`}
        >
          <badge.icon size={30} color={collectedBadges.some(b => b.title === badge.title) ? badge.color : '#ccc'} />
          <div className={styles.badgeTitle}>{badge.title}</div>
        </div>
      ))}
    </div>
  );
};

const ScrollableImpactSection = ({ impactScore, scoreDetails, tier, pointsToNextTier, activeSection, setActiveSection, totalSections, sectionTitles }) => {
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
      <div className={styles.impactSectionNav}>
        {sectionTitles.map((title, index) => (
          <button
            key={index}
            className={`${styles.impactSectionNavButton} ${activeSection === index ? styles.active : ''}`}
            onClick={() => setActiveSection(index)}
          >
            {title}
          </button>
        ))}
        <div className={styles.arrowNavigation}>
          <button onClick={() => navigateSection('prev')} className={styles.arrowButton}>
            <FaChevronLeft />
          </button>
          <button onClick={() => navigateSection('next')} className={styles.arrowButton}>
            <FaChevronRight />
          </button>
        </div>
      </div>
      <Swiper
        ref={swiperRef}
        spaceBetween={30}
        slidesPerView={1}
        onSlideChange={handleSlideChange}
      >
        <SwiperSlide>
          <ImpactVisualization hideTitle={true} />
        </SwiperSlide>
        <SwiperSlide>
          <ImpactScoreExplain hideTitle={true} />
        </SwiperSlide>
        <SwiperSlide>
          <TierProgressModal 
            currentTier={tier} 
            impactScore={impactScore}
            hideTitle={true}
          />
        </SwiperSlide>
        <SwiperSlide>
          <BadgesDisplay />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default ScrollableImpactSection;