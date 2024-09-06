import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Impact.module.css';

function VolunteerActivitiesComponent({ userId }) {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    organization: '',
    hours: '',
    date: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);

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

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const containerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px',
  };

  return (
    <div className={styles.sectionContainer} style={containerStyle}>
      <h3 className={styles.sectionHeader}>Volunteer Activities</h3>

      {error && <p className={styles.error}>{error}</p>}

      {activities.length > 0 ? (
        <ul className={styles.activityList}>
          {activities.map(activity => (
            <li key={activity._id} className={styles.activityItem}>
              <p className={styles.contributionDetail}><strong>Organization:</strong> {activity.organization}</p>
              <p className={styles.contributionDetail}><strong>Hours:</strong> {activity.hours}</p>
              <p className={styles.contributionDetail}><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
              <p className={styles.contributionDetail}><strong>Description:</strong> {activity.description}</p>
              <p className={styles.contributionDetail}><strong>Status:</strong> {activity.status}</p>
              <button 
                onClick={() => handleDeleteActivity(activity._id)} 
                className={styles.deleteButton}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No volunteer activities found.</p>
      )}

      <div className={styles.addActivitySection}>
        <button onClick={toggleMinimize} className={styles.toggleButton}>
          Add Activity {isMinimized ? '▼' : '▲'}
        </button>
        
        {!isMinimized && (
          <form onSubmit={handleSubmit} className={styles.activityForm}>
            <div className={styles.formRow}>
              <input 
                type="text" 
                name="organization" 
                placeholder="Organization" 
                value={newActivity.organization} 
                onChange={handleChange} 
                required 
                className={styles.formInput}
              />
              <input 
                type="number" 
                name="hours" 
                placeholder="Hours" 
                value={newActivity.hours} 
                onChange={handleChange} 
                required 
                className={styles.formInput}
              />
            </div>
            <div className={styles.formRow}>
              <input 
                type="date" 
                name="date" 
                placeholder="Date" 
                value={newActivity.date} 
                onChange={handleChange} 
                required 
                className={styles.formInput}
              />
              <input 
                type="text" 
                name="description" 
                placeholder="Description" 
                value={newActivity.description} 
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
            <button type="submit" className={styles.addButton}>Add Activity</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default VolunteerActivitiesComponent;
