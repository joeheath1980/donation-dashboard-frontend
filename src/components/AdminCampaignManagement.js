import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSearch, 
  FaBullhorn, 
  FaCalendarAlt, 
  FaChartLine, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaSpinner,
  FaDollarSign,
  FaUsers,
  FaEdit,
  FaTrash,
  FaPlus
} from 'react-icons/fa';
import styles from './AdminSharedStyles.module.css';
import localStyles from './AdminCampaignManagement.module.css';
import { API_CONFIG } from '../config/api.config';

const AdminCampaignManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalDonors: 0
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length > 0) {
      const newStats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalRaised: campaigns.reduce((sum, c) => sum + (c.amountRaised || 0), 0),
        totalDonors: campaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0)
      };
      setStats(newStats);
    }
  }, [campaigns]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/admin/campaigns`,
        { headers: getAuthHeaders() }
      );
      setCampaigns(response.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      await axios.put(
        `${API_CONFIG.BASE_URL}/api/admin/campaigns/${campaignId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      setCampaigns(campaigns.map(campaign => 
        campaign._id === campaignId ? { ...campaign, status: newStatus } : campaign
      ));
      setMessage({ type: 'success', text: 'Campaign status updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error updating campaign status:', err);
      setMessage({ type: 'error', text: 'Failed to update campaign status' });
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await axios.delete(
        `${API_CONFIG.BASE_URL}/api/admin/campaigns/${campaignId}`,
        { headers: getAuthHeaders() }
      );
      setCampaigns(campaigns.filter(c => c._id !== campaignId));
      setMessage({ type: 'success', text: 'Campaign deleted successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setMessage({ type: 'error', text: 'Failed to delete campaign' });
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = campaign.name?.toLowerCase().includes(searchLower) ||
                         campaign.charity?.name?.toLowerCase().includes(searchLower) ||
                         campaign.description?.toLowerCase().includes(searchLower);
    const matchesFilter = filter === 'all' || campaign.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: { className: styles.badgeSuccess, icon: FaCheckCircle, text: 'Active' },
      inactive: { className: styles.badgeWarning, icon: FaClock, text: 'Inactive' },
      completed: { className: styles.badgeInfo, icon: FaCheckCircle, text: 'Completed' },
      cancelled: { className: styles.badgeDanger, icon: FaTimesCircle, text: 'Cancelled' }
    };
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;
    return { ...badge, Icon };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Campaign Management</h1>
        <button className={`${styles.button} ${styles.primaryButton}`}>
          <FaPlus /> Create Campaign
        </button>
      </div>

      {message.text && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
          {message.text}
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3><FaBullhorn /> Total Campaigns</h3>
          <p>{stats.totalCampaigns}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaCheckCircle /> Active</h3>
          <p>{stats.activeCampaigns}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaDollarSign /> Total Raised</h3>
          <p>${stats.totalRaised.toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <h3><FaUsers /> Total Donors</h3>
          <p>{stats.totalDonors}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={localStyles.flexRow}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search campaigns..."
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
              All Campaigns
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            >
              <FaCheckCircle /> Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`${styles.filterButton} ${filter === 'inactive' ? styles.active : ''}`}
            >
              <FaClock /> Inactive
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <h3>Error Loading Campaigns</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Charity</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Goal</th>
                    <th>Raised</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map(campaign => {
                    const statusBadge = getStatusBadge(campaign.status);
                    const progress = campaign.goal ? (campaign.amountRaised / campaign.goal) * 100 : 0;
                    
                    return (
                      <tr key={campaign._id}>
                        <td>
                          <div>
                            <strong>{campaign.name}</strong>
                            <div className={localStyles.smallText}>
                              {campaign.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </td>
                        <td>{campaign.charity?.name || 'Unknown'}</td>
                        <td>
                          <div className={localStyles.flexAlignCenter}>
                            <FaCalendarAlt />
                            {formatDate(campaign.startDate)}
                          </div>
                        </td>
                        <td>
                          <div className={localStyles.flexAlignCenter}>
                            <FaCalendarAlt />
                            {formatDate(campaign.endDate)}
                          </div>
                        </td>
                        <td>
                          <strong>${campaign.goal?.toFixed(2) || '0.00'}</strong>
                        </td>
                        <td>
                          <div>
                            <strong className={localStyles.successText}>${campaign.amountRaised?.toFixed(2) || '0.00'}</strong>
                            <div className={localStyles.progressContainer}>
                              <div 
                                className={localStyles.progressBar}
                                data-progress={Math.round(Math.min(progress, 100) / 5) * 5}
                              ></div>
                            </div>
                            <div className={localStyles.tinyText}>
                              {progress.toFixed(0)}% of goal
                            </div>
                          </div>
                        </td>
                        <td>
                          <select 
                            value={campaign.status} 
                            onChange={(e) => handleStatusChange(campaign._id, e.target.value)}
                            className={styles.select}
                            className={`${styles.select} ${localStyles.selectSmall}`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span className={`${styles.badge} ${statusBadge.className} ${localStyles.badgeWithMargin}`}>
                            <statusBadge.Icon /> {statusBadge.text}
                          </span>
                        </td>
                        <td>
                          <div className={localStyles.flexRowSmall}>
                            <button 
                              className={`${styles.button} ${styles.primaryButton} ${localStyles.buttonSmall}`}
                              title="Edit Campaign"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className={`${styles.button} ${styles.dangerButton} ${localStyles.buttonSmall}`}
                              onClick={() => handleDelete(campaign._id)}
                              title="Delete Campaign"
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

        {!loading && !error && filteredCampaigns.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No campaigns found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCampaignManagement;