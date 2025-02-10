import React from 'react';
import { Link } from 'react-router-dom';
import styles from './YourAccount.module.css';
import sharedStyles from './SharedStyles.css';
import { Icons } from './icons';

const YourAccount = () => {
  return (
    <div className={`${styles.accountPage} ${sharedStyles.container}`}>
      <main className={`${styles.main} ${sharedStyles.mainContent}`}>
        <h1 className={`${styles.pageTitle} ${sharedStyles.heading}`}>Your Account</h1>

        <div className={`${styles.cardGrid} ${sharedStyles.grid}`}>
          <div className={`${styles.card} ${sharedStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${sharedStyles.icon}`}>
                <Icons.Profile />
              </span>
              <h2 className={sharedStyles.cardTitle}>Profile</h2>
            </div>
            <p className={sharedStyles.cardText}>Manage your personal information and preferences.</p>
            <button className={sharedStyles.button}>Edit Profile</button>
            <span className={`${styles.ctaTip} ${sharedStyles.tip}`}>Keep your profile updated for a better experience!</span>
          </div>

          <div className={`${styles.card} ${sharedStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${sharedStyles.icon}`}>
                <Icons.Privacy />
              </span>
              <h2 className={sharedStyles.cardTitle}>Privacy</h2>
            </div>
            <p className={sharedStyles.cardText}>Control your privacy settings and data sharing preferences.</p>
            <button className={sharedStyles.button}>Manage Privacy</button>
            <span className={`${styles.ctaTip} ${sharedStyles.tip}`}>Your privacy matters. Review your settings regularly.</span>
          </div>

          <div className={`${styles.card} ${sharedStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${sharedStyles.icon}`}>
                <Icons.Payments />
              </span>
              <h2 className={sharedStyles.cardTitle}>Payments</h2>
            </div>
            <p className={sharedStyles.cardText}>View and manage your payment methods and recurring donations.</p>
            <Link to="/manage-payments" className={sharedStyles.button}>Manage Payments</Link>
            <span className={`${styles.ctaTip} ${sharedStyles.tip}`}>Securely manage your payment options here.</span>
          </div>

          <div className={`${styles.card} ${sharedStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${sharedStyles.icon}`}>
                <Icons.Impact />
              </span>
              <h2 className={sharedStyles.cardTitle}>Your Impact</h2>
            </div>
            <p className={sharedStyles.cardText}>Explore your giving history and see the impact you've made.</p>
            <Link to="/your-impact" className={sharedStyles.button}>View Impact</Link>
            <span className={`${styles.ctaTip} ${sharedStyles.tip}`}>Discover how your contributions are making a difference.</span>
          </div>

          <div className={`${styles.card} ${sharedStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${sharedStyles.icon}`}>
                <Icons.Discover />
              </span>
              <h2 className={sharedStyles.cardTitle}>Discover Your Donations</h2>
            </div>
            <p className={sharedStyles.cardText}>Find and categorize your past donations from email receipts.</p>
            <Link to="/activity" className={sharedStyles.button}>Discover</Link>
            <span className={`${styles.ctaTip} ${sharedStyles.tip}`}>Uncover and organize your charitable contributions.</span>
          </div>

          <div className={`${styles.card} ${sharedStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${sharedStyles.icon}`}>
                <Icons.Settings />
              </span>
              <h2 className={sharedStyles.cardTitle}>Account Settings</h2>
            </div>
            <p className={sharedStyles.cardText}>Adjust your account preferences and notification settings.</p>
            <button className={sharedStyles.button}>Manage Settings</button>
            <span className={`${styles.ctaTip} ${sharedStyles.tip}`}>Customize your account for the best experience.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YourAccount;