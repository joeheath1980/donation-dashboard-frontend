import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../BusinessSignup.module.css';
import cleanStyles from './CleanDesign.module.css';

function BusinessSignup() {
  const navigate = useNavigate();
  const { businessSignup } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    password: '',
    description: '',
    preferredCauses: [],
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      await businessSignup(formData);
      console.log('Business registered and logged in successfully');
      navigate('/business-dashboard');
    } catch (error) {
      console.error('Error during signup:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    } finally {
      setLoading(false);
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
      boxSizing: 'border-box',
      minHeight: '150px'
    }
  };

  return (
    <div className={cleanStyles.container}>
      <div style={formStyles.container}>
        <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
          <h2 className={cleanStyles.gradientTitle}>Business Signup</h2>
          {error && <div className={`${cleanStyles.description} ${styles.error}`}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={cleanStyles.flexColumn}>
            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
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
                style={formStyles.input}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Company Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                style={formStyles.textarea}
              />
            </div>

            <div style={formStyles.inputContainer}>
              <label className={cleanStyles.description}>Preferred Causes (Hold Ctrl/Cmd to select multiple)</label>
              <select
                multiple
                name="preferredCauses"
                value={formData.preferredCauses}
                onChange={handleMultiSelect}
                required
                style={formStyles.select}
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
              className={cleanStyles.button}
              style={{ 
                background: loading ? 'var(--border-light)' : 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                width: '100%',
                padding: '15px',
                fontSize: '18px',
                marginTop: '20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.3s ease'
              }}
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BusinessSignup;