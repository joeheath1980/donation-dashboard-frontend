import React, { useState } from 'react';
import { businessAccountService } from '../../../services/businessAccountService';
import { toast } from 'react-toastify';
import styles from './Security.module.css';

function Security({ email, onUpdate }) {
  const [activeForm, setActiveForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 12 characters';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailForm = () => {
    const newErrors = {};
    
    if (!emailForm.newEmail) {
      newErrors.newEmail = 'New email is required';
    } else if (!isValidEmail(emailForm.newEmail)) {
      newErrors.newEmail = 'Please enter a valid email address';
    }
    
    if (!emailForm.password) {
      newErrors.password = 'Password is required for verification';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setLoading(true);
      await businessAccountService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setActiveForm(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmailForm()) return;

    try {
      setLoading(true);
      await businessAccountService.changeEmail(
        emailForm.newEmail,
        emailForm.password
      );
      toast.success('Email change request sent. Please check both email addresses for confirmation.');
      setEmailForm({
        newEmail: '',
        password: ''
      });
      setActiveForm(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error changing email:', error);
      if (error.response?.status === 401) {
        setErrors({ password: 'Password is incorrect' });
      } else {
        toast.error('Failed to change email');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const strengthText = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return {
      strength: Math.min(strength, 5),
      text: strengthText[Math.min(strength, 5)]
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2>Login & Authentication</h2>
        
        <div className={styles.securityCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Password</h3>
              <p className={styles.cardDescription}>
                Last changed: Never
              </p>
            </div>
            {activeForm !== 'password' && (
              <button 
                className={styles.changeButton}
                onClick={() => setActiveForm('password')}
              >
                Change Password
              </button>
            )}
          </div>
          
          {activeForm === 'password' && (
            <form onSubmit={handlePasswordSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ 
                    ...prev, 
                    currentPassword: e.target.value 
                  }))}
                  className={errors.currentPassword ? styles.error : ''}
                />
                {errors.currentPassword && (
                  <span className={styles.errorText}>{errors.currentPassword}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ 
                    ...prev, 
                    newPassword: e.target.value 
                  }))}
                  className={errors.newPassword ? styles.error : ''}
                />
                {passwordForm.newPassword && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthBar}>
                      <div 
                        className={styles.strengthFill}
                        style={{ 
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength.strength <= 2 ? '#dc3545' : 
                                         passwordStrength.strength <= 3 ? '#ffc107' : '#28a745'
                        }}
                      />
                    </div>
                    <span className={styles.strengthText}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
                {errors.newPassword && (
                  <span className={styles.errorText}>{errors.newPassword}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ 
                    ...prev, 
                    confirmPassword: e.target.value 
                  }))}
                  className={errors.confirmPassword ? styles.error : ''}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>{errors.confirmPassword}</span>
                )}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setActiveForm(null);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className={styles.securityCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Email Address</h3>
              <p className={styles.cardDescription}>
                Current email: {email || 'Not set'}
              </p>
            </div>
            {activeForm !== 'email' && (
              <button 
                className={styles.changeButton}
                onClick={() => setActiveForm('email')}
              >
                Change Email
              </button>
            )}
          </div>
          
          {activeForm === 'email' && (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="newEmail">New Email Address</label>
                <input
                  type="email"
                  id="newEmail"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm(prev => ({ 
                    ...prev, 
                    newEmail: e.target.value 
                  }))}
                  className={errors.newEmail ? styles.error : ''}
                  placeholder="newemail@example.com"
                />
                {errors.newEmail && (
                  <span className={styles.errorText}>{errors.newEmail}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="emailPassword">Confirm Password</label>
                <input
                  type="password"
                  id="emailPassword"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm(prev => ({ 
                    ...prev, 
                    password: e.target.value 
                  }))}
                  className={errors.password ? styles.error : ''}
                  placeholder="Enter your password to confirm"
                />
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setActiveForm(null);
                    setEmailForm({
                      newEmail: '',
                      password: ''
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Email'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Additional Security</h2>
        
        <div className={styles.securityCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Two-Factor Authentication</h3>
              <p className={styles.cardDescription}>
                Add an extra layer of security to your account
              </p>
            </div>
            <span className={styles.comingSoon}>Coming Soon</span>
          </div>
        </div>

        <div className={styles.securityCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Active Sessions</h3>
              <p className={styles.cardDescription}>
                Manage devices where you're currently logged in
              </p>
            </div>
            <span className={styles.comingSoon}>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Security;
