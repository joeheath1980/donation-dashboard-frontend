import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cleanStyles from './CleanDesign.module.css';
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

  return (
    <div className={cleanStyles.container}>
      <h2 className={cleanStyles.header}>Volunteer Activities</h2>

      {error && <p className={cleanStyles.error}>{error}</p>}

      {activities.length > 0 ? (
        <div className={cleanStyles.grid}>
          {activities.map(activity => (
            <div key={activity._id} className={cleanStyles.card}>
              <div className={cleanStyles.cardHeader}>
                <h3 className={cleanStyles.cardTitle}>{activity.organization}</h3>
                <span className={`${cleanStyles.badge} ${activity.status === 'active' ? cleanStyles.badgeSuccess : cleanStyles.badgeWarning}`}>
                  {activity.status}
                </span>
              </div>
              <div className={cleanStyles.cardContent}>
                <p><strong>Hours:</strong> {activity.hours}</p>
                <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {activity.description}</p>
              </div>
              <div className={cleanStyles.cardActions}>
                <button 
                  onClick={() => handleDeleteActivity(activity._id)} 
                  className={cleanStyles.iconButton}
                  aria-label="Delete Activity"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={cleanStyles.textCenter}>No volunteer activities found.</p>
      )}

      <button 
        onClick={() => setIsAddActivityModalOpen(true)} 
        className={`${cleanStyles.button} ${cleanStyles.mt-10}`}
      >
        <FaPlus /> Add Activity
      </button>

      {isAddActivityModalOpen && (
        <div className={cleanStyles.modal}>
          <div className={cleanStyles.modalContent}>
            <h3 className={cleanStyles.modalHeader}>Add New Activity</h3>
            <form onSubmit={handleSubmit} className={cleanStyles.form}>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Organization:</label>
                <input 
                  type="text" 
                  name="organization" 
                  value={newActivity.organization} 
                  onChange={handleChange} 
                  required 
                  className={cleanStyles.input}
                />
              </div>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Hours:</label>
                <input 
                  type="number" 
                  name="hours" 
                  value={newActivity.hours} 
                  onChange={handleChange} 
                  required 
                  className={cleanStyles.input}
                />
              </div>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Date:</label>
                <input 
                  type="date" 
                  name="date" 
                  value={newActivity.date} 
                  onChange={handleChange} 
                  required 
                  className={cleanStyles.input}
                />
              </div>
              <div className={cleanStyles.formGroup}>
                <label className={cleanStyles.label}>Description:</label>
                <textarea 
                  name="description" 
                  value={newActivity.description} 
                  onChange={handleChange}
                  className={cleanStyles.textarea}
                />
              </div>
              <div className={cleanStyles.modalActions}>
                <button type="button" onClick={() => setIsAddActivityModalOpen(false)} className={cleanStyles.buttonSecondary}>Cancel</button>
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
