import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './DonationModal.module.css';

const DonationModal = ({ donation, onConfirm, onCancel, type = 'regular' }) => {
  const [editedDonation, setEditedDonation] = useState(donation || {
    charity: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    charityType: '',
    isMonthly: false,
    receipt: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setEditedDonation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'file' ? files[0] :
               value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(editedDonation);
  };

  const charityTypes = [
    { value: "Health Services", label: "Health Services" },
    { value: "Mental Health", label: "Mental Health" },
    { value: "Education", label: "Education" },
    { value: "Environmental Conservation", label: "Environmental Conservation" },
    { value: "Social Welfare", label: "Social Welfare" },
    { value: "Emergency Relief", label: "Emergency Relief" },
    { value: "Food Security", label: "Food Security" },
    { value: "Child Welfare", label: "Child Welfare" },
    { value: "Indigenous Support", label: "Indigenous Support" },
    { value: "Housing", label: "Housing" },
    { value: "Community Building", label: "Community Building" },
    { value: "Rural Support", label: "Rural Support" }
  ];

  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>
          {donation ? `Edit ${type === 'regular' ? 'Donation' : 'One-Off Contribution'}` : 
                     `Add New ${type === 'regular' ? 'Donation' : 'One-Off Contribution'}`}
        </h2>
        <button className={styles.closeButton} onClick={onCancel}>&times;</button>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="charity" className={styles.label}>Charity:</label>
            <input
              type="text"
              id="charity"
              name="charity"
              value={editedDonation.charity}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={editedDonation.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editedDonation.date.split('T')[0]}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="charityType" className={styles.label}>Charity Type:</label>
            <select
              id="charityType"
              name="charityType"
              value={editedDonation.charityType}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Select a charity type</option>
              {charityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {type === 'regular' && (
            <div className={styles.formGroup}>
              <label htmlFor="isMonthly" className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  id="isMonthly"
                  name="isMonthly"
                  checked={editedDonation.isMonthly}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                Monthly Donation
              </label>
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="receipt" className={styles.label}>Upload Receipt (optional):</label>
            <input
              type="file"
              id="receipt"
              name="receipt"
              onChange={handleChange}
              accept="image/*,.pdf"
              className={styles.fileInput}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>Confirm</button>
            <button type="button" onClick={onCancel} className={`${styles.button} ${styles.secondaryButton}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DonationModal;