import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSearch, 
  FaFilter, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaExclamationCircle,
  FaEnvelope,
  FaEye,
  FaDownload,
  FaSpinner,
  FaCreditCard,
  FaChartLine,
  FaUsers
} from 'react-icons/fa';
import styles from './AdminCharityManagement.module.css';

const AdminCharityManagement = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCharities();
  }, [filter]);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charity/admin/all-charities`,
        {
          headers: getAuthHeaders(),
          params: { status: filter !== 'all' ? filter : undefined }
        }
      );
      setCharities(response.data);
    } catch (error) {
      console.error('Error fetching charities:', error);
      setMessage({ type: 'error', text: 'Failed to load charities' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (charityId) => {
    if (!window.confirm('Are you sure you want to approve this charity?')) return;
    
    setActionLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charity/admin/link-requests/${charityId}/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      
      setMessage({ type: 'success', text: 'Charity approved successfully!' });
      fetchCharities();
      setSelectedCharity(null);
      setShowDetails(false);
    } catch (error) {
      console.error('Error approving charity:', error);
      setMessage({ type: 'error', text: 'Failed to approve charity' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (charityId) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;
    
    setActionLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charity/admin/link-requests/${charityId}/reject`,
        { reason: rejectionReason },
        { headers: getAuthHeaders() }
      );
      
      setMessage({ type: 'success', text: 'Charity rejected' });
      fetchCharities();
      setSelectedCharity(null);
      setShowDetails(false);
    } catch (error) {
      console.error('Error rejecting charity:', error);
      setMessage({ type: 'error', text: 'Failed to reject charity' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendEmail = async (charityId, type) => {
    setActionLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charity/admin/send-email/${charityId}`,
        { emailType: type },
        { headers: getAuthHeaders() }
      );
      
      setMessage({ type: 'success', text: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage({ type: 'error', text: 'Failed to send email' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: FaClock, className: styles.pending, text: 'Pending Review' },
      approved: { icon: FaCheckCircle, className: styles.approved, text: 'Approved' },
      rejected: { icon: FaTimesCircle, className: styles.rejected, text: 'Rejected' },
      active: { icon: FaCheckCircle, className: styles.active, text: 'Active' },
      suspended: { icon: FaExclamationCircle, className: styles.suspended, text: 'Suspended' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`${styles.statusBadge} ${badge.className}`}>
        <Icon /> {badge.text}
      </span>
    );
  };

  const filteredCharities = charities.filter(charity =>
    charity.charityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charity.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (charity.linkedABN && charity.linkedABN.includes(searchTerm))
  );

  const renderCharityDetails = () => {
    if (!selectedCharity) return null;

    return (
      <div className={styles.detailsModal}>
        <div className={styles.modalContent}>
          <button
            onClick={() => {
              setShowDetails(false);
              setSelectedCharity(null);
            }}
            className={styles.closeButton}
          >
            ×
          </button>
          
          <h2>Charity Details</h2>
          
          <div className={styles.detailsGrid}>
            <div className={styles.detailSection}>
              <h3>Basic Information</h3>
              <p><strong>Name:</strong> {selectedCharity.charityName}</p>
              <p><strong>Email:</strong> {selectedCharity.contactEmail}</p>
              <p><strong>Category:</strong> {selectedCharity.category}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedCharity.linkingStatus || 'pending')}</p>
              <p><strong>Registration Date:</strong> {new Date(selectedCharity.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className={styles.detailSection}>
              <h3>Verification</h3>
              {selectedCharity.linkedABN ? (
                <>
                  <p><strong>ABN:</strong> {selectedCharity.linkedABN}</p>
                  <p><strong>Linking Status:</strong> {selectedCharity.linkingStatus}</p>
                  {selectedCharity.linkingEvidence && (
                    <button
                      onClick={() => window.open(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}${selectedCharity.linkingEvidence}`, '_blank')}
                      className={styles.iconButton}
                    >
                      <FaDownload /> View Evidence
                    </button>
                  )}
                </>
              ) : (
                <p>No ABN linked yet</p>
              )}
            </div>
            
            <div className={styles.detailSection}>
              <h3>Payment Setup</h3>
              {selectedCharity.stripeAccountId ? (
                <>
                  <p><strong>Stripe Account:</strong> Connected</p>
                  <p><strong>Charges Enabled:</strong> {selectedCharity.stripeChargesEnabled ? 'Yes' : 'No'}</p>
                  <p><strong>Payouts Enabled:</strong> {selectedCharity.stripePayoutsEnabled ? 'Yes' : 'No'}</p>
                </>
              ) : (
                <p>Stripe not connected</p>
              )}
            </div>
            
            <div className={styles.detailSection}>
              <h3>Impact & Activity</h3>
              <p><strong>Total Donations:</strong> ${selectedCharity.totalDonations || 0}</p>
              <p><strong>Donor Count:</strong> {selectedCharity.donorCount || 0}</p>
              <p><strong>Last Activity:</strong> {selectedCharity.lastActivity ? new Date(selectedCharity.lastActivity).toLocaleDateString() : 'Never'}</p>
            </div>
            
            <div className={styles.detailSection}>
              <h3>Description</h3>
              <p>{selectedCharity.description || 'No description provided'}</p>
              
              <h3>Mission Statement</h3>
              <p>{selectedCharity.missionStatement || 'No mission statement provided'}</p>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            {selectedCharity.linkingStatus === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(selectedCharity._id)}
                  className={`${styles.button} ${styles.approveButton}`}
                  disabled={actionLoading}
                >
                  {actionLoading ? <FaSpinner className={styles.spinner} /> : <FaCheckCircle />}
                  Approve Charity
                </button>
                <button
                  onClick={() => handleReject(selectedCharity._id)}
                  className={`${styles.button} ${styles.rejectButton}`}
                  disabled={actionLoading}
                >
                  {actionLoading ? <FaSpinner className={styles.spinner} /> : <FaTimesCircle />}
                  Reject Application
                </button>
              </>
            )}
            
            <button
              onClick={() => handleSendEmail(selectedCharity._id, 'status-update')}
              className={`${styles.button} ${styles.emailButton}`}
              disabled={actionLoading}
            >
              {actionLoading ? <FaSpinner className={styles.spinner} /> : <FaEnvelope />}
              Send Status Email
            </button>
            
            <button
              onClick={() => navigate(`/admin/charity/${selectedCharity._id}/edit`)}
              className={`${styles.button} ${styles.editButton}`}
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Charity Management</h1>
        <button
          onClick={() => navigate('/admin-dashboard')}
          className={styles.backButton}
        >
          Back to Admin Dashboard
        </button>
      </div>
      
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, or ABN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterButtons}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          >
            All Charities
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          >
            <FaClock /> Pending Review
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`${styles.filterButton} ${filter === 'approved' ? styles.active : ''}`}
          >
            <FaCheckCircle /> Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`${styles.filterButton} ${filter === 'rejected' ? styles.active : ''}`}
          >
            <FaTimesCircle /> Rejected
          </button>
        </div>
      </div>
      
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3><FaUsers /> Total Charities</h3>
          <p>{charities.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaClock /> Pending Review</h3>
          <p>{charities.filter(c => c.linkingStatus === 'pending').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaCheckCircle /> Approved</h3>
          <p>{charities.filter(c => c.linkingStatus === 'approved').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaCreditCard /> Active with Stripe</h3>
          <p>{charities.filter(c => c.stripeChargesEnabled).length}</p>
        </div>
      </div>
      
      {loading ? (
        <div className={styles.loading}>
          <FaSpinner className={styles.spinner} />
          <p>Loading charities...</p>
        </div>
      ) : (
        <div className={styles.charityList}>
          {filteredCharities.map(charity => (
            <div key={charity._id} className={styles.charityCard}>
              <div className={styles.charityInfo}>
                <h3>{charity.charityName}</h3>
                <p>{charity.contactEmail}</p>
                <div className={styles.charityMeta}>
                  {getStatusBadge(charity.linkingStatus || 'pending')}
                  {charity.linkedABN && (
                    <span className={styles.abnBadge}>ABN: {charity.linkedABN}</span>
                  )}
                  {charity.stripeAccountId && (
                    <span className={styles.stripeBadge}>
                      <FaCreditCard /> Stripe Connected
                    </span>
                  )}
                </div>
                <div className={styles.charityStats}>
                  <span><FaChartLine /> ${charity.totalDonations || 0} raised</span>
                  <span><FaUsers /> {charity.donorCount || 0} donors</span>
                </div>
              </div>
              
              <div className={styles.charityActions}>
                <button
                  onClick={() => {
                    setSelectedCharity(charity);
                    setShowDetails(true);
                  }}
                  className={styles.viewButton}
                >
                  <FaEye /> View Details
                </button>
              </div>
            </div>
          ))}
          
          {filteredCharities.length === 0 && (
            <div className={styles.noResults}>
              <p>No charities found matching your criteria</p>
            </div>
          )}
        </div>
      )}
      
      {showDetails && renderCharityDetails()}
    </div>
  );
};

export default AdminCharityManagement;