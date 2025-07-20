import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEdit,
  FaRobot,
  FaSearch,
  FaFilter,
  FaFileAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import styles from './ReceiptDashboard.module.css';
import api from '../../services/api.service';
import { format } from 'date-fns';

const ReceiptDashboard = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, processed, failed
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processed: 0,
    failed: 0
  });

  useEffect(() => {
    fetchReceipts();
    const interval = setInterval(fetchReceipts, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts/processing-queue');
      setReceipts(response.data.receipts || []);
      setStats(response.data.stats || {
        total: 0,
        pending: 0,
        processed: 0,
        failed: 0
      });
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: <FaClock />, class: styles.pending, text: 'Pending' },
      processing: { icon: <FaRobot />, class: styles.processing, text: 'Processing' },
      processed: { icon: <FaCheckCircle />, class: styles.processed, text: 'Processed' },
      failed: { icon: <FaTimesCircle />, class: styles.failed, text: 'Failed' },
      review: { icon: <FaExclamationTriangle />, class: styles.review, text: 'Needs Review' }
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`${styles.statusBadge} ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const handleApprove = async (receiptId) => {
    try {
      await api.post(`/receipts/${receiptId}/approve`, {
        corrections: editingReceipt?.corrections || {}
      });
      await fetchReceipts();
      setEditingReceipt(null);
    } catch (error) {
      console.error('Error approving receipt:', error);
      alert('Failed to approve receipt');
    }
  };

  const handleReject = async (receiptId) => {
    if (!window.confirm('Are you sure you want to reject this receipt?')) return;
    
    try {
      await api.post(`/receipts/${receiptId}/reject`);
      await fetchReceipts();
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      alert('Failed to reject receipt');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedReceipts.length === 0) {
      alert('Please select receipts first');
      return;
    }

    try {
      await api.post('/receipts/bulk-action', {
        action,
        receiptIds: selectedReceipts
      });
      setSelectedReceipts([]);
      await fetchReceipts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesFilter = filter === 'all' || receipt.status === filter;
    const matchesSearch = searchTerm === '' || 
      receipt.charityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.senderEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleReceiptSelection = (receiptId) => {
    setSelectedReceipts(prev =>
      prev.includes(receiptId)
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const startEditing = (receipt) => {
    setEditingReceipt({
      ...receipt,
      corrections: {
        amount: receipt.parsedData?.amount || '',
        charityName: receipt.parsedData?.charityName || '',
        date: receipt.parsedData?.date || ''
      }
    });
  };

  const updateCorrection = (field, value) => {
    setEditingReceipt(prev => ({
      ...prev,
      corrections: {
        ...prev.corrections,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <FaRobot className={styles.loadingIcon} />
        <p>Loading receipt processing queue...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Receipt Processing Dashboard</h2>
        <p className={styles.subtitle}>
          Review and manage incoming donation receipts
        </p>
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Receipts</div>
        </div>
        <div className={`${styles.statCard} ${styles.pendingStat}`}>
          <div className={styles.statValue}>{stats.pending}</div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={`${styles.statCard} ${styles.processedStat}`}>
          <div className={styles.statValue}>{stats.processed}</div>
          <div className={styles.statLabel}>Processed</div>
        </div>
        <div className={`${styles.statCard} ${styles.failedStat}`}>
          <div className={styles.statValue}>{stats.failed}</div>
          <div className={styles.statLabel}>Failed</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by charity or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            <FaFilter /> All
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            <FaClock /> Pending
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'processed' ? styles.active : ''}`}
            onClick={() => setFilter('processed')}
          >
            <FaCheckCircle /> Processed
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'failed' ? styles.active : ''}`}
            onClick={() => setFilter('failed')}
          >
            <FaTimesCircle /> Failed
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReceipts.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedReceipts.length} selected</span>
          <button
            className={styles.bulkApprove}
            onClick={() => handleBulkAction('approve')}
          >
            Approve Selected
          </button>
          <button
            className={styles.bulkReject}
            onClick={() => handleBulkAction('reject')}
          >
            Reject Selected
          </button>
        </div>
      )}

      {/* Receipt List */}
      <div className={styles.receiptList}>
        {filteredReceipts.length === 0 ? (
          <div className={styles.emptyState}>
            <FaFileAlt className={styles.emptyIcon} />
            <p>No receipts found</p>
          </div>
        ) : (
          filteredReceipts.map((receipt) => (
            <div key={receipt.id} className={styles.receiptCard}>
              <div className={styles.receiptHeader}>
                <input
                  type="checkbox"
                  checked={selectedReceipts.includes(receipt.id)}
                  onChange={() => toggleReceiptSelection(receipt.id)}
                  className={styles.checkbox}
                />
                {getStatusBadge(receipt.status)}
                <span className={styles.receiptDate}>
                  {format(new Date(receipt.receivedAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>

              <div className={styles.receiptBody}>
                <div className={styles.receiptInfo}>
                  <p><strong>From:</strong> {receipt.senderEmail}</p>
                  <p><strong>Subject:</strong> {receipt.subject}</p>
                </div>

                {receipt.parsedData && (
                  <div className={styles.parsedData}>
                    <h4>
                      <FaRobot /> AI Extracted Data
                    </h4>
                    {editingReceipt?.id === receipt.id ? (
                      <div className={styles.editForm}>
                        <div className={styles.editField}>
                          <label>Amount:</label>
                          <input
                            type="number"
                            value={editingReceipt.corrections.amount}
                            onChange={(e) => updateCorrection('amount', e.target.value)}
                            step="0.01"
                          />
                        </div>
                        <div className={styles.editField}>
                          <label>Charity:</label>
                          <input
                            type="text"
                            value={editingReceipt.corrections.charityName}
                            onChange={(e) => updateCorrection('charityName', e.target.value)}
                          />
                        </div>
                        <div className={styles.editField}>
                          <label>Date:</label>
                          <input
                            type="date"
                            value={editingReceipt.corrections.date}
                            onChange={(e) => updateCorrection('date', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.dataDisplay}>
                        <p><strong>Amount:</strong> ${receipt.parsedData.amount || 'Unknown'}</p>
                        <p><strong>Charity:</strong> {receipt.parsedData.charityName || 'Unknown'}</p>
                        <p><strong>Date:</strong> {receipt.parsedData.date || 'Unknown'}</p>
                      </div>
                    )}
                  </div>
                )}

                {receipt.error && (
                  <div className={styles.errorInfo}>
                    <FaExclamationTriangle /> {receipt.error}
                  </div>
                )}
              </div>

              <div className={styles.receiptActions}>
                {editingReceipt?.id === receipt.id ? (
                  <>
                    <button
                      className={styles.saveBtn}
                      onClick={() => handleApprove(receipt.id)}
                    >
                      Save & Approve
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setEditingReceipt(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {receipt.status === 'pending' || receipt.status === 'review' ? (
                      <>
                        <button
                          className={styles.editBtn}
                          onClick={() => startEditing(receipt)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApprove(receipt.id)}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleReject(receipt.id)}
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={styles.processedText}>
                        {receipt.status === 'processed' ? 'Added to donations' : 'Action completed'}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReceiptDashboard;