import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../SearchCharities.module.css';
import { FaSearch, FaInfoCircle } from 'react-icons/fa';

function SearchCharities() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useProxy, setUseProxy] = useState(true);

  useEffect(() => {
    // Check if proxy server is available
    const checkProxyAvailability = async () => {
      try {
        await axios.get('http://localhost:3001/health-check', { timeout: 1000 });
        setUseProxy(true);
      } catch (error) {
        console.log('Proxy server not available, will use direct API calls');
        setUseProxy(false);
      }
    };

    checkProxyAvailability();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (useProxy) {
        response = await axios.get(`http://localhost:3001/api/search-charities`, {
          params: { q: query }
        });
      } else {
        response = await axios.get(`https://data.gov.au/data/api/3/action/datastore_search`, {
          params: {
            resource_id: 'eb1e6be4-5b13-4feb-b28e-388bf7c26f93',
            q: query
          }
        });
      }

      console.log('API Response:', response);

      if (response.data.success) {
        setResults(response.data.result.records);
      } else {
        setError('Failed to fetch results. Please try again.');
      }
    } catch (err) {
      console.error('Error searching charities:', err);
      console.log('Error details:', err.response ? err.response.data : 'No response data');
      setError(`An error occurred while searching: ${err.message}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <h1 className={styles.header}>Search Charities</h1>
        <p className={styles.introText}>
          Discover charities that align with your values. Search for charities and view their details to learn more about their mission and impact.
        </p>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for charities"
            className={styles.input}
          />
          <button type="submit" className={styles.searchButton}>
            <FaSearch /> Search
          </button>
        </form>
      </div>

      {isLoading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.resultsGrid}>
        {results.map((charity) => (
          <div key={charity._id} className={styles.card}>
            <h2 className={styles.charityName}>{charity['Charity_Legal_Name']}</h2>
            <p className={styles.charityDetails}><strong>ABN:</strong> {charity['ABN']}</p>
            <p className={styles.charityDetails}><strong>State:</strong> {charity['State']}</p>
            <div className={styles.actionButtons}>
              <Link to={`/charity/${charity['ABN']}`} className={styles.viewDetailsButton}>
                <FaInfoCircle /> View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      {results.length > 0 && (
        <div className={styles.guidanceBox}>
          <h3>What you can do:</h3>
          <ul>
            <li>Click on "View Details" to learn more about a charity</li>
            <li>On the charity's detail page, you can choose to follow, find matching opportunities, or make donations</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchCharities;