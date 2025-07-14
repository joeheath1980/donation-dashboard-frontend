import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ForwardingStatus.module.css';

const ForwardingStatus = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchForwardedEmails();
  }, [page]);

  const fetchForwardedEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/email/forward-status`, {
        params: {
          limit: ITEMS_PER_PAGE,
          skip: (page - 1) * ITEMS_PER_PAGE
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setEmails(response.data.emails);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
      setLoading(false);
    } catch (err) {
      setError('Failed to load forwarded emails');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      processed: { label: 'Processed', className: styles.statusSuccess },
      failed: { label: 'Failed', className: styles.statusError },
      pending: { label: 'Pending', className: styles.statusPending }
    };

    const config = statusConfig[status] || { label: status, className: styles.statusDefault };
    
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (email) => {
    setSelectedEmail(email);
    setDetailsOpen(true);
  };

  const handleApproveDonation = async (emailId) => {
    try {
      // TODO: Implement approval endpoint
      alert('Donation approval feature coming soon!');
      // await axios.post(`${API_URL}/api/donations/approve/${emailId}`, {}, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // fetchForwardedEmails();
    } catch (err) {
      console.error('Failed to approve donation:', err);
    }
  };

  if (loading && emails.length === 0) {
    return <div className={styles.loading}>Loading forwarded emails...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Forwarded Email Status</h2>
        <button
          className={styles.refreshButton}
          onClick={fetchForwardedEmails}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {emails.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No forwarded emails yet</h3>
          <p>Forward donation receipts to your unique email address to see them here</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Parsed Data</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email._id}>
                    <td>{formatDate(email.createdAt)}</td>
                    <td>{email.from}</td>
                    <td>{email.subject || '(No subject)'}</td>
                    <td>{getStatusBadge(email.status)}</td>
                    <td>
                      {email.status === 'processed' && email.parsed ? (
                        <div className={styles.parsedData}>
                          <strong>{email.parsed.charityName}</strong>
                          <br />
                          <small>{email.parsed.amount} {email.parsed.currency}</small>
                        </div>
                      ) : (
                        <span className={styles.noData}>
                          {email.status === 'pending' ? 'Processing...' : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => handleViewDetails(email)}
                        title="View details"
                      >
                        👁️
                      </button>
                      {email.status === 'processed' && !email.donationId && (
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApproveDonation(email._id)}
                          title="Approve donation"
                        >
                          ✅
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={styles.pageButton}
            >
              ← Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={styles.pageButton}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Email Details Modal */}
      {detailsOpen && selectedEmail && (
        <div className={styles.modal} onClick={() => setDetailsOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Email Details</h3>
              <button
                className={styles.closeButton}
                onClick={() => setDetailsOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <label>From:</label>
                <span>{selectedEmail.from}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Subject:</label>
                <span>{selectedEmail.subject || '(No subject)'}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Received:</label>
                <span>{formatDate(selectedEmail.createdAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Status:</label>
                {getStatusBadge(selectedEmail.status)}
              </div>
              
              {selectedEmail.parsed && (
                <div className={styles.parsedSection}>
                  <h4>Parsed Information</h4>
                  <div className={styles.parsedGrid}>
                    <div>
                      <label>Charity:</label>
                      <span>{selectedEmail.parsed.charityName}</span>
                    </div>
                    <div>
                      <label>Amount:</label>
                      <span>{selectedEmail.parsed.amount} {selectedEmail.parsed.currency}</span>
                    </div>
                    <div>
                      <label>Date:</label>
                      <span>{selectedEmail.parsed.date}</span>
                    </div>
                    {selectedEmail.parsed.confidence && (
                      <div>
                        <label>Confidence:</label>
                        <span>{(selectedEmail.parsed.confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedEmail.error && (
                <div className={styles.errorBox}>
                  <strong>Error:</strong> {selectedEmail.error}
                </div>
              )}

              {selectedEmail.donationId && (
                <div className={styles.successBox}>
                  ✅ Donation created successfully
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.closeModalButton}
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </button>
              {selectedEmail.status === 'processed' && !selectedEmail.donationId && (
                <button
                  className={styles.createDonationButton}
                  onClick={() => {
                    handleApproveDonation(selectedEmail._id);
                    setDetailsOpen(false);
                  }}
                >
                  Create Donation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForwardingStatus;