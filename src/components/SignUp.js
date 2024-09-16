import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from '../Login.module.css';
import logo from '../assets/download.svg';

// Set a default API URL if the environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/users/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log('User registered successfully:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored in localStorage');
        
        // Set user in AuthContext
        setUser(response.data.user);
      } else {
        console.log('No token received from server');
        setError('Registration successful, but no token received. Please try logging in.');
        return;
      }
      
      // Navigate to the onboarding page
      console.log('Navigating to onboarding page');
      navigate('/onboarding/mail-scraper');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        setError(error.response.data.error || 'An error occurred during registration. Please try again.');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setError('No response received from the server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleSocialSignup = (provider) => {
    const url = `${API_URL}/api/auth/${provider}`;
    console.log('Social signup URL:', url);
    window.location.href = url;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <img src={logo} alt="Do-Nation Logo" className={styles.logo} />
        <h2>Create an Account</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Sign Up</button>
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
          >
            Microsoft (Coming Soon)
          </button>
          <button 
            onClick={() => handleSocialSignup('apple')} 
            className={`${styles.socialButton} ${styles.apple}`}
          >
            Apple (Coming Soon)
          </button>
          <button 
            onClick={() => handleSocialSignup('facebook')} 
            className={`${styles.socialButton} ${styles.facebook}`}
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