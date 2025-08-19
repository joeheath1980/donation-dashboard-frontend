import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './BusinessSignup.module.css';
import './SharedStyles.css';

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
    <div className={`${styles.container} container`}>
      <div className={`${styles.card} card`}>
        <h2 className={`${styles.title} gradientTitle`}>Start Your Business Impact Journey</h2>
        <p className={styles.subtitle}>Join Do-Nation to amplify your company's charitable giving and engage your employees</p>
        {error && <div className={`${styles.error} error`}>{error}</div>}
        {successMessage && <div className={`${styles.success} success`}>{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className={`${styles.form} flexColumn`}>
          <div className={styles.inputContainer}>
            <label className={`${styles.label} description`} htmlFor="companyName">Company Name *</label>
            <input
              placeholder="Enter your company name"
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
            <label className={`${styles.label} description`} htmlFor="contactEmail">Business Email *</label>
            <input
              placeholder="your.name@company.com"
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
            <label className={`${styles.label} description`} htmlFor="password">Password *</label>
            <div className={styles.passwordRequirements}>
              <small className={styles.hint}>Password must contain:</small>
              <ul className={styles.requirementsList}>
                <li>At least 12 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>
            <input
              placeholder="Create a secure password (min 12 characters)"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="12"
              className={styles.input}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={`${styles.label} description`} htmlFor="description">Tell us about your company *</label>
            <small className={styles.hint}>Brief description of your business and charitable goals</small>
            <textarea
              placeholder="e.g., We're a tech company focused on sustainable solutions..."
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className={styles.textarea}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={`${styles.label} description`} htmlFor="preferredCauses">Preferred Charitable Causes *</label>
            <small className={styles.hint}>Hold Ctrl/Cmd to select multiple causes</small>
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
            className={`${styles.button} button`}
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