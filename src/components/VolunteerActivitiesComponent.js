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

  const containerStyle = {
    backgroundColor: '#e6f7e6', // Changed from '#f0f8ff' to a light green color
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    marginBottom: '40px',
  };

  const headerStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  };

  const activityCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '20px',
    marginBottom: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px',
  };

  const valueStyle = {
    color: '#333',
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  };

  const removeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ff4d4d',
    color: 'white',
    gridColumn: '2',
    justifySelf: 'end',
    alignSelf: 'end',
  };

  const addButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white',
    marginTop: '20px',
  };

  const statusStyle = (status) => ({
    padding: '5px 10px',
    borderRadius: '15px',
    fontWeight: 'bold',
    backgroundColor: status === 'active' ? '#4CAF50' : '#FFA500',
    color: 'white',
    display: 'inline-block',
  });

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  };

  return (
    <div className={styles.sectionContainer} style={containerStyle}>
      <h2 style={headerStyle}>Volunteer Activities</h2>

      {error && <p className={styles.error}>{error}</p>}

      {activities.length > 0 ? (
        <ul className={styles.activityList} style={{ listStyleType: 'none', padding: 0 }}>
          {activities.map(activity => (
            <li key={activity._id} style={activityCardStyle}>
              <div>
                <p style={labelStyle}>Organization:</p>
                <p style={valueStyle}>{activity.organization}</p>
              </div>
              <div>
                <p style={labelStyle}>Hours:</p>
                <p style={valueStyle}>{activity.hours}</p>
              </div>
              <div>
                <p style={labelStyle}>Date:</p>
                <p style={valueStyle}>{new Date(activity.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p style={labelStyle}>Description:</p>
                <p style={valueStyle}>{activity.description}</p>
              </div>
              <div>
                <p style={labelStyle}>Status:</p>
                <p style={statusStyle(activity.status)}>{activity.status}</p>
              </div>
              <button 
                onClick={() => handleDeleteActivity(activity._id)} 
                style={removeButtonStyle}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No volunteer activities found.</p>
      )}

      <button 
        onClick={() => setIsAddActivityModalOpen(true)} 
        style={addButtonStyle}
      >
        Add Activity
      </button>

      {isAddActivityModalOpen && (
        <>
          <div style={overlayStyle} onClick={() => setIsAddActivityModalOpen(false)} />
          <div style={modalStyle}>
            <h3 style={{...headerStyle, fontSize: '24px'}}>Add New Activity</h3>
            <form onSubmit={handleSubmit} className={styles.activityForm}>
              <div style={{marginBottom: '15px'}}>
                <label style={labelStyle}>Organization:</label>
                <input 
                  type="text" 
                  name="organization" 
                  value={newActivity.organization} 
                  onChange={handleChange} 
                  required 
                  style={{width: '100%', padding: '8px', marginTop: '5px'}}
                />
              </div>
              <div style={{marginBottom: '15px'}}>
                <label style={labelStyle}>Hours:</label>
                <input 
                  type="number" 
                  name="hours" 
                  value={newActivity.hours} 
                  onChange={handleChange} 
                  required 
                  style={{width: '100%', padding: '8px', marginTop: '5px'}}
                />
              </div>
              <div style={{marginBottom: '15px'}}>
                <label style={labelStyle}>Date:</label>
                <input 
                  type="date" 
                  name="date" 
                  value={newActivity.date} 
                  onChange={handleChange} 
                  required 
                  style={{width: '100%', padding: '8px', marginTop: '5px'}}
                />
              </div>
              <div style={{marginBottom: '15px'}}>
                <label style={labelStyle}>Description:</label>
                <textarea 
                  name="description" 
                  value={newActivity.description} 
                  onChange={handleChange}
                  style={{width: '100%', padding: '8px', marginTop: '5px', minHeight: '100px'}}
                />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <button type="button" onClick={() => setIsAddActivityModalOpen(false)} style={{...buttonStyle, backgroundColor: '#ccc'}}>Cancel</button>
                <button type="submit" style={{...buttonStyle, backgroundColor: '#4CAF50', color: 'white'}}>Add Activity</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default VolunteerActivitiesComponent;
