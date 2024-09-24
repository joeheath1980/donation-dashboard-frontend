// src/components/SignUp.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../SignUp.module.css';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Real-time validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError('Please enter a valid email address.');
      } else {
        setError('');
      }
    }
    if (name === 'password' && value.length > 0 && value.length < 6) {
      setError('Password must be at least 6 characters long.');
    } else if (name === 'password') {
      setError('');
    }
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    if (name.trim().length < 2) {
      setError('Full Name must be at least 2 characters long.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return false;
    }
    return true;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { name, email, password } = formData;
      console.log('Attempting to sign up user:', { name, email });
      const result = await userSignup(name, email, password);
      console.log('Signup successful:', result);
      setSuccess('Registration successful! Redirecting to your profile...');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during registration. Please try again.';
      if (error.message === 'A user with this email already exists. Please try logging in or use a different email.') {
        errorMessage = error.message;
      } else if (error.response && error.response.data) {
        errorMessage = error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(`Error: ${errorMessage}`);
      console.error('Detailed error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    const url = `${API_URL}/api/auth/${provider}`;
    console.log(`Redirecting to ${provider} signup:`, url);
    window.location.href = url;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.signupContainer}>
        <img src={logo} alt="Do-Nation Logo" className={styles.logo} />
        <h2>Create an Account</h2>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {success && <p className={styles.success} role="alert">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              aria-describedby="nameError"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              aria-describedby="emailError"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                aria-describedby="passwordError"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.toggleButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              aria-describedby="confirmPasswordError"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className={styles.socialLogin}>
          <h3>Or sign up with:</h3>
          <button 
            onClick={() => handleSocialSignup('google')} 
            className={`${styles.socialButton} ${styles.google}`}
          >
            Google
          </button>
          <button 
            onClick={() => handleSocialSignup('microsoft')} 
            className={`${styles.socialButton} ${styles.microsoft}`}
            disabled
            title="Microsoft signup is coming soon"
          >
            Microsoft (Coming Soon)
          </button>
          <button 
            onClick={() => handleSocialSignup('apple')} 
            className={`${styles.socialButton} ${styles.apple}`}
            disabled
            title="Apple signup is coming soon"
          >
            Apple (Coming Soon)
          </button>
          <button 
            onClick={() => handleSocialSignup('facebook')} 
            className={`${styles.socialButton} ${styles.facebook}`}
            disabled
            title="Facebook signup is coming soon"
          >
            Facebook (Coming Soon)
          </button>
        </div>

        <p className={styles.toggleText}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
