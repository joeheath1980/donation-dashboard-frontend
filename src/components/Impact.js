import React, { useContext, useEffect, useState } from 'react';
import DonationsComponent from './DonationsComponent';
import OneOffContributionsComponent from './OneOffContributionsComponent';
import VolunteerActivitiesComponent from './VolunteerActivitiesComponent';
import FundraisingCampaignsComponent from './FundraisingCampaignsComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from '../Impact.module.css';

function Impact() {
  const { donations, volunteerActivities, fundraisingCampaigns, fetchImpactData } = useContext(ImpactContext);

  const [gmailResults, setGmailResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  const handleScrapeGmail = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Initiating Gmail scrape request...');
      const response = await fetch('http://localhost:3002/api/scrape-gmail');
      console.log('Received response:', response.status, response.statusText);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const data = await response.json();
      console.log('Parsed response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.error || 'Unknown error'}`);
      }

      if (Array.isArray(data)) {
        console.log('Successfully scraped Gmail data');
        setGmailResults(data);
      } else if (data.success) {
        console.log('Successfully scraped Gmail data');
        setGmailResults(data.data);
      } else {
        console.error('Unexpected data structure:', data);
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error scraping Gmail:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Your Contributions</h2>

      <div className={styles.contributionsSection}>
        <h4>Regular Contributions</h4>
        <DonationsComponent donations={donations} />
      </div>

      <div className={styles.contributionsSection}>
        <h4>One-off Contributions</h4>
        <OneOffContributionsComponent />
      </div>

      <div className={styles.volunteerSection}>
        <VolunteerActivitiesComponent activities={volunteerActivities} />
      </div>

      <div className={styles.fundraisingSection}>
        <FundraisingCampaignsComponent campaigns={fundraisingCampaigns} />
      </div>

      {/* Separate Section for Google Donations */}
      <div className={styles.gmailSection}>
        <h4>Donations from Gmail</h4>
        <button onClick={handleScrapeGmail} disabled={loading}>
          {loading ? 'Scraping...' : 'Scrape Gmail for Donations'}
        </button>
        {loading && <p className={styles.loading}>Scraping Gmail... Please wait.</p>}
        {error && <p className={styles.error}>{error}</p>}
        {gmailResults.length > 0 && (
          <div className={styles.resultsContainer}>
            <h5>Gmail Scrape Results:</h5>
            <ul className={styles.gmailResultsList}>
              {gmailResults.map((result, index) => (
                <li key={index} className={styles.gmailResultItem}>
                  <strong>Charity:</strong> {result.charity}<br />
                  <strong>Date:</strong> {result.date}<br />
                  <strong>Amount:</strong> {result.amount}<br />
                  <strong>Subject:</strong> {result.subject}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Impact;






