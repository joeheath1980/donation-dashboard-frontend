import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Profile.module.css';
import './SharedStyles.css';
import PersonalImpactScore from './PersonalImpactScore';
import ScrollableImpactSection from './ScrollableImpactSection';
import CarouselComponent from './CarouselComponent';
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
  FaBolt
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

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

  const { getAuthHeaders } = useAuth();
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

  const impactSections = [
    { title: 'Impact Journey', component: 'ImpactVisualization' },
    { title: 'Impact Score Breakdown', component: 'ImpactScoreExplain' },
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
      const headers = getAuthHeaders();
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/matchingOpportunities`, { headers });
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
      const headers = getAuthHeaders();
      await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/matchingOpportunities/${opportunityId}/accept`, {}, { headers });
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

  if (isLoading) return <div className="textCenter">Loading your impact data...</div>;
  if (impactError) return <div className="textCenter">{impactError}</div>;
  if (!isAuthenticated) return <div className="textCenter">Please log in to view your profile and impact data.</div>;

  return (
    <div className={styles.profileBackground}>
      <div className={styles.profileContainer}>
        <PersonalImpactScore
          impactScore={impactScore}
          scoreChange={scoreChange}
          arrow={arrow}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
        />
        
        <ScrollableImpactSection 
          impactScore={impactScore}
          scoreDetails={scoreDetails}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
          activeSection={activeImpactSection}
          setActiveSection={setActiveImpactSection}
          totalSections={impactSections.length}
          sectionTitles={impactSections.map(section => section.title)}
        />
        
        <section className={styles.section}>
          <SectionTitle icon={FaHandshake} title="Matching Opportunities" />
          <p className={styles.sectionSubtitle}>Partner with brands to help boost your contributions and impact to the charities or cause areas you care about</p>
          
          {!showMatchingFeed ? (
            <div className={styles.matchingOpportunitiesPreview}>
              <button 
                className={styles.exploreMatchesButton}
                onClick={() => setShowMatchingFeed(true)}
              >
                <FaBolt className={styles.buttonIcon} />
                Explore Active Matches
              </button>
              <p className={styles.matchesAvailable}>
                {matchingOpportunities.length > 0 
                  ? `${matchingOpportunities.length} active matching opportunities available!`
                  : 'Check for new matching opportunities'
                }
              </p>
            </div>
          ) : (
            <div className={styles.matchingFeedContainer}>
              <button 
                className={styles.closeMatchingButton}
                onClick={() => setShowMatchingFeed(false)}
              >
                <FaTimes /> Close
              </button>
              <MatchOpportunityFeed 
                onSelectOpportunity={handleSelectOpportunity}
              />
            </div>
          )}
        </section>

        <section className={styles.section}>
          <SectionTitle icon={FaProjectDiagram} title="Projects to Support" />
          <p className={styles.sectionSubtitle}>Discover new charities and their projects, which have been carefully selected to align with your existing areas of support</p>
          <GlobalGivingProjects />
        </section>
        
        <section className={`${styles.section} ${styles.impactSection}`}>
          <SectionTitle icon={FaChartLine} title="Your Impact" />
          <p className={styles.sectionSubtitle}>Stay updated on your charitable activities and interests. Explore ways to enhance your impact and make a greater difference in the causes you care about.</p>
          
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
              <div className={`${styles.donationCard} card`}>
                <h3 className={`${styles.cardTitle} cardTitle`}>
                  <FaRegHandshake className={styles.icon} /> Regular Donations
                </h3>
                <ul className={styles.list}>
                  {getUniqueCharities().map((charity, index) => (
                    <li key={index} className={styles.listItem}>{charity}</li>
                  ))}
                </ul>
                <button className={`${styles.actionButton} button`} onClick={toggleRegularContributions}>
                  {showRegularContributions ? "Hide" : "See All"} <FaChevronRight className={styles.buttonIcon} />
                </button>
                {showRegularContributions && (
                  <div className={styles.expandedContent}>
                    <DonationsComponent displayAll={true} />
                  </div>
                )}
              </div>
              
              <div className={`${styles.donationCard} card`}>
                <h3 className={`${styles.cardTitle} cardTitle`}>
                  <FaRegCalendarAlt className={styles.icon} /> Recent One-off Donations
                </h3>
                <ul className={styles.list}>
                  {getRecentOneOffDonations().map((donation, index) => (
                    <li key={index} className={styles.listItem}>{donation.charity}: ${donation.amount}</li>
                  ))}
                </ul>
                <button className={`${styles.actionButton} button`} onClick={toggleOneOffContributions}>
                  {showOneOffContributions ? "Hide" : "See All"} <FaChevronRight className={styles.buttonIcon} />
                </button>
                {showOneOffContributions && (
                  <div className={styles.expandedContent}>
                    <OneOffContributionsComponent displayAll={true} />
                  </div>
                )}
              </div>
              
              <div className={`${styles.donationCard} card`}>
                <h3 className={`${styles.cardTitle} cardTitle`}>
                  <FaRegHeart className={styles.icon} /> Charities Following
                </h3>
                <ul className={styles.list}>
                  {getDisplayedFollowedCharities().map((charity, index) => (
                    <li key={charity.ABN || `empty-${index}`} className={styles.listItem}>
                      <span>{charity.name || 'Unknown Charity'}</span>
                      <button
                        onClick={() => handleUnfollowCharity(charity.ABN)}
                        className={`${styles.deleteButton} iconButton`}
                        aria-label="Unfollow Charity"
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
                {localFollowedCharities.length > 3 && (
                  <button className={`${styles.actionButton} button`} onClick={toggleFollowedCharities}>
                    {showAllFollowedCharities ? "Hide" : "See All"} <FaChevronRight className={styles.buttonIcon} />
                  </button>
                )}
                <Link to="/search-charities" className={`${styles.followNewButton} button ${styles.fullWidth}`}>
                  <FaPlus /> Follow New Charity
                </Link>
              </div>
            </div>

            <div className={styles.activitiesGrid}>
              <div className={`${styles.activityCard} card`}>
                <VolunteerActivitiesComponent />
              </div>
              <div className={`${styles.activityCard} card`}>
                <FundraisingCampaignsComponent onCompleteCampaign={handleCompleteCampaign} />
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
    </div>
  );
}

export default Profile;