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
  FaInstagram,
  FaFire,
  FaGlobeAfrica,
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGlobe,
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
  FaChevronRight,
  FaHeart
} from 'react-icons/fa';
import { format } from 'date-fns';
import styles from '../Profile.module.css';
import publicStyles from './PublicUserProfile.module.css';
import '../SharedStyles.css';
import profileService from '../../services/profile.service';
import apiServices from '../../services/api.service';
import { getCspNonce, isJsonLdEnabled } from '../../utils/csp';
import LoadingSpinner from '../Common/LoadingSpinner';
import PersonalImpactScore from '../PersonalImpactScore';
import ScrollableImpactSection from '../ScrollableImpactSection';
import { useAuth } from '../../contexts/AuthContext';
import { ImpactContext } from '../../contexts/ImpactContext';
import { SecureTokenStorage } from '../../utils/auth.utils';

const SectionTitle = ({ icon: Icon, title }) => (
  <div className={styles.sectionHeader}>
    <h2 className={`${styles.sectionTitle} gradientTitle`}>
      <Icon className={styles.sectionIcon} /> {title}
    </h2>
    <div className={styles.sectionTitleUnderline}></div>
  </div>
);

const PublicUserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
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
  const [publicImpact, setPublicImpact] = useState(null);
  const [publicImpactHistory, setPublicImpactHistory] = useState(null);
  
  // Debug helpers (dev-only)
  const __DEV__ = process.env.NODE_ENV === 'development';
  const devLog = (...args) => { if (__DEV__) console.log(...args); };
  const devWarn = (...args) => { if (__DEV__) console.warn(...args); };

  // Debug context on mount
  useEffect(() => {
    devLog('=== CONTEXT DEBUG ON MOUNT === v2', new Date().toISOString());
    devLog('ImpactContext values:', {
      contextImpactScore,
      lastYearImpactScore,
      contextTier,
      contextPointsToNextTier,
      hasContext: contextImpactScore !== undefined
    });
  }, [contextImpactScore, lastYearImpactScore, contextTier, contextPointsToNextTier]);

  const impactSections = [
    { title: 'Impact Journey', component: 'ImpactVisualization' },
    { title: 'Tier Progress', component: 'TierProgress' },
    { title: 'Your Badges', component: 'BadgesDisplay' },
  ];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    devLog('=== EFFECT TRIGGERED === v2');
    devLog('Mounted:', mounted);
    devLog('Username:', username);
    devLog('Auth loading:', authLoading);
    // Temporary alert to confirm new version
    devWarn('🚀 NEW VERSION DEPLOYED - PublicUserProfile v2');

    // Handle /profile/me specially: wait for auth to resolve
    if (username === 'me') {
      // Check if there's a token - if so, user is likely logged in but auth context hasn't loaded yet
      const hasToken = !!SecureTokenStorage.getToken();

      if (authLoading) {
        // Wait for auth context to resolve before taking action
        return;
      }
      if (currentUser?.username) {
        navigate(`/profile/${currentUser.username}`, { replace: true });
        return;
      }
      // If we have a token but no currentUser yet, wait a bit more for auth to complete
      if (hasToken && !currentUser) {
        devLog('Has token but no currentUser yet, waiting for auth...');
        return;
      }
      // Not authenticated or no username available
      setError('You need to be logged in to view your public profile.');
      setLoading(false);
      return;
    }

    // Normal fetch path for explicit usernames
    fetchProfile();
  }, [username, mounted, currentUser, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      devLog('=== PUBLIC PROFILE DEBUG === v2', new Date().toISOString());
      devLog('1. Fetching profile for username:', username);
      devLog('2. Current user from auth:', currentUser);
      devLog('3. Current user ID:', currentUser?._id);
      devLog('4. Type of currentUser._id:', typeof currentUser?._id);
      devLog('6. Are they equal?', currentUser?.username === username);
      devLog('7. Context values:', {
        contextImpactScore,
        contextTier,
        contextPointsToNextTier,
        lastYearImpactScore
      });
      
      const data = await profileService.getUserPublicProfile(username);
      devLog('8. Profile data received:', data);
      devLog('9. Full profile details:', {
        user: data?.user,
        stats: data?.stats,
        privacy: data?.privacy,
        impactScore: data?.impactScore,
        tier: data?.tier,
        pointsToNextTier: data?.pointsToNextTier
      });
      setProfile(data);
      
      // Fetch public impact summary/history for this profile to drive visualizations
      try {
        const api = apiServices.client;
        const [impactSummaryRes, impactHistoryRes] = await Promise.all([
          api.get(`/api/public/profile/impact/${username}`),
          api.get(`/api/public/profile/impact/${username}/history`)
        ]);
        
        setPublicImpact(impactSummaryRes.data || null);
        
        if (impactHistoryRes.data?.timeline) {
          // Transform timeline to match ImpactVisualization expectations
          const transformed = impactHistoryRes.data.timeline.map(entry => ({
            ...entry,
            totalScore: entry.cumulative ?? entry.totalScore ?? entry.points ?? 0,
            score: entry.points ?? entry.totalScore ?? entry.cumulative ?? 0
          }));
          setPublicImpactHistory(transformed);
        } else {
          setPublicImpactHistory(null);
        }
      } catch (impactErr) {
        console.error('Failed to fetch public impact summary/history', impactErr);
        setPublicImpact(null);
        setPublicImpactHistory(null);
      }
    } catch (err) {
      console.error('Profile fetch error in component:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = profileService.generateProfileUrl('user', username);
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
  devLog('=== API DATA STRUCTURE === v2', new Date().toISOString());
  devLog('Charity Portfolio:', charityPortfolio);
  devLog('Profile object:', profile);
  devLog('User object:', user);
  devLog('Stats object:', stats);
  devLog('All score fields:', {
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
  devLog('=== PROFILE COMPARISON DEBUG === v2', new Date().toISOString());
  devLog('currentUser:', currentUser);
  devLog('currentUser._id:', currentUser?._id);
  devLog('username from params:', username);
  devLog('Type of currentUser._id:', typeof currentUser?._id);
  devLog('Type of username:', typeof username);
  
  // Try multiple ways to check if it's own profile
  const isOwnProfile = currentUser && (
    currentUser.username === username ||
    currentUser._id === username || 
    currentUser.id === username
  );
  
  devLog('isOwnProfile result:', isOwnProfile);
  
  // Use context data for own profile, otherwise use API data
  let actualScore = 0;
  let actualTier = 'Giver';
  let scoreChange = 0;
  let pointsToNextTier = 0;
  
  devLog('=== SCORE CALCULATION DEBUG ===');
  devLog('Context Impact Score defined?', contextImpactScore !== undefined);
  devLog('Context Impact Score value:', contextImpactScore);
  devLog('Should use context?', isOwnProfile && contextImpactScore !== undefined);
  
  if (isOwnProfile && contextImpactScore !== undefined) {
    // Use the authoritative data from ImpactContext for own profile
    actualScore = contextImpactScore;
    actualTier = contextTier;
    pointsToNextTier = contextPointsToNextTier;
    scoreChange = contextImpactScore - lastYearImpactScore;
    devLog('USING CONTEXT DATA:', { actualScore, actualTier, pointsToNextTier, scoreChange });
  } else {
    // Fallback to API provided values for other profiles
    actualScore = publicImpact?.impactScore ||
                 profile?.impactScore || profile?.actualImpactScore || 
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
    
    devLog('USING API DATA:', { actualScore, actualTier, pointsToNextTier, scoreChange });
    devLog('Reason:', isOwnProfile ? 'Context score undefined' : 'Not own profile');
  }
  
  devLog('=== FINAL VALUES === v2', new Date().toISOString());
  devLog('Final score:', actualScore);
  devLog('Final tier:', actualTier);
  devLog('Final pointsToNextTier:', pointsToNextTier);
  devLog('Final scoreChange:', scoreChange);
  
  const safeUser = {
    displayName: user?.displayName || 'Anonymous User',
    tier: actualTier,
    joinDate: user?.joinDate || new Date().toISOString(),
    avatar: user?.profilePictureUrl || user?.profilePicture || user?.avatar,
    publicScore: publicImpact?.impactScore ?? actualScore,
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
          {structuredData && isJsonLdEnabled() && (
            <script type="application/ld+json" nonce={getCspNonce() || undefined}>
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
                {safeUser.username && (
                  <p className={publicStyles.username}>@{safeUser.username}</p>
                )}
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

          {/* Profile Information Section */}
          {(safeUser.bio || safeUser.professionalTitle || 
            (safeUser.location && (safeUser.location.city || safeUser.location.state || safeUser.location.country)) ||
            (safeUser.privacy?.showSocialLinks !== false && safeUser.socialLinks)) && (
            <section className={publicStyles.profileInfoSection}>
              {safeUser.bio && (
                <div className={publicStyles.bio}>
                  <p>{safeUser.bio}</p>
                </div>
              )}
              
              <div className={publicStyles.infoGrid}>
                {safeUser.professionalTitle && (
                  <div className={publicStyles.infoItem}>
                    <FaBriefcase />
                    <span>{safeUser.professionalTitle}</span>
                  </div>
                )}
                
                {safeUser.privacy?.showLocation !== false && safeUser.location && 
                 (safeUser.location.city || safeUser.location.state || safeUser.location.country) && (
                  <div className={publicStyles.infoItem}>
                    <FaMapMarkerAlt />
                    <span>
                      {[safeUser.location.city, safeUser.location.state, safeUser.location.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                
                {safeUser.privacy?.showSocialLinks !== false && safeUser.socialLinks?.website && (
                  <div className={publicStyles.infoItem}>
                    <FaGlobe />
                    <a href={safeUser.socialLinks.website} target="_blank" rel="noopener noreferrer">
                      Website
                    </a>
                  </div>
                )}
              </div>
              
              {safeUser.privacy?.showSocialLinks !== false && safeUser.socialLinks && (
                <div className={publicStyles.socialLinks}>
                  {safeUser.socialLinks.twitter && (
                    <a href={safeUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <FaTwitter />
                    </a>
                  )}
                  {safeUser.socialLinks.linkedin && (
                    <a href={safeUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <FaLinkedin />
                    </a>
                  )}
                  {safeUser.socialLinks.facebook && (
                    <a href={safeUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      <FaFacebook />
                    </a>
                  )}
                  {safeUser.socialLinks.instagram && (
                    <a href={safeUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <FaInstagram />
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Impact Score Section */}
          <div className={styles.impactScoreWrapper}>
            {devLog('=== RENDERING PersonalImpactScore === v2', new Date().toISOString())}
            {devLog('Props being passed:', {
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
          
          {/* Scrollable Impact Section - Hide amounts on public profile */}
          <ScrollableImpactSection 
            impactScore={actualScore}
            scoreDetails={null}
            tier={actualTier}
            pointsToNextTier={pointsToNextTier}
            activeSection={activeImpactSection}
            setActiveSection={setActiveImpactSection}
            hideAmounts={true}
            totalSections={impactSections.length}
            sectionTitles={impactSections.map(section => section.title)}
            publicImpactScore={publicImpact?.impactScore}
            publicImpactHistory={publicImpactHistory}
            />

          {/* Impact Statement & Giving Philosophy */}
          {(safeUser.impactStatement || safeUser.givingPhilosophy) && (
            <section className={styles.section}>
              {safeUser.impactStatement && (
                <div className={publicStyles.impactStatement}>
                  <h3>Impact Statement</h3>
                  <p>"{safeUser.impactStatement}"</p>
                </div>
              )}
              {safeUser.givingPhilosophy && (
                <div className={publicStyles.givingPhilosophy}>
                  <h3>Giving Philosophy</h3>
                  <p>{safeUser.givingPhilosophy}</p>
                </div>
              )}
            </section>
          )}
          
          {/* Cause Areas */}
          {safeUser.preferredCauses && safeUser.preferredCauses.length > 0 && (
            <section className={styles.section}>
              <SectionTitle icon={FaHeart} title="Cause Areas" />
              <div className={publicStyles.causeAreas}>
                {safeUser.preferredCauses.map((cause, index) => (
                  <span key={index} className={publicStyles.causeTag}>
                    {cause}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          {/* Charities Following Details */}
          {charityPortfolio && charityPortfolio.length > 0 && (
            <section className={`${styles.section} ${styles.impactSection}`}>
              <SectionTitle icon={FaRegHeart} title="Charities Following" />
              
              <div className={publicStyles.charityGrid}>
                {getDisplayedFollowedCharities().map((charity, index) => {
                  // Debug charity data structure
                  console.log('Charity data:', charity);
                  // Handle different field naming conventions
                  const charityName = charity.Charity_Name || 
                                     charity.charityName || 
                                     charity.name || 
                                     charity.Name ||
                                     charity.charity_name ||
                                     'Unknown Charity';
                  const charityCategory = charity.Main_Activity || 
                                         charity.mainActivity ||
                                         charity.category || 
                                         charity.Category ||
                                         charity.main_activity ||
                                         'Charitable Organization';
                  
                  return (
                    <div key={charity.ABN || charity._id || `charity-${index}`} className={publicStyles.charityCard}>
                      <h4>{charityName}</h4>
                      <p>{charityCategory}</p>
                    </div>
                  );
                })}
              </div>
              
              {charityPortfolio.length > 3 && (
                <div className="text-center mt-20">
                  <button className={`${styles.actionButton} button`} onClick={toggleFollowedCharities}>
                    {showAllFollowedCharities ? "Show Less" : `View All ${charityPortfolio.length} Charities`} <FaChevronRight className={styles.buttonIcon} />
                  </button>
                </div>
              )}
            </section>
          )}

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

              {/* Charities Following */}
              {charityPortfolio && charityPortfolio.length > 0 && (
                <div className={publicStyles.statCard}>
                  <FaRegHeart className={publicStyles.statIcon} />
                  <div className={publicStyles.statValue}>
                    {charityPortfolio.length} <span>charities</span>
                  </div>
                  <div className={publicStyles.statLabel}>Following</div>
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
