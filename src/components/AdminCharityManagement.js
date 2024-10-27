import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaCheck, FaTimes, FaFileDownload } from 'react-icons/fa';
import styles from './AdminCharityManagement.module.css';

const AdminCharityManagement = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders, API_URL } = useAuth();

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/charity/admin/link-requests`, {
        headers: getAuthHeaders()
      });
      setPendingRequests(response.data);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeaders]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleApprove = async (requestId) => {
    try {
      await axios.post(`${API_URL}/api/charity/admin/link-requests/${requestId}/approve`, {}, {
        headers: getAuthHeaders()
      });
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(`${API_URL}/api/charity/admin/link-requests/${requestId}/reject`, {}, {
        headers: getAuthHeaders()
      });
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    }
  };

  const handleDownloadEvidence = async (evidencePath) => {
    try {
      // Create a direct download link
      const downloadUrl = `${API_URL}/${evidencePath}`;
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank'; // Open in new tab
      link.rel = 'noopener noreferrer'; // Security best practice
      
      // Trigger click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading evidence:', err);
      setError('Failed to download evidence');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading pending requests...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Charity Link Requests</h2>
      {pendingRequests.length === 0 ? (
        <p className={styles.noRequests}>No pending requests</p>
      ) : (
        <div className={styles.requestsGrid}>
          {pendingRequests.map((request) => (
            <div key={request._id} className={styles.requestCard}>
              <div className={styles.requestInfo}>
                <h3>{request.charityName}</h3>
                <p><strong>Email:</strong> {request.contactEmail}</p>
                <p><strong>ABN to Link:</strong> {request.linkedABN}</p>
                <p><strong>Requested:</strong> {new Date(request.linkingRequestDate).toLocaleDateString()}</p>
              </div>
              <div className={styles.evidence}>
                <button
                  onClick={() => handleDownloadEvidence(request.linkingEvidence)}
                  className={styles.downloadButton}
                >
                  <FaFileDownload /> View Evidence
                </button>
              </div>
              <div className={styles.actions}>
                <button
                  onClick={() => handleApprove(request._id)}
                  className={`${styles.actionButton} ${styles.approve}`}
                  title="Approve Request"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className={`${styles.actionButton} ${styles.reject}`}
                  title="Reject Request"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCharityManagement;