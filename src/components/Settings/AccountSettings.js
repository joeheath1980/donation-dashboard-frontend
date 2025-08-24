import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiServices from '../../services/api.service';
import oauthService from '../../services/oauthService';
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
  FaSave,
  FaGoogle,
  FaMicrosoft,
  FaLink,
  FaUnlink
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './AccountSettings.module.css';

const AccountSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for different sections
  const [activeSection, setActiveSection] = useState('password');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // OAuth connection state
  const [oauthConnections, setOauthConnections] = useState({
    google: { connected: false },
    microsoft: { connected: false }
  });
  const [disconnecting, setDisconnecting] = useState({
    google: false,
    microsoft: false
  });
  
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
    fetchOAuthConnections();
  }, []);
  
  const fetchNotificationSettings = async () => {
    try {
      const api = apiServices.client;
      const response = await api.get('/api/users/notification-settings');
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };
  
  const fetchOAuthConnections = async () => {
    try {
      const status = await oauthService.getConnectionStatus();
      setOauthConnections(status);
    } catch (error) {
      console.error('Error fetching OAuth connections:', error);
    }
  };
  
  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Google account? This will stop email forwarding from Gmail.')) {
      return;
    }
    
    try {
      setDisconnecting(prev => ({ ...prev, google: true }));
      await oauthService.disconnectGoogle();
      setOauthConnections(prev => ({
        ...prev,
        google: { connected: false }
      }));
      toast.success('Google account disconnected successfully');
      
      // Show re-auth prompt if needed
      if (window.location.pathname.includes('email')) {
        toast.info('Please reconnect your Google account to continue using email forwarding');
      }
    } catch (error) {
      toast.error('Failed to disconnect Google account');
      console.error('Error disconnecting Google:', error);
    } finally {
      setDisconnecting(prev => ({ ...prev, google: false }));
    }
  };
  
  const handleDisconnectMicrosoft = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Microsoft account? This will stop email forwarding from Outlook.')) {
      return;
    }
    
    try {
      setDisconnecting(prev => ({ ...prev, microsoft: true }));
      await oauthService.disconnectMicrosoft();
      setOauthConnections(prev => ({
        ...prev,
        microsoft: { connected: false }
      }));
      toast.success('Microsoft account disconnected successfully');
      
      // Show re-auth prompt if needed
      if (window.location.pathname.includes('email')) {
        toast.info('Please reconnect your Microsoft account to continue using email forwarding');
      }
    } catch (error) {
      toast.error('Failed to disconnect Microsoft account');
      console.error('Error disconnecting Microsoft:', error);
    } finally {
      setDisconnecting(prev => ({ ...prev, microsoft: false }));
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
      errors.newPassword = 'Password must be at least 12 characters';
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
      const api = apiServices.client;
      await api.post('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
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
      const api = apiServices.client;
      await api.post('/api/users/change-email', {
        newEmail: emailData.newEmail,
        password: emailData.password
      });
      
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
      const api = apiServices.client;
      await api.put('/api/users/notification-settings', notifications);
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
      const api = apiServices.client;
      await api.post('/api/users/deactivate', {});
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
      const api = apiServices.client;
      await api.delete('/api/users/account');
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
    { id: 'connections', label: 'Connected Accounts', icon: FaLink },
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
                  <small className={styles.hint}>Minimum 12 characters</small>
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
          
          {activeSection === 'connections' && (
            <section className={styles.section}>
              <h2><FaLink /> Connected Accounts</h2>
              <p className={styles.sectionDescription}>
                Manage your connected OAuth accounts for email forwarding and authentication.
              </p>
              
              <div className={styles.connectionsList}>
                <div className={styles.connectionItem}>
                  <div className={styles.connectionInfo}>
                    <FaGoogle className={styles.providerIcon} />
                    <div>
                      <h3>Google Account</h3>
                      <p>
                        {oauthConnections.google?.connected 
                          ? `Connected: ${oauthConnections.google.email || 'Gmail account'}` 
                          : 'Not connected'}
                      </p>
                      <small>Used for Gmail forwarding and Google sign-in</small>
                    </div>
                  </div>
                  <div className={styles.connectionActions}>
                    {oauthConnections.google?.connected ? (
                      <button
                        className={styles.disconnectButton}
                        onClick={handleDisconnectGoogle}
                        disabled={disconnecting.google}
                      >
                        <FaUnlink /> {disconnecting.google ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        className={styles.connectButton}
                        onClick={() => { window.location.href = `${API_CONFIG.BASE_URL}/api/auth/google`; }}
                      >
                        <FaLink /> Connect Google
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={styles.connectionItem}>
                  <div className={styles.connectionInfo}>
                    <FaMicrosoft className={styles.providerIcon} />
                    <div>
                      <h3>Microsoft Account</h3>
                      <p>
                        {oauthConnections.microsoft?.connected 
                          ? `Connected: ${oauthConnections.microsoft.email || 'Outlook account'}` 
                          : 'Not connected'}
                      </p>
                      <small>Used for Outlook forwarding and Microsoft sign-in</small>
                    </div>
                  </div>
                  <div className={styles.connectionActions}>
                    {oauthConnections.microsoft?.connected ? (
                      <button
                        className={styles.disconnectButton}
                        onClick={handleDisconnectMicrosoft}
                        disabled={disconnecting.microsoft}
                      >
                        <FaUnlink /> {disconnecting.microsoft ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        className={styles.connectButton}
                        onClick={() => { window.location.href = `${API_CONFIG.BASE_URL}/api/auth/microsoft`; }}
                      >
                        <FaLink /> Connect Microsoft
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={styles.connectionNote}>
                <FaExclamationTriangle />
                <p>
                  Disconnecting an account will stop email forwarding from that provider. 
                  You can reconnect at any time to resume the service.
                </p>
              </div>
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
