import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSearch, 
  FaFileAlt, 
  FaUser, 
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaSpinner,
  FaNewspaper,
  FaBlog,
  FaQuestionCircle,
  FaCheckCircle,
  FaClock,
  FaArchive
} from 'react-icons/fa';
import styles from './AdminSharedStyles.module.css';

const AdminContentManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/content`,
        { headers: getAuthHeaders() }
      );
      setContent(response.data);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contentId, newStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/content/${contentId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      setContent(content.map(item => 
        item._id === contentId ? { ...item, status: newStatus } : item
      ));
      setMessage({ type: 'success', text: 'Content status updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error updating content status:', err);
      setMessage({ type: 'error', text: 'Failed to update content status' });
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/admin/content/${contentId}`,
        { headers: getAuthHeaders() }
      );
      setContent(content.filter(item => item._id !== contentId));
      setMessage({ type: 'success', text: 'Content deleted successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error deleting content:', err);
      setMessage({ type: 'error', text: 'Failed to delete content' });
    }
  };

  const filteredContent = content.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.title?.toLowerCase().includes(searchLower) ||
                         item.author?.toLowerCase().includes(searchLower) ||
                         item.type?.toLowerCase().includes(searchLower);
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type) => {
    const icons = {
      article: FaNewspaper,
      blog: FaBlog,
      faq: FaQuestionCircle,
      page: FaFileAlt
    };
    return icons[type] || FaFileAlt;
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { className: styles.badgeWarning, icon: FaClock, text: 'Draft' },
      published: { className: styles.badgeSuccess, icon: FaCheckCircle, text: 'Published' },
      archived: { className: styles.badgeInfo, icon: FaArchive, text: 'Archived' }
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return { ...badge, Icon };
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Content Management</h1>
        <button className={`${styles.button} ${styles.primaryButton}`}>
          <FaPlus /> Create Content
        </button>
      </div>

      {message.text && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
          {message.text}
        </div>
      )}

      <div className={styles.card}>
        <div className="display-flex gap-20 mb-20 flex-wrap">
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <FaSearch className={styles.searchIcon} />
          </div>
          
          <div className={styles.filters}>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.select}
              className="min-width-150"
            >
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="blog">Blog Posts</option>
              <option value="faq">FAQs</option>
              <option value="page">Pages</option>
            </select>
            
            <button
              onClick={() => setFilterStatus('all')}
              className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`${styles.filterButton} ${filterStatus === 'draft' ? styles.active : ''}`}
            >
              <FaClock /> Draft
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`${styles.filterButton} ${filterStatus === 'published' ? styles.active : ''}`}
            >
              <FaCheckCircle /> Published
            </button>
            <button
              onClick={() => setFilterStatus('archived')}
              className={`${styles.filterButton} ${filterStatus === 'archived' ? styles.active : ''}`}
            >
              <FaArchive /> Archived
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading content...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <h3>Error Loading Content</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Author</th>
                    <th>Created</th>
                    <th>Last Modified</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map(item => {
                    const TypeIcon = getTypeIcon(item.type);
                    const statusBadge = getStatusBadge(item.status);
                    
                    return (
                      <tr key={item._id}>
                        <td>
                          <div>
                            <strong>{item.title}</strong>
                            {item.excerpt && (
                              <div className="font-size-12 text-muted mt-4">
                                {item.excerpt.substring(0, 60)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex-align-center gap-8">
                            <TypeIcon className="color-hex-2d8f7b" />
                            <span className="text-capitalize">{item.type}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex-align-center gap-8">
                            <FaUser />
                            {item.author}
                          </div>
                        </td>
                        <td>
                          <div className="flex-align-center gap-5">
                            <FaCalendarAlt />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {item.updatedAt && new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <select 
                            value={item.status} 
                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            className={styles.select}
                            className="max-width-150"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
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
                              title="View Content"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className={`${styles.button} ${styles.secondaryButton}`} 
                              className="font-size-12 p-5px-10px"
                              title="Edit Content"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className={`${styles.button} ${styles.dangerButton}`} 
                              className="font-size-12 p-5px-10px"
                              onClick={() => handleDelete(item._id)}
                              title="Delete Content"
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

        {!loading && !error && filteredContent.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No content found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContentManagement;