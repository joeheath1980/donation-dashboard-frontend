import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../YourAccount.module.css';

function YourAccount() {
  return (
    <div className={`${styles.accountContainer} container`}>
      <h1 className="h1">Your Account</h1>
      <div className={styles.accountGrid}>
        {/* Profile Box */}
        <div className={`${styles.box} card`}>
          <h2 className="h2">Profile</h2>
          <p>Update your personal information.</p>
          <Link to="/profile" className="btn btn-secondary">Edit Profile</Link>
        </div>

        {/* Past Activity Box */}
        <div className={`${styles.box} card`}>
          <h2 className="h2">Past Activity</h2>
          <p>Review your past donations and activities.</p>
          <Link to="/activity" className="btn btn-secondary">View Activity</Link>
        </div>

        {/* Payments Box */}
        <div className={`${styles.box} card`}>
          <h2 className="h2">Payments</h2>
          <p>Manage your payment methods and history.</p>
          <Link to="/payments" className="btn btn-secondary">Manage Payments</Link>
        </div>

        {/* Privacy Box */}
        <div className={`${styles.box} card`}>
          <h2 className="h2">Privacy</h2>
          <p>Manage your privacy settings and data.</p>
          <Link to="/privacy" className="btn btn-secondary">Privacy Settings</Link>
        </div>

        {/* Tax Information Box */}
        <div className={`${styles.box} card`}>
          <h2 className="h2">Tax Information</h2>
          <p>Complete tax statements for all your giving.</p>
          <Link to="/tax-info" className="btn btn-secondary">View Tax Info</Link>
        </div>

        {/* Partners Box */}
        <div className={`${styles.box} card`}>
          <h2 className="h2">Partners</h2>
          <p>View our charity and brand partners.</p>
          <Link to="/partners" className="btn btn-secondary">Go to Partners</Link>
        </div>
      </div>
    </div>
  );
}

export default YourAccount;
