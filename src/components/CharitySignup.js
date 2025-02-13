import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from './CharitySignup.module.css';

function CharitySignup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    charityName: '',
    contactEmail: '',
    password: '',
    description: '',
    missionStatement: '',
    taxId: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchCharityProfile = async (token) => {
    try {
      const response = await axios.get('process.env.API_BASE_URL/api/charities/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching charity profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      // Register charity
      const response = await axios.post('process.env.API_BASE_URL/api/charities/signup', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.token) {
        console.log('Charity registered successfully');
        const token = response.data.token;
        
        // Store token and user type
        localStorage.setItem('token', token);
        localStorage.setItem('userType', 'charity');
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setSuccessMessage(response.data.message || 'Charity registered successfully');

        try {
          // Fetch complete charity profile
          const charityProfile = await fetchCharityProfile(token);
          
          // Set the user in the AuthContext with complete profile data
          setUser({
            ...charityProfile,
            isCharity: true,
            token: token // Store token in context for easy access
          });

          // Redirect after a short delay to allow the user to see the success message
          setTimeout(() => {
            navigate('/charity-dashboard');
          }, 2000);
        } catch (profileError) {
          console.error('Error fetching charity profile:', profileError);
          setError('Account created but failed to fetch profile. Please try logging in.');
        }
      } else {
        setError('Signup successful, but no token received. Please try logging in.');
      }
    } catch (error) {
      console.error('Error during signup:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        setError(error.response.data.errors.map(err => err.msg).join(', '));
      } else if (error.response?.data?.msg) {
        setError(error.response.data.msg);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Charity Signup</h2>
        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="charityName">Charity Name</label>
            <input
              type="text"
              id="charityName"
              name="charityName"
              value={formData.charityName}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="contactEmail">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
              className={styles.input}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className={styles.textarea}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="missionStatement">Mission Statement</label>
            <textarea
              id="missionStatement"
              name="missionStatement"
              value={formData.missionStatement}
              onChange={handleInputChange}
              required
              className={styles.textarea}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="taxId">Tax ID / EIN</label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className={styles.select}
            >
              <option value="">Select a category</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="environment">Environment</option>
              <option value="social-justice">Social Justice</option>
              <option value="humanitarian">Humanitarian</option>
              <option value="animal-welfare">Animal Welfare</option>
              <option value="arts-culture">Arts and Culture</option>
            </select>
          </div>

          <button type="submit" className={styles.button}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default CharitySignup;