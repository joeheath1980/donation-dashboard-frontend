import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../BusinessSignup.module.css';

function CharitySignup() {
  const navigate = useNavigate();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:3002/api/charity/signup', formData);
      if (response.data && response.data.token) {
        console.log('Charity registered successfully');
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      } else {
        setError('Signup successful, but no token received. Please try logging in.');
      }
    } catch (error) {
      console.error('Error during signup:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        setError(error.response.data.errors.map(err => err.msg).join(', '));
      } else if (error.response?.data?.msg) {
        setError(error.response.data.msg);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2>Charity Signup</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="charityName"
          value={formData.charityName}
          onChange={handleInputChange}
          placeholder="Charity Name"
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
          minLength="6"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Charity Description"
          required
        />
        <textarea
          name="missionStatement"
          value={formData.missionStatement}
          onChange={handleInputChange}
          placeholder="Mission Statement"
          required
        />
        <input
          type="text"
          name="taxId"
          value={formData.taxId}
          onChange={handleInputChange}
          placeholder="Tax ID / EIN"
          required
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default CharitySignup;