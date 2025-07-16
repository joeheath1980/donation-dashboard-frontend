import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CharitySearch from './CharitySearch';
import CharityOnboarding from './CharityOnboarding';
import '../styles/CharityDashboard.css';

const CharityDashboard = () => {
  const navigate = useNavigate();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [linkingEvidence, setLinkingEvidence] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);

  useEffect(() => {
    fetchCharityDetails();
    checkStripeStatus();
  }, []);

  const fetchCharityDetails = async () => {
    const token = localStorage.getItem('charityToken');
    if (!token) {
      navigate('/charity-login');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/charities/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCharity(data);
        setLoading(false);
      } else {
        localStorage.removeItem('charityToken');
        navigate('/charity-login');
      }
    } catch (error) {
      console.error('Error fetching charity details:', error);
      setLoading(false);
    }
  };

  const checkStripeStatus = async () => {
    const token = localStorage.getItem('charityToken');
    if (!token) return;

    try {
      const charityData = await fetch(`${process.env.REACT_APP_API_URL}/api/charities/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stripe/connect/account-status/${charityData._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const status = await response.json();
        setStripeStatus(status);
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('charityToken');
    navigate('/charity-login');
  };

  const handleSelectCharity = async (selectedCharity) => {
    const token = localStorage.getItem('charityToken');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/charities/link-charity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          abn: selectedCharity.Charity_Legal_Name.ABN
        })
      });

      if (response.ok) {
        const updatedCharity = await response.json();
        setCharity(updatedCharity);
        setShowSearch(false);
      }
    } catch (error) {
      console.error('Error linking charity:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLinkingEvidence(file);
    setUploadStatus('Ready to upload');
  };

  const submitLinkingEvidence = async () => {
    if (!linkingEvidence) {
      setUploadStatus('Please select a file');
      return;
    }

    const token = localStorage.getItem('charityToken');
    const formData = new FormData();
    formData.append('evidence', linkingEvidence);

    try {
      setUploadStatus('Uploading...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/charities/upload-evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setUploadStatus('Evidence uploaded successfully! Awaiting approval.');
        await fetchCharityDetails();
      } else {
        setUploadStatus('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  const handleEditPublicPage = () => {
    navigate('/charity-public-edit');
  };

  const renderPaymentSetupSection = () => {
    if (!charity) return null;

    // If charity is not approved for linking, don't show Stripe setup
    if (charity.linkingStatus !== 'approved') {
      return (
        <div className="dashboard-section">
          <h2>💳 Payment Setup</h2>
          <div className="info-message">
            <p>Complete charity verification first to enable payment processing.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-section">
        <h2>💳 Payment Setup</h2>
        
        {!stripeStatus?.hasAccount ? (
          <div className="stripe-setup-prompt">
            <p>Set up Stripe to receive donations directly into your bank account.</p>
            <button 
              onClick={() => setShowStripeOnboarding(true)}
              className="btn btn-primary"
            >
              Start Payment Setup
            </button>
          </div>
        ) : (
          <div className="stripe-status">
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Account Status:</span>
                <span className={`status-badge ${stripeStatus.status}`}>
                  {stripeStatus.status}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Can Receive Payments:</span>
                <span className={stripeStatus.chargesEnabled ? 'status-yes' : 'status-no'}>
                  {stripeStatus.chargesEnabled ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>

            {stripeStatus.status === 'active' && stripeStatus.chargesEnabled ? (
              <div className="success-message">
                <p>✅ Your payment processing is active! You can now receive donations.</p>
              </div>
            ) : (
              <div className="warning-message">
                <p>⚠️ Complete your Stripe setup to start receiving donations.</p>
                <button 
                  onClick={() => setShowStripeOnboarding(true)}
                  className="btn btn-primary"
                >
                  Continue Setup
                </button>
              </div>
            )}
          </div>
        )}

        {showStripeOnboarding && (
          <div className="stripe-onboarding-modal">
            <div className="modal-content">
              <button 
                className="close-button"
                onClick={() => {
                  setShowStripeOnboarding(false);
                  checkStripeStatus(); // Refresh status
                }}
              >
                ×
              </button>
              <CharityOnboarding 
                charityId={charity._id}
                onComplete={() => {
                  setShowStripeOnboarding(false);
                  checkStripeStatus();
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="charity-dashboard">
      <div className="dashboard-header">
        <h1>Charity Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-section">
        <h2>Charity Information</h2>
        <div className="charity-info">
          <p><strong>Name:</strong> {charity?.charityName}</p>
          <p><strong>Email:</strong> {charity?.contactEmail}</p>
          <p><strong>Category:</strong> {charity?.category}</p>
          <p><strong>Mission:</strong> {charity?.missionStatement}</p>
          <p><strong>Tax ID:</strong> {charity?.taxId}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Australian Charity Linking</h2>
        {charity?.linkingStatus === 'none' && (
          <div>
            <p>Link your charity to its Australian charity database entry to enable your public page.</p>
            <button onClick={() => setShowSearch(!showSearch)} className="btn btn-primary">
              Search for Your Charity
            </button>
            {showSearch && (
              <CharitySearch onSelectCharity={handleSelectCharity} />
            )}
          </div>
        )}
        
        {charity?.linkingStatus === 'pending' && (
          <div className="pending-status">
            <p>Your charity has been linked to ABN: {charity.pendingABN}</p>
            <p>Please upload evidence to verify ownership:</p>
            <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
            <button onClick={submitLinkingEvidence} className="btn btn-primary">
              Submit Evidence
            </button>
          </div>
        )}
        
        {charity?.linkingStatus === 'approved' && (
          <div className="approved-status">
            <p>✅ Your charity is verified and linked to ABN: {charity.linkedABN}</p>
            <button onClick={handleEditPublicPage} className="btn btn-primary">
              Edit Public Page
            </button>
          </div>
        )}
        
        {charity?.linkingStatus === 'rejected' && (
          <div className="rejected-status">
            <p>❌ Your linking request was rejected. Please try again with valid evidence.</p>
            <button onClick={() => setShowSearch(true)} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Add Payment Setup Section */}
      {renderPaymentSetupSection()}

      <div className="dashboard-section">
        <h2>Donation Statistics</h2>
        <p>Total Donations: $0</p>
        <p>Number of Donors: 0</p>
      </div>

      <div className="dashboard-section">
        <h2>Campaigns</h2>
        <p>No campaigns yet.</p>
        <button className="btn btn-primary">Create Campaign</button>
      </div>
    </div>
  );
};

export default CharityDashboard;