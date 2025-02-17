import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'react-icons/fa';
import styles from './SignUp.module.css';
import cleanStyles from './SharedStyles.css';
import logo from '../assets/logo.png';

const SignUp = () => {
  const navigate = useNavigate();
  const { userSignup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validations, setValidations] = useState({
    name: { valid: true, message: '' },
    email: { valid: true, message: '' },
    password: { valid: true, message: '', strength: 0 },
    confirmPassword: { valid: true, message: '' }
  });

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const getPasswordStrengthClass = (strength) => {
    if (strength === 0) return '';
    if (strength === 1) return 'weak';
    if (strength === 2) return 'medium';
    if (strength === 3) return 'strong';
    return 'veryStrong';
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Medium';
    if (strength === 3) return 'Strong';
    return 'Very Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const newValidations = { ...validations };

    switch (name) {
      case 'name':
        newValidations.name = {
          valid: value.trim().length >= 2,
          message: value.trim().length < 2 ? 'Name must be at least 2 characters' : ''
        };
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        newValidations.email = {
          valid: emailRegex.test(value),
          message: !emailRegex.test(value) ? 'Please enter a valid email address' : ''
        };
        break;
      case 'password':
        const strength = validatePassword(value);
        newValidations.password = {
          valid: value.length >= 6,
          message: value.length < 6 ? 'Password must be at least 6 characters' : '',
          strength
        };
        if (formData.confirmPassword) {
          newValidations.confirmPassword = {
            valid: value === formData.confirmPassword,
            message: value !== formData.confirmPassword ? 'Passwords do not match' : ''
          };
        }
        break;
      case 'confirmPassword':
        newValidations.confirmPassword = {
          valid: value === formData.password,
          message: value !== formData.password ? 'Passwords do not match' : ''
        };
        break;
      default:
        break;
    }

    setValidations(newValidations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isValid = Object.values(validations).every(v => v.valid);
    if (!isValid) {
      setError('Please correct the errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const { name, email, password } = formData;
      console.log('Attempting to sign up user:', { name, email });
      const result = await userSignup(name, email, password);
      console.log('Signup successful:', result);
      setSuccess('Registration successful! Redirecting to your profile...');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during registration. Please try again.';
      if (error.message === 'A user with this email already exists. Please try logging in or use a different email.') {
        errorMessage = error.message;
      } else if (error.response && error.response.data) {
        errorMessage = error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(`Error: ${errorMessage}`);
      console.error('Detailed error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/auth/${provider}`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const containerStyle = {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '0 20px',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    padding: '30px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const formGroupStyle = {
    marginBottom: '20px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    fontSize: '16px',
    marginTop: '8px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    marginTop: '20px',
    background: 'var(--primary-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'opacity 0.3s ease'
  };

  const socialButtonStyle = {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '16px',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };

  return (
    <div className={cleanStyles.container} style={containerStyle}>
      <div className={cleanStyles.card} style={cardStyle}>
        <img src={logo} alt="Do-Nation Logo" className={styles.logo} />
        <h2 className={cleanStyles.gradientTitle}>Create an Account</h2>

        {error && (
          <div className={cleanStyles.card} style={{ backgroundColor: '#FEE2E2', border: 'none', marginBottom: '20px' }}>
            <p className={cleanStyles.description} style={{ color: '#DC2626', margin: 0 }} role="alert">{error}</p>
          </div>
        )}
        {success && (
          <div className={cleanStyles.card} style={{ backgroundColor: '#ECFDF5', border: 'none', marginBottom: '20px' }}>
            <p className={cleanStyles.description} style={{ color: '#059669', margin: 0 }} role="alert">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={cleanStyles.flexColumn}>
          <div style={formGroupStyle}>
            <label className={cleanStyles.description}>Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label className={cleanStyles.description}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label className={cleanStyles.description}>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                style={inputStyle}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={cleanStyles.iconButton}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label className={cleanStyles.description}>Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3 className={cleanStyles.title}>Or sign up with:</h3>
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={() => handleSocialSignup('google')}
              style={socialButtonStyle}
            >
              <FaGoogle /> Google
            </button>
            <button
              onClick={() => handleSocialSignup('microsoft')}
              style={socialButtonStyle}
            >
              <FaMicrosoft /> Microsoft
            </button>
            <button
              style={{ ...socialButtonStyle, opacity: 0.6, cursor: 'not-allowed' }}
              disabled
              title="Apple signup is coming soon"
            >
              <FaApple /> Apple (Coming Soon)
            </button>
            <button
              style={{ ...socialButtonStyle, opacity: 0.6, cursor: 'not-allowed' }}
              disabled
              title="Facebook signup is coming soon"
            >
              <FaFacebook /> Facebook (Coming Soon)
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px' }} className={cleanStyles.description}>
          Already have an account? <Link to="/login" className={cleanStyles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;