import React, { useContext, useEffect, useState } from 'react';
import DonationsComponent from './DonationsComponent';
import OneOffContributionsComponent from './OneOffContributionsComponent';
import VolunteerActivitiesComponent from './VolunteerActivitiesComponent';
import FundraisingCampaignsComponent from './FundraisingCampaignsComponent';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from '../Impact.module.css';
import axios from 'axios';

function Impact() {
  const {
    donations,
    oneOffContributions,
    volunteerActivities,
    fundraisingCampaigns,
    fetchImpactData,
    addDonation,
    addOneOffContribution
  } = useContext(ImpactContext);

  const [gmailResults, setGmailResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  const handleScrapeGmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3002/api/scrape-gmail');
      const data = await response.json();
      if (response.ok) {
        setGmailResults(data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (index, event) => {
    setSelectedTypes({ ...selectedTypes, [index]: event.target.value });
  };

  const handleCommit = (index) => {
    const donation = gmailResults[index];
    const selectedType = selectedTypes[index];

    console.log('Committing donation:', donation); // Add this log

    if (selectedType === 'regular') {
      addDonation(donation);
    } else if (selectedType === 'one-off') {
      addOneOffContribution(donation);
    }

    // Remove the committed donation from Gmail results
    handleDeleteGmailResult(index);
  };

  const handleDeleteGmailResult = (index) => {
    const updatedResults = gmailResults.filter((_, i) => i !== index);
    setGmailResults(updatedResults);
    const updatedTypes = { ...selectedTypes };
    delete updatedTypes[index];
    setSelectedTypes(updatedTypes);
  };

  const handleDeleteDonation = async (donationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3002/api/donations/${donationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // After successful deletion, refetch the impact data
      fetchImpactData();
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Failed to delete donation. Please try again.');
    }
  };

  const handleDeleteOneOffContribution = async (contributionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3002/api/contributions/one-off/${contributionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // After successful deletion, refetch the impact data
      fetchImpactData();
    } catch (error) {
      console.error('Error deleting one-off contribution:', error);
      alert('Failed to delete one-off contribution. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Your Contributions</h2>

      <div className={styles.contributionsSection}>
        <h4>Regular Contributions</h4>
        <DonationsComponent 
          donations={donations} 
          onDeleteDonation={handleDeleteDonation} 
        />
      </div>

      <div className={styles.contributionsSection}>
        <h4>One-off Contributions</h4>
        <OneOffContributionsComponent 
          contributions={oneOffContributions} 
          onDeleteContribution={handleDeleteOneOffContribution} 
        />
      </div>

      <div className={styles.volunteerSection}>
        <VolunteerActivitiesComponent activities={volunteerActivities} />
      </div>

      <div className={styles.fundraisingSection}>
        <FundraisingCampaignsComponent campaigns={fundraisingCampaigns} />
      </div>

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
                  <strong>Subject:</strong> {result.subject}<br />
                  <select
                    value={selectedTypes[index] || ''}
                    onChange={(event) => handleTypeChange(index, event)}
                  >
                    <option value="">Select Type</option>
                    <option value="regular">Regular Contribution</option>
                    <option value="one-off">One-Off Contribution</option>
                  </select>
                  <button onClick={() => handleCommit(index)}>
                    Commit
                  </button>
                  <button
                    className={styles.deleteIcon}
                    onClick={() => handleDeleteGmailResult(index)}
                    aria-label="Delete Gmail Result"
                  >
                    &times;
                  </button>
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









