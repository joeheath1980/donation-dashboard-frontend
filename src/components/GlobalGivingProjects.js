import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './GlobalGivingProjects.module.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import { ImpactContext } from '../contexts/ImpactContext';
import { API_CONFIG } from '../config/api.config';

// Define the EXTERNAL GlobalGiving API URL.  This is *NOT* your backend.
const GLOBAL_GIVING_API_URL = 'https://api.globalgiving.org/api/public/projectservice/all/projects/summary';

const PrevArrow = ({ className, style, onClick }) => (
  <div
    className={`${className} ${styles.slickArrow} ${styles.slickPrev}`}
    className="style-spread-base"
    onClick={onClick}
  />
);

const NextArrow = ({ className, style, onClick }) => (
  <div
    className={`${className} ${styles.slickArrow} ${styles.slickNext}`}
    className="style-spread-base"
    onClick={onClick}
  />
);

function GlobalGivingProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders, user } = useAuth();
  const { formPersonalizedSearchQuery } = useContext(ImpactContext);
  const sliderRef = useRef(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get personalized search query, if applicable
      const searchQuery = formPersonalizedSearchQuery();
      console.log('Search Query:', searchQuery);

      // Use process.env.REACT_APP_API_BASE_URL for *YOUR* backend endpoint
      const endpoint = `${API_CONFIG.BASE_URL}/api/globalgiving/projects/recommended`;

      console.log('API URL:', endpoint);

      // Include search query if user is authenticated
      const params = user && searchQuery ? { searchQuery } : undefined;

      // Get auth headers (for your backend)
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

      // Make request to *YOUR* backend
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

  // Listen for skip projects event from parent
  useEffect(() => {
    const handleSkipProjects = () => {
      if (sliderRef.current) {
        sliderRef.current.slickNext();
      }
    };

    window.addEventListener('skipProjects', handleSkipProjects);
    return () => {
      window.removeEventListener('skipProjects', handleSkipProjects);
    };
  }, []);

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
        Loading {user && formPersonalizedSearchQuery() ? 'personalised' : 'featured'} GlobalGiving projects...
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
          No {user && formPersonalizedSearchQuery() ? 'personalised' : 'featured'} projects available at the moment.
          Please try again later.
        </p>
      ) : (
        <div className={styles.carouselWrapper}>
          <Slider ref={sliderRef} {...settings}>
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
}

export default GlobalGivingProjects;