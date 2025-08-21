import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './CommunicationLog.module.css';
import {
  FaEnvelope,
  FaPhone,
  FaSms,
  FaComment,
  FaFilter,
  FaSearch,
  FaPlus,
  FaPaperPlane,
  FaHistory,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaTimes,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

function CommunicationLog({ charityId }) {
  const { getAuthHeaders } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedComm, setSelectedComm] = useState(null);
  const [newMessage, setNewMessage] = useState({
    recipients: [],
    subject: '',
    message: '',
    type: 'email',
    scheduledFor: ''
  });

  useEffect(() => {
    fetchCommunications();
  }, [charityId]);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await axios.get(...);
      
      // For demo, use mock data
      setCommunications([
        {
          id: 1,
          date: '2025-01-20 10:30',
          type: 'email',
          subject: 'Thank You for Your Generous Donation',
          recipients: 45,
          status: 'sent',
          openRate: 78,
          clickRate: 23,
          sender: 'John Smith'
        },
        {
          id: 2,
          date: '2025-01-18 14:15',
          type: 'email',
          subject: 'January Impact Report',
          recipients: 234,
          status: 'sent',
          openRate: 65,
          clickRate: 18,
          sender: 'Sarah Johnson'
        },
        {
          id: 3,
          date: '2025-01-25 09:00',
          type: 'email',
          subject: 'Upcoming Fundraiser Event',
          recipients: 156,
          status: 'scheduled',
          sender: 'John Smith'
        },
        {
          id: 4,
          date: '2025-01-15 11:45',
          type: 'sms',
          subject: 'Donation Reminder',
          recipients: 89,
          status: 'sent',
          deliveryRate: 95,
          sender: 'System'
        },
        {
          id: 5,
          date: '2025-01-10 16:20',
          type: 'email',
          subject: 'Year-End Tax Receipt',
          recipients: 312,
          status: 'sent',
          openRate: 85,
          clickRate: 45,
          sender: 'Finance Team'
        },
        {
          id: 6,
          date: '2025-01-08 13:00',
          type: 'email',
          subject: 'Welcome to Our Community',
          recipients: 12,
          status: 'failed',
          error: 'Invalid email addresses',
          sender: 'John Smith'
        }
      ]);
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.message) return;
    
    try {
      // API call would go here
      const newComm = {
        id: communications.length + 1,
        date: newMessage.scheduledFor || new Date().toISOString(),
        type: newMessage.type,
        subject: newMessage.subject,
        recipients: newMessage.recipients.length,
        status: newMessage.scheduledFor ? 'scheduled' : 'sending',
        sender: 'Current User'
      };
      
      setCommunications([newComm, ...communications]);
      setShowComposeModal(false);
      setNewMessage({
        recipients: [],
        subject: '',
        message: '',
        type: 'email',
        scheduledFor: ''
      });
      
      // Simulate sending
      setTimeout(() => {
        setCommunications(prev => 
          prev.map(c => c.id === newComm.id 
            ? { ...c, status: 'sent', openRate: 0, clickRate: 0 } 
            : c
          )
        );
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleResend = async (commId) => {
    try {
      // API call would go here
      alert(`Resending communication #${commId}`);
    } catch (error) {
      console.error('Error resending:', error);
    }
  };

  const handleDelete = async (commId) => {
    if (!window.confirm('Are you sure you want to delete this communication?')) return;
    
    try {
      // API call would go here
      setCommunications(communications.filter(c => c.id !== commId));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || comm.type === filterType;
    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type) => {
    switch(type) {
      case 'email': return <FaEnvelope />;
      case 'sms': return <FaSms />;
      case 'phone': return <FaPhone />;
      default: return <FaComment />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      sent: { className: styles.sent, text: 'Sent' },
      scheduled: { className: styles.scheduled, text: 'Scheduled' },
      sending: { className: styles.sending, text: 'Sending...' },
      failed: { className: styles.failed, text: 'Failed' }
    };
    
    const badge = badges[status] || badges.sent;
    return <span className={`${styles.statusBadge} ${badge.className}`}>{badge.text}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading communications...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Communication History</h2>
        <button 
          onClick={() => setShowComposeModal(true)}
          className={styles.composeButton}
        >
          <FaPlus /> Compose Message
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filters}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className={styles.timeline}>
        {filteredCommunications.map(comm => (
          <div key={comm.id} className={styles.timelineItem}>
            <div className={styles.timelineIcon}>
              {getTypeIcon(comm.type)}
            </div>
            
            <div className={styles.timelineContent}>
              <div className={styles.commHeader}>
                <div className={styles.commTitle}>
                  <h3>{comm.subject}</h3>
                  {getStatusBadge(comm.status)}
                </div>
                <div className={styles.commActions}>
                  {comm.status === 'failed' && (
                    <button 
                      onClick={() => handleResend(comm.id)}
                      className={styles.actionButton}
                      title="Resend"
                    >
                      <FaPaperPlane />
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedComm(comm)}
                    className={styles.actionButton}
                    title="View Details"
                  >
                    <FaFileAlt />
                  </button>
                  <button 
                    onClick={() => handleDelete(comm.id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    title="Delete"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className={styles.commMeta}>
                <span className={styles.metaItem}>
                  <FaUser /> {comm.sender}
                </span>
                <span className={styles.metaItem}>
                  <FaCalendarAlt /> {formatDate(comm.date)}
                </span>
                <span className={styles.metaItem}>
                  <FaEnvelope /> {comm.recipients} recipients
                </span>
              </div>
              
              {comm.status === 'sent' && (
                <div className={styles.commStats}>
                  {comm.openRate !== undefined && (
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Open Rate</span>
                      <div className={styles.statBar}>
                        <div 
                          className={styles.statProgress} 
                          style={{ width: `${comm.openRate}%` }}
                        />
                      </div>
                      <span className={styles.statValue}>{comm.openRate}%</span>
                    </div>
                  )}
                  {comm.clickRate !== undefined && (
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Click Rate</span>
                      <div className={styles.statBar}>
                        <div 
                          className={styles.statProgress} 
                          style={{ width: `${comm.clickRate}%` }}
                        />
                      </div>
                      <span className={styles.statValue}>{comm.clickRate}%</span>
                    </div>
                  )}
                  {comm.deliveryRate !== undefined && (
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Delivery Rate</span>
                      <div className={styles.statBar}>
                        <div 
                          className={styles.statProgress} 
                          style={{ width: `${comm.deliveryRate}%` }}
                        />
                      </div>
                      <span className={styles.statValue}>{comm.deliveryRate}%</span>
                    </div>
                  )}
                </div>
              )}
              
              {comm.status === 'failed' && comm.error && (
                <div className={styles.errorMessage}>
                  <FaExclamationCircle /> {comm.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Compose Message</h3>
              <button 
                onClick={() => setShowComposeModal(false)}
                className={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Message Type</label>
                <div className={styles.typeButtons}>
                  <button 
                    className={newMessage.type === 'email' ? styles.typeActive : ''}
                    onClick={() => setNewMessage({ ...newMessage, type: 'email' })}
                  >
                    <FaEnvelope /> Email
                  </button>
                  <button 
                    className={newMessage.type === 'sms' ? styles.typeActive : ''}
                    onClick={() => setNewMessage({ ...newMessage, type: 'sms' })}
                  >
                    <FaSms /> SMS
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Recipients</label>
                <select className={styles.select}>
                  <option>All Donors</option>
                  <option>Monthly Donors</option>
                  <option>Major Donors</option>
                  <option>Lapsed Donors</option>
                  <option>Custom Segment...</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Enter subject..."
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Message</label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Type your message here..."
                  className={styles.textarea}
                  rows={8}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={newMessage.scheduledFor}
                  onChange={(e) => setNewMessage({ ...newMessage, scheduledFor: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowComposeModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendMessage}
                className={styles.sendButton}
              >
                <FaPaperPlane /> {newMessage.scheduledFor ? 'Schedule' : 'Send'} Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedComm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Communication Details</h3>
              <button 
                onClick={() => setSelectedComm(null)}
                className={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Subject</span>
                  <span className={styles.detailValue}>{selectedComm.subject}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Type</span>
                  <span className={styles.detailValue}>
                    {getTypeIcon(selectedComm.type)} {selectedComm.type.toUpperCase()}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status</span>
                  {getStatusBadge(selectedComm.status)}
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Sent By</span>
                  <span className={styles.detailValue}>{selectedComm.sender}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{new Date(selectedComm.date).toLocaleString()}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Recipients</span>
                  <span className={styles.detailValue}>{selectedComm.recipients}</span>
                </div>
              </div>
              
              {selectedComm.status === 'sent' && (
                <div className={styles.performanceSection}>
                  <h4>Performance Metrics</h4>
                  <div className={styles.metricsGrid}>
                    {selectedComm.openRate !== undefined && (
                      <div className={styles.metricCard}>
                        <FaCheckCircle className={styles.metricIcon} />
                        <div>
                          <span className={styles.metricValue}>{selectedComm.openRate}%</span>
                          <span className={styles.metricLabel}>Open Rate</span>
                        </div>
                      </div>
                    )}
                    {selectedComm.clickRate !== undefined && (
                      <div className={styles.metricCard}>
                        <FaCheckCircle className={styles.metricIcon} />
                        <div>
                          <span className={styles.metricValue}>{selectedComm.clickRate}%</span>
                          <span className={styles.metricLabel}>Click Rate</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunicationLog;
