import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../CharityPartner.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

// Mock data generator function
const generateMockCharity = (id) => ({
  Charity_Legal_Name: `Mock Charity ${id}`,
  ABN: `${id}0000000000`.slice(-11),
  Charity_Type: ["Public Benevolent Institution", "Religious Institution", "Health Promotion Charity"][id % 3],
  Address_Line_1: `${id} Mock Street`,
  Town_City: "Mocktown",
  State: "MT",
  Postcode: `${id}000`.slice(-4),
  Country: "Australia",
  Website: `https://mockcharity${id}.org`,
  Phone: `0${id}00000000`.slice(-10),
  Email: `contact@mockcharity${id}.org`,
  Description: `Mock Charity ${id} is dedicated to making a positive impact in our community. We focus on various causes including education, health, and environmental conservation.`,
  Established_Date: `${2000 + (id % 21)}-01-01`,
  Programs: [
    {
      Program_Name: `Program A of Charity ${id}`,
      Description: "This program focuses on providing educational resources to underprivileged children.",
      Annual_Budget: `$${(id * 10000).toLocaleString()}`,
    },
    {
      Program_Name: `Program B of Charity ${id}`,
      Description: "This program aims to improve community health through free medical camps and awareness programs.",
      Annual_Budget: `$${(id * 15000).toLocaleString()}`,
    },
  ]
});

function CharityPartner() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPrograms, setOpenPrograms] = useState({});
  const [useMockData, setUseMockData] = useState(false);
  
  const { followedCharities, addFollowedCharity, removeFollowedCharity } = useContext(ImpactContext);
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

      console.log('API Response:', response); // Log the entire response for debugging

      if (response.data && response.data.success && response.data.result && response.data.result.records && response.data.result.records.length > 0) {
        const charityData = response.data.result.records[0];
        setCharity(charityData);

        // Check if the charity is already followed
        setIsFollowed(followedCharities.some(c => c.ABN === charityData.ABN));

        // Fetch programs data
        try {
          const programsResponse = await axios.get(`https://data.gov.au/data/api/3/action/datastore_search`, {
            params: {
              resource_id: 'f284bce5-80d3-4ca9-b72b-0f7126495fd1',
              q: charityData.ABN
            }
          });

          if (programsResponse.data && programsResponse.data.success && programsResponse.data.result && programsResponse.data.result.records) {
            setPrograms(programsResponse.data.result.records);
          } else {
            console.warn('Unexpected programs data structure:', programsResponse.data);
            setPrograms([]);
          }
        } catch (programError) {
          console.error('Error fetching programs:', programError);
          setPrograms([]);
        }
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setError('Charity not found or API returned unexpected data');
        const mockCharity = generateMockCharity(parseInt(id));
        setCharity(mockCharity);
        setPrograms(mockCharity.Programs);
        setUseMockData(true);
      }
    } catch (err) {
      console.error('Error fetching charity details:', err);
      setError('Failed to fetch charity details. Using mock data.');
      const mockCharity = generateMockCharity(parseInt(id));
      setCharity(mockCharity);
      setPrograms(mockCharity.Programs);
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, followedCharities]);

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
    return <div className={styles.card}>{error}</div>;
  }

  if (!charity) {
    return <div className={styles.card}>Charity not found</div>;
  }

  return (
    <div className={styles.container}>
      {useMockData && (
        <div className={styles.mockDataNotice}>
          Note: Displaying mock data due to API unavailability or unexpected data structure.
        </div>
      )}
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

        {programs && programs.length > 0 && (
          <>
            <h2 className={styles.sectionHeader}>Programs</h2>
            {programs.map((program, index) => (
              <div key={index} className={styles.programCard}>
                <div className={styles.programHeader} onClick={() => toggleProgram(index)}>
                  <h3 className={styles.programName}>{program["Program_Name"] || program["Program Name"] || 'Program Name Not Available'}</h3>
                  <span className={`${styles.chevron} ${openPrograms[index] ? styles.open : ''}`}>▼</span>
                </div>
                {openPrograms[index] && (
                  <div className={styles.programDetails}>
                    {Object.entries(program).map(([key, value]) => (
                      value && key !== "Program_Name" && key !== "Program Name" && (
                        <p key={key} className={styles.paragraph}>
                          <strong>{key.replace(/_/g, ' ')}:</strong> {value}
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