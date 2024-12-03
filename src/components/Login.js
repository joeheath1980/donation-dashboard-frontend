import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../Login.module.css';
import cleanStyles from './CleanDesign.module.css';
import logo from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, businessLogin, charityLogin, socialLogin, API_URL } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('error');
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
    }

    const token = params.get('token');
    if (token) {
      handleSocialLoginCallback(token);
    }
  }, [location, handleSocialLoginCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

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
        loginResult = await charityLogin(email, password);
        console.log('Charity login result:', loginResult);
        console.log('Navigating to /charity-dashboard');
        navigate('/charity-dashboard');
      } else {
        loginResult = await login(email, password);
        console.log('User login result:', loginResult);

        if (loginResult && loginResult.isAdmin) {
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
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const url = `${API_URL}/api/auth/${provider}`;
    console.log('Social login URL:', url);
    window.location.href = url;
  };

  return (
    <div className={`${styles.pageContainer} ${cleanStyles.container}`}>
      <div className={`${styles.loginContainer} ${cleanStyles.card}`}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h2 className={cleanStyles.heading}>Login</h2>
        {error && (
          <p className={`${styles.error} ${cleanStyles.error}`} role="alert">
            {error}
          </p>
        )}
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
              className={cleanStyles.input}
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
              className={cleanStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="accountType">Account Type:</label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className={cleanStyles.select}
            >
              <option value="user">User</option>
              <option value="business">Business</option>
              <option value="charity">Charity</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className={cleanStyles.button}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        {accountType === 'user' && (
          <div className={styles.socialLogin}>
            <h3>Or login with:</h3>
            <button
              onClick={() => handleSocialLogin('google')}
              className={`${styles.socialButton} ${styles.google} ${cleanStyles.button}`}
            >
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('microsoft')}
              className={`${styles.socialButton} ${styles.microsoft} ${cleanStyles.button}`}
            >
              Microsoft
            </button>
            <button
              onClick={() => handleSocialLogin('apple')}
              className={`${styles.socialButton} ${styles.apple} ${cleanStyles.button}`}
              disabled
              title="Apple login is coming soon"
            >
              Apple (Coming Soon)
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className={`${styles.socialButton} ${styles.facebook} ${cleanStyles.button}`}
              disabled
              title="Facebook login is coming soon"
            >
              Facebook (Coming Soon)
            </button>
          </div>
        )}

        <p className={styles.toggleText}>
          <Link to="/signup" className={cleanStyles.link}>Need an account? Sign Up</Link>
        </p>
        <p className={styles.organizationSignup}>
          <Link to="/organization-signup" className={cleanStyles.link}>Are you a charity or organization? Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;