import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../CharityPartner.module.css';

// Fallback data in case the API is unavailable
const fallbackCharity = {
  Charity_Legal_Name: "Example Charity",
  ABN: "00000000000",
  Charity_Type: "Public Benevolent Institution",
  Address_Line_1: "123 Example Street",
  Town_City: "Exampletown",
  State: "EX",
  Postcode: "0000",
  Country: "Australia"
};

function CharityPartner() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPrograms, setOpenPrograms] = useState({});
  const [isFollowed, setIsFollowed] = useState(false);

  const fetchCharityDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://data.gov.au/data/api/3/action/datastore_search`, {
        params: {
          resource_id: 'eb1e6be4-5b13-4feb-b28e-388bf7c26f93',
          q: id
        }
      });

      if (response.data.success && response.data.result.records.length > 0) {
        const charityData = response.data.result.records[0];
        setCharity(charityData);

        // Fetch programs data (this part might also fail if the API is unavailable)
        try {
          const programsResponse = await axios.get(`https://data.gov.au/data/api/3/action/datastore_search`, {
            params: {
              resource_id: 'f284bce5-80d3-4ca9-b72b-0f7126495fd1',
              q: charityData.ABN
            }
          });

          if (programsResponse.data.success) {
            setPrograms(programsResponse.data.result.records);
          }
        } catch (programError) {
          console.error('Error fetching programs:', programError);
          // Don't set an error state here, just log it
        }
      } else {
        setError('Charity not found');
      }
    } catch (err) {
      console.error('Error fetching charity details:', err);
      if (err.response && err.response.status === 403) {
        setError('Access to charity data is currently restricted. We apologize for the inconvenience.');
        // Use fallback data
        setCharity(fallbackCharity);
      } else {
        setError('Failed to fetch charity details. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCharityDetails();
  }, [fetchCharityDetails]);

  const handleFollow = () => {
    if (charity) {
      setIsFollowed(!isFollowed);
      console.log(`Charity ${isFollowed ? 'unfollowed' : 'followed'}: ${charity.Charity_Legal_Name}`);
    }
  };

  const handleMatch = (charityId) => {
    console.log('Matching charity:', charityId);
  };

  const handleDonate = (charityId) => {
    console.log('Donating to charity:', charityId);
  };

  const toggleProgram = (index) => {
    setOpenPrograms(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const formatAddress = (charity) => {
    const addressParts = [
      charity['Address_Line_1'],
      charity['Address_Line_2'],
      charity['Address_Line_3'],
      charity['Town_City'],
      charity['State'],
      charity['Postcode'],
      charity['Country']
    ].filter(Boolean);
    return addressParts.join(', ');
  };

  if (isLoading) {
    return <div className={styles.card}>Loading charity details...</div>;
  }

  if (error) {
    return (
      <div className={styles.card}>
        <p className={styles.error}>{error}</p>
        {charity && (
          <div>
            <h2>Fallback Charity Information</h2>
            <p>We're showing limited information due to data access issues.</p>
            {/* Display fallback charity information */}
            <p><strong>Name:</strong> {charity.Charity_Legal_Name}</p>
            <p><strong>ABN:</strong> {charity.ABN}</p>
            {/* Add more fallback information as needed */}
          </div>
        )}
      </div>
    );
  }

  if (!charity) {
    return <div className={styles.card}>Charity not found</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{charity['Charity_Legal_Name']}</h1>
      <div className={styles.card}>
        <h2 className={styles.sectionHeader}>Charity Details</h2>
        <p className={styles.paragraph}>
          <strong>Address:</strong> {formatAddress(charity)}
        </p>
        {Object.entries(charity).map(([key, value]) => (
          value && key !== 'Charity_Legal_Name' && !key.startsWith('Address_') && (
            <p key={key} className={styles.paragraph}>
              <strong>{key.replace(/_/g, ' ')}:</strong> {value}
            </p>
          )
        ))}

        {programs.length > 0 && (
          <>
            <h2 className={styles.sectionHeader}>Programs</h2>
            {programs.map((program, index) => (
              <div key={index} className={styles.programCard}>
                <div className={styles.programHeader} onClick={() => toggleProgram(index)}>
                  <h3 className={styles.programName}>{program["Program Name"] || 'Program Name Not Available'}</h3>
                  <span className={`${styles.chevron} ${openPrograms[index] ? styles.open : ''}`}>▼</span>
                </div>
                {openPrograms[index] && (
                  <div className={styles.programDetails}>
                    {Object.entries(program).map(([key, value]) => (
                      value && key !== "Program Name" && (
                        <p key={key} className={styles.paragraph}>
                          <strong>{key}:</strong> {value}
                        </p>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        <div className={styles.buttonContainer}>
          <button onClick={handleFollow} className={styles.primaryButton}>
            {isFollowed ? 'Unfollow' : 'Follow'}
          </button>
          <button onClick={() => handleMatch(charity.ABN)} className={styles.secondaryButton}>Match</button>
          <button onClick={() => handleDonate(charity.ABN)} className={styles.primaryButton}>Donate</button>
        </div>
      </div>
    </div>
  );
}

export default CharityPartner;