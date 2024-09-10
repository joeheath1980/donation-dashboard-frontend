import React from 'react';
import styles from '../YourAccount.module.css';

const YourAccount = () => {
  return (
    <div className={styles.accountPage}>
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Your Account</h1>

        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <span className={styles.cardIcon}>👤</span>
            <h2>Profile</h2>
            <p>Manage your personal information and preferences.</p>
            <button className={styles.cardButton}>Edit Profile</button>
            <span className={styles.ctaTip}>Keep your profile updated for a better experience!</span>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>🔒</span>
            <h2>Privacy</h2>
            <p>Control your privacy settings and data sharing preferences.</p>
            <button className={styles.cardButton}>Manage Privacy</button>
            <span className={styles.ctaTip}>Your privacy matters. Review your settings regularly.</span>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>💳</span>
            <h2>Payments</h2>
            <p>View and manage your payment methods and recurring donations.</p>
            <button className={styles.cardButton}>Manage Payments</button>
            <span className={styles.ctaTip}>Securely manage your payment options here.</span>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>📅</span>
            <h2>Past Activity</h2>
            <p>Review your donation history and impact over time.</p>
            <button className={styles.cardButton}>View Activity</button>
            <span className={styles.ctaTip}>See detailed insights in your past activity.</span>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>⚙️</span>
            <h2>Account Settings</h2>
            <p>Adjust your account preferences and notification settings.</p>
            <button className={styles.cardButton}>Manage Settings</button>
            <span className={styles.ctaTip}>Customize your account for the best experience.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YourAccount;
