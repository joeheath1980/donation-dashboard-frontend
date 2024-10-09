// src/components/GlobalGivingProjects.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ImpactContext } from '../contexts/ImpactContext';
import CarouselComponent from './CarouselComponent';
import styles from './GlobalGivingProjects.module.css';

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

  if (loading) return <div className={styles.loading}>Loading personalized GlobalGiving projects...</div>;
  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={handleRetry} className={styles.retryButton}>Retry</button>
      </div>
    );
  }

  const carouselItems = projects.map(project => ({
    content: (
      <div className={styles.projectCard}>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectSummary}>{project.summary.substring(0, 100)}...</p>
        <p className={styles.projectGoal}>Goal: ${project.goal.toLocaleString()}</p>
        <a href={project.projectLink} className={styles.learnMoreButton} target="_blank" rel="noopener noreferrer">Learn More</a>
      </div>
    )
  }));

  return (
    <div className={styles.container}>
      {projects.length === 0 ? (
        <p className={styles.noProjects}>No personalized projects available at the moment. Please try again later.</p>
      ) : (
        <CarouselComponent items={carouselItems} />
      )}
    </div>
  );
};

export default GlobalGivingProjects;
