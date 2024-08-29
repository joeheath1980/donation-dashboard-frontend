import React from 'react';
import styles from '../YourAccount.module.css'; // Updated import path

function YourAccount() {
  return (
    <div className={styles.accountContainer}>
      <h1 className={styles.header}>Your Account</h1>
      <div className={styles.accountGrid}>
        {/* Profile Box */}
        <div className={styles.box}>
          <h2>Profile</h2>
          <p>Update your personal information.</p>
        </div>

        {/* Past Activity Box */}
        <div className={styles.box}>
          <h2>Past Activity</h2>
          <p>Review your past donations and activities.</p>
        </div>

        {/* Payments Box */}
        <div className={styles.box}>
          <h2>Payments</h2>
          <p>Manage your payment methods and history.</p>
        </div>

        {/* Preferences Box */}
        <div className={styles.box}>
          <h2>Preferences</h2>
          <p>Set your communication and notification preferences.</p>
        </div>
      </div>
    </div>
  );
}

export default YourAccount;



