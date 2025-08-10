import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FaBuilding, 
  FaHandHoldingHeart,
  FaDollarSign,
  FaUsers,
  FaCalendar,
  FaShare,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
  FaChartLine,
  FaTrophy,
  FaGlobeAfrica
} from 'react-icons/fa';
import { format } from 'date-fns';
import styles from './PublicBusinessProfile.module.css';
import profileService from '../../services/profile.service';
import LoadingSpinner from '../Common/LoadingSpinner';

// Import new components
import BusinessImpactScore from './components/BusinessImpactScore';
import CSRInsights from './components/CSRInsights';
import LiveActivityFeed from './components/LiveActivityFeed';
import PerformanceMetrics from './components/PerformanceMetrics';

const PublicBusinessProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getBusinessPublicProfile(slug);
      // Handle the API response structure
      if (data && data.profile) {
        setProfile(data.profile);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = profileService.generateProfileUrl('business', slug);
    const businessName = profile?.business?.name || 'this business';
    const text = `Check out ${businessName}'s impact on Do-Nation!`;

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
        <h2>Business Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/businesses')}>Browse Businesses</button>
      </div>
    );
  }

  const { business, stats, campaigns, charities } = profile || {};
  
  // Ensure business data exists
  if (!business) {
    return (
      <div className={styles.errorContainer}>
        <h2>Business Profile Not Available</h2>
        <p>Unable to load business information. Please try again later.</p>
        <button onClick={() => navigate('/businesses')}>Browse Businesses</button>
      </div>
    );
  }
  
  const metaTags = profileService.generateMetaTags(business, 'business');
  const structuredData = profileService.generateStructuredData(business, 'business');

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
            <div className={styles.businessInfo}>
              <div className={styles.logo}>
                {business?.logo ? (
                  <img src={business.logo} alt={business?.name || 'Business'} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <FaBuilding />
                  </div>
                )}
              </div>
              <div className={styles.businessDetails}>
                <h1>{business?.name || 'Business Name'}</h1>
                <p className={styles.industry}>{business?.industry || 'Industry'}</p>
                <div className={styles.joinDate}>
                  <FaCalendar />
                  Partner since {business?.joinDate ? format(new Date(business.joinDate), 'MMMM yyyy') : 'N/A'}
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

          {business?.description && (
            <div className={styles.description}>
              <p>{business.description}</p>
            </div>
          )}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FaDollarSign className={styles.statIcon} />
            <div className={styles.statValue}>
              ${stats?.totalMatched?.toLocaleString() || 0}
            </div>
            <div className={styles.statLabel}>Total Matched</div>
          </div>

          <div className={styles.statCard}>
            <FaHandHoldingHeart className={styles.statIcon} />
            <div className={styles.statValue}>
              {stats?.matchesGiven?.toLocaleString() || 0}
            </div>
            <div className={styles.statLabel}>Donations Matched</div>
          </div>

          <div className={styles.statCard}>
            <FaGlobeAfrica className={styles.statIcon} />
            <div className={styles.statValue}>
              {stats?.charitiesSupported || 0}
            </div>
            <div className={styles.statLabel}>Charities Supported</div>
          </div>

          <div className={styles.statCard}>
            <FaUsers className={styles.statIcon} />
            <div className={styles.statValue}>
              {stats?.uniqueDonors || 0}
            </div>
            <div className={styles.statLabel}>Unique Donors</div>
          </div>
        </div>

        {business?.impactStatement && (
          <div className={styles.impactStatement}>
            <h3>Our Impact Commitment</h3>
            <p>"{business.impactStatement}"</p>
          </div>
        )}

        {/* New components section */}
        <div className={styles.enhancedMetrics}>
          <div className={styles.metricsGrid}>
            <BusinessImpactScore businessSlug={slug} initialScore={stats?.impactScore || 85} />
            <LiveActivityFeed businessSlug={slug} />
          </div>
          
          <div className={styles.insightsSection}>
            <CSRInsights businessSlug={slug} />
            <PerformanceMetrics businessSlug={slug} />
          </div>
        </div>

        <div className={styles.tabNavigation}>
          <button 
            className={activeTab === 'overview' ? styles.activeTab : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'campaigns' ? styles.activeTab : ''}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns ({campaigns?.length || 0})
          </button>
          <button 
            className={activeTab === 'charities' ? styles.activeTab : ''}
            onClick={() => setActiveTab('charities')}
          >
            Supported Charities ({charities?.length || 0})
          </button>
          <button 
            className={activeTab === 'impact' ? styles.activeTab : ''}
            onClick={() => setActiveTab('impact')}
          >
            Impact Report
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewSection}>
              <div className={styles.highlightsGrid}>
                <div className={styles.highlight}>
                  <FaTrophy className={styles.highlightIcon} />
                  <div>
                    <h4>Top Matching Partner</h4>
                    <p>Ranked in top 20% of business partners</p>
                  </div>
                </div>
                {stats?.averageMatchRate && (
                  <div className={styles.highlight}>
                    <FaChartLine className={styles.highlightIcon} />
                    <div>
                      <h4>Average Match Rate</h4>
                      <p>{stats.averageMatchRate}x multiplier</p>
                    </div>
                  </div>
                )}
              </div>

              {business?.csrInfo && (
                <div className={styles.csrSection}>
                  <h3>Corporate Social Responsibility</h3>
                  <p>{business.csrInfo}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className={styles.campaignsSection}>
              {campaigns && campaigns.length > 0 ? (
                <div className={styles.campaignList}>
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className={styles.campaignCard}>
                      <div className={styles.campaignHeader}>
                        <h4>{campaign.name}</h4>
                        <span className={`${styles.campaignStatus} ${styles[campaign.status]}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className={styles.campaignDescription}>{campaign.description}</p>
                      <div className={styles.campaignStats}>
                        <div>
                          <strong>${campaign.totalMatched?.toLocaleString()}</strong>
                          <span>Matched</span>
                        </div>
                        <div>
                          <strong>{campaign.matchRate}x</strong>
                          <span>Match Rate</span>
                        </div>
                        <div>
                          <strong>{campaign.participantCount}</strong>
                          <span>Participants</span>
                        </div>
                      </div>
                      {campaign.targetingCriteria && (
                        <div className={styles.targetingInfo}>
                          <span>Targeting: {campaign.targetingCriteria}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No active campaigns</p>
              )}
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
                      <p className={styles.charityCategory}>{charity.category}</p>
                      <div className={styles.charityStats}>
                        <span>${charity.amountMatched?.toLocaleString()} matched</span>
                      </div>
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
                <p className={styles.emptyState}>No charities supported yet</p>
              )}
            </div>
          )}

          {activeTab === 'impact' && (
            <div className={styles.impactSection}>
              <div className={styles.impactGrid}>
                <div className={styles.impactCard}>
                  <h4>Monthly Impact</h4>
                  <div className={styles.impactChart}>
                    {/* Placeholder for chart */}
                    <p>Impact visualization coming soon</p>
                  </div>
                </div>
                
                <div className={styles.impactCard}>
                  <h4>Category Breakdown</h4>
                  <div className={styles.categoryList}>
                    {stats?.categoryBreakdown?.map((category, index) => (
                      <div key={index} className={styles.categoryItem}>
                        <span>{category.name}</span>
                        <div className={styles.categoryBar}>
                          <div 
                            className={styles.categoryFill}
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                        <span>{category.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {business?.sustainabilityReport && (
                <div className={styles.sustainabilitySection}>
                  <h4>Sustainability & Impact Report</h4>
                  <p>{business.sustainabilityReport}</p>
                  {business?.reportUrl && (
                    <a 
                      href={business.reportUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.reportLink}
                    >
                      Download Full Report
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicBusinessProfile;