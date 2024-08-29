import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../Login.module.css';  // Ensure the path is correct

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For sign-up form
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and sign-up

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin 
        ? 'http://localhost:3002/api/auth' 
        : 'http://localhost:3002/api/register'; 
      const data = isLogin 
        ? { email, password } 
        : { name, email, password };
      
      // Send the request
      const response = await axios.post(endpoint, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (isLogin) {
        const { token } = response.data;

        // Store the token in localStorage
        localStorage.setItem('token', token);

        // Navigate to the ImpactSpace
        navigate('/ImpactSpace');
      } else {
        // Switch back to login after successful sign-up
        setIsLogin(true);
        alert('Account created successfully! Please log in.');
      }
    } catch (err) {
      setError(isLogin ? 'Invalid credentials' : 'Sign-up failed');
      console.error(isLogin ? 'Error logging in:' : 'Error signing up:', err);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.header}>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>
        )}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        {error && <p className={styles.errorText}>{error}</p>}
      </form>
      <p
        onClick={() => setIsLogin(!isLogin)}
        className={styles.toggleText}
      >
        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
      </p>
    </div>
  );
}

export default Login;
