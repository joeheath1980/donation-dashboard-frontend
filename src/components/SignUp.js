import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
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
    password: { valid: true, message: '', strength: 0, requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }},
    confirmPassword: { valid: true, message: '' }
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    const newValidations = { ...validations };
    
    if (touched[name] || name === 'password') {
      switch (name) {
        case 'name':
          const nameValidation = validateName(value);
          newValidations.name = nameValidation;
          break;
        case 'email':
          const emailValidation = validateEmail(value);
          newValidations.email = emailValidation;
          break;
        case 'password':
          const passwordValidation = validatePassword(value);
          newValidations.password = passwordValidation;
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
    }
    setValidations(newValidations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    // Validate all fields
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValid = formData.password === formData.confirmPassword;

    const currentValidations = {
      name: nameValidation,
      email: emailValidation,
      password: passwordValidation,
      confirmPassword: {
        valid: confirmPasswordValid,
        message: !confirmPasswordValid ? 'Passwords do not match' : ''
      }
    };

    setValidations(currentValidations);

    const formIsValid = nameValidation.valid && 
                       emailValidation.valid && 
                       passwordValidation.valid && 
                       confirmPasswordValid;

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
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const backendValidations = { ...validations };
        error.response.data.details.forEach(detail => {
          if (detail.field === 'email') {
            backendValidations.email = { valid: false, message: detail.message };
          } else if (detail.field === 'password') {
            backendValidations.password = { ...backendValidations.password, valid: false, message: detail.message };
          } else if (detail.field === 'name') {
            backendValidations.name = { valid: false, message: detail.message };
          }
        });
        setValidations(backendValidations);
        setError('Please correct the validation errors.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
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
              onBlur={handleBlur}
              placeholder="Enter your full name"
              required
              className={!validations.name.valid && touched.name ? styles.error : ''}
            />
            {!validations.name.valid && touched.name && (
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
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
              className={!validations.email.valid && touched.email ? styles.error : ''}
            />
            {!validations.email.valid && touched.email && (
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
                onBlur={handleBlur}
                placeholder="Create a password"
                required
                className={!validations.password.valid && touched.password ? styles.error : ''}
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
              <PasswordStrengthIndicator 
                password={formData.password}
                requirements={validations.password.requirements || {}}
                strength={validations.password.strength || 0}
              />
            )}
            {!validations.password.valid && touched.password && !formData.password && (
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
              onBlur={handleBlur}
              placeholder="Confirm your password"
              required
              className={!validations.confirmPassword.valid && touched.confirmPassword ? styles.error : ''}
            />
            {!validations.confirmPassword.valid && touched.confirmPassword && (
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