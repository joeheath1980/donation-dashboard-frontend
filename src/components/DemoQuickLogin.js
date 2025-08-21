import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBriefcase, FaHeart } from 'react-icons/fa';
import apiServices from '../services/api.service';
import styles from './DemoQuickLogin.module.css';

const DemoQuickLogin = ({ onCredentialsFill }) => {
  // debug: component mounted (no sensitive data)
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('users');
  const navigate = useNavigate();
  const api = apiServices.client;

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await api.get('/api/demo/credentials');
        setCredentials(response.data);
      } catch (error) {
        console.error('Error fetching demo credentials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [api]);

  const quickLogin = async (type, category) => {
    // debug: quick login clicked (no sensitive data)
    try {
      // debug: calling demo quick-login API
      const response = await api.post('/api/demo/quick-login', { userType: type, category });

      // do not log demo credentials

      if (onCredentialsFill) {
        // Ensure we extract the correct values
        const email = response.data?.email;
        const password = response.data?.password;
        
        // do not log extracted credentials
        
        // Make sure we're passing strings, not objects
        if (typeof email === 'string' && typeof password === 'string') {
          // pass credentials to parent without logging
          onCredentialsFill(email, password, category);
        } else {
          console.error('Invalid response format:', response.data);
          // avoid logging sensitive values or types
          alert('Failed to load demo credentials. Invalid response format.');
        }
      } else {
        // Otherwise, navigate to login with demo params
        // navigating to login page for demo flow
        navigate(`/login?demo=${type}&category=${category}`);
      }
    } catch (error) {
      console.error('Error during quick login:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Check for CSRF error
      if (error.response?.status === 403 || error.response?.data?.code === 'CSRF_INVALID') {
        alert('Security token expired. Please refresh the page and try again.');
      } else {
        alert(`Failed to load demo credentials: ${error.message}`);
      }
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
