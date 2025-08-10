import React, { useState } from 'react';
import styles from './BulkActions.module.css';
import {
  FaEnvelope,
  FaTags,
  FaFileExport,
  FaTrash,
  FaUserPlus,
  FaEdit,
  FaStar,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';

function BulkActions({ selectedDonors, onActionComplete }) {
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({});
  const [processing, setProcessing] = useState(false);

  const handleAction = (type) => {
    setActionType(type);
    setShowModal(true);
    setActionData({});
  };

  const executeAction = async () => {
    setProcessing(true);
    
    try {
      switch (actionType) {
        case 'email':
          // API call to send bulk email
          console.log('Sending email to', selectedDonors.length, 'donors');
          break;
          
        case 'tag':
          // API call to add tags
          console.log('Adding tags to', selectedDonors.length, 'donors:', actionData.tags);
          break;
          
        case 'segment':
          // API call to add to segment
          console.log('Adding', selectedDonors.length, 'donors to segment:', actionData.segment);
          break;
          
        case 'export':
          // Export selected donors
          console.log('Exporting', selectedDonors.length, 'donors');
          break;
          
        case 'delete':
          // API call to delete donors
          console.log('Deleting', selectedDonors.length, 'donors');
          break;
          
        default:
          break;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowModal(false);
      onActionComplete();
    } catch (error) {
      console.error('Error executing bulk action:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedDonors || selectedDonors.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <FaCheckCircle className={styles.emptyIcon} />
          <p>Select donors to perform bulk actions</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.selection}>
          <span className={styles.count}>{selectedDonors.length}</span>
          <span className={styles.label}>donors selected</span>
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={() => handleAction('email')}
            className={`${styles.actionButton} ${styles.primary}`}
          >
            <FaEnvelope /> Send Email
          </button>
          
          <button 
            onClick={() => handleAction('tag')}
            className={styles.actionButton}
          >
            <FaTags /> Add Tags
          </button>
          
          <button 
            onClick={() => handleAction('segment')}
            className={styles.actionButton}
          >
            <FaUserPlus /> Add to Segment
          </button>
          
          <button 
            onClick={() => handleAction('export')}
            className={styles.actionButton}
          >
            <FaFileExport /> Export
          </button>
          
          <button 
            onClick={() => handleAction('delete')}
            className={`${styles.actionButton} ${styles.danger}`}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{getModalTitle()}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
                disabled={processing}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {renderModalContent()}
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.cancelButton}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                onClick={executeAction}
                className={styles.confirmButton}
                disabled={processing}
              >
                {processing ? 'Processing...' : getConfirmText()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getModalTitle() {
    switch (actionType) {
      case 'email': return 'Send Email to Selected Donors';
      case 'tag': return 'Add Tags to Selected Donors';
      case 'segment': return 'Add to Segment';
      case 'export': return 'Export Selected Donors';
      case 'delete': return 'Delete Selected Donors';
      default: return 'Bulk Action';
    }
  }

  function getConfirmText() {
    switch (actionType) {
      case 'email': return 'Send Email';
      case 'tag': return 'Add Tags';
      case 'segment': return 'Add to Segment';
      case 'export': return 'Export';
      case 'delete': return 'Delete Donors';
      default: return 'Confirm';
    }
  }

  function renderModalContent() {
    switch (actionType) {
      case 'email':
        return (
          <>
            <div className={styles.summary}>
              <FaEnvelope className={styles.summaryIcon} />
              <p>Send email to <strong>{selectedDonors.length} donors</strong></p>
            </div>
            <div className={styles.formGroup}>
              <label>Subject</label>
              <input
                type="text"
                placeholder="Enter email subject..."
                className={styles.input}
                onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Message Template</label>
              <select 
                className={styles.select}
                onChange={(e) => setActionData({ ...actionData, template: e.target.value })}
              >
                <option value="">Select a template...</option>
                <option value="thank-you">Thank You</option>
                <option value="impact-report">Impact Report</option>
                <option value="event-invitation">Event Invitation</option>
                <option value="custom">Custom Message</option>
              </select>
            </div>
          </>
        );
        
      case 'tag':
        return (
          <>
            <div className={styles.summary}>
              <FaTags className={styles.summaryIcon} />
              <p>Add tags to <strong>{selectedDonors.length} donors</strong></p>
            </div>
            <div className={styles.formGroup}>
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., VIP, Newsletter, Event2025"
                className={styles.input}
                onChange={(e) => setActionData({ ...actionData, tags: e.target.value.split(',').map(t => t.trim()) })}
              />
            </div>
            <div className={styles.tagPreview}>
              {actionData.tags?.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </>
        );
        
      case 'segment':
        return (
          <>
            <div className={styles.summary}>
              <FaUserPlus className={styles.summaryIcon} />
              <p>Add <strong>{selectedDonors.length} donors</strong> to segment</p>
            </div>
            <div className={styles.formGroup}>
              <label>Select Segment</label>
              <select 
                className={styles.select}
                onChange={(e) => setActionData({ ...actionData, segment: e.target.value })}
              >
                <option value="">Choose a segment...</option>
                <option value="major-donors">Major Donors</option>
                <option value="monthly-givers">Monthly Givers</option>
                <option value="lapsed-donors">Lapsed Donors</option>
                <option value="vip-supporters">VIP Supporters</option>
                <option value="new">Create New Segment...</option>
              </select>
            </div>
          </>
        );
        
      case 'export':
        return (
          <>
            <div className={styles.summary}>
              <FaFileExport className={styles.summaryIcon} />
              <p>Export <strong>{selectedDonors.length} donors</strong></p>
            </div>
            <div className={styles.formGroup}>
              <label>Export Format</label>
              <div className={styles.formatOptions}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    defaultChecked
                    onChange={(e) => setActionData({ ...actionData, format: e.target.value })}
                  />
                  CSV
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    onChange={(e) => setActionData({ ...actionData, format: e.target.value })}
                  />
                  Excel
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    onChange={(e) => setActionData({ ...actionData, format: e.target.value })}
                  />
                  PDF
                </label>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Include Fields</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked /> Name
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked /> Email
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked /> Total Donated
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> Phone
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> Address
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> Tags
                </label>
              </div>
            </div>
          </>
        );
        
      case 'delete':
        return (
          <div className={styles.deleteWarning}>
            <FaTrash className={styles.warningIcon} />
            <h4>Are you sure?</h4>
            <p>You are about to permanently delete <strong>{selectedDonors.length} donors</strong>.</p>
            <p className={styles.warningText}>This action cannot be undone.</p>
          </div>
        );
        
      default:
        return null;
    }
  }
}

export default BulkActions;