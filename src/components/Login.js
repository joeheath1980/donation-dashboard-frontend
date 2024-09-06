import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../Login.module.css';
import logo from '../assets/download.svg';

// Set a default API URL if the environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin } = useAuth();

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
      console.log('Attempting login with:', email, password);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Error logging in:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || 'Failed to log in. Please try again.');
    }
  };

  const handleSocialLogin = (provider) => {
    const url = `${API_URL}/api/auth/${provider}`;
    console.log('Social login URL:', url);
    window.location.href = url;
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
          <button type="submit">Login</button>
          {error && <p className={styles.formError}>{error}</p>}
        </form>

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

        <p className={styles.toggleText}>
          <Link to="/signup">Need an account? Sign Up</Link>
        </p>
        <p className={styles.organizationSignup}>
          <a href="/organization-signup">Are you a charity or organization? Sign up here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
