import React, { useContext } from 'react';
import styles from '../Profile.module.css';
import PersonalImpactScore from './PersonalImpactScore';
import ImpactScoreExplain from './ImpactScoreExplain';
import { ImpactContext } from '../contexts/ImpactContext';

function Profile() {
  const { 
    donations, 
    oneOffContributions, 
    volunteerActivities,
    impactScore,
    lastYearImpactScore,
    tier,
    pointsToNextTier
  } = useContext(ImpactContext);

  // Function to get unique charities from donations and one-off contributions
  const getUniqueCharities = () => {
    const allCharities = [
      ...donations.map(d => d.charity),
      ...oneOffContributions.map(c => c.charity)
    ];
    return [...new Set(allCharities)].slice(0, 3); // Get up to 3 unique charities
  };

  // Function to get recent one-off donations
  const getRecentOneOffDonations = () => {
    return oneOffContributions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3); // Get the 3 most recent
  };

  const scoreChange = impactScore - lastYearImpactScore;
  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  return (
    <div className={styles.profileContainer}>
      {/* Personal Impact Score Section */}
      <PersonalImpactScore
        impactScore={impactScore}
        scoreChange={scoreChange}
        arrow={arrow}
        tier={tier}
        pointsToNextTier={pointsToNextTier}
      />

      {/* Impact Score Explain Section */}
      <ImpactScoreExplain />
      
      {/* Your Impact Section */}
      <div className={styles.impactContainer}>
        <h2>Your Impact</h2>
        <div className={styles.columns}>
          <div className={styles.column}>
            <h3>Your Charities</h3>
            <ul>
              {getUniqueCharities().map((charity, index) => (
                <li key={index}>{charity}</li>
              ))}
            </ul>
          </div>
          <div className={styles.column}>
            <h3>Recent One-off Donations</h3>
            <ul>
              {getRecentOneOffDonations().map((donation, index) => (
                <li key={index}>{donation.charity}: ${donation.amount}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Donor Persona Section */}
      <div className={styles.donorPersonaContainer}>
        <h2>Donor Persona</h2>
        <p>
          You're a strategic donor who focuses on select causes aligned with your values, particularly education, environment, and medical research. You prefer larger, targeted contributions to organizations with strong track records and measurable outcomes. While maintaining consistent annual giving, you're willing to increase donations for particularly compelling causes or crises.
        </p>
      </div>

      {/* Charity Types Section */}
      <div className={styles.charityTypesContainer}>
        <h2>Charity Types</h2>
        <ul>
          <li>Women's Health</li>
          <li>Animal Welfare</li>
          <li>International Aid</li>
          <li>Medical Research</li>
          <li>Education</li>
        </ul>
      </div>

      {/* Volunteer Activities Section */}
      <div className={styles.volunteerActivitiesContainer}>
        <h2>Volunteer Activities</h2>
        <ul>
          {volunteerActivities.map((activity, index) => (
            <li key={index}>{activity.activity}: {activity.hours} hours</li>
          ))}
        </ul>
      </div>

      {/* Badges Section */}
      <div className={styles.badgesContainer}>
        <h2>Badges</h2>
        <div className={styles.badges}>
          {/* Space for displaying badge icons */}
        </div>
      </div>
    </div>
  );
}

export default Profile;
