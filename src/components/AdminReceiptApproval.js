import React, { useState, useEffect } from 'react';
import apiServices from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminReceiptApproval.module.css';
import sharedStyles from './AdminSharedStyles.module.css';
import { getStatusColorClass, getTierColorClass, getColorClass } from '../utils/dynamicStyles';

const AdminReceiptApproval = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    approvalRate: 0,
    averageConfidence: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [charityOverride, setCharityOverride] = useState('');
  const [amountAdjustment, setAmountAdjustment] = useState('');

  const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchPendingApprovals();
    fetchStats();
  }, [page, sortBy]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const api = apiServices.client;
      const response = await api.get(`/api/admin/receipt-approval/pending`, { params: { page, limit: 20, sortBy } });
      setPendingApprovals(response.data.approvals);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const api = apiServices.client;
      const response = await api.get(`/api/admin/receipt-approval/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchApprovalDetails = async (jobId) => {
    try {
      const api = apiServices.client;
      const response = await api.get(`/api/admin/receipt-approval/pending/${jobId}`);
      setSelectedApproval(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching approval details:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      const adjustments = {};
      if (amountAdjustment) {
        adjustments.amount = parseFloat(amountAdjustment);
      }

      const api = apiServices.client;
      await api.post(`/api/admin/receipt-approval/approve/${selectedApproval.id}`,
        { charityId: charityOverride || selectedApproval.validation?.matchedCharity?._id, adjustments }
      );

      alert('Receipt approved successfully');
      setShowDetailModal(false);
      fetchPendingApprovals();
      fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error approving receipt:', error);
      alert('Failed to approve receipt');
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const api = apiServices.client;
      await api.post(`/api/admin/receipt-approval/reject/${selectedApproval.id}`, { reason: rejectionReason, notifyUser: true });

      alert('Receipt rejected');
      setShowDetailModal(false);
      fetchPendingApprovals();
      fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      alert('Failed to reject receipt');
    }
  };

  const resetForm = () => {
    setSelectedApproval(null);
    setApprovalAction('');
    setRejectionReason('');
    setCharityOverride('');
    setAmountAdjustment('');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#f44336';
  };

  return (
    <div className={sharedStyles.managementContainer}>
      <h2 className={sharedStyles.managementTitle}>Receipt Approval Management</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <p className={styles.statNumber}>{stats.pending}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Processing</h3>
          <p className={styles.statNumber}>{stats.processing}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Completed</h3>
          <p className={styles.statNumber}>{stats.completed}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Approval Rate</h3>
          <p className={styles.statNumber}>{stats.approvalRate.toFixed(1)}%</p>
        </div>
        <div className={styles.statCard}>
          <h3>Avg Confidence</h3>
          <p className={styles.statNumber}>{stats.averageConfidence.toFixed(2)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className={sharedStyles.controls}>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className={sharedStyles.filterSelect}
        >
          <option value="createdAt">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      {/* Pending Approvals Table */}
      {loading ? (
        <div className={sharedStyles.loading}>Loading pending approvals...</div>
      ) : (
        <>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Charity</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((approval) => (
                <tr key={approval.id}>
                  <td>{approval.user?.name || 'Unknown'}</td>
                  <td>{approval.parsedData?.charityName || 'Not identified'}</td>
                  <td>${approval.parsedData?.amount?.toFixed(2) || '0.00'}</td>
                  <td>{new Date(approval.parsedData?.date || approval.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusColorClass(approval.parsedData?.confidence?.overall || 0)}>
                      {((approval.parsedData?.confidence?.overall || 0) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    <span className={`${sharedStyles.statusBadge} ${sharedStyles.pending}`}>
                      Pending Review
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => fetchApprovalDetails(approval.id)}
                      className={sharedStyles.editButton}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={sharedStyles.button}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={sharedStyles.button}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApproval && (
        <div className={sharedStyles.modal}>
          <div className={sharedStyles.modalContent}>
            <h3>Receipt Approval Details</h3>
            
            <div className={styles.detailGrid}>
              <div className={styles.detailSection}>
                <h4>User Information</h4>
                <p><strong>Name:</strong> {selectedApproval.user?.name}</p>
                <p><strong>Email:</strong> {selectedApproval.user?.email}</p>
                <p><strong>Tier:</strong> {selectedApproval.user?.tier || 'Not set'}</p>
              </div>

              <div className={styles.detailSection}>
                <h4>Parsed Receipt Data</h4>
                <p><strong>Charity:</strong> {selectedApproval.parsedData?.charityName}</p>
                <p><strong>Amount:</strong> ${selectedApproval.parsedData?.amount?.toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(selectedApproval.parsedData?.date).toLocaleDateString()}</p>
                <p><strong>Receipt Number:</strong> {selectedApproval.parsedData?.receiptNumber || 'N/A'}</p>
              </div>

              <div className={styles.detailSection}>
                <h4>Confidence Scores</h4>
                <p><strong>Overall:</strong> {((selectedApproval.parsedData?.confidence?.overall || 0) * 100).toFixed(0)}%</p>
                <p><strong>Charity Match:</strong> {((selectedApproval.validation?.confidence || 0) * 100).toFixed(0)}%</p>
              </div>

              <div className={styles.detailSection}>
                <h4>Email Metadata</h4>
                <p><strong>Subject:</strong> {selectedApproval.emailMetadata?.subject}</p>
                <p><strong>From:</strong> {selectedApproval.emailMetadata?.from}</p>
                <p><strong>Date:</strong> {new Date(selectedApproval.emailMetadata?.date).toLocaleString()}</p>
              </div>
            </div>

            {/* Recent Donations */}
            {selectedApproval.recentDonations && selectedApproval.recentDonations.length > 0 && (
              <div className={styles.recentDonations}>
                <h4>Recent Donations by User</h4>
                <table className={styles.miniTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Charity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedApproval.recentDonations.map((donation) => (
                      <tr key={donation.id}>
                        <td>{new Date(donation.date).toLocaleDateString()}</td>
                        <td>${donation.amount.toFixed(2)}</td>
                        <td>{donation.charity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Approval Actions */}
            <div className={styles.approvalActions}>
              <h4>Approval Decision</h4>
              
              <div className={styles.actionChoice}>
                <label>
                  <input
                    type="radio"
                    name="action"
                    value="approve"
                    checked={approvalAction === 'approve'}
                    onChange={(e) => setApprovalAction(e.target.value)}
                  />
                  Approve
                </label>
                <label>
                  <input
                    type="radio"
                    name="action"
                    value="reject"
                    checked={approvalAction === 'reject'}
                    onChange={(e) => setApprovalAction(e.target.value)}
                  />
                  Reject
                </label>
              </div>

              {approvalAction === 'approve' && (
                <div className={styles.approvalOptions}>
                  <div className={sharedStyles.formGroup}>
                    <label>Amount Adjustment (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={selectedApproval.parsedData?.amount?.toFixed(2)}
                      value={amountAdjustment}
                      onChange={(e) => setAmountAdjustment(e.target.value)}
                      className={sharedStyles.input}
                    />
                  </div>
                  <div className={sharedStyles.formGroup}>
                    <label>Override Charity (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter charity ID to override"
                      value={charityOverride}
                      onChange={(e) => setCharityOverride(e.target.value)}
                      className={sharedStyles.input}
                    />
                  </div>
                </div>
              )}

              {approvalAction === 'reject' && (
                <div className={sharedStyles.formGroup}>
                  <label>Rejection Reason</label>
                  <textarea
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className={sharedStyles.textarea}
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className={sharedStyles.modalButtons}>
              <button onClick={() => { setShowDetailModal(false); resetForm(); }} className={sharedStyles.cancelButton}>
                Cancel
              </button>
              {approvalAction === 'approve' && (
                <button onClick={handleApprove} className={sharedStyles.saveButton}>
                  Approve Receipt
                </button>
              )}
              {approvalAction === 'reject' && (
                <button onClick={handleReject} className={sharedStyles.deleteButton}>
                  Reject Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReceiptApproval;
