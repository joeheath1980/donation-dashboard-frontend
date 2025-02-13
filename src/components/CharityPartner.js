import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './CharityPartner.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

function CharityPartner() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { addFollowedCharity, removeFollowedCharity, followedCharities } = useContext(ImpactContext);
  const [isFollowed, setIsFollowed] = useState(false);

  const fetchCharityDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`[CharityPartner] Fetching charity details for ID: ${id}`);
      const response = await api.get(`/api/charities/${id}`);

      console.log('[CharityPartner] API Response:', response.data);

      if (response.data?.charity) {
        console.log('[CharityPartner] Setting charity data:', response.data.charity);
        setCharity(response.data.charity);
        setPrograms(response.data.programs || []);
      } else {
        console.error('[CharityPartner] No charity data in response');
        setError('Charity not found. Please check the ID and try again.');
      }
    } catch (err) {
      console.error('[CharityPartner] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });

      if (err.response?.status === 404) {
        setError('Charity not found. Please check the ID and try again.');
      } else if (err.response?.status === 500) {
        const errorMessage = err.response.data?.error || 'An internal server error occurred.';
        setError(`Server error: ${errorMessage}. Please try again later.`);
      } else if (!navigator.onLine) {
        setError('Network connection lost. Please check your internet connection and try again.');
      } else {
        setError(`Failed to fetch charity details: ${err.message || 'Unknown error occurred'}. Please try again later.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log('[CharityPartner] Component mounted, fetching details');
    fetchCharityDetails();
  }, [fetchCharityDetails]);

  useEffect(() => {
    if (charity) {
      console.log('[CharityPartner] Checking follow status for charity:', charity.ABN);
      const isCurrentlyFollowed = followedCharities.some(c => c.ABN === charity.ABN);
      setIsFollowed(isCurrentlyFollowed);
    }
  }, [charity, followedCharities]);

  const handleFollow = () => {
    if (charity) {
      console.log(`[CharityPartner] ${isFollowed ? 'Unfollowing' : 'Following'} charity:`, charity.ABN);
      if (isFollowed) {
        removeFollowedCharity(charity.ABN);
      } else {
        addFollowedCharity({
          ABN: charity.ABN,
          name: charity.Charity_Legal_Name,
          logo: charity.logo
        });
      }
      setIsFollowed(!isFollowed);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (err) {
      console.error('[CharityPartner] Error formatting date:', dateString, err);
      return 'N/A';
    }
  };

  const formatAddress = (charity) => {
    if (!charity) return 'N/A';
    try {
      const addressParts = [
        charity['Address_Line_1'],
        charity['Address_Line_2'],
        charity['Address_Line_3'],
        charity['Town_City'],
        charity['State'],
        charity['Postcode'],
        charity['Country']
      ].filter(Boolean);
      return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
    } catch (err) {
      console.error('[CharityPartner] Error formatting address:', err);
      return 'N/A';
    }
  };

  const formatOperatingLocations = (charity) => {
    if (!charity) return 'N/A';
    const locations = [];
    if (charity.Operates_in_ACT === 'Y') locations.push('ACT');
    if (charity.Operates_in_NSW === 'Y') locations.push('NSW');
    if (charity.Operates_in_NT === 'Y') locations.push('NT');
    if (charity.Operates_in_QLD === 'Y') locations.push('QLD');
    if (charity.Operates_in_SA === 'Y') locations.push('SA');
    if (charity.Operates_in_TAS === 'Y') locations.push('TAS');
    if (charity.Operates_in_VIC === 'Y') locations.push('VIC');
    if (charity.Operates_in_WA === 'Y') locations.push('WA');
    return locations.length > 0 ? locations.join(', ') : 'N/A';
  };

  const formatBeneficiaries = (charity) => {
    if (!charity) return [];
    const beneficiaries = [];
    if (charity.Aboriginal_or_TSI === 'Y') beneficiaries.push('Aboriginal or Torres Strait Islander');
    if (charity.Adults === 'Y') beneficiaries.push('Adults');
    if (charity.Aged_Persons === 'Y') beneficiaries.push('Aged Persons');
    if (charity.Children === 'Y') beneficiaries.push('Children');
    if (charity.Early_Childhood === 'Y') beneficiaries.push('Early Childhood');
    if (charity.Families === 'Y') beneficiaries.push('Families');
    if (charity.Youth === 'Y') beneficiaries.push('Youth');
    if (charity.Females === 'Y') beneficiaries.push('Females');
    if (charity.Males === 'Y') beneficiaries.push('Males');
    if (charity.Financially_Disadvantaged === 'Y') beneficiaries.push('Financially Disadvantaged');
    if (charity.Migrants_Refugees_or_Asylum_Seekers === 'Y') beneficiaries.push('Migrants, Refugees or Asylum Seekers');
    if (charity.People_at_risk_of_homelessness === 'Y') beneficiaries.push('People at Risk of Homelessness');
    if (charity.People_with_Disabilities === 'Y') beneficiaries.push('People with Disabilities');
    if (charity.Rural_Regional_Remote_Communities === 'Y') beneficiaries.push('Rural, Regional and Remote Communities');
    if (charity.Veterans_or_their_families === 'Y') beneficiaries.push('Veterans or their Families');
    if (charity.Victims_of_Disasters === 'Y') beneficiaries.push('Victims of Disasters');
    return beneficiaries;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading charity details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            onClick={fetchCharityDetails} 
            className={styles.primaryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Not Found</h2>
          <p>Charity information could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header Section */}
        <div className={styles.cardHeader}>
          <h1 className={styles.header}>{charity.Charity_Legal_Name}</h1>
          <div className={styles.buttonContainer}>
            <button 
              onClick={handleFollow} 
              className={isFollowed ? styles.secondaryButton : styles.primaryButton}
            >
              {isFollowed ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Registration Details */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>Registration Details</h2>
          <p className={styles.paragraph}>
            <strong>ABN:</strong> {charity.ABN || 'N/A'}
          </p>
          <p className={styles.paragraph}>
            <strong>Registration Date:</strong> {formatDate(charity.Registration_Date)}
          </p>
          <p className={styles.paragraph}>
            <strong>Date Established:</strong> {formatDate(charity.Date_Organisation_Established)}
          </p>
          <p className={styles.paragraph}>
            <strong>Status:</strong> {charity.Registration_Status || 'N/A'}
          </p>
          <p className={styles.paragraph}>
            <strong>Type:</strong> {charity.Charity_Type || 'N/A'}
          </p>
          <p className={styles.paragraph}>
            <strong>Size:</strong> {charity.Charity_Size || 'N/A'}
          </p>
          <p className={styles.paragraph}>
            <strong>Number of Responsible Persons:</strong> {charity.Number_of_Responsible_Persons || 'N/A'}
          </p>
          <p className={styles.paragraph}>
            <strong>Financial Year End:</strong> {charity.Financial_Year_End || 'N/A'}
          </p>
        </div>

        {/* Contact Information */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>Contact Information</h2>
          <p className={styles.paragraph}>
            <strong>Address Type:</strong> {charity.Address_Type || 'N/A'}
          </p>
          <p className={styles.paragraph}>
            <strong>Address:</strong> {formatAddress(charity)}
          </p>
          {charity.Website && (
            <p className={styles.paragraph}>
              <strong>Website:</strong>{' '}
              <a 
                href={charity.Website.startsWith('http') ? charity.Website : `https://${charity.Website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.link}
              >
                Visit Website
              </a>
            </p>
          )}
        </div>

        {/* Operating Locations */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>Operating Locations</h2>
          <p className={styles.paragraph}>
            <strong>States and Territories:</strong> {formatOperatingLocations(charity)}
          </p>
          {charity.Operating_Countries && (
            <p className={styles.paragraph}>
              <strong>Operating Countries:</strong> {charity.Operating_Countries}
            </p>
          )}
        </div>

        {/* Beneficiaries */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>Who We Help</h2>
          <div className={styles.beneficiariesGrid}>
            {formatBeneficiaries(charity).map((beneficiary, index) => (
              <div key={index} className={styles.beneficiaryTag}>
                {beneficiary}
              </div>
            ))}
          </div>
        </div>

        {/* Programs */}
        {programs.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionHeader}>Programs</h2>
            <div className={styles.programsGrid}>
              {programs.map((program, index) => (
                <div key={index} className={styles.programCard}>
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                  {program.impact && (
                    <div className={styles.impactMetrics}>
                      <h4>Impact</h4>
                      <p>{program.impact}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.buttonContainer}>
          <button 
            className={styles.secondaryButton}
            onClick={() => console.log('Match clicked')}
          >
            Match
          </button>
          <button 
            className={styles.primaryButton}
            onClick={() => console.log('Donate clicked')}
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharityPartner;