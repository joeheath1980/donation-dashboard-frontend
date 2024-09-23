// src/components/Login.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from '../Login.module.css';
import logo from '../assets/download.svg';

// Set a default API URL if the environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Test business credentials
const TEST_BUSINESS_EMAIL = 'testbusiness@example.com';
const TEST_BUSINESS_PASSWORD = 'testpassword123';

// Test user credentials
const TEST_USER_EMAIL = 'john@example.com';
const TEST_USER_PASSWORD = 'password123';

// Test admin credentials
const TEST_ADMIN_EMAIL = 'admin@example.com';
const TEST_ADMIN_PASSWORD = 'adminpassword123';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin, businessLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('user'); // 'user', 'business', or 'charity'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Callback to handle social login tokens
  const handleSocialLoginCallback = useCallback(async (token) => {
    try {
      await socialLogin(token);
      navigate('/profile');
    } catch (err) {
      console.error('Error handling social login callback:', err);
      setError('Failed to complete social login. Please try again.');
    }
  }, [socialLogin, navigate]);

  useEffect(() => {
    // Check for token in URL after social login redirect
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      handleSocialLoginCallback(token);
    }
  }, [location, handleSocialLoginCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset any previous errors

    // Basic client-side validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true); // Set loading to true during authentication

    try {
      console.log('Attempting login with:', email, password, 'Account Type:', accountType);
      let loginResult;
      
      if (accountType === 'business') {
        console.log('Starting business login process');
        loginResult = await businessLogin(email, password);
        console.log('Business login result:', loginResult);
        console.log('Navigating to /business-dashboard');
        navigate('/business-dashboard');
      } else if (accountType === 'charity') {
        console.log('Starting charity login process');
        const response = await axios.post(`${API_URL}/api/charity/login`, { contactEmail: email, password });
        loginResult = response.data;
        console.log('Charity login result:', loginResult);
        localStorage.setItem('token', loginResult.token);
        navigate('/charity-dashboard');
      } else {
        loginResult = await login(email, password);
        console.log('User login result:', loginResult);
        
        // Check if the user is an admin
        if (loginResult && loginResult.email === TEST_ADMIN_EMAIL) {
          console.log('Admin user detected, navigating to /admin');
          navigate('/admin');
        } else {
          console.log('Regular user, navigating to /profile');
          navigate('/profile');
        }
      }
    } catch (err) {
      console.error('Error logging in:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false); // Set loading to false after authentication attempt
    }
  };

  const handleSocialLogin = (provider) => {
    const url = `${API_URL}/api/auth/${provider}`;
    console.log('Social login URL:', url);
    window.location.href = url;
  };

  const fillTestBusinessCredentials = () => {
    setEmail(TEST_BUSINESS_EMAIL);
    setPassword(TEST_BUSINESS_PASSWORD);
    setAccountType('business');
  };

  const fillTestUserCredentials = () => {
    setEmail(TEST_USER_EMAIL);
    setPassword(TEST_USER_PASSWORD);
    setAccountType('user');
  };

  const fillTestAdminCredentials = () => {
    setEmail(TEST_ADMIN_EMAIL);
    setPassword(TEST_ADMIN_PASSWORD);
    setAccountType('user');
  };

  const createTestBusinessAccount = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/business/create-test-account`);
      if (response.status === 201) {
        alert('Test business account created successfully. You can now log in with the test credentials.');
        fillTestBusinessCredentials();
      } else if (response.status === 200) {
        alert('Test business account is ready to use. You can now log in with the test credentials.');
        fillTestBusinessCredentials();
      } else {
        alert('Unexpected response. Please check the console for more details.');
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error creating/ensuring test business account:', error);
      alert('Error with test business account. Check the console for more details.');
    }
  };

  const createTestAdminAccount = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/users/create-test-admin`);
      if (response.status === 201) {
        alert('Test admin account created successfully. You can now log in with the admin credentials.');
        fillTestAdminCredentials();
      } else if (response.status === 200) {
        alert('Test admin account is ready to use. You can now log in with the admin credentials.');
        fillTestAdminCredentials();
      } else {
        alert('Unexpected response. Please check the console for more details.');
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error creating/ensuring test admin account:', error);
      alert('Error with test admin account. Check the console for more details.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h2>Login</h2>
        {error && <p className={styles.error} role="alert">{error}</p>} {/* Display error message */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              aria-describedby="emailError"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              aria-describedby="passwordError"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Account Type:</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="user">User</option>
              <option value="business">Business</option>
              <option value="charity">Charity</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        {accountType === 'user' && (
          <div className={styles.socialLogin}>
            <h3>Or login with:</h3>
            <button 
              onClick={() => handleSocialLogin('google')} 
              className={`${styles.socialButton} ${styles.google}`}
            >
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('microsoft')} 
              className={`${styles.socialButton} ${styles.microsoft}`}
              disabled // Coming Soon
              title="Microsoft login is coming soon"
            >
              Microsoft (Coming Soon)
            </button>
            <button 
              onClick={() => handleSocialLogin('apple')} 
              className={`${styles.socialButton} ${styles.apple}`}
              disabled // Coming Soon
              title="Apple login is coming soon"
            >
              Apple (Coming Soon)
            </button>
            <button 
              onClick={() => handleSocialLogin('facebook')} 
              className={`${styles.socialButton} ${styles.facebook}`}
              disabled // Coming Soon
              title="Facebook login is coming soon"
            >
              Facebook (Coming Soon)
            </button>
          </div>
        )}

        <p className={styles.toggleText}>
          <Link to="/signup">Need an account? Sign Up</Link>
        </p>
        <p className={styles.organizationSignup}>
          <Link to="/organization-signup">Are you a charity or organization? Sign up here</Link>
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className={styles.testButtons}>
            <button onClick={fillTestUserCredentials}>
              Fill Test User Credentials
            </button>
            <button onClick={fillTestBusinessCredentials}>
              Fill Test Business Credentials
            </button>
            <button onClick={fillTestAdminCredentials}>
              Fill Test Admin Credentials
            </button>
            <button onClick={createTestBusinessAccount}>
              Create Test Business Account
            </button>
            <button onClick={createTestAdminAccount}>
              Create Test Admin Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
