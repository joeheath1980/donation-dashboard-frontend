import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cleanStyles from './CleanDesign.module.css';
import styles from './VolunteerActivities.module.css';
import { FaPlus, FaTrash } from 'react-icons/fa';

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
    
    if (isAddActivityModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [userId, isAddActivityModalOpen]);

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

  return (
    <div className={styles.volunteerContainer}>
      <h2 className={`${styles.header} ${cleanStyles.gradientTitle}`}>Volunteer Activities</h2>

      {error && <p className={styles.error}>{error}</p>}

      {activities.length > 0 ? (
        <div className={styles.activitiesGrid}>
          {activities.map(activity => (
            <div key={activity._id} className={styles.activityCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{activity.organization}</h3>
                <span className={`${styles.badge} ${activity.status === 'active' ? styles.badgeSuccess : styles.badgeWarning}`}>
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
        className={`${cleanStyles.button} ${styles.addButton}`}
      >
        <FaPlus /> Add Activity
      </button>

      {isAddActivityModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>Add New Activity</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Organization:</label>
                <input 
                  type="text" 
                  name="organization" 
                  value={newActivity.organization} 
                  onChange={handleChange} 
                  required 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Hours:</label>
                <input 
                  type="number" 
                  name="hours" 
                  value={newActivity.hours} 
                  onChange={handleChange} 
                  required 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date:</label>
                <input 
                  type="date" 
                  name="date" 
                  value={newActivity.date} 
                  onChange={handleChange} 
                  required 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Description:</label>
                <textarea 
                  name="description" 
                  value={newActivity.description} 
                  onChange={handleChange}
                  className={styles.textarea}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsAddActivityModalOpen(false)} className={styles.buttonSecondary}>Cancel</button>
                <button type="submit" className={cleanStyles.button}>Add Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerActivitiesComponent;
