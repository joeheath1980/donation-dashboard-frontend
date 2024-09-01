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

  return (
    <div className={styles.sectionContainer}>
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
            </li>
          ))}
        </ul>
      ) : (
        <p>No volunteer activities found.</p>
      )}

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
    </div>
  );
}

export default VolunteerActivitiesComponent;
