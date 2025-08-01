import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaMicrosoft, FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import styles from './SignUp.module.css';
import logo from '../assets/logo.png';

const SignUp = () => {
  const navigate = useNavigate();
  const { userSignup } = useAuth();
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

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Medium';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return '';
    }
  };

  const getPasswordStrengthClass = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return styles.weak;
      case 2:
        return styles.medium;
      case 3:
        return styles.strong;
      case 4:
        return styles.veryStrong;
      default:
        return '';
    }
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

    let formIsValid = true;
    const currentValidations = { ...validations };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.name.trim().length < 2) {
        currentValidations.name = { valid: false, message: 'Name must be at least 2 characters' };
        formIsValid = false;
    }
    if (!emailRegex.test(formData.email)) {
        currentValidations.email = { valid: false, message: 'Please enter a valid email address' };
        formIsValid = false;
    }
    if (formData.password.length < 6) {
        currentValidations.password = { 
            valid: false, 
            message: 'Password must be at least 6 characters',
            strength: currentValidations.password.strength 
        };
        formIsValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
        currentValidations.confirmPassword = { valid: false, message: 'Passwords do not match' };
        formIsValid = false;
    }

    setValidations(currentValidations);

    if (!formIsValid) {
        setError('Please correct the errors in the form');
        return;
    }

    setLoading(true);
    try {
      const result = await userSignup(formData.name, formData.email, formData.password);
      // userSignup returns the user object on success
      if (result) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Use the error message from the catch block
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`Signup with ${provider}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.signupContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h2 className={styles.title}>Create Account</h2>

        {error && (
          <div className={styles.error}>
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={styles.success}>
            <FaCheckCircle />
            <span>{success}</span>
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
            <label htmlFor="email">Email Address</label>
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
                onClick={togglePasswordVisibility}
                className={styles.toggleButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.password && (
              <>
                <div className={styles.passwordStrength}>
                  <div 
                    className={`${styles.passwordStrengthBar} ${getPasswordStrengthClass(validations.password.strength)}`}
                  />
                </div>
                <span className={styles.passwordStrengthText}>
                  {getPasswordStrengthText(validations.password.strength)}
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
            disabled={loading} 
            className={styles.submitButton}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.socialLogin}>
          <h3>Or sign up with</h3>
          <div className={styles.socialButtons}>
            <button
              type="button"
              onClick={() => handleSocialSignup('Google')}
              className={`${styles.socialButton} ${styles.google}`}
              disabled={loading}
            >
              <FaGoogle />
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialSignup('Microsoft')}
              className={`${styles.socialButton} ${styles.microsoft}`}
              disabled={loading}
            >
              <FaMicrosoft />
              <span>Continue with Microsoft</span>
            </button>
          </div>
        </div>

        <div className={styles.toggleText}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;