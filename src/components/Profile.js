import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from '../Profile.module.css';
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
import { FaRegHandshake, FaRegCalendarAlt, FaRegHeart } from 'react-icons/fa';

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
    volunteerActivities,
    followedCharities
  } = useContext(ImpactContext);

  const [localDonations, setLocalDonations] = useState(contextDonations || []);
  const [localOneOffContributions, setLocalOneOffContributions] = useState(contextOneOffContributions || []);
  const [showRegularContributions, setShowRegularContributions] = useState(false);
  const [showOneOffContributions, setShowOneOffContributions] = useState(false);
  const [showFullImpactReport, setShowFullImpactReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTierProgressModal, setShowTierProgressModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchImpactData().finally(() => setIsLoading(false));
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

  const toggleRegularContributions = () => {
    setShowRegularContributions(!showRegularContributions);
  };

  const toggleOneOffContributions = () => {
    setShowOneOffContributions(!showOneOffContributions);
  };

  const toggleFullImpactReport = () => {
    setShowFullImpactReport(!showFullImpactReport);
  };

  const toggleTierProgressModal = () => {
    setShowTierProgressModal(!showTierProgressModal);
  };

  const handleDeleteDonation = useCallback(async (donationId) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await onDeleteDonation(donationId);
        setLocalDonations(prevDonations => prevDonations.filter(donation => donation._id !== donationId));
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
        setLocalOneOffContributions(prevContributions => prevContributions.filter(contribution => contribution._id !== contributionId));
      } catch (error) {
        console.error('Error deleting contribution:', error);
        alert(`Failed to delete contribution: ${error.message}`);
      }
    }
  }, [onDeleteContribution]);

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

  const sectionStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  };

  const columnStyle = {
    flex: '1 1 30%',
    backgroundColor: '#f0f8f0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    borderTop: '4px solid #4CAF50',
  };

  const headerStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  };

  const subHeaderStyle = {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
  };

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
  };

  const listItemStyle = {
    padding: '8px 0',
    borderBottom: '1px solid #ccc',
  };

  const carouselStyle = {
    ...sectionStyle,
    padding: '6px 24px',
    maxHeight: '500px',
    overflow: 'hidden',
    marginBottom: '16px',
  };

  const carouselTitleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: '10px',
  };

  const carouselComponentStyle = {};

  const miniContainerStyle = {
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
  };

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

  const projectsToSupport = [
    { title: "Support Healthcare", description: "Provide essential medical supplies to underserved communities. Your donation can help save lives.", link: "#" },
    { title: "Education Initiative", description: "Help underprivileged children access quality education. Support our program to build schools and provide learning materials.", link: "#" },
    { title: "Clean Water Project", description: "Bring clean water to remote villages. Your contribution can help install water purification systems and wells.", link: "#" },
    { title: "Hunger Relief", description: "Support food banks and meal programs. Help us fight hunger in local communities and disaster-struck areas.", link: "#" },
    { title: "Environmental Conservation", description: "Protect endangered species and their habitats. Join our efforts to preserve biodiversity and combat climate change.", link: "#" }
  ];

  if (isLoading) {
    return <div className={styles.loading}>Loading your impact data...</div>;
  }

  if (impactError) {
    return <div className={styles.error}>{impactError}</div>;
  }

  const hasData = localDonations.length > 0 || localOneOffContributions.length > 0 || volunteerActivities.length > 0;

  if (!hasData) {
    return <div className={styles.noData}>No impact data available. Start making donations to see your impact!</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div style={sectionStyle}>
        <h1 style={headerStyle}>Personal Impact Score</h1>
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
      </div>
      
      <div style={carouselStyle}>
        <h2 style={carouselTitleStyle}>Matching Opportunities</h2>
        <CarouselComponent 
          items={matchingOpportunities.map(opp => ({
            title: opp.title,
            description: `${opp.description} Amount: $${opp.amount.toLocaleString()}. Valid until: ${new Date(opp.endDate).toLocaleDateString()}`,
            link: opp.link
          }))}
          style={carouselComponentStyle}
        />
      </div>

      <div style={carouselStyle}>
        <h2 style={carouselTitleStyle}>Projects to Support</h2>
        <CarouselComponent items={projectsToSupport} style={carouselComponentStyle} />
      </div>
      
      <div style={{...sectionStyle, display: 'flex', justifyContent: 'space-between', gap: '24px'}}>
        <div style={columnStyle}>
          <h3 style={subHeaderStyle}><FaRegHandshake style={{marginRight: '10px'}} /> Regular Donations</h3>
          <div style={miniContainerStyle}>
            {localDonations && localDonations.length > 0 ? (
              <ul style={listStyle}>
                {getUniqueCharities().map((charity, index) => (
                  <li key={index} style={listItemStyle}>{charity}</li>
                ))}
              </ul>
            ) : (
              <p>No regular donations yet.</p>
            )}
          </div>
          <div className={styles.regularContributionsWrapper}>
            <button style={buttonStyle} onClick={toggleRegularContributions}>
              See more
            </button>
            {showRegularContributions && (
              <div className={styles.donationsComponentWrapper}>
                <DonationsComponent donations={localDonations} onDeleteDonation={handleDeleteDonation} />
              </div>
            )}
          </div>
        </div>
        <div style={columnStyle}>
          <h3 style={subHeaderStyle}><FaRegCalendarAlt style={{marginRight: '10px'}} /> Recent One-off Donations</h3>
          <div style={miniContainerStyle}>
            {localOneOffContributions && localOneOffContributions.length > 0 ? (
              <ul style={listStyle}>
                {getRecentOneOffDonations().map((donation, index) => (
                  <li key={index} style={listItemStyle}>{donation.charity}: ${donation.amount}</li>
                ))}
              </ul>
            ) : (
              <p>No one-off donations yet.</p>
            )}
          </div>
          <div className={styles.oneOffContributionsWrapper}>
            <button style={buttonStyle} onClick={toggleOneOffContributions}>
              See more
            </button>
            {showOneOffContributions && (
              <div className={styles.contributionsComponentWrapper}>
                <OneOffContributionsComponent contributions={localOneOffContributions} onDeleteContribution={handleDeleteContribution} />
              </div>
            )}
          </div>
        </div>
        <div style={columnStyle}>
          <h3 style={subHeaderStyle}><FaRegHeart style={{marginRight: '10px'}} /> Charities Following</h3>
          <div style={miniContainerStyle}>
            {followedCharities && followedCharities.length > 0 ? (
              <ul style={listStyle}>
                {followedCharities.map((charity, index) => (
                  <li key={charity.ABN} style={listItemStyle}>
                    {charity.logo && (
                      <img src={charity.logo} alt={`${charity.name} logo`} style={{width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle'}} />
                    )}
                    {charity.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not following any charities yet.</p>
            )}
          </div>
          <Link to="/search-charities" style={buttonStyle}>Search Charities</Link>
        </div>
      </div>

      <div style={{...sectionStyle, display: 'flex', justifyContent: 'space-between', gap: '24px'}}>
        <div style={columnStyle}>
          <VolunteerActivitiesComponent />
        </div>
        <div style={columnStyle}>
          <FundraisingCampaignsComponent onCompleteCampaign={handleCompleteCampaign} />
        </div>
      </div>

      <div style={carouselStyle}>
        <h2 style={carouselTitleStyle}>Impact Stories</h2>
        <CarouselComponent items={impactStories} style={carouselComponentStyle} />
      </div>

      {showTierProgressModal && (
        <TierProgressModal
          currentTier={tier}
          impactScore={impactScore}
          onClose={toggleTierProgressModal}
        />
      )}
    </div>
  );
}

export default Profile;
