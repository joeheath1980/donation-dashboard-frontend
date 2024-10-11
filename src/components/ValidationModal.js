import React, { useState } from 'react';
import styles from './ModalStyles.module.css';

const ValidationModal = ({ item, onConfirm, onCancel }) => {
  const [editedItem, setEditedItem] = useState({
    ...item,
    date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setEditedItem(prev => ({ 
      ...prev, 
      [name]: type === 'file' ? files[0] : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Append all form fields to formData
    Object.keys(editedItem).forEach(key => {
      if (key === 'receipt' && editedItem[key] instanceof File) {
        formData.append(key, editedItem[key]);
      } else {
        formData.append(key, editedItem[key]);
      }
    });

    try {
      const endpoint = item.type === 'donation' 
        ? `http://localhost:3002/api/donations/${item._id}/validate`
        : `http://localhost:3002/api/contributions/one-off/${item._id}/validate`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onConfirm(result);
      } else {
        throw new Error('Failed to validate item');
      }
    } catch (error) {
      console.error('Error validating item:', error);
      alert(`Failed to validate item: ${error.message}`);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Validate {item.type === 'donation' ? 'Donation' : 'Contribution'}</h2>
        <button className={styles.closeButton} onClick={onCancel}>&times;</button>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="charity">Charity:</label>
            <input
              type="text"
              id="charity"
              name="charity"
              value={editedItem.charity}
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
              value={editedItem.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editedItem.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="charityType">Charity Type:</label>
            <select
              id="charityType"
              name="charityType"
              value={editedItem.charityType}
              onChange={handleChange}
              required
            >
              <option value="">Select a charity type</option>
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
            <label htmlFor="receipt">Upload Receipt:</label>
            <input
              type="file"
              id="receipt"
              name="receipt"
              onChange={handleChange}
              accept="image/*,.pdf"
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.confirmButton}`}>Validate</button>
            <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;
