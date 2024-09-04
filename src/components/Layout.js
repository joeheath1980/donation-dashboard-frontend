import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../Layout.module.css';
import logo from '../assets/download.svg';

function Layout({ children }) {
  return (
    <div className={`${styles.layoutContainer} container`}>
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="DonateSpace Logo" className={styles.logo} />
        </div>
        <ul className={styles.navLinks}>
          <li><Link to="/ImpactSpace" className={`${styles.navLink} btn btn-secondary`}>Impact Space</Link></li>
          <li><Link to="/profile" className={`${styles.navLink} btn btn-secondary`}>Profile</Link></li>
          <li><Link to="/impact" className={`${styles.navLink} btn btn-secondary`}>Impact</Link></li>
          <li><Link to="/matching" className={`${styles.navLink} btn btn-secondary`}>Matching</Link></li>
          <li><Link to="/your-perks" className={`${styles.navLink} btn btn-secondary`}>Your Perks</Link></li>
          <li><Link to="/YourAccount" className={`${styles.navLink} btn btn-secondary`}>Your Account</Link></li>
          <li><Link to="/about" className={`${styles.navLink} btn btn-secondary`}>About</Link></li>
        </ul>
      </nav>
      <div className={`${styles.content} card`}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
