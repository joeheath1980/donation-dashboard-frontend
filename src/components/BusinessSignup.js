import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../BusinessSignup.module.css';

function BusinessSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    password: '',
    description: '',
    preferredCauses: [],
  });

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
    try {
      const response = await axios.post('http://localhost:3002/api/business/signup', formData);
      if (response.status === 201) {
        console.log('Business registered successfully:', response.data);
        // Redirect to the business dashboard
        navigate('/business-dashboard');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Failed to sign up. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Business Signup</h2>
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default BusinessSignup;