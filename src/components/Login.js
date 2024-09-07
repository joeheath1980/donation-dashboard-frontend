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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isBusiness, setIsBusiness] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin, businessLogin } = useAuth();

  const handleSocialLoginCallback = useCallback(async (token) => {
    try {
      await socialLogin(token);
      navigate('/');
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
    setError(null);
    try {
      console.log('Attempting login with:', email, password, 'Is Business:', isBusiness);
      if (isBusiness) {
        console.log('Starting business login process');
        const result = await businessLogin(email, password);
        console.log('Business login result:', result);
        console.log('Navigating to /business-dashboard');
        navigate('/business-dashboard');
        console.log('Navigation complete');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to log in. Please try again.');
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
    setIsBusiness(true);
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

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={isBusiness}
                onChange={(e) => setIsBusiness(e.target.checked)}
              />
              Business Account
            </label>
          </div>
          <button type="submit">Login</button>
          {error && <p className={styles.formError}>{error}</p>}
        </form>

        {!isBusiness && (
          <div className={styles.socialLogin}>
            <h3>Or login with:</h3>
            <button 
              onClick={() => handleSocialLogin('google')} 
              style={{backgroundColor: '#DB4437', color: 'white', marginBottom: '10px'}}
            >
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('microsoft')} 
              style={{backgroundColor: '#0072C6', color: 'white', marginBottom: '10px'}}
            >
              Microsoft (Coming Soon)
            </button>
            <button 
              onClick={() => handleSocialLogin('apple')} 
              style={{backgroundColor: '#000000', color: 'white'}}
            >
              Apple (Coming Soon)
            </button>
          </div>
        )}

        <p className={styles.toggleText}>
          <Link to="/signup">Need an account? Sign Up</Link>
        </p>
        <p className={styles.organizationSignup}>
          <a href="/organization-signup">Are you a charity or organization? Sign up here</a>
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div>
            <button onClick={fillTestBusinessCredentials} style={{marginTop: '20px'}}>
              Fill Test Business Credentials
            </button>
            <button onClick={createTestBusinessAccount} style={{marginTop: '10px'}}>
              Create Test Business Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
