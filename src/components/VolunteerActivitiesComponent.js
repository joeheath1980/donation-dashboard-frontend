import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { CHARITY_CATEGORIES, formatABN, validateABN, ABN_HELPER_TEXT } from '../constants/charityCategories';
import CharitySearch from './CharitySearch/CharitySearch';
import './SharedStyles.css';
import styles from './VolunteerActivities.module.css';
import modalStyles from './ModalStyles.module.css';
import { FaPlus, FaTrash, FaTimes, FaUpload, FaFile, FaHandsHelping } from 'react-icons/fa';

const VolunteerActivitiesComponent = forwardRef(({ userId }, ref) => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    organization: '',
    organizationABN: '',
    hours: '',
    date: '',
    description: '',
    charityType: ''
  });
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [abnStatus, setAbnStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  
  // Expose openModal method to parent component
  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsAddActivityModalOpen(true);
    }
  }));

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/volunteerActivities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching volunteer activities:', error);
      setError('Failed to fetch activities. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle ABN formatting
    if (name === 'organizationABN') {
      const formattedABN = formatABN(value);
      setNewActivity({ ...newActivity, organizationABN: formattedABN });
      
      // Validate ABN
      if (value.length > 0) {
        if (validateABN(value)) {
          setAbnStatus('✓ Valid ABN format');
        } else {
          setAbnStatus('ABN should be 11 digits');
        }
      } else {
        setAbnStatus('');
      }
    } else {
      setNewActivity({ ...newActivity, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        setSelectedFile(file);
        setError('');
      } else {
        setError('File size must be less than 5MB');
      }
    } else {
      setError('Please select an image or PDF file');
    }
  };

  const handleCharitySelect = (charity) => {
    setSelectedCharity(charity);
    setNewActivity({
      ...newActivity,
      organization: charity.name,
      organizationABN: formatABN(charity.abn || charity.ABN || ''),
      charityType: charity.category || ''
    });
    // Clear ABN status as we now have a valid charity
    setAbnStatus('✓ Valid charity selected');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload evidence for your volunteer activity');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('organization', newActivity.organization);
    formData.append('organizationABN', newActivity.organizationABN);
    formData.append('hours', newActivity.hours);
    formData.append('date', newActivity.date);
    formData.append('description', newActivity.description);
    formData.append('charityType', newActivity.charityType);
    formData.append('evidence', selectedFile);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/volunteerActivities`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      setActivities([...activities, response.data]);
      setNewActivity({ organization: '', organizationABN: '', hours: '', date: '', description: '', charityType: '' });
      setSelectedCharity(null);
      setSelectedFile(null);
      setError('');
      setAbnStatus('');
      setIsAddActivityModalOpen(false);
    } catch (error) {
      console.error('Error adding volunteer activity:', error);
      setError('Failed to add activity. Please try again.');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/volunteerActivities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setActivities(activities.filter(activity => activity._id !== activityId));
    } catch (error) {
      console.error('Error deleting volunteer activity:', error);
      setError('Failed to delete activity. Please try again.');
    }
  };

  const modalContent = isAddActivityModalOpen && (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <button
          onClick={() => setIsAddActivityModalOpen(false)}
          className={modalStyles.closeButton}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
        <h3 className={modalStyles.modalHeader}>Add New Activity</h3>
        <form onSubmit={handleSubmit} className={modalStyles.form}>
          <div className={modalStyles.formGroup}>
            <label>Search Organization</label>
            <CharitySearch
              onCharitySelect={handleCharitySelect}
              placeholder="Search for a registered charity..."
              required
            />
            {selectedCharity && (
              <div className={modalStyles.selectedCharityInfo}>
                <h4>{selectedCharity.name}</h4>
                <p>ABN: {formatABN(selectedCharity.abn || selectedCharity.ABN || '')}</p>
                {selectedCharity.category && <p>Category: {selectedCharity.category}</p>}
              </div>
            )}
          </div>
          
          {/* Show manual input only if they want to enter a non-registered organization */}
          <details className={modalStyles.manualEntrySection}>
            <summary>Organization not found? Enter manually</summary>
            <div className={modalStyles.formGroup}>
              <label>Organization Name</label>
              <input 
                type="text" 
                name="organization" 
                value={newActivity.organization} 
                onChange={handleChange} 
                placeholder="Organization name"
              />
            </div>
            <div className={modalStyles.formGroup}>
              <label>Organization ABN (optional)</label>
              <input 
                type="text" 
                name="organizationABN" 
                placeholder="XX XXX XXX XXX"
                value={newActivity.organizationABN} 
                onChange={handleChange} 
                maxLength="14"
              />
              <small className={modalStyles.helperText}>
                {abnStatus || ABN_HELPER_TEXT}
              </small>
            </div>
            <div className={modalStyles.formGroup}>
              <label>Charity Type</label>
              <select
                name="charityType"
                value={newActivity.charityType}
                onChange={handleChange}
                className="select"
              >
                <option value="">Select a charity type</option>
                {CHARITY_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </details>
          <div className={modalStyles.formGroup}>
            <label>Hours</label>
            <input 
              type="number" 
              name="hours" 
              value={newActivity.hours} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Date</label>
            <input 
              type="date" 
              name="date" 
              value={newActivity.date} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Description</label>
            <textarea 
              name="description" 
              value={newActivity.description} 
              onChange={handleChange}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Evidence (Image or PDF, max 5MB)</label>
            <div className={styles.fileUploadContainer}>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="evidence-upload"
                required
              />
              <label htmlFor="evidence-upload" className={styles.fileUploadButton}>
                <FaUpload /> Upload Evidence
              </label>
              {selectedFile && (
                <span className={styles.fileName}>
                  <FaFile /> {selectedFile.name}
                </span>
              )}
            </div>
          </div>
          <div className={modalStyles.buttonGroup}>
            <button 
              type="button" 
              onClick={() => setIsAddActivityModalOpen(false)} 
              className={`${modalStyles.button} ${modalStyles.cancelButton}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${modalStyles.button} ${modalStyles.confirmButton}`}
            >
              Add Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h2 className={styles.header}>
            <FaHandsHelping className={styles.icon} /> Volunteer Activities
          </h2>
          <button 
            onClick={() => setIsAddActivityModalOpen(true)} 
            className={styles.createButton}
          >
            <FaPlus /> Add Activity
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {activities.length > 0 ? (
          <div className={styles.activitiesGrid}>
            {activities.map(activity => (
              <div key={activity._id} className={styles.activityCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{activity.organization}</h3>
                  <span className={`${styles.status} ${activity.status === 'active' ? styles.active : styles.pending}`}>
                    {activity.status}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <p><strong>Hours:</strong> {activity.hours}</p>
                  <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
                  <p><strong>Charity Type:</strong> {activity.charityType || 'Not specified'}</p>
                  <p><strong>Description:</strong> {activity.description}</p>
                  {activity.evidence && (
                    <a 
                      href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/volunteerActivities/evidence/${activity.evidence.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.evidenceLink}
                    >
                      <FaFile /> View Evidence
                    </a>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button 
                    onClick={() => handleDeleteActivity(activity._id)} 
                    className={styles.iconButton}
                    aria-label="Delete Activity"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.textCenter}>No volunteer activities found.</p>
        )}
      </div>
      {createPortal(modalContent, document.body)}
    </>
  );
});

export default VolunteerActivitiesComponent;