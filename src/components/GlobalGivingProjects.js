// src/components/GlobalGivingProjects.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ImpactContext } from '../contexts/ImpactContext';

const GlobalGivingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useAuth();
  const { formPersonalizedSearchQuery } = useContext(ImpactContext);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();
      const searchQuery = formPersonalizedSearchQuery();
      console.log('Search Query:', searchQuery);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const endpoint = `${apiUrl}/api/globalgiving/projects/recommended`;

      console.log('API URL:', endpoint);
      console.log('Headers:', headers);

      const response = await axios.get(endpoint, {
        headers,
        params: { searchQuery },
        timeout: 60000,
      });

      console.log('API Response:', response.data);
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching GlobalGiving projects:', err);
      let errorMessage = 'An unexpected error occurred.';
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
        errorMessage = err.response.data.message || 'Failed to fetch GlobalGiving projects';
      } else if (err.request) {
        console.error('Error request:', err.request);
        errorMessage = 'No response received from the server.';
      } else {
        console.error('Error message:', err.message);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, formPersonalizedSearchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchProjects();
  };

  if (loading) return <div style={styles.loading}>Loading personalized GlobalGiving projects...</div>;
  if (error) {
    return (
      <div style={styles.error}>
        <p>Error: {error}</p>
        <button onClick={handleRetry} style={styles.retryButton}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Personalized GlobalGiving Projects</h2>
      {projects.length === 0 ? (
        <p style={styles.noProjects}>No personalized projects available at the moment. Please try again later.</p>
      ) : (
        <div style={styles.projectGrid}>
          {projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <h3 style={styles.projectTitle}>{project.title}</h3>
              <p style={styles.projectSummary}>{project.summary}</p>
              <div style={styles.projectDetails}>
                <p style={styles.projectGoal}>
                  <strong>Goal:</strong> ${project.goal.toLocaleString()}
                </p>
                <p style={styles.projectFunding}>
                  <strong>Funding:</strong> ${project.funding.toLocaleString()}
                </p>
              </div>
              <a href={project.projectLink} target="_blank" rel="noopener noreferrer" style={styles.learnMore}>
                Learn More
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  loading: {
    fontSize: '18px',
    color: '#666',
    textAlign: 'center',
    margin: '40px 0',
  },
  error: {
    fontSize: '18px',
    color: '#d32f2f',
    textAlign: 'center',
    margin: '40px 0',
  },
  retryButton: {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s ease-in-out',
    ':hover': {
      backgroundColor: '#2980b9',
    },
  },
  noProjects: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    margin: '20px 0',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px',
  },
  projectCard: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
  },
  projectTitle: {
    fontSize: '20px',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  projectSummary: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '15px',
    lineHeight: '1.5',
  },
  projectDetails: {
    marginBottom: '15px',
  },
  projectGoal: {
    fontSize: '14px',
    color: '#3498db',
    marginBottom: '5px',
  },
  projectFunding: {
    fontSize: '14px',
    color: '#2ecc71',
    marginBottom: '15px',
  },
  learnMore: {
    display: 'inline-block',
    padding: '8px 15px',
    background: '#3498db',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'background 0.2s ease-in-out',
    ':hover': {
      background: '#2980b9',
    },
  },
};

export default GlobalGivingProjects;
