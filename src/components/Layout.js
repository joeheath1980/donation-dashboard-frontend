import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './NavBar.module.css';
import layoutStyles from './Layout.module.css';
import logo from '../assets/logo.png';
import './NavReset.css';
import { APP_LINKS } from '../config/api.config';

function Layout({ children }) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const handleLogoClick = () => {
    if (user?.isBusiness) {
      navigate('/business-dashboard');
    } else if (user?.isCharity) {
      navigate('/charity-dashboard');
    } else {
      navigate('/dashboard');
    }
  };
  
  const handleLogout = () => {
    // Perform logout which now handles all data clearing
    logout();
    
    // Immediately navigate to login page
    navigate('/login');
  };

  const handleReportBug = () => {
    let link = APP_LINKS.BUG_REPORT_FORM_URL || '';

    // Prepare all replacement values
    const pageUrl = encodeURIComponent(window.location.href);
    const userId = user?.id || user?._id || '';
    const userEmail = user?.email || '';

    // Determine environment based on hostname
    let environment = 'Production (do-nation.space)';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      environment = 'Local Development';
    } else if (window.location.hostname.includes('staging')) {
      environment = 'Staging';
    }

    // Replace all placeholders in the URL
    link = link
      .replace('REPLACE_PAGE_URL', pageUrl)
      .replace('{PAGE_URL}', pageUrl)
      .replace('REPLACE_USER_ID', encodeURIComponent(userId))
      .replace('{USER_ID}', encodeURIComponent(userId))
      .replace('REPLACE_EMAIL', encodeURIComponent(userEmail))
      .replace('{EMAIL}', encodeURIComponent(userEmail))
      .replace('REPLACE_ENVIRONMENT', encodeURIComponent(environment))
      .replace('{ENVIRONMENT}', encodeURIComponent(environment))
      .replace('REPLACE_TITLE', '')
      .replace('{TITLE}', '');

    window.open(link, '_blank', 'noopener');
  };
  
  return (
    <div className={layoutStyles.layoutContainer}>
      <nav className={styles.navBar}>
        <div className={layoutStyles.logoContainer} onClick={handleLogoClick}>
          <img src={logo} alt="DonateSpace Logo" className={layoutStyles.logo} />
        </div>
        <button 
          className={layoutStyles.hamburger}
          onClick={() => setIsNavExpanded(!isNavExpanded)}
        >
          ☰
        </button>
        <div className={`${styles.navLinks} ${isNavExpanded ? styles.expanded : ''}`}>
          <NavLink 
            to={user?.isBusiness ? "/business-dashboard" : user?.isCharity ? "/charity-dashboard" : "/dashboard"} 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            Dashboard
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>Search</NavLink>
          {!user?.isBusiness && (
            <NavLink to="/your-perks" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>Your Perks</NavLink>
          )}
          {user?.isBusiness ? (
            <NavLink to="/business-dashboard/account-settings" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>Account Settings</NavLink>
          ) : (
            <NavLink to="/YourAccount" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>Your Account</NavLink>
          )}
          <NavLink to="/about" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>About</NavLink>
          <NavLink to="/help" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>Help</NavLink>
          <button onClick={handleReportBug} className={styles.navItem}>Report a bug</button>
          <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutButton}`}>Logout</button>
        </div>
      </nav>
      <div className={layoutStyles.betaBanner}>
        We’re in beta. To request access, email
        {' '}<a href="mailto:joeheath@do-nation.space">joeheath@do-nation.space</a>.
      </div>
      <div className={layoutStyles.content}>
        {children}
      </div>
      <footer className={layoutStyles.footer}>
        <span>Made with ❤️ by Do‑Nation. </span>
        <a href="/about">About</a>
        <span> · </span>
        <button onClick={handleReportBug} className={layoutStyles.footerLinkButton}>Report a bug</button>
        <span> · </span>
        <a href="/terms_of_service.html" target="_blank" rel="noopener noreferrer">Terms</a>
        <span> · </span>
        <a href="/privacy_policy.html" target="_blank" rel="noopener noreferrer">Privacy</a>
        <span> · </span>
        <a href="/beta_testing_agreement.html" target="_blank" rel="noopener noreferrer">Beta Agreement</a>
      </footer>
    </div>
  );
}

export default Layout;
