import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ModalStyles.module.css';
import cleanStyles from './CleanDesign.module.css';

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
    { value: "Health Services", label: "Health Services & Medical Research" },
    { value: "Mental Health", label: "Mental Health & Wellness" },
    { value: "Education", label: "Education & Youth Development" },
    { value: "Environmental Conservation", label: "Environmental Conservation & Wildlife" },
    { value: "Social Welfare", label: "Social Welfare & Community Support" },
    { value: "Emergency Relief", label: "Emergency Relief & Disaster Response" },
    { value: "Food Security", label: "Food Security & Poverty Alleviation" },
    { value: "Child Welfare", label: "Child Welfare & Youth Support" },
    { value: "Indigenous Support", label: "Indigenous Support & Programs" },
    { value: "Housing", label: "Housing & Homelessness" },
    { value: "Community Building", label: "Community Building & Development" },
    { value: "Rural Support", label: "Rural & Regional Support" }
  ];

  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${cleanStyles.card}`}>
        <h2 className={cleanStyles.gradientTitle}>
          {donation ? `Edit ${type === 'regular' ? 'Donation' : 'One-Off Contribution'}` : 
                     `Add New ${type === 'regular' ? 'Donation' : 'One-Off Contribution'}`}
        </h2>
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
              className={cleanStyles.input}
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
              className={cleanStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editedDonation.date.split('T')[0]}
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
              value={editedDonation.charityType}
              onChange={handleChange}
              required
              className={cleanStyles.select}
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
              <label htmlFor="isMonthly" className={cleanStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  id="isMonthly"
                  name="isMonthly"
                  checked={editedDonation.isMonthly}
                  onChange={handleChange}
                  className={cleanStyles.checkbox}
                />
                Monthly Donation
              </label>
            </div>
          )}
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

  return createPortal(modalContent, document.body);
};

export default DonationModal;