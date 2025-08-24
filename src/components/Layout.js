import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './NavBar.module.css';
import layoutStyles from './Layout.module.css';
import logo from '../assets/logo.png';
import './NavReset.css';

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
          <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutButton}`}>Logout</button>
        </div>
      </nav>
      <div className={layoutStyles.content}>
        {children}
      </div>
      <footer className={layoutStyles.footer}>
        Made with ❤️ by Do‑Nation. <a href="/about">Learn more</a>
      </footer>
    </div>
  );
}

export default Layout;
