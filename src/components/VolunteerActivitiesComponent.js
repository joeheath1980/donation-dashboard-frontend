import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import cleanStyles from './CleanDesign.module.css';
import styles from './VolunteerActivities.module.css';
import modalStyles from './ModalStyles.module.css';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';

function VolunteerActivitiesComponent({ userId }) {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    organization: '',
    hours: '',
    date: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3002/api/volunteerActivities`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:3002/api/volunteerActivities', newActivity, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setActivities([...activities, response.data]);
      setNewActivity({ organization: '', hours: '', date: '', description: '' });
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
      await axios.delete(`http://localhost:3002/api/volunteerActivities/${activityId}`, {
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
            />
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
        <h2 className={`${styles.header} ${cleanStyles.gradientTitle}`}>Volunteer Activities</h2>

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
                  <p><strong>Description:</strong> {activity.description}</p>
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

        <button 
          onClick={() => setIsAddActivityModalOpen(true)} 
          className={styles.createButton}
        >
          <FaPlus /> Add Activity
        </button>
      </div>
      {createPortal(modalContent, document.body)}
    </>
  );
}

export default VolunteerActivitiesComponent;