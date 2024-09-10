import React, { useState } from 'react';
import styles from './DonationConfirmationModal.module.css';

const DonationConfirmationModal = ({ donation, onConfirm, onCancel }) => {
  const [editedDonation, setEditedDonation] = useState(donation);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDonation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(editedDonation);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Confirm Donation</h2>
        <form onSubmit={handleSubmit}>
          <div>
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
          <div>
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={editedDonation.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editedDonation.date.split('T')[0]}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="charityType">Charity Type:</label>
            <select
              id="charityType"
              name="charityType"
              value={editedDonation.charityType}
              onChange={handleChange}
              required
            >
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
          <div className={styles.buttonGroup}>
            <button type="submit">Confirm</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationConfirmationModal;