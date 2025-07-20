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
  FaGlobeAfrica
} from 'react-icons/fa';
import { format } from 'date-fns';
import styles from './PublicUserProfile.module.css';
import profileService from '../../services/profile.service';
import LoadingSpinner from '../Common/LoadingSpinner';

const PublicUserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getUserPublicProfile(username);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = profileService.generateProfileUrl('user', username);
    const text = `Check out ${profile.user.displayName}'s giving profile on Do-Nation!`;

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

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Profile Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  const { user, stats, activity, charities } = profile;
  const metaTags = profileService.generateMetaTags(user, 'user');
  const structuredData = profileService.generateStructuredData(user, 'user');

  // Tier configurations
  const tierConfig = {
    Bronze: { color: '#CD7F32', icon: '🥉' },
    Silver: { color: '#C0C0C0', icon: '🥈' },
    Gold: { color: '#FFD700', icon: '🥇' },
    Platinum: { color: '#E5E4E2', icon: '💎' }
  };

  return (
    <>
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
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.userDetails}>
                <h1>{user.displayName}</h1>
                <p className={styles.username}>@{user.username}</p>
                <div className={styles.joinDate}>
                  <FaCalendar />
                  Member since {format(new Date(user.joinDate), 'MMMM yyyy')}
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

          <div className={styles.tierBadge} style={{ backgroundColor: tierConfig[user.tier].color }}>
            <span className={styles.tierIcon}>{tierConfig[user.tier].icon}</span>
            <span className={styles.tierName}>{user.tier} Tier</span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FaTrophy className={styles.statIcon} />
            <div className={styles.statValue}>
              {user.publicScore !== 'Private' ? (
                <>{user.publicScore.toLocaleString()} <span>points</span></>
              ) : (
                <FaLock className={styles.privateLock} />
              )}
            </div>
            <div className={styles.statLabel}>Impact Score</div>
          </div>

          {stats.totalDonations !== null && (
            <div className={styles.statCard}>
              <FaHeart className={styles.statIcon} />
              <div className={styles.statValue}>
                {stats.totalDonations} <span>donations</span>
              </div>
              <div className={styles.statLabel}>Total Donations</div>
            </div>
          )}

          <div className={styles.statCard}>
            <FaGlobeAfrica className={styles.statIcon} />
            <div className={styles.statValue}>
              {stats.charitiesSupported} <span>charities</span>
            </div>
            <div className={styles.statLabel}>Supported</div>
          </div>

          {stats.currentStreak > 0 && (
            <div className={styles.statCard}>
              <FaFire className={styles.statIcon} />
              <div className={styles.statValue}>
                {stats.currentStreak} <span>days</span>
              </div>
              <div className={styles.statLabel}>Current Streak</div>
            </div>
          )}
        </div>

        {user.impactStatement && (
          <div className={styles.impactStatement}>
            <h3>Impact Statement</h3>
            <p>"{user.impactStatement}"</p>
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
            Charities ({charities?.length || 0})
          </button>
          <button 
            className={activeTab === 'badges' ? styles.activeTab : ''}
            onClick={() => setActiveTab('badges')}
          >
            Badges ({user.badges?.length || 0})
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
                {stats.matchesReceived > 0 && (
                  <div className={styles.achievement}>
                    <FaHeart className={styles.achievementIcon} />
                    <div>
                      <h4>Matched Donations</h4>
                      <p>{stats.matchesReceived} matches received</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'charities' && (
            <div className={styles.charitiesSection}>
              {charities && charities.length > 0 ? (
                <div className={styles.charityGrid}>
                  {charities.map((charity) => (
                    <div key={charity.id} className={styles.charityCard}>
                      {charity.logo && (
                        <img src={charity.logo} alt={charity.name} className={styles.charityLogo} />
                      )}
                      <h4>{charity.name}</h4>
                      <p>{charity.category}</p>
                      <button 
                        onClick={() => navigate(`/charity/${charity.abn}`)}
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
              {user.badges && user.badges.length > 0 ? (
                <div className={styles.badgeGrid}>
                  {user.badges.map((badge) => (
                    <div key={badge.id} className={styles.badgeCard}>
                      <div className={styles.badgeIcon}>{badge.icon}</div>
                      <h4>{badge.name}</h4>
                      <p>{badge.description}</p>
                      <span className={styles.badgeDate}>
                        Earned {format(new Date(badge.earnedDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No badges earned yet</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className={styles.activitySection}>
              {activity && activity.length > 0 ? (
                <div className={styles.activityFeed}>
                  {activity.map((item, index) => (
                    <div key={index} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {item.type === 'donation' && <FaHeart />}
                        {item.type === 'badge' && <FaMedal />}
                        {item.type === 'milestone' && <FaTrophy />}
                      </div>
                      <div className={styles.activityContent}>
                        <p>{item.description}</p>
                        <span className={styles.activityDate}>
                          {format(new Date(item.date), 'MMM d, yyyy')}
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