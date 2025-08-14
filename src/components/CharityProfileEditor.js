import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSave, 
  FaCamera, 
  FaGlobe, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaInfoCircle,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube
} from 'react-icons/fa';
import styles from './CharityProfileEditor.module.css';

const CharityProfileEditor = () => {
  const navigate = useNavigate();
  const { charityId } = useParams();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('basic');
  
  const [profile, setProfile] = useState({
    // Basic Information
    charityName: '',
    description: '',
    missionStatement: '',
    category: '',
    
    // Contact Information
    contactEmail: '',
    phone: '',
    website: '',
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Australia'
    },
    
    // Social Media
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    
    // Additional Details
    foundedYear: '',
    teamSize: '',
    impactStatement: '',
    
    // Media
    logo: null,
    coverImage: null,
    gallery: []
  });

  const [previewImages, setPreviewImages] = useState({
    logo: null,
    coverImage: null
  });

  useEffect(() => {
    fetchCharityProfile();
  }, []);

  const fetchCharityProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/me`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data) {
        setProfile({
          ...profile,
          ...response.data
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
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
        [name]: value
      }));
    }
  };

  const handleImageChange = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImages(prev => ({
        ...prev,
        [imageType]: reader.result
      }));
    };
    reader.readAsDataURL(file);

    // Store file for upload
    setProfile(prev => ({
      ...prev,
      [imageType]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(profile).forEach(key => {
        if (key === 'address' || key === 'socialMedia') {
          formData.append(key, JSON.stringify(profile[key]));
        } else if (key !== 'logo' && key !== 'coverImage' && key !== 'gallery') {
          formData.append(key, profile[key]);
        }
      });

      // Add images
      if (profile.logo instanceof File) {
        formData.append('logo', profile.logo);
      }
      if (profile.coverImage instanceof File) {
        formData.append('coverImage', profile.coverImage);
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/profile`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update profile with response data
      setProfile(prev => ({
        ...prev,
        ...response.data
      }));
      
      // Clear preview images
      setPreviewImages({ logo: null, coverImage: null });
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const renderBasicInfo = () => (
    <div className={styles.tabContent}>
      <h3>Basic Information</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="charityName">
          <FaInfoCircle /> Charity Name *
        </label>
        <input
          type="text"
          id="charityName"
          name="charityName"
          value={profile.charityName}
          onChange={handleInputChange}
          required
          placeholder="Enter your charity's official name"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={profile.description}
          onChange={handleInputChange}
          rows="4"
          required
          placeholder="Brief description of your charity (shown on search results)"
          maxLength="300"
        />
        <span className={styles.charCount}>
          {profile.description.length}/300 characters
        </span>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="missionStatement">Mission Statement *</label>
        <textarea
          id="missionStatement"
          name="missionStatement"
          value={profile.missionStatement}
          onChange={handleInputChange}
          rows="6"
          required
          placeholder="Your charity's mission and vision"
          maxLength="1000"
        />
        <span className={styles.charCount}>
          {profile.missionStatement.length}/1000 characters
        </span>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={profile.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Environment">Environment</option>
            <option value="Animals">Animals</option>
            <option value="Social Services">Social Services</option>
            <option value="Arts & Culture">Arts & Culture</option>
            <option value="International">International</option>
            <option value="Religious">Religious</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="foundedYear">Founded Year</label>
          <input
            type="number"
            id="foundedYear"
            name="foundedYear"
            value={profile.foundedYear}
            onChange={handleInputChange}
            placeholder="e.g., 2020"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="impactStatement">Impact Statement</label>
        <textarea
          id="impactStatement"
          name="impactStatement"
          value={profile.impactStatement}
          onChange={handleInputChange}
          rows="4"
          placeholder="Describe the impact your charity has made"
          maxLength="500"
        />
        <span className={styles.charCount}>
          {profile.impactStatement.length}/500 characters
        </span>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className={styles.tabContent}>
      <h3>Contact Information</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="contactEmail">
          <FaEnvelope /> Contact Email *
        </label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={profile.contactEmail}
          onChange={handleInputChange}
          required
          placeholder="public@yourcharity.org"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone">
          <FaPhone /> Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={profile.phone}
          onChange={handleInputChange}
          placeholder="+61 2 1234 5678"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="website">
          <FaGlobe /> Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={profile.website}
          onChange={handleInputChange}
          placeholder="https://yourcharity.org"
        />
      </div>

      <h4>Address</h4>
      
      <div className={styles.formGroup}>
        <label htmlFor="street">
          <FaMapMarkerAlt /> Street Address
        </label>
        <input
          type="text"
          id="street"
          name="address.street"
          value={profile.address.street}
          onChange={handleInputChange}
          placeholder="123 Main Street"
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="address.city"
            value={profile.address.city}
            onChange={handleInputChange}
            placeholder="Sydney"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="state">State</label>
          <select
            id="state"
            name="address.state"
            value={profile.address.state}
            onChange={handleInputChange}
          >
            <option value="">Select state</option>
            <option value="NSW">New South Wales</option>
            <option value="VIC">Victoria</option>
            <option value="QLD">Queensland</option>
            <option value="WA">Western Australia</option>
            <option value="SA">South Australia</option>
            <option value="TAS">Tasmania</option>
            <option value="ACT">Australian Capital Territory</option>
            <option value="NT">Northern Territory</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            id="postalCode"
            name="address.postalCode"
            value={profile.address.postalCode}
            onChange={handleInputChange}
            placeholder="2000"
            maxLength="4"
          />
        </div>
      </div>

      <h4>Social Media</h4>
      
      <div className={styles.socialMediaGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="facebook">
            <FaFacebook /> Facebook
          </label>
          <input
            type="url"
            id="facebook"
            name="socialMedia.facebook"
            value={profile.socialMedia.facebook}
            onChange={handleInputChange}
            placeholder="https://facebook.com/yourcharity"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="twitter">
            <FaTwitter /> Twitter
          </label>
          <input
            type="url"
            id="twitter"
            name="socialMedia.twitter"
            value={profile.socialMedia.twitter}
            onChange={handleInputChange}
            placeholder="https://twitter.com/yourcharity"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="instagram">
            <FaInstagram /> Instagram
          </label>
          <input
            type="url"
            id="instagram"
            name="socialMedia.instagram"
            value={profile.socialMedia.instagram}
            onChange={handleInputChange}
            placeholder="https://instagram.com/yourcharity"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="linkedin">
            <FaLinkedin /> LinkedIn
          </label>
          <input
            type="url"
            id="linkedin"
            name="socialMedia.linkedin"
            value={profile.socialMedia.linkedin}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/company/yourcharity"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="youtube">
            <FaYoutube /> YouTube
          </label>
          <input
            type="url"
            id="youtube"
            name="socialMedia.youtube"
            value={profile.socialMedia.youtube}
            onChange={handleInputChange}
            placeholder="https://youtube.com/c/yourcharity"
          />
        </div>
      </div>
    </div>
  );

  const renderMediaUpload = () => (
    <div className={styles.tabContent}>
      <h3>Media & Branding</h3>
      
      <div className={styles.mediaSection}>
        <h4>Logo</h4>
        <p className={styles.mediaHint}>Upload your charity's logo (PNG or JPG, max 5MB)</p>
        
        <div className={styles.imageUpload}>
          <div className={styles.imagePreview}>
            {(previewImages.logo || profile.logo) ? (
              <img 
                src={previewImages.logo || profile.logo} 
                alt="Logo preview" 
              />
            ) : (
              <div className={styles.placeholderImage}>
                <FaCamera />
                <span>No logo uploaded</span>
              </div>
            )}
          </div>
          
          <label className={styles.uploadButton}>
            <FaCamera /> Choose Logo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'logo')}
              className="display-none"
            />
          </label>
        </div>
      </div>

      <div className={styles.mediaSection}>
        <h4>Cover Image</h4>
        <p className={styles.mediaHint}>
          Upload a cover image for your profile page (PNG or JPG, max 5MB, recommended 1200x400px)
        </p>
        
        <div className={styles.imageUpload}>
          <div className={styles.coverImagePreview}>
            {(previewImages.coverImage || profile.coverImage) ? (
              <img 
                src={previewImages.coverImage || profile.coverImage} 
                alt="Cover preview" 
              />
            ) : (
              <div className={styles.placeholderCover}>
                <FaCamera />
                <span>No cover image uploaded</span>
              </div>
            )}
          </div>
          
          <label className={styles.uploadButton}>
            <FaCamera /> Choose Cover Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'coverImage')}
              className="display-none"
            />
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles?.loading || 'loading'}>
        <div className={styles?.spinner || 'spinner'}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!styles) {
    return <div>Error: Styles not loaded</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Charity Profile</h1>
        <button 
          onClick={() => navigate('/charity-dashboard')}
          className={styles.backButton}
        >
          Back to Dashboard
        </button>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'basic' ? styles.active : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'contact' ? styles.active : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact & Social
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'media' ? styles.active : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
        </div>

        <div className={styles.tabContainer}>
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'contact' && renderContactInfo()}
          {activeTab === 'media' && renderMediaUpload()}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/charity-dashboard')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? (
              <>
                <span className={styles.spinner}></span>
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharityProfileEditor;