import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const GlobalGivingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const headers = getAuthHeaders();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/globalgiving/projects`, { headers });
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching GlobalGiving projects:', err);
        setError(err.response?.data?.message || 'Failed to fetch GlobalGiving projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getAuthHeaders]);

  if (loading) return <div>Loading GlobalGiving projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>GlobalGiving Projects</h2>
      {projects.length === 0 ? (
        <p>No projects available at the moment. Please try again later.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {projects.map(project => (
            <div key={project.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <p>Goal: ${project.goal}</p>
              <p>Funding: ${project.funding}</p>
              <a href={project.projectLink} target="_blank" rel="noopener noreferrer">Learn More</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalGivingProjects;