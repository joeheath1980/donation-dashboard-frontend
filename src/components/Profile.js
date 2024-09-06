import React, { useContext, useState, useEffect, useCallback } from 'react';
import styles from '../Profile.module.css';
import PersonalImpactScore from './PersonalImpactScore';
import ImpactScoreExplain from './ImpactScoreExplain';
import VolunteerActivitiesComponent from './VolunteerActivitiesComponent';
import FundraisingCampaignsComponent from './FundraisingCampaignsComponent';
import ImpactVisualization from './ImpactVisualization';
import CarouselComponent from './CarouselComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import DonationsComponent from './DonationsComponent';
import OneOffContributionsComponent from './OneOffContributionsComponent';

function Profile() {
  const { 
    donations: contextDonations, 
    oneOffContributions: contextOneOffContributions,
    setOneOffContributions: contextSetOneOffContributions,
    impactScore,
    lastYearImpactScore,
    tier,
    pointsToNextTier,
    onDeleteDonation,
    onDeleteContribution,
    fetchImpactData,
    error: impactError,
    volunteerActivities
  } = useContext(ImpactContext);

  const [localDonations, setLocalDonations] = useState(contextDonations || []);
  const [localOneOffContributions, setLocalOneOffContributions] = useState(contextOneOffContributions || []);
  const [showRegularContributions, setShowRegularContributions] = useState(false);
  const [showOneOffContributions, setShowOneOffContributions] = useState(false);
  const [showImpactBreakdown, setShowImpactBreakdown] = useState(false);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  useEffect(() => {
    if (contextDonations) {
      setLocalDonations(contextDonations);
    }
  }, [contextDonations]);

  useEffect(() => {
    if (contextOneOffContributions) {
      setLocalOneOffContributions(contextOneOffContributions);
    }
  }, [contextOneOffContributions]);

  // Function to get unique charities from regular donations
  const getUniqueCharities = useCallback(() => {
    const regularDonationCharities = localDonations.map(d => d.charity);
    return [...new Set(regularDonationCharities)].slice(0, 3); // Get up to 3 unique charities
  }, [localDonations]);

  // Function to get recent one-off donations
  const getRecentOneOffDonations = useCallback(() => {
    return localOneOffContributions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3); // Get the 3 most recent
  }, [localOneOffContributions]);

  const scoreChange = impactScore - lastYearImpactScore;
  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  const toggleRegularContributions = () => {
    setShowRegularContributions(!showRegularContributions);
  };

  const toggleOneOffContributions = () => {
    setShowOneOffContributions(!showOneOffContributions);
  };

  const toggleImpactBreakdown = () => {
    setShowImpactBreakdown(!showImpactBreakdown);
  };

  const handleDeleteDonation = useCallback(async (donationId) => {
    console.log('Attempting to delete donation with ID:', donationId);
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await onDeleteDonation(donationId);
        setLocalDonations(prevDonations => {
          const updatedDonations = prevDonations.filter(donation => donation._id !== donationId);
          console.log('Updated donations:', updatedDonations);
          return updatedDonations;
        });
        console.log('Donation deleted successfully');
      } catch (error) {
        console.error('Error deleting donation:', error);
        alert(`Failed to delete donation: ${error.message}`);
      }
    }
  }, [onDeleteDonation]);

  const handleDeleteContribution = useCallback(async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await onDeleteContribution(contributionId);
        setLocalOneOffContributions(prevContributions => {
          const updatedContributions = prevContributions.filter(contribution => contribution._id !== contributionId);
          console.log('Updated one-off contributions:', updatedContributions);
          return updatedContributions;
        });
        console.log('Contribution deleted successfully');
      } catch (error) {
        console.error('Error deleting contribution:', error);
        alert(`Failed to delete contribution: ${error.message}`);
      }
    }
  }, [onDeleteContribution]);

  const handleCompleteCampaign = useCallback((completedCampaign) => {
    console.log('Handling completed campaign:', completedCampaign);
    try {
      if (typeof contextSetOneOffContributions === 'function') {
        contextSetOneOffContributions(prevContributions => [...prevContributions, completedCampaign]);
        setLocalOneOffContributions(prevContributions => [...prevContributions, completedCampaign]);
        console.log('Campaign added to one-off contributions successfully (using context)');
      } else {
        setLocalOneOffContributions(prevContributions => [...prevContributions, completedCampaign]);
        console.log('Campaign added to one-off contributions successfully (using local state)');
      }
    } catch (error) {
      console.error('Error adding completed campaign to one-off contributions:', error);
      console.error('Error details:', {
        contextSetOneOffContributions: typeof contextSetOneOffContributions,
        localOneOffContributions: localOneOffContributions,
        completedCampaign: completedCampaign
      });
      alert(`Failed to add completed campaign: ${error.message}`);
    }
  }, [contextSetOneOffContributions]);

  const threeColumnContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  };

  const columnStyle = {
    flex: '1 1 30%',
    backgroundColor: '#f0f8f0',
    borderRadius: '8px',
    padding: '15px',
  };

  // Updated carousel items for Impact Stories with more realistic charity updates
  const impactStories = [
    { 
      title: "Clean Water for All: Village Transformation", 
      description: "Thanks to your support, we've successfully installed 50 new water pumps in rural villages, providing clean water to over 10,000 people. This has led to a 60% reduction in waterborne diseases in the area.", 
      link: "#" 
    },
    { 
      title: "Education Empowerment: 1000 New Students Enrolled", 
      description: "Our education initiative has enabled 1000 underprivileged children to enroll in school this year. Early reports show a 40% improvement in literacy rates among participating communities.", 
      link: "#" 
    },
    { 
      title: "Reforestation Project: 100,000 Trees Planted", 
      description: "We've reached a milestone in our reforestation efforts, planting 100,000 trees across 500 acres. This project is estimated to offset 50,000 tons of CO2 annually once the trees mature.", 
      link: "#" 
    },
    { 
      title: "Medical Research Breakthrough: New Treatment Trial", 
      description: "Your donations have funded a promising new cancer treatment trial. Initial results show a 30% improvement in patient outcomes compared to standard treatments.", 
      link: "#" 
    },
    { 
      title: "Hunger Relief: 1 Million Meals Served", 
      description: "Our food bank network has provided 1 million meals to families in need this quarter. This represents a 25% increase from last year, directly impacting over 100,000 individuals.", 
      link: "#" 
    }
  ];

  // Projects to Support carousel items
  const projectsToSupport = [
    { title: "Support Healthcare", description: "Provide essential medical supplies...", link: "#" },
    { title: "Education Initiative", description: "Help underprivileged children access education...", link: "#" },
    { title: "Clean Water Project", description: "Bring clean water to remote villages...", link: "#" },
    { title: "Hunger Relief", description: "Support food banks and meal programs...", link: "#" },
  ];

  if (impactError) {
    return <div className={styles.error}>{impactError}</div>;
  }

  if (!localDonations.length && !localOneOffContributions.length && !volunteerActivities.length) {
    return <div className={styles.loading}>Loading your impact data...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.impactScoreContainer}>
        <PersonalImpactScore
          impactScore={impactScore}
          scoreChange={scoreChange}
          arrow={arrow}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
        />
        <button className={styles.seeBreakdownButton} onClick={toggleImpactBreakdown}>
          {showImpactBreakdown ? 'Hide breakdown' : 'See breakdown'}
        </button>
        {showImpactBreakdown && <ImpactScoreExplain />}
        <ImpactVisualization />
        <CarouselComponent title="Impact Stories" items={impactStories} />
        <CarouselComponent title="Projects to Support" items={projectsToSupport} />
      </div>
      
      <div className={styles.donationsContainer}>
        <div className={styles.columns}>
          <div className={styles.column}>
            <h3>Regular Donations</h3>
            <ul>
              {getUniqueCharities().map((charity, index) => (
                <li key={index}>{charity}</li>
              ))}
            </ul>
            <div className={styles.regularContributionsWrapper}>
              <h4 className={styles.seeHistoryHeader} onClick={toggleRegularContributions}>
                See history {showRegularContributions ? '▲' : '▼'}
              </h4>
              {showRegularContributions && (
                <div className={styles.donationsComponentWrapper}>
                  <DonationsComponent donations={localDonations} onDeleteDonation={handleDeleteDonation} />
                </div>
              )}
            </div>
          </div>
          <div className={styles.column}>
            <h3>Recent One-off Donations</h3>
            <ul>
              {getRecentOneOffDonations().map((donation, index) => (
                <li key={index}>{donation.charity}: ${donation.amount}</li>
              ))}
            </ul>
            <div className={styles.oneOffContributionsWrapper}>
              <h4 className={styles.seeHistoryHeader} onClick={toggleOneOffContributions}>
                See history {showOneOffContributions ? '▲' : '▼'}
              </h4>
              {showOneOffContributions && (
                <div className={styles.contributionsComponentWrapper}>
                  <OneOffContributionsComponent contributions={localOneOffContributions} onDeleteContribution={handleDeleteContribution} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.activitiesContainer}>
        <div className={styles.columns}>
          <div className={styles.column}>
            <VolunteerActivitiesComponent />
          </div>
          <div className={styles.column}>
            <FundraisingCampaignsComponent onCompleteCampaign={handleCompleteCampaign} />
          </div>
        </div>
      </div>

      <div className={styles.threeColumnsContainer} style={threeColumnContainerStyle}>
        <div className={styles.donorPersonaContainer} style={columnStyle}>
          <h2>Donor Persona</h2>
          <p>
            You're a strategic donor who focuses on select causes aligned with your values, particularly education, environment, and medical research. You prefer larger, targeted contributions to organizations with strong track records and measurable outcomes. While maintaining consistent annual giving, you're willing to increase donations for particularly compelling causes or crises.
          </p>
        </div>
        <div className={styles.charityTypesContainer} style={columnStyle}>
          <h2>Charity Types</h2>
          <ul>
            <li>Women's Health</li>
            <li>Animal Welfare</li>
            <li>International Aid</li>
            <li>Medical Research</li>
            <li>Education</li>
          </ul>
        </div>
        <div className={styles.badgesContainer} style={columnStyle}>
          <h2>Badges</h2>
          <div className={styles.badges}>
            {/* Space for displaying badge icons */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
