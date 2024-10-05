// src/components/BusinessSignup.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../BusinessSignup.module.css';

function BusinessSignup() {
  const navigate = useNavigate();
  const { businessSignup } = useAuth(); // Destructure businessSignup from AuthContext
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    password: '',
    description: '',
    preferredCauses: [],
  });

  const [error, setError] = useState(null); // State to handle signup errors
  const [loading, setLoading] = useState(false); // State to handle loading status

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
    setError(null); // Reset any previous errors
    setLoading(true); // Set loading to true during signup

    try {
      await businessSignup(formData);
      console.log('Business registered and logged in successfully');
      // Redirect to the business dashboard after successful signup
      navigate('/business-dashboard');
    } catch (error) {
      console.error('Error during signup:', error);
      // Handle different error scenarios
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    } finally {
      setLoading(false); // Set loading to false after signup attempt
    }
  };

  return (
    <div className={styles.container}>
      <h2>Business Signup</h2>
      {error && <div className={styles.error}>{error}</div>} {/* Display error message */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          placeholder="Company Name"
          required
        />
        <input
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleInputChange}
          placeholder="Contact Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Company Description"
          required
        />
        <select
          multiple
          name="preferredCauses"
          value={formData.preferredCauses}
          onChange={handleMultiSelect}
          required
        >
          <option value="education">Education</option>
          <option value="health">Health</option>
          <option value="environment">Environment</option>
          <option value="social-justice">Social Justice</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default BusinessSignup;
