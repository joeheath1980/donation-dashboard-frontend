import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../BusinessSignup.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

function BusinessSignup() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useContext(ImpactContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    password: '',
    description: '',
    preferredCauses: [],
    logo: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, preferredCauses: values });
  };

  const handleFileUpload = (e) => {
    setFormData({ ...formData, logo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      try {
        const headers = getAuthHeaders();
        const response = await axios.post('http://localhost:3002/api/business/signup', formData, {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 201) {
          console.log('Business signup successful:', response.data);
          setStep(3);
        } else {
          console.error('Failed to sign up:', response.statusText);
        }
      } catch (error) {
        console.error('Error during signup:', error);
        alert('Failed to sign up. Please try again.');
      }
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleSubmit}>
      <h2>Business Registration</h2>
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
      <button type="submit">Next</button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit}>
      <h2>Business Profile</h2>
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
        {/* Add more options as needed */}
      </select>
      <input
        type="file"
        name="logo"
        onChange={handleFileUpload}
        accept="image/*"
      />
      <button type="submit">Complete Signup</button>
    </form>
  );

  const renderCompletion = () => (
    <div>
      <h2>Signup Complete!</h2>
      <p>Thank you for registering your business. You can now create campaigns and start matching donations.</p>
      <button onClick={() => navigate('/business-dashboard')}>Go to Dashboard</button>
    </div>
  );

  return (
    <div className={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderCompletion()}
    </div>
  );
}

export default BusinessSignup;