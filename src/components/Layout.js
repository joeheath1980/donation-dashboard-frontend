import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../Layout.module.css';
import logo from '../assets/download.svg';

function Layout({ children }) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="DonateSpace Logo" className={styles.logo} />
          </div>
          <button 
            className={styles.hamburger}
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
            ☰
          </button>
          <ul className={`${styles.navLinks} ${isNavExpanded ? styles.expanded : ''}`}>
            <li><Link to="/profile" className={styles.navLink}>Profile</Link></li>
            <li><Link to="/impact" className={styles.navLink}>Impact</Link></li>
            <li><Link to="/matching" className={styles.navLink}>Matching</Link></li>
            <li><Link to="/your-perks" className={styles.navLink}>Your Perks</Link></li>
            <li><Link to="/YourAccount" className={styles.navLink}>Your Account</Link></li>
            <li><Link to="/about" className={styles.navLink}>About</Link></li>
          </ul>
        </div>
      </nav>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
