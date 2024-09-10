import React, { useState } from 'react';
import styles from './DonationConfirmationModal.module.css';

const DonationConfirmationModal = ({ donation, onConfirm, onCancel }) => {
  const [editedDonation, setEditedDonation] = useState(donation);
  const [tags, setTags] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDonation(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e) => {
    setTags(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    onConfirm({ ...editedDonation, tags: tagsArray });
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
            <label htmlFor="tags">Tags (comma-separated):</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              onChange={handleTagChange}
            />
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