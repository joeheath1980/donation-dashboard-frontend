import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './CharityProfileEditor.module.css';
import {
  FaArrowLeft,
  FaUser,
  FaSave,
  FaCamera,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaFileAlt,
  FaImage,
  FaVideo,
  FaTrash,
  FaPlus,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

function CharityProfileEditor() {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [profile, setProfile] = useState({
    // Basic Information
    name: '',
    tagline: '',
    category: '',
    abn: '',
    established: '',
    logo: null,
    coverImage: null,
    
    // Contact Information
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Australia'
    },
    website: '',
    
    // About
    mission: '',
    vision: '',
    description: '',
    impactStatement: '',
    
    // Social Media
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    
    // Media Gallery
    gallery: [],
    videos: [],
    
    // Programs & Initiatives
    programs: [],
    
    // Team Members
    team: [],
    
    // Bank Details (for donations)
    bankDetails: {
      accountName: '',
      bsb: '',
      accountNumber: ''
    }
  });

  useEffect(() => {
    fetchCharityProfile();
  }, []);

  const fetchCharityProfile = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await axios.get(...);
      
      // For demo, use mock data
      setProfile({
        name: 'Hope Foundation Australia',
        tagline: 'Building brighter futures for children in need',
        category: 'Education',
        abn: '12 345 678 901',
        established: '2015',
        logo: '/logo-placeholder.png',
        coverImage: '/cover-placeholder.jpg',
        
        email: 'contact@hopefoundation.org.au',
        phone: '+61 2 9876 5432',
        address: {
          street: '123 Charity Lane',
          city: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          country: 'Australia'
        },
        website: 'https://hopefoundation.org.au',
        
        mission: 'To provide quality education and support services to underprivileged children across Australia.',
        vision: 'A world where every child has access to quality education and opportunity.',
        description: 'Hope Foundation Australia is a registered charity dedicated to improving educational outcomes for disadvantaged children. We work with schools, communities, and families to provide resources, mentoring, and support programs.',
        impactStatement: 'Since 2015, we have helped over 5,000 children access quality education and support services.',
        
        socialMedia: {
          facebook: 'https://facebook.com/hopefoundationau',
          twitter: 'https://twitter.com/hopefoundau',
          instagram: 'https://instagram.com/hopefoundationau',
          linkedin: '',
          youtube: ''
        },
        
        gallery: [
          { id: 1, url: '/gallery1.jpg', caption: 'Annual fundraiser event' },
          { id: 2, url: '/gallery2.jpg', caption: 'Students in our mentoring program' }
        ],
        
        videos: [],
        
        programs: [
          { id: 1, name: 'After School Tutoring', description: 'Free tutoring for students' },
          { id: 2, name: 'Scholarship Program', description: 'Financial support for education' }
        ],
        
        team: [
          { id: 1, name: 'Jane Smith', role: 'CEO', photo: null },
          { id: 2, name: 'John Doe', role: 'Program Director', photo: null }
        ],
        
        bankDetails: {
          accountName: 'Hope Foundation Australia',
          bsb: '062-000',
          accountNumber: '1234****'
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      
      // Handle nested fields
      const newProfile = { ...prev };
      let current = newProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newProfile;
    });
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleImageUpload = async (type) => {
    const input = type === 'logo' ? logoInputRef : fileInputRef;
    input.current?.click();
  };

  const handleFileSelect = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ [type]: 'Please select an image file' });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ [type]: 'Image size must be less than 5MB' });
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, [type]: previewUrl }));
    
    // In real app, would upload to server here
  };

  const handleAddProgram = () => {
    const newProgram = {
      id: Date.now(),
      name: '',
      description: '',
      isNew: true
    };
    setProfile(prev => ({
      ...prev,
      programs: [...prev.programs, newProgram]
    }));
  };

  const handleUpdateProgram = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      programs: prev.programs.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleDeleteProgram = (id) => {
    setProfile(prev => ({
      ...prev,
      programs: prev.programs.filter(p => p.id !== id)
    }));
  };

  const handleAddTeamMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      photo: null,
      isNew: true
    };
    setProfile(prev => ({
      ...prev,
      team: [...prev.team, newMember]
    }));
  };

  const handleUpdateTeamMember = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      team: prev.team.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleDeleteTeamMember = (id) => {
    setProfile(prev => ({
      ...prev,
      team: prev.team.filter(m => m.id !== id)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.name) newErrors.name = 'Charity name is required';
    if (!profile.email) newErrors.email = 'Email is required';
    if (!profile.phone) newErrors.phone = 'Phone number is required';
    if (!profile.mission) newErrors.mission = 'Mission statement is required';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profile.email && !emailRegex.test(profile.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Validate ABN format
    const abnRegex = /^[0-9\s]+$/;
    if (profile.abn && !abnRegex.test(profile.abn.replace(/\s/g, ''))) {
      newErrors.abn = 'Invalid ABN format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    
    try {
      setSaving(true);
      // API call would go here
      // await axios.put('/api/charity/profile', profile, getAuthHeaders());
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/charity-dashboard')} className={styles.backButton}>
              <FaArrowLeft /> Back to Dashboard
            </button>
            <h1 className={styles.title}>
              <FaUser /> Edit Charity Profile
            </h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className={styles.saveButton}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>
          <FaCheck /> {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className={styles.errorMessage}>
          <FaExclamationTriangle /> {errors.submit}
        </div>
      )}

      <div className={styles.tabs}>
        <button 
          className={activeTab === 'basic' ? styles.activeTab : ''}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button 
          className={activeTab === 'contact' ? styles.activeTab : ''}
          onClick={() => setActiveTab('contact')}
        >
          Contact
        </button>
        <button 
          className={activeTab === 'about' ? styles.activeTab : ''}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button 
          className={activeTab === 'social' ? styles.activeTab : ''}
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
        <button 
          className={activeTab === 'programs' ? styles.activeTab : ''}
          onClick={() => setActiveTab('programs')}
        >
          Programs
        </button>
        <button 
          className={activeTab === 'team' ? styles.activeTab : ''}
          onClick={() => setActiveTab('team')}
        >
          Team
        </button>
        <button 
          className={activeTab === 'media' ? styles.activeTab : ''}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'basic' && (
          <div className={styles.section}>
            <h2>Basic Information</h2>
            
            <div className={styles.imageSection}>
              <div className={styles.logoUpload}>
                <h3>Logo</h3>
                <div className={styles.imagePreview}>
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" />
                  ) : (
                    <FaImage />
                  )}
                  <button 
                    onClick={() => handleImageUpload('logo')}
                    className={styles.uploadButton}
                  >
                    <FaCamera /> Change Logo
                  </button>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'logo')}
                  className="display-none"
                />
              </div>
              
              <div className={styles.coverUpload}>
                <h3>Cover Image</h3>
                <div className={styles.coverPreview}>
                  {profile.coverImage ? (
                    <img src={profile.coverImage} alt="Cover" />
                  ) : (
                    <FaImage />
                  )}
                  <button 
                    onClick={() => handleImageUpload('cover')}
                    className={styles.uploadButton}
                  >
                    <FaCamera /> Change Cover
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'coverImage')}
                  className="display-none"
                />
              </div>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Charity Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? styles.error : ''}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>
              
              <div className={styles.formGroup}>
                <label>Tagline</label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Short description of your charity"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  value={profile.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Animals">Animals</option>
                  <option value="Community">Community</option>
                  <option value="Arts">Arts & Culture</option>
                  <option value="International">International Aid</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>ABN</label>
                <input
                  type="text"
                  value={profile.abn}
                  onChange={(e) => handleInputChange('abn', e.target.value)}
                  placeholder="XX XXX XXX XXX"
                  className={errors.abn ? styles.error : ''}
                />
                {errors.abn && <span className={styles.errorText}>{errors.abn}</span>}
              </div>
              
              <div className={styles.formGroup}>
                <label>Year Established</label>
                <input
                  type="text"
                  value={profile.established}
                  onChange={(e) => handleInputChange('established', e.target.value)}
                  placeholder="YYYY"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className={styles.section}>
            <h2>Contact Information</h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? styles.error : ''}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>
              
              <div className={styles.formGroup}>
                <label>Phone *</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? styles.error : ''}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>
              
              <div className={styles.formGroup}>
                <label>Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourcharity.org.au"
                />
              </div>
            </div>
            
            <h3>Address</h3>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Street Address</label>
                <input
                  type="text"
                  value={profile.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>City</label>
                <input
                  type="text"
                  value={profile.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>State</label>
                <select
                  value={profile.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                >
                  <option value="">Select state</option>
                  <option value="NSW">New South Wales</option>
                  <option value="VIC">Victoria</option>
                  <option value="QLD">Queensland</option>
                  <option value="SA">South Australia</option>
                  <option value="WA">Western Australia</option>
                  <option value="TAS">Tasmania</option>
                  <option value="NT">Northern Territory</option>
                  <option value="ACT">Australian Capital Territory</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Postcode</label>
                <input
                  type="text"
                  value={profile.address.postcode}
                  onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className={styles.section}>
            <h2>About Your Charity</h2>
            
            <div className={styles.formGroup}>
              <label>Mission Statement *</label>
              <textarea
                value={profile.mission}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                rows={3}
                className={errors.mission ? styles.error : ''}
              />
              {errors.mission && <span className={styles.errorText}>{errors.mission}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Vision Statement</label>
              <textarea
                value={profile.vision}
                onChange={(e) => handleInputChange('vision', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={5}
                placeholder="Tell donors about your charity's work and impact..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Impact Statement</label>
              <textarea
                value={profile.impactStatement}
                onChange={(e) => handleInputChange('impactStatement', e.target.value)}
                rows={3}
                placeholder="Describe the impact your charity has made..."
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className={styles.section}>
            <h2>Social Media Links</h2>
            
            <div className={styles.socialGrid}>
              <div className={styles.socialInput}>
                <FaFacebook className={styles.socialIcon} />
                <input
                  type="url"
                  value={profile.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div className={styles.socialInput}>
                <FaTwitter className={styles.socialIcon} />
                <input
                  type="url"
                  value={profile.socialMedia.twitter}
                  onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              
              <div className={styles.socialInput}>
                <FaInstagram className={styles.socialIcon} />
                <input
                  type="url"
                  value={profile.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="https://instagram.com/yourpage"
                />
              </div>
              
              <div className={styles.socialInput}>
                <FaLinkedin className={styles.socialIcon} />
                <input
                  type="url"
                  value={profile.socialMedia.linkedin}
                  onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourpage"
                />
              </div>
              
              <div className={styles.socialInput}>
                <FaYoutube className={styles.socialIcon} />
                <input
                  type="url"
                  value={profile.socialMedia.youtube}
                  onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                  placeholder="https://youtube.com/c/yourchannel"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Programs & Initiatives</h2>
              <button onClick={handleAddProgram} className={styles.addButton}>
                <FaPlus /> Add Program
              </button>
            </div>
            
            <div className={styles.programsList}>
              {profile.programs.map(program => (
                <div key={program.id} className={styles.programCard}>
                  <input
                    type="text"
                    value={program.name}
                    onChange={(e) => handleUpdateProgram(program.id, 'name', e.target.value)}
                    placeholder="Program name"
                    className={styles.programName}
                  />
                  <textarea
                    value={program.description}
                    onChange={(e) => handleUpdateProgram(program.id, 'description', e.target.value)}
                    placeholder="Program description"
                    rows={2}
                  />
                  <button 
                    onClick={() => handleDeleteProgram(program.id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Team Members</h2>
              <button onClick={handleAddTeamMember} className={styles.addButton}>
                <FaPlus /> Add Team Member
              </button>
            </div>
            
            <div className={styles.teamGrid}>
              {profile.team.map(member => (
                <div key={member.id} className={styles.teamCard}>
                  <div className={styles.memberPhoto}>
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleUpdateTeamMember(member.id, 'name', e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => handleUpdateTeamMember(member.id, 'role', e.target.value)}
                    placeholder="Role"
                  />
                  <button 
                    onClick={() => handleDeleteTeamMember(member.id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className={styles.section}>
            <h2>Media Gallery</h2>
            
            <div className={styles.mediaUpload}>
              <button className={styles.uploadMediaButton}>
                <FaImage /> Upload Images
              </button>
              <button className={styles.uploadMediaButton}>
                <FaVideo /> Add Video Link
              </button>
            </div>
            
            <div className={styles.mediaGrid}>
              {profile.gallery.map(item => (
                <div key={item.id} className={styles.mediaItem}>
                  <img src={item.url} alt={item.caption} />
                  <input
                    type="text"
                    value={item.caption}
                    placeholder="Caption"
                    className={styles.caption}
                  />
                  <button className={styles.removeMedia}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CharityProfileEditor;
