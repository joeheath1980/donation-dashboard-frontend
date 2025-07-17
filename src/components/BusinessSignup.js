import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './BusinessSignup.module.css';
import sharedStyles from './SharedStyles.css';

function BusinessSignup() {
  const navigate = useNavigate();
  const { businessSignup, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    password: '',
    description: '',
    preferredCauses: [],
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
      navigate('/business-dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, preferredCauses: values });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setLoading(true);

    try {
      await businessSignup(formData);
      setSuccessMessage('Business registered successfully');
      setTimeout(() => {
        navigate('/business-onboarding');
      }, 2000);
    } catch (error) {
      console.error('Error during signup:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${styles.container} ${sharedStyles.container}`}>
      <div className={`${styles.card} ${sharedStyles.card}`}>
        <h2 className={`${styles.title} ${sharedStyles.gradientTitle}`}>Business Signup</h2>
        {error && <div className={`${styles.error} ${sharedStyles.error}`}>{error}</div>}
        {successMessage && <div className={`${styles.success} ${sharedStyles.success}`}>{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className={`${styles.form} ${sharedStyles.flexColumn}`}>
          <div className={styles.inputContainer}>
            <label className={`${styles.label} ${sharedStyles.description}`} htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={`${styles.label} ${sharedStyles.description}`} htmlFor="contactEmail">Contact Email</label>
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
            <label className={`${styles.label} ${sharedStyles.description}`} htmlFor="password">Password</label>
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
            <label className={`${styles.label} ${sharedStyles.description}`} htmlFor="description">Company Description</label>
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
            <label className={`${styles.label} ${sharedStyles.description}`} htmlFor="preferredCauses">Preferred Causes (Hold Ctrl/Cmd to select multiple)</label>
            <select
              multiple
              id="preferredCauses"
              name="preferredCauses"
              value={formData.preferredCauses}
              onChange={handleMultiSelect}
              required
              className={styles.select}
            >
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="environment">Environment</option>
              <option value="social-justice">Social Justice</option>
              <option value="humanitarian">Humanitarian</option>
              <option value="animal-welfare">Animal Welfare</option>
              <option value="arts-culture">Arts and Culture</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={`${styles.button} ${sharedStyles.button}`}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BusinessSignup;