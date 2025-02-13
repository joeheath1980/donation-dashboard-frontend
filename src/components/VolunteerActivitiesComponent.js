import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import sharedStyles from './SharedStyles.css';
import styles from './VolunteerActivities.module.css';
import modalStyles from './ModalStyles.module.css';
import { FaPlus, FaTrash, FaTimes, FaUpload, FaFile, FaHandsHelping } from 'react-icons/fa';

const CHARITY_TYPES = [
  { value: "Health Services", label: "Health Services" },
  { value: "Mental Health", label: "Mental Health" },
  { value: "Education", label: "Education" },
  { value: "Environmental Conservation", label: "Environmental Conservation" },
  { value: "Social Welfare", label: "Social Welfare" },
  { value: "Emergency Relief", label: "Emergency Relief" },
  { value: "Food Security", label: "Food Security" },
  { value: "Child Welfare", label: "Child Welfare" },
  { value: "Indigenous Support", label: "Indigenous Support" },
  { value: "Housing", label: "Housing" },
  { value: "Community Building", label: "Community Building" },
  { value: "Rural Support", label: "Rural Support" }
];

function VolunteerActivitiesComponent({ userId }) {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    organization: '',
    hours: '',
    date: '',
    description: '',
    charityType: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`process.env.API_BASE_URL/api/volunteerActivities`, {
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
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload evidence for your volunteer activity');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('organization', newActivity.organization);
    formData.append('hours', newActivity.hours);
    formData.append('date', newActivity.date);
    formData.append('description', newActivity.description);
    formData.append('charityType', newActivity.charityType);
    formData.append('evidence', selectedFile);

    try {
      const response = await axios.post('process.env.API_BASE_URL/api/volunteerActivities', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      setActivities([...activities, response.data]);
      setNewActivity({ organization: '', hours: '', date: '', description: '', charityType: '' });
      setSelectedFile(null);
      setError('');
      setIsAddActivityModalOpen(false);
    } catch (error) {
      console.error('Error adding volunteer activity:', error);
      setError('Failed to add activity. Please try again.');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`process.env.API_BASE_URL/api/volunteerActivities/${activityId}`, {
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
            <label>Organization</label>
            <input 
              type="text" 
              name="organization" 
              value={newActivity.organization} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Charity Type</label>
            <select
              name="charityType"
              value={newActivity.charityType}
              onChange={handleChange}
              required
              className={sharedStyles.select}
            >
              <option value="">Select a charity type</option>
              {CHARITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
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
          <h2 className={`${styles.header} ${sharedStyles.gradientTitle}`}>
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
                  <p><strong>Charity Type:</strong> {
                    CHARITY_TYPES.find(type => type.value === activity.charityType)?.label || 
                    activity.charityType || 
                    'Not specified'
                  }</p>
                  <p><strong>Description:</strong> {activity.description}</p>
                  {activity.evidence && (
                    <a 
                      href={`process.env.API_BASE_URL/api/volunteerActivities/evidence/${activity.evidence.split('/').pop()}`}
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
}

export default VolunteerActivitiesComponent;