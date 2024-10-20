import React, { useState } from 'react';
import styles from './ModalStyles.module.css';
import cleanStyles from './CleanDesign.module.css';

const OneOffContributionModal = ({ contribution, onConfirm, onCancel }) => {
  const [editedContribution, setEditedContribution] = useState(contribution || {
    charity: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    charityType: '',
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setEditedContribution(prev => ({ 
      ...prev, 
      [name]: type === 'file' ? files[0] : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(editedContribution);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${cleanStyles.card}`}>
        <h2 className={cleanStyles.gradientTitle}>{contribution ? 'Edit One-Off Contribution' : 'Add New One-Off Contribution'}</h2>
        <button className={styles.closeButton} onClick={onCancel}>&times;</button>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="charity">Charity:</label>
            <input
              type="text"
              id="charity"
              name="charity"
              value={editedContribution.charity}
              onChange={handleChange}
              required
              className={cleanStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={editedContribution.amount}
              onChange={handleChange}
              required
              className={cleanStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editedContribution.date.split('T')[0]}
              onChange={handleChange}
              required
              className={cleanStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="charityType">Charity Type:</label>
            <select
              id="charityType"
              name="charityType"
              value={editedContribution.charityType}
              onChange={handleChange}
              required
              className={cleanStyles.select}
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
            <label htmlFor="receipt">Upload Receipt (optional):</label>
            <input
              type="file"
              id="receipt"
              name="receipt"
              onChange={handleChange}
              accept="image/*,.pdf"
              className={cleanStyles.fileInput}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${cleanStyles.button} ${cleanStyles.primaryButton}`}>Confirm</button>
            <button type="button" onClick={onCancel} className={`${cleanStyles.button} ${cleanStyles.secondaryButton}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OneOffContributionModal;