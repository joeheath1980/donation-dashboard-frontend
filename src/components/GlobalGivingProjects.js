// src/components/GlobalGivingProjects.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ImpactContext } from '../contexts/ImpactContext';
import CarouselComponent from './CarouselComponent';

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

  const carouselItems = projects.map(project => ({
    title: project.title,
    description: `${project.summary.substring(0, 100)}... Goal: $${project.goal.toLocaleString()}`,
    link: project.projectLink,
    button: 'Learn More'
  }));

  return (
    <div style={styles.container}>
      {projects.length === 0 ? (
        <p style={styles.noProjects}>No personalized projects available at the moment. Please try again later.</p>
      ) : (
        <CarouselComponent items={carouselItems} />
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
  },
  noProjects: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    margin: '20px 0',
  },
};

export default GlobalGivingProjects;
