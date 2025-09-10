import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api.service';
import styles from './Profile.module.css';
import './SharedStyles.css';
import PersonalImpactScore from './PersonalImpactScore';
import ScrollableImpactSection from './ScrollableImpactSection';
import CarouselComponent from './CarouselComponent';
import SectionHeader from './Common/SectionHeader';
import { ImpactContext } from '../contexts/ImpactContext';
import { useAuth } from '../contexts/AuthContext';
import DonationsComponent from './DonationsComponent';
import OneOffContributionsComponent from './OneOffContributionsComponent';
import VolunteerActivitiesComponent from './VolunteerActivitiesComponent';
import FundraisingCampaignsComponent from './FundraisingCampaignsComponent';
import GlobalGivingProjects from './GlobalGivingProjects';
import MatchOpportunityFeed from './matching/MatchOpportunityFeed';
import MatchSuccessModal from './matching/MatchSuccessModal';
import MatchingDetailModal from './matching/MatchingDetailModal';
import ContributionSelectionModal from './ContributionSelectionModal';
import { 
  FaRegHandshake, 
  FaRegCalendarAlt, 
  FaChevronRight, 
  FaRegHeart, 
  FaTimes, 
  FaPlus,
  FaHandshake,
  FaProjectDiagram,
  FaChartLine,
  FaBolt,
  FaUserCircle,
  FaLightbulb,
  FaTags,
  FaHeart,
  FaBullseye,
  FaInfoCircle
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api.config';

const SectionTitle = ({ icon: Icon, title }) => (
  <div className={styles.sectionHeader}>
    <h2 className={`${styles.sectionTitle} gradientTitle`}>
      <Icon className={styles.sectionIcon} /> {title}
    </h2>
    <div className={styles.sectionTitleUnderline}></div>
  </div>
);

function Profile() {
  const { 
    donations: contextDonations, 
    oneOffContributions: contextOneOffContributions,
    setOneOffContributions: contextSetOneOffContributions,
    volunteerActivities,
    fundraisingCampaigns,
    followedCharities: contextFollowedCharities,
    removeFollowedCharity,
    impactScore,
    lastYearImpactScore,
    tier,
    pointsToNextTier,
    fetchImpactData,
    error: impactError,
    isAuthenticated,
    scoreDetails,
  } = useContext(ImpactContext);

  const { getAuthHeaders, user } = useAuth();
  const navigate = useNavigate();

  const [localDonations, setLocalDonations] = useState(contextDonations || []);
  const [localOneOffContributions, setLocalOneOffContributions] = useState(contextOneOffContributions || []);
  const [localFollowedCharities, setLocalFollowedCharities] = useState(contextFollowedCharities || []);
  const [showRegularContributions, setShowRegularContributions] = useState(false);
  const [showOneOffContributions, setShowOneOffContributions] = useState(false);
  const [showAllFollowedCharities, setShowAllFollowedCharities] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [matchingOpportunities, setMatchingOpportunities] = useState([]);
  const [matchingOpportunitiesLoading, setMatchingOpportunitiesLoading] = useState(true);
  const [matchingOpportunitiesError, setMatchingOpportunitiesError] = useState(null);
  const [activeImpactSection, setActiveImpactSection] = useState(0);
  const [showMatchingFeed, setShowMatchingFeed] = useState(false);
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [matchSuccessData, setMatchSuccessData] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showMatchingDetail, setShowMatchingDetail] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showMatchingExplanation, setShowMatchingExplanation] = useState(false);
  
  // Refs for child components
  const regularDonationsRef = useRef();
  const oneOffContributionsRef = useRef();
  const volunteerActivitiesRef = useRef();
  const fundraisingCampaignsRef = useRef();

  const impactSections = [
    { title: 'Impact Journey', component: 'ImpactVisualization' },
    { title: 'Tier Progress', component: 'TierProgress' },
    { title: 'Your Badges', component: 'BadgesDisplay' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchImpactData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchImpactData, isAuthenticated]);

  useEffect(() => {
    if (contextDonations) setLocalDonations(contextDonations);
  }, [contextDonations]);

  useEffect(() => {
    if (contextOneOffContributions) setLocalOneOffContributions(contextOneOffContributions);
  }, [contextOneOffContributions]);

  useEffect(() => {
    if (contextFollowedCharities) setLocalFollowedCharities(contextFollowedCharities);
  }, [contextFollowedCharities]);

  const fetchMatchingOpportunities = useCallback(async () => {
    if (!isAuthenticated) {
      setMatchingOpportunitiesLoading(false);
      return;
    }
    
    setMatchingOpportunitiesLoading(true);
    setMatchingOpportunitiesError(null);
    
    try {
      const response = await apiClient.get(`/api/matching/opportunities`);
      setMatchingOpportunities(response.data);
    } catch (err) {
      console.error('Error fetching matching opportunities:', err);
      setMatchingOpportunitiesError(
        err.response?.data?.message || 
        'Unable to load matching opportunities. Please try again later.'
      );
    } finally {
      setMatchingOpportunitiesLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    fetchMatchingOpportunities();
  }, [fetchMatchingOpportunities]);

  const getUniqueCharities = useCallback(() => {
    const regularDonationCharities = localDonations.map(d => d.charity);
    return [...new Set(regularDonationCharities)].slice(0, 3);
  }, [localDonations]);

  const getRecentOneOffDonations = useCallback(() => {
    return localOneOffContributions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [localOneOffContributions]);

  const getDisplayedFollowedCharities = useCallback(() => {
    return showAllFollowedCharities ? localFollowedCharities : localFollowedCharities.slice(0, 3);
  }, [localFollowedCharities, showAllFollowedCharities]);

  const scoreChange = impactScore - lastYearImpactScore;
  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  const toggleRegularContributions = () => setShowRegularContributions(!showRegularContributions);
  const toggleOneOffContributions = () => setShowOneOffContributions(!showOneOffContributions);
  const toggleFollowedCharities = () => setShowAllFollowedCharities(!showAllFollowedCharities);

  const handleCompleteCampaign = useCallback((completedCampaign) => {
    try {
      if (typeof contextSetOneOffContributions === 'function') {
        contextSetOneOffContributions(prevContributions => [...prevContributions, completedCampaign]);
        setLocalOneOffContributions(prevContributions => [...prevContributions, completedCampaign]);
      } else {
        setLocalOneOffContributions(prevContributions => [...prevContributions, completedCampaign]);
      }
    } catch (error) {
      console.error('Error adding completed campaign to one-off contributions:', error);
      alert(`Failed to add completed campaign: ${error.message}`);
    }
  }, [contextSetOneOffContributions]);

  const handleMatch = async (opportunityId) => {
    try {
      await apiClient.post(`/api/matching/opportunities/${opportunityId}/accept`, {});
      setMatchingOpportunities(prevOpportunities =>
        prevOpportunities.map(opp =>
          opp._id === opportunityId ? { ...opp, accepted: true } : opp
        )
      );
    } catch (err) {
      console.error('Error accepting matching opportunity:', err);
      alert('Failed to accept the matching opportunity. Please try again.');
    }
  };

  const handleUnfollowCharity = async (charityABN) => {
    if (window.confirm('Are you sure you want to unfollow this charity?')) {
      try {
        await removeFollowedCharity(charityABN);
        setLocalFollowedCharities(prevCharities => prevCharities.filter(charity => charity.ABN !== charityABN));
      } catch (err) {
        console.error('Failed to remove the charity:', err);
        alert('Failed to unfollow the charity. Please try again.');
      }
    }
  };

  const handleSelectOpportunity = (opportunity) => {
    // Show the detail modal instead of navigating directly
    setSelectedOpportunity(opportunity);
    setShowMatchingDetail(true);
    setShowMatchingFeed(false);
  };

  const handleFindNextMatch = () => {
    setShowMatchSuccess(false);
    setMatchSuccessData(null);
    setShowMatchingFeed(true);
  };

  const handleAddContributions = () => {
    setShowContributionModal(true);
  };

  const handleContributionTypeSelect = (type) => {
    switch (type) {
      case 'oneoff':
        // First expand the one-off contributions section
        setShowOneOffContributions(true);
        // Then open the modal after a short delay to ensure component is mounted
        setTimeout(() => {
          if (oneOffContributionsRef.current) {
            oneOffContributionsRef.current.openModal();
          }
        }, 100);
        break;
      case 'regular':
        // First expand the regular donations section
        setShowRegularContributions(true);
        // Then open the modal after a short delay to ensure component is mounted
        setTimeout(() => {
          if (regularDonationsRef.current) {
            regularDonationsRef.current.openModal();
          }
        }, 100);
        break;
      case 'volunteer':
        if (volunteerActivitiesRef.current) {
          volunteerActivitiesRef.current.openModal();
        }
        break;
      case 'fundraising':
        if (fundraisingCampaignsRef.current) {
          fundraisingCampaignsRef.current.openModal();
        }
        break;
      default:
        break;
    }
    setShowContributionModal(false);
  };

  if (isLoading) return <div className="textCenter">Loading your impact data...</div>;
  if (impactError) return <div className="textCenter">{impactError}</div>;
  if (!isAuthenticated) return <div className="textCenter">Please log in to view your profile and impact data.</div>;

  return (
    <div className={styles.profileBackground}>
      <div className={styles.profileContainer}>
        <div className={styles.impactScoreWrapper}>
          <PersonalImpactScore
            impactScore={impactScore}
            scoreChange={scoreChange}
            arrow={arrow}
            tier={tier}
            pointsToNextTier={pointsToNextTier}
            onAddContributions={handleAddContributions}
            username={user?.username}
            userId={user?._id}
            userEmail={user?.email}
          />
        </div>
        
        <ScrollableImpactSection 
          impactScore={impactScore}
          scoreDetails={scoreDetails}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
          activeSection={activeImpactSection}
          setActiveSection={setActiveImpactSection}
          totalSections={impactSections.length}
          sectionTitles={impactSections.map(section => section.title)}
          useDarkNav={false}
        />
        
        <section className={`${styles.section} ${styles.matchingSection} ${styles.matchingBand} rimSlate`}>
          <SectionHeader
            eyebrow="Matched for you"
            title="Matching Opportunities"
            subhead="Partner with brands to help boost your contributions and impact to the charities or cause areas you care about."
            variant="dark"
            trim
            icon={<FaHandshake />}
            as="h2"
          />
          
          {/* Always show matching feed - removed conditional rendering */}
          <div className={styles.matchingFeedContainer}>
            <MatchOpportunityFeed 
              onSelectOpportunity={handleSelectOpportunity}
              autoShow={true}
            />
          </div>
        </section>

        <section className={`${styles.section} ${styles.projectsBand} rimSlate`}>
          <SectionHeader
            eyebrow="Matched for you"
            title="Projects to Support"
            subhead="Discover new charities and their projects, carefully selected to align with your existing areas of support."
            variant="dark"
            trim
            icon={<FaProjectDiagram />}
            as="h2"
          />
          <div className={styles.projectsHeader}>
            <Link to="/search-charities" className="btn-link tealUnderlineGlow">See all projects</Link>
          </div>
          
          {/* Project Matching Explanation - Collapsible */}
          <div className={styles.matchingExplanationWrapper}>
            <button 
              className={`${styles.toggleExplanationBtn} btn btn-ghost`}
              onClick={() => setShowMatchingExplanation(!showMatchingExplanation)}
            >
              <FaLightbulb className={styles.matchingIcon} />
              <span>How We Find Projects for You</span>
              <FaChevronRight className={`${styles.chevron} ${showMatchingExplanation ? styles.chevronOpen : ''}`} />
            </button>
            
            {showMatchingExplanation && (
              <div className={styles.matchingExplanation}>
                <div className={styles.matchingContent}>
              <p>Based on your contributions and interests, we're showing you projects that match:</p>
              <div className={styles.matchingFactors}>
                {(() => {
                  // Extract matching factors from user's data
                  const factors = [];
                  const charityTypes = new Set();
                  const charityNames = new Set();
                  const causeAreas = new Set();
                  
                  // Get unique charity types and names from donations
                  [...localDonations, ...localOneOffContributions].forEach(item => {
                    if (item.charityType) charityTypes.add(item.charityType);
                    if (item.charity) charityNames.add(item.charity);
                  });
                  
                  // Get organizations from volunteer activities
                  volunteerActivities.forEach(activity => {
                    if (activity.organization) charityNames.add(activity.organization);
                    if (activity.charityType) charityTypes.add(activity.charityType);
                  });
                  
                  // Get campaign themes
                  fundraisingCampaigns.forEach(campaign => {
                    if (campaign.title && campaign.title.toLowerCase().includes('education')) causeAreas.add('Education');
                    if (campaign.title && campaign.title.toLowerCase().includes('health')) causeAreas.add('Health');
                    if (campaign.title && campaign.title.toLowerCase().includes('environment')) causeAreas.add('Environment');
                    if (campaign.title && campaign.title.toLowerCase().includes('poverty')) causeAreas.add('Poverty Alleviation');
                  });
                  
                  // Add factors based on what we found
                  if (charityTypes.size > 0) {
                    factors.push({
                      icon: <FaTags />,
                      label: 'Charity Types',
                      items: Array.from(charityTypes).slice(0, 3)
                    });
                  }
                  
                  if (charityNames.size > 0) {
                    factors.push({
                      icon: <FaHeart />,
                      label: 'Organizations You Support',
                      items: Array.from(charityNames).slice(0, 3)
                    });
                  }
                  
                  if (causeAreas.size > 0) {
                    factors.push({
                      icon: <FaBullseye />,
                      label: 'Cause Areas',
                      items: Array.from(causeAreas)
                    });
                  }
                  
                  // If no factors, show a default message
                  if (factors.length === 0) {
                    return (
                      <div className={styles.noFactors}>
                        <p>Start making contributions to see personalized project recommendations based on your giving patterns and interests.</p>
                      </div>
                    );
                  }
                  
                  return factors.map((factor, index) => (
                    <div key={index} className={styles.matchingFactor}>
                      <div className={styles.factorHeader}>
                        {factor.icon}
                        <span className={styles.factorLabel}>{factor.label}:</span>
                      </div>
                      <div className={styles.factorItems}>
                        {factor.items.map((item, i) => (
                          <span key={i} className={styles.factorItem}>
                            {item}
                            {i < factor.items.length - 1 && ', '}
                          </span>
                        ))}
                        {factor.items.length >= 3 && <span className={styles.moreIndicator}> and more...</span>}
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className={styles.matchingNote}>
                <FaInfoCircle className={styles.noteIcon} />
                <span>Projects are ranked by relevance to your giving history and followed charities</span>
                </div>
              </div>
            </div>
            )}
          </div>
          
          {/* Add skip button on right side */}
          <div className={styles.projectsContainer}>
            <GlobalGivingProjects />
          </div>
        </section>
        
        <section className={`${styles.section} ${styles.impactSection} card`}>
          <SectionHeader
            eyebrow="Your impact"
            title="Your Impact"
            subhead="Stay updated on your charitable activities and interests. Explore ways to enhance your impact and make a greater difference in the causes you care about."
            variant="dark"
            trim
            icon={<FaChartLine />}
            as="h2"
          />
          
          {/* Total Impact Summary */}
          {(() => {
            const calculateTotalImpact = () => {
              let totalDonations = 0;
              let totalMatched = 0;
              
              // Calculate from regular donations
              localDonations.forEach(donation => {
                totalDonations += donation.amount || 0;
                if (donation.matches) {
                  donation.matches.forEach(match => {
                    totalMatched += match.matchAmount || 0;
                  });
                }
              });
              
              // Calculate from one-off contributions
              localOneOffContributions.forEach(contribution => {
                totalDonations += contribution.amount || 0;
                if (contribution.matches) {
                  contribution.matches.forEach(match => {
                    totalMatched += match.matchAmount || 0;
                  });
                }
              });
              
              return { totalDonations, totalMatched, totalImpact: totalDonations + totalMatched };
            };
            
            const { totalDonations, totalMatched, totalImpact } = calculateTotalImpact();
            
            return totalMatched > 0 ? (
              <div className={styles.totalImpactSummary}>
                <h3>🎯 Your Amplified Impact</h3>
                <div className={styles.impactBreakdown}>
                  <div className={styles.impactItem}>
                    <span className={styles.impactLabel}>Your Donations:</span>
                    <span className={styles.impactAmount}>${totalDonations.toFixed(2)}</span>
                  </div>
                  <div className={styles.impactItem}>
                    <span className={styles.impactLabel}>Business Matches:</span>
                    <span className={styles.matchAmount}>+${totalMatched.toFixed(2)}</span>
                  </div>
                  <div className={styles.impactDivider}></div>
                  <div className={styles.impactItem}>
                    <span className={styles.impactLabel}>Total Impact:</span>
                    <span className={styles.totalAmount}>${totalImpact.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
          
          <div className={styles.impactContent}>
            <div className={styles.donationsGrid}>
              <div className={`${styles.donationCard} card rimSlate`}>
                <h3 className={`${styles.cardTitle} cardTitle`}>
                  <FaRegHandshake className={styles.icon} /> Regular Donations
                </h3>
                <div className={styles.charityPills}>
                  {getUniqueCharities().map((charity, index) => (
                    <div key={index} className={styles.charityPill}>
                      <FaRegHeart className={styles.pillIcon} />
                      <span>{charity}</span>
                    </div>
                  ))}
                </div>
                {!showRegularContributions && (
                  <button type="button" className={`btn-link tealUnderlineGlow`} onClick={toggleRegularContributions}>
                    See All <FaChevronRight className={styles.buttonIcon} />
                  </button>
                )}
              </div>
              
              <div className={`${styles.donationCard} card rimSlate`}>
                <h3 className={`${styles.cardTitle} cardTitle`}>
                  <FaRegCalendarAlt className={styles.icon} /> Recent One-off Donations
                </h3>
                <div className={styles.charityPills}>
                  {getRecentOneOffDonations().map((donation, index) => (
                    <div key={index} className={styles.charityPill}>
                      <FaRegHeart className={styles.pillIcon} />
                      <span>{donation.charity}</span>
                      <span className={styles.pillAmount}>${donation.amount}</span>
                    </div>
                  ))}
                </div>
                {!showOneOffContributions && (
                  <button type="button" className={`btn-link tealUnderlineGlow`} onClick={toggleOneOffContributions}>
                    See All <FaChevronRight className={styles.buttonIcon} />
                  </button>
                )}
              </div>
              
              <div className={`${styles.donationCard} card rimSlate`}>
                <h3 className={`${styles.cardTitle} cardTitle`}>
                  <FaRegHeart className={styles.icon} /> Charities Following
                </h3>
                <div className={styles.charityPills}>
                  {getDisplayedFollowedCharities().map((charity, index) => (
                    <div key={charity.ABN || `empty-${index}`} className={`${styles.charityPill} ${styles.withDelete}`}>
                      <FaRegHeart className={styles.pillIcon} />
                      <span>{charity.name || 'Unknown Charity'}</span>
                      <button
                        onClick={() => handleUnfollowCharity(charity.ABN)}
                        className={styles.pillDeleteButton}
                        aria-label="Unfollow Charity"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
                {localFollowedCharities.length > 3 && (
                  <button type="button" className={`btn-link tealUnderlineGlow`} onClick={toggleFollowedCharities}>
                    {showAllFollowedCharities ? "Hide" : "See All"} <FaChevronRight className={styles.buttonIcon} />
                  </button>
                )}
                <Link to="/search-charities" className={`${styles.followNewButton} btn btn-primary ${styles.fullWidth}`}>
                  <FaPlus /> Follow New Charity
                </Link>
              </div>
            </div>

            {/* Expanded content sections */}
            {showRegularContributions && (
              <div className={styles.expandedSection}>
                <div className={styles.expandedHeader}>
                  <h3 className={styles.expandedTitle}>All Regular Donations</h3>
                  <button className={styles.hideButton} onClick={toggleRegularContributions}>
                    <FaTimes /> Hide
                  </button>
                </div>
                <DonationsComponent displayAll={true} ref={regularDonationsRef} />
              </div>
            )}
            
            {showOneOffContributions && (
              <div className={styles.expandedSection}>
                <div className={styles.expandedHeader}>
                  <h3 className={styles.expandedTitle}>All One-off Contributions</h3>
                  <button className={styles.hideButton} onClick={toggleOneOffContributions}>
                    <FaTimes /> Hide
                  </button>
                </div>
                <OneOffContributionsComponent displayAll={true} ref={oneOffContributionsRef} />
              </div>
            )}

            <div className={styles.activitiesGrid}>
              <div className={`${styles.activityCard} card rimSlate`}>
                <VolunteerActivitiesComponent ref={volunteerActivitiesRef} />
              </div>
              <div className={`${styles.activityCard} card rimSlate`}>
                <FundraisingCampaignsComponent onCompleteCampaign={handleCompleteCampaign} ref={fundraisingCampaignsRef} />
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Match Success Modal */}
      {showMatchSuccess && matchSuccessData && (
        <MatchSuccessModal
          donation={matchSuccessData.donation}
          matches={matchSuccessData.matches}
          onClose={() => {
            setShowMatchSuccess(false);
            setMatchSuccessData(null);
          }}
          onFindNext={handleFindNextMatch}
        />
      )}
      
      {/* Matching Detail Modal */}
      {showMatchingDetail && selectedOpportunity && (
        <MatchingDetailModal
          opportunity={selectedOpportunity}
          onClose={() => {
            setShowMatchingDetail(false);
            setSelectedOpportunity(null);
            setShowMatchingFeed(true);
          }}
          onConfirm={() => {
            setShowMatchingDetail(false);
            setSelectedOpportunity(null);
          }}
        />
      )}
      
      {/* Contribution Selection Modal */}
      <ContributionSelectionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSelectType={handleContributionTypeSelect}
      />
    </div>
  );
}

export default Profile;
