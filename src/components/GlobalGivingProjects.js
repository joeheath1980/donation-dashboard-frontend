import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './GlobalGivingProjects.module.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const PrevArrow = ({ className, style, onClick }) => (
  <div
    className={`${className} ${styles.slickArrow} ${styles.slickPrev}`}
    style={{ ...style }}
    onClick={onClick}
  />
);

const NextArrow = ({ className, style, onClick }) => (
  <div
    className={`${className} ${styles.slickArrow} ${styles.slickNext}`}
    style={{ ...style }}
    onClick={onClick}
  />
);

const GlobalGivingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders, user } = useAuth();
  const { formPersonalizedSearchQuery } = useContext(ImpactContext);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const searchQuery = formPersonalizedSearchQuery();
      console.log('Search Query:', searchQuery);

      const apiUrl = process.env.REACT_APP_API_URL;
      const endpoint = `${apiUrl}/api/globalgiving/projects/recommended`;

      console.log('API URL:', endpoint);

      // Only include search query if user is authenticated
      const params = user && searchQuery ? { searchQuery } : undefined;
      
      // Get auth headers and ensure they're properly formatted
      const headers = user ? {
        ...getAuthHeaders(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      } : {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      console.log('Request Config:', {
        params: params,
        headers: headers.Authorization ? 'Bearer token present' : 'No token',
        authenticated: !!user
      });

      const config = {
        params,
        headers,
        timeout: 60000,
      };

      const response = await axios.get(endpoint, config);
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching GlobalGiving projects:', err);
      let errorMessage = 'An unexpected error occurred.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);

        const errorCode = err.response.data.code;
        
        if (err.response.status === 401) {
          switch (errorCode) {
            case 'AUTH_REQUIRED':
              errorMessage = 'Please log in to see personalized project recommendations.';
              break;
            case 'AUTH_FAILED':
              errorMessage = 'Your session has expired. Please refresh the page or log in again.';
              break;
            default:
              errorMessage = !user 
                ? 'Please log in to see personalized project recommendations.'
                : 'Your session has expired. Please refresh the page or log in again.';
          }
        } else if (err.response.status === 500) {
          switch (errorCode) {
            case 'FETCH_ERROR':
              errorMessage = 'Unable to fetch personalized projects at this time. Please try again later.';
              break;
            default:
              errorMessage = err.response.data.message || 'Failed to fetch GlobalGiving projects';
          }
        } else {
          errorMessage = err.response.data.message || 'Failed to fetch GlobalGiving projects';
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        errorMessage = 'No response received from the server. Please try again later.';
      } else {
        console.error('Error message:', err.message);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, formPersonalizedSearchQuery, user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchProjects();
  };

  const formatSummary = (summary) => {
    if (!summary) return 'No description available';
    const words = summary.split(' ');
    if (words.length <= 30) return summary;
    return words.slice(0, 30).join(' ') + '...';
  };

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading {user && formPersonalizedSearchQuery() ? 'personalized' : 'featured'} GlobalGiving projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={handleRetry} className={styles.retryButton}>Retry</button>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className={styles.container}>
      {projects.length === 0 ? (
        <p className={styles.noProjects}>
          No {user && formPersonalizedSearchQuery() ? 'personalized' : 'featured'} projects available at the moment. 
          Please try again later.
        </p>
      ) : (
        <div className={styles.carouselWrapper}>
          <Slider {...settings}>
            {projects.map((project, index) => (
              <div key={project.id || index} className={styles.carouselItemWrapper}>
                <div className={styles.carouselItem}>
                  <div className={styles.itemContent}>
                    <h3 className={styles.itemTitle}>{project.title}</h3>
                    <p className={styles.projectSummary}>
                      {formatSummary(project.summary)}
                    </p>
                    <div className={styles.projectDetails}>
                      <p className={styles.projectGoalLabel}>Fundraising Goal</p>
                      <p className={styles.projectGoal}>
                        {formatAmount(project.goal)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.buttonWrapper}>
                    <a 
                      href={project.projectLink} 
                      className={styles.learnMoreButton} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Support this project
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default GlobalGivingProjects;