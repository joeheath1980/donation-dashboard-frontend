import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FaTrophy, 
  FaMedal, 
  FaCalendar,
  FaLock,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
  FaFire,
  FaGlobeAfrica,
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
  FaChartLine,
  FaRegHeart,
  FaTimes,
  FaChevronRight
} from 'react-icons/fa';
import { format } from 'date-fns';
import styles from '../Profile.module.css';
import publicStyles from './PublicUserProfile.module.css';
import '../SharedStyles.css';
import profileService from '../../services/profile.service';
import LoadingSpinner from '../Common/LoadingSpinner';
import PersonalImpactScore from '../PersonalImpactScore';
import ScrollableImpactSection from '../ScrollableImpactSection';
import { useAuth } from '../../contexts/AuthContext';

const SectionTitle = ({ icon: Icon, title }) => (
  <div className={styles.sectionHeader}>
    <h2 className={`${styles.sectionTitle} gradientTitle`}>
      <Icon className={styles.sectionIcon} /> {title}
    </h2>
    <div className={styles.sectionTitleUnderline}></div>
  </div>
);

const PublicUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeImpactSection, setActiveImpactSection] = useState(0);
  const [showAllFollowedCharities, setShowAllFollowedCharities] = useState(false);

  const impactSections = [
    { title: 'Impact Journey', component: 'ImpactVisualization' },
    { title: 'Impact Score Breakdown', component: 'ImpactScoreExplain' },
    { title: 'Tier Progress', component: 'TierProgress' },
    { title: 'Your Badges', component: 'BadgesDisplay' },
  ];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchProfile();
    }
  }, [userId, mounted]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for userId:', userId);
      const data = await profileService.getUserPublicProfile(userId);
      console.log('Profile data received:', data);
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error in component:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = profileService.generateProfileUrl('user', userId);
    const displayName = profile?.user?.displayName || 'this';
    const text = `Check out ${displayName}'s giving profile on Do-Nation!`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  if (!mounted || loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className={publicStyles.errorContainer}>
        <h2>Profile Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  if (!profile || !profile.user) {
    return (
      <div className={publicStyles.errorContainer}>
        <h2>Profile Not Found</h2>
        <p>The profile you're looking for doesn't exist or is private.</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  const { user, stats, recentActivity, charityPortfolio } = profile;
  
  // Ensure user object has required properties
  const safeUser = {
    displayName: user?.displayName || 'Anonymous User',
    tier: user?.tier || 'Giver',
    joinDate: user?.joinDate || new Date().toISOString(),
    avatar: user?.avatar,
    publicScore: user?.publicScore !== undefined ? user.publicScore : (user?.impactScore !== undefined ? user.impactScore : 0),
    impactStatement: user?.impactStatement,
    badges: user?.badges || [],
    ...user
  };
  
  const safeStats = {
    charitiesSupported: 0,
    currentStreak: 0,
    ...stats
  };
  
  const userData = { ...safeUser, stats: safeStats };
  const metaTags = profileService.generateMetaTags(userData, 'user');
  const structuredData = profileService.generateStructuredData(userData, 'user');

  // Use actual data from profile
  const scoreChange = profile?.scoreChange || 0;
  const pointsToNextTier = profile?.pointsToNextTier || profile?.user?.pointsToNextTier || 1000;
  
  // Check if viewing own profile
  const isOwnProfile = currentUser && currentUser._id === userId;

  const getDisplayedFollowedCharities = () => {
    return showAllFollowedCharities ? charityPortfolio : (charityPortfolio || []).slice(0, 3);
  };

  const toggleFollowedCharities = () => setShowAllFollowedCharities(!showAllFollowedCharities);
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {metaTags && (
        <Helmet>
          <title>{metaTags.title}</title>
          <meta name="description" content={metaTags.description} />
          <meta property="og:title" content={metaTags.title} />
          <meta property="og:description" content={metaTags.description} />
          <meta property="og:image" content={metaTags.image} />
          <meta property="og:url" content={metaTags.url} />
          <meta property="og:type" content={metaTags.type} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaTags.title} />
          <meta name="twitter:description" content={metaTags.description} />
          <meta name="twitter:image" content={metaTags.image} />
          <link rel="canonical" href={metaTags.url} />
          {structuredData && (
            <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
          )}
        </Helmet>
      )}

      <div className={styles.profileBackground}>
        <div className={styles.profileContainer}>
          {/* Public Profile Header */}
          <div className={publicStyles.publicHeader}>
            <div className={publicStyles.userInfo}>
              <div className={publicStyles.avatar}>
                {safeUser.avatar ? (
                  <img src={safeUser.avatar} alt={safeUser.displayName} />
                ) : (
                  <div className={publicStyles.avatarPlaceholder}>
                    {safeUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={publicStyles.userDetails}>
                <h1>{safeUser.displayName}</h1>
                <div className={publicStyles.joinDate}>
                  <FaCalendar />
                  Member since {format(new Date(safeUser.joinDate), 'MMMM yyyy')}
                </div>
              </div>
            </div>

            <div className={publicStyles.shareButtons}>
              <button onClick={() => handleShare('twitter')} className={publicStyles.shareBtn}>
                <FaTwitter />
              </button>
              <button onClick={() => handleShare('facebook')} className={publicStyles.shareBtn}>
                <FaFacebook />
              </button>
              <button onClick={() => handleShare('linkedin')} className={publicStyles.shareBtn}>
                <FaLinkedin />
              </button>
              <button onClick={() => handleShare('copy')} className={publicStyles.shareBtn}>
                <FaLink />
                {copied && <span className={publicStyles.copied}>Copied!</span>}
              </button>
            </div>
          </div>

          {/* Impact Score Section */}
          <div className={styles.impactScoreWrapper}>
            <PersonalImpactScore
              impactScore={safeUser.publicScore !== 'Private' ? safeUser.publicScore : 0}
              scoreChange={scoreChange}
              tier={safeUser.tier}
              pointsToNextTier={pointsToNextTier}
              isPublicProfile={true}
              onBackToDashboard={isOwnProfile ? handleBackToDashboard : null}
            />
          </div>
          
          {/* Scrollable Impact Section */}
          <ScrollableImpactSection 
            impactScore={safeUser.publicScore !== 'Private' ? safeUser.publicScore : 0}
            scoreDetails={null}
            tier={safeUser.tier}
            pointsToNextTier={pointsToNextTier}
            activeSection={activeImpactSection}
            setActiveSection={setActiveImpactSection}
            totalSections={impactSections.length}
            sectionTitles={impactSections.map(section => section.title)}
          />

          {/* Impact Statement */}
          {safeUser.impactStatement && (
            <section className={styles.section}>
              <div className={publicStyles.impactStatement}>
                <h3>Impact Statement</h3>
                <p>"{safeUser.impactStatement}"</p>
              </div>
            </section>
          )}
          
          {/* Your Impact Section - Only showing Charities Following */}
          <section className={`${styles.section} ${styles.impactSection}`}>
            <SectionTitle icon={FaChartLine} title="Supporting" />
            
            <div className={styles.impactContent}>
              <div className={publicStyles.charitiesGrid}>
                <div className={`${styles.donationCard} card`}>
                  <h3 className={`${styles.cardTitle} cardTitle`}>
                    <FaRegHeart className={styles.icon} /> Charities Following
                  </h3>
                  <ul className={styles.list}>
                    {getDisplayedFollowedCharities().map((charity, index) => (
                      <li key={charity.ABN || `charity-${index}`} className={styles.listItem}>
                        <span>{charity.name || 'Unknown Charity'}</span>
                      </li>
                    ))}
                  </ul>
                  {charityPortfolio && charityPortfolio.length > 3 && (
                    <button className={`${styles.actionButton} button`} onClick={toggleFollowedCharities}>
                      {showAllFollowedCharities ? "Hide" : "See All"} <FaChevronRight className={styles.buttonIcon} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Activity Stats */}
          <section className={styles.section}>
            <div className={publicStyles.statsGrid}>
              <div className={publicStyles.statCard}>
                <FaGlobeAfrica className={publicStyles.statIcon} />
                <div className={publicStyles.statValue}>
                  {safeStats.charitiesSupported} <span>charities</span>
                </div>
                <div className={publicStyles.statLabel}>Supported</div>
              </div>

              {safeStats.currentStreak > 0 && (
                <div className={publicStyles.statCard}>
                  <FaFire className={publicStyles.statIcon} />
                  <div className={publicStyles.statValue}>
                    {safeStats.currentStreak} <span>days</span>
                  </div>
                  <div className={publicStyles.statLabel}>Current Streak</div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default PublicUserProfile;