import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CharityPartner.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

function CharityPartner() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      ].filter(Boolean).join(', ');
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
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <strong>ABN:</strong>
              <span>{charity.ABN || 'N/A'}</span>
            </div>
            {charity.ACN && (
              <div className={styles.detailItem}>
                <strong>ACN:</strong>
                <span>{charity.ACN}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <strong>Registration Date:</strong>
              <span>{formatDate(charity.Registration_Date)}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Date Established:</strong>
              <span>{formatDate(charity.Date_Organisation_Established)}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Status:</strong>
              <span className={charity.Registration_Status === 'Registered' ? styles.statusActive : ''}>
                {charity.Registration_Status || 'N/A'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <strong>Type:</strong>
              <span>{charity.Charity_Type || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Size:</strong>
              <span>{charity.Charity_Size || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Legal Structure:</strong>
              <span>{charity.Legal_Structure || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Responsible Persons:</strong>
              <span>{charity.Number_of_Responsible_Persons || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Financial Year End:</strong>
              <span>{charity.Financial_Year_End || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>Contact Information</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <strong>Address Type:</strong>
              <span>{charity.Address_Type || 'N/A'}</span>
            </div>
            <div className={styles.contactItem}>
              <strong>Address:</strong>
              <span>{formatAddress(charity)}</span>
            </div>
            {charity.Website && (
              <div className={styles.contactItem}>
                <strong>Website:</strong>
                <a
                  href={charity.Website.startsWith('http') ? charity.Website : `https://${charity.Website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {charity.Website}
                </a>
              </div>
            )}
            {charity.Email && (
              <div className={styles.contactItem}>
                <strong>Email:</strong>
                <a href={`mailto:${charity.Email}`} className={styles.link}>
                  {charity.Email}
                </a>
              </div>
            )}
            {charity.Phone && (
              <div className={styles.contactItem}>
                <strong>Phone:</strong>
                <a href={`tel:${charity.Phone}`} className={styles.link}>
                  {charity.Phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Charitable Purposes */}
        {charity.purposes && charity.purposes.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionHeader}>Our Purposes</h2>
            <div className={styles.purposesGrid}>
              {charity.purposes.map((purpose, index) => (
                <div key={index} className={styles.purposeCard}>
                  <div className={styles.purposeIcon}>
                    {purpose.includes('Health') ? '🏥' :
                     purpose.includes('Education') ? '🎓' :
                     purpose.includes('Social') ? '🤝' :
                     purpose.includes('Religion') ? '⛪' :
                     purpose.includes('Culture') ? '🎨' :
                     purpose.includes('Environment') ? '🌱' :
                     purpose.includes('Animal') ? '🐾' :
                     purpose.includes('Human Rights') ? '⚖️' :
                     purpose.includes('Research') ? '🔬' : '❤️'}
                  </div>
                  <div className={styles.purposeText}>{purpose}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Activities */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>What We Do</h2>
          <div className={styles.activitiesSection}>
            <div className={styles.mainActivity}>
              <strong>Primary Activity:</strong> {charity.Main_Activity || 'N/A'}
            </div>
            {charity.activities && charity.activities.length > 0 && (
              <div className={styles.activitiesList}>
                <strong>All Activities:</strong>
                <ul>
                  {charity.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Operating Locations */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>Where We Operate</h2>
          <div className={styles.locationsGrid}>
            <div className={styles.locationItem}>
              <strong>States & Territories:</strong>
              <div className={styles.statesList}>
                {formatOperatingLocations(charity).split(', ').map((state, index) => (
                  <span key={index} className={styles.stateTag}>{state}</span>
                ))}
              </div>
            </div>
            {charity.Operating_Countries && (
              <div className={styles.locationItem}>
                <strong>Countries:</strong>
                <span>{charity.Operating_Countries}</span>
              </div>
            )}
            {charity.PBI === 'Y' && (
              <div className={styles.pbiIndicator}>
                <span className={styles.pbiBadge}>Public Benevolent Institution (PBI)</span>
              </div>
            )}
            {charity.HPC === 'Y' && (
              <div className={styles.hpcIndicator}>
                <span className={styles.hpcBadge}>Health Promotion Charity</span>
              </div>
            )}
          </div>
        </div>

        {/* Beneficiaries & Conditions */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>Who We Help</h2>
          <div className={styles.beneficiariesSection}>
            {formatBeneficiaries(charity).length > 0 && (
              <div className={styles.beneficiariesGroup}>
                <h3>Target Groups</h3>
                <div className={styles.beneficiariesGrid}>
                  {formatBeneficiaries(charity).map((beneficiary, index) => (
                    <div key={index} className={styles.beneficiaryTag}>
                      {beneficiary}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {charity.beneficiaryDetails && charity.beneficiaryDetails.conditions && charity.beneficiaryDetails.conditions.length > 0 && (
              <div className={styles.conditionsGroup}>
                <h3>Conditions We Address</h3>
                <div className={styles.conditionsGrid}>
                  {charity.beneficiaryDetails.conditions.map((condition, index) => (
                    <div key={index} className={styles.conditionTag}>
                      {condition}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {charity.Other_Beneficiaries && (
              <div className={styles.otherBeneficiaries}>
                <strong>Other Groups:</strong> {charity.Other_Beneficiaries}
              </div>
            )}
          </div>
        </div>

        {/* Financial Information */}
        {(charity.Last_AIS_Fin_Year || charity.Total_Expenses_AIS || charity.Total_Revenue_AIS || charity.Donated_funds || charity.Government_grants) && (
          <div className={styles.card}>
            <h2 className={styles.sectionHeader}>Financial Overview</h2>
            <div className={styles.financialGrid}>
              {charity.Last_AIS_Fin_Year && (
                <div className={styles.financialItem}>
                  <strong>Latest Financial Year:</strong>
                  <span>{charity.Last_AIS_Fin_Year}</span>
                </div>
              )}
              {charity.Total_Revenue_AIS && (
                <div className={styles.financialItem}>
                  <strong>Total Revenue:</strong>
                  <span>${parseInt(charity.Total_Revenue_AIS).toLocaleString()}</span>
                </div>
              )}
              {charity.Total_Expenses_AIS && (
                <div className={styles.financialItem}>
                  <strong>Total Expenses:</strong>
                  <span>${parseInt(charity.Total_Expenses_AIS).toLocaleString()}</span>
                </div>
              )}
              {charity.Donated_funds && (
                <div className={styles.financialItem}>
                  <strong>Donations Received:</strong>
                  <span>${parseInt(charity.Donated_funds).toLocaleString()}</span>
                </div>
              )}
              {charity.Government_grants && (
                <div className={styles.financialItem}>
                  <strong>Government Grants:</strong>
                  <span>${parseInt(charity.Government_grants).toLocaleString()}</span>
                </div>
              )}
              {charity.Staff_FTE && (
                <div className={styles.financialItem}>
                  <strong>Staff (FTE):</strong>
                  <span>{charity.Staff_FTE}</span>
                </div>
              )}
              {charity.Staff_Volunteers && (
                <div className={styles.financialItem}>
                  <strong>Volunteers:</strong>
                  <span>{charity.Staff_Volunteers}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Programs */}
        {programs.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionHeader}>Our Programs</h2>
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
            onClick={() => navigate(`/donate/${charity._id || charity.ABN}`)}
          >
            Donate with Stripe
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharityPartner;