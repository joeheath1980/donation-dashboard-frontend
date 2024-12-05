import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styles from '../BusinessSignup.module.css';
import cleanStyles from './CleanDesign.module.css';

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
      const response = await axios.get('http://localhost:3002/api/charities/me', {
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
      const response = await axios.post('http://localhost:3002/api/charities/signup', formData, {
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

  const formStyles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box'
    },
    inputContainer: {
      width: '100%',
      marginBottom: '20px'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid var(--border-light)',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid var(--border-light)',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid var(--border-light)',
      fontSize: '16px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    }
  };

  return (
    <div className={cleanStyles.container}>
      <div style={formStyles.container}>
        <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
          <h2 className={cleanStyles.gradientTitle}>Charity Signup</h2>
          {error && <div className={`${cleanStyles.description} ${styles.error}`}>{error}</div>}
          {successMessage && <div className={`${cleanStyles.description} ${styles.success}`}>{successMessage}</div>}
          
          <form onSubmit={handleSubmit} className={cleanStyles.flexColumn}>
            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Charity Name</label>
              <input
                type="text"
                name="charityName"
                value={formData.charityName}
                onChange={handleInputChange}
                required
                style={formStyles.input}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
                style={formStyles.input}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                style={formStyles.input}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                style={formStyles.textarea}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Mission Statement</label>
              <textarea
                name="missionStatement"
                value={formData.missionStatement}
                onChange={handleInputChange}
                required
                style={formStyles.textarea}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Tax ID / EIN</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                required
                style={formStyles.input}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                style={formStyles.select}
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

            <button 
              type="submit" 
              className={cleanStyles.button}
              style={{ 
                background: 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                width: '100%',
                padding: '15px',
                fontSize: '18px',
                marginTop: '20px',
                cursor: 'pointer',
                transition: 'opacity 0.3s ease'
              }}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CharitySignup;