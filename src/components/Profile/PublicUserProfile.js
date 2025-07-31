import React, { useState, useEffect, useContext } from 'react';
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
import { ImpactContext } from '../../contexts/ImpactContext';

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
  const { 
    impactScore: contextImpactScore,
    lastYearImpactScore,
    tier: contextTier,
    pointsToNextTier: contextPointsToNextTier
  } = useContext(ImpactContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeImpactSection, setActiveImpactSection] = useState(0);
  const [showAllFollowedCharities, setShowAllFollowedCharities] = useState(false);
  
  // Debug context on mount
  useEffect(() => {
    console.log('=== CONTEXT DEBUG ON MOUNT ===');
    console.log('ImpactContext values:', {
      contextImpactScore,
      lastYearImpactScore,
      contextTier,
      contextPointsToNextTier,
      hasContext: contextImpactScore !== undefined
    });
  }, [contextImpactScore, lastYearImpactScore, contextTier, contextPointsToNextTier]);

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
      console.log('=== EFFECT TRIGGERED ===');
      console.log('Mounted:', mounted);
      console.log('UserId:', userId);
      fetchProfile();
    }
  }, [userId, mounted]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('=== PUBLIC PROFILE DEBUG ===');
      console.log('1. Fetching profile for userId:', userId);
      console.log('2. Current user from auth:', currentUser);
      console.log('3. Current user ID:', currentUser?._id);
      console.log('4. Type of userId param:', typeof userId);
      console.log('5. Type of currentUser._id:', typeof currentUser?._id);
      console.log('6. Are they equal?', currentUser?._id === userId);
      console.log('7. Context values:', {
        contextImpactScore,
        contextTier,
        contextPointsToNextTier,
        lastYearImpactScore
      });
      
      const data = await profileService.getUserPublicProfile(userId);
      console.log('8. Profile data received:', data);
      console.log('9. Full profile details:', {
        user: data?.user,
        stats: data?.stats,
        privacy: data?.privacy,
        impactScore: data?.impactScore,
        tier: data?.tier,
        pointsToNextTier: data?.pointsToNextTier
      });
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
  
  // Debug: Check all available score and tier fields
  console.log('=== API DATA STRUCTURE ===');
  console.log('Profile object:', profile);
  console.log('User object:', user);
  console.log('Stats object:', stats);
  console.log('All score fields:', {
    'profile.impactScore': profile?.impactScore,
    'profile.actualImpactScore': profile?.actualImpactScore,
    'profile.tier': profile?.tier,
    'user.impactScore': user?.impactScore,
    'user.actualImpactScore': user?.actualImpactScore,
    'user.publicScore': user?.publicScore,
    'user.tier': user?.tier,
    'stats.impactScore': stats?.impactScore,
    'stats.totalScore': stats?.totalScore,
    'stats.tier': stats?.tier
  });
  
  // Check if viewing own profile
  console.log('=== PROFILE COMPARISON DEBUG ===');
  console.log('currentUser:', currentUser);
  console.log('currentUser._id:', currentUser?._id);
  console.log('userId from params:', userId);
  console.log('Type of currentUser._id:', typeof currentUser?._id);
  console.log('Type of userId:', typeof userId);
  
  // Try multiple ways to check if it's own profile
  const isOwnProfile = currentUser && (
    currentUser._id === userId || 
    currentUser.id === userId ||
    currentUser._id?.toString() === userId ||
    currentUser.id?.toString() === userId
  );
  
  console.log('isOwnProfile result:', isOwnProfile);
  
  // Use context data for own profile, otherwise use API data
  let actualScore = 0;
  let actualTier = 'Giver';
  let scoreChange = 0;
  let pointsToNextTier = 0;
  
  console.log('=== SCORE CALCULATION DEBUG ===');
  console.log('Context Impact Score defined?', contextImpactScore !== undefined);
  console.log('Context Impact Score value:', contextImpactScore);
  console.log('Should use context?', isOwnProfile && contextImpactScore !== undefined);
  
  if (isOwnProfile && contextImpactScore !== undefined) {
    // Use the authoritative data from ImpactContext for own profile
    actualScore = contextImpactScore;
    actualTier = contextTier;
    pointsToNextTier = contextPointsToNextTier;
    scoreChange = contextImpactScore - lastYearImpactScore;
    console.log('USING CONTEXT DATA:', { actualScore, actualTier, pointsToNextTier, scoreChange });
  } else {
    // Fallback to API provided values for other profiles
    actualScore = profile?.impactScore || profile?.actualImpactScore || 
                 stats?.impactScore || stats?.totalScore ||
                 user?.actualImpactScore || user?.impactScore || 0;
                 
    actualTier = profile?.tier || stats?.tier || user?.tier || 'Giver';
    scoreChange = profile?.scoreChange || 0;
    
    // Calculate pointsToNextTier based on actual score
    if (actualScore < 30) pointsToNextTier = 30 - actualScore;
    else if (actualScore < 50) pointsToNextTier = 50 - actualScore;
    else if (actualScore < 70) pointsToNextTier = 70 - actualScore;
    else if (actualScore < 90) pointsToNextTier = 90 - actualScore;
    else pointsToNextTier = 0;
    
    console.log('USING API DATA:', { actualScore, actualTier, pointsToNextTier, scoreChange });
    console.log('Reason:', isOwnProfile ? 'Context score undefined' : 'Not own profile');
  }
  
  console.log('=== FINAL VALUES ===');
  console.log('Final score:', actualScore);
  console.log('Final tier:', actualTier);
  console.log('Final pointsToNextTier:', pointsToNextTier);
  console.log('Final scoreChange:', scoreChange);
  
  const safeUser = {
    displayName: user?.displayName || 'Anonymous User',
    tier: actualTier,
    joinDate: user?.joinDate || new Date().toISOString(),
    avatar: user?.avatar,
    publicScore: actualScore,
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
            {console.log('=== RENDERING PersonalImpactScore ===')}
            {console.log('Props being passed:', {
              impactScore: actualScore,
              scoreChange,
              tier: actualTier,
              pointsToNextTier,
              isPublicProfile: true,
              isOwnProfile
            })}
            <PersonalImpactScore
              impactScore={actualScore}
              scoreChange={scoreChange}
              tier={actualTier}
              pointsToNextTier={pointsToNextTier}
              isPublicProfile={true}
              onBackToDashboard={isOwnProfile ? handleBackToDashboard : null}
            />
          </div>
          
          {/* Scrollable Impact Section */}
          <ScrollableImpactSection 
            impactScore={actualScore}
            scoreDetails={null}
            tier={actualTier}
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