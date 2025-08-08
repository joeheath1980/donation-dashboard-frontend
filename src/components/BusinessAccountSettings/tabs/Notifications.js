import React, { useState, useEffect } from 'react';
import { businessAccountService } from '../../../services/businessAccountService';
import { toast } from 'react-toastify';
import styles from './Notifications.module.css';

function Notifications({ preferences: initialPreferences, onUpdate }) {
  const [preferences, setPreferences] = useState({
    matchNotifications: true,
    budgetAlerts: true,
    campaignUpdates: true,
    monthlyReports: true,
    realTimeAlerts: false,
    alertThreshold: 20
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialPreferences) {
      setPreferences(initialPreferences);
    }
  }, [initialPreferences]);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleThresholdChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      alertThreshold: parseInt(value)
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await businessAccountService.updateNotificationPreferences(preferences);
      toast.success('Notification preferences updated successfully');
      setHasChanges(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const notificationCategories = [
    {
      title: 'Matching & Donations',
      items: [
        {
          key: 'matchNotifications',
          title: 'Matching Notifications',
          description: 'Get notified when your business matches a donation',
          icon: '🎯'
        },
        {
          key: 'realTimeAlerts',
          title: 'Real-time Alerts',
          description: 'Receive instant notifications for high-value matches',
          icon: '⚡'
        }
      ]
    },
    {
      title: 'Budget & Campaigns',
      items: [
        {
          key: 'budgetAlerts',
          title: 'Budget Alerts',
          description: 'Receive alerts when budget thresholds are reached',
          icon: '💰'
        },
        {
          key: 'campaignUpdates',
          title: 'Campaign Updates',
          description: 'Stay informed about campaign performance and milestones',
          icon: '📊'
        }
      ]
    },
    {
      title: 'Reports & Insights',
      items: [
        {
          key: 'monthlyReports',
          title: 'Monthly Reports',
          description: 'Receive comprehensive monthly giving reports',
          icon: '📈'
        }
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Notification Preferences</h2>
        <p className={styles.subtitle}>
          Choose how you want to be notified about your giving activities
        </p>
      </div>

      {notificationCategories.map((category, index) => (
        <div key={index} className={styles.section}>
          <h3>{category.title}</h3>
          
          <div className={styles.notificationList}>
            {category.items.map(item => (
              <div key={item.key} className={styles.notificationItem}>
                <div className={styles.notificationIcon}>{item.icon}</div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4>{item.title}</h4>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={preferences[item.key]}
                        onChange={() => handleToggle(item.key)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                  <p className={styles.notificationDescription}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.section}>
        <h3>Alert Settings</h3>
        
        <div className={styles.thresholdSetting}>
          <div className={styles.thresholdHeader}>
            <h4>Budget Alert Threshold</h4>
            <span className={styles.thresholdValue}>{preferences.alertThreshold}%</span>
          </div>
          <p className={styles.thresholdDescription}>
            Receive an alert when your remaining budget reaches this percentage
          </p>
          
          <div className={styles.sliderContainer}>
            <span className={styles.sliderLabel}>5%</span>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={preferences.alertThreshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className={styles.slider}
            />
            <span className={styles.sliderLabel}>50%</span>
          </div>
          
          <div className={styles.thresholdMarks}>
            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(mark => (
              <span 
                key={mark} 
                className={`${styles.mark} ${preferences.alertThreshold === mark ? styles.activeMark : ''}`}
              >
                {mark}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Email Preferences</h3>
        
        <div className={styles.emailPreferences}>
          <div className={styles.preferenceItem}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={true}
                disabled
              />
              <span>Send notifications to primary email</span>
            </label>
            <p className={styles.emailNote}>
              Notifications will be sent to your registered email address
            </p>
          </div>
          
          <div className={styles.preferenceItem}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={false}
                disabled
              />
              <span>Send digest instead of individual emails</span>
            </label>
            <p className={styles.emailNote}>
              Coming soon: Receive a daily or weekly digest of all notifications
            </p>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className={styles.saveBar}>
          <p>You have unsaved changes</p>
          <button 
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Notifications;