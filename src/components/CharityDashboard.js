import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaLink, FaTimes, FaClock } from 'react-icons/fa';
import styles from '../CharityDashboard.module.css';
import logo from '../assets/logo.png';

function CharityDashboard() {
  const [charityData, setCharityData] = useState(null);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders, API_URL, logout } = useAuth();
  const navigate = useNavigate();

  // Search and linking states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [linkingStatus, setLinkingStatus] = useState(null);
  const [linkedCharity, setLinkedCharity] = useState(null);

  useEffect(() => {
    const fetchCharityData = async () => {
      if (!user || !user.isCharity) {
        setError('You must be logged in as a charity to view this dashboard.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/charity/me`, {
          headers: getAuthHeaders()
        });
        setCharityData(response.data);

        // Fetch linking status
        const statusResponse = await axios.get(`${API_URL}/api/charity/linking-status`, {
          headers: getAuthHeaders()
        });
        setLinkingStatus(statusResponse.data.status);
        
        // If there's a linked ABN, fetch the charity details
        if (statusResponse.data.linkedABN) {
          const linkedResponse = await axios.get(`${API_URL}/api/search-charities`, {
            params: { q: statusResponse.data.linkedABN }
          });
          if (linkedResponse.data?.result?.records?.length > 0) {
            setLinkedCharity(linkedResponse.data.result.records[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching charity data:', err);
        setError('Failed to load charity data. Please try again later.');
      }
    };

    fetchCharityData();
  }, [user, getAuthHeaders, API_URL]);

  const searchCharities = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${API_URL}/api/search-charities`, {
        params: { q: term }
      });
      
      if (response.data?.result?.records) {
        setSearchResults(response.data.result.records);
      }
    } catch (err) {
      console.error('Error searching charities:', err);
      setError('Failed to search charities. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm) {
        searchCharities(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, searchCharities]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkCharity = (charity) => {
    setSelectedCharity(charity);
    setShowLinkModal(true);
  };

  const handleFileChange = (event) => {
    setEvidenceFile(event.target.files[0]);
  };

  const handleSubmitEvidence = async () => {
    if (!evidenceFile || !selectedCharity) return;

    const formData = new FormData();
    formData.append('evidence', evidenceFile);
    formData.append('charityABN', selectedCharity.ABN);

    try {
      await axios.post(`${API_URL}/api/charity/link-request`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      setLinkingStatus('pending');
      setLinkedCharity(selectedCharity);
      setShowLinkModal(false);
      setSelectedCharity(null);
      setEvidenceFile(null);
      setSearchTerm('');
      setSearchResults([]);
    } catch (err) {
      console.error('Error submitting evidence:', err);
      setError('Failed to submit evidence. Please try again.');
    }
  };

  const renderCharityCard = (charity, isPending = false) => {
    const address = [
      charity.Town_City,
      charity.State,
      charity.Postcode
    ].filter(Boolean).join(', ');

    return (
      <div key={charity.ABN} className={styles.charityCard}>
        <div className={styles.charityInfo}>
          <h3>{charity.Charity_Legal_Name}</h3>
          <p className={styles.charityAddress}>{address}</p>
          <p className={styles.charityAbn}>ABN: {charity.ABN}</p>
        </div>
        <div className={styles.charityActions}>
          {isPending ? (
            <button
              className={`${styles.linkButton} ${styles.pending}`}
              disabled
              title="Linking request pending"
            >
              <FaClock /> Pending
            </button>
          ) : (
            <button
              onClick={() => handleLinkCharity(charity)}
              className={styles.linkButton}
              title="Link this charity"
            >
              <FaLink />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!charityData) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1>Charity Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Log Out</button>
      </header>
      
      <div className={styles.charityInfo}>
        <h2>Welcome, {charityData.charityName}</h2>
        <p><strong>Email:</strong> {charityData.contactEmail}</p>
        <p><strong>Category:</strong> {charityData.category}</p>
      </div>

      <div className={styles.searchSection}>
        <h3>Link Your Charity</h3>
        {linkingStatus === 'pending' && linkedCharity ? (
          <div className={styles.pendingLinkContainer}>
            <p>Your linking request is being reviewed</p>
            {renderCharityCard(linkedCharity, true)}
          </div>
        ) : !charityData.linkedABN && (
          <>
            <p>Search for your charity in the Australian Charities database to link it to your dashboard.</p>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for your charity..."
                  className={styles.searchInput}
                />
              </div>
              {isSearching && (
                <div className={styles.searchingMessage}>Searching...</div>
              )}
            </div>

            <div className={styles.resultsContainer}>
              {searchResults.length > 0 && (
                <div className={styles.charityGrid}>
                  {searchResults.map(charity => renderCharityCard(charity))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {linkingStatus === 'approved' && (
        <div className={`${styles.linkingStatus} ${styles.approved}`}>
          <h3>Public Page Status: Approved</h3>
          <button 
            onClick={() => navigate(`/charity/${charityData.linkedABN}/edit`)}
            className={styles.editPublicPageButton}
          >
            Edit Public Page
          </button>
        </div>
      )}
      
      <div className={styles.missionStatement}>
        <h3>Mission Statement</h3>
        <p>{charityData.missionStatement}</p>
      </div>
      
      <div className={styles.description}>
        <h3>About Us</h3>
        <p>{charityData.description}</p>
      </div>
      
      <div className={styles.donationStats}>
        <h3>Donation Statistics</h3>
        <p>Total Donations: $X,XXX</p>
        <p>Number of Donors: XXX</p>
      </div>
      
      <div className={styles.campaigns}>
        <h3>Current Campaigns</h3>
        <ul>
          <li>Campaign 1</li>
          <li>Campaign 2</li>
        </ul>
      </div>
      
      <button className={styles.createCampaign}>Create New Campaign</button>

      {showLinkModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={() => setShowLinkModal(false)} className={styles.closeModal}>
              <FaTimes />
            </button>
            <h2>Link Your Charity</h2>
            <p>Please provide evidence that you represent {selectedCharity?.Charity_Legal_Name}</p>
            <div className={styles.uploadSection}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={styles.fileInput}
              />
              <button
                onClick={handleSubmitEvidence}
                className={styles.submitButton}
                disabled={!evidenceFile}
              >
                Submit Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharityDashboard;