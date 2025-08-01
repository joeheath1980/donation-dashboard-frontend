import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaHeart,
  FaLink,
  FaLock,
  FaCheck,
  FaTimes,
  FaCamera,
  FaInfoCircle
} from 'react-icons/fa';
import styles from './ProfileEditor.module.css';
import LoadingSpinner from '../Common/LoadingSpinner';
import { debounce } from 'lodash';

const ProfileEditor = () => {
  const { user, getAuthHeaders, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    professionalTitle: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    preferredCauses: [],
    givingPhilosophy: '',
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: ''
    },
    privacy: {
      showRealName: true,
      showEmail: false,
      showDonationAmount: true,
      showDonationCount: true,
      showCharities: true,
      showBadges: true,
      showActivity: true,
      showImpactScore: true,
      profileVisibility: 'public'
    },
    impactStatement: ''
  });
  
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Predefined cause areas
  const causeAreas = [
    'Education',
    'Healthcare',
    'Environment',
    'Animal Welfare',
    'Arts & Culture',
    'Community Development',
    'Human Rights',
    'Disaster Relief',
    'Youth Programs',
    'Elderly Care',
    'Mental Health',
    'Food Security',
    'Clean Water',
    'Technology Access',
    'Women\'s Rights'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/profile`,
        { headers }
      );
      
      // Handle both wrapped and unwrapped API responses
      const userData = response.data.user || response.data;
      const completeness = response.data.profileCompleteness || userData.profileCompleteness || 0;
      
      setProfile({
        displayName: userData.displayName || '',
        username: userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '',
        professionalTitle: userData.professionalTitle || '',
        location: userData.location || { city: '', state: '', country: '' },
        preferredCauses: userData.preferredCauses || [],
        givingPhilosophy: userData.givingPhilosophy || '',
        socialLinks: userData.socialLinks || {
          website: '',
          twitter: '',
          linkedin: '',
          facebook: '',
          instagram: ''
        },
        privacy: userData.privacy || {
          showRealName: true,
          showEmail: false,
          showDonationAmount: true,
          showDonationCount: true,
          showCharities: true,
          showBadges: true,
          showActivity: true,
          showImpactScore: true,
          profileVisibility: 'public'
        },
        impactStatement: userData.impactStatement || ''
      });
      setProfileCompleteness(completeness);
      setAvatarPreview(userData.avatar || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    debounce(async (username) => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      
      setCheckingUsername(true);
      try {
        const headers = getAuthHeaders();
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/check-username/${username}`,
          { headers }
        );
        setUsernameAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
      
      if (field === 'username') {
        checkUsernameAvailability(value);
      }
    }
    
    // Clear field error when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleCauseToggle = (cause) => {
    setProfile(prev => ({
      ...prev,
      preferredCauses: prev.preferredCauses.includes(cause)
        ? prev.preferredCauses.filter(c => c !== cause)
        : [...prev.preferredCauses, cause]
    }));
  };

  const handlePrivacyToggle = (setting) => {
    setProfile(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting]
      }
    }));
  };

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profile.displayName?.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!profile.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (profile.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    }
    
    if (profile.bio && profile.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }
    
    if (profile.impactStatement && profile.impactStatement.length > 200) {
      newErrors.impactStatement = 'Impact statement must be 200 characters or less';
    }
    
    if (profile.givingPhilosophy && profile.givingPhilosophy.length > 1000) {
      newErrors.givingPhilosophy = 'Giving philosophy must be 1000 characters or less';
    }
    
    // Validate social links
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    Object.entries(profile.socialLinks).forEach(([platform, url]) => {
      if (url && !urlPattern.test(url)) {
        newErrors[`socialLinks.${platform}`] = 'Please enter a valid URL';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }
    
    try {
      setSaving(true);
      const headers = getAuthHeaders();
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/users/profile`,
        profile,
        { headers }
      );
      
      // Update auth context with new user data
      updateUser(response.data.user);
      setProfileCompleteness(response.data.profileCompleteness);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // TODO: Implement actual upload to server
    // For now, just show preview
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FaUser },
    { id: 'location', label: 'Location', icon: FaMapMarkerAlt },
    { id: 'professional', label: 'Professional', icon: FaBriefcase },
    { id: 'giving', label: 'Giving', icon: FaHeart },
    { id: 'social', label: 'Social Links', icon: FaLink },
    { id: 'privacy', label: 'Privacy', icon: FaLock }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Profile</h1>
        <div className={styles.completeness}>
          <span>Profile Completeness</span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
          <span>{profileCompleteness}%</span>
        </div>
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

        <form className={styles.form} onSubmit={handleSubmit}>
          {activeSection === 'basic' && (
            <section className={styles.section}>
              <h2>Basic Information</h2>
              
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <FaUser />
                    </div>
                  )}
                  <label className={styles.avatarUpload}>
                    <FaCamera />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      hidden
                    />
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="displayName">Display Name *</label>
                <input
                  type="text"
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={errors.displayName ? styles.error : ''}
                />
                {errors.displayName && (
                  <span className={styles.errorMessage}>{errors.displayName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="username">
                  Username *
                  <span className={styles.info}>
                    <FaInfoCircle />
                    <span className={styles.tooltip}>
                      Your unique identifier for your profile URL
                    </span>
                  </span>
                </label>
                <div className={styles.usernameInput}>
                  <input
                    type="text"
                    id="username"
                    value={profile.username}
                    onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                    className={errors.username ? styles.error : ''}
                  />
                  {checkingUsername && <span className={styles.checking}>Checking...</span>}
                  {!checkingUsername && usernameAvailable === true && (
                    <FaCheck className={styles.available} />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <FaTimes className={styles.unavailable} />
                  )}
                </div>
                {errors.username && (
                  <span className={styles.errorMessage}>{errors.username}</span>
                )}
                {profile.username && (
                  <span className={styles.hint}>
                    Profile URL: do-nation.space/profile/{profile.username}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className={styles.disabled}
                />
                <span className={styles.hint}>Email cannot be changed</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bio">
                  Bio
                  <span className={styles.charCount}>
                    {profile.bio.length}/500
                  </span>
                </label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell us about yourself..."
                  className={errors.bio ? styles.error : ''}
                />
                {errors.bio && (
                  <span className={styles.errorMessage}>{errors.bio}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="impactStatement">
                  Impact Statement
                  <span className={styles.charCount}>
                    {profile.impactStatement.length}/200
                  </span>
                </label>
                <textarea
                  id="impactStatement"
                  value={profile.impactStatement}
                  onChange={(e) => handleInputChange('impactStatement', e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="A brief statement about your impact..."
                  className={errors.impactStatement ? styles.error : ''}
                />
                {errors.impactStatement && (
                  <span className={styles.errorMessage}>{errors.impactStatement}</span>
                )}
              </div>
            </section>
          )}

          {activeSection === 'location' && (
            <section className={styles.section}>
              <h2>Location</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  value={profile.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  placeholder="San Francisco"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  value={profile.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  placeholder="California"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  value={profile.location.country}
                  onChange={(e) => handleInputChange('location.country', e.target.value)}
                  placeholder="United States"
                />
              </div>
            </section>
          )}

          {activeSection === 'professional' && (
            <section className={styles.section}>
              <h2>Professional Information</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="professionalTitle">Professional Title</label>
                <input
                  type="text"
                  id="professionalTitle"
                  value={profile.professionalTitle}
                  onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                  placeholder="Software Engineer, Teacher, CEO..."
                />
              </div>
            </section>
          )}

          {activeSection === 'giving' && (
            <section className={styles.section}>
              <h2>Giving Preferences</h2>
              
              <div className={styles.formGroup}>
                <label>Cause Areas</label>
                <div className={styles.causeGrid}>
                  {causeAreas.map(cause => (
                    <button
                      key={cause}
                      type="button"
                      className={`${styles.causeButton} ${
                        profile.preferredCauses.includes(cause) ? styles.selected : ''
                      }`}
                      onClick={() => handleCauseToggle(cause)}
                    >
                      {cause}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="givingPhilosophy">
                  Giving Philosophy
                  <span className={styles.charCount}>
                    {profile.givingPhilosophy.length}/1000
                  </span>
                </label>
                <textarea
                  id="givingPhilosophy"
                  value={profile.givingPhilosophy}
                  onChange={(e) => handleInputChange('givingPhilosophy', e.target.value)}
                  rows={6}
                  maxLength={1000}
                  placeholder="Share your approach to giving and what motivates you..."
                  className={errors.givingPhilosophy ? styles.error : ''}
                />
                {errors.givingPhilosophy && (
                  <span className={styles.errorMessage}>{errors.givingPhilosophy}</span>
                )}
              </div>
            </section>
          )}

          {activeSection === 'social' && (
            <section className={styles.section}>
              <h2>Social Links</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  value={profile.socialLinks.website}
                  onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={errors['socialLinks.website'] ? styles.error : ''}
                />
                {errors['socialLinks.website'] && (
                  <span className={styles.errorMessage}>{errors['socialLinks.website']}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="twitter">Twitter</label>
                <input
                  type="url"
                  id="twitter"
                  value={profile.socialLinks.twitter}
                  onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                  placeholder="https://twitter.com/yourusername"
                  className={errors['socialLinks.twitter'] ? styles.error : ''}
                />
                {errors['socialLinks.twitter'] && (
                  <span className={styles.errorMessage}>{errors['socialLinks.twitter']}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  type="url"
                  id="linkedin"
                  value={profile.socialLinks.linkedin}
                  onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourusername"
                  className={errors['socialLinks.linkedin'] ? styles.error : ''}
                />
                {errors['socialLinks.linkedin'] && (
                  <span className={styles.errorMessage}>{errors['socialLinks.linkedin']}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="facebook">Facebook</label>
                <input
                  type="url"
                  id="facebook"
                  value={profile.socialLinks.facebook}
                  onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                  placeholder="https://facebook.com/yourusername"
                  className={errors['socialLinks.facebook'] ? styles.error : ''}
                />
                {errors['socialLinks.facebook'] && (
                  <span className={styles.errorMessage}>{errors['socialLinks.facebook']}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="instagram">Instagram</label>
                <input
                  type="url"
                  id="instagram"
                  value={profile.socialLinks.instagram}
                  onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                  placeholder="https://instagram.com/yourusername"
                  className={errors['socialLinks.instagram'] ? styles.error : ''}
                />
                {errors['socialLinks.instagram'] && (
                  <span className={styles.errorMessage}>{errors['socialLinks.instagram']}</span>
                )}
              </div>
            </section>
          )}

          {activeSection === 'privacy' && (
            <section className={styles.section}>
              <h2>Privacy Settings</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="profileVisibility">Profile Visibility</label>
                <select
                  id="profileVisibility"
                  value={profile.privacy.profileVisibility}
                  onChange={(e) => handleInputChange('privacy.profileVisibility', e.target.value)}
                  className={styles.select}
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="registered">Registered Users Only</option>
                  <option value="private">Private - Only you can view</option>
                </select>
              </div>
              
              <div className={styles.privacyOptions}>
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showRealName}
                    onChange={() => handlePrivacyToggle('showRealName')}
                  />
                  <span>Show real name on public profile</span>
                </label>

                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showEmail}
                    onChange={() => handlePrivacyToggle('showEmail')}
                  />
                  <span>Show email on public profile</span>
                </label>

                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showDonationAmount}
                    onChange={() => handlePrivacyToggle('showDonationAmount')}
                  />
                  <span>Show donation amounts</span>
                </label>

                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showDonationCount}
                    onChange={() => handlePrivacyToggle('showDonationCount')}
                  />
                  <span>Show donation count</span>
                </label>

                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showCharities}
                    onChange={() => handlePrivacyToggle('showCharities')}
                  />
                  <span>Show charities you support</span>
                </label>

                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showBadges}
                    onChange={() => handlePrivacyToggle('showBadges')}
                  />
                  <span>Show badges and achievements</span>
                </label>

                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showActivity}
                    onChange={() => handlePrivacyToggle('showActivity')}
                  />
                  <span>Show recent activity</span>
                </label>

                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={profile.privacy.showImpactScore}
                    onChange={() => handlePrivacyToggle('showImpactScore')}
                  />
                  <span>Show impact score</span>
                </label>
              </div>
            </section>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            {profile.username && (
              <a 
                href={`/profile/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewProfileButton}
              >
                View Public Profile
              </a>
            )}
            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;