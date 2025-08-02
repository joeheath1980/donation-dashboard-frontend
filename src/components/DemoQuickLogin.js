import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBriefcase, FaHeart } from 'react-icons/fa';
import styles from './DemoQuickLogin.module.css';

const DemoQuickLogin = ({ onCredentialsFill }) => {
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('users');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/demo/credentials`
        );
        setCredentials(response.data);
      } catch (error) {
        console.error('Error fetching demo credentials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, []);

  const quickLogin = async (type, category) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/demo/quick-login`,
        { userType: type, category }
      );

      if (onCredentialsFill) {
        // If we're on the login page, just fill the credentials with the correct account type
        onCredentialsFill(response.data.email, response.data.password, category);
      } else {
        // Otherwise, navigate to login with demo params
        navigate(`/login?demo=${type}&category=${category}`);
      }
    } catch (error) {
      console.error('Error during quick login:', error);
      alert('Failed to load demo credentials. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={styles.quickLoginContainer}>
        <div className={styles.loading}>Loading demo accounts...</div>
      </div>
    );
  }

  if (!credentials) {
    return null;
  }

  const categories = [
    { id: 'users', label: 'Individual Users', icon: FaUser },
    { id: 'businesses', label: 'Businesses', icon: FaBriefcase },
    { id: 'charities', label: 'Charities', icon: FaHeart }
  ];

  return (
    <div className={styles.quickLoginContainer}>
      <h3 className={styles.title}>Quick Demo Login</h3>
      <p className={styles.subtitle}>
        Select an account type to instantly log in with demo credentials
      </p>

      <div className={styles.categoryTabs}>
        {categories.map(category => (
          <button
            key={category.id}
            className={`${styles.categoryTab} ${selectedCategory === category.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon className={styles.categoryIcon} />
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.accountGrid}>
        {selectedCategory === 'users' && credentials.users?.map(user => (
          <button
            key={user.type}
            onClick={() => quickLogin(user.type, 'user')}
            className={`${styles.accountCard} ${styles[user.tier?.toLowerCase()]}`}
          >
            <div className={styles.tierBadge}>{user.tierName}</div>
            <div className={styles.accountInfo}>
              <h4>{user.displayName}</h4>
              <p className={styles.accountDescription}>{user.description}</p>
              <div className={styles.accountDetails}>
                <span>Impact Score: {user.impactScore}</span>
                <span>Donations: ${user.totalDonations}</span>
              </div>
            </div>
          </button>
        ))}

        {selectedCategory === 'businesses' && credentials.businesses?.map(business => (
          <button
            key={business.type}
            onClick={() => quickLogin(business.type, 'business')}
            className={styles.accountCard}
          >
            <div className={styles.businessType}>{business.businessType}</div>
            <div className={styles.accountInfo}>
              <h4>{business.name}</h4>
              <p className={styles.accountDescription}>{business.description}</p>
              <div className={styles.accountDetails}>
                <span>Industry: {business.industry}</span>
                <span>Campaigns: {business.activeCampaigns}</span>
              </div>
            </div>
          </button>
        ))}

        {selectedCategory === 'charities' && credentials.charities?.map(charity => (
          <button
            key={charity.type}
            onClick={() => quickLogin(charity.type, 'charity')}
            className={styles.accountCard}
          >
            <div className={styles.charityCategory}>{charity.category}</div>
            <div className={styles.accountInfo}>
              <h4>{charity.name}</h4>
              <p className={styles.accountDescription}>{charity.description}</p>
              <div className={styles.accountDetails}>
                <span>Focus: {charity.primaryCause}</span>
                <span>Donors: {charity.donorCount}</span>
              </div>
            </div>
          </button>
        ))}

      </div>

      <div className={styles.disclaimer}>
        <p>
          Demo accounts are pre-populated with sample data. 
          All actions are simulated and no real transactions occur.
        </p>
      </div>
    </div>
  );
};

export default DemoQuickLogin;