import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Profile.module.css';
import PersonalImpactScore from './PersonalImpactScore';
import ScrollableImpactSection from './ScrollableImpactSection';
import CarouselComponent from './CarouselComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import { useAuth } from '../contexts/AuthContext';
import DonationsComponent from './DonationsComponent';
import OneOffContributionsComponent from './OneOffContributionsComponent';
import VolunteerActivitiesComponent from './VolunteerActivitiesComponent';
import FundraisingCampaignsComponent from './FundraisingCampaignsComponent';
import FollowedCharitiesComponent from './FollowedCharitiesComponent';
import GlobalGivingProjects from './GlobalGivingProjects';
import { FaRegHandshake, FaRegCalendarAlt, FaChevronRight } from 'react-icons/fa';

function Profile() {
  const { 
    donations: contextDonations, 
    oneOffContributions: contextOneOffContributions,
    setOneOffContributions: contextSetOneOffContributions,
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

  const [localDonations, setLocalDonations] = useState(contextDonations || []);
  const [localOneOffContributions, setLocalOneOffContributions] = useState(contextOneOffContributions || []);
  const [showRegularContributions, setShowRegularContributions] = useState(false);
  const [showOneOffContributions, setShowOneOffContributions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [matchingOpportunities, setMatchingOpportunities] = useState([]);
  const [activeImpactSection, setActiveImpactSection] = useState(0);

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
    const fetchMatchingOpportunities = async () => {
      if (!isAuthenticated) return;
      
      try {
        const headers = getAuthHeaders();
        const response = await axios.get('http://localhost:3002/api/matchingOpportunities', { headers });
        setMatchingOpportunities(response.data);
      } catch (err) {
        console.error('Error fetching matching opportunities:', err);
      }
    };

    fetchMatchingOpportunities();
  }, [isAuthenticated, getAuthHeaders]);

  const getUniqueCharities = useCallback(() => {
    const regularDonationCharities = localDonations.map(d => d.charity);
    return [...new Set(regularDonationCharities)].slice(0, 3);
  }, [localDonations]);

  const getRecentOneOffDonations = useCallback(() => {
    return localOneOffContributions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [localOneOffContributions]);

  const scoreChange = impactScore - lastYearImpactScore;
  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  const toggleRegularContributions = () => setShowRegularContributions(!showRegularContributions);
  const toggleOneOffContributions = () => setShowOneOffContributions(!showOneOffContributions);

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
      await axios.post(`http://localhost:3002/api/matchingOpportunities/${opportunityId}/accept`, {}, { headers });
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

  if (isLoading) return <div className={styles.textCenter}>Loading your impact data...</div>;
  if (impactError) return <div className={styles.textCenter}>{impactError}</div>;
  if (!isAuthenticated) return <div className={styles.textCenter}>Please log in to view your profile and impact data.</div>;

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
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Matching Opportunities</h2>
            <div className={styles.sectionTitleUnderline}></div>
          </div>
          <p className={styles.sectionSubtitle}>Partner with brands to help boost your contributions and impact to the charities or cause areas you care about</p>
          <CarouselComponent 
            items={matchingOpportunities.map(opportunity => ({
              title: opportunity.message,
              charity: opportunity.charity,
              contribution: `$${opportunity.donationAmount}`,
              multiplier: '2x',
              validUntil: new Date(opportunity.endDate).toLocaleDateString(),
              id: opportunity._id,
              accepted: opportunity.accepted,
              onMatch: () => handleMatch(opportunity._id)
            }))}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Projects to Support</h2>
            <div className={styles.sectionTitleUnderline}></div>
          </div>
          <p className={styles.sectionSubtitle}>Discover new charities and their projects, which have been carefully selected to align with your existing areas of support</p>
          <GlobalGivingProjects />
        </section>
        
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Impact</h2>
            <div className={styles.sectionTitleUnderline}></div>
          </div>
          <p className={styles.sectionSubtitle}>Stay updated on your charitable activities and interests. Explore ways to enhance your impact and make a greater difference in the causes you care about.</p>
        </section>

        <div className={styles.donationsGrid}>
          <div className={styles.donationCard}>
            <h3 className={styles.cardTitle}>
              <FaRegHandshake className={styles.icon} /> Regular Donations
            </h3>
            <ul className={styles.list}>
              {getUniqueCharities().map((charity, index) => (
                <li key={index} className={styles.listItem}>{charity}</li>
              ))}
            </ul>
            <button className={styles.actionButton} onClick={toggleRegularContributions}>
              {showRegularContributions ? "Hide" : "Find more"} <FaChevronRight className={styles.buttonIcon} />
            </button>
            {showRegularContributions && <DonationsComponent displayAll={true} />}
          </div>
          
          <div className={styles.donationCard}>
            <h3 className={styles.cardTitle}>
              <FaRegCalendarAlt className={styles.icon} /> Recent One-off Donations
            </h3>
            <ul className={styles.list}>
              {getRecentOneOffDonations().map((donation, index) => (
                <li key={index} className={styles.listItem}>{donation.charity}: ${donation.amount}</li>
              ))}
            </ul>
            <button className={styles.actionButton} onClick={toggleOneOffContributions}>
              {showOneOffContributions ? "Hide" : "Find more"} <FaChevronRight className={styles.buttonIcon} />
            </button>
            {showOneOffContributions && <OneOffContributionsComponent displayAll={true} />}
          </div>
          
          <FollowedCharitiesComponent />
        </div>

        <div className={styles.activitiesGrid}>
          <div className={styles.activityCard}>
            <VolunteerActivitiesComponent />
          </div>
          <div className={styles.activityCard}>
            <FundraisingCampaignsComponent onCompleteCampaign={handleCompleteCampaign} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
