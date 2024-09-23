// src/components/SignUp.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from '../SignUp.module.css'; // Renamed to SignUp.module.css for clarity
import logo from '../assets/download.svg';

// Set a default API URL if the environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const SignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Destructure setUser from AuthContext
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(''); // State to handle signup errors
  const [loading, setLoading] = useState(false); // State to handle loading status
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  // Handle input changes for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Real-time validation (optional)
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

  // Validate form data before submission
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset any previous errors

    if (!validateForm()) return;

    setLoading(true); // Set loading to true during signup

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
        
        // Fetch user details using the token
        const userResponse = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });
        console.log('User response:', userResponse.data);
        
        // Set user in AuthContext with isBusiness: false
        setUser({ ...userResponse.data, isBusiness: false });
      } else {
        console.log('No token received from server');
        setError('Registration successful, but no token received. Please try logging in.');
        return;
      }
      
      // Navigate to the user dashboard or desired page after successful signup
      navigate('/profile');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        setError(error.response.data.message || 'An error occurred during registration. Please try again.');
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        setError('No response received from the server. Please check your internet connection and try again.');
      } else {
        // Something else happened while setting up the request
        console.error('Error message:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Set loading to false after signup attempt
    }
  };

  // Handle social signup (if applicable)
  const handleSocialSignup = (provider) => {
    const url = `${API_URL}/api/auth/${provider}`;
    console.log('Social signup URL:', url);
    window.location.href = url;
  };

  // Test credentials and account creation (visible only in development)
  const TEST_BUSINESS_EMAIL = 'testbusiness@example.com';
  const TEST_BUSINESS_PASSWORD = 'testpassword123';

  const TEST_USER_EMAIL = 'john@example.com';
  const TEST_USER_PASSWORD = 'password123';

  const TEST_ADMIN_EMAIL = 'admin@example.com';
  const TEST_ADMIN_PASSWORD = 'adminpassword123';

  const fillTestUserCredentials = () => {
    setFormData({
      name: 'Test User',
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      confirmPassword: TEST_USER_PASSWORD,
    });
  };

  const fillTestAdminCredentials = () => {
    setFormData({
      name: 'Admin User',
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
      confirmPassword: TEST_ADMIN_PASSWORD,
    });
  };

  const createTestBusinessAccount = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/business/create-test-account`);
      if (response.status === 201) {
        alert('Test business account created successfully. You can now log in with the test credentials.');
        // Optionally, redirect or inform the user
      } else if (response.status === 200) {
        alert('Test business account is ready to use. You can now log in with the test credentials.');
      } else {
        alert('Unexpected response. Please check the console for more details.');
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error creating/ensuring test business account:', error);
      alert('Error with test business account. Check the console for more details.');
    }
  };

  const createTestAdminAccount = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/users/create-test-admin`);
      if (response.status === 201) {
        alert('Test admin account created successfully. You can now log in with the admin credentials.');
        fillTestAdminCredentials();
      } else if (response.status === 200) {
        alert('Test admin account is ready to use. You can now log in with the admin credentials.');
        fillTestAdminCredentials();
      } else {
        alert('Unexpected response. Please check the console for more details.');
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error creating/ensuring test admin account:', error);
      alert('Error with test admin account. Check the console for more details.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.signupContainer}>
        <img src={logo} alt="Do-Nation Logo" className={styles.logo} />
        <h2>Create an Account</h2>
        {error && <p className={styles.error} role="alert">{error}</p>} {/* Display error message */}
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
              <button type="button" onClick={togglePasswordVisibility} className={styles.toggleButton} aria-label={showPassword ? "Hide password" : "Show password"}>
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
            disabled // Coming Soon
            title="Microsoft signup is coming soon"
          >
            Microsoft (Coming Soon)
          </button>
          <button 
            onClick={() => handleSocialSignup('apple')} 
            className={`${styles.socialButton} ${styles.apple}`}
            disabled // Coming Soon
            title="Apple signup is coming soon"
          >
            Apple (Coming Soon)
          </button>
          <button 
            onClick={() => handleSocialSignup('facebook')} 
            className={`${styles.socialButton} ${styles.facebook}`}
            disabled // Coming Soon
            title="Facebook signup is coming soon"
          >
            Facebook (Coming Soon)
          </button>
        </div>

        <p className={styles.toggleText}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className={styles.testButtons}>
            <button onClick={fillTestUserCredentials}>
              Fill Test User Credentials
            </button>
            <button onClick={fillTestAdminCredentials}>
              Fill Test Admin Credentials
            </button>
            <button onClick={createTestBusinessAccount}>
              Create Test Business Account
            </button>
            <button onClick={createTestAdminAccount}>
              Create Test Admin Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
