import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './SignUp.module.css';
import logo from '../assets/logo.png';

const SignUp = () => {
  const navigate = useNavigate();
  const { userSignup, API_URL } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validations, setValidations] = useState({
    name: { valid: true, message: '' },
    email: { valid: true, message: '' },
    password: { valid: true, message: '', strength: 0 },
    confirmPassword: { valid: true, message: '' }
  });

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const getPasswordStrengthClass = (strength) => {
    if (strength === 0) return '';
    if (strength === 1) return 'weak';
    if (strength === 2) return 'medium';
    if (strength === 3) return 'strong';
    return 'veryStrong';
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Medium';
    if (strength === 3) return 'Strong';
    return 'Very Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const newValidations = { ...validations };

    switch (name) {
      case 'name':
        newValidations.name = {
          valid: value.trim().length >= 2,
          message: value.trim().length < 2 ? 'Name must be at least 2 characters' : ''
        };
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        newValidations.email = {
          valid: emailRegex.test(value),
          message: !emailRegex.test(value) ? 'Please enter a valid email address' : ''
        };
        break;
      case 'password':
        const strength = validatePassword(value);
        newValidations.password = {
          valid: value.length >= 6,
          message: value.length < 6 ? 'Password must be at least 6 characters' : '',
          strength
        };
        if (formData.confirmPassword) {
          newValidations.confirmPassword = {
            valid: value === formData.confirmPassword,
            message: value !== formData.confirmPassword ? 'Passwords do not match' : ''
          };
        }
        break;
      case 'confirmPassword':
        newValidations.confirmPassword = {
          valid: value === formData.password,
          message: value !== formData.password ? 'Passwords do not match' : ''
        };
        break;
      default:
        break;
    }

    setValidations(newValidations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isValid = Object.values(validations).every(v => v.valid);
    if (!isValid) {
      setError('Please correct the errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const { name, email, password } = formData;
      await userSignup(name, email, password);
      setSuccess('Registration successful! Redirecting to your profile...');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      let errorMessage = 'An error occurred during registration.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.signupContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Create Your Account</h1>
        
        {error && (
          <div className={styles.error} role="alert">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div className={styles.success} role="alert">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className={!validations.name.valid ? styles.error : ''}
            />
            {!validations.name.valid && (
              <span className={`${styles.validationMessage} ${styles.error}`}>
                {validations.name.message}
              </span>
            )}
          </div>

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
              className={!validations.email.valid ? styles.error : ''}
            />
            {!validations.email.valid && (
              <span className={`${styles.validationMessage} ${styles.error}`}>
                {validations.email.message}
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
                placeholder="Create a password"
                required
                className={!validations.password.valid ? styles.error : ''}
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
            {formData.password && (
              <>
                <div className={styles.passwordStrength}>
                  <div 
                    className={`${styles.passwordStrengthBar} ${styles[getPasswordStrengthClass(validations.password.strength)]}`}
                  />
                </div>
                <span className={styles.passwordStrengthText}>
                  Password Strength: {getPasswordStrengthLabel(validations.password.strength)}
                </span>
              </>
            )}
            {!validations.password.valid && (
              <span className={`${styles.validationMessage} ${styles.error}`}>
                {validations.password.message}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className={!validations.confirmPassword.valid ? styles.error : ''}
            />
            {!validations.confirmPassword.valid && (
              <span className={`${styles.validationMessage} ${styles.error}`}>
                {validations.confirmPassword.message}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !Object.values(validations).every(v => v.valid)}
            className={styles.submitButton}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.socialLogin}>
          <h3>Or sign up with</h3>
          <div className={styles.socialButtons}>
            <button
              type="button"
              onClick={() => handleSocialSignup('google')}
              className={`${styles.socialButton} ${styles.google}`}
            >
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Continue with Google
            </button>
            
            <button
              type="button"
              onClick={() => handleSocialSignup('microsoft')}
              className={`${styles.socialButton} ${styles.microsoft}`}
            >
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>
        </div>

        <div className={styles.toggleText}>
          <Link to="/login">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;