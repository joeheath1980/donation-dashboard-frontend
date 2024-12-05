import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaLink, FaTimes, FaClock, FaPlus } from 'react-icons/fa';
import styles from '../CharityDashboard.module.css';
import cleanStyles from './CleanDesign.module.css';
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
        const response = await axios.get(`${API_URL}/api/charities/me`, {
          headers: getAuthHeaders()
        });
        setCharityData(response.data);

        // Fetch linking status
        const statusResponse = await axios.get(`${API_URL}/api/charities/linking-status`, {
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
    formData.append('linkingRequestDate', new Date().toISOString());

    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      };
      delete headers['Content-Type']; // Let axios set the correct boundary

      await axios.post(`${API_URL}/api/charities/link-request`, formData, {
        headers: headers
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
      <div key={charity.ABN} className={cleanStyles.card}>
        <div className={cleanStyles.cardContent}>
          <h3 className={cleanStyles.cardTitle}>{charity.Charity_Legal_Name}</h3>
          <p className={cleanStyles.description}>{address}</p>
          <p className={cleanStyles.highlight}>ABN: {charity.ABN}</p>
        </div>
        <div className={cleanStyles.cardActions}>
          {isPending ? (
            <button
              className={`${cleanStyles.button} ${cleanStyles.compact}`}
              disabled
              title="Linking request pending"
            >
              <FaClock /> Pending
            </button>
          ) : (
            <button
              onClick={() => handleLinkCharity(charity)}
              className={cleanStyles.iconButton}
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
    return <div className={cleanStyles.container}><p className={cleanStyles.description}>{error}</p></div>;
  }

  if (!charityData) {
    return <div className={cleanStyles.container}><p className={cleanStyles.description}>Loading...</p></div>;
  }

  return (
    <div className={cleanStyles.container}>
      <header className={`${cleanStyles.flexBetween} ${cleanStyles.mb-10}`}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={cleanStyles.gradientTitle}>Charity Dashboard</h1>
        <button onClick={handleLogout} className={cleanStyles.button}>Log Out</button>
      </header>
      
      <div className={cleanStyles.card}>
        <h2 className={cleanStyles.title}>Welcome, {charityData.charityName}</h2>
        <p className={cleanStyles.description}><strong>Email:</strong> {charityData.contactEmail}</p>
        <p className={cleanStyles.description}><strong>Category:</strong> {charityData.category}</p>
      </div>

      <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
        <h3 className={cleanStyles.title}>Link Your Charity</h3>
        {linkingStatus === 'pending' && linkedCharity ? (
          <div>
            <p className={cleanStyles.description}>Your linking request is being reviewed</p>
            {renderCharityCard(linkedCharity, true)}
          </div>
        ) : !charityData.linkedABN && (
          <>
            <p className={cleanStyles.description}>Search for your charity in the Australian Charities database to link it to your dashboard.</p>
            <div className={cleanStyles.flexBetween}>
              <div className={`${styles.searchInputWrapper} ${cleanStyles.mt-10}`}>
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
                <div className={cleanStyles.description}>Searching...</div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className={`${cleanStyles.grid} ${cleanStyles.mt-10}`}>
                {searchResults.map(charity => renderCharityCard(charity))}
              </div>
            )}
          </>
        )}
      </div>

      {linkingStatus === 'approved' && (
        <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
          <h3 className={cleanStyles.title}>Public Page Status: Approved</h3>
          <button 
            onClick={() => navigate(`/charity/${charityData.linkedABN}/edit`)}
            className={cleanStyles.button}
          >
            Edit Public Page
          </button>
        </div>
      )}
      
      <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
        <h3 className={cleanStyles.title}>Mission Statement</h3>
        <p className={cleanStyles.description}>{charityData.missionStatement}</p>
      </div>
      
      <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
        <h3 className={cleanStyles.title}>About Us</h3>
        <p className={cleanStyles.description}>{charityData.description}</p>
      </div>
      
      <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
        <h3 className={cleanStyles.title}>Donation Statistics</h3>
        <p className={cleanStyles.description}>Total Donations: $X,XXX</p>
        <p className={cleanStyles.description}>Number of Donors: XXX</p>
      </div>
      
      <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
        <h3 className={cleanStyles.title}>Current Campaigns</h3>
        <ul className={cleanStyles.description}>
          <li>Campaign 1</li>
          <li>Campaign 2</li>
        </ul>
      </div>
      
      <div className={`${cleanStyles.card} ${cleanStyles.mt-10}`}>
        <div className={cleanStyles.textCenter}>
          <button className={`${cleanStyles.button}`} style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '15px 30px', fontSize: '18px' }}>
            <FaPlus style={{ marginRight: '8px' }} /> Create New Campaign
          </button>
        </div>
      </div>

      {showLinkModal && (
        <div className={styles.modal}>
          <div className={cleanStyles.card}>
            <button onClick={() => setShowLinkModal(false)} className={cleanStyles.iconButton}>
              <FaTimes />
            </button>
            <h2 className={cleanStyles.title}>Link Your Charity</h2>
            <p className={cleanStyles.description}>Please provide evidence that you represent {selectedCharity?.Charity_Legal_Name}</p>
            <div className={`${cleanStyles.flexColumn} ${cleanStyles.mt-10}`}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={styles.fileInput}
              />
              <button
                onClick={handleSubmitEvidence}
                className={`${cleanStyles.button} ${cleanStyles.mt-10}`}
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