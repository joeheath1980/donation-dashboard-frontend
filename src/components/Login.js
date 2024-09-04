import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err.response?.data?.error || 'Failed to log in. Please try again.');
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic here
  };

  return (
    <div className={`${styles.loginContainer} container card`}>
      <h2 className="h2">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className="form-label">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className="form-label">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>

      <div className={`${styles.socialLogin} card`}>
        <h3 className="h3">Or login with:</h3>
        <button 
          onClick={() => handleSocialLogin('google')} 
          className="btn btn-secondary"
          style={{backgroundColor: '#DB4437', color: 'white', marginBottom: '10px'}}
        >
          Google
        </button>
        <button 
          onClick={() => handleSocialLogin('outlook')} 
          className="btn btn-secondary"
          style={{backgroundColor: '#0072C6', color: 'white', marginBottom: '10px'}}
        >
          Outlook
        </button>
        <button 
          onClick={() => handleSocialLogin('apple')} 
          className="btn btn-secondary"
          style={{backgroundColor: '#000000', color: 'white'}}
        >
          Apple
        </button>
      </div>

      <p className={styles.toggleText}>
        <Link to="/signup">Need an account? Sign Up</Link>
      </p>
      <p className={styles.organizationSignup}>
        <a href="/organization-signup">Are you a charity or organization? Sign up here</a>
      </p>
    </div>
  );
}

export default Login;
