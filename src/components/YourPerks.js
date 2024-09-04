import React from 'react';
import styles from '../YourPerks.module.css';

function YourPerks() {
  return (
    <div className={styles.perksContainer}>
      <h1 className={styles.header}>Your Perks</h1>
      <p className={styles.intro}>
        As a valued member of DonateSpace, you have access to exclusive perks. 
        Here's what you can enjoy:
      </p>
      <ul className={styles.perksList}>
        <li className={styles.perkItem}>
          <h2>Exclusive Events</h2>
          <p>Access to invitation-only charity events and galas.</p>
        </li>
        <li className={styles.perkItem}>
          <h2>Priority Matching</h2>
          <p>Get first access to new matching opportunities from our partners.</p>
        </li>
        <li className={styles.perkItem}>
          <h2>Personalized Impact Reports</h2>
          <p>Receive detailed reports on how your donations are making a difference.</p>
        </li>
        <li className={styles.perkItem}>
          <h2>Donor Recognition</h2>
          <p>Special recognition in our annual impact report and on our website.</p>
        </li>
      </ul>
    </div>
  );
}

export default YourPerks;