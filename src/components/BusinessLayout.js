import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../BusinessLayout.module.css';
import logo from '../assets/logo.png';

function BusinessLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="DonateSpace Business Logo" className={styles.logo} />
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

export default BusinessLayout;