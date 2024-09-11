import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../CharityPartner.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

const CHARITY_RESOURCE_ID = 'eb1e6be4-5b13-4feb-b28e-388bf7c26f93';
const PROGRAMS_RESOURCE_ID = 'f284bce5-80d3-4ca9-b72b-0f7126495fd1';
const API_BASE_URL = 'https://data.gov.au/data/api/3/action/datastore_search';

function CharityPartner() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { addFollowedCharity, removeFollowedCharity } = useContext(ImpactContext);
  const [isFollowed, setIsFollowed] = useState(false);

  const fetchCharityDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          resource_id: CHARITY_RESOURCE_ID,
          q: id
        }
      });

      console.log('Charity API Response:', response.data);

      if (response.data && response.data.success && response.data.result && response.data.result.records && response.data.result.records.length > 0) {
        const charityData = response.data.result.records[0];
        setCharity(charityData);

        // Fetch programs data
        try {
          console.log('Fetching programs for ABN:', charityData.ABN);
          const programsResponse = await axios.get(API_BASE_URL, {
            params: {
              resource_id: PROGRAMS_RESOURCE_ID,
              q: charityData.ABN
            }
          });

          console.log('Programs API Response:', programsResponse.data);

          if (programsResponse.data && programsResponse.data.success && programsResponse.data.result && programsResponse.data.result.records) {
            const fetchedPrograms = programsResponse.data.result.records;
            console.log('Fetched programs:', fetchedPrograms);
            // You can process or store the programs data here if needed
          } else {
            console.warn('Unexpected programs data structure:', programsResponse.data);
          }
        } catch (programError) {
          console.error('Error fetching programs:', programError);
        }
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setError('Charity not found or API returned unexpected data');
      }
    } catch (err) {
      console.error('Error fetching charity details:', err);
      setError('Failed to fetch charity details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCharityDetails();
  }, [fetchCharityDetails]);

  const handleFollow = () => {
    if (charity) {
      if (isFollowed) {
        removeFollowedCharity(charity.ABN);
      } else {
        addFollowedCharity({
          ABN: charity.ABN,
          name: charity.Charity_Legal_Name,
          logo: charity.logo // Assuming there's a logo field, adjust if necessary
        });
      }
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
    return <div className={styles.card}>{error}</div>;
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
          value && key !== 'Charity_Legal_Name' && !key.startsWith('Address_') && key !== 'Programs' && (
            <p key={key} className={styles.paragraph}>
              <strong>{key.replace(/_/g, ' ')}:</strong> {value}
            </p>
          )
        ))}

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