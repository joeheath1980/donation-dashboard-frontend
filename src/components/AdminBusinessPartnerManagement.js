import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSearch, 
  FaBuilding, 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt,
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlus,
  FaHandshake
} from 'react-icons/fa';
import styles from './AdminSharedStyles.module.css';

const AdminBusinessPartnerManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (partners.length > 0) {
      const newStats = {
        total: partners.length,
        active: partners.filter(p => p.status === 'active').length,
        pending: partners.filter(p => p.status === 'pending').length,
        inactive: partners.filter(p => p.status === 'inactive').length
      };
      setStats(newStats);
    }
  }, [partners]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/business-partners`,
        { headers: getAuthHeaders() }
      );
      setPartners(response.data);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to fetch business partners');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (partnerId, newStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/business-partners/${partnerId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      setPartners(partners.map(partner => 
        partner._id === partnerId ? { ...partner, status: newStatus } : partner
      ));
      setMessage({ type: 'success', text: 'Partner status updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error updating partner status:', err);
      setMessage({ type: 'error', text: 'Failed to update partner status' });
    }
  };

  const handleDelete = async (partnerId) => {
    if (!window.confirm('Are you sure you want to remove this business partner?')) return;
    
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/business-partners/${partnerId}`,
        { headers: getAuthHeaders() }
      );
      setPartners(partners.filter(p => p._id !== partnerId));
      setMessage({ type: 'success', text: 'Partner removed successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error deleting partner:', err);
      setMessage({ type: 'error', text: 'Failed to remove partner' });
    }
  };

  const filteredPartners = partners.filter(partner => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = partner.companyName?.toLowerCase().includes(searchLower) ||
                         partner.contactPerson?.toLowerCase().includes(searchLower) ||
                         partner.email?.toLowerCase().includes(searchLower);
    const matchesFilter = filter === 'all' || partner.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: { className: styles.badgeSuccess, icon: FaCheckCircle, text: 'Active' },
      pending: { className: styles.badgeWarning, icon: FaClock, text: 'Pending' },
      inactive: { className: styles.badgeDanger, icon: FaTimesCircle, text: 'Inactive' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return { ...badge, Icon };
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Business Partner Management</h1>
        <button className={`${styles.button} ${styles.primaryButton}`}>
          <FaPlus /> Add Partner
        </button>
      </div>

      {message.text && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
          {message.text}
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3><FaBuilding /> Total Partners</h3>
          <p>{stats.total}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaCheckCircle /> Active</h3>
          <p>{stats.active}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaClock /> Pending</h3>
          <p>{stats.pending}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaTimesCircle /> Inactive</h3>
          <p>{stats.inactive}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className="display-flex gap-20 mb-20 flex-wrap">
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search partners..."
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
              All Partners
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            >
              <FaCheckCircle /> Active
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
            >
              <FaClock /> Pending
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`${styles.filterButton} ${filter === 'inactive' ? styles.active : ''}`}
            >
              <FaTimesCircle /> Inactive
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading business partners...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <h3>Error Loading Partners</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map(partner => {
                    const statusBadge = getStatusBadge(partner.status);
                    return (
                      <tr key={partner._id}>
                        <td>
                          <div className="flex-align-center gap-10">
                            <FaBuilding className="color-hex-2d8f7b" />
                            <strong>{partner.companyName}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="flex-align-center gap-10">
                            <FaUser />
                            {partner.contactPerson}
                          </div>
                        </td>
                        <td>
                          <div className="flex-align-center gap-10">
                            <FaEnvelope />
                            {partner.email}
                          </div>
                        </td>
                        <td>
                          <div className="flex-align-center gap-10">
                            <FaCalendarAlt />
                            {new Date(partner.joinDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <select 
                            value={partner.status} 
                            onChange={(e) => handleStatusChange(partner._id, e.target.value)}
                            className={styles.select}
                            className="max-width-150"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <span className={`${styles.badge} ${statusBadge.className}`} className="ml-10">
                            <statusBadge.Icon /> {statusBadge.text}
                          </span>
                        </td>
                        <td>
                          <div className="display-flex gap-5">
                            <button 
                              className={`${styles.button} ${styles.primaryButton}`} 
                              className="font-size-12 p-5px-10px"
                              title="Edit Partner"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className={`${styles.button} ${styles.dangerButton}`} 
                              className="font-size-12 p-5px-10px"
                              onClick={() => handleDelete(partner._id)}
                              title="Remove Partner"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && filteredPartners.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No business partners found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBusinessPartnerManagement;