import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './DonorSegments.module.css';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSave,
  FaTimes,
  FaDollarSign,
  FaClock,
  FaStar,
  FaEnvelope
} from 'react-icons/fa';

function DonorSegments({ charityId }) {
  const { getAuthHeaders } = useAuth();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteria: {
      minDonation: '',
      maxDonation: '',
      frequency: '',
      lastDonationDays: '',
      tags: []
    }
  });

  useEffect(() => {
    fetchSegments();
  }, [charityId]);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await axios.get(...);
      
      // For demo, use mock data
      setSegments([
        {
          id: 1,
          name: 'Major Donors',
          description: 'Donors who have given $500 or more',
          criteria: { minDonation: 500 },
          donorCount: 45,
          totalValue: 125000,
          icon: 'FaDollarSign'
        },
        {
          id: 2,
          name: 'Monthly Givers',
          description: 'Donors with recurring monthly donations',
          criteria: { frequency: 'monthly' },
          donorCount: 89,
          totalValue: 28500,
          icon: 'FaClock'
        },
        {
          id: 3,
          name: 'Lapsed Donors',
          description: 'No donation in the last 90 days',
          criteria: { lastDonationDays: 90 },
          donorCount: 234,
          totalValue: 45000,
          icon: 'FaClock'
        },
        {
          id: 4,
          name: 'VIP Supporters',
          description: 'Top 10% of donors by total contribution',
          criteria: { tags: ['VIP'] },
          donorCount: 12,
          totalValue: 185000,
          icon: 'FaStar'
        }
      ]);
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSegment = async () => {
    if (!newSegment.name) return;
    
    try {
      // API call would go here
      const newId = Math.max(...segments.map(s => s.id)) + 1;
      const created = {
        ...newSegment,
        id: newId,
        donorCount: 0,
        totalValue: 0,
        icon: 'FaUsers'
      };
      setSegments([...segments, created]);
      setShowCreateModal(false);
      setNewSegment({
        name: '',
        description: '',
        criteria: {
          minDonation: '',
          maxDonation: '',
          frequency: '',
          lastDonationDays: '',
          tags: []
        }
      });
    } catch (error) {
      console.error('Error creating segment:', error);
    }
  };

  const handleUpdateSegment = async (id, updates) => {
    try {
      // API call would go here
      setSegments(segments.map(s => s.id === id ? { ...s, ...updates } : s));
      setEditingSegment(null);
    } catch (error) {
      console.error('Error updating segment:', error);
    }
  };

  const handleDeleteSegment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      // API call would go here
      setSegments(segments.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting segment:', error);
    }
  };

  const handleEmailSegment = async (segment) => {
    // Navigate to communication with segment pre-selected
    alert(`Email ${segment.donorCount} donors in "${segment.name}" segment`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getIconComponent = (iconName) => {
    const icons = {
      FaDollarSign: FaDollarSign,
      FaClock: FaClock,
      FaStar: FaStar,
      FaUsers: FaUsers
    };
    const IconComponent = icons[iconName] || FaUsers;
    return <IconComponent />;
  };

  if (loading) {
    return <div className={styles.loading}>Loading segments...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Donor Segments</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className={styles.createButton}
        >
          <FaPlus /> Create Segment
        </button>
      </div>

      <div className={styles.segmentsGrid}>
        {segments.map(segment => (
          <div key={segment.id} className={styles.segmentCard}>
            <div className={styles.segmentHeader}>
              <div className={styles.segmentIcon}>
                {getIconComponent(segment.icon)}
              </div>
              <div className={styles.segmentActions}>
                <button 
                  onClick={() => setEditingSegment(segment)}
                  className={styles.iconButton}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDeleteSegment(segment.id)}
                  className={styles.iconButton}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <h3 className={styles.segmentName}>{segment.name}</h3>
            <p className={styles.segmentDescription}>{segment.description}</p>
            
            <div className={styles.segmentStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Donors</span>
                <span className={styles.statValue}>{segment.donorCount}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Value</span>
                <span className={styles.statValue}>{formatCurrency(segment.totalValue)}</span>
              </div>
            </div>
            
            <div className={styles.segmentFooter}>
              <button 
                onClick={() => handleEmailSegment(segment)}
                className={styles.emailButton}
              >
                <FaEnvelope /> Email Segment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingSegment) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingSegment ? 'Edit Segment' : 'Create New Segment'}</h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSegment(null);
                }}
                className={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Segment Name</label>
                <input
                  type="text"
                  value={editingSegment ? editingSegment.name : newSegment.name}
                  onChange={(e) => {
                    if (editingSegment) {
                      setEditingSegment({ ...editingSegment, name: e.target.value });
                    } else {
                      setNewSegment({ ...newSegment, name: e.target.value });
                    }
                  }}
                  placeholder="e.g., Major Donors"
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={editingSegment ? editingSegment.description : newSegment.description}
                  onChange={(e) => {
                    if (editingSegment) {
                      setEditingSegment({ ...editingSegment, description: e.target.value });
                    } else {
                      setNewSegment({ ...newSegment, description: e.target.value });
                    }
                  }}
                  placeholder="Describe this segment..."
                  className={styles.textarea}
                />
              </div>
              
              <div className={styles.criteriaSection}>
                <h4><FaFilter /> Criteria</h4>
                
                <div className={styles.criteriaGrid}>
                  <div className={styles.formGroup}>
                    <label>Min Donation</label>
                    <input
                      type="number"
                      placeholder="$0"
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Max Donation</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Frequency</label>
                    <select className={styles.select}>
                      <option value="">Any</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Last Donation (days)</label>
                    <input
                      type="number"
                      placeholder="e.g., 90"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSegment(null);
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (editingSegment) {
                    handleUpdateSegment(editingSegment.id, editingSegment);
                  } else {
                    handleCreateSegment();
                  }
                }}
                className={styles.saveButton}
              >
                <FaSave /> {editingSegment ? 'Update' : 'Create'} Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorSegments;
