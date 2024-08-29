import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Profile.module.css'; // Ensure this path is correct

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3002/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={styles.profileContainer}>
      {/* Personal Impact Score Section */}
      <div className={styles.impactScoreBox}>
        <h3>Personal Impact Score</h3>
        <p>{user ? user.impactScore : 'Loading...'}</p>
      </div>

      {/* Your Impact Section */}
      <div className={styles.impactContainer}>
        <h2>Your Impact</h2>
        <div className={styles.columns}>
          <div className={styles.column}>
            <h3>Your Charities</h3>
            <ul>
              <li>MSF</li>
              <li>NBCF</li>
              <li>Wildlife Victoria</li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3>Recent One-off Donations</h3>
            <ul>
              <li>Lee's Run for Cancer</li>
              <li>Kylie Steptember</li>
              <li>Johno Ice Bath Challenge</li>
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

