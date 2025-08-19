import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaLock,
  FaEnvelope,
  FaUser,
  FaTrash,
  FaPause,
  FaCheck,
  FaTimes,
  FaBell,
  FaExclamationTriangle,
  FaSave
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './AccountSettings.module.css';
import { API_CONFIG } from '../../config/api.config';

const AccountSettings = () => {
  const { user, getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for different sections
  const [activeSection, setActiveSection] = useState('password');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: '',
    password: ''
  });
  const [emailErrors, setEmailErrors] = useState({});
  
  // Email notifications state
  const [notifications, setNotifications] = useState({
    marketingEmails: true,
    donationReceipts: true,
    campaignUpdates: true,
    matchingAlerts: true,
    achievementAlerts: true,
    weeklyDigest: false,
    monthlyNewsletter: true
  });
  
  // Account deletion state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    fetchNotificationSettings();
  }, []);
  
  const fetchNotificationSettings = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/users/notification-settings`,
        { headers }
      );
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };
  
  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${API_CONFIG.BASE_URL}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers }
      );
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };
  
  // Email change handler
  const handleEmailChange = async (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!emailData.newEmail) {
      errors.newEmail = 'New email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) {
      errors.newEmail = 'Invalid email format';
    }
    if (emailData.newEmail !== emailData.confirmEmail) {
      errors.confirmEmail = 'Emails do not match';
    }
    if (!emailData.password) {
      errors.password = 'Password is required for verification';
    }
    
    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors);
      return;
    }
    
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${API_CONFIG.BASE_URL}/api/users/change-email`,
        {
          newEmail: emailData.newEmail,
          password: emailData.password
        },
        { headers }
      );
      
      toast.success('Email change request sent! Please check your new email for verification.');
      setEmailData({
        newEmail: '',
        confirmEmail: '',
        password: ''
      });
      setEmailErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change email');
    } finally {
      setSaving(false);
    }
  };
  
  // Notification settings handler
  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      await axios.put(
        `${API_CONFIG.BASE_URL}/api/users/notification-settings`,
        notifications,
        { headers }
      );
      toast.success('Notification settings saved!');
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };
  
  // Account deactivation handler
  const handleDeactivateAccount = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
      return;
    }
    
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${API_CONFIG.BASE_URL}/api/users/deactivate`,
        {},
        { headers }
      );
      toast.success('Account deactivated. You can reactivate by logging in again.');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error) {
      toast.error('Failed to deactivate account');
    } finally {
      setSaving(false);
    }
  };
  
  // Account deletion handler
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      await axios.delete(
        `${API_CONFIG.BASE_URL}/api/users/account`,
        { headers }
      );
      toast.success('Account deleted successfully');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };
  
  const sections = [
    { id: 'password', label: 'Change Password', icon: FaLock },
    { id: 'email', label: 'Change Email', icon: FaEnvelope },
    { id: 'notifications', label: 'Email Notifications', icon: FaBell },
    { id: 'account', label: 'Account Management', icon: FaUser }
  ];
  
  return (
    <div className={styles.container}>
      <ToastContainer position="bottom-right" />
      
      <div className={styles.header}>
        <h1>Account Settings</h1>
        <p>Manage your account security and preferences</p>
      </div>
      
      <div className={styles.content}>
        <nav className={styles.sidebar}>
          {sections.map(section => (
            <button
              key={section.id}
              className={`${styles.navButton} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
        
        <div className={styles.mainContent}>
          {activeSection === 'password' && (
            <section className={styles.section}>
              <h2><FaLock /> Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={passwordErrors.currentPassword ? styles.error : ''}
                  />
                  {passwordErrors.currentPassword && (
                    <span className={styles.errorMessage}>{passwordErrors.currentPassword}</span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={passwordErrors.newPassword ? styles.error : ''}
                  />
                  {passwordErrors.newPassword && (
                    <span className={styles.errorMessage}>{passwordErrors.newPassword}</span>
                  )}
                  <small className={styles.hint}>Minimum 8 characters</small>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={passwordErrors.confirmPassword ? styles.error : ''}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className={styles.errorMessage}>{passwordErrors.confirmPassword}</span>
                  )}
                </div>
                
                <button type="submit" className={styles.saveButton} disabled={saving}>
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </section>
          )}
          
          {activeSection === 'email' && (
            <section className={styles.section}>
              <h2><FaEnvelope /> Change Email Address</h2>
              <div className={styles.currentInfo}>
                <p>Current email: <strong>{user?.email}</strong></p>
              </div>
              
              <form onSubmit={handleEmailChange}>
                <div className={styles.formGroup}>
                  <label htmlFor="newEmail">New Email Address</label>
                  <input
                    type="email"
                    id="newEmail"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                    className={emailErrors.newEmail ? styles.error : ''}
                  />
                  {emailErrors.newEmail && (
                    <span className={styles.errorMessage}>{emailErrors.newEmail}</span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmEmail">Confirm New Email</label>
                  <input
                    type="email"
                    id="confirmEmail"
                    value={emailData.confirmEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, confirmEmail: e.target.value }))}
                    className={emailErrors.confirmEmail ? styles.error : ''}
                  />
                  {emailErrors.confirmEmail && (
                    <span className={styles.errorMessage}>{emailErrors.confirmEmail}</span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="emailPassword">Current Password (for verification)</label>
                  <input
                    type="password"
                    id="emailPassword"
                    value={emailData.password}
                    onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                    className={emailErrors.password ? styles.error : ''}
                  />
                  {emailErrors.password && (
                    <span className={styles.errorMessage}>{emailErrors.password}</span>
                  )}
                </div>
                
                <div className={styles.warning}>
                  <FaExclamationTriangle />
                  <p>You will receive a verification email at your new address.</p>
                </div>
                
                <button type="submit" className={styles.saveButton} disabled={saving}>
                  {saving ? 'Sending...' : 'Change Email'}
                </button>
              </form>
            </section>
          )}
          
          {activeSection === 'notifications' && (
            <section className={styles.section}>
              <h2><FaBell /> Email Notification Preferences</h2>
              
              <div className={styles.notificationGroup}>
                <h3>Donation & Activity</h3>
                
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={notifications.donationReceipts}
                    onChange={() => handleNotificationToggle('donationReceipts')}
                  />
                  <span>Donation receipts</span>
                  <small>Receive receipts for your donations</small>
                </label>
                
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={notifications.campaignUpdates}
                    onChange={() => handleNotificationToggle('campaignUpdates')}
                  />
                  <span>Campaign updates</span>
                  <small>Updates from charities you support</small>
                </label>
                
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={notifications.matchingAlerts}
                    onChange={() => handleNotificationToggle('matchingAlerts')}
                  />
                  <span>Matching opportunities</span>
                  <small>When businesses offer to match your donations</small>
                </label>
                
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={notifications.achievementAlerts}
                    onChange={() => handleNotificationToggle('achievementAlerts')}
                  />
                  <span>Achievements & badges</span>
                  <small>When you earn new badges or reach milestones</small>
                </label>
              </div>
              
              <div className={styles.notificationGroup}>
                <h3>Newsletters & Marketing</h3>
                
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={() => handleNotificationToggle('weeklyDigest')}
                  />
                  <span>Weekly digest</span>
                  <small>Summary of your giving impact</small>
                </label>
                
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={notifications.monthlyNewsletter}
                    onChange={() => handleNotificationToggle('monthlyNewsletter')}
                  />
                  <span>Monthly newsletter</span>
                  <small>Platform updates and featured charities</small>
                </label>
                
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={notifications.marketingEmails}
                    onChange={() => handleNotificationToggle('marketingEmails')}
                  />
                  <span>Marketing emails</span>
                  <small>Special offers and promotions</small>
                </label>
              </div>
              
              <button 
                className={styles.saveButton}
                onClick={saveNotificationSettings}
                disabled={saving}
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </section>
          )}
          
          {activeSection === 'account' && (
            <section className={styles.section}>
              <h2><FaUser /> Account Management</h2>
              
              <div className={styles.dangerZone}>
                <h3>Deactivate Account</h3>
                <p>Temporarily disable your account. You can reactivate it anytime by logging in.</p>
                <button 
                  className={styles.deactivateButton}
                  onClick={handleDeactivateAccount}
                  disabled={saving}
                >
                  <FaPause /> {saving ? 'Processing...' : 'Deactivate Account'}
                </button>
              </div>
              
              <div className={styles.dangerZone}>
                <h3>Delete Account</h3>
                <p className={styles.dangerWarning}>
                  <FaExclamationTriangle /> This action is permanent and cannot be undone. 
                  All your data, donation history, and achievements will be permanently deleted.
                </p>
                <button 
                  className={styles.deleteButton}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrash /> Delete Account
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Confirm Account Deletion</h2>
            <div className={styles.modalWarning}>
              <FaExclamationTriangle />
              <p>This will permanently delete:</p>
              <ul>
                <li>Your profile and personal information</li>
                <li>All donation history and receipts</li>
                <li>Your impact score and achievements</li>
                <li>Any recurring donations</li>
              </ul>
            </div>
            
            <p>Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className={styles.confirmInput}
            />
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || saving}
              >
                {saving ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;