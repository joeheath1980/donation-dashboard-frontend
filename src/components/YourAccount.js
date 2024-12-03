import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../YourAccount.module.css';
import cleanStyles from './CleanDesign.module.css';
import { Icons } from './icons';

const YourAccount = () => {
  return (
    <div className={`${styles.accountPage} ${cleanStyles.container}`}>
      <main className={`${styles.main} ${cleanStyles.mainContent}`}>
        <h1 className={`${styles.pageTitle} ${cleanStyles.heading}`}>Your Account</h1>

        <div className={`${styles.cardGrid} ${cleanStyles.grid}`}>
          <div className={`${styles.card} ${cleanStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${cleanStyles.icon}`}>
                <Icons.Profile />
              </span>
              <h2 className={cleanStyles.cardTitle}>Profile</h2>
            </div>
            <p className={cleanStyles.cardText}>Manage your personal information and preferences.</p>
            <button className={`${styles.cardButton} ${cleanStyles.button}`}>Edit Profile</button>
            <span className={`${styles.ctaTip} ${cleanStyles.tip}`}>Keep your profile updated for a better experience!</span>
          </div>

          <div className={`${styles.card} ${cleanStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${cleanStyles.icon}`}>
                <Icons.Privacy />
              </span>
              <h2 className={cleanStyles.cardTitle}>Privacy</h2>
            </div>
            <p className={cleanStyles.cardText}>Control your privacy settings and data sharing preferences.</p>
            <button className={`${styles.cardButton} ${cleanStyles.button}`}>Manage Privacy</button>
            <span className={`${styles.ctaTip} ${cleanStyles.tip}`}>Your privacy matters. Review your settings regularly.</span>
          </div>

          <div className={`${styles.card} ${cleanStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${cleanStyles.icon}`}>
                <Icons.Payments />
              </span>
              <h2 className={cleanStyles.cardTitle}>Payments</h2>
            </div>
            <p className={cleanStyles.cardText}>View and manage your payment methods and recurring donations.</p>
            <Link to="/manage-payments" className={`${styles.cardButton} ${cleanStyles.button}`}>Manage Payments</Link>
            <span className={`${styles.ctaTip} ${cleanStyles.tip}`}>Securely manage your payment options here.</span>
          </div>

          <div className={`${styles.card} ${cleanStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${cleanStyles.icon}`}>
                <Icons.Impact />
              </span>
              <h2 className={cleanStyles.cardTitle}>Your Impact</h2>
            </div>
            <p className={cleanStyles.cardText}>Explore your giving history and see the impact you've made.</p>
            <Link to="/your-impact" className={`${styles.cardButton} ${cleanStyles.button}`}>View Impact</Link>
            <span className={`${styles.ctaTip} ${cleanStyles.tip}`}>Discover how your contributions are making a difference.</span>
          </div>

          <div className={`${styles.card} ${cleanStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${cleanStyles.icon}`}>
                <Icons.Discover />
              </span>
              <h2 className={cleanStyles.cardTitle}>Discover Your Donations</h2>
            </div>
            <p className={cleanStyles.cardText}>Find and categorize your past donations from email receipts.</p>
            <Link to="/activity" className={`${styles.cardButton} ${cleanStyles.button}`}>Discover</Link>
            <span className={`${styles.ctaTip} ${cleanStyles.tip}`}>Uncover and organize your charitable contributions.</span>
          </div>

          <div className={`${styles.card} ${cleanStyles.card}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} ${cleanStyles.icon}`}>
                <Icons.Settings />
              </span>
              <h2 className={cleanStyles.cardTitle}>Account Settings</h2>
            </div>
            <p className={cleanStyles.cardText}>Adjust your account preferences and notification settings.</p>
            <button className={`${styles.cardButton} ${cleanStyles.button}`}>Manage Settings</button>
            <span className={`${styles.ctaTip} ${cleanStyles.tip}`}>Customize your account for the best experience.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YourAccount;