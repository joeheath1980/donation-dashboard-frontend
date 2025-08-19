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
  FaUsers,
  FaLink,
  FaHome
} from 'react-icons/fa';
import styles from './AdminCharityManagement.module.css';
import sharedStyles from './AdminSharedStyles.module.css';
import { API_CONFIG } from '../config/api.config';

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
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchCharities();
  }, [filter]);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/admin/charities`,
        {
          headers: getAuthHeaders(),
          params: { status: filter !== 'all' ? filter : undefined }
        }
      );
      setCharities(response.data);
    } catch (error) {
      console.error('Error fetching charities:', error);
      setMessage({ type: 'error', text: 'Failed to fetch charities' });
    } finally {
      setLoading(false);
    }
  };

  const approveCharity = async (charityId) => {
    try {
      setActionLoading(true);
      await axios.post(
        `${API_CONFIG.BASE_URL}/api/admin/charities/${charityId}/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      setMessage({ type: 'success', text: 'Charity approved successfully!' });
      fetchCharities();
      setShowDetails(false);
    } catch (error) {
      console.error('Error approving charity:', error);
      setMessage({ type: 'error', text: 'Failed to approve charity' });
    } finally {
      setActionLoading(false);
    }
  };

  const rejectCharity = async (charityId) => {
    if (!rejectReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a rejection reason' });
      return;
    }

    try {
      setActionLoading(true);
      await axios.post(
        `${API_CONFIG.BASE_URL}/api/admin/charities/${charityId}/reject`,
        { reason: rejectReason },
        { headers: getAuthHeaders() }
      );
      setMessage({ type: 'success', text: 'Charity rejected' });
      fetchCharities();
      setShowDetails(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting charity:', error);
      setMessage({ type: 'error', text: 'Failed to reject charity' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      none: { class: styles.badgeDefault, text: 'Not Linked', icon: <FaExclamationCircle /> },
      pending: { class: styles.badgeWarning, text: 'Pending Review', icon: <FaClock /> },
      approved: { class: styles.badgeSuccess, text: 'Approved', icon: <FaCheckCircle /> },
      rejected: { class: styles.badgeDanger, text: 'Rejected', icon: <FaTimesCircle /> }
    };
    const badge = badges[status] || badges.none;
    return (
      <span className={`${styles.statusBadge} ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const getCharityTypeInfo = (charity) => {
    if (charity.linkedABN) {
      return {
        type: 'ACNC Linked',
        icon: <FaCheckCircle />,
        class: styles.typeAcncLinked,
        description: 'Verified ACNC charity'
      };
    } else if (charity.ABN || charity.pendingABN) {
      return {
        type: 'Has ABN',
        icon: <FaLink />,
        class: styles.typeHasAbn,
        description: 'Has ABN but not linked'
      };
    } else {
      return {
        type: 'Platform Only',
        icon: <FaHome />,
        class: styles.typePlatform,
        description: 'Registered on platform only'
      };
    }
  };

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.charityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charity.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charity.ABN?.includes(searchTerm) ||
                         charity.linkedABN?.includes(searchTerm);
    return matchesSearch;
  });

  const pendingCount = charities.filter(c => c.linkingStatus === 'pending').length;

  return (
    <div className={sharedStyles.adminSection}>
      <div className={sharedStyles.sectionHeader}>
        <h2>Charity Management</h2>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search charities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`${sharedStyles.alert} ${sharedStyles[`alert${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]}`}>
          {message.text}
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className={sharedStyles.alertClose}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Charities
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Approval
          {pendingCount > 0 && (
            <span className={styles.countBadge}>{pendingCount}</span>
          )}
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'approved' ? styles.active : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'rejected' ? styles.active : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      <div className={styles.charityLegend}>
        <h3>Charity Types:</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={`${styles.typeIcon} ${styles.typeAcncLinked}`}>
              <FaCheckCircle />
            </span>
            <span>ACNC Linked - Verified Australian charity linked to ACNC database</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.typeIcon} ${styles.typeHasAbn}`}>
              <FaLink />
            </span>
            <span>Has ABN - Has Australian Business Number but not yet linked to ACNC</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.typeIcon} ${styles.typePlatform}`}>
              <FaHome />
            </span>
            <span>Platform Only - Registered on Do-Nation platform without ABN</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={sharedStyles.loadingContainer}>
          <FaSpinner className={sharedStyles.spinner} />
          <p>Loading charities...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={sharedStyles.dataTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Charity Name</th>
                <th>Contact Email</th>
                <th>ABN/Tax ID</th>
                <th>Category</th>
                <th>Status</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharities.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.emptyState}>
                    No charities found
                  </td>
                </tr>
              ) : (
                filteredCharities.map((charity) => {
                  const typeInfo = getCharityTypeInfo(charity);
                  return (
                    <tr key={charity._id} className={styles.charityRow}>
                      <td>
                        <div className={`${styles.typeIndicator} ${typeInfo.class}`} title={typeInfo.description}>
                          <span className={styles.typeIcon}>{typeInfo.icon}</span>
                          <span className={styles.typeLabel}>{typeInfo.type}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.charityName}>
                          <strong>{charity.charityName}</strong>
                          {charity.verified && (
                            <FaCheckCircle className={styles.verifiedBadge} title="Verified" />
                          )}
                        </div>
                      </td>
                      <td>{charity.contactEmail}</td>
                      <td>
                        <div className={styles.abnInfo}>
                          {charity.linkedABN && (
                            <div>
                              <span className={styles.label}>Linked:</span> {charity.linkedABN}
                            </div>
                          )}
                          {charity.pendingABN && charity.linkingStatus === 'pending' && (
                            <div>
                              <span className={styles.label}>Pending:</span> {charity.pendingABN}
                            </div>
                          )}
                          {charity.taxId && (
                            <div>
                              <span className={styles.label}>Tax ID:</span> {charity.taxId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{charity.category}</td>
                      <td>{getStatusBadge(charity.linkingStatus)}</td>
                      <td>{new Date(charity.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={`${sharedStyles.btnSmall} ${sharedStyles.btnSecondary}`}
                            onClick={() => {
                              setSelectedCharity(charity);
                              setShowDetails(true);
                            }}
                          >
                            <FaEye /> View
                          </button>
                          {charity.linkingStatus === 'pending' && (
                            <>
                              <button 
                                className={`${sharedStyles.btnSmall} ${sharedStyles.btnSuccess}`}
                                onClick={() => approveCharity(charity._id)}
                              >
                                <FaCheckCircle /> Approve
                              </button>
                              <button 
                                className={`${sharedStyles.btnSmall} ${sharedStyles.btnDanger}`}
                                onClick={() => {
                                  setSelectedCharity(charity);
                                  setShowDetails(true);
                                }}
                              >
                                <FaTimesCircle /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetails && selectedCharity && (
        <div className={sharedStyles.modal} onClick={() => setShowDetails(false)}>
          <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={sharedStyles.modalHeader}>
              <h3>Charity Details</h3>
              <button 
                className={sharedStyles.modalClose}
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className={sharedStyles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailSection}>
                  <h4>Basic Information</h4>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Name:</span>
                    <span className={styles.detailValue}>{selectedCharity.charityName}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{selectedCharity.contactEmail}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Category:</span>
                    <span className={styles.detailValue}>{selectedCharity.category}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Tax ID:</span>
                    <span className={styles.detailValue}>{selectedCharity.taxId || 'N/A'}</span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>ACNC Linking</h4>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    {getStatusBadge(selectedCharity.linkingStatus)}
                  </div>
                  {selectedCharity.pendingABN && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Requested ABN:</span>
                      <span className={styles.detailValue}>{selectedCharity.pendingABN}</span>
                    </div>
                  )}
                  {selectedCharity.linkedABN && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Linked ABN:</span>
                      <span className={styles.detailValue}>{selectedCharity.linkedABN}</span>
                    </div>
                  )}
                  {selectedCharity.evidenceFile && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Evidence:</span>
                      <a 
                        href={`${API_CONFIG.BASE_URL}/uploads/${selectedCharity.evidenceFile}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.evidenceLink}
                      >
                        View Evidence File
                      </a>
                    </div>
                  )}
                </div>

                <div className={`${styles.detailSection} ${styles.fullWidth}`}>
                  <h4>Mission Statement</h4>
                  <p className={styles.missionText}>
                    {selectedCharity.missionStatement || 'No mission statement provided'}
                  </p>
                </div>

                <div className={`${styles.detailSection} ${styles.fullWidth}`}>
                  <h4>Description</h4>
                  <p className={styles.descriptionText}>
                    {selectedCharity.description || 'No description provided'}
                  </p>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <FaUsers className={styles.statIcon} />
                    <div>
                      <div className={styles.statValue}>{selectedCharity.donorCount || 0}</div>
                      <div className={styles.statLabel}>Donors</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <FaCreditCard className={styles.statIcon} />
                    <div>
                      <div className={styles.statValue}>
                        ${(selectedCharity.totalDonations || 0).toLocaleString()}
                      </div>
                      <div className={styles.statLabel}>Total Donations</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <FaChartLine className={styles.statIcon} />
                    <div>
                      <div className={styles.statValue}>
                        ${(selectedCharity.averageDonation || 0).toFixed(2)}
                      </div>
                      <div className={styles.statLabel}>Average Donation</div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCharity.linkingStatus === 'pending' && (
                <div className={styles.approvalSection}>
                  <h4>Take Action</h4>
                  <div className={styles.approvalActions}>
                    <button 
                      className={`${sharedStyles.btnLarge} ${sharedStyles.btnSuccess}`}
                      onClick={() => approveCharity(selectedCharity._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <FaSpinner className={sharedStyles.spinner} /> : <FaCheckCircle />}
                      Approve ACNC Linking
                    </button>
                    <div className={styles.rejectSection}>
                      <textarea
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows="3"
                        className={styles.rejectTextarea}
                      />
                      <button 
                        className={`${sharedStyles.btnLarge} ${sharedStyles.btnDanger}`}
                        onClick={() => rejectCharity(selectedCharity._id)}
                        disabled={actionLoading || !rejectReason.trim()}
                      >
                        {actionLoading ? <FaSpinner className={sharedStyles.spinner} /> : <FaTimesCircle />}
                        Reject with Reason
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedCharity.linkingStatus === 'rejected' && selectedCharity.rejectionReason && (
                <div className={styles.rejectionInfo}>
                  <h4>Rejection Information</h4>
                  <p><strong>Reason:</strong> {selectedCharity.rejectionReason}</p>
                  <p><strong>Rejected on:</strong> {new Date(selectedCharity.rejectedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCharityManagement;