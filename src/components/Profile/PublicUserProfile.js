import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FaTrophy, 
  FaMedal, 
  FaHeart,
  FaCalendar,
  FaLock,
  FaShare,
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
  FaSeedling
} from 'react-icons/fa';
import { format } from 'date-fns';
import styles from './PublicUserProfile.module.css';
import profileService from '../../services/profile.service';
import LoadingSpinner from '../Common/LoadingSpinner';

const PublicUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);

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
      console.log('Profile data details:', {
        hasData: !!data,
        hasUser: !!data?.user,
        userDisplayName: data?.user?.displayName,
        userTier: data?.user?.tier,
        hasStats: !!data?.stats,
        hasRecentActivity: !!data?.recentActivity,
        recentActivityLength: data?.recentActivity?.length,
        hasCharityPortfolio: !!data?.charityPortfolio,
        charityPortfolioLength: data?.charityPortfolio?.length
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
      <div className={styles.errorContainer}>
        <h2>Profile Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  if (!profile || !profile.user) {
    return (
      <div className={styles.errorContainer}>
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
    totalDonations: 0,
    charitiesSupported: 0,
    currentStreak: 0,
    matchesReceived: 0,
    ...stats
  };
  
  const userData = { ...safeUser, stats: safeStats };
  const metaTags = profileService.generateMetaTags(userData, 'user');
  const structuredData = profileService.generateStructuredData(userData, 'user');

  // Tier configurations - aligned with dashboard tiers
  const tierConfig = {
    Giver: { color: '#E74C3C', icon: '❤️' },
    Altruist: { color: '#2ECC71', icon: '🏆' },
    Philanthropist: { color: '#CD7F32', icon: '🏅' },
    Champion: { color: '#C0C0C0', icon: '🥈' },
    Visionary: { color: '#FFD700', icon: '👑' }
  };

  // Badge icons mapping - aligned with ScrollableImpactSection
  const badgeIcons = {
    'Healthcare Hero': { icon: FaHeartbeat, color: '#FF6B6B' },
    'Education Champion': { icon: FaGraduationCap, color: '#4ECDC4' },
    'Environmental Guardian': { icon: FaTree, color: '#45B649' },
    'Humanitarian Helper': { icon: FaHandHoldingHeart, color: '#FF8C00' },
    'Global Impact': { icon: FaGlobeAmericas, color: '#3498DB' },
    'Clean Water Advocate': { icon: FaWater, color: '#00CED1' },
    'Literacy Promoter': { icon: FaBook, color: '#9B59B6' },
    'Animal Welfare Champion': { icon: FaPaw, color: '#E67E22' },
    'Sustainability Steward': { icon: FaLeaf, color: '#27AE60' },
    'Medical Research Supporter': { icon: FaBriefcaseMedical, color: '#E74C3C' },
    'Hunger Fighter': { icon: FaUtensils, color: '#F39C12' },
    'Housing Hero': { icon: FaHome, color: '#8E44AD' },
    'Community Grower': { icon: FaSeedling, color: '#2ECC71' },
    'Disaster Relief Ally': { icon: FaHandHoldingHeart, color: '#D35400' },
    'Child Welfare Protector': { icon: FaHeartbeat, color: '#C0392B' },
    'Arts and Culture Patron': { icon: FaBook, color: '#1ABC9C' },
    'Climate Action Advocate': { icon: FaGlobeAmericas, color: '#16A085' },
    'STEM Education Booster': { icon: FaBook, color: '#2980B9' },
    'Elder Care Supporter': { icon: FaHandHoldingHeart, color: '#7F8C8D' },
    'Conservation Champion': { icon: FaLeaf, color: '#27AE60' }
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

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {safeUser.avatar ? (
                  <img src={safeUser.avatar} alt={safeUser.displayName} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {safeUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.userDetails}>
                <h1>{safeUser.displayName}</h1>
                <p className={styles.tierBadge}>{safeUser.tier} Tier</p>
                <div className={styles.joinDate}>
                  <FaCalendar />
                  Member since {format(new Date(safeUser.joinDate), 'MMMM yyyy')}
                </div>
              </div>
            </div>

            <div className={styles.shareButtons}>
              <button onClick={() => handleShare('twitter')} className={styles.shareBtn}>
                <FaTwitter />
              </button>
              <button onClick={() => handleShare('facebook')} className={styles.shareBtn}>
                <FaFacebook />
              </button>
              <button onClick={() => handleShare('linkedin')} className={styles.shareBtn}>
                <FaLinkedin />
              </button>
              <button onClick={() => handleShare('copy')} className={styles.shareBtn}>
                <FaLink />
                {copied && <span className={styles.copied}>Copied!</span>}
              </button>
            </div>
          </div>

          <div className={styles.tierBadge} style={{ backgroundColor: tierConfig[safeUser.tier]?.color || '#CD7F32' }}>
            <span className={styles.tierIcon}>{tierConfig[safeUser.tier]?.icon || '🥉'}</span>
            <span className={styles.tierName}>{safeUser.tier} Tier</span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FaTrophy className={styles.statIcon} />
            <div className={styles.statValue}>
              {safeUser.publicScore !== 'Private' ? (
                <>{safeUser.publicScore.toLocaleString()} <span>points</span></>
              ) : (
                <FaLock className={styles.privateLock} />
              )}
            </div>
            <div className={styles.statLabel}>Impact Score</div>
          </div>

          {safeStats.totalDonations > 0 && (
            <div className={styles.statCard}>
              <FaHeart className={styles.statIcon} />
              <div className={styles.statValue}>
                {safeStats.totalDonations} <span>donations</span>
              </div>
              <div className={styles.statLabel}>Total Donations</div>
            </div>
          )}

          <div className={styles.statCard}>
            <FaGlobeAfrica className={styles.statIcon} />
            <div className={styles.statValue}>
              {safeStats.charitiesSupported} <span>charities</span>
            </div>
            <div className={styles.statLabel}>Supported</div>
          </div>

          {safeStats.currentStreak > 0 && (
            <div className={styles.statCard}>
              <FaFire className={styles.statIcon} />
              <div className={styles.statValue}>
                {safeStats.currentStreak} <span>days</span>
              </div>
              <div className={styles.statLabel}>Current Streak</div>
            </div>
          )}
        </div>

        {safeUser.impactStatement && (
          <div className={styles.impactStatement}>
            <h3>Impact Statement</h3>
            <p>"{safeUser.impactStatement}"</p>
          </div>
        )}

        <div className={styles.tabNavigation}>
          <button 
            className={activeTab === 'overview' ? styles.activeTab : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'charities' ? styles.activeTab : ''}
            onClick={() => setActiveTab('charities')}
          >
            Charities Following ({charityPortfolio?.length || 0})
          </button>
          <button 
            className={activeTab === 'badges' ? styles.activeTab : ''}
            onClick={() => setActiveTab('badges')}
          >
            Badges ({safeUser.badges?.length || 0})
          </button>
          <button 
            className={activeTab === 'activity' ? styles.activeTab : ''}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewSection}>
              <div className={styles.achievementsGrid}>
                <div className={styles.achievement}>
                  <FaMedal className={styles.achievementIcon} />
                  <div>
                    <h4>Top Supporter</h4>
                    <p>Ranked in top 10% of donors</p>
                  </div>
                </div>
                {safeStats.matchesReceived > 0 && (
                  <div className={styles.achievement}>
                    <FaHeart className={styles.achievementIcon} />
                    <div>
                      <h4>Matched Donations</h4>
                      <p>{safeStats.matchesReceived} matches received</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'charities' && (
            <div className={styles.charitiesSection}>
              {charityPortfolio && charityPortfolio.length > 0 ? (
                <div className={styles.charityGrid}>
                  {charityPortfolio.map((charity) => (
                    <div key={charity.id} className={styles.charityCard}>
                      {charity.logo && (
                        <img src={charity.logo} alt={charity.name} className={styles.charityLogo} />
                      )}
                      <h4>{charity.name}</h4>
                      <p>{charity.category}</p>
                      <button 
                        onClick={() => navigate(`/charity/${charity.abn || charity.ABN}`)}
                        className={styles.viewCharityBtn}
                      >
                        View Charity
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No charities displayed publicly</p>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className={styles.badgesSection}>
              {safeUser.badges && safeUser.badges.length > 0 ? (
                <div className={styles.badgeGrid}>
                  {safeUser.badges.map((badge) => {
                    const badgeConfig = badgeIcons[badge.name] || badgeIcons[badge.title] || { icon: FaTrophy, color: '#FFD700' };
                    const BadgeIcon = badgeConfig.icon;
                    return (
                      <div key={badge.id || badge.name} className={styles.badgeCard}>
                        <div className={styles.badgeIcon}>
                          <BadgeIcon size={30} color={badgeConfig.color} />
                        </div>
                        <h4>{badge.name || badge.title}</h4>
                        <p>{badge.description}</p>
                        <span className={styles.badgeDate}>
                          Earned {badge.earnedDate ? format(new Date(badge.earnedDate), 'MMM d, yyyy') : 'recently'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.emptyState}>No badges earned yet</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className={styles.activitySection}>
              {recentActivity && recentActivity.length > 0 ? (
                <div className={styles.activityFeed}>
                  {recentActivity.map((item, index) => (
                    <div key={index} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {item.type === 'donation' && <FaHeart />}
                        {item.type === 'badge' && <FaMedal />}
                        {item.type === 'milestone' && <FaTrophy />}
                      </div>
                      <div className={styles.activityContent}>
                        <p>{item.description}</p>
                        <span className={styles.activityDate}>
                          {item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No public activity to display</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicUserProfile;