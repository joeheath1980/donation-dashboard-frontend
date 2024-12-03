import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../SearchCharities.module.css';
import cleanStyles from './CleanDesign.module.css';
import { FaSearch, FaInfoCircle } from 'react-icons/fa';

function SearchCharities() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3002/api/search-charities`, {
        params: { q: query }
      });

      if (response.data.result && response.data.result.records) {
        setResults(response.data.result.records);
      } else {
        setError('Failed to fetch results. Please try again.');
      }
    } catch (err) {
      console.error('Error searching charities:', err);
      setError(`An error occurred while searching: ${err.message}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${cleanStyles.container}`}>
      <div className={`${styles.searchSection} ${cleanStyles.card}`}>
        <h1 className={`${styles.header} ${cleanStyles.heading}`}>Search Charities</h1>
        <p className={`${styles.introText} ${cleanStyles.text}`}>
          Discover charities that align with your values. Search for charities and view their details to learn more about their mission and impact.
        </p>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={cleanStyles.inputGroup}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for charities"
              className={`${styles.input} ${cleanStyles.input}`}
            />
            <button type="submit" className={`${styles.searchButton} ${cleanStyles.button} ${cleanStyles.primary}`}>
              <FaSearch className={cleanStyles.buttonIcon} /> Search
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className={`${styles.loading} ${cleanStyles.loadingContainer}`}>
          Loading...
        </div>
      )}
      
      {error && (
        <div className={`${styles.error} ${cleanStyles.error}`}>
          {error}
        </div>
      )}

      <div className={`${styles.resultsGrid} ${cleanStyles.grid}`}>
        {results.map((charity) => (
          <div key={charity._id} className={`${styles.card} ${cleanStyles.card}`}>
            <h2 className={`${styles.charityName} ${cleanStyles.cardTitle}`}>
              {charity['Charity_Legal_Name']}
            </h2>
            <div className={cleanStyles.cardContent}>
              <p className={`${styles.charityDetails} ${cleanStyles.text}`}>
                <strong>ABN:</strong> {charity['ABN']}
              </p>
              <p className={`${styles.charityDetails} ${cleanStyles.text}`}>
                <strong>State:</strong> {charity['State']}
              </p>
            </div>
            <div className={`${styles.actionButtons} ${cleanStyles.cardActions}`}>
              <Link 
                to={`/charity/${charity['ABN']}`} 
                className={`${styles.viewDetailsButton} ${cleanStyles.button} ${cleanStyles.secondary}`}
              >
                <FaInfoCircle className={cleanStyles.buttonIcon} /> View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className={`${styles.guidanceBox} ${cleanStyles.card} ${cleanStyles.infoCard}`}>
          <h3 className={cleanStyles.cardTitle}>What you can do:</h3>
          <ul className={cleanStyles.list}>
            <li>Click on "View Details" to learn more about a charity</li>
            <li>On the charity's detail page, you can choose to follow, find matching opportunities, or make donations</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchCharities;