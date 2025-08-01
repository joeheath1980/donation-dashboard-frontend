import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './YourAccount.module.css';
import './SharedStyles.css';
import { Icons } from './icons';

const YourAccount = () => {
  const { user } = useAuth();
  
  
  return (
    <div className={`${styles.accountPage} container`}>
      <main className={`${styles.main} mainContent`}>
        <h1 className={`${styles.pageTitle} heading`}>Your Account</h1>

        <div className={`${styles.cardGrid} grid`}>
          <div className={`${styles.card} card`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} icon`}>
                <Icons.Profile />
              </span>
              <h2 className="cardTitle">Profile</h2>
            </div>
            <p className="cardText">Manage your personal information and preferences.</p>
            <div className={styles.cardActions}>
              <Link to="/profile/edit" className="button">Edit Profile</Link>
              {user?.username && (
                <Link to={`/profile/${user.username}`} className="button secondary">View Public Profile</Link>
              )}
            </div>
            <span className={`${styles.ctaTip} tip`}>Keep your profile updated for a better experience!</span>
          </div>

          <div className={`${styles.card} card`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} icon`}>
                <Icons.Privacy />
              </span>
              <h2 className="cardTitle">Privacy</h2>
            </div>
            <p className="cardText">Control your privacy settings and data sharing preferences.</p>
            <Link to="/privacy-settings" className="button">Manage Privacy</Link>
            <span className={`${styles.ctaTip} tip`}>Your privacy matters. Review your settings regularly.</span>
          </div>

          <div className={`${styles.card} card`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} icon`}>
                <Icons.Payments />
              </span>
              <h2 className="cardTitle">Payments</h2>
            </div>
            <p className="cardText">View and manage your payment methods and recurring donations.</p>
            <Link to="/manage-payments" className="button">Manage Payments</Link>
            <span className={`${styles.ctaTip} tip`}>Securely manage your payment options here.</span>
          </div>

          <div className={`${styles.card} card`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} icon`}>
                <Icons.Impact />
              </span>
              <h2 className="cardTitle">Your Impact</h2>
            </div>
            <p className="cardText">Explore your giving history and see the impact you've made.</p>
            <Link to="/your-impact" className="button">View Impact</Link>
            <span className={`${styles.ctaTip} tip`}>Discover how your contributions are making a difference.</span>
          </div>

          <div className={`${styles.card} card`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} icon`}>
                <Icons.Discover />
              </span>
              <h2 className="cardTitle">Discover Your Donations</h2>
            </div>
            <p className="cardText">Find and categorize your past donations from email receipts.</p>
            <Link to="/activity" className="button">Discover</Link>
            <span className={`${styles.ctaTip} tip`}>Uncover and organize your charitable contributions.</span>
          </div>

          <div className={`${styles.card} card`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIcon} icon`}>
                <Icons.Settings />
              </span>
              <h2 className="cardTitle">Account Settings</h2>
            </div>
            <p className="cardText">Adjust your account preferences and notification settings.</p>
            <button className="button">Manage Settings</button>
            <span className={`${styles.ctaTip} tip`}>Customize your account for the best experience.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YourAccount;