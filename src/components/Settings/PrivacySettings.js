import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaLock, 
  FaGlobe, 
  FaEye, 
  FaEyeSlash,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle,
  FaCheck,
  FaTrophy,
  FaHeart,
  FaGlobeAfrica,
  FaChartLine,
  FaMedal,
  FaFire,
  FaCalendar,
  FaSearch,
  FaHandshake
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './PrivacySettings.module.css';
import profileService from '../../services/profile.service';

const PrivacySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, friends, private
    showAmount: true,
    showCount: true,
    showCharities: true,
    showActivity: true,
    showBadges: true,
    showStreak: true,
    showJoinDate: true,
    allowSearch: true,
    shareDataWithCharities: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');

  useEffect(() => {
    fetchPrivacySettings();
    if (user?.username) {
      setProfileUrl(profileService.generateProfileUrl('user', user.username));
    }
  }, [user]);

  const fetchPrivacySettings = async () => {
    try {
      const data = await profileService.getUserPrivacySettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleVisibilityChange = (visibility) => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: visibility
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await profileService.updateUserPrivacySettings(settings);
      toast.success('Privacy settings updated successfully!', {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <FaLock className={styles.loadingIcon} />
        <p>Loading privacy settings...</p>
      </div>
    );
  }

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      icon: <FaGlobe />,
      description: 'Anyone can view your profile'
    },
    {
      value: 'friends',
      label: 'Friends Only',
      icon: <FaEye />,
      description: 'Only people you follow can view'
    },
    {
      value: 'private',
      label: 'Private',
      icon: <FaLock />,
      description: 'Only you can view your profile'
    }
  ];

  const privacyOptions = [
    {
      field: 'showAmount',
      label: 'Show Total Impact Score',
      description: 'Display your total giving score publicly',
      icon: <FaTrophy />
    },
    {
      field: 'showCount',
      label: 'Show Donation Count',
      description: 'Display number of donations made',
      icon: <FaHeart />
    },
    {
      field: 'showCharities',
      label: 'Show Supported Charities',
      description: 'Display list of charities you support',
      icon: <FaGlobeAfrica />
    },
    {
      field: 'showActivity',
      label: 'Show Recent Activity',
      description: 'Display your donation activity feed',
      icon: <FaChartLine />
    },
    {
      field: 'showBadges',
      label: 'Show Badges & Achievements',
      description: 'Display earned badges on your profile',
      icon: <FaMedal />
    },
    {
      field: 'showStreak',
      label: 'Show Donation Streak',
      description: 'Display your current giving streak',
      icon: <FaFire />
    },
    {
      field: 'showJoinDate',
      label: 'Show Member Since Date',
      description: 'Display when you joined Do-Nation',
      icon: <FaCalendar />
    }
  ];

  const additionalOptions = [
    {
      field: 'allowSearch',
      label: 'Appear in Search Results',
      description: 'Allow others to find your profile through search',
      icon: <FaSearch />
    },
    {
      field: 'shareDataWithCharities',
      label: 'Share Data with Charities',
      description: 'Allow charities you support to see your contact info',
      icon: <FaHandshake />
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Privacy Settings</h2>
        <p className={styles.subtitle}>
          Control what information is visible on your public profile
        </p>
      </div>

      {/* Profile URL Preview */}
      <div className={styles.profilePreview}>
        <h3>Your Public Profile</h3>
        <div className={styles.urlBox}>
          <FaGlobe />
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            {profileUrl}
          </a>
        </div>
        <p className={styles.previewNote}>
          <FaInfoCircle /> This is how others will find and view your profile
        </p>
      </div>

      {/* Profile Visibility */}
      <div className={styles.section}>
        <h3>Profile Visibility</h3>
        <div className={styles.visibilityOptions}>
          {visibilityOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.visibilityOption} ${
                settings.profileVisibility === option.value ? styles.active : ''
              }`}
              onClick={() => handleVisibilityChange(option.value)}
            >
              <div className={styles.optionIcon}>{option.icon}</div>
              <h4>{option.label}</h4>
              <p>{option.description}</p>
              {settings.profileVisibility === option.value && (
                <FaCheck className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Options */}
      <div className={styles.section}>
        <h3>Profile Information</h3>
        <div className={styles.privacyList}>
          {privacyOptions.map((option) => (
            <div key={option.field} className={styles.privacyItem}>
              <div className={styles.privacyInfo}>
                <div className={styles.privacyIcon}>{option.icon}</div>
                <div>
                  <h4>{option.label}</h4>
                  <p>{option.description}</p>
                </div>
              </div>
              <button
                className={styles.toggleButton}
                onClick={() => handleToggle(option.field)}
                disabled={settings.profileVisibility === 'private'}
              >
                {settings[option.field] ? (
                  <FaToggleOn className={styles.toggleOn} />
                ) : (
                  <FaToggleOff className={styles.toggleOff} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className={styles.section}>
        <h3>Additional Privacy Options</h3>
        <div className={styles.privacyList}>
          {additionalOptions.map((option) => (
            <div key={option.field} className={styles.privacyItem}>
              <div className={styles.privacyInfo}>
                <div className={styles.privacyIcon}>{option.icon}</div>
                <div>
                  <h4>{option.label}</h4>
                  <p>{option.description}</p>
                </div>
              </div>
              <button
                className={styles.toggleButton}
                onClick={() => handleToggle(option.field)}
              >
                {settings[option.field] ? (
                  <FaToggleOn className={styles.toggleOn} />
                ) : (
                  <FaToggleOff className={styles.toggleOff} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className={styles.privacyNotice}>
        <FaInfoCircle />
        <div>
          <h4>Privacy Promise</h4>
          <p>
            We respect your privacy. Your email and personal information are never 
            shared without your explicit consent. All financial data is encrypted 
            and processed securely through Stripe.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className={styles.actions}>
        <button
          className={styles.saveButton}
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </button>
      </div>

      {/* Account Deletion */}
      <div className={styles.section}>
        <h3>Account Deletion</h3>
        <p>
          You can request deletion of your account and associated personal data at any time. During beta, deletion requests are processed manually.
        </p>
        <a
          className={styles.saveButton}
          href={`mailto:joeheath@do-nation.space?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20associated%20data.`}
        >
          Request Account Deletion
        </a>
      </div>

      <ToastContainer />
    </div>
  );
};

export default PrivacySettings;
