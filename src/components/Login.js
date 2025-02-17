import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'react-icons/fa';
import styles from './Login.module.css';
import cleanStyles from './SharedStyles.css';
import logo from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, businessLogin, charityLogin, socialLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    accountType: 'user'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoginInProgress, setSocialLoginInProgress] = useState(false);

  const handleSocialLoginCallback = useCallback(async (token) => {
    try {
      setSocialLoginInProgress(true);
      await socialLogin(token);
      navigate('/profile');
    } catch (err) {
      console.error('Error handling social login callback:', err);
      setError('Failed to complete social login. Please try again.');
    } finally {
      setSocialLoginInProgress(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear any previous errors when user starts typing
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      let loginResult;
      switch (formData.accountType) {
        case 'business':
          loginResult = await businessLogin(formData.email, formData.password);
          navigate('/business-dashboard');
          break;
        case 'charity':
          loginResult = await charityLogin(formData.email, formData.password);
          navigate('/charity-dashboard');
          break;
        default:
          loginResult = await login(formData.email, formData.password);
          navigate(loginResult?.isAdmin ? '/admin' : '/profile');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (socialLoginInProgress) return;

    setSocialLoginInProgress(true);
    setError(null);

    // Store current URL for potential redirect back
    sessionStorage.setItem('loginRedirectUrl', window.location.href);

    // Redirect to the auth endpoint
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/auth/${provider}`;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Welcome Back</h1>

        {error && (
          <div className={styles.error} role="alert">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className={`${styles.loginInput} ${error ? styles.error : ''}`}
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className={`${styles.loginInput} ${error ? styles.error : ''}`}
                aria-invalid={error ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.toggleButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="accountType">Account Type</label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className={`${styles.loginInput} ${error ? styles.error : ''}`}
              aria-invalid={error ? 'true' : 'false'}
            >
              <option value="user">Personal Account</option>
              <option value="business">Business Account</option>
              <option value="charity">Charity Account</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || socialLoginInProgress}
            className={styles.loginButton}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {formData.accountType === 'user' && (
          <div className={styles.socialLogin}>
            <h3>Or continue with</h3>
            <div className={styles.socialButtons}>
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading || socialLoginInProgress}
                className={`${styles.loginSocialButton} ${styles.google}`}
                aria-label="Continue with Google"
              >
                <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span>{socialLoginInProgress ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('microsoft')}
                disabled={loading || socialLoginInProgress}
                className={`${styles.loginSocialButton} ${styles.microsoft}`}
                aria-label="Continue with Microsoft"
              >
                <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                  <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                </svg>
                <span>{socialLoginInProgress ? 'Connecting...' : 'Continue with Microsoft'}</span>
              </button>
            </div>
          </div>
        )}

        <div className={styles.links}>
          <Link to="/signup" className={styles.loginLink}>
            Need an account? Sign Up
          </Link>
          <Link to="/organization-signup" className={styles.loginLink}>
            Register as a Charity or Organization
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;