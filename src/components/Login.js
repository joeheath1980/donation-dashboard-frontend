import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import { createLogger } from '../utils/logger';
import { validateEmail, validatePassword } from '../utils/validation';
import { SecureTokenStorage } from '../utils/auth.utils';
import { useDemoMode } from '../hooks/useDemoMode';
import DemoQuickLogin from './DemoQuickLogin';
import RateLimitHandler, { useRateLimitHandler } from './Common/RateLimitHandler';
import apiServices from '../services/api.service';
import styles from './Login.module.css';
import logo from '../assets/logo.png';

const logger = createLogger('Login');

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, businessLogin, charityLogin, socialLogin } = useAuth();
  const { demoMode } = useDemoMode();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    accountType: 'user'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoginInProgress, setSocialLoginInProgress] = useState(false);
  const { rateLimitError, handleError: handleRateLimitError, clearError: clearRateLimitError } = useRateLimitHandler();
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const handleSocialLoginCallback = useCallback(async (token) => {
    try {
      setSocialLoginInProgress(true);
      const userData = await socialLogin(token);
      // Set the current user ID for social login
      localStorage.setItem('currentUserId', userData._id || userData.id);
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
      console.log('Token found in URL, handling social login callback');
      handleSocialLoginCallback(token);
    } else {
      // Make sure socialLoginInProgress is false if there's no token
      setSocialLoginInProgress(false);
    }

    // Handle demo mode auto-fill
    const demoType = searchParams.get('demo');
    const demoCategory = searchParams.get('category');
    if (demoType && demoMode?.enabled) {
      handleDemoAutoFill(demoType, demoCategory);
    }
  }, [location, handleSocialLoginCallback, searchParams, demoMode]);

  const handleDemoAutoFill = async (type, category) => {
    try {
      const api = apiServices.client;
      const response = await api.post('/api/demo/quick-login', 
        { userType: type, category: category || 'user' }
      );
      
      setFormData({
        email: response.data.email,
        password: response.data.password,
        accountType: category || 'user'
      });
    } catch (error) {
      console.error('Error loading demo credentials:', error);
    }
  };

  const handleCredentialsFill = (email, password, accountType) => {
    console.log('handleCredentialsFill called with:', { email, password, accountType });
    console.log('Email type:', typeof email, 'Password type:', typeof password);
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      console.error('Invalid credentials passed to handleCredentialsFill');
      console.error('Email:', email, 'Password:', password);
      return;
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        email,
        password,
        accountType: accountType || prev.accountType
      };
      console.log('Setting form data to:', newData);
      return newData;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear any previous errors when user starts typing
    setError(null);
    
    // Validate on change if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let fieldError = '';
    
    if (name === 'email') {
      const emailValidation = validateEmail(value);
      if (!emailValidation.valid) {
        fieldError = emailValidation.message;
      }
    } else if (name === 'password' && value) {
      // For login, we only check if password is provided, not strength
      if (value.length === 0) {
        fieldError = 'Password is required';
      }
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    return fieldError === '';
  };

  // Debug logging
  console.log('Login component state:', { loading, socialLoginInProgress, formData });

  const handleSubmit = async (e) => {
    console.log('handleSubmit called!');
    e.preventDefault();
    setError(null);
    clearRateLimitError();

    // Validate all fields
    const emailValid = validateField('email', formData.email);
    const passwordValid = formData.password.length > 0;
    
    setTouched({ email: true, password: true });
    
    if (!emailValid) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    }
    
    if (!passwordValid) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
    }
    
    if (!emailValid || !passwordValid) {
      setError('Please correct the errors below.');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting login with email:', formData.email, 'accountType:', formData.accountType);
      console.log('FormData at login:', formData);
      let loginResult;
      switch (formData.accountType) {
        case 'business':
          loginResult = await businessLogin(formData.email, formData.password);
          // For business logins, set the currentUserId using either _id or businessId
          console.log('Business login successful:', loginResult);
          logger.debug('Business login successful');
          localStorage.setItem(STORAGE_KEYS.USER_ID, loginResult._id || loginResult.businessId);
          // Small delay to ensure state updates complete
          setTimeout(() => {
            navigate('/business-dashboard');
          }, 100);
          break;
        case 'charity':
          loginResult = await charityLogin(formData.email, formData.password);
          // For charity logins, set the currentUserId using either _id or id
          console.log('Charity login successful:', loginResult);
          logger.debug('Charity login successful');
          localStorage.setItem(STORAGE_KEYS.USER_ID, loginResult._id || loginResult.id);
          // Small delay to ensure state updates complete
          setTimeout(() => {
            navigate('/charity-dashboard');
          }, 100);
          break;
        default:
          console.log('Calling login function...');
          loginResult = await login(formData.email, formData.password);
          // For regular user logins, set the currentUserId using either _id or id
          console.log('User login successful:', loginResult);
          logger.debug('User login successful', { loginResult });
          const userId = loginResult._id || loginResult.id;
          if (userId) {
            localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
            localStorage.setItem('currentUserId', userId); // Also set with direct key for compatibility
          } else {
            logger.error('No user ID found in login result', { loginResult });
          }
          
          // Verify token was stored
          const storedToken = SecureTokenStorage.getToken();
          console.log('Token stored after login:', !!storedToken);
          
          const targetPath = loginResult?.isAdmin ? '/admin' : '/dashboard';
          console.log('Navigating to:', targetPath);
          
          // Increased delay to ensure all state updates complete
          setTimeout(() => {
            console.log('Executing navigation to:', targetPath);
            navigate(targetPath, { replace: true });
          }, 500); // Increased to 500ms
      }
    } catch (err) {
      console.error('Login error caught:', err);
      logger.error('Login error', { message: err.message });
      
      // Check if it's a rate limit error
      if (handleRateLimitError(err)) {
        // Rate limit error is handled by the handler
        return;
      }
      
      // Handle validation errors from backend
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const validationErrors = {};
        err.response.data.details.forEach(detail => {
          if (detail.field === 'email' || detail.field === 'password') {
            validationErrors[detail.field] = detail.message;
          }
        });
        setFieldErrors(prev => ({ ...prev, ...validationErrors }));
        setError('Please correct the validation errors.');
      } else {
        setError(err.response?.data?.message || 'Failed to log in. Please try again.');
      }
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
    window.location.href = `${API_CONFIG.BASE_URL}/api/auth/${provider}`;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Welcome Back</h1>

        {rateLimitError && (
          <RateLimitHandler 
            error={rateLimitError} 
            onRetry={() => {
              clearRateLimitError();
              handleSubmit({ preventDefault: () => {} });
            }}
          />
        )}
        
        {error && !rateLimitError && (
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
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
              className={`${styles.loginInput} ${fieldErrors.email ? styles.error : ''}`}
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && touched.email && (
              <span id="email-error" className={styles.fieldError}>
                {fieldErrors.email}
              </span>
            )}
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
                onBlur={handleBlur}
                placeholder="Enter your password"
                required
                className={`${styles.loginInput} ${fieldErrors.password ? styles.error : ''}`}
                aria-invalid={fieldErrors.password ? 'true' : 'false'}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
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
            {fieldErrors.password && touched.password && (
              <span id="password-error" className={styles.fieldError}>
                {fieldErrors.password}
              </span>
            )}
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
            onClick={(e) => {
              console.log('Button clicked!', { loading, socialLoginInProgress, formData });
              if (!loading && !socialLoginInProgress) {
                console.log('Calling handleSubmit...');
              }
            }}
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

        {demoMode?.enabled && (
          <DemoQuickLogin onCredentialsFill={handleCredentialsFill} />
        )}
      </div>
    </div>
  );
}

export default Login;
