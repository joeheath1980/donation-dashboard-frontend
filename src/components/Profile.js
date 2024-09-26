import React, { useContext, useState, useEffect, useCallback } from 'react';
import styles from './Profile.module.css';
import PersonalImpactScore from './PersonalImpactScore';
import ImpactVisualization from './ImpactVisualization';
import CarouselComponent from './CarouselComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import DonationsComponent from './DonationsComponent';
import OneOffContributionsComponent from './OneOffContributionsComponent';
import VolunteerActivitiesComponent from './VolunteerActivitiesComponent';
import FundraisingCampaignsComponent from './FundraisingCampaignsComponent';
import ImpactScoreExplain from './ImpactScoreExplain';
import TierProgressModal from './TierProgressModal';
import FollowedCharitiesComponent from './FollowedCharitiesComponent';
import GlobalGivingProjects from './GlobalGivingProjects';
import { FaRegHandshake, FaRegCalendarAlt } from 'react-icons/fa';

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
  } = useContext(ImpactContext);

  const [localDonations, setLocalDonations] = useState(contextDonations || []);
  const [localOneOffContributions, setLocalOneOffContributions] = useState(contextOneOffContributions || []);
  const [showRegularContributions, setShowRegularContributions] = useState(false);
  const [showOneOffContributions, setShowOneOffContributions] = useState(false);
  const [showFullImpactReport, setShowFullImpactReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTierProgressModal, setShowTierProgressModal] = useState(false);

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
  const toggleFullImpactReport = () => setShowFullImpactReport(!showFullImpactReport);
  const toggleTierProgressModal = () => setShowTierProgressModal(!showTierProgressModal);

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

  const matchingOpportunities = [
    { 
      title: "Double Your Impact with TechCorp", 
      description: "TechCorp is matching donations up to $10,000 for STEM education programs. Donate now to double your contribution!", 
      amount: 10000,
      endDate: "2023-12-31",
      link: "#" 
    },
    { 
      title: "GreenEarth Foundation 2x Match", 
      description: "Help us combat climate change. All donations to GreenEarth Foundation are being matched 2:1 this month.", 
      amount: 5000,
      endDate: "2023-11-30",
      link: "#" 
    },
    { 
      title: "Healthcare Heroes Support", 
      description: "Your donation to support healthcare workers will be matched 100% by MediCare Inc. Let's show our appreciation!", 
      amount: 7500,
      endDate: "2023-12-15",
      link: "#" 
    },
    { 
      title: "Education for All: 3x Match", 
      description: "Triple your impact! Every dollar donated to our Education for All program will be matched 3:1 by an anonymous donor.", 
      amount: 15000,
      endDate: "2024-01-31",
      link: "#" 
    },
    { 
      title: "Animal Shelter Emergency Fund", 
      description: "Help us reach our goal of $50,000 for emergency animal care. PetLove Co. will match every donation.", 
      amount: 50000,
      endDate: "2023-12-31",
      link: "#" 
    }
  ];

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
          onFullReportClick={toggleFullImpactReport}
          onSeeProgressClick={toggleTierProgressModal}
        />
        {showFullImpactReport && <ImpactScoreExplain onClose={toggleFullImpactReport} />}
        
        <ImpactVisualization />
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Matching Opportunities</h2>
          <CarouselComponent 
            items={matchingOpportunities.map(opp => ({
              title: opp.title,
              description: `${opp.description} Amount: $${opp.amount.toLocaleString()}. Valid until: ${new Date(opp.endDate).toLocaleDateString()}`,
              link: opp.link
            }))}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Projects to Support</h2>
          <GlobalGivingProjects />
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
              {showRegularContributions ? "Hide" : "See more"}
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
              {showOneOffContributions ? "Hide" : "See more"}
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

        {showTierProgressModal && (
          <TierProgressModal
            currentTier={tier}
            impactScore={impactScore}
            onClose={toggleTierProgressModal}
          />
        )}
      </div>
    </div>
  );
}

export default Profile;
