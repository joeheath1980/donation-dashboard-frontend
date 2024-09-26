// src/components/DonationConfirmationModal.js

import React, { useState } from 'react';
import styles from './ModalStyles.module.css';
import { format, parseISO } from 'date-fns';

const DonationConfirmationModal = ({ donation, onConfirm, onCancel }) => {
  const [editedDonation, setEditedDonation] = useState({
    ...donation,
    date: donation.date ? format(parseISO(donation.date), 'yyyy-MM-dd') : '', // Ensure date is in 'YYYY-MM-DD' format
    isMonthly: donation.isMonthly || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedDonation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'amount' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(editedDonation);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Confirm Donation</h2>
        <button className={styles.closeButton} onClick={onCancel}>&times;</button>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="charity">Charity:</label>
            <input
              type="text"
              id="charity"
              name="charity"
              value={editedDonation.charity}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={editedDonation.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editedDonation.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="charityType">Charity Type:</label>
            <select
              id="charityType"
              name="charityType"
              value={editedDonation.charityType || ''}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Charity Type</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Environment">Environment</option>
              <option value="Humanitarian">Humanitarian</option>
              <option value="Arts and Culture">Arts and Culture</option>
              <option value="Religious">Religious</option>
              <option value="Human Rights">Human Rights</option>
              <option value="Children and Youth">Children and Youth</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="isMonthly">
              <input
                type="checkbox"
                id="isMonthly"
                name="isMonthly"
                checked={editedDonation.isMonthly}
                onChange={handleChange}
              />
              Monthly Donation
            </label>
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.confirmButton}`}>Confirm</button>
            <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationConfirmationModal;
