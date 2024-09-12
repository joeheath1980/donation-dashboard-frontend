import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { applyGlobalStyles, globalClasses } from '../utils/styleUtils';
import styles from '../SearchCharities.module.css';
import { FaSearch, FaHeart, FaHandshake, FaDonate } from 'react-icons/fa';

const combinedStyles = applyGlobalStyles(styles, globalClasses);

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
    <div className={combinedStyles.container}>
      <h1 className={combinedStyles.header}>Search Charities</h1>
      <p className={combinedStyles.introText}>
        Discover charities that align with your values. You can follow charities to stay updated,
        find matching opportunities, or make direct donations to support their causes.
      </p>
      <form onSubmit={handleSearch} className={combinedStyles.searchForm}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for charities"
          className={combinedStyles.input}
        />
        <button type="submit" className={combinedStyles.primaryButton}>
          <FaSearch /> Search
        </button>
      </form>

      {isLoading && <p className={combinedStyles.loading}>Loading...</p>}
      {error && <p className={combinedStyles.error}>{error}</p>}

      <div className={combinedStyles.resultsGrid}>
        {results.map((charity) => (
          <div key={charity._id} className={combinedStyles.card}>
            <h2 className={combinedStyles.subheader}>{charity['Charity_Legal_Name']}</h2>
            <p className={combinedStyles.paragraph}><strong>ABN:</strong> {charity['ABN']}</p>
            <p className={combinedStyles.paragraph}><strong>State:</strong> {charity['State']}</p>
            <div className={combinedStyles.actionButtons}>
              <Link to={`/charity/${charity['ABN']}`} className={combinedStyles.secondaryButton}>
                <FaHeart /> Follow
              </Link>
              <Link to={`/matching/${charity['ABN']}`} className={combinedStyles.secondaryButton}>
                <FaHandshake /> Find Matches
              </Link>
              <Link to={`/donate/${charity['ABN']}`} className={combinedStyles.secondaryButton}>
                <FaDonate /> Donate
              </Link>
            </div>
          </div>
        ))}
      </div>
      {results.length > 0 && (
        <div className={combinedStyles.guidanceBox}>
          <h3>What you can do:</h3>
          <ul>
            <li><strong>Follow:</strong> Stay updated with the charity's activities and news</li>
            <li><strong>Find Matches:</strong> Discover matching opportunities to multiply your impact</li>
            <li><strong>Donate:</strong> Make a direct contribution to support the charity's cause</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchCharities;