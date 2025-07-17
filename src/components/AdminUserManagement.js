import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import styles from './AdminSharedStyles.module.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
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
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FaUser />
                          {user.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                        <span className={`${styles.badge} ${getRoleBadge(user.role).className}`} style={{ marginLeft: '10px' }}>
                          {getRoleBadge(user.role).text}
                        </span>
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
                        <span className={`${styles.badge} ${getStatusBadge(user.status).className}`} style={{ marginLeft: '10px' }}>
                          {user.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                          {getStatusBadge(user.status).text}
                        </span>
                      </td>
                      <td>
                        <button className={`${styles.button} ${styles.primaryButton}`} style={{ fontSize: '12px', padding: '5px 15px' }}>
                          View Details
                        </button>
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
    </div>
  );
};

export default AdminUserManagement;