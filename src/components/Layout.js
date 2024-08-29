import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../Layout.module.css'; // Ensure this path is correct
import logo from '../assets/logo.png';

function Layout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      <div className={styles.header}>
        <img src={logo} alt="DonateSpace Logo" className={styles.logo} />
      </div>
      <nav className={styles.navbar}>
        <ul className={styles.navLinks}>
          <li><Link to="/ImpactSpace" className={styles.navLink}>IMPACT SPACE</Link></li>
          <li><Link to="/profile" className={styles.navLink}>PROFILE</Link></li>
          <li><Link to="/impact" className={styles.navLink}>IMPACT</Link></li>
          <li><Link to="/opportunities" className={styles.navLink}>OPPORTUNITIES</Link></li>
          <li><Link to="/matching" className={styles.navLink}>MATCHING</Link></li>
          <li><Link to="/YourAccount" className={styles.navLink}>YOUR ACCOUNT</Link></li>
        </ul>
      </nav>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

export default Layout;


