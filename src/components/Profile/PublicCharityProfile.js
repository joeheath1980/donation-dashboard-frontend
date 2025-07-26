import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FaHeart, 
  FaDollarSign,
  FaUsers,
  FaCalendar,
  FaShare,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
  FaGlobeAfrica,
  FaStar,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaExternalLinkAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { format } from 'date-fns';
import styles from './PublicCharityProfile.module.css';
import profileService from '../../services/profile.service';
import LoadingSpinner from '../Common/LoadingSpinner';
import DonationModal from '../DonationModal';

const PublicCharityProfile = () => {
  const { abn } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [abn]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getCharityPublicProfile(abn);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = profileService.generateProfileUrl('charity', abn);
    const charity = profile?.normalizedCharity || profile?.charity;
    const text = `Support ${charity?.name || 'this charity'} on Do-Nation!`;

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
        <h2>Charity Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/charities')}>Browse Charities</button>
      </div>
    );
  }

  // Use normalizedCharity if available, fallback to charity
  const charity = profile?.normalizedCharity || profile?.charity;
  const { stats, campaigns, supporters, ratings } = profile || {};
  
  // Ensure charity exists before rendering
  if (!charity) {
    return (
      <div className={styles.errorContainer}>
        <h2>Charity Data Not Available</h2>
        <p>Unable to load charity information. Please try again later.</p>
        <button onClick={() => navigate('/charities')}>Browse Charities</button>
      </div>
    );
  }
  
  const metaTags = profileService.generateMetaTags(charity, 'charity');
  const structuredData = profileService.generateStructuredData(charity, 'charity');

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
            <div className={styles.charityInfo}>
              <div className={styles.logo}>
                {charity?.logo ? (
                  <img src={charity.logo} alt={charity?.name || 'Charity'} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <FaHeart />
                  </div>
                )}
              </div>
              <div className={styles.charityDetails}>
                <h1>{charity?.name || 'Unknown Charity'}</h1>
                <p className={styles.category}>{charity?.category || 'Uncategorized'}</p>
                <div className={styles.abn}>
                  ABN: {charity?.abn || 'N/A'}
                  {charity?.dgrStatus && (
                    <span className={styles.dgrBadge}>
                      <FaCheckCircle /> DGR Registered
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button 
                className={styles.donateButton}
                onClick={() => setShowDonationModal(true)}
              >
                <FaHeart /> Donate Now
              </button>
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
          </div>

          {charity.description && (
            <div className={styles.description}>
              <p>{charity.description}</p>
            </div>
          )}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FaDollarSign className={styles.statIcon} />
            <div className={styles.statValue}>
              ${stats.totalRaised?.toLocaleString() || 0}
            </div>
            <div className={styles.statLabel}>Total Raised</div>
          </div>

          <div className={styles.statCard}>
            <FaUsers className={styles.statIcon} />
            <div className={styles.statValue}>
              {stats.donorCount?.toLocaleString() || 0}
            </div>
            <div className={styles.statLabel}>Supporters</div>
          </div>

          <div className={styles.statCard}>
            <FaHeart className={styles.statIcon} />
            <div className={styles.statValue}>
              {stats.donationCount?.toLocaleString() || 0}
            </div>
            <div className={styles.statLabel}>Donations</div>
          </div>

          <div className={styles.statCard}>
            <FaStar className={styles.statIcon} />
            <div className={styles.statValue}>
              {ratings?.averageRating || 'N/A'}
            </div>
            <div className={styles.statLabel}>Rating</div>
          </div>
        </div>

        {charity.impactStatement && (
          <div className={styles.impactStatement}>
            <h3>Our Impact</h3>
            <p>"{charity.impactStatement}"</p>
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
            className={activeTab === 'campaigns' ? styles.activeTab : ''}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns ({campaigns?.length || 0})
          </button>
          <button 
            className={activeTab === 'supporters' ? styles.activeTab : ''}
            onClick={() => setActiveTab('supporters')}
          >
            Top Supporters
          </button>
          <button 
            className={activeTab === 'impact' ? styles.activeTab : ''}
            onClick={() => setActiveTab('impact')}
          >
            Impact & Ratings
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewSection}>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h4>Mission</h4>
                  <p>{charity.mission || 'Working to make a positive impact in our community.'}</p>
                </div>

                {charity.programs && charity.programs.length > 0 && (
                  <div className={styles.infoCard}>
                    <h4>Key Programs</h4>
                    <ul className={styles.programList}>
                      {charity.programs.map((program, index) => (
                        <li key={index}>{program}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.infoCard}>
                  <h4>Contact Information</h4>
                  <div className={styles.contactInfo}>
                    {charity.address && (
                      <div className={styles.contactItem}>
                        <FaMapMarkerAlt />
                        <span>{charity.address.street}, {charity.address.city}, {charity.address.state} {charity.address.postcode}</span>
                      </div>
                    )}
                    {charity.email && (
                      <div className={styles.contactItem}>
                        <FaEnvelope />
                        <a href={`mailto:${charity.email}`}>{charity.email}</a>
                      </div>
                    )}
                    {charity.phone && (
                      <div className={styles.contactItem}>
                        <FaPhone />
                        <span>{charity.phone}</span>
                      </div>
                    )}
                    {charity.website && (
                      <div className={styles.contactItem}>
                        <FaExternalLinkAlt />
                        <a href={charity.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className={styles.campaignsSection}>
              {campaigns && campaigns.length > 0 ? (
                <div className={styles.campaignGrid}>
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className={styles.campaignCard}>
                      {campaign.image && (
                        <img src={campaign.image} alt={campaign.title} className={styles.campaignImage} />
                      )}
                      <div className={styles.campaignContent}>
                        <h4>{campaign.title}</h4>
                        <p>{campaign.description}</p>
                        <div className={styles.campaignProgress}>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill}
                              style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                            />
                          </div>
                          <div className={styles.progressStats}>
                            <span>${campaign.raised?.toLocaleString()} raised</span>
                            <span>${campaign.goal?.toLocaleString()} goal</span>
                          </div>
                        </div>
                        <button 
                          className={styles.campaignDonateBtn}
                          onClick={() => setShowDonationModal(true)}
                        >
                          Support This Campaign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No active campaigns</p>
              )}
            </div>
          )}

          {activeTab === 'supporters' && (
            <div className={styles.supportersSection}>
              {supporters && supporters.businesses && supporters.businesses.length > 0 && (
                <div className={styles.supporterGroup}>
                  <h4>Business Partners</h4>
                  <div className={styles.businessGrid}>
                    {supporters.businesses.map((business) => (
                      <div key={business.id} className={styles.businessCard}>
                        {business.logo && (
                          <img src={business.logo} alt={business.name} className={styles.businessLogo} />
                        )}
                        <h5>{business.name}</h5>
                        <p className={styles.matchAmount}>
                          ${business.totalMatched?.toLocaleString()} matched
                        </p>
                        <button 
                          onClick={() => navigate(`/business/${business.slug}`)}
                          className={styles.viewBusinessBtn}
                        >
                          View Partner
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {supporters && supporters.topDonors && supporters.topDonors.length > 0 && (
                <div className={styles.supporterGroup}>
                  <h4>Top Supporters</h4>
                  <div className={styles.donorList}>
                    {supporters.topDonors.map((donor, index) => (
                      <div key={index} className={styles.donorItem}>
                        <span className={styles.donorRank}>#{index + 1}</span>
                        <span className={styles.donorName}>
                          {donor.anonymous ? 'Anonymous' : donor.name}
                        </span>
                        <span className={styles.donorTier}>
                          {donor.tier} Tier
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'impact' && (
            <div className={styles.impactSection}>
              {ratings && ratings.sources && ratings.sources.length > 0 && (
                <div className={styles.ratingsCard}>
                  <h4>Independent Ratings</h4>
                  <div className={styles.ratingsList}>
                    {ratings.sources.map((rating, index) => (
                      <div key={index} className={styles.ratingItem}>
                        <div className={styles.ratingSource}>
                          <h5>{rating.source}</h5>
                          <div className={styles.ratingStars}>
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i}
                                className={i < rating.score ? styles.starFilled : styles.starEmpty}
                              />
                            ))}
                          </div>
                        </div>
                        {rating.comment && <p>{rating.comment}</p>}
                        {rating.link && (
                          <a href={rating.link} target="_blank" rel="noopener noreferrer">
                            View Full Rating <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {charity.impactMetrics && (
                <div className={styles.metricsCard}>
                  <h4>Impact Metrics</h4>
                  <div className={styles.metricsGrid}>
                    {Object.entries(charity.impactMetrics).map(([key, value]) => (
                      <div key={key} className={styles.metricItem}>
                        <div className={styles.metricValue}>{value}</div>
                        <div className={styles.metricLabel}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {charity.annualReport && (
                <div className={styles.reportCard}>
                  <h4>Annual Report</h4>
                  <p>View our latest annual report for detailed financial information and impact metrics.</p>
                  <a 
                    href={charity.annualReport} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.reportLink}
                  >
                    Download Annual Report <FaExternalLinkAlt />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDonationModal && (
        <DonationModal
          charity={charity}
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
        />
      )}
    </>
  );
};

export default PublicCharityProfile;