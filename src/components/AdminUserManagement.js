import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaStar, FaTrophy, FaEdit } from 'react-icons/fa';
import { API_ENDPOINTS, getApiUrl } from '../config/api.config';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminSharedStyles.module.css';
import userStyles from './AdminUserManagement.module.css';

const AdminUserManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scoreAdjustment, setScoreAdjustment] = useState({
    donations: 0,
    volunteerHours: 0,
    fundraisingAmount: 0
  });
  const [tierOverride, setTierOverride] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(getApiUrl(API_ENDPOINTS.ADMIN_USERS), {
          headers: getAuthHeaders()
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAuthHeaders]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${getApiUrl('/api/admin/users')}/${userId}/role`, { role: newRole }, {
        headers: getAuthHeaders()
      });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`${getApiUrl('/api/admin/users')}/${userId}/status`, { status: newStatus }, {
        headers: getAuthHeaders()
      });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleScoreAdjustment = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.put(`${getApiUrl('/api/admin/users')}/${selectedUser._id}/impact-score`, {
        adjustments: scoreAdjustment,
        tierOverride: tierOverride || null
      }, {
        headers: getAuthHeaders()
      });
      
      // Refresh user data
      const response = await axios.get(getApiUrl(API_ENDPOINTS.ADMIN_USERS), {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
      
      setMessage({ type: 'success', text: 'Impact score updated successfully' });
      setShowScoreModal(false);
      resetScoreModal();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update impact score' });
    }
  };

  const resetScoreModal = () => {
    setSelectedUser(null);
    setScoreAdjustment({
      donations: 0,
      volunteerHours: 0,
      fundraisingAmount: 0
    });
    setTierOverride('');
  };

  const openScoreModal = (user) => {
    setSelectedUser(user);
    setShowScoreModal(true);
  };

  const getTierIcon = (tier) => {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };
    return icons[tier] || '⭐';
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[tier] || '#666';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  const getRoleBadge = (role) => {
    const badges = {
      admin: { className: styles.badgeDanger, text: 'Admin' },
      business: { className: styles.badgePrimary, text: 'Business' },
      user: { className: styles.badgeInfo, text: 'User' }
    };
    return badges[role] || badges.user;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { className: styles.badgeSuccess, text: 'Active' },
      suspended: { className: styles.badgeWarning, text: 'Suspended' }
    };
    return badges[status] || badges.active;
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>User Management</h1>
      </div>

      {message.text && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
          {message.text}
        </div>
      )}

      <div className={styles.card}>
        <div className="display-flex gap-20 mb-20">
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search users..."
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
              All Users
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`${styles.filterButton} ${filter === 'admin' ? styles.active : ''}`}
            >
              <FaShieldAlt /> Admins
            </button>
            <button
              onClick={() => setFilter('business')}
              className={`${styles.filterButton} ${filter === 'business' ? styles.active : ''}`}
            >
              Business
            </button>
            <button
              onClick={() => setFilter('user')}
              className={`${styles.filterButton} ${filter === 'user' ? styles.active : ''}`}
            >
              <FaUser /> Users
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <h3>Error Loading Users</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Impact Score</th>
                    <th>Tier</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex-align-center gap-10">
                          <FaUser />
                          {user.name}
                        </div>
                      </td>
                      <td>
                        <div className="flex-align-center gap-10">
                          <FaEnvelope />
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={styles.select}
                        >
                          <option value="user">User</option>
                          <option value="business">Business</option>
                          <option value="admin">Admin</option>
                        </select>
                        <span className={`${styles.badge} ${getRoleBadge(user.role).className}`} className="ml-10">
                          {getRoleBadge(user.role).text}
                        </span>
                      </td>
                      <td>
                        <div className={userStyles.scoreCell}>
                          <FaStar className="color-hex-ffd700" />
                          <span className={userStyles.scoreValue}>{user.impactScore || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className={userStyles.tierCell}>
                          <span className={userStyles.tierIcon}>{getTierIcon(user.tier)}</span>
                          <span 
                            className={userStyles.tierBadge}
                            style={{ backgroundColor: getTierColor(user.tier) }}
                          >
                            {user.tier ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1) : 'None'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select 
                          value={user.status} 
                          onChange={(e) => handleStatusChange(user._id, e.target.value)}
                          className={styles.select}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <span className={`${styles.badge} ${getStatusBadge(user.status).className}`} className="ml-10">
                          {user.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                          {getStatusBadge(user.status).text}
                        </span>
                      </td>
                      <td>
                        <div className="display-flex gap-10">
                          <button 
                            onClick={() => openScoreModal(user)}
                            className={`${styles.button} ${styles.primaryButton}`} 
                            className="font-size-12 p-5px-15px"
                          >
                            <FaEdit /> Edit Score
                          </button>
                          <button className={`${styles.button} ${styles.primaryButton}`} className="font-size-12 p-5px-15px">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Impact Score Edit Modal */}
      {showScoreModal && selectedUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Edit Impact Score for {selectedUser.name}</h3>
            
            <div className={userStyles.currentScoreInfo}>
              <div className={userStyles.scoreInfoItem}>
                <label>Current Score:</label>
                <span className={userStyles.currentScore}>{selectedUser.impactScore || 0}</span>
              </div>
              <div className={userStyles.scoreInfoItem}>
                <label>Current Tier:</label>
                <span>{getTierIcon(selectedUser.tier)} {selectedUser.tier || 'None'}</span>
              </div>
            </div>

            <div className={userStyles.scoreBreakdown}>
              <h4>Score Components</h4>
              <div className={userStyles.componentGrid}>
                <div className={userStyles.componentItem}>
                  <span>Donations:</span>
                  <span>${selectedUser.totalDonations || 0}</span>
                </div>
                <div className={userStyles.componentItem}>
                  <span>Volunteer Hours:</span>
                  <span>{selectedUser.volunteerHours || 0} hrs</span>
                </div>
                <div className={userStyles.componentItem}>
                  <span>Fundraising:</span>
                  <span>${selectedUser.fundraisingAmount || 0}</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Score Adjustments</label>
              <div className={userStyles.adjustmentGrid}>
                <div>
                  <label>Add Donations ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={scoreAdjustment.donations}
                    onChange={(e) => setScoreAdjustment({
                      ...scoreAdjustment,
                      donations: parseFloat(e.target.value) || 0
                    })}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label>Add Volunteer Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={scoreAdjustment.volunteerHours}
                    onChange={(e) => setScoreAdjustment({
                      ...scoreAdjustment,
                      volunteerHours: parseFloat(e.target.value) || 0
                    })}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label>Add Fundraising ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={scoreAdjustment.fundraisingAmount}
                    onChange={(e) => setScoreAdjustment({
                      ...scoreAdjustment,
                      fundraisingAmount: parseFloat(e.target.value) || 0
                    })}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Tier Override (Optional)</label>
              <select
                value={tierOverride}
                onChange={(e) => setTierOverride(e.target.value)}
                className={styles.select}
              >
                <option value="">Use calculated tier</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            <div className={styles.modalButtons}>
              <button 
                onClick={() => { setShowScoreModal(false); resetScoreModal(); }} 
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleScoreAdjustment} 
                className={styles.saveButton}
              >
                Update Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;