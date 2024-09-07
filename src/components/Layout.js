import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../Layout.module.css';
import logo from '../assets/download.svg';
import '../NavReset.css';  // Import the new NavReset.css file

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
            <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Dashboard</NavLink></li>
            <li><NavLink to="/matching" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Matching</NavLink></li>
            <li><NavLink to="/your-perks" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Your Perks</NavLink></li>
            <li><NavLink to="/YourAccount" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Your Account</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>About</NavLink></li>
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
