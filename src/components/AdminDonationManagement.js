import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaDollarSign, FaCalendarAlt, FaHeart, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaChartLine, FaExchangeAlt, FaGift } from 'react-icons/fa';
import styles from './AdminSharedStyles.module.css';
import donationStyles from './AdminDonationManagement.module.css';

const AdminDonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    directDonations: 0,
    microMatched: 0,
    totalDirectAmount: 0,
    totalMatchedAmount: 0
  });
  const [donationType, setDonationType] = useState('all');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get('/api/admin/donations');
        setDonations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch donations');
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  useEffect(() => {
    if (donations.length > 0) {
      const directDonations = donations.filter(d => !d.isMatched);
      const matchedDonations = donations.filter(d => d.isMatched);
      
      const newStats = {
        total: donations.reduce((sum, d) => sum + d.amount, 0),
        pending: donations.filter(d => d.status === 'pending').length,
        completed: donations.filter(d => d.status === 'completed').length,
        failed: donations.filter(d => d.status === 'failed').length,
        directDonations: directDonations.length,
        microMatched: matchedDonations.length,
        totalDirectAmount: directDonations.reduce((sum, d) => sum + d.amount, 0),
        totalMatchedAmount: matchedDonations.reduce((sum, d) => sum + d.amount, 0)
      };
      setStats(newStats);
    }
  }, [donations]);

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await axios.put(`/api/admin/donations/${donationId}/status`, { status: newStatus });
      setDonations(donations.map(donation => 
        donation._id === donationId ? { ...donation, status: newStatus } : donation
      ));
    } catch (err) {
      setError('Failed to update donation status');
    }
  };

  const filteredDonations = donations.filter(donation => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = donation.donor?.name?.toLowerCase().includes(searchLower) ||
                         donation.charity?.name?.toLowerCase().includes(searchLower) ||
                         donation.amount?.toString().includes(searchTerm);
    const matchesFilter = filter === 'all' || donation.status === filter;
    const matchesType = donationType === 'all' || 
                       (donationType === 'direct' && !donation.isMatched) ||
                       (donationType === 'matched' && donation.isMatched);
    return matchesSearch && matchesFilter && matchesType;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { className: styles.badgeWarning, icon: FaClock, text: 'Pending' },
      completed: { className: styles.badgeSuccess, icon: FaCheckCircle, text: 'Completed' },
      failed: { className: styles.badgeDanger, icon: FaTimesCircle, text: 'Failed' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return { ...badge, Icon };
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Donation Management</h1>
      </div>

      {message.text && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
          {message.text}
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3><FaDollarSign /> Total Amount</h3>
          <p>${stats.total.toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaClock /> Pending</h3>
          <p>{stats.pending}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaCheckCircle /> Completed</h3>
          <p>{stats.completed}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaTimesCircle /> Failed</h3>
          <p>{stats.failed}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaGift /> Direct Donations</h3>
          <p>{stats.directDonations}</p>
          <span style={{ fontSize: '12px', color: '#666' }}>${stats.totalDirectAmount.toFixed(2)}</span>
        </div>
        <div className={styles.statCard}>
          <h3><FaExchangeAlt /> Micro-Matched</h3>
          <p>{stats.microMatched}</p>
          <span style={{ fontSize: '12px', color: '#666' }}>${stats.totalMatchedAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <FaSearch className={styles.searchIcon} />
          </div>
          
          <div className={styles.filters}>
            <button
              onClick={() => setFilter('all')}
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
            >
              <FaClock /> Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            >
              <FaCheckCircle /> Completed
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`${styles.filterButton} ${filter === 'failed' ? styles.active : ''}`}
            >
              <FaTimesCircle /> Failed
            </button>
          </div>
        </div>

        <div className={donationStyles.typeFilters}>
          <span className={donationStyles.filterLabel}>Donation Type:</span>
          <button
            onClick={() => setDonationType('all')}
            className={`${styles.filterButton} ${donationType === 'all' ? styles.active : ''}`}
          >
            All Types
          </button>
          <button
            onClick={() => setDonationType('direct')}
            className={`${styles.filterButton} ${donationType === 'direct' ? styles.active : ''}`}
          >
            <FaGift /> Direct Only
          </button>
          <button
            onClick={() => setDonationType('matched')}
            className={`${styles.filterButton} ${donationType === 'matched' ? styles.active : ''}`}
          >
            <FaExchangeAlt /> Micro-Matched Only
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading donations...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <h3>Error Loading Donations</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Charity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map(donation => {
                    const statusBadge = getStatusBadge(donation.status);
                    return (
                      <tr key={donation._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaHeart style={{ color: '#ec4899' }} />
                            {donation.donor?.name || 'Anonymous'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaDollarSign style={{ color: '#10b981' }} />
                            <strong>${donation.amount?.toFixed(2) || '0.00'}</strong>
                          </div>
                        </td>
                        <td>
                          <div className={donationStyles.typeIndicator}>
                            {donation.isMatched ? (
                              <>
                                <FaExchangeAlt style={{ color: '#f59e0b' }} />
                                <span className={donationStyles.matchedBadge}>Micro-Matched</span>
                                {donation.matchDetails && (
                                  <span className={donationStyles.matchInfo}>
                                    {donation.matchDetails.businessName} ({donation.matchDetails.ratio}x)
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <FaGift style={{ color: '#2d8f7b' }} />
                                <span className={donationStyles.directBadge}>Direct</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td>{donation.charity?.name || 'Unknown Charity'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCalendarAlt />
                            {new Date(donation.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <select 
                            value={donation.status} 
                            onChange={(e) => handleStatusChange(donation._id, e.target.value)}
                            className={styles.select}
                            style={{ maxWidth: '150px' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                          <span className={`${styles.badge} ${statusBadge.className}`} style={{ marginLeft: '10px' }}>
                            <statusBadge.Icon /> {statusBadge.text}
                          </span>
                        </td>
                        <td>
                          <button className={`${styles.button} ${styles.primaryButton}`} style={{ fontSize: '12px', padding: '5px 15px' }}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && filteredDonations.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No donations found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDonationManagement;