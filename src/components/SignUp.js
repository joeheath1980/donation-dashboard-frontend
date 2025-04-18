import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'react-icons/fa';
import styles from './SignUp.module.css'; // Assuming SignUp.module.css might still have some styles like .logo
import cleanStyles from './SharedStyles.css'; // Assuming SharedStyles.css has .container, .card, .link etc.
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

  // Assuming validatePassword is used elsewhere or for UI feedback, keeping it
  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // --- Basic Validation (keeping existing logic) ---
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
        const strength = validatePassword(value); // Calculate strength if needed for UI
        newValidations.password = {
          valid: value.length >= 6, // Keeping min length 6 as per original code
          message: value.length < 6 ? 'Password must be at least 6 characters' : '',
          strength // Store strength if needed
        };
        // Check confirmation only if confirmPassword has a value
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
    // --- End Validation ---
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Re-check validation state before submit ---
    let formIsValid = true;
    const currentValidations = { ...validations }; // Check current state

    // Manually check all fields based on current formData, not just last touched field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.name.trim().length < 2) {
        currentValidations.name = { valid: false, message: 'Name must be at least 2 characters' };
        formIsValid = false;
    }
    if (!emailRegex.test(formData.email)) {
        currentValidations.email = { valid: false, message: 'Please enter a valid email address' };
        formIsValid = false;
    }
     if (formData.password.length < 6) {
        currentValidations.password = { valid: false, message: 'Password must be at least 6 characters', strength: validatePassword(formData.password) };
        formIsValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
        currentValidations.confirmPassword = { valid: false, message: 'Passwords do not match' };
        formIsValid = false;
    }

    setValidations(currentValidations); // Update UI with all validation checks

    if (!formIsValid) {
      setError('Please correct the errors indicated above.');
      return;
    }
    // --- End re-check validation ---


    setLoading(true);

    try {
      const { name, email, password } = formData;
      console.log('Attempting to sign up user:', { name, email });
      const result = await userSignup(name, email, password);
      console.log('Signup successful:', result);

      // Ensure result has an ID before setting localStorage
      const userId = result?._id || result?.id;
      if (userId) {
          localStorage.setItem('currentUserId', userId);
      } else {
          console.warn("Signup result did not contain a user ID (_id or id)");
          // Decide how to handle this - maybe show an error?
          // For now, we proceed but localStorage might not be set.
      }


      setSuccess('Registration successful! Redirecting to your profile...');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during registration. Please try again.';
      // Improved error message extraction
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error; // Handle cases where a string might be thrown
      }
      setError(`Error: ${errorMessage}`);
      console.error('Detailed error object:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    // Redirect to backend for social authentication
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/auth/${provider}`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- Inline Styles (keeping structure from original) ---
  const containerStyle = {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '0 20px',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    padding: '30px',
    width: '100%',
    boxSizing: 'border-box',
    // Assuming cleanStyles.card provides background, shadow etc.
  };

  const formGroupStyle = {
    marginBottom: '20px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const inputStyle = (isValid) => ({ // Function to conditionally apply error styles
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${isValid ? 'var(--border-light, #ccc)' : 'red'}`, // Use CSS var or fallback, red border if invalid
    fontSize: '16px',
    marginTop: '8px',
    boxSizing: 'border-box'
  });

  const validationMessageStyle = {
      color: 'red',
      fontSize: '12px',
      marginTop: '4px',
      minHeight: '1em' // Prevent layout shifts
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    marginTop: '20px',
    background: 'var(--primary-gradient, linear-gradient(to right, #007bff, #0056b3))', // Use CSS var or fallback
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
    border: '1px solid var(--border-light, #ccc)', // Use CSS var or fallback
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };
  // --- End Inline Styles ---

  return (
    // Assuming cleanStyles.container provides base layout styles
    <div className={cleanStyles.container} style={containerStyle}>
      {/* Assuming cleanStyles.card provides card appearance */}
      <div className={cleanStyles.card} style={cardStyle}>
        <img src={logo} alt="Do-Nation Logo" className={styles.logo} />
        {/* Assuming cleanStyles.gradientTitle provides title styling */}
        <h2 className={cleanStyles.gradientTitle}>Create an Account</h2>

        {/* --- Error/Success Messages --- */}
        {error && (
          // Assuming cleanStyles.card and .description style these appropriately
          <div className={cleanStyles.card} style={{ backgroundColor: '#FEE2E2', border: 'none', marginBottom: '20px', padding: '10px' }}>
            <p className={cleanStyles.description} style={{ color: '#DC2626', margin: 0, textAlign: 'center' }} role="alert">{error}</p>
          </div>
        )}
        {success && (
          <div className={cleanStyles.card} style={{ backgroundColor: '#ECFDF5', border: 'none', marginBottom: '20px', padding: '10px' }}>
            <p className={cleanStyles.description} style={{ color: '#059669', margin: 0, textAlign: 'center' }} role="alert">{success}</p>
          </div>
        )}
        {/* --- End Error/Success Messages --- */}


        {/* --- Sign Up Form --- */}
        {/* Assuming cleanStyles.flexColumn provides basic flex layout */}
        <form onSubmit={handleSubmit} className={cleanStyles.flexColumn}>

          {/* --- Name Field --- */}
          <div style={formGroupStyle}>
            <label htmlFor="name" className={cleanStyles.description}>Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              style={inputStyle(validations.name.valid)} // Apply conditional style
              aria-invalid={!validations.name.valid}
              aria-describedby="name-error"
            />
            {!validations.name.valid && <p id="name-error" style={validationMessageStyle}>{validations.name.message}</p>}
          </div>

          {/* --- Email Field --- */}
          <div style={formGroupStyle}>
            <label htmlFor="email" className={cleanStyles.description}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              style={inputStyle(validations.email.valid)} // Apply conditional style
              aria-invalid={!validations.email.valid}
              aria-describedby="email-error"
            />
            {!validations.email.valid && <p id="email-error" style={validationMessageStyle}>{validations.email.message}</p>}
          </div>

          {/* --- Password Field --- */}
          <div style={formGroupStyle}>
            <label htmlFor="password" className={cleanStyles.description}>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min. 6 characters)"
                required
                style={inputStyle(validations.password.valid)} // Apply conditional style
                aria-invalid={!validations.password.valid}
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={cleanStyles.iconButton} // Assuming this styles the button
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px', // Added padding for easier clicking
                  marginTop: '4px' // Adjust vertical alignment (since input has marginTop)
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/* Better icons or text */}
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
             {!validations.password.valid && <p id="password-error" style={validationMessageStyle}>{validations.password.message}</p>}
             {/* Optional: Password strength indicator could go here */}
          </div>

          {/* --- Confirm Password Field --- */}
          <div style={formGroupStyle}>
            <label htmlFor="confirmPassword" className={cleanStyles.description}>Confirm Password:</label>
            <input
              type="password" // Keep type="password" even if main password is shown
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              style={inputStyle(validations.confirmPassword.valid)} // Apply conditional style
              aria-invalid={!validations.confirmPassword.valid}
              aria-describedby="confirmPassword-error"
            />
            {!validations.confirmPassword.valid && <p id="confirmPassword-error" style={validationMessageStyle}>{validations.confirmPassword.message}</p>}
          </div>

          {/* --- Submit Button --- */}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        {/* --- End Sign Up Form --- */}


        {/* --- Social Signup --- */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          {/* Assuming cleanStyles.title styles this heading */}
          <h3 className={cleanStyles.title}>Or sign up with:</h3>
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={() => handleSocialSignup('google')}
              style={socialButtonStyle}
              type="button" // Explicitly set type="button"
            >
              <FaGoogle style={{ marginRight: '8px' }} /> Google
            </button>
            <button
              onClick={() => handleSocialSignup('microsoft')}
              style={socialButtonStyle}
              type="button" // Explicitly set type="button"
            >
              <FaMicrosoft style={{ marginRight: '8px' }} /> Microsoft
            </button>
             {/* Keeping disabled buttons as per original */}
            <button
              style={{ ...socialButtonStyle, opacity: 0.6, cursor: 'not-allowed' }}
              disabled
              title="Apple signup is coming soon"
              type="button"
            >
              <FaApple style={{ marginRight: '8px' }} /> Apple (Coming Soon)
            </button>
            <button
              style={{ ...socialButtonStyle, opacity: 0.6, cursor: 'not-allowed' }}
              disabled
              title="Facebook signup is coming soon"
              type="button"
            >
              <FaFacebook style={{ marginRight: '8px' }} /> Facebook (Coming Soon)
            </button>
          </div>
        </div>
        {/* --- End Social Signup --- */}


        {/* --- Login Link --- */}
        {/* Assuming cleanStyles.description styles this paragraph */}
        <p style={{ textAlign: 'center', marginTop: '30px' }} className={cleanStyles.description}>
          Already have an account? <Link to="/login" className={cleanStyles.link}>Log in</Link>
        </p>
        {/* --- End Login Link --- */}


        {/* --- ADDED PRIVACY POLICY AND TERMS LINKS --- */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary, #666)' }}>
            By signing up, you agree to our
            <br /> {/* Optional: line break for better readability on small screens */}
            <a href="/terms_of_service.html" target="_blank" rel="noopener noreferrer" className={cleanStyles.link} style={{ margin: '0 5px' }}>
                Terms of Service
            </a>
            and
            <a href="/privacy_policy.html" target="_blank" rel="noopener noreferrer" className={cleanStyles.link} style={{ margin: '0 5px' }}>
                Privacy Policy
            </a>.
        </div>
        {/* --- END OF ADDED LINKS --- */}

      </div> {/* --- End Card Div --- */}
    </div> // --- End Container Div ---
  );
};

export default SignUp;