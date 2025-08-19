import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './CharityDashboard.module.css';
import './SharedStyles.css';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaSearch, FaLink, FaTimes, FaClock, FaCreditCard, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import CharityOnboarding from './CharityOnboarding';
import { API_CONFIG } from '../config/api.config';

function CharityDashboard() {
  const [charityData, setCharityData] = useState(null);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Search and linking states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [linkingStatus, setLinkingStatus] = useState(null);
  const [linkedCharity, setLinkedCharity] = useState(null);
  
  // Stripe states
  const [stripeStatus, setStripeStatus] = useState(null);
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    const fetchCharityData = async () => {
      if (!user || !user.isCharity) {
        setError('You must be logged in as a charity to view this dashboard.');
        return;
      }

      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/charities/me`, {
          headers: getAuthHeaders()
        });
        setCharityData(response.data);

        // Fetch linking status
        const statusResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/charities/linking-status`, {
          headers: getAuthHeaders()
        });
        setLinkingStatus(statusResponse.data.status);

        // If there's a linked ABN, fetch the charity details
        if (statusResponse.data.linkedABN) {
          const linkedResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/search-charities`, {
            params: { q: statusResponse.data.linkedABN }
          });
          if (linkedResponse.data?.result?.records?.length > 0) {
            setLinkedCharity(linkedResponse.data.result.records[0]);
          }
        }
        
        // Store charity data first, then fetch Stripe status if approved
        if (statusResponse.data.status === 'approved' && response.data._id) {
          fetchStripeStatus(response.data._id);
        }
      } catch (err) {
        console.error('Error fetching charity data:', err);
        setError('Failed to load charity data. Please try again later.');
      }
    };

    fetchCharityData();
  }, [user, getAuthHeaders]);
  
  const fetchStripeStatus = async (charityId) => {
    try {
      const id = charityId || charityData?._id || user?.charityId;
      if (!id) {
        console.error('No charity ID available for Stripe status');
        return;
      }
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/stripe/connect/account-status/${id}`,
        { headers: getAuthHeaders() }
      );
      setStripeStatus(response.data);
    } catch (err) {
      console.error('Error fetching Stripe status:', err);
      // If error, assume no Stripe account
      setStripeStatus({ hasAccount: false });
    }
  };
  
  const handleStripeOnboardingComplete = () => {
    setShowStripeOnboarding(false);
    fetchStripeStatus(); // Refresh status
  };

  const searchCharities = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/search-charities`, {
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
  }, []);

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

      await axios.post(`${API_CONFIG.BASE_URL}/api/charities/link-request`, formData, {
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
      <div key={charity.ABN} className={styles.card}>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{charity.Charity_Legal_Name}</h3>
          <p className={styles.description}>{address}</p>
          <p className={styles.highlight}>ABN: {charity.ABN}</p>
        </div>
        <div className={styles.cardActions}>
          {isPending ? (
            <button
              className={`${styles.button} ${styles.compact}`}
              disabled
              title="Linking request pending"
            >
              <FaClock /> Pending
            </button>
          ) : (
            <button
              onClick={() => handleLinkCharity(charity)}
              className={styles.iconButton}
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
    return <div className={styles.dashboardContainer}><p className={styles.description}>{error}</p></div>;
  }

  if (!charityData) {
    return <div className={styles.dashboardContainer}><p className={styles.description}>Loading...</p></div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>Charity Dashboard</h1>
          <button onClick={handleLogout} className={styles.button}>Log Out</button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'donors' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          Donors
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'campaigns' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'settings' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        <div className={styles.card}>
        <h2 className={styles.cardTitle}>Welcome, {charityData.charityName}</h2>
        <p className={styles.description}><strong>Email:</strong> {charityData.contactEmail}</p>
        <p className={styles.description}><strong>Category:</strong> {charityData.category}</p>
      </div>

      {linkingStatus !== 'approved' && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Link Your Charity</h3>
          {linkingStatus === 'pending' && linkedCharity ? (
            <div>
              <p className={styles.description}>Your linking request is being reviewed</p>
              {renderCharityCard(linkedCharity, true)}
            </div>
          ) : linkingStatus === 'rejected' ? (
            <>
              <p className={styles.description}>Your previous linking request was not approved. Please try again with different documentation.</p>
              <p className={styles.description}>Search for your charity in the Australian Charities database to link it to your dashboard.</p>
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
                <div className={styles.description}>Searching...</div>
              )}

              {searchResults.length > 0 && (
                <div className={styles.grid}>
                  {searchResults.map(charity => renderCharityCard(charity))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className={styles.description}>Search for your charity in the Australian Charities database to link it to your dashboard.</p>
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
                <div className={styles.description}>Searching...</div>
              )}

              {searchResults.length > 0 && (
                <div className={styles.grid}>
                  {searchResults.map(charity => renderCharityCard(charity))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {linkingStatus === 'approved' && (
        <>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Public Page Status: Approved</h3>
            <button
              onClick={() => navigate(`/charity/${charityData.linkedABN}/edit`)}
              className={styles.button}
            >
              Edit Public Page
            </button>
          </div>

          {/* Stripe Payment Setup Section */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FaCreditCard className="mr-8" />
              Payment Setup
            </h3>
            
            {stripeStatus ? (
              <>
                {stripeStatus.hasAccount ? (
                  <div>
                    <div className={styles.stripeStatus}>
                      <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                          <span className={styles.label}>Account Status</span>
                          <span className={`${styles.statusBadge} ${stripeStatus.detailsSubmitted ? styles.active : styles.pending}`}>
                            {stripeStatus.detailsSubmitted ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <div className={styles.statusItem}>
                          <span className={styles.label}>Charges Enabled</span>
                          <span className={stripeStatus.chargesEnabled ? styles.statusYes : styles.statusNo}>
                            {stripeStatus.chargesEnabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className={styles.statusItem}>
                          <span className={styles.label}>Payouts Enabled</span>
                          <span className={stripeStatus.payoutsEnabled ? styles.statusYes : styles.statusNo}>
                            {stripeStatus.payoutsEnabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className={styles.statusItem}>
                          <span className={styles.label}>Verification</span>
                          <span className={stripeStatus.detailsSubmitted ? styles.statusYes : styles.statusNo}>
                            {stripeStatus.detailsSubmitted ? 'Complete' : 'Required'}
                          </span>
                        </div>
                      </div>
                      
                      {stripeStatus.chargesEnabled ? (
                        <div className={styles.successMessage}>
                          <FaCheckCircle className="mr-8" />
                          Your organization is ready to receive donations!
                        </div>
                      ) : (
                        <div className={styles.warningMessage}>
                          <FaExclamationCircle className="mr-8" />
                          Please complete your Stripe setup to receive donations.
                          <button
                            onClick={() => setShowStripeOnboarding(true)}
                            className={`${styles.button} ${styles.compact}`}
                            className="mt-10"
                          >
                            Continue Setup
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.stripeSetupPrompt}>
                    <p className={styles.description}>
                      Set up Stripe to start receiving online donations directly to your bank account.
                    </p>
                    <button
                      onClick={() => setShowStripeOnboarding(true)}
                      className={styles.button}
                      disabled={stripeLoading}
                    >
                      <FaCreditCard className="mr-8" />
                      Start Payment Setup
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.description}>Loading payment status...</div>
            )}
          </div>
        </>
      )}

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Mission Statement</h3>
        <p className={styles.description}>{charityData.missionStatement}</p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>About Us</h3>
        <p className={styles.description}>{charityData.description}</p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Donation Statistics</h3>
        <p className={styles.description}>Total Donations: ${charityData.totalDonations || '0'}</p>
        <p className={styles.description}>Number of Donors: {charityData.donorCount || '0'}</p>
        <p className={styles.description}>Average Donation: ${charityData.averageDonation || '0'}</p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Quick Actions</h3>
        <div className={styles.quickActions}>
          <button 
            onClick={() => navigate('/charity-profile-editor')}
            className={styles.button}
          >
            Edit Profile
          </button>
          <button 
            onClick={() => navigate('/charity-analytics')}
            className={styles.button}
          >
            View Analytics
          </button>
          <button 
            onClick={() => navigate('/charity-donors')}
            className={styles.button}
          >
            Donor Management
          </button>
          {charityData.linkedABN && (
            <button 
              onClick={() => navigate(`/charity/profile/${charityData.linkedABN}`)}
              className={styles.button}
            >
              View Public Profile
            </button>
          )}
        </div>
      </div>
          </>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Analytics</h2>
            <p className={styles.description}>Detailed analytics and insights coming soon.</p>
            <button 
              onClick={() => navigate('/charity-analytics')}
              className={styles.button}
            >
              Open Full Analytics
            </button>
          </div>
        )}
        
        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Donor Management</h2>
            <p className={styles.description}>Manage your donors and relationships.</p>
            <button 
              onClick={() => navigate('/charity-donors')}
              className={styles.button}
            >
              Open Donor Management
            </button>
          </div>
        )}
        
        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Fundraising Campaigns</h2>
            <p className={styles.description}>Create and manage your fundraising campaigns.</p>
            <button 
              onClick={() => navigate('/charity-campaigns')}
              className={styles.button}
            >
              Manage Campaigns
            </button>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Settings</h2>
            <p className={styles.description}>Manage your charity account settings.</p>
            <div className={styles.quickActions}>
              <button 
                onClick={() => navigate('/charity-profile-editor')}
                className={styles.button}
              >
                Edit Profile
              </button>
              <button 
                onClick={() => navigate('/charity-settings')}
                className={styles.button}
              >
                Account Settings
              </button>
            </div>
          </div>
        )}

      </div> {/* End of mainContent */}

      {showLinkModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={() => setShowLinkModal(false)} className={styles.closeButton}>
              <FaTimes />
            </button>
            <h2>Link Your Charity</h2>
            <p>Please provide evidence that you represent {selectedCharity?.Charity_Legal_Name}</p>
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={styles.fileInput}
              />
              <button
                onClick={handleSubmitEvidence}
                className={styles.button}
                disabled={!evidenceFile}
              >
                Submit Evidence
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stripe Onboarding Modal */}
      {showStripeOnboarding && (
        <div className={styles.stripeOnboardingModal}>
          <div className={styles.modalContent}>
            <button 
              onClick={() => setShowStripeOnboarding(false)} 
              className={styles.closeButton}
            >
              <FaTimes />
            </button>
            <CharityOnboarding
              charity={{
                _id: charityData._id,
                email: charityData.contactEmail,
                charityName: charityData.charityName,
                EIN: linkedCharity?.ABN
              }}
              onComplete={handleStripeOnboardingComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CharityDashboard;