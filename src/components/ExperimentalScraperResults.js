// Frontend: donation-dashboard
// File: src/components/ExperimentalScraperResults.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExperimentalScraperResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExperimentalResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/scrape-gmail-experimental');
      setResults(response.data);
    } catch (err) {
      setError('Failed to fetch experimental scraper results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperimentalResults();
  }, []);

  const handleRunScraper = () => {
    fetchExperimentalResults();
  };

  if (loading) return <div>Loading experimental results...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleRunScraper}>Run Experimental Scraper</button>
      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              <strong>Subject:</strong> {result.subject}<br />
              <strong>From:</strong> {result.from}<br />
              <strong>Date:</strong> {result.date}<br />
              {/* Add more fields as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExperimentalScraperResults;